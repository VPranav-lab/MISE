
import { randomBytes, createHmac } from 'node:crypto';

import { redisClient } from '../config/redis.js';
import otpConfig from '../config/otp.config.js';
import AppError from '../utils/AppError.js';

const consumeScript = `
    local digest = redis.call('GET', KEYS[1])

    if not digest then
        return -1
    end

    if digest ~= ARGV[1] then
        return 0
    end

    redis.call('DEL', KEYS[1])

    return 1
`;

const createDigest = (value) => {
    return createHmac('sha256', otpConfig.secret)
        .update(value)
        .digest('hex');
};

const normalizeUserId = (userId) => {
    if (
        typeof userId !== 'string' &&
        typeof userId !== 'bigint' &&
        !Number.isSafeInteger(userId)
    ) {
        throw new Error('Invalid reset token user identifier');
    }

    const id = String(userId);

    if (!/^[1-9]\d*$/.test(id)) {
        throw new Error('Invalid reset token user identifier');
    }

    return id;
};

const getContext = ({ userId, email, passwordHash }) => {
    const id = normalizeUserId(userId);

    if (typeof email !== 'string' || !email.trim()) {
        throw new Error('Invalid email address');
    }

    if (
        typeof passwordHash !== 'string' ||
        !passwordHash.length
    ) {
        throw new Error('Invalid password hash');
    }

    const scope = createDigest(
        JSON.stringify(['RESET_TOKEN_KEY', id])
    );

    return {
        userId: id,
        email: email.trim().toLowerCase(),
        passwordHash,
        key: `mise:reset-token:${scope}`
    };
};

const hashToken = (context, token) => {
    return createDigest(
        JSON.stringify([
            'PASSWORD_RESET_TOKEN',
            context.userId,
            context.email,
            context.passwordHash,
            token
        ])
    );
};

const executeRedis = async (operation) => {
    try {
        if (!redisClient.isReady) {
            throw new Error('Redis is not ready');
        }

        return await operation();
    } catch {
        throw new AppError(
            'Password reset service unavailable',
            503,
            'RESET_TOKEN_SERVICE_UNAVAILABLE'
        );
    }
};

const issueResetToken = async (data) => {
    const context = getContext(data);

    const resetToken = randomBytes(32).toString('hex');

    const digest = hashToken(context, resetToken);

    await executeRedis(() =>
        redisClient.set(context.key, digest, {
            EX: otpConfig.resetTokenTtlSeconds
        })
    );

    return {
        resetToken,
        expiresInSeconds: otpConfig.resetTokenTtlSeconds
    };
};

const consumeResetToken = async ({
    userId,
    email,
    passwordHash,
    resetToken
}) => {
    if (
        typeof resetToken !== 'string' ||
        !/^[a-f0-9]{64}$/.test(resetToken)
    ) {
        throw new AppError(
            'Invalid password reset token',
            400,
            'INVALID_RESET_TOKEN'
        );
    }

    const context = getContext({
        userId,
        email,
        passwordHash
    });

    const digest = hashToken(context, resetToken);

    const result = await executeRedis(() =>
        redisClient.eval(consumeScript, {
            keys: [context.key],
            arguments: [digest]
        })
    );

    if (result === -1) {
        throw new AppError(
            'Password reset token expired or already used',
            400,
            'RESET_TOKEN_EXPIRED'
        );
    }

    if (result === 0) {
        throw new AppError(
            'Invalid password reset token',
            400,
            'INVALID_RESET_TOKEN'
        );
    }

    if (result !== 1) {
        throw new Error('Unexpected reset token result');
    }

    return true;
};

export default {
    issueResetToken,
    consumeResetToken
};

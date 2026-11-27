
import { randomInt, createHmac } from 'node:crypto';
import { z } from 'zod';

import { redisClient } from '../config/redis.js';
import otpConfig, {
    OTP_PURPOSES
} from '../config/otp.config.js';

import emailService from './email.service.js';
import AppError from '../utils/AppError.js';

const issueScript = `
    if redis.call('EXISTS', KEYS[2]) == 1 then
        return -1
    end

    local requests = tonumber(
        redis.call('GET', KEYS[3]) or '0'
    )

    if requests >= tonumber(ARGV[4]) then
        return -2
    end

    redis.call('HSET', KEYS[1],
        'digest', ARGV[1],
        'attempts', 0
    )

    redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))

    redis.call('SET', KEYS[2], '1',
        'EX', tonumber(ARGV[3])
    )

    local count = redis.call('INCR', KEYS[3])

    if count == 1 then
        redis.call('EXPIRE', KEYS[3], 3600)
    end

    return 1
`;

const verifyScript = `
    if redis.call('EXISTS', KEYS[1]) == 0 then
        return -1
    end

    local attempts = tonumber(
        redis.call('HGET', KEYS[1], 'attempts') or '0'
    )

    local maxAttempts = tonumber(ARGV[2])

    if attempts >= maxAttempts then
        return -2
    end

    local digest = redis.call(
        'HGET', KEYS[1], 'digest'
    )

    if digest == ARGV[1] then
        redis.call('DEL', KEYS[1])
        return 1
    end

    attempts = redis.call(
        'HINCRBY', KEYS[1], 'attempts', 1
    )

    if attempts >= maxAttempts then
        return -2
    end

    return 0
`;

const validatePurpose = (purpose) => {
    if (!Object.hasOwn(OTP_PURPOSES, purpose)) {
        throw new Error('Invalid OTP purpose');
    }
};

const normalizeUserId = (userId) => {
    if (
        typeof userId !== 'string' &&
        typeof userId !== 'bigint' &&
        !Number.isSafeInteger(userId)
    ) {
        throw new Error('Invalid OTP user identifier');
    }

    const id = String(userId);

    if (!/^[1-9]\d*$/.test(id)) {
        throw new Error('Invalid OTP user identifier');
    }

    return id;
};

const normalizeEmail = (email) => {
    if (typeof email !== 'string') {
        throw new Error('Invalid OTP email address');
    }

    const normalized = email.trim().toLowerCase();

    if (
        normalized.length > 254 ||
        !z.email().safeParse(normalized).success
    ) {
        throw new Error('Invalid OTP email address');
    }

    return normalized;
};

const createDigest = (value) => {
    return createHmac('sha256', otpConfig.secret)
        .update(value)
        .digest('hex');
};

const getChallenge = ({ userId, email, purpose }) => {
    validatePurpose(purpose);

    const id = normalizeUserId(userId);
    const normalizedEmail = normalizeEmail(email);

    const scope = createDigest(
        JSON.stringify([purpose, id])
    );

    const prefix = `mise:otp:{${scope}}`;

    return {
        userId: id,
        email: normalizedEmail,
        purpose,
        challengeKey: `${prefix}:challenge`,
        cooldownKey: `${prefix}:cooldown`,
        requestsKey: `${prefix}:requests`
    };
};

const hashCode = (challenge, code) => {
    return createDigest(
        JSON.stringify([
            challenge.purpose,
            challenge.userId,
            challenge.email,
            code
        ])
    );
};

const generateCode = () => {
    return randomInt(0, 1000000)
        .toString()
        .padStart(6, '0');
};

const executeScript = async (script, keys, args) => {
    try {
        if (!redisClient.isReady) {
            throw new Error('Redis is not ready');
        }

        return await redisClient.eval(script, {
            keys,
            arguments: args.map(String)
        });
    } catch {
        throw new AppError(
            'Verification service unavailable',
            503,
            'OTP_SERVICE_UNAVAILABLE'
        );
    }
};

const sendOtp = async ({ userId, email, purpose }) => {
    const challenge = getChallenge({
        userId,
        email,
        purpose
    });

    const code = generateCode();
    const digest = hashCode(challenge, code);

    const result = await executeScript(
        issueScript,
        [
            challenge.challengeKey,
            challenge.cooldownKey,
            challenge.requestsKey
        ],
        [
            digest,
            otpConfig.ttlSeconds,
            otpConfig.cooldownSeconds,
            otpConfig.maxRequestsPerHour
        ]
    );

    if (result === -1) {
        throw new AppError(
            'Please wait before requesting another code',
            429,
            'OTP_COOLDOWN'
        );
    }

    if (result === -2) {
        throw new AppError(
            'Too many verification code requests',
            429,
            'OTP_REQUEST_LIMIT'
        );
    }

    if (result !== 1) {
        throw new Error('Unexpected OTP issuance result');
    }

    await emailService.sendOtpEmail({
        to: challenge.email,
        code,
        purpose,
        expiresInMinutes: Math.ceil(
            otpConfig.ttlSeconds / 60
        )
    });

    return {
        expiresInSeconds: otpConfig.ttlSeconds,
        resendAfterSeconds: otpConfig.cooldownSeconds
    };
};

const verifyOtp = async ({
    userId,
    email,
    purpose,
    code
}) => {
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
        throw new AppError(
            'Invalid verification code',
            400,
            'INVALID_OTP'
        );
    }

    const challenge = getChallenge({
        userId,
        email,
        purpose
    });

    const digest = hashCode(challenge, code);

    const result = await executeScript(
        verifyScript,
        [challenge.challengeKey],
        [
            digest,
            otpConfig.maxAttempts
        ]
    );

    if (result === -1) {
        throw new AppError(
            'Verification code expired or already used',
            400,
            'OTP_EXPIRED'
        );
    }

    if (result === -2) {
        throw new AppError(
            'Maximum verification attempts reached',
            429,
            'OTP_ATTEMPTS_EXCEEDED'
        );
    }

    if (result === 0) {
        throw new AppError(
            'Invalid verification code',
            400,
            'INVALID_OTP'
        );
    }

    if (result !== 1) {
        throw new Error('Unexpected OTP verification result');
    }

    return true;
};

export default {
    sendOtp,
    verifyOtp
};

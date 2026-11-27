
import { createHmac } from 'node:crypto';
import ipaddr from 'ipaddr.js';

import { redisClient } from '../config/redis.js';
import otpConfig from '../config/otp.config.js';
import AppError from '../utils/AppError.js';

const rateLimitScript = `
    local limit = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local count = tonumber(redis.call('GET', KEYS[1]) or '0')

    if count >= limit then
        return {0, redis.call('TTL', KEYS[1])}
    end

    count = redis.call('INCR', KEYS[1])

    if count == 1 then
        redis.call('EXPIRE', KEYS[1], window)
    end

    return {1, redis.call('TTL', KEYS[1])}
`;

const normalizeIp = (ip) => {
    const address = ipaddr.process(ip);

    if (address.kind() === 'ipv4') {
        return address.toString();
    }

    return address.toByteArray()
        .slice(0, 8)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('') + '/64';
};

const getIpIdentity = (req) => {
    return normalizeIp(req.ip);
};

const createKey = (scope, identity) => {
    const digest = createHmac('sha256', otpConfig.secret)
        .update(JSON.stringify([
            'RATE_LIMIT',
            scope,
            identity
        ]))
        .digest('hex');

    return `mise:rate-limit:${scope}:${digest}`;
};

export const createRateLimiter = ({
    scope,
    limit,
    windowSeconds,
    getIdentity = getIpIdentity
}) => {
    if (
        !scope ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        !Number.isInteger(windowSeconds) ||
        windowSeconds < 1
    ) {
        throw new Error('Invalid rate limiter configuration');
    }

    return async (req, res, next) => {
        const identity = getIdentity(req);
        const key = createKey(scope, identity);

        let result;

        try {
            if (!redisClient.isReady) {
                throw new Error('Redis is not ready');
            }

            result = await redisClient.eval(
                rateLimitScript,
                {
                    keys: [key],
                    arguments: [
                        String(limit),
                        String(windowSeconds)
                    ]
                }
            );
        } catch {
            throw new AppError(
                'Rate limiting service unavailable',
                503,
                'RATE_LIMIT_SERVICE_UNAVAILABLE'
            );
        }

        const [allowed, ttl] = result;

        if (allowed !== 1) {
            const retryAfter = Math.max(1, ttl);

            res.set('Retry-After', String(retryAfter));

            throw new AppError(
                'Too many requests. Please try again later.',
                429,
                'RATE_LIMIT_EXCEEDED',
                {
                    retryAfterSeconds: retryAfter
                }
            );
        }

        return next();
    };
};

export const authRateLimits = Object.freeze({
    register: createRateLimiter({
        scope: 'register',
        limit: 10,
        windowSeconds: 900
    }),

    login: createRateLimiter({
        scope: 'login',
        limit: 30,
        windowSeconds: 900
    }),

    loginIdentity: createRateLimiter({
        scope: 'login-identity',
        limit: 20,
        windowSeconds: 900,
        getIdentity: (req) =>
            req.validated.body.identifier.trim().toLowerCase()
    }),

    otpRequest: createRateLimiter({
        scope: 'otp-request',
        limit: 20,
        windowSeconds: 900
    }),

    otpVerify: createRateLimiter({
        scope: 'otp-verify',
        limit: 30,
        windowSeconds: 900
    }),

    resetPassword: createRateLimiter({
        scope: 'reset-password',
        limit: 10,
        windowSeconds: 900
    }),

    refresh: createRateLimiter({
        scope: 'refresh',
        limit: 60,
        windowSeconds: 300
    })
});

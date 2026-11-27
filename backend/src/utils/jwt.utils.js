
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import authConfig from '../config/auth.config.js';
import AppError from './AppError.js';

const normalizeId = (value) => {
    if (
        typeof value !== 'string' &&
        typeof value !== 'bigint' &&
        !Number.isSafeInteger(value)
    ) {
        throw new Error('Invalid token identifier');
    }

    const id = String(value);

    if (!id.trim()) {
        throw new Error('Invalid token identifier');
    }

    return id;
};

export const generateAccessToken = (userId, sessionId) => {
    return jwt.sign(
        {
            sid: normalizeId(sessionId),
            type: 'access'
        },
        authConfig.jwtSecret,
        {
            algorithm: 'HS256',
            subject: normalizeId(userId),
            issuer: authConfig.jwtIssuer,
            audience: authConfig.jwtAudience,
            expiresIn: authConfig.accessTokenTtl,
            jwtid: randomUUID()
        }
    );
};

export const verifyAccessToken = (token) => {
    try {
        const payload = jwt.verify(
            token,
            authConfig.jwtSecret,
            {
                algorithms: ['HS256'],
                issuer: authConfig.jwtIssuer,
                audience: authConfig.jwtAudience
            }
        );

        if (
            typeof payload !== 'object' ||
            payload.type !== 'access' ||
            typeof payload.sub !== 'string' ||
            typeof payload.sid !== 'string' ||
            !payload.sub.trim() ||
            !payload.sid.trim() ||
            !Number.isInteger(payload.exp)
        ) {
            throw new Error('Invalid token payload');
        }

        return {
            userId: payload.sub,
            sessionId: payload.sid
        };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError(
                'Access token has expired',
                401,
                'TOKEN_EXPIRED'
            );
        }

        throw new AppError(
            'Invalid access token',
            401,
            'INVALID_TOKEN'
        );
    }
};

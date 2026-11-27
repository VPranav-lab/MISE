
import { randomBytes, createHash } from 'node:crypto';
import authConfig from '../config/auth.config.js';
import AppError from './AppError.js';

export const generateRefreshToken = () => {
    return randomBytes(32).toString('hex');
};

export const hashRefreshToken = (token) => {
    if (
        typeof token !== 'string' ||
        !/^[a-f0-9]{64}$/.test(token)
    ) {
        throw new AppError(
            'Invalid refresh token',
            401,
            'INVALID_REFRESH_TOKEN'
        );
    }

    return createHash('sha256')
        .update(token)
        .digest('hex');
};

export const getRefreshTokenExpiry = () => {
    return new Date(
        Date.now() +
        authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000
    );
};

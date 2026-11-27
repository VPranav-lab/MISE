
import bcrypt from 'bcrypt';
import authConfig from '../config/auth.config.js';
import AppError from './AppError.js';

const isValidPasswordInput = (password) => {
    return typeof password === 'string' &&
        password.length > 0 &&
        Buffer.byteLength(password, 'utf8') <= 72;
};

export const hashPassword = async (password) => {
    if (!isValidPasswordInput(password)) {
        throw new AppError(
            'Invalid password length',
            400,
            'INVALID_PASSWORD'
        );
    }

    return bcrypt.hash(
        password,
        authConfig.bcryptRounds
    );
};

export const verifyPassword = async (
    password,
    passwordHash
) => {
    if (!isValidPasswordInput(password)) {
        return false;
    }

    return bcrypt.compare(password, passwordHash);
};

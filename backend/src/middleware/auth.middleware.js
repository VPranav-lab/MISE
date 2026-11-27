
import { verifyAccessToken } from '../utils/jwt.utils.js';
import AppError from '../utils/AppError.js';

import userRepository from '../repositories/user.repository.js';
import sessionRepository from '../repositories/session.repository.js';

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        throw new AppError(
            'Authentication required',
            401,
            'AUTHENTICATION_REQUIRED'
        );
    }

    const match = authorization.match(/^Bearer ([^\s]+)$/i);

    if (!match) {
        throw new AppError(
            'Invalid authorization header',
            401,
            'INVALID_AUTHORIZATION_HEADER'
        );
    }

    const { userId, sessionId } = verifyAccessToken(match[1]);

    const [user, session] = await Promise.all([
        userRepository.findById(userId),
        sessionRepository.findActiveById(sessionId, userId)
    ]);

    if (!user || !session) {
        throw new AppError(
            'Session is invalid or expired',
            401,
            'INVALID_SESSION'
        );
    }

    if (!user.emailVerifiedAt) {
        throw new AppError(
            'Email verification is required',
            403,
            'EMAIL_NOT_VERIFIED'
        );
    }

    req.auth = Object.freeze({
        userId: String(user.id),
        sessionId: String(session.id)
    });

    return next();
};

export default authenticate;

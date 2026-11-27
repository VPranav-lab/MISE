
import { randomBytes } from 'node:crypto';

import { sequelize } from '../config/database.js';
import authConfig from '../config/auth.config.js';
import otpConfig, {
    OTP_PURPOSES
} from '../config/otp.config.js';

import userRepository from '../repositories/user.repository.js';
import sessionRepository from '../repositories/session.repository.js';
import userPreferenceRepository from '../repositories/userPreference.repository.js';
import workspaceRepository from '../repositories/workspace.repository.js';
import householdMemberRepository from '../repositories/householdMember.repository.js';

import otpService from './otp.service.js';
import resetTokenService from './resetToken.service.js';

import {
    hashPassword,
    verifyPassword
} from '../utils/password.utils.js';

import {
    generateAccessToken
} from '../utils/jwt.utils.js';

import {
    generateRefreshToken,
    hashRefreshToken,
    getRefreshTokenExpiry
} from '../utils/refreshToken.utils.js';

import AppError from '../utils/AppError.js';

const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

const invalidCredentials = () => {
    return new AppError(
        'Invalid username or password',
        401,
        'INVALID_CREDENTIALS'
    );
};

const invalidRefreshToken = () => {
    return new AppError(
        'Invalid or expired refresh token',
        401,
        'INVALID_REFRESH_TOKEN'
    );
};

const invalidOtp = () => {
    return new AppError(
        'Invalid or expired verification code',
        400,
        'INVALID_OTP'
    );
};

const invalidResetToken = () => {
    return new AppError(
        'Invalid or expired password reset token',
        400,
        'INVALID_RESET_TOKEN'
    );
};

const serializeUser = (user) => ({
    id: String(user.id),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
});

const getWorkspaceContext = async (userId, transaction) => {
    const personalWorkspace =
        await workspaceRepository.findPersonalByUserId(
            userId,
            transaction
        );

    if (!personalWorkspace) {
        throw new Error('Personal workspace not found');
    }

    const membership =
        await householdMemberRepository.findByUserId(
            userId,
            transaction
        );

    if (membership) {
        return {
            mode: 'HOUSEHOLD',
            workspaceId: String(
                membership.household.workspaceId
            ),
            personalWorkspaceId: String(personalWorkspace.id),
            household: {
                id: String(membership.household.id),
                name: membership.household.name,
                role: membership.role
            }
        };
    }

    return {
        mode: 'PERSONAL',
        workspaceId: String(personalWorkspace.id),
        personalWorkspaceId: String(personalWorkspace.id),
        household: null
    };
};

const getAccountData = async (user, transaction) => {
    return {
        user: serializeUser(user),
        workspace: await getWorkspaceContext(
            user.id,
            transaction
        )
    };
};

const buildSessionResponse = async (
    user,
    session,
    refreshToken,
    transaction
) => {
    return {
        ...(await getAccountData(user, transaction)),
        session: {
            id: String(session.id),
            accessToken: generateAccessToken(
                user.id,
                session.id
            ),
            refreshToken,
            tokenType: 'Bearer',
            expiresInSeconds: authConfig.accessTokenTtl,
            refreshTokenExpiresAt: session.expiresAt
        }
    };
};

const createSession = async (user, transaction) => {
    const refreshToken = generateRefreshToken();

    const session = await sessionRepository.create(
        {
            userId: user.id,
            refreshTokenHash: hashRefreshToken(refreshToken),
            expiresAt: getRefreshTokenExpiry(),
            lastUsedAt: new Date()
        },
        transaction
    );

    return buildSessionResponse(
        user,
        session,
        refreshToken,
        transaction
    );
};

const otpRequestResponse = () => ({
    expiresInSeconds: otpConfig.ttlSeconds,
    resendAfterSeconds: otpConfig.cooldownSeconds
});

const requestOtpPrivately = async (user, purpose) => {
    try {
        await otpService.sendOtp({
            userId: user.id,
            email: user.email,
            purpose
        });
    } catch (error) {
        if (
            error.code === 'OTP_COOLDOWN' ||
            error.code === 'OTP_REQUEST_LIMIT'
        ) {
            return;
        }

        if (
            error.code === 'EMAIL_DELIVERY_FAILED' ||
            error.code === 'OTP_SERVICE_UNAVAILABLE'
        ) {
            console.error('[OTP REQUEST]', error.code);
            return;
        }

        throw error;
    }
};

const register = async (data) => {
    const email = normalizeEmail(data.email);

    const passwordHash = await hashPassword(data.password);

    const user = await sequelize.transaction(
        async (transaction) => {
            const existingUsername =
                await userRepository.findByUsername(
                    data.username,
                    transaction
                );

            if (existingUsername) {
                throw new AppError(
                    'Username already exists',
                    409,
                    'USERNAME_ALREADY_EXISTS'
                );
            }

            const existingEmail =
                await userRepository.findByEmail(
                    email,
                    transaction
                );

            if (existingEmail) {
                throw new AppError(
                    'Email address already registered',
                    409,
                    'EMAIL_ALREADY_EXISTS'
                );
            }

            const newUser = await userRepository.create(
                {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    email,
                    passwordHash
                },
                transaction
            );

            await userPreferenceRepository.create(
                {
                    userId: newUser.id,
                    smsEnabled: 0
                },
                transaction
            );

            await workspaceRepository.create(
                {
                    workspaceType: 'PERSONAL',
                    createdByUserId: newUser.id,
                    timezone: 'UTC'
                },
                transaction
            );

            return newUser;
        }
    );

    const otp = await otpService.sendOtp({
        userId: user.id,
        email: user.email,
        purpose: OTP_PURPOSES.EMAIL_VERIFICATION
    });

    return {
        userId: String(user.id),
        email: user.email,
        verificationRequired: true,
        ...otp
    };
};

const verifyEmail = async ({ email, code }) => {
    const existingUser = await userRepository.findByEmail(
        normalizeEmail(email)
    );

    if (!existingUser) {
        throw invalidOtp();
    }

    return sequelize.transaction(async (transaction) => {
        const user = await userRepository.findByIdForUpdate(
            existingUser.id,
            transaction
        );

        if (
            !user ||
            normalizeEmail(user.email) !== normalizeEmail(email)
        ) {
            throw invalidOtp();
        }

        if (user.emailVerifiedAt) {
            throw new AppError(
                'Email address is already verified',
                409,
                'EMAIL_ALREADY_VERIFIED'
            );
        }

        await otpService.verifyOtp({
            userId: user.id,
            email: user.email,
            purpose: OTP_PURPOSES.EMAIL_VERIFICATION,
            code
        });

        const now = new Date();

        await userRepository.updateById(
            user.id,
            {
                emailVerifiedAt: now,
                lastLoginAt: now
            },
            transaction
        );

        user.emailVerifiedAt = now;
        user.lastLoginAt = now;

        return {
            ...(await createSession(user, transaction)),
            nextScreen: 'ONBOARDING'
        };
    });
};

const resendOtp = async ({ email }) => {
    const user = await userRepository.findByEmail(
        normalizeEmail(email)
    );

    if (user && !user.emailVerifiedAt) {
        await requestOtpPrivately(
            user,
            OTP_PURPOSES.EMAIL_VERIFICATION
        );
    }

    return otpRequestResponse();
};

const login = async ({ identifier, password }) => {
    const identity = identifier.trim();

    const existingUser = identity.includes('@')
        ? await userRepository.findByEmailWithPassword(
            normalizeEmail(identity)
        )
        : await userRepository.findByUsernameWithPassword(
            identity
        );

    if (!existingUser) {
        await hashPassword(randomBytes(32).toString('hex'));
        throw invalidCredentials();
    }

    const validPassword = await verifyPassword(
        password,
        existingUser.passwordHash
    );

    if (!validPassword) {
        throw invalidCredentials();
    }

    return sequelize.transaction(async (transaction) => {
        const user =
            await userRepository.findByIdWithPasswordForUpdate(
                existingUser.id,
                transaction
            );

        if (
            !user ||
            user.passwordHash !== existingUser.passwordHash ||
            user.email !== existingUser.email ||
            user.username !== existingUser.username
        ) {
            throw invalidCredentials();
        }

        if (!user.emailVerifiedAt) {
            throw new AppError(
                'Email verification is required',
                403,
                'EMAIL_NOT_VERIFIED',
                {
                    email: user.email
                }
            );
        }

        const now = new Date();

        await userRepository.updateById(
            user.id,
            {
                lastLoginAt: now
            },
            transaction
        );

        user.lastLoginAt = now;

        return createSession(user, transaction);
    });
};

const forgotPassword = async ({ email }) => {
    const user = await userRepository.findByEmail(
        normalizeEmail(email)
    );

    if (user?.emailVerifiedAt) {
        await requestOtpPrivately(
            user,
            OTP_PURPOSES.PASSWORD_RESET
        );
    }

    return otpRequestResponse();
};

const verifyResetOtp = async ({ email, code }) => {
    const existingUser = await userRepository.findByEmail(
        normalizeEmail(email)
    );

    if (!existingUser) {
        throw invalidOtp();
    }

    return sequelize.transaction(async (transaction) => {
        const user =
            await userRepository.findByIdWithPasswordForUpdate(
                existingUser.id,
                transaction
            );

        if (
            !user?.emailVerifiedAt ||
            normalizeEmail(user.email) !== normalizeEmail(email)
        ) {
            throw invalidOtp();
        }

        await otpService.verifyOtp({
            userId: user.id,
            email: user.email,
            purpose: OTP_PURPOSES.PASSWORD_RESET,
            code
        });

        return resetTokenService.issueResetToken({
            userId: user.id,
            email: user.email,
            passwordHash: user.passwordHash
        });
    });
};

const resetPassword = async ({
    email,
    resetToken,
    password
}) => {
    const existingUser = await userRepository.findByEmail(
        normalizeEmail(email)
    );

    if (!existingUser) {
        throw invalidResetToken();
    }

    const passwordHash = await hashPassword(password);

    return sequelize.transaction(async (transaction) => {
        const user =
            await userRepository.findByIdWithPasswordForUpdate(
                existingUser.id,
                transaction
            );

        if (
            !user?.emailVerifiedAt ||
            normalizeEmail(user.email) !== normalizeEmail(email)
        ) {
            throw invalidResetToken();
        }

        await resetTokenService.consumeResetToken({
            userId: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            resetToken
        });

        await userRepository.updateById(
            user.id,
            { passwordHash },
            transaction
        );

        await sessionRepository.revokeAllForUser(
            user.id,
            transaction
        );

        return {
            passwordReset: true
        };
    });
};

const refresh = async ({ refreshToken }) => {
    const currentTokenHash = hashRefreshToken(refreshToken);

    const existingSession =
        await sessionRepository.findActiveByRefreshTokenHash(
            currentTokenHash
        );

    if (!existingSession) {
        throw invalidRefreshToken();
    }

    return sequelize.transaction(async (transaction) => {
        const user = await userRepository.findByIdForUpdate(
            existingSession.userId,
            transaction
        );

        if (!user?.emailVerifiedAt) {
            throw invalidRefreshToken();
        }

        const newRefreshToken = generateRefreshToken();

        const [affectedRows] =
            await sessionRepository.rotateRefreshToken(
                existingSession.id,
                user.id,
                currentTokenHash,
                hashRefreshToken(newRefreshToken),
                transaction
            );

        if (affectedRows !== 1) {
            throw invalidRefreshToken();
        }

        return buildSessionResponse(
            user,
            existingSession,
            newRefreshToken,
            transaction
        );
    });
};

const logout = async ({ userId, sessionId }) => {
    await sessionRepository.revokeById(
        sessionId,
        userId
    );

    return {
        loggedOut: true
    };
};

const getMe = async (userId) => {
    return sequelize.transaction(async (transaction) => {
        const user = await userRepository.findById(
            userId,
            transaction
        );

        if (!user?.emailVerifiedAt) {
            throw new AppError(
                'Authentication required',
                401,
                'UNAUTHORIZED'
            );
        }

        return getAccountData(user, transaction);
    });
};

export default {
    register,
    verifyEmail,
    resendOtp,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    refresh,
    logout,
    getMe
};

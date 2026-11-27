
import { Op } from 'sequelize';
import { Session } from '../models/index.js';

const create = (data, transaction) => {
    return Session.create(data, { transaction });
};

const findActiveById = (id, userId, transaction) => {
    return Session.findOne({
        where: {
            id,
            userId,
            revokedAt: null,
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        transaction
    });
};

const findActiveByRefreshTokenHash = (
    refreshTokenHash,
    transaction
) => {
    return Session.findOne({
        where: {
            refreshTokenHash,
            revokedAt: null,
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        transaction
    });
};

const rotateRefreshToken = (
    id,
    userId,
    currentTokenHash,
    newTokenHash,
    transaction
) => {
    const now = new Date();

    return Session.update(
        {
            refreshTokenHash: newTokenHash,
            lastUsedAt: now
        },
        {
            where: {
                id,
                userId,
                refreshTokenHash: currentTokenHash,
                revokedAt: null,
                expiresAt: {
                    [Op.gt]: now
                }
            },
            transaction
        }
    );
};

const revokeById = (id, userId, transaction) => {
    return Session.update(
        {
            revokedAt: new Date()
        },
        {
            where: {
                id,
                userId,
                revokedAt: null
            },
            transaction
        }
    );
};

const revokeAllForUser = (userId, transaction) => {
    return Session.update(
        {
            revokedAt: new Date()
        },
        {
            where: {
                userId,
                revokedAt: null
            },
            transaction
        }
    );
};

const deleteExpired = (transaction) => {
    return Session.destroy({
        where: {
            expiresAt: {
                [Op.lte]: new Date()
            }
        },
        transaction
    });
};

export default {
    create,
    findActiveById,
    findActiveByRefreshTokenHash,
    rotateRefreshToken,
    revokeById,
    revokeAllForUser,
    deleteExpired
};

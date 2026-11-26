import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Session = sequelize.define(
    'Session',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'user_id',
            allowNull: false
        },
        refreshTokenHash: {
            type: DataTypes.CHAR(64),
            field: 'refresh_token_hash',
            allowNull: false,
            unique: 'uq_sessions_refresh_token_hash'
        },
        expiresAt: {
            type: DataTypes.DATE,
            field: 'expires_at',
            allowNull: false
        },
        revokedAt: {
            type: DataTypes.DATE,
            field: 'revoked_at',
            allowNull: true,
            defaultValue: null
        },
        lastUsedAt: {
            type: DataTypes.DATE,
            field: 'last_used_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'sessions',
        timestamps: true,
        underscored: true,
        defaultScope: {
            attributes: {
                exclude: ['refreshTokenHash']
            }
        },
        scopes: {
            withRefreshTokenHash: {}
        },
        indexes: [
            {
                name: 'idx_sessions_user_revoked',
                fields: ['user_id', 'revoked_at']
            },
            {
                name: 'idx_sessions_expires_at',
                fields: ['expires_at']
            }
        ]
    }
);

export default Session;

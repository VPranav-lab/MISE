import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const NotificationHistory = sequelize.define(
    'NotificationHistory',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        alertId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'alert_id',
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'user_id',
            allowNull: false
        },
        channel: {
            type: DataTypes.ENUM('SMS'),
            allowNull: false,
            defaultValue: 'SMS'
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED'),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        attemptCount: {
            type: DataTypes.SMALLINT.UNSIGNED,
            field: 'attempt_count',
            allowNull: false,
            defaultValue: 0
        },
        providerMessageId: {
            type: DataTypes.STRING(255),
            field: 'provider_message_id',
            allowNull: true,
            defaultValue: null
        },
        lastError: {
            type: DataTypes.STRING(500),
            field: 'last_error',
            allowNull: true,
            defaultValue: null
        },
        lastAttemptAt: {
            type: DataTypes.DATE,
            field: 'last_attempt_at',
            allowNull: true,
            defaultValue: null
        },
        nextAttemptAt: {
            type: DataTypes.DATE,
            field: 'next_attempt_at',
            allowNull: true,
            defaultValue: null
        },
        sentAt: {
            type: DataTypes.DATE,
            field: 'sent_at',
            allowNull: true,
            defaultValue: null
        },
        deliveredAt: {
            type: DataTypes.DATE,
            field: 'delivered_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'notification_history',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'uq_notification_alert_recipient',
                unique: true,
                fields: ['alert_id', 'user_id', 'channel']
            },
            {
                name: 'idx_notification_recipient',
                fields: ['user_id', 'created_at']
            },
            {
                name: 'idx_notification_retry',
                fields: ['status', 'next_attempt_at']
            }
        ]
    }
);

export default NotificationHistory;

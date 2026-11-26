import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Alert = sequelize.define(
    'Alert',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        workspaceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'workspace_id',
            allowNull: false
        },
        pantryItemId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'pantry_item_id',
            allowNull: true,
            defaultValue: null
        },
        pantryBatchId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'pantry_batch_id',
            allowNull: true,
            defaultValue: null
        },
        alertType: {
            type: DataTypes.ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON', 'EXPIRED'),
            field: 'alert_type',
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        message: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        dedupeKey: {
            type: DataTypes.CHAR(64),
            field: 'dedupe_key',
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'RESOLVED'),
            allowNull: false,
            defaultValue: 'ACTIVE'
        },
        resolvedAt: {
            type: DataTypes.DATE,
            field: 'resolved_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'alerts',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'uq_alerts_workspace_dedupe',
                unique: true,
                fields: ['workspace_id', 'dedupe_key']
            },
            {
                name: 'idx_alerts_workspace_status',
                fields: ['workspace_id', 'status', 'created_at']
            },
            {
                name: 'idx_alerts_pantry_item',
                fields: ['pantry_item_id']
            },
            {
                name: 'idx_alerts_pantry_batch',
                fields: ['pantry_batch_id']
            }
        ]
    }
);

export default Alert;

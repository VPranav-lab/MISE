import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Workspace = sequelize.define(
    'Workspace',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        workspaceType: {
            type: DataTypes.ENUM('PERSONAL', 'HOUSEHOLD'),
            field: 'workspace_type',
            allowNull: false
        },
        createdByUserId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'created_by_user_id',
            allowNull: false
        },
        timezone: {
            type: DataTypes.STRING(64),
            allowNull: false,
            defaultValue: 'UTC'
        }
    },
    {
        tableName: 'workspaces',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_workspaces_created_by_user',
                fields: ['created_by_user_id']
            }
        ]
    }
);

export default Workspace;

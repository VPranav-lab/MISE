import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const MonthlyPlan = sequelize.define(
    'MonthlyPlan',
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
        planYear: {
            type: DataTypes.SMALLINT.UNSIGNED,
            field: 'plan_year',
            allowNull: false
        },
        planMonth: {
            type: DataTypes.TINYINT.UNSIGNED,
            field: 'plan_month',
            allowNull: false
        },
        planTimezone: {
            type: DataTypes.STRING(64),
            field: 'plan_timezone',
            allowNull: false,
            defaultValue: 'UTC'
        },
        deadlineAt: {
            type: DataTypes.DATE,
            field: 'deadline_at',
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PLANNING', 'ACTIVE', 'CLOSED'),
            allowNull: false,
            defaultValue: 'PLANNING'
        },
        closedAt: {
            type: DataTypes.DATE,
            field: 'closed_at',
            allowNull: true,
            defaultValue: null
        },
        createdBy: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'created_by',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'monthly_plans',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'uq_monthly_plans_period',
                unique: true,
                fields: ['workspace_id', 'plan_year', 'plan_month']
            },
            {
                name: 'uq_monthly_plans_id_workspace',
                unique: true,
                fields: ['id', 'workspace_id']
            },
            {
                name: 'idx_monthly_plans_deadline',
                fields: ['status', 'deadline_at']
            },
            {
                name: 'idx_monthly_plans_creator',
                fields: ['created_by']
            }
        ]
    }
);

export default MonthlyPlan;

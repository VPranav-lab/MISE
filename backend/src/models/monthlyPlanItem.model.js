import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const MonthlyPlanItem = sequelize.define(
    'MonthlyPlanItem',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        monthlyPlanId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'monthly_plan_id',
            allowNull: false
        },
        workspaceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'workspace_id',
            allowNull: false
        },
        ingredientId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'ingredient_id',
            allowNull: true,
            defaultValue: null
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        quantity: {
            type: DataTypes.DECIMAL(12, 3),
            allowNull: false
        },
        unit: {
            type: DataTypes.ENUM('PIECES', 'KG', 'LITERS', 'PACKS'),
            allowNull: false
        },
        priority: {
            type: DataTypes.ENUM('ESSENTIAL', 'OPTIONAL'),
            allowNull: false
        },
        notes: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null
        },
        addedBy: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'added_by',
            allowNull: true,
            defaultValue: null
        },
        statusAtClosure: {
            type: DataTypes.ENUM('TO_BUY', 'CLAIMED', 'PURCHASED_AWAITING_PANTRY', 'RESTOCKED'),
            field: 'status_at_closure',
            allowNull: true,
            defaultValue: null
        },
        buyerAtClosure: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'buyer_at_closure',
            allowNull: true,
            defaultValue: null
        },
        purchasedAtClosure: {
            type: DataTypes.DATE,
            field: 'purchased_at_closure',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'monthly_plan_items',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'uq_monthly_plan_items_id_workspace',
                unique: true,
                fields: ['id', 'workspace_id']
            },
            {
                name: 'idx_monthly_plan_items_plan_workspace',
                fields: ['monthly_plan_id', 'workspace_id']
            },
            {
                name: 'idx_monthly_plan_items_ingredient',
                fields: ['ingredient_id']
            },
            {
                name: 'idx_monthly_plan_items_added_by',
                fields: ['added_by']
            },
            {
                name: 'idx_monthly_plan_items_buyer',
                fields: ['buyer_at_closure']
            }
        ]
    }
);

export default MonthlyPlanItem;

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ShoppingItem = sequelize.define(
    'ShoppingItem',
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
        monthlyPlanItemId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'monthly_plan_item_id',
            allowNull: true,
            unique: 'uq_shopping_monthly_item',
            defaultValue: null
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
        notes: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null
        },
        activeList: {
            type: DataTypes.ENUM('QUICK', 'MONTHLY'),
            field: 'active_list',
            allowNull: false,
            defaultValue: 'QUICK'
        },
        status: {
            type: DataTypes.ENUM('TO_BUY', 'CLAIMED', 'PURCHASED_AWAITING_PANTRY', 'RESTOCKED'),
            allowNull: false,
            defaultValue: 'TO_BUY'
        },
        source: {
            type: DataTypes.ENUM('MANUAL', 'RECIPE', 'LOW_STOCK', 'MONTHLY_ROLLOVER'),
            allowNull: false,
            defaultValue: 'MANUAL'
        },
        sourceRecipeId: {
            type: DataTypes.STRING(32),
            field: 'source_recipe_id',
            allowNull: true,
            defaultValue: null
        },
        sourcePantryItemId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'source_pantry_item_id',
            allowNull: true,
            defaultValue: null
        },
        restockedPantryItemId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'restocked_pantry_item_id',
            allowNull: true,
            defaultValue: null
        },
        addedBy: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'added_by',
            allowNull: true,
            defaultValue: null
        },
        assignedTo: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'assigned_to',
            allowNull: true,
            defaultValue: null
        },
        claimedAt: {
            type: DataTypes.DATE,
            field: 'claimed_at',
            allowNull: true,
            defaultValue: null
        },
        purchasedAt: {
            type: DataTypes.DATE,
            field: 'purchased_at',
            allowNull: true,
            defaultValue: null
        },
        restockedAt: {
            type: DataTypes.DATE,
            field: 'restocked_at',
            allowNull: true,
            defaultValue: null
        },
        rolledOverAt: {
            type: DataTypes.DATE,
            field: 'rolled_over_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'shopping_items',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_shopping_monthly_workspace',
                fields: ['monthly_plan_item_id', 'workspace_id']
            },
            {
                name: 'idx_shopping_workspace_list_status',
                fields: ['workspace_id', 'active_list', 'status']
            },
            {
                name: 'idx_shopping_recipe_lookup',
                fields: ['workspace_id', 'source_recipe_id', 'ingredient_id', 'status']
            },
            {
                name: 'idx_shopping_ingredient',
                fields: ['ingredient_id']
            },
            {
                name: 'idx_shopping_source_pantry',
                fields: ['source_pantry_item_id']
            },
            {
                name: 'idx_shopping_restocked_pantry',
                fields: ['restocked_pantry_item_id']
            },
            {
                name: 'idx_shopping_contributor',
                fields: ['added_by']
            },
            {
                name: 'idx_shopping_buyer_status',
                fields: ['assigned_to', 'status']
            }
        ]
    }
);

export default ShoppingItem;

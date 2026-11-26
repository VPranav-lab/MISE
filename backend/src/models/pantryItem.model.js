import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PantryItem = sequelize.define(
    'PantryItem',
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
        barcode: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null
        },
        imageUrl: {
            type: DataTypes.STRING(2048),
            field: 'image_url',
            allowNull: true,
            defaultValue: null
        },
        unit: {
            type: DataTypes.ENUM('PIECES', 'KG', 'LITERS', 'PACKS'),
            allowNull: false
        },
        packageQuantity: {
            type: DataTypes.DECIMAL(12, 3),
            field: 'package_quantity',
            allowNull: true,
            defaultValue: null
        },
        packageUnit: {
            type: DataTypes.ENUM('PIECES', 'KG', 'LITERS'),
            field: 'package_unit',
            allowNull: true,
            defaultValue: null
        },
        minimumStock: {
            type: DataTypes.DECIMAL(12, 3),
            field: 'minimum_stock',
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
        tableName: 'pantry_items',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_pantry_workspace_name',
                fields: ['workspace_id', 'name']
            },
            {
                name: 'idx_pantry_workspace_ingredient',
                fields: ['workspace_id', 'ingredient_id']
            },
            {
                name: 'idx_pantry_ingredient',
                fields: ['ingredient_id']
            },
            {
                name: 'idx_pantry_created_by',
                fields: ['created_by']
            }
        ]
    }
);

export default PantryItem;

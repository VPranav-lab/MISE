import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PantryBatch = sequelize.define(
    'PantryBatch',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pantryItemId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'pantry_item_id',
            allowNull: false
        },
        quantity: {
            type: DataTypes.DECIMAL(12, 3),
            allowNull: false
        },
        storageLocation: {
            type: DataTypes.ENUM('FRIDGE', 'CUPBOARD', 'FREEZER'),
            field: 'storage_location',
            allowNull: false
        },
        expiryDate: {
            type: DataTypes.DATEONLY,
            field: 'expiry_date',
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
        tableName: 'pantry_batches',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'idx_pantry_batches_item_expiry',
                fields: ['pantry_item_id', 'expiry_date']
            },
            {
                name: 'idx_pantry_batches_expiry',
                fields: ['expiry_date']
            },
            {
                name: 'idx_pantry_batches_creator',
                fields: ['created_by']
            }
        ]
    }
);

export default PantryBatch;

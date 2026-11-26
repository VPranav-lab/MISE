import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const IngredientAlias = sequelize.define(
    'IngredientAlias',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        ingredientId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'ingredient_id',
            allowNull: false
        },
        aliasName: {
            type: DataTypes.STRING(150),
            field: 'alias_name',
            allowNull: false,
            unique: 'uq_ingredient_aliases_name'
        }
    },
    {
        tableName: 'ingredient_aliases',
        timestamps: true,
        underscored: true,
        updatedAt: false,
        indexes: [
            {
                name: 'idx_ingredient_aliases_ingredient',
                fields: ['ingredient_id']
            }
        ]
    }
);

export default IngredientAlias;

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Ingredient = sequelize.define(
    'Ingredient',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        canonicalName: {
            type: DataTypes.STRING(150),
            field: 'canonical_name',
            allowNull: false,
            unique: 'uq_ingredients_canonical_name'
        }
    },
    {
        tableName: 'ingredients',
        timestamps: true,
        underscored: true
    }
);

export default Ingredient;

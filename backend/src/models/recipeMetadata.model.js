import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const RecipeMetadata = sequelize.define(
    'RecipeMetadata',
    {
        recipeId: {
            type: DataTypes.STRING(32),
            field: 'recipe_id',
            allowNull: false,
            primaryKey: true
        },
        durationMinutes: {
            type: DataTypes.SMALLINT.UNSIGNED,
            field: 'duration_minutes',
            allowNull: true,
            defaultValue: null
        },
        difficulty: {
            type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
            allowNull: true,
            defaultValue: null
        },
        metadataSource: {
            type: DataTypes.STRING(255),
            field: 'metadata_source',
            allowNull: true,
            defaultValue: null
        },
        verifiedAt: {
            type: DataTypes.DATE,
            field: 'verified_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'recipe_metadata',
        timestamps: true,
        underscored: true
    }
);

export default RecipeMetadata;

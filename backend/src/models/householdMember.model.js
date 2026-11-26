import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const HouseholdMember = sequelize.define(
    'HouseholdMember',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        householdId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'household_id',
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'user_id',
            allowNull: false,
            unique: 'uq_household_members_user'
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'MEMBER'),
            allowNull: false,
            defaultValue: 'MEMBER'
        },
        joinedAt: {
            type: DataTypes.DATE,
            field: 'joined_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: 'household_members',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                name: 'uq_household_member',
                unique: true,
                fields: ['household_id', 'user_id']
            }
        ]
    }
);

export default HouseholdMember;

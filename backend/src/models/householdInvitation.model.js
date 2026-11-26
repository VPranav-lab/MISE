import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const HouseholdInvitation = sequelize.define(
    'HouseholdInvitation',
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
        inviterUserId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'inviter_user_id',
            allowNull: false
        },
        inviteeUserId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'invitee_user_id',
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        respondedAt: {
            type: DataTypes.DATE,
            field: 'responded_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'household_invitations',
        timestamps: true,
        underscored: true,
        updatedAt: false,
        indexes: [
            {
                name: 'idx_invitations_inviter',
                fields: ['inviter_user_id']
            },
            {
                name: 'idx_invitations_invitee_status',
                fields: ['invitee_user_id', 'status']
            },
            {
                name: 'idx_invitations_household_status',
                fields: ['household_id', 'status']
            }
        ]
    }
);

export default HouseholdInvitation;

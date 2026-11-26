import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Household = sequelize.define(
    'Household',
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
            allowNull: false,
            unique: 'uq_households_workspace_id'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        invitationCode: {
            type: DataTypes.CHAR(16),
            field: 'invitation_code',
            allowNull: false,
            unique: 'uq_households_invitation_code'
        },
        invitationCodeUpdatedAt: {
            type: DataTypes.DATE,
            field: 'invitation_code_updated_at',
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: 'households',
        timestamps: true,
        underscored: true,
        defaultScope: {
            attributes: {
                exclude: ['invitationCode']
            }
        },
        scopes: {
            withInvitationCode: {}
        }
    }
);

export default Household;

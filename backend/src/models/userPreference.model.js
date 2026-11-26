import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserPreference = sequelize.define(
    'UserPreference',
    {
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            field: 'user_id',
            allowNull: false,
            primaryKey: true
        },
        phoneNumber: {
            type: DataTypes.STRING(16),
            field: 'phone_number',
            allowNull: true,
            defaultValue: null
        },
        smsEnabled: {
            type: DataTypes.TINYINT.UNSIGNED,
            field: 'sms_enabled',
            allowNull: false,
            defaultValue: 0
        },
        smsConsentAt: {
            type: DataTypes.DATE,
            field: 'sms_consent_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'user_preferences',
        timestamps: true,
        underscored: true
    }
);

export default UserPreference;

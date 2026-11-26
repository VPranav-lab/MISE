import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: 'uq_users_username'
        },
        firstName: {
            type: DataTypes.STRING(80),
            field: 'first_name',
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(80),
            field: 'last_name',
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(254),
            allowNull: false,
            unique: 'uq_users_email'
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            field: 'password_hash',
            allowNull: false
        },
        emailVerifiedAt: {
            type: DataTypes.DATE,
            field: 'email_verified_at',
            allowNull: true,
            defaultValue: null
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            field: 'last_login_at',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        defaultScope: {
            attributes: {
                exclude: ['passwordHash']
            }
        },
        scopes: {
            withPassword: {}
        }
    }
);

export default User;


import 'dotenv/config';
import { Sequelize } from 'sequelize';

const requiredVariables = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Missing environment variable: ${variable}`
        );
    }
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),

        dialect: 'mysql',
        timezone: '+00:00',

        logging: process.env.DB_LOGGING === 'true'
            ? console.log
            : false,

        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDatabase = async () => {
    await sequelize.authenticate();

    console.log('[MYSQL] Database connected successfully');
};


const disconnectDatabase = async () => {
    await sequelize.close();

    console.log('[MYSQL] Database connection closed');
};

export {
    sequelize,
    connectDatabase,
    disconnectDatabase
};


import 'dotenv/config';
import nodemailer from 'nodemailer';

const requiredVariables = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASSWORD'
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Missing environment variable: ${variable}`
        );
    }
}

const port = Number(process.env.SMTP_PORT || 465);
const secure = process.env.SMTP_SECURE || 'true';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid SMTP_PORT');
}

if (!['true', 'false'].includes(secure)) {
    throw new Error('Invalid SMTP_SECURE');
}

export const mailConfig = Object.freeze({
    host: process.env.SMTP_HOST,
    port,
    secure: secure === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromName: process.env.SMTP_FROM_NAME || 'MISE'
});

export const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    requireTLS: !mailConfig.secure,
    auth: {
        user: mailConfig.user,
        pass: mailConfig.password
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

export const verifyMailConnection = async () => {
    await transporter.verify();

    console.log('[SMTP] Connection verified successfully');
};

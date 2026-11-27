
import 'dotenv/config';

const secret = process.env.JWT_ACCESS_SECRET || '';

if (!/^[a-fA-F0-9]{128}$/.test(secret)) {
    throw new Error('Invalid JWT_ACCESS_SECRET');
}

const getInteger = (name, fallback, min, max) => {
    const value = Number(process.env[name] || fallback);

    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`Invalid environment variable: ${name}`);
    }

    return value;
};

const authConfig = Object.freeze({
    jwtSecret: Buffer.from(secret, 'hex'),
    jwtIssuer: 'mise-backend',
    jwtAudience: 'mise-app',
    accessTokenTtl: getInteger(
        'JWT_ACCESS_TTL_SECONDS', 900, 60, 3600
    ),
    refreshTokenTtlDays: getInteger(
        'REFRESH_TOKEN_TTL_DAYS', 30, 1, 90
    ),
    bcryptRounds: getInteger(
        'BCRYPT_ROUNDS', 12, 10, 15
    )
});

export default authConfig;

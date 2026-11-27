
import 'dotenv/config';

const secret = process.env.OTP_SECRET || '';

if (!/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error('Invalid OTP_SECRET');
}

const getInteger = (name, fallback, min, max) => {
    const value = Number(process.env[name] || fallback);

    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`Invalid environment variable: ${name}`);
    }

    return value;
};

const otpConfig = Object.freeze({
    secret: Buffer.from(secret, 'hex'),
    ttlSeconds: getInteger(
        'OTP_TTL_SECONDS', 600, 60, 3600
    ),
    cooldownSeconds: getInteger(
        'OTP_RESEND_COOLDOWN_SECONDS', 60, 10, 600
    ),
    maxAttempts: getInteger(
        'OTP_MAX_ATTEMPTS', 5, 1, 10
    ),
    maxRequestsPerHour: getInteger(
        'OTP_MAX_REQUESTS_PER_HOUR', 5, 1, 20
    ),
    resetTokenTtlSeconds: getInteger(
        'RESET_TOKEN_TTL_SECONDS', 600, 60, 1800
    )
});

export const OTP_PURPOSES = Object.freeze({
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PASSWORD_RESET: 'PASSWORD_RESET',
    EMAIL_CHANGE: 'EMAIL_CHANGE'
});

export default otpConfig;

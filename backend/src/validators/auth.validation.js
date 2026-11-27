
import { z } from 'zod';

const nameSchema = z.string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name cannot exceed 80 characters');

const usernameSchema = z.string()
    .trim()
    .min(3, 'Username must contain at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers and underscores'
    );

const emailSchema = z.string()
    .trim()
    .toLowerCase()
    .max(254, 'Email cannot exceed 254 characters')
    .pipe(z.email('Invalid email address'));

const passwordInputSchema = z.string()
    .min(1, 'Password is required')
    .refine(
        (password) => Buffer.byteLength(password, 'utf8') <= 72,
        'Password cannot exceed 72 bytes'
    );

const newPasswordSchema = passwordInputSchema.refine(
    (password) => [...password].length >= 12,
    'Password must contain at least 12 characters'
);

const otpSchema = z.string()
    .regex(
        /^\d{6}$/,
        'Verification code must contain exactly 6 digits'
    );

const tokenSchema = z.string()
    .regex(
        /^[a-f0-9]{64}$/,
        'Invalid token format'
    );

const identifierSchema = z.string()
    .trim()
    .min(1, 'Username or email is required')
    .max(254, 'Invalid username or email')
    .refine(
        (value) =>
            usernameSchema.safeParse(value).success ||
            emailSchema.safeParse(value).success,
        'Enter a valid username or email address'
    );

export const registerSchema = z.strictObject({
    firstName: nameSchema,
    lastName: nameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: passwordInputSchema
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    }
);

export const loginSchema = z.strictObject({
    identifier: identifierSchema,
    password: passwordInputSchema
});

export const verifyEmailSchema = z.strictObject({
    email: emailSchema,
    code: otpSchema
});

export const resendOtpSchema = z.strictObject({
    email: emailSchema
});

export const forgotPasswordSchema = z.strictObject({
    email: emailSchema
});

export const verifyResetOtpSchema = z.strictObject({
    email: emailSchema,
    code: otpSchema
});

export const resetPasswordSchema = z.strictObject({
    email: emailSchema,
    resetToken: tokenSchema,
    password: newPasswordSchema,
    confirmPassword: passwordInputSchema
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    }
);

export const refreshTokenSchema = z.strictObject({
    refreshToken: tokenSchema
});


import assert from 'node:assert/strict';

import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    verifyResetOtpSchema,
    resetPasswordSchema,
    refreshTokenSchema
} from './src/validators/auth.validation.js';

const registration = {
    firstName: 'Alex',
    lastName: 'Morgan',
    username: 'alex_morgan',
    email: 'ALEX@example.com',
    password: 'MisePassword123!',
    confirmPassword: 'MisePassword123!'
};

const validToken = 'a'.repeat(64);

const result = registerSchema.parse(registration);

assert.equal(result.email, 'alex@example.com');

assert.equal(
    registerSchema.safeParse({
        ...registration,
        confirmPassword: 'DifferentPassword123!'
    }).success,
    false
);

assert.equal(
    registerSchema.safeParse({
        ...registration,
        username: 'invalid username'
    }).success,
    false
);

assert.equal(
    registerSchema.safeParse({
        ...registration,
        password: 'short',
        confirmPassword: 'short'
    }).success,
    false
);

assert.equal(
    registerSchema.safeParse({
        ...registration,
        role: 'ADMIN'
    }).success,
    false
);

console.log('Registration validation: OK');

for (const identifier of [
    'alex_morgan',
    'alex@example.com'
]) {
    assert.equal(
        loginSchema.safeParse({
            identifier,
            password: registration.password
        }).success,
        true
    );
}

console.log('Login validation: OK');

const email = 'alex@example.com';

assert.equal(
    verifyEmailSchema.safeParse({
        email,
        code: '048291'
    }).success,
    true
);

assert.equal(
    verifyEmailSchema.safeParse({
        email,
        code: '12345'
    }).success,
    false
);

assert.equal(
    verifyEmailSchema.safeParse({
        email,
        code: 482916
    }).success,
    false
);

assert.equal(
    resendOtpSchema.safeParse({ email }).success,
    true
);

console.log('Email verification validation: OK');

assert.equal(
    forgotPasswordSchema.safeParse({ email }).success,
    true
);

assert.equal(
    verifyResetOtpSchema.safeParse({
        email,
        code: '123456'
    }).success,
    true
);

assert.equal(
    resetPasswordSchema.safeParse({
        email,
        resetToken: validToken,
        password: 'NewMisePassword123!',
        confirmPassword: 'NewMisePassword123!'
    }).success,
    true
);

console.log('Password reset validation: OK');

assert.equal(
    refreshTokenSchema.safeParse({
        refreshToken: validToken
    }).success,
    true
);

assert.equal(
    refreshTokenSchema.safeParse({
        refreshToken: 'invalid-token'
    }).success,
    false
);

console.log('Refresh token validation: OK');
console.log('All validation tests passed');

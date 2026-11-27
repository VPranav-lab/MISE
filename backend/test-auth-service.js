
import assert from 'node:assert/strict';
import { createInterface } from 'node:readline/promises';

import {
    connectDatabase,
    disconnectDatabase
} from './src/config/database.js';

import {
    connectRedis,
    disconnectRedis
} from './src/config/redis.js';

import authService from './src/services/auth.service.js';
import sessionRepository from './src/repositories/session.repository.js';

const terminal = createInterface({
    input: process.stdin,
    output: process.stdout
});

try {
    await connectDatabase();
    await connectRedis();

    const email = (
        await terminal.question('Enter an unused email address: ')
    ).trim().toLowerCase();

    const username = `mise_test_${Date.now()}`;
    const password = 'MiseTestPassword123!';
    const newPassword = 'NewMisePassword456!';

    await authService.register({
        firstName: 'Test',
        lastName: 'User',
        username,
        email,
        password,
        confirmPassword: password
    });

    console.log('Registration: OK');

    await assert.rejects(
        () => authService.login({
            identifier: username,
            password
        }),
        (error) => error.code === 'EMAIL_NOT_VERIFIED'
    );

    console.log('Unverified login prevention: OK');

    const verificationCode = (
        await terminal.question('Enter email verification OTP: ')
    ).trim();

    const verified = await authService.verifyEmail({
        email,
        code: verificationCode
    });

    assert.equal(verified.user.emailVerified, true);
    assert.equal(verified.workspace.mode, 'PERSONAL');

    console.log('Email verification: OK');
    console.log('Personal workspace: OK');

    const login = await authService.login({
        identifier: username,
        password
    });

    assert.ok(login.session.accessToken);
    assert.ok(login.session.refreshToken);

    console.log('Login: OK');

    const account = await authService.getMe(login.user.id);

    assert.equal(account.user.username, username);

    console.log('Current account: OK');

    const refreshed = await authService.refresh({
        refreshToken: login.session.refreshToken
    });

    assert.notEqual(
        refreshed.session.refreshToken,
        login.session.refreshToken
    );

    await assert.rejects(
        () => authService.refresh({
            refreshToken: login.session.refreshToken
        }),
        (error) => error.code === 'INVALID_REFRESH_TOKEN'
    );

    console.log('Refresh token rotation: OK');

    await authService.forgotPassword({ email });

    const resetCode = (
        await terminal.question('Enter password reset OTP: ')
    ).trim();

    const reset = await authService.verifyResetOtp({
        email,
        code: resetCode
    });

    await authService.resetPassword({
        email,
        resetToken: reset.resetToken,
        password: newPassword,
        confirmPassword: newPassword
    });

    await assert.rejects(
        () => authService.login({
            identifier: username,
            password
        }),
        (error) => error.code === 'INVALID_CREDENTIALS'
    );

    await assert.rejects(
        () => authService.refresh({
            refreshToken: refreshed.session.refreshToken
        }),
        (error) => error.code === 'INVALID_REFRESH_TOKEN'
    );

    assert.equal(
        await sessionRepository.findActiveById(
            verified.session.id,
            verified.user.id
        ),
        null
    );

    console.log('Password reset: OK');
    console.log('Previous session revocation: OK');

    const newLogin = await authService.login({
        identifier: email,
        password: newPassword
    });

    console.log('Login with new password: OK');

    await authService.logout({
        userId: newLogin.user.id,
        sessionId: newLogin.session.id
    });

    assert.equal(
        await sessionRepository.findActiveById(
            newLogin.session.id,
            newLogin.user.id
        ),
        null
    );

    console.log('Logout: OK');
    console.log('All authentication service tests passed');
} catch (error) {
    console.error(error.name, error.message);
    process.exitCode = 1;
} finally {
    terminal.close();

    await Promise.allSettled([
        disconnectDatabase(),
        disconnectRedis()
    ]);
}

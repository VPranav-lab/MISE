
import assert from 'node:assert/strict';

import {
    connectRedis,
    disconnectRedis
} from './src/config/redis.js';

import resetTokenService from './src/services/resetToken.service.js';

try {
    await connectRedis();

    const context = {
        userId: String(Date.now()),
        email: 'test@example.com',
        passwordHash: 'test-password-hash'
    };

    const first = await resetTokenService.issueResetToken(context);

    assert.match(first.resetToken, /^[a-f0-9]{64}$/);

    console.log('Reset token generation: OK');

    const second = await resetTokenService.issueResetToken(context);

    assert.notEqual(first.resetToken, second.resetToken);

    await assert.rejects(
        () => resetTokenService.consumeResetToken({
            ...context,
            resetToken: first.resetToken
        }),
        (error) => error.code === 'INVALID_RESET_TOKEN'
    );

    console.log('Previous token invalidation: OK');

    await assert.rejects(
        () => resetTokenService.consumeResetToken({
            ...context,
            email: 'different@example.com',
            resetToken: second.resetToken
        }),
        (error) => error.code === 'INVALID_RESET_TOKEN'
    );

    console.log('Email binding: OK');

    await assert.rejects(
        () => resetTokenService.consumeResetToken({
            ...context,
            passwordHash: 'changed-password-hash',
            resetToken: second.resetToken
        }),
        (error) => error.code === 'INVALID_RESET_TOKEN'
    );

    console.log('Password hash binding: OK');

    const results = await Promise.allSettled([
        resetTokenService.consumeResetToken({
            ...context,
            resetToken: second.resetToken
        }),
        resetTokenService.consumeResetToken({
            ...context,
            resetToken: second.resetToken
        })
    ]);

    assert.equal(
        results.filter(
            (result) => result.status === 'fulfilled'
        ).length,
        1
    );

    assert.equal(
        results.filter(
            (result) => result.status === 'rejected'
        ).length,
        1
    );

    console.log('Concurrent token consumption: OK');

    await assert.rejects(
        () => resetTokenService.consumeResetToken({
            ...context,
            resetToken: second.resetToken
        }),
        (error) => error.code === 'RESET_TOKEN_EXPIRED'
    );

    console.log('Token reuse prevention: OK');
    console.log('All reset token tests passed');
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    await disconnectRedis();
}

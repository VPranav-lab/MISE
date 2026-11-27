
import assert from 'node:assert/strict';

import {
    connectDatabase,
    disconnectDatabase
} from './src/config/database.js';

import authenticate from './src/middleware/auth.middleware.js';
import { generateAccessToken } from './src/utils/jwt.utils.js';

const createRequest = (authorization) => ({
    headers: authorization
        ? { authorization }
        : {}
});

const testRejection = async (authorization, code) => {
    await assert.rejects(
        () => authenticate(
            createRequest(authorization),
            {},
            () => {
                throw new Error('Unexpected authorization');
            }
        ),
        (error) => error.code === code
    );
};

try {
    await connectDatabase();

    await testRejection(
        undefined,
        'AUTHENTICATION_REQUIRED'
    );

    console.log('Missing token rejection: OK');

    await testRejection(
        'Basic invalid',
        'INVALID_AUTHORIZATION_HEADER'
    );

    console.log('Invalid header rejection: OK');

    await testRejection(
        'Bearer invalid-token',
        'INVALID_TOKEN'
    );

    console.log('Invalid JWT rejection: OK');

    const token = generateAccessToken(
        '999999999',
        '999999999'
    );

    await testRejection(
        `Bearer ${token}`,
        'INVALID_SESSION'
    );

    console.log('Nonexistent session rejection: OK');

    console.log('All middleware rejection tests passed');
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    await disconnectDatabase();
}


import assert from 'node:assert/strict';
import { createInterface } from 'node:readline/promises';

import {
    connectRedis,
    disconnectRedis
} from './src/config/redis.js';

import otpService from './src/services/otp.service.js';
import { OTP_PURPOSES } from './src/config/otp.config.js';

const terminal = createInterface({
    input: process.stdin,
    output: process.stdout
});

try {
    await connectRedis();

    const email = await terminal.question(
        'Enter your email address: '
    );

    const challenge = {
        userId: String(Date.now()),
        email,
        purpose: OTP_PURPOSES.EMAIL_VERIFICATION
    };

    const result = await otpService.sendOtp(challenge);

    console.log('OTP sent successfully:', result);

    await assert.rejects(
        () => otpService.sendOtp(challenge),
        (error) => error.code === 'OTP_COOLDOWN'
    );

    console.log('Resend cooldown: OK');

    const code = (
        await terminal.question('Enter received OTP: ')
    ).trim();

    const wrongCode =
        (code[0] === '0' ? '1' : '0') + code.slice(1);

    await assert.rejects(
        () => otpService.verifyOtp({
            ...challenge,
            code: wrongCode
        }),
        (error) => error.code === 'INVALID_OTP'
    );

    console.log('Incorrect OTP rejection: OK');

    assert.equal(
        await otpService.verifyOtp({
            ...challenge,
            code
        }),
        true
    );

    console.log('OTP verification: OK');

    await assert.rejects(
        () => otpService.verifyOtp({
            ...challenge,
            code
        }),
        (error) => error.code === 'OTP_EXPIRED'
    );

    console.log('OTP reuse prevention: OK');
    console.log('All OTP tests passed');
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    terminal.close();
    await disconnectRedis();
}

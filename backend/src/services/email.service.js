
import {
    transporter,
    mailConfig
} from '../config/mail.config.js';

import AppError from '../utils/AppError.js';

const templates = Object.freeze({
    EMAIL_VERIFICATION: {
        subject: 'Verify your MISE account',
        title: 'Verify your email address',
        description: 'Use the verification code below to activate your MISE account.'
    },
    PASSWORD_RESET: {
        subject: 'Reset your MISE password',
        title: 'Reset your password',
        description: 'Use the verification code below to reset your MISE password.'
    },
    EMAIL_CHANGE: {
        subject: 'Verify your new email address',
        title: 'Confirm your new email address',
        description: 'Use the verification code below to confirm your new email address.'
    }
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const result = await transporter.sendMail({
            from: {
                name: mailConfig.fromName,
                address: mailConfig.user
            },
            to,
            subject,
            text,
            html
        });

        if (!result.accepted.length || result.rejected.length) {
            throw new Error('Recipient rejected');
        }

        return {
            messageId: result.messageId
        };
    } catch {
        throw new AppError(
            'Email delivery failed',
            503,
            'EMAIL_DELIVERY_FAILED'
        );
    }
};

const sendOtpEmail = async ({
    to,
    code,
    purpose,
    expiresInMinutes = 10
}) => {
    if (!Object.hasOwn(templates, purpose)) {
        throw new Error('Invalid OTP purpose');
    }

    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
        throw new Error('Invalid OTP code');
    }

    if (
        !Number.isInteger(expiresInMinutes) ||
        expiresInMinutes < 1 ||
        expiresInMinutes > 60
    ) {
        throw new Error('Invalid OTP expiry');
    }

    const template = templates[purpose];

    const text = [
        template.title,
        template.description,
        `Verification code: ${code}`,
        `This code expires in ${expiresInMinutes} minutes.`,
        'If you did not request this code, you can ignore this email.',
        'MISE — Smart Pantry & Cooking'
    ].join('\n\n');

    const html = `
        <div style="background:#EEF2EC;padding:32px 16px;font-family:Arial,sans-serif;color:#292D29;">
            <div style="max-width:480px;margin:auto;background:#F7F5EF;border:1px solid #D1D5D1;border-radius:16px;padding:32px;">
                <h1 style="color:#24583A;font-size:32px;margin:0;">
                    MISE
                </h1>

                <p style="color:#626862;font-size:13px;margin-top:6px;">
                    Smart Pantry &amp; Cooking
                </p>

                <h2 style="font-size:22px;margin-top:32px;">
                    ${template.title}
                </h2>

                <p style="font-size:15px;line-height:1.6;">
                    ${template.description}
                </p>

                <div style="background:#DCE8D9;color:#24583A;border-radius:12px;text-align:center;padding:24px;margin:24px 0;font-size:36px;font-weight:bold;letter-spacing:8px;">
                    ${code}
                </div>

                <p style="font-size:14px;line-height:1.6;">
                    This code expires in
                    <strong>${expiresInMinutes} minutes.</strong>
                    Do not share it with anyone.
                </p>

                <p style="font-size:13px;color:#626862;line-height:1.6;">
                    If you did not request this code, you can ignore this email.
                </p>

                <hr style="border:0;border-top:1px solid #D1D5D1;margin:24px 0;">

                <p style="font-size:12px;color:#626862;text-align:center;">
                    MISE — Smart Pantry &amp; Cooking
                </p>
            </div>
        </div>
    `;

    return sendEmail({
        to,
        subject: template.subject,
        text,
        html
    });
};

export default {
    sendEmail,
    sendOtpEmail
};

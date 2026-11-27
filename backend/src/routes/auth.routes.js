
import { Router } from 'express';

import authController from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authRateLimits } from '../middleware/rateLimit.middleware.js';

import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    verifyResetOtpSchema,
    resetPasswordSchema,
    refreshTokenSchema
} from '../validators/auth.validation.js';

const router = Router();

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

router.post(
    '/register',
    authRateLimits.register,
    validate({ body: registerSchema }),
    authController.register
);

router.post(
    '/verify-email',
    authRateLimits.otpVerify,
    validate({ body: verifyEmailSchema }),
    authController.verifyEmail
);

router.post(
    '/resend-otp',
    authRateLimits.otpRequest,
    validate({ body: resendOtpSchema }),
    authController.resendOtp
);

router.post(
    '/login',
    authRateLimits.login,
    validate({ body: loginSchema }),
    authRateLimits.loginIdentity,
    authController.login
);

router.post(
    '/forgot-password',
    authRateLimits.otpRequest,
    validate({ body: forgotPasswordSchema }),
    authController.forgotPassword
);

router.post(
    '/verify-reset-otp',
    authRateLimits.otpVerify,
    validate({ body: verifyResetOtpSchema }),
    authController.verifyResetOtp
);

router.post(
    '/reset-password',
    authRateLimits.resetPassword,
    validate({ body: resetPasswordSchema }),
    authController.resetPassword
);

router.post(
    '/refresh',
    authRateLimits.refresh,
    validate({ body: refreshTokenSchema }),
    authController.refresh
);

router.post(
    '/logout',
    authenticate,
    authController.logout
);

router.get(
    '/me',
    authenticate,
    authController.getMe
);

export default router;

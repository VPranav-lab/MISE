
import authService from '../services/auth.service.js';

const register = async (req, res) => {
    const data = await authService.register(
        req.validated.body
    );

    return res.status(201).json({
        success: true,
        message: 'Registration successful. Verify your email address.',
        data
    });
};

const verifyEmail = async (req, res) => {
    const data = await authService.verifyEmail(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data
    });
};

const resendOtp = async (req, res) => {
    const data = await authService.resendOtp(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'If eligible, a verification code will be sent to your email',
        data
    });
};

const login = async (req, res) => {
    const data = await authService.login(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'Login successful',
        data
    });
};

const forgotPassword = async (req, res) => {
    const data = await authService.forgotPassword(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'If eligible, a password reset code will be sent to your email',
        data
    });
};

const verifyResetOtp = async (req, res) => {
    const data = await authService.verifyResetOtp(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'Password reset code verified successfully',
        data
    });
};

const resetPassword = async (req, res) => {
    const data = await authService.resetPassword(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        data
    });
};

const refresh = async (req, res) => {
    const data = await authService.refresh(
        req.validated.body
    );

    return res.status(200).json({
        success: true,
        message: 'Session refreshed successfully',
        data
    });
};

const logout = async (req, res) => {
    const data = await authService.logout(
        req.auth
    );

    return res.status(200).json({
        success: true,
        message: 'Logout successful',
        data
    });
};

const getMe = async (req, res) => {
    const data = await authService.getMe(
        req.auth.userId
    );

    return res.status(200).json({
        success: true,
        message: 'Account retrieved successfully',
        data
    });
};

export default {
    register,
    verifyEmail,
    resendOtp,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    refresh,
    logout,
    getMe
};

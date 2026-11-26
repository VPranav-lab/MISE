
import AppError from '../utils/AppError.js';

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details = null;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
        details = err.details;
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'A record with the provided information already exists';
        code = 'DUPLICATE_RECORD';
    } else if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Invalid data provided';
        code = 'VALIDATION_ERROR';
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 409;
        message = 'Operation conflicts with related records';
        code = 'RELATIONSHIP_CONFLICT';
    } else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON request body';
        code = 'INVALID_JSON';
    } else if (err.type === 'entity.too.large') {
        statusCode = 413;
        message = 'Request body is too large';
        code = 'PAYLOAD_TOO_LARGE';
    }

    if (statusCode >= 500) {
        console.error(
            `[ERROR] ${req.method} ${req.path}`,
            err.name,
            err.message
        );

        message = 'Internal server error';
        details = null;
    }

    return res.status(statusCode).json({
        success: false,
        message,
        error: {
            code,
            ...(details !== null && { details })
        }
    });
};

export default errorHandler;

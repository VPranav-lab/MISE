
import AppError from '../utils/AppError.js';

const validate = (schemas) => async (req, res, next) => {
    const validated = {};
    const errors = [];

    for (const [source, schema] of Object.entries(schemas)) {
        const result = await schema.safeParseAsync(req[source]);

        if (!result.success) {
            errors.push(
                ...result.error.issues.map((issue) => ({
                    field: [source, ...issue.path]
                        .map(String)
                        .join('.'),
                    message: issue.message
                }))
            );

            continue;
        }

        validated[source] = result.data;
    }

    if (errors.length > 0) {
        return next(
            new AppError(
                'Request validation failed',
                400,
                'VALIDATION_ERROR',
                errors
            )
        );
    }

    req.validated = {
        ...req.validated,
        ...validated
    };

    return next();
};

export default validate;

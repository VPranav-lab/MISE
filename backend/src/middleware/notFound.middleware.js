
import AppError from '../utils/AppError.js';

const notFound = (req, res, next) => {
    next(
        new AppError(
            'Requested endpoint does not exist',
            404,
            'ROUTE_NOT_FOUND'
        )
    );
};

export default notFound;

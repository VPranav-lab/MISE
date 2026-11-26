
import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health.routes.js';
import notFound from './middleware/notFound.middleware.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');

app.use(cors());

app.use(express.json({
    limit: '1mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));

app.use('/api/health', healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

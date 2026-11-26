
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/health', healthRoutes);
export default app;

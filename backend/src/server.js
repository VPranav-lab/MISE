
import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT || 5000);
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    console.error('[ERROR] Invalid server port.');
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log('========================================');
    console.log('         MISE Backend Server');
    console.log('========================================');
    console.log(`Environment : ${NODE_ENV}`);
    console.log(`Port        : ${PORT}`);
    console.log(`Server URL  : http://localhost:${PORT}`);
    console.log('Status      : Running');
    console.log('========================================');
});

server.on('error', (error) => {
    console.error('[SERVER ERROR]', error.message);
    process.exit(1);
});

const shutdown = (signal) => {
    console.log(`\n[INFO] Received ${signal}. Shutting down...`);

    server.close(() => {
        console.log('[INFO] Server closed successfully.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('[ERROR] Forced server shutdown.');
        process.exit(1);
    }, 10000).unref();
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));


import 'dotenv/config';
import { once } from 'node:events';
import app from './app.js';

import {
    connectDatabase,
    disconnectDatabase
} from './config/database.js';

import {
    connectRedis,
    disconnectRedis
} from './config/redis.js';

const PORT = Number(process.env.PORT || 5000);
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    console.error('[SERVER ERROR] Invalid port number');
    process.exit(1);
}

let server;
let shuttingDown = false;

const startServer = async () => {
    await connectDatabase();
    await connectRedis();

    if (shuttingDown) return;

    server = app.listen(PORT);

    await once(server, 'listening');

    server.on('error', (error) => {
        console.error('[SERVER ERROR]', error.message);
        void shutdown('SERVER ERROR', 1);
    });

    console.log('========================================');
    console.log('          MISE BACKEND SERVER');
    console.log('========================================');
    console.log(`Environment : ${NODE_ENV}`);
    console.log(`Port        : ${PORT}`);
    console.log(`Server URL  : http://localhost:${PORT}`);
    console.log('MySQL       : Connected');
    console.log('Redis       : Connected');
    console.log('Status      : Running');
    console.log('========================================');
};

const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`[SERVER] ${signal} received`);
    console.log('[SERVER] Shutting down...');

    const timeout = setTimeout(() => {
        console.error('[SERVER] Shutdown timed out');
        process.exit(1);
    }, 10000);

    timeout.unref();

    try {
        await startup.catch(() => {});

        if (server?.listening) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) return reject(error);
                    resolve();
                });
            });
        }

        const results = await Promise.allSettled([
            disconnectDatabase(),
            disconnectRedis()
        ]);

        for (const result of results) {
            if (result.status === 'rejected') {
                console.error('[SHUTDOWN ERROR]', result.reason);
                exitCode = 1;
            }
        }

        console.log('[SERVER] Shutdown completed');
        process.exit(exitCode);
    } catch (error) {
        console.error('[SHUTDOWN ERROR]', error.message);
        process.exit(1);
    }
};

const startup = startServer();

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startup.catch((error) => {
    console.error('[STARTUP ERROR]', error.message);
    void shutdown('STARTUP ERROR', 1);
});

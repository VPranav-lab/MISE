
import 'dotenv/config';
import { createClient } from 'redis';

if (!process.env.REDIS_PASSWORD) {
    throw new Error(
        'Missing environment variable: REDIS_PASSWORD'
    );
}

const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,

    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),

        connectTimeout: 5000,

        reconnectStrategy: (retries) => {
            if (retries >= 5) {
                return new Error(
                    'Redis reconnection limit reached'
                );
            }

            return Math.min(retries * 500, 3000);
        }
    }
});

redisClient.on('error', (error) => {
    console.error('[REDIS ERROR]', error.message);
});

redisClient.on('reconnecting', () => {
    console.log('[REDIS] Reconnecting...');
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    await redisClient.ping();

    console.log('[REDIS] Connected successfully');
};

const disconnectRedis = async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();

        console.log('[REDIS] Connection closed');
    }
};

export {
    redisClient,
    connectRedis,
    disconnectRedis
};


import { sequelize } from '../config/database.js';
import { redisClient } from '../config/redis.js';

const checkDependency = async (operation) => {
    let timer;

    try {
        await Promise.race([
            operation(),
            new Promise((_, reject) => {
                timer = setTimeout(() => {
                    reject(new Error('Connection check timed out'));
                }, 3000);
            })
        ]);

        return 'connected';
    } catch {
        return 'disconnected';
    } finally {
        clearTimeout(timer);
    }
};

export const getHealth = (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'MISE backend is running',
        data: {
            status: 'healthy',
            environment: process.env.NODE_ENV || 'development',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString()
        }
    });
};

export const getReadiness = async (req, res) => {
    const [mysql, redis] = await Promise.all([
        checkDependency(() => sequelize.authenticate()),
        checkDependency(async () => {
            if (!redisClient.isReady) {
                throw new Error('Redis is not ready');
            }

            await redisClient.ping();
        })
    ]);

    const ready =
        mysql === 'connected' &&
        redis === 'connected';

    return res.status(ready ? 200 : 503).json({
        success: ready,
        message: ready
            ? 'MISE backend is ready'
            : 'MISE backend is not ready',
        data: {
            status: ready ? 'ready' : 'not_ready',
            services: {
                mysql,
                redis
            },
            timestamp: new Date().toISOString()
        }
    });
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
});
exports.redisClient = redisClient;
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});
redisClient.on('ready', () => {
    console.log('Redis Client Ready');
});
redisClient.on('end', () => {
    console.log('Redis Client Disconnected');
});
const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        console.log('Falling back to in-memory OTP storage');
    }
};
exports.connectRedis = connectRedis;
//# sourceMappingURL=redis.js.map
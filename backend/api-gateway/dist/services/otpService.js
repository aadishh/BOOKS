"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpService = void 0;
const redis_1 = require("../config/redis");
class OTPService {
    constructor() {
        this.inMemoryStorage = new Map();
        this.useRedis = true;
        this.checkRedisAvailability();
    }
    async checkRedisAvailability() {
        try {
            if (redis_1.redisClient.isOpen) {
                await redis_1.redisClient.ping();
                this.useRedis = true;
            }
            else {
                this.useRedis = false;
            }
        }
        catch (error) {
            console.log('Redis not available, using in-memory storage');
            this.useRedis = false;
        }
    }
    async set(key, data) {
        try {
            if (this.useRedis && redis_1.redisClient.isOpen) {
                const ttlSeconds = Math.ceil((data.expiresAt - Date.now()) / 1000);
                await redis_1.redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
            }
            else {
                this.inMemoryStorage.set(key, data);
            }
        }
        catch (error) {
            console.error('Error storing OTP:', error);
            this.inMemoryStorage.set(key, data);
        }
    }
    async get(key) {
        try {
            if (this.useRedis && redis_1.redisClient.isOpen) {
                const data = await redis_1.redisClient.get(key);
                if (data) {
                    return JSON.parse(data);
                }
                return null;
            }
            else {
                const data = this.inMemoryStorage.get(key);
                if (data && Date.now() <= data.expiresAt) {
                    return data;
                }
                else if (data) {
                    this.inMemoryStorage.delete(key);
                }
                return null;
            }
        }
        catch (error) {
            console.error('Error retrieving OTP:', error);
            const data = this.inMemoryStorage.get(key);
            return data && Date.now() <= data.expiresAt ? data : null;
        }
    }
    async delete(key) {
        try {
            if (this.useRedis && redis_1.redisClient.isOpen) {
                await redis_1.redisClient.del(key);
            }
            else {
                this.inMemoryStorage.delete(key);
            }
        }
        catch (error) {
            console.error('Error deleting OTP:', error);
            this.inMemoryStorage.delete(key);
        }
    }
    async getAllKeys() {
        try {
            if (this.useRedis && redis_1.redisClient.isOpen) {
                return await redis_1.redisClient.keys('*');
            }
            else {
                return Array.from(this.inMemoryStorage.keys());
            }
        }
        catch (error) {
            console.error('Error getting OTP keys:', error);
            return Array.from(this.inMemoryStorage.keys());
        }
    }
    cleanupExpired() {
        if (!this.useRedis) {
            const now = Date.now();
            for (const [key, data] of this.inMemoryStorage.entries()) {
                if (now > data.expiresAt) {
                    this.inMemoryStorage.delete(key);
                }
            }
        }
    }
}
exports.otpService = new OTPService();
//# sourceMappingURL=otpService.js.map
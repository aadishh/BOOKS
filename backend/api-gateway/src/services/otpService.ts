import { redisClient } from '../config/redis';
import { OTPData } from '../types';

class OTPService {
  private inMemoryStorage = new Map<string, OTPData>();
  private useRedis = true;

  constructor() {
    // Check if Redis is available
    this.checkRedisAvailability();
  }

  private async checkRedisAvailability(): Promise<void> {
    try {
      if (redisClient.isOpen) {
        await redisClient.ping();
        this.useRedis = true;
      } else {
        this.useRedis = false;
      }
    } catch (error) {
      console.log('Redis not available, using in-memory storage');
      this.useRedis = false;
    }
  }

  async set(key: string, data: OTPData): Promise<void> {
    try {
      if (this.useRedis && redisClient.isOpen) {
        // Store in Redis with TTL (time to live)
        const ttlSeconds = Math.ceil((data.expiresAt - Date.now()) / 1000);
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      } else {
        // Fallback to in-memory storage
        this.inMemoryStorage.set(key, data);
      }
    } catch (error) {
      console.error('Error storing OTP:', error);
      // Fallback to in-memory storage
      this.inMemoryStorage.set(key, data);
    }
  }

  async get(key: string): Promise<OTPData | null> {
    try {
      if (this.useRedis && redisClient.isOpen) {
        const data = await redisClient.get(key);
        if (data) {
          return JSON.parse(data) as OTPData;
        }
        return null;
      } else {
        // Use in-memory storage
        const data = this.inMemoryStorage.get(key);
        if (data && Date.now() <= data.expiresAt) {
          return data;
        } else if (data) {
          // Remove expired data
          this.inMemoryStorage.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Error retrieving OTP:', error);
      // Fallback to in-memory storage
      const data = this.inMemoryStorage.get(key);
      return data && Date.now() <= data.expiresAt ? data : null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && redisClient.isOpen) {
        await redisClient.del(key);
      } else {
        this.inMemoryStorage.delete(key);
      }
    } catch (error) {
      console.error('Error deleting OTP:', error);
      // Fallback to in-memory storage
      this.inMemoryStorage.delete(key);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.useRedis && redisClient.isOpen) {
        return await redisClient.keys('*');
      } else {
        return Array.from(this.inMemoryStorage.keys());
      }
    } catch (error) {
      console.error('Error getting OTP keys:', error);
      return Array.from(this.inMemoryStorage.keys());
    }
  }

  // Clean up expired OTPs (for in-memory storage)
  cleanupExpired(): void {
    if (!this.useRedis) {
      const now = Date.now();
      for (const [key, data] of this.inMemoryStorage.entries()) {
        if (now > data.expiresAt) {
          this.inMemoryStorage.delete(key);
        }
      }
    }
    // Redis handles TTL automatically, no cleanup needed
  }
}

export const otpService = new OTPService();
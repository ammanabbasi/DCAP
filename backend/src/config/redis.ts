import { createClient, RedisClientType } from 'redis';
import { config } from './env';
import logger from '../utils/logger';

export class RedisCache {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const redisUrl = config.redis.url || 
        `redis://${config.redis.password ? `:${config.redis.password}@` : ''}${config.redis.host}:${config.redis.port}`;

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxReconnectAttempts) {
              logger.error('Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            this.reconnectAttempts = retries;
            return Math.min(retries * 100, 3000);
          },
        },
      });

      // Event handlers
      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      this.client.on('reconnecting', () => {
        logger.info(`Redis Client Reconnecting (attempt ${this.reconnectAttempts})`);
      });

      // Connect to Redis
      await this.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      // Don't throw - allow app to run without cache
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Cache operations with graceful fallback
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DELETE error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Redis FLUSH error:', error);
      return false;
    }
  }

  // Pattern-based operations
  async deletePattern(pattern: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Redis DELETE PATTERN error for pattern ${pattern}:`, error);
      return false;
    }
  }

  // Cache helper methods
  async remember<T>(
    key: string, 
    ttl: number, 
    callback: () => Promise<T>
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Get fresh data
    const fresh = await callback();
    
    // Store in cache
    await this.set(key, fresh, ttl);
    
    return fresh;
  }

  // Health check
  async ping(): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  getStatus(): { connected: boolean; attempts: number } {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
const cache = new RedisCache();

// Cache key prefixes for organization
export const CacheKeys = {
  USER: 'user:',
  SESSION: 'session:',
  VEHICLE: 'vehicle:',
  LEAD: 'lead:',
  CUSTOMER: 'customer:',
  DEALERSHIP: 'dealership:',
  DOCUMENT: 'document:',
  TASK: 'task:',
  CONVERSATION: 'conversation:',
  TRANSACTION: 'transaction:',
  API_RESPONSE: 'api:',
  RATE_LIMIT: 'rate_limit:',
};

// TTL values (in seconds)
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400,    // 24 hours
  SESSION: 86400,      // 24 hours
  REFRESH_TOKEN: 604800, // 7 days
};

export default cache;
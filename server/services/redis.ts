import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { gzip, ungzip } from 'node-gzip';
import { createClient } from 'redis';

interface CacheMetrics {
  hits: number;
  misses: number;
  lastReset: Date;
  errors: number;
  retries: number;
}

interface MemoryUsage {
  used: number;
  peak: number;
  total: number;
  fragmentation: number;
}

interface EvictionPolicy {
  maxMemory: number;
  maxKeys: number;
  strategy: string;
}

interface CacheConfig {
  ttl: number;
  compressionThreshold: number;
  maxRetries: number;
  retryDelay: number;
  maxMemory: number;
  maxKeys: number;
  evictionStrategy: string;
}

export class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    lastReset: new Date(),
    errors: 0,
    retries: 0
  };
  private readonly config: CacheConfig = {
    ttl: 3600, // 1 hour in seconds
    compressionThreshold: 1024, // 1KB
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    maxMemory: 1024 * 1024 * 1024, // 1GB
    maxKeys: 10000,
    evictionStrategy: 'allkeys-lru'
  };
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
    });
    
    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.setupEventListeners();
    this.setupEvictionPolicy();
  }

  private setupEventListeners(): void {
    this.client.on('error', (error: Error) => {
      this.metrics.errors++;
      logger.error('Redis connection error:', error);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Successfully connected to Redis');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client is ready to accept commands');
      this.isConnected = true;
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis connection ended');
    });
  }

  private async setupEvictionPolicy(): Promise<void> {
    try {
      await this.withRetry(async () => {
        await this.client.config('SET', 'maxmemory', this.config.maxMemory.toString());
        await this.client.config('SET', 'maxmemory-policy', this.config.evictionStrategy);
        await this.client.config('SET', 'maxmemory-samples', '10');
        logger.info('Cache eviction policy configured:', {
          maxMemory: this.config.maxMemory,
          strategy: this.config.evictionStrategy
        });
      });
    } catch (error) {
      logger.error('Error setting up eviction policy:', error);
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private async ensureConnection(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      if (!this.isConnected) {
        try {
          await this.client.connect();
          this.isConnected = true;
          logger.info('Successfully connected to Redis');
        } catch (error) {
          this.metrics.errors++;
          logger.error('Failed to connect to Redis:', error);
          throw error;
        }
      }
    })();

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let i = 0; i < this.config.maxRetries; i++) {
      try {
        await this.ensureConnection();
        return await operation();
      } catch (error) {
        this.metrics.retries++;
        if (i === this.config.maxRetries - 1) {
          this.metrics.errors++;
          throw error;
        }
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * Math.pow(2, i))
        );
      }
    }
    throw new Error('Max retries exceeded');
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis incr error:', error);
      return 0;
    }
  }

  public async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis expire error:', error);
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis ttl error:', error);
      return -1;
    }
  }

  public async delete(key: string): Promise<void> {
    return this.withRetry(async () => {
      await this.client.del(key);
    });
  }

  public async deletePattern(pattern: string): Promise<void> {
    return this.withRetry(async () => {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    });
  }

  public async invalidateByPrefix(prefix: string): Promise<void> {
    return this.deletePattern(`${prefix}:*`);
  }

  public async exists(key: string): Promise<boolean> {
    return this.withRetry(async () => {
      const result = await this.client.exists(key);
      return result === 1;
    });
  }

  public async clear(): Promise<void> {
    return this.withRetry(async () => {
      await this.client.flushall();
    });
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Disconnected from Redis');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.withRetry(async () => {
        await this.client.ping();
      });
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  public async getMemoryUsage(): Promise<MemoryUsage | null> {
    return this.withRetry(async () => {
      const info = await this.client.info('memory');
      const lines = info.split('\n');
      const memoryInfo: Record<string, number> = {};

      lines.forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          memoryInfo[key.trim()] = parseInt(value.trim());
        }
      });

      return {
        used: memoryInfo['used_memory'] || 0,
        peak: memoryInfo['used_memory_peak'] || 0,
        total: memoryInfo['total_system_memory'] || 0,
        fragmentation: memoryInfo['mem_fragmentation_ratio'] || 0
      };
    });
  }

  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      lastReset: new Date(),
      errors: 0,
      retries: 0
    };
  }

  public getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? this.metrics.hits / total : 0;
  }

  public async getEvictionPolicy(): Promise<EvictionPolicy | null> {
    return this.withRetry(async () => {
      const maxMemoryConfig = await this.client.config('GET', 'maxmemory');
      const strategyConfig = await this.client.config('GET', 'maxmemory-policy');

      const maxMemoryValue = (maxMemoryConfig as [string, string])[1];
      const strategyValue = (strategyConfig as [string, string])[1];

      return {
        maxMemory: parseInt(maxMemoryValue),
        maxKeys: this.config.maxKeys,
        strategy: strategyValue as EvictionPolicy['strategy']
      };
    });
  }

  public async updateEvictionPolicy(policy: Partial<EvictionPolicy>): Promise<void> {
    return this.withRetry(async () => {
      if (policy.maxMemory !== undefined) {
        await this.client.config('SET', 'maxmemory', policy.maxMemory.toString());
      }
      if (policy.strategy !== undefined) {
        await this.client.config('SET', 'maxmemory-policy', policy.strategy);
      }
      logger.info('Cache eviction policy updated:', policy);
    });
  }

  public async checkMemoryUsage(): Promise<void> {
    const memoryInfo = await this.getMemoryUsage();
    if (memoryInfo && memoryInfo.used > memoryInfo.total * 0.8) {
      logger.warn('Redis memory usage is high, triggering cleanup');
      await this.cleanupExpiredKeys();
    }
  }

  private async cleanupExpiredKeys(): Promise<void> {
    await this.withRetry(async () => {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'COUNT',
          '1000'
        );
        cursor = nextCursor;
        
        if (keys.length > 0) {
          const pipeline = this.client.pipeline();
          keys.forEach(key => {
            pipeline.ttl(key);
          });
          
          const results = await pipeline.exec();
          if (results) {
            const expiredKeys = keys.filter((_, index) => 
              results[index] && results[index][1] === -1
            );
            
            if (expiredKeys.length > 0) {
              await this.client.del(...expiredKeys);
            }
          }
        }
      } while (cursor !== '0');
    });
  }

  /**
   * Increment a key by a specific amount
   */
  public async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      logger.error('Error incrementing Redis key:', error);
      throw error;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis keys error:', error);
      return [];
    }
  }

  public async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lpush(key, value);
    } catch (error) {
      logger.error('Redis lpush error:', error);
      throw error;
    }
  }

  public async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.client.ltrim(key, start, stop);
    } catch (error) {
      logger.error('Redis ltrim error:', error);
      throw error;
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      logger.error('Redis lrange error:', error);
      return [];
    }
  }
} 
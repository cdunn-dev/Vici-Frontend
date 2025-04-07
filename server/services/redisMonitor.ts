import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

export interface RedisStats {
  timestamp: Date;
  connected: boolean;
  memoryUsage: {
    used: number;
    total: number;
  };
  cacheMetrics: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  evictionPolicy: string;
}

export class RedisMonitor {
  private static instance: RedisMonitor;
  private redis: Redis;
  private stats: RedisStats[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MAX_STATS = 100; // Keep last 100 stats

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });
  }

  public static getInstance(): RedisMonitor {
    if (!RedisMonitor.instance) {
      RedisMonitor.instance = new RedisMonitor();
    }
    return RedisMonitor.instance;
  }

  public start(): void {
    this.startMonitoring();
  }

  public stop(): void {
    this.stopMonitoring();
  }

  public getMetrics(): RedisStats {
    const latestStats = this.getLatestStats();
    if (!latestStats) {
      return {
        timestamp: new Date(),
        connected: false,
        memoryUsage: { used: 0, total: 0 },
        cacheMetrics: { hits: 0, misses: 0, hitRate: 0 },
        evictionPolicy: ''
      };
    }
    return latestStats;
  }

  public startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      logger.warn('Redis monitoring is already running');
      return;
    }

    logger.info(`Starting Redis monitoring (interval: ${intervalMs}ms)`);
    
    this.monitoringInterval = setInterval(async () => {
      await this.collectStats();
    }, intervalMs);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Redis monitoring stopped');
    }
  }

  private async collectStats(): Promise<void> {
    try {
      const connected = await this.redis.ping() === 'PONG';
      const info = await this.redis.info();
      const memoryInfo = info.split('\n').find(line => line.startsWith('used_memory:'))?.split(':')[1];
      const totalMemoryInfo = info.split('\n').find(line => line.startsWith('maxmemory:'))?.split(':')[1];
      const hitsInfo = info.split('\n').find(line => line.startsWith('keyspace_hits:'))?.split(':')[1];
      const missesInfo = info.split('\n').find(line => line.startsWith('keyspace_misses:'))?.split(':')[1];
      const evictionPolicyInfo = info.split('\n').find(line => line.startsWith('maxmemory-policy:'))?.split(':')[1];

      const memoryUsage = {
        used: parseInt(memoryInfo || '0', 10),
        total: parseInt(totalMemoryInfo || '0', 10)
      };

      const hits = parseInt(hitsInfo || '0', 10);
      const misses = parseInt(missesInfo || '0', 10);
      const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0;

      const stats: RedisStats = {
        timestamp: new Date(),
        connected,
        memoryUsage,
        cacheMetrics: {
          hits,
          misses,
          hitRate
        },
        evictionPolicy: evictionPolicyInfo?.trim() || 'noeviction'
      };

      this.stats.push(stats);
      
      // Keep only the last MAX_STATS
      if (this.stats.length > this.MAX_STATS) {
        this.stats = this.stats.slice(-this.MAX_STATS);
      }

      // Log warnings if needed
      if (memoryUsage.used > memoryUsage.total * 0.8) {
        logger.warn(`Redis memory usage is high: ${(memoryUsage.used / memoryUsage.total * 100).toFixed(2)}%`);
      }

      if (hitRate < 0.7) {
        logger.warn(`Redis cache hit rate is low: ${(hitRate * 100).toFixed(2)}%`);
      }

      if (!connected) {
        logger.error('Redis connection is down');
      }
    } catch (error) {
      logger.error('Error collecting Redis stats:', error);
    }
  }

  public getStats(): RedisStats[] {
    return [...this.stats];
  }

  public getLatestStats(): RedisStats | null {
    return this.stats.length > 0 ? this.stats[this.stats.length - 1] : null;
  }

  public getAverageHitRate(): number {
    if (this.stats.length === 0) return 0;
    
    const totalHitRate = this.stats.reduce((sum, stat) => sum + stat.cacheMetrics.hitRate, 0);
    return totalHitRate / this.stats.length;
  }

  public getMemoryUsageTrend(): { increasing: boolean; percentage: number } {
    if (this.stats.length < 2) return { increasing: false, percentage: 0 };
    
    const latest = this.stats[this.stats.length - 1];
    const previous = this.stats[this.stats.length - 2];
    
    if (!latest.memoryUsage || !previous.memoryUsage) {
      return { increasing: false, percentage: 0 };
    }
    
    const increase = latest.memoryUsage.used - previous.memoryUsage.used;
    const percentage = (increase / previous.memoryUsage.used) * 100;
    
    return {
      increasing: increase > 0,
      percentage
    };
  }
} 
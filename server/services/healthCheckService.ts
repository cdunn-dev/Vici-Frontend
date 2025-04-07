import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { RedisService } from './redis';
import { ShardingService } from './sharding';
import { RedisMonitor } from './redisMonitor';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  details: any;
}

export interface HealthCheckConfig {
  checkInterval: number;
  timeout: number;
  retryCount: number;
  retryDelay: number;
}

export class HealthCheckService extends EventEmitter {
  private static instance: HealthCheckService;
  private config: HealthCheckConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private pool: Pool;
  private redisService: RedisService;
  private shardingService: ShardingService;
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date }> = new Map();

  private constructor(config: HealthCheckConfig, pool: Pool) {
    super();
    this.config = config;
    this.pool = pool;
    this.redisService = RedisService.getInstance();
    this.shardingService = ShardingService.getInstance();
  }

  public static getInstance(config: HealthCheckConfig, pool: Pool): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService(config, pool);
    }
    return HealthCheckService.instance;
  }

  public async start(): Promise<void> {
    if (this.checkInterval) {
      logger.warn('Health checks are already running');
      return;
    }

    this.checkInterval = setInterval(async () => {
      await this.runHealthChecks();
    }, this.config.checkInterval);

    logger.info('Health check service started');
  }

  public async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('Health check service stopped');
  }

  private async runHealthChecks(): Promise<void> {
    const results: HealthCheckResult[] = [];

    // Check database health
    const dbHealth = await this.checkDatabaseHealth();
    results.push(dbHealth);

    // Check Redis health
    const redisHealth = await this.checkRedisHealth();
    results.push(redisHealth);

    // Check sharding service health
    const shardingHealth = await this.checkShardingHealth();
    results.push(shardingHealth);

    // Emit results
    this.emit('healthCheck', results);

    // Check for any unhealthy services
    const unhealthyServices = results.filter(r => r.status === 'unhealthy');
    if (unhealthyServices.length > 0) {
      this.emit('unhealthy', unhealthyServices);
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let details: any = {};

    try {
      const client = await this.pool.connect();
      try {
        // Check basic connectivity
        await client.query('SELECT 1');

        // Get database stats
        const stats = await client.query(`
          SELECT 
            count(*) as active_connections,
            sum(case when state = 'idle' then 1 else 0 end) as idle_connections,
            sum(case when state = 'active' then 1 else 0 end) as active_connections
          FROM pg_stat_activity
          WHERE datname = current_database()
        `);

        details = {
          activeConnections: parseInt(stats.rows[0].active_connections),
          idleConnections: parseInt(stats.rows[0].idle_connections),
          responseTime: Date.now() - startTime
        };

        // Check for potential issues
        if (details.activeConnections > this.pool.options.max * 0.8) {
          status = 'degraded';
        }
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      status = 'unhealthy';
      details = { error: error instanceof Error ? error.message : String(error) };
      if (error instanceof Error) {
        this.updateCircuitBreaker('database', error);
      }
    }

    return {
      service: 'database',
      status,
      timestamp: new Date(),
      details
    };
  }

  private async checkRedisHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let details: any = {};

    try {
      // Use healthCheck method instead of directly accessing the client
      const isHealthy = await this.redisService.healthCheck();
      if (!isHealthy) {
        throw new Error('Redis health check failed');
      }

      // Get Redis info through the RedisMonitor
      const redisMonitor = RedisMonitor.getInstance();
      const stats = redisMonitor.getLatestStats();
      
      if (!stats) {
        throw new Error('Failed to get Redis stats');
      }

      details = {
        memoryUsage: stats.memoryUsage,
        cacheMetrics: stats.cacheMetrics,
        responseTime: Date.now() - startTime
      };

      // Check for potential issues
      if (stats.memoryUsage.used > stats.memoryUsage.total * 0.8) {
        status = 'degraded';
      }
    } catch (error: unknown) {
      status = 'unhealthy';
      details = { error: error instanceof Error ? error.message : String(error) };
      if (error instanceof Error) {
        this.updateCircuitBreaker('redis', error);
      }
    }

    return {
      service: 'redis',
      status,
      timestamp: new Date(),
      details
    };
  }

  private async checkShardingHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let details: any = {};

    try {
      const health = await this.shardingService.healthCheck();
      const unhealthyShards = Array.from(health.entries())
        .filter(([_, isHealthy]) => !isHealthy)
        .map(([shardId]) => shardId);

      details = {
        totalShards: health.size,
        unhealthyShards,
        responseTime: Date.now() - startTime
      };

      if (unhealthyShards.length > 0) {
        status = unhealthyShards.length > health.size / 2 ? 'unhealthy' : 'degraded';
      }
    } catch (error: unknown) {
      status = 'unhealthy';
      details = { error: error instanceof Error ? error.message : String(error) };
      if (error instanceof Error) {
        this.updateCircuitBreaker('sharding', error);
      }
    }

    return {
      service: 'sharding',
      status,
      timestamp: new Date(),
      details
    };
  }

  private updateCircuitBreaker(service: string, error: Error): void {
    const now = new Date();
    const breaker = this.circuitBreakers.get(service) || { failures: 0, lastFailure: now };
    
    breaker.failures++;
    breaker.lastFailure = now;

    // Reset failures if enough time has passed
    if (now.getTime() - breaker.lastFailure.getTime() > this.config.retryDelay) {
      breaker.failures = 0;
    }

    this.circuitBreakers.set(service, breaker);

    // Check if circuit should be opened
    if (breaker.failures >= this.config.retryCount) {
      this.emit('circuitOpen', {
        service,
        failures: breaker.failures,
        lastFailure: breaker.lastFailure
      });
    }
  }

  public getCircuitBreakerStatus(service: string): { failures: number; lastFailure: Date } | undefined {
    return this.circuitBreakers.get(service);
  }
} 
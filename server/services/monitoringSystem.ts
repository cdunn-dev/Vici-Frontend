import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { RedisMonitor } from './redisMonitor';
import { logger } from '../utils/logger';
import { ShardingService, ShardingConfig } from './sharding';
import { performance } from 'perf_hooks';
import { RedisService } from './redis';
import { pool } from '../db/index';

export interface QueryMetrics {
  query: string;
  params: any[];
  duration: number;
  timestamp: Date;
  rowsAffected?: number;
  error?: string;
  executionPlan?: string;
}

export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  maxConnections: number;
  totalQueries: number;
  slowQueries: number;
  avgQueryTime: number;
  latencyPercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  connectionPoolUtilization: number;
  timestamp: Date;
}

export interface ApplicationMetrics {
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  activeRequests: number;
  timestamp: Date;
}

export interface PerformanceAlert {
  type: 'query' | 'database' | 'application' | 'shard' | 'cache';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details: any;
  timestamp: Date;
  alertId: string;
  lastAlerted?: Date;
}

export interface MonitoringSystemConfig {
  updateInterval: number;
  retentionPeriod: number;
  alertThresholds: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
    errorRate: number;
    loadPercentage: number;
    slowQueryThreshold: number;
  };
  notificationChannels: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
}

export interface SystemMetrics {
  timestamp: Date;
  application: ApplicationMetrics;
  database: DatabaseMetrics;
  cache: {
    hitRate: number;
    memoryUsage: {
      used: number;
      total: number;
    };
    evictionCount: number;
    connectedClients: number;
    totalCommands: number;
    opsPerSecond: number;
  };
  shards: {
    totalShards: number;
    avgLoadPercentage: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export class MonitoringSystem extends EventEmitter {
  private static instance: MonitoringSystem;
  private config: MonitoringSystemConfig;
  private redisMonitor: RedisMonitor;
  private metrics: SystemMetrics[] = [];
  private queryMetrics: QueryMetrics[] = [];
  private performanceAlerts: Map<string, PerformanceAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private shardingService: ShardingService;
  private redisService: RedisService;
  private pool: Pool;
  private alertThrottle: Map<string, number> = new Map();

  private constructor(config: MonitoringSystemConfig) {
    super();
    this.config = config;
    this.pool = pool;
    this.redisService = RedisService.getInstance();
    this.redisMonitor = RedisMonitor.getInstance();
    
    // Initialize sharding service
    this.shardingService = ShardingService.getInstance();
    const shardingConfig: ShardingConfig = {
      shards: [
        {
          id: 0,
          host: 'localhost',
          port: 5432,
          database: 'vici',
          user: 'postgres',
          password: 'postgres'
        }
      ],
      shardCount: 1,
      defaultShard: 0,
      strategy: 'modulo'
    };
    this.shardingService.initialize(shardingConfig);
  }

  public static getInstance(config?: MonitoringSystemConfig): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      MonitoringSystem.instance = new MonitoringSystem(config);
    }
    return MonitoringSystem.instance;
  }

  public async start(): Promise<void> {
    if (this.monitoringInterval) {
      logger.warn('Monitoring system is already running');
      return;
    }

    try {
      // Start collecting metrics
      this.monitoringInterval = setInterval(async () => {
        await this.collectSystemMetrics();
        this.cleanupOldMetrics();
        await this.checkAlerts(this.getLatestMetrics()!);
      }, this.config.updateInterval);

      // Start Redis monitoring
      await this.redisMonitor.start();

      logger.info('Monitoring system started successfully');
    } catch (error) {
      logger.error('Failed to start monitoring system:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    await this.redisMonitor.stop();
    logger.info('Monitoring system stopped');
  }

  public trackQuery(query: string, params: any[], startTime: number): void {
    const duration = performance.now() - startTime;
    const timestamp = new Date();
    
    const metric: QueryMetrics = {
      query,
      params,
      duration,
      timestamp
    };
    
    this.queryMetrics.push(metric);
    
    // Check if this is a slow query
    if (duration > this.config.alertThresholds.slowQueryThreshold) {
      this.addPerformanceAlert({
        type: 'query',
        severity: 'warning',
        message: `Slow query detected: ${duration.toFixed(2)}ms`,
        details: { query, params, duration },
        timestamp,
        alertId: 'query-warning'
      });
      
      logger.warn(`Slow query detected: ${duration.toFixed(2)}ms`, {
        query,
        params,
        duration
      });
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Collect application metrics
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const applicationMetrics: ApplicationMetrics = {
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss
        },
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        activeRequests: this.getActiveRequestCount(),
        timestamp: new Date()
      };

      // Collect database metrics
      const client = await this.pool.connect();
      let databaseMetrics: DatabaseMetrics;
      
      try {
        // Get connection pool stats
        const poolStats = this.pool.totalCount;
        const idleCount = this.pool.idleCount;
        const waitingCount = this.pool.waitingCount;
        
        // Get database stats
        const dbStats = await client.query(`
          SELECT 
            sum(xact_commit + xact_rollback) as total_transactions,
            sum(blks_read) as blocks_read,
            sum(blks_hit) as blocks_hit,
            sum(tup_returned) as rows_returned,
            sum(tup_fetched) as rows_fetched,
            sum(tup_inserted) as rows_inserted,
            sum(tup_updated) as rows_updated,
            sum(tup_deleted) as rows_deleted
          FROM pg_stat_database
          WHERE datname = current_database()
        `);
        
        // Calculate metrics
        const totalQueries = this.queryMetrics.length;
        const slowQueries = this.queryMetrics.filter(
          m => m.duration > this.config.alertThresholds.slowQueryThreshold
        ).length;
        const avgQueryTime = totalQueries > 0 
          ? this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries 
          : 0;

        // Calculate latency percentiles
        const sortedDurations = this.queryMetrics
          .map(m => m.duration)
          .sort((a, b) => a - b);
        
        const getPercentile = (p: number) => {
          const index = Math.floor((p / 100) * sortedDurations.length);
          return sortedDurations[index] || 0;
        };

        const latencyPercentiles = {
          p50: getPercentile(50),
          p90: getPercentile(90),
          p95: getPercentile(95),
          p99: getPercentile(99)
        };

        // Calculate connection pool utilization
        const connectionPoolUtilization = (poolStats - idleCount) / this.pool.options.max;
        
        databaseMetrics = {
          activeConnections: poolStats - idleCount,
          idleConnections: idleCount,
          waitingConnections: waitingCount,
          maxConnections: this.pool.options.max,
          totalQueries,
          slowQueries,
          avgQueryTime,
          latencyPercentiles,
          connectionPoolUtilization,
          timestamp: new Date()
        };

        // Check for high latency queries
        if (latencyPercentiles.p95 > this.config.alertThresholds.responseTime) {
          this.addPerformanceAlert({
            type: 'database',
            severity: 'warning',
            message: `High query latency detected (p95: ${latencyPercentiles.p95.toFixed(2)}ms)`,
            details: { latencyPercentiles },
            timestamp: new Date(),
            alertId: 'high-latency'
          });
        }

        // Check for connection pool saturation
        if (connectionPoolUtilization > 0.8) {
          this.addPerformanceAlert({
            type: 'database',
            severity: 'warning',
            message: `High connection pool utilization: ${(connectionPoolUtilization * 100).toFixed(2)}%`,
            details: {
              active: poolStats - idleCount,
              idle: idleCount,
              waiting: waitingCount,
              max: this.pool.options.max
            },
            timestamp: new Date(),
            alertId: 'pool-saturation'
          });
        }
      } finally {
        client.release();
      }

      // Collect cache metrics from Redis monitor
      const latestStats = this.redisMonitor.getLatestStats();
      const cacheMetrics = {
        hitRate: latestStats?.cacheMetrics.hitRate || 0,
        memoryUsage: latestStats?.memoryUsage || { used: 0, total: 0 },
        evictions: 0, // TODO: Implement eviction tracking
        connectedClients: 0, // TODO: Implement client tracking
        totalCommands: 0, // TODO: Implement command tracking
        opsPerSecond: 0 // TODO: Implement OPS tracking
      };

      // Collect shard metrics
      const shardMetrics = await this.shardingService.getMetrics();
      const totalShards = this.shardingService.getShardCount();
      const avgLoadPercentage = Array.from(shardMetrics.values())
        .reduce((sum, m) => sum + m.loadPercentage, 0) / totalShards;

      // Combine all metrics
      const systemMetrics: SystemMetrics = {
        timestamp: new Date(),
        application: applicationMetrics,
        database: databaseMetrics,
        cache: {
          hitRate: cacheMetrics.hitRate,
          memoryUsage: cacheMetrics.memoryUsage,
          evictionCount: cacheMetrics.evictions,
          connectedClients: cacheMetrics.connectedClients,
          totalCommands: cacheMetrics.totalCommands,
          opsPerSecond: cacheMetrics.opsPerSecond
        },
        shards: {
          totalShards,
          avgLoadPercentage,
          avgResponseTime: 0, // TODO: Implement shard response time tracking
          errorRate: 0 // TODO: Implement shard error tracking
        }
      };

      this.metrics.push(systemMetrics);

      // Store in Redis for real-time monitoring
      await this.redisService.set('system:metrics', JSON.stringify(systemMetrics), 300);

    } catch (error) {
      logger.error('Error collecting system metrics:', error);
      this.addPerformanceAlert({
        type: 'application',
        severity: 'error',
        message: 'Failed to collect system metrics',
        details: error,
        timestamp: new Date(),
        alertId: 'system-error'
      });
    }
  }

  private cleanupOldMetrics(): void {
    const retentionTime = Date.now() - this.config.retentionPeriod;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > retentionTime);
    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp.getTime() > retentionTime);
    
    // Clean up old alerts
    for (const [alertId, alert] of this.performanceAlerts) {
      if (alert.timestamp.getTime() <= retentionTime) {
        this.performanceAlerts.delete(alertId);
      }
    }
  }

  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];
    const { alertThresholds } = this.config;

    // Check CPU usage with severity levels
    const cpuUsage = metrics.application.cpuUsage.system;
    if (cpuUsage > alertThresholds.cpuUsage) {
      const severity = cpuUsage > 90 ? 'critical' : cpuUsage > 80 ? 'error' : 'warning';
      alerts.push({
        type: 'application',
        severity,
        message: `High CPU usage: ${cpuUsage}%`,
        details: metrics.application.cpuUsage,
        timestamp: new Date(),
        alertId: `cpu-${severity}`
      });
    }

    // Check memory usage with severity levels
    const memoryUsagePercent = metrics.application.memoryUsage.heapUsed / metrics.application.memoryUsage.heapTotal;
    if (memoryUsagePercent > alertThresholds.memoryUsage) {
      const severity = memoryUsagePercent > 0.9 ? 'critical' : memoryUsagePercent > 0.8 ? 'error' : 'warning';
      alerts.push({
        type: 'application',
        severity,
        message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`,
        details: metrics.application.memoryUsage,
        timestamp: new Date(),
        alertId: `memory-${severity}`
      });
    }

    // Check database connection usage with severity levels
    const connectionUsagePercent = metrics.database.activeConnections / metrics.database.maxConnections;
    if (connectionUsagePercent > 0.8) {
      const severity = connectionUsagePercent > 0.95 ? 'critical' : connectionUsagePercent > 0.9 ? 'error' : 'warning';
      alerts.push({
        type: 'database',
        severity,
        message: `High connection usage: ${(connectionUsagePercent * 100).toFixed(2)}%`,
        details: {
          active: metrics.database.activeConnections,
          max: metrics.database.maxConnections
        },
        timestamp: new Date(),
        alertId: `connections-${severity}`
      });
    }

    // Check cache metrics with severity levels
    if (metrics.cache.hitRate < 0.8) {
      const severity = metrics.cache.hitRate < 0.5 ? 'critical' : metrics.cache.hitRate < 0.6 ? 'error' : 'warning';
      alerts.push({
        type: 'cache',
        severity,
        message: `Low cache hit rate: ${(metrics.cache.hitRate * 100).toFixed(2)}%`,
        details: {
          hitRate: metrics.cache.hitRate,
          evictions: metrics.cache.evictionCount
        },
        timestamp: new Date(),
        alertId: `cache-${severity}`
      });
    }

    // Check shard metrics with severity levels
    if (metrics.shards.avgLoadPercentage > alertThresholds.loadPercentage) {
      const severity = metrics.shards.avgLoadPercentage > 0.9 ? 'critical' : metrics.shards.avgLoadPercentage > 0.8 ? 'error' : 'warning';
      alerts.push({
        type: 'shard',
        severity,
        message: `High average shard load: ${(metrics.shards.avgLoadPercentage * 100).toFixed(2)}%`,
        details: metrics.shards,
        timestamp: new Date(),
        alertId: `shard-${severity}`
      });
    }

    // Process alerts with throttling
    alerts.forEach(alert => {
      const lastAlerted = this.alertThrottle.get(alert.alertId);
      const now = Date.now();
      const throttleInterval = this.getThrottleInterval(alert.severity);

      if (!lastAlerted || (now - lastAlerted) > throttleInterval) {
        this.addPerformanceAlert(alert);
        this.emit('alert', alert);
        this.alertThrottle.set(alert.alertId, now);
      }
    });
  }

  private getThrottleInterval(severity: PerformanceAlert['severity']): number {
    switch (severity) {
      case 'critical': return 5 * 60 * 1000; // 5 minutes
      case 'error': return 15 * 60 * 1000; // 15 minutes
      case 'warning': return 30 * 60 * 1000; // 30 minutes
      case 'info': return 60 * 60 * 1000; // 1 hour
      default: return 30 * 60 * 1000;
    }
  }

  private addPerformanceAlert(alert: PerformanceAlert): void {
    this.performanceAlerts.set(alert.alertId, alert);
  }

  private getActiveRequestCount(): number {
    // TODO: Implement request counting
    return 0;
  }

  public getMetrics(timeRange?: { start: Date; end: Date }): SystemMetrics[] {
    if (!timeRange) {
      return this.metrics;
    }
    return this.metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  public getLatestMetrics(): SystemMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getQueryMetrics(): QueryMetrics[] {
    return this.queryMetrics;
  }

  public getPerformanceAlerts(): PerformanceAlert[] {
    return Array.from(this.performanceAlerts.values());
  }
} 
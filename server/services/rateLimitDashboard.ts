import { EventEmitter } from 'events';
import { RateLimitMonitoringService } from './rateLimitMonitoringService';
import { MonitoringService } from './monitoring';
import { logger } from '../utils/logger';

export interface RateLimitDashboardConfig {
  updateInterval: number;
  retentionPeriod: number;
  alertThresholds: {
    rateLimitHits: number;
    latency: number;
    errorRate: number;
  };
}

export interface RateLimitDashboardData {
  timestamp: Date;
  metrics: {
    totalRequests: number;
    rateLimitedRequests: number;
    rateLimitHits: number;
    rateLimitMisses: number;
    averageLatency: number;
    byTier: {
      [tier: string]: {
        requests: number;
        rateLimited: number;
        hits: number;
        misses: number;
        averageLatency: number;
      };
    };
    byIdentifier: {
      [identifier: string]: {
        requests: number;
        rateLimited: number;
        hits: number;
        misses: number;
        averageLatency: number;
      };
    };
  };
  alerts: {
    highRateLimitHits: boolean;
    highLatency: boolean;
    highErrorRate: boolean;
  };
  trends: {
    requestsPerMinute: number[];
    rateLimitHitsPerMinute: number[];
    averageLatencyPerMinute: number[];
  };
}

export class RateLimitDashboard extends EventEmitter {
  private static instance: RateLimitDashboard;
  private config: RateLimitDashboardConfig;
  private rateLimitMonitoringService: RateLimitMonitoringService;
  private monitoringService: MonitoringService;
  private updateInterval: NodeJS.Timeout | null = null;
  private dashboardData: RateLimitDashboardData[] = [];

  private constructor(
    rateLimitMonitoringService: RateLimitMonitoringService,
    monitoringService: MonitoringService,
    config: RateLimitDashboardConfig
  ) {
    super();
    this.config = config;
    this.rateLimitMonitoringService = rateLimitMonitoringService;
    this.monitoringService = monitoringService;
  }

  public static getInstance(
    rateLimitMonitoringService: RateLimitMonitoringService,
    monitoringService: MonitoringService,
    config?: Partial<RateLimitDashboardConfig>
  ): RateLimitDashboard {
    if (!RateLimitDashboard.instance) {
      const defaultConfig: RateLimitDashboardConfig = {
        updateInterval: 1000, // 1 second
        retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
        alertThresholds: {
          rateLimitHits: 0.1, // 10% rate limit hits
          latency: 1000, // 1 second
          errorRate: 0.01 // 1% error rate
        }
      };

      RateLimitDashboard.instance = new RateLimitDashboard(
        rateLimitMonitoringService,
        monitoringService,
        { ...defaultConfig, ...config }
      );
    }
    return RateLimitDashboard.instance;
  }

  public async start(): Promise<void> {
    try {
      logger.info('Starting rate limit dashboard');

      // Initial data collection
      await this.collectDashboardData();

      // Set up periodic updates
      this.updateInterval = setInterval(
        () => this.collectDashboardData(),
        this.config.updateInterval
      );

      // Subscribe to rate limit monitoring events
      this.rateLimitMonitoringService.on('metrics', (metrics) => {
        this.updateDashboardData(metrics);
      });

      this.rateLimitMonitoringService.on('alert', (alert) => {
        this.handleAlert(alert);
      });

      logger.info('Rate limit dashboard started successfully');
    } catch (error) {
      logger.error('Failed to start rate limit dashboard:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    logger.info('Stopping rate limit dashboard');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Unsubscribe from events
    this.rateLimitMonitoringService.removeAllListeners('metrics');
    this.rateLimitMonitoringService.removeAllListeners('alert');

    logger.info('Rate limit dashboard stopped');
  }

  private async collectDashboardData(): Promise<void> {
    try {
      const metrics = this.rateLimitMonitoringService.getMetrics();
      if (metrics.length > 0) {
        const latestMetrics = metrics[metrics.length - 1];
        this.updateDashboardData(latestMetrics);
      }
    } catch (error) {
      logger.error('Failed to collect dashboard data:', error);
    }
  }

  private updateDashboardData(metrics: any): void {
    const timestamp = new Date();
    const alerts = this.checkAlerts(metrics);
    const trends = this.calculateTrends();

    const dashboardData: RateLimitDashboardData = {
      timestamp,
      metrics,
      alerts,
      trends
    };

    this.dashboardData.push(dashboardData);
    this.emit('update', dashboardData);

    // Clean up old data
    this.cleanupOldData();
  }

  private checkAlerts(metrics: any): RateLimitDashboardData['alerts'] {
    const hitRate = metrics.totalRequests > 0 ? metrics.rateLimitHits / metrics.totalRequests : 0;
    const errorRate = metrics.totalRequests > 0 ? metrics.rateLimitedRequests / metrics.totalRequests : 0;

    return {
      highRateLimitHits: hitRate > this.config.alertThresholds.rateLimitHits,
      highLatency: metrics.averageLatency > this.config.alertThresholds.latency,
      highErrorRate: errorRate > this.config.alertThresholds.errorRate
    };
  }

  private calculateTrends(): RateLimitDashboardData['trends'] {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentData = this.dashboardData.filter(d => d.timestamp >= oneMinuteAgo);

    return {
      requestsPerMinute: recentData.map(d => d.metrics.totalRequests),
      rateLimitHitsPerMinute: recentData.map(d => d.metrics.rateLimitHits),
      averageLatencyPerMinute: recentData.map(d => d.metrics.averageLatency)
    };
  }

  private handleAlert(alert: any): void {
    logger.warn('Rate limit alert:', alert);
    this.emit('alert', alert);
  }

  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriod);
    this.dashboardData = this.dashboardData.filter(d => d.timestamp >= cutoffTime);
  }

  public getDashboardData(): RateLimitDashboardData[] {
    return this.dashboardData;
  }

  public getLatestDashboardData(): RateLimitDashboardData | null {
    return this.dashboardData.length > 0 ? this.dashboardData[this.dashboardData.length - 1] : null;
  }
} 
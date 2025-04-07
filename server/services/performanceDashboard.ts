import { PerformanceMonitoringService, PerformanceMetrics, PerformanceAlert } from './performanceMonitoringService';
import { RedisService } from './redis';
import { logger } from '../utils/logger';

export interface PerformanceDashboardConfig {
  updateInterval: number;
  retentionPeriod: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface EndpointPerformanceSummary {
  endpoint: string;
  method: string;
  totalRequests: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errorCount: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface SystemPerformanceSummary {
  timestamp: Date;
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    percentage: number;
  };
  cpuUsage: {
    user: number;
    system: number;
    total: number;
  };
  activeAlerts: number;
  topSlowEndpoints: EndpointPerformanceSummary[];
  topErrorEndpoints: EndpointPerformanceSummary[];
}

export class PerformanceDashboard {
  private static instance: PerformanceDashboard;
  private config: PerformanceDashboardConfig;
  private performanceService: PerformanceMonitoringService;
  private redisService: RedisService;
  private updateInterval: NodeJS.Timeout | null = null;
  private endpointSummaries: Map<string, EndpointPerformanceSummary> = new Map();
  private systemSummary: SystemPerformanceSummary | null = null;

  private constructor(config: PerformanceDashboardConfig) {
    this.config = config;
    this.performanceService = PerformanceMonitoringService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(config?: PerformanceDashboardConfig): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      PerformanceDashboard.instance = new PerformanceDashboard(config);
    }
    return PerformanceDashboard.instance;
  }

  public async start(): Promise<void> {
    logger.info('Starting performance dashboard');

    try {
      // Start dashboard updates
      this.updateInterval = setInterval(
        () => this.updateDashboard(),
        this.config.updateInterval
      );

      // Initial dashboard update
      await this.updateDashboard();

      logger.info('Performance dashboard started successfully');
    } catch (error) {
      logger.error('Failed to start performance dashboard', { error });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    logger.info('Stopping performance dashboard');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    logger.info('Performance dashboard stopped successfully');
  }

  private async updateDashboard(): Promise<void> {
    try {
      // Get all metrics
      const metrics = this.performanceService.getMetrics();
      
      // Get all alerts
      const alerts = this.performanceService.getAlerts();
      
      // Calculate endpoint summaries
      this.calculateEndpointSummaries(metrics);
      
      // Calculate system summary
      this.calculateSystemSummary(metrics, alerts);
      
      // Store in Redis for real-time access
      await this.storeDashboardData();
      
      logger.debug('Performance dashboard updated successfully');
    } catch (error) {
      logger.error('Error updating performance dashboard', { error });
    }
  }

  private calculateEndpointSummaries(metrics: PerformanceMetrics[]): void {
    // Group metrics by endpoint
    const endpointGroups = new Map<string, PerformanceMetrics[]>();
    
    for (const metric of metrics) {
      const key = `${metric.method}:${metric.endpoint}`;
      if (!endpointGroups.has(key)) {
        endpointGroups.set(key, []);
      }
      endpointGroups.get(key)?.push(metric);
    }
    
    // Calculate summaries for each endpoint
    for (const [key, endpointMetrics] of endpointGroups.entries()) {
      const [method, endpoint] = key.split(':');
      
      // Sort by response time for percentiles
      const sortedByResponseTime = [...endpointMetrics].sort((a, b) => a.responseTime - b.responseTime);
      
      // Calculate summary
      const summary: EndpointPerformanceSummary = {
        endpoint,
        method,
        totalRequests: endpointMetrics.length,
        avgResponseTime: this.calculateAverage(endpointMetrics.map(m => m.responseTime)),
        maxResponseTime: Math.max(...endpointMetrics.map(m => m.responseTime)),
        minResponseTime: Math.min(...endpointMetrics.map(m => m.responseTime)),
        errorCount: endpointMetrics.filter(m => m.statusCode >= 400).length,
        errorRate: endpointMetrics.filter(m => m.statusCode >= 400).length / endpointMetrics.length,
        p95ResponseTime: this.calculatePercentile(sortedByResponseTime.map(m => m.responseTime), 95),
        p99ResponseTime: this.calculatePercentile(sortedByResponseTime.map(m => m.responseTime), 99)
      };
      
      // Store summary
      this.endpointSummaries.set(key, summary);
    }
  }

  private calculateSystemSummary(metrics: PerformanceMetrics[], alerts: PerformanceAlert[]): void {
    if (metrics.length === 0) {
      this.systemSummary = null;
      return;
    }
    
    // Get latest metrics for memory and CPU
    const latestMetrics = metrics[metrics.length - 1];
    
    // Calculate system summary
    const summary: SystemPerformanceSummary = {
      timestamp: new Date(),
      totalRequests: metrics.length,
      avgResponseTime: this.calculateAverage(metrics.map(m => m.responseTime)),
      errorRate: metrics.filter(m => m.statusCode >= 400).length / metrics.length,
      memoryUsage: {
        heapUsed: latestMetrics.memoryUsage.heapUsed,
        heapTotal: latestMetrics.memoryUsage.heapTotal,
        percentage: latestMetrics.memoryUsage.heapUsed / latestMetrics.memoryUsage.heapTotal
      },
      cpuUsage: {
        user: latestMetrics.cpuUsage.user,
        system: latestMetrics.cpuUsage.system,
        total: latestMetrics.cpuUsage.user + latestMetrics.cpuUsage.system
      },
      activeAlerts: alerts.length,
      topSlowEndpoints: this.getTopEndpoints('responseTime', 5),
      topErrorEndpoints: this.getTopEndpoints('errorRate', 5)
    };
    
    // Store summary
    this.systemSummary = summary;
  }

  private async storeDashboardData(): Promise<void> {
    try {
      // Store endpoint summaries
      await this.redisService.set(
        'perf:dashboard:endpoints', 
        JSON.stringify(Array.from(this.endpointSummaries.values())), 
        300
      );
      
      // Store system summary
      if (this.systemSummary) {
        await this.redisService.set(
          'perf:dashboard:system', 
          JSON.stringify(this.systemSummary), 
          300
        );
      }
    } catch (error) {
      logger.error('Error storing dashboard data', { error });
    }
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[index];
  }

  private getTopEndpoints(metric: 'responseTime' | 'errorRate', limit: number): EndpointPerformanceSummary[] {
    const summaries = Array.from(this.endpointSummaries.values());
    
    if (metric === 'responseTime') {
      return summaries
        .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
        .slice(0, limit);
    } else {
      return summaries
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, limit);
    }
  }

  public getEndpointSummaries(): EndpointPerformanceSummary[] {
    return Array.from(this.endpointSummaries.values());
  }

  public getSystemSummary(): SystemPerformanceSummary | null {
    return this.systemSummary;
  }

  public getEndpointSummary(endpoint: string, method: string): EndpointPerformanceSummary | undefined {
    return this.endpointSummaries.get(`${method}:${endpoint}`);
  }
} 
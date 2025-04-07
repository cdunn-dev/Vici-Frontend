import { performanceMonitor } from './performance';
import { logger } from './logger';

interface PerformanceReport {
  timestamp: string;
  appStartTime: string;
  uptime: number;
  screenLoadTimes: Array<{
    screen: string;
    loadTime: number;
  }>;
  apiResponseTimes: Array<{
    endpoint: string;
    averageTime: number;
    minTime: number;
    maxTime: number;
    requestCount: number;
  }>;
  memoryUsage: {
    current: number;
    average: number;
    max: number;
    min: number;
  };
}

export class PerformanceReporter {
  private static instance: PerformanceReporter;

  private constructor() {}

  public static getInstance(): PerformanceReporter {
    if (!PerformanceReporter.instance) {
      PerformanceReporter.instance = new PerformanceReporter();
    }
    return PerformanceReporter.instance;
  }

  public generateReport(): PerformanceReport {
    const metrics = performanceMonitor.getMetrics();
    const now = Date.now();

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      appStartTime: new Date(metrics.appStartTime).toISOString(),
      uptime: now - metrics.appStartTime,
      screenLoadTimes: Object.entries(metrics.screenLoadTimes).map(
        ([screen, time]) => ({
          screen,
          loadTime: time,
        })
      ),
      apiResponseTimes: Object.entries(metrics.apiResponseTimes).map(
        ([endpoint, times]) => ({
          endpoint,
          averageTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          requestCount: times.length,
        })
      ),
      memoryUsage: {
        current: metrics.memoryUsage[metrics.memoryUsage.length - 1] || 0,
        average:
          metrics.memoryUsage.reduce((a, b) => a + b, 0) /
          metrics.memoryUsage.length || 0,
        max: Math.max(...metrics.memoryUsage) || 0,
        min: Math.min(...metrics.memoryUsage) || 0,
      },
    };

    return report;
  }

  public exportReport(report: PerformanceReport): void {
    const reportString = JSON.stringify(report, null, 2);
    logger.info('Performance Report', { report: reportString });

    // In a real app, you would send this to your analytics service
    // For now, we'll just log it
    console.log('Performance Report:', reportString);
  }

  public generateAndExportReport(): void {
    const report = this.generateReport();
    this.exportReport(report);
  }
}

export const performanceReporter = PerformanceReporter.getInstance(); 
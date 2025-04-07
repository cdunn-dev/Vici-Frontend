import { performanceMonitor } from './performance';
import { logger } from './logger';

interface AlertThresholds {
  screenLoadTime: number; // milliseconds
  apiResponseTime: number; // milliseconds
  memoryUsage: number; // MB
  apiErrorRate: number; // percentage
}

interface AlertHandler {
  (message: string, data: any): void;
}

export class PerformanceAlerts {
  private static instance: PerformanceAlerts;
  private thresholds: AlertThresholds;
  private handlers: AlertHandler[] = [];

  private constructor() {
    this.thresholds = {
      screenLoadTime: 1000, // 1 second
      apiResponseTime: 500, // 500ms
      memoryUsage: 100, // 100MB
      apiErrorRate: 5, // 5%
    };
  }

  public static getInstance(): PerformanceAlerts {
    if (!PerformanceAlerts.instance) {
      PerformanceAlerts.instance = new PerformanceAlerts();
    }
    return PerformanceAlerts.instance;
  }

  public setThresholds(thresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  public addHandler(handler: AlertHandler): void {
    this.handlers.push(handler);
  }

  public checkScreenLoadTime(screen: string, loadTime: number): void {
    if (loadTime > this.thresholds.screenLoadTime) {
      const message = `Screen load time exceeded threshold for ${screen}`;
      const data = {
        screen,
        loadTime,
        threshold: this.thresholds.screenLoadTime,
      };
      this.triggerAlert(message, data);
    }
  }

  public checkApiResponseTime(endpoint: string, responseTime: number): void {
    if (responseTime > this.thresholds.apiResponseTime) {
      const message = `API response time exceeded threshold for ${endpoint}`;
      const data = {
        endpoint,
        responseTime,
        threshold: this.thresholds.apiResponseTime,
      };
      this.triggerAlert(message, data);
    }
  }

  public checkMemoryUsage(currentUsage: number): void {
    if (currentUsage > this.thresholds.memoryUsage) {
      const message = 'Memory usage exceeded threshold';
      const data = {
        currentUsage,
        threshold: this.thresholds.memoryUsage,
      };
      this.triggerAlert(message, data);
    }
  }

  public checkApiErrorRate(endpoint: string, errorCount: number, totalRequests: number): void {
    const errorRate = (errorCount / totalRequests) * 100;
    if (errorRate > this.thresholds.apiErrorRate) {
      const message = `API error rate exceeded threshold for ${endpoint}`;
      const data = {
        endpoint,
        errorRate,
        errorCount,
        totalRequests,
        threshold: this.thresholds.apiErrorRate,
      };
      this.triggerAlert(message, data);
    }
  }

  private triggerAlert(message: string, data: any): void {
    logger.warn('Performance Alert', { message, data });
    
    // Call all registered handlers
    this.handlers.forEach(handler => {
      try {
        handler(message, data);
      } catch (error) {
        logger.error('Error in alert handler', { error });
      }
    });
  }

  public startMonitoring(): void {
    // Monitor screen load times
    performanceMonitor.onScreenLoad((screen, loadTime) => {
      this.checkScreenLoadTime(screen, loadTime);
    });

    // Monitor API response times
    performanceMonitor.onApiResponse((endpoint, responseTime) => {
      this.checkApiResponseTime(endpoint, responseTime);
    });

    // Monitor memory usage
    performanceMonitor.onMemoryUpdate((currentUsage) => {
      this.checkMemoryUsage(currentUsage);
    });

    // Monitor API errors
    performanceMonitor.onApiError((endpoint, errorCount, totalRequests) => {
      this.checkApiErrorRate(endpoint, errorCount, totalRequests);
    });
  }
}

export const performanceAlerts = PerformanceAlerts.getInstance(); 
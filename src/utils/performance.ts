import { developmentConfig } from '../config/development';
import { logger } from './logger';

interface PerformanceMetrics {
  appStartTime: number;
  screenLoadTimes: Record<string, number>;
  apiResponseTimes: Record<string, number[]>;
  memoryUsage: number[];
  lastUpdate: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    appStartTime: Date.now(),
    screenLoadTimes: {},
    apiResponseTimes: {},
    memoryUsage: [],
    lastUpdate: Date.now(),
  };

  private constructor() {
    if (developmentConfig.performance.monitoring) {
      this.setupMonitoring();
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupMonitoring(): void {
    // Monitor screen load times
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.metrics.screenLoadTimes[entry.name] = entry.duration;
            logger.debug('Screen Load Time', {
              screen: entry.name,
              duration: entry.duration,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    }

    // Monitor memory usage
    if (typeof performance !== 'undefined' && performance.memory) {
      setInterval(() => {
        const memory = performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        this.metrics.memoryUsage.push(memory);
        logger.debug('Memory Usage', { memory: `${memory.toFixed(2)}MB` });
      }, 5000);
    }
  }

  public trackApiResponseTime(endpoint: string, duration: number): void {
    if (!this.metrics.apiResponseTimes[endpoint]) {
      this.metrics.apiResponseTimes[endpoint] = [];
    }
    this.metrics.apiResponseTimes[endpoint].push(duration);
    this.metrics.lastUpdate = Date.now();

    logger.debug('API Response Time', {
      endpoint,
      duration,
      average: this.getAverageResponseTime(endpoint),
    });
  }

  public getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.apiResponseTimes[endpoint];
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  public resetMetrics(): void {
    this.metrics = {
      appStartTime: Date.now(),
      screenLoadTimes: {},
      apiResponseTimes: {},
      memoryUsage: [],
      lastUpdate: Date.now(),
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 
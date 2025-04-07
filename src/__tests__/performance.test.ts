import { performanceMonitor } from '../utils/performance';
import { logger } from '../utils/logger';

jest.mock('../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
  },
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.resetMetrics();
    jest.clearAllMocks();
  });

  it('should track API response times', () => {
    const endpoint = '/api/test';
    const duration = 100;

    performanceMonitor.trackApiResponseTime(endpoint, duration);
    const metrics = performanceMonitor.getMetrics();

    expect(metrics.apiResponseTimes[endpoint]).toContain(duration);
    expect(logger.debug).toHaveBeenCalledWith('API Response Time', expect.any(Object));
  });

  it('should calculate average response time correctly', () => {
    const endpoint = '/api/test';
    const durations = [100, 200, 300];

    durations.forEach(duration => {
      performanceMonitor.trackApiResponseTime(endpoint, duration);
    });

    const average = performanceMonitor.getAverageResponseTime(endpoint);
    expect(average).toBe(200);
  });

  it('should reset metrics correctly', () => {
    const endpoint = '/api/test';
    performanceMonitor.trackApiResponseTime(endpoint, 100);

    performanceMonitor.resetMetrics();
    const metrics = performanceMonitor.getMetrics();

    expect(metrics.apiResponseTimes).toEqual({});
    expect(metrics.screenLoadTimes).toEqual({});
    expect(metrics.memoryUsage).toEqual([]);
  });

  it('should return correct metrics structure', () => {
    const metrics = performanceMonitor.getMetrics();

    expect(metrics).toHaveProperty('appStartTime');
    expect(metrics).toHaveProperty('screenLoadTimes');
    expect(metrics).toHaveProperty('apiResponseTimes');
    expect(metrics).toHaveProperty('memoryUsage');
    expect(metrics).toHaveProperty('lastUpdate');
  });
}); 
import { performanceReporter } from '../utils/performanceReport';
import { performanceMonitor } from '../utils/performance';
import { logger } from '../utils/logger';

jest.mock('../utils/performance', () => ({
  performanceMonitor: {
    getMetrics: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('PerformanceReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (performanceMonitor.getMetrics as jest.Mock).mockReturnValue({
      appStartTime: Date.now() - 1000,
      screenLoadTimes: {
        'Home': 200,
        'Profile': 150,
      },
      apiResponseTimes: {
        '/api/user': [100, 150, 200],
        '/api/settings': [50, 75, 100],
      },
      memoryUsage: [50, 55, 60],
    });
  });

  it('generates a report with correct structure', () => {
    const report = performanceReporter.generateReport();

    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('appStartTime');
    expect(report).toHaveProperty('uptime');
    expect(report).toHaveProperty('screenLoadTimes');
    expect(report).toHaveProperty('apiResponseTimes');
    expect(report).toHaveProperty('memoryUsage');
  });

  it('calculates correct averages for API response times', () => {
    const report = performanceReporter.generateReport();
    const userApiTimes = report.apiResponseTimes.find(
      (api) => api.endpoint === '/api/user'
    );

    expect(userApiTimes?.averageTime).toBe(150);
    expect(userApiTimes?.minTime).toBe(100);
    expect(userApiTimes?.maxTime).toBe(200);
    expect(userApiTimes?.requestCount).toBe(3);
  });

  it('calculates correct memory usage statistics', () => {
    const report = performanceReporter.generateReport();

    expect(report.memoryUsage.current).toBe(60);
    expect(report.memoryUsage.average).toBe(55);
    expect(report.memoryUsage.max).toBe(60);
    expect(report.memoryUsage.min).toBe(50);
  });

  it('exports report through logger', () => {
    performanceReporter.generateAndExportReport();

    expect(logger.info).toHaveBeenCalledWith(
      'Performance Report',
      expect.objectContaining({
        report: expect.any(String),
      })
    );
  });
}); 
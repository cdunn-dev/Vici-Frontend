import { performanceAlerts } from '../utils/performanceAlerts';
import { logger } from '../utils/logger';

jest.mock('../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PerformanceAlerts', () => {
  let alertHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    alertHandler = jest.fn();
    performanceAlerts.addHandler(alertHandler);
  });

  it('triggers alert when screen load time exceeds threshold', () => {
    performanceAlerts.checkScreenLoadTime('Home', 1500);

    expect(logger.warn).toHaveBeenCalledWith(
      'Performance Alert',
      expect.objectContaining({
        message: 'Screen load time exceeded threshold for Home',
        data: expect.objectContaining({
          screen: 'Home',
          loadTime: 1500,
          threshold: 1000,
        }),
      })
    );
    expect(alertHandler).toHaveBeenCalled();
  });

  it('triggers alert when API response time exceeds threshold', () => {
    performanceAlerts.checkApiResponseTime('/api/user', 600);

    expect(logger.warn).toHaveBeenCalledWith(
      'Performance Alert',
      expect.objectContaining({
        message: 'API response time exceeded threshold for /api/user',
        data: expect.objectContaining({
          endpoint: '/api/user',
          responseTime: 600,
          threshold: 500,
        }),
      })
    );
    expect(alertHandler).toHaveBeenCalled();
  });

  it('triggers alert when memory usage exceeds threshold', () => {
    performanceAlerts.checkMemoryUsage(120);

    expect(logger.warn).toHaveBeenCalledWith(
      'Performance Alert',
      expect.objectContaining({
        message: 'Memory usage exceeded threshold',
        data: expect.objectContaining({
          currentUsage: 120,
          threshold: 100,
        }),
      })
    );
    expect(alertHandler).toHaveBeenCalled();
  });

  it('triggers alert when API error rate exceeds threshold', () => {
    performanceAlerts.checkApiErrorRate('/api/user', 6, 100);

    expect(logger.warn).toHaveBeenCalledWith(
      'Performance Alert',
      expect.objectContaining({
        message: 'API error rate exceeded threshold for /api/user',
        data: expect.objectContaining({
          endpoint: '/api/user',
          errorRate: 6,
          errorCount: 6,
          totalRequests: 100,
          threshold: 5,
        }),
      })
    );
    expect(alertHandler).toHaveBeenCalled();
  });

  it('allows updating thresholds', () => {
    performanceAlerts.setThresholds({
      screenLoadTime: 2000,
      apiResponseTime: 1000,
      memoryUsage: 200,
      apiErrorRate: 10,
    });

    performanceAlerts.checkScreenLoadTime('Home', 1500);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(alertHandler).not.toHaveBeenCalled();

    performanceAlerts.checkScreenLoadTime('Home', 2500);
    expect(logger.warn).toHaveBeenCalled();
    expect(alertHandler).toHaveBeenCalled();
  });

  it('handles errors in alert handlers gracefully', () => {
    const errorHandler = jest.fn().mockImplementation(() => {
      throw new Error('Handler error');
    });
    performanceAlerts.addHandler(errorHandler);

    performanceAlerts.checkScreenLoadTime('Home', 1500);

    expect(logger.error).toHaveBeenCalledWith(
      'Error in alert handler',
      expect.objectContaining({
        error: expect.any(Error),
      })
    );
  });
}); 
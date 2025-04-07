import { RateLimitMonitoringService, RateLimitMetrics, RateLimitAlert } from '../rateLimitMonitoringService';
import { ErrorHandlingService } from '../errorHandlingService';
import { RedisService } from '../redis';
import { EventEmitter } from 'events';

jest.mock('../redis');
jest.mock('../errorHandlingService');

describe('RateLimitMonitoringService', () => {
  let rateLimitMonitoringService: RateLimitMonitoringService;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockErrorHandlingService: jest.Mocked<ErrorHandlingService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Redis service
    mockRedisService = {
      getInstance: jest.fn().mockReturnThis(),
      incr: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue('0'),
      lpush: jest.fn().mockResolvedValue(1),
      ltrim: jest.fn().mockResolvedValue('OK'),
      lrange: jest.fn().mockResolvedValue(['100', '200', '300']),
      zrangebyscore: jest.fn().mockResolvedValue(['1000', '2000', '3000']),
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(1)
    } as unknown as jest.Mocked<RedisService>;

    // Create mock error handling service
    mockErrorHandlingService = {
      getInstance: jest.fn().mockReturnThis(),
      handleError: jest.fn().mockResolvedValue(undefined)
    } as unknown as jest.Mocked<ErrorHandlingService>;

    // Initialize the service
    rateLimitMonitoringService = RateLimitMonitoringService.getInstance(mockErrorHandlingService);
  });

  describe('trackRequest', () => {
    it('should track rate limit requests correctly', async () => {
      const identifier = 'test-identifier';
      const tier = 'default';
      const rateLimited = true;
      const latency = 100;

      await rateLimitMonitoringService.trackRequest(identifier, tier, rateLimited, latency);

      // Verify Redis calls
      expect(mockRedisService.incr).toHaveBeenCalledWith(expect.stringContaining('requests:total'));
      expect(mockRedisService.incr).toHaveBeenCalledWith(expect.stringContaining('requests:tier:default'));
      expect(mockRedisService.incr).toHaveBeenCalledWith(expect.stringContaining('rate_limited:total'));
      expect(mockRedisService.incr).toHaveBeenCalledWith(expect.stringContaining('rate_limited:tier:default'));
      expect(mockRedisService.lpush).toHaveBeenCalledWith(expect.stringContaining('latency:default'), '100');
    });

    it('should handle errors during tracking', async () => {
      const error = new Error('Redis error');
      mockRedisService.incr.mockRejectedValueOnce(error);

      await rateLimitMonitoringService.trackRequest('test', 'default', false, 100);

      expect(mockErrorHandlingService.handleError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          category: 'SYSTEM',
          severity: 'HIGH',
          source: 'RateLimitMonitoringService'
        })
      );
    });
  });

  describe('collectMetrics', () => {
    it('should collect and store metrics correctly', async () => {
      // Mock Redis responses
      mockRedisService.get.mockImplementation((key: string) => {
        if (key.includes('requests:total')) return Promise.resolve('100');
        if (key.includes('rate_limited:total')) return Promise.resolve('10');
        return Promise.resolve('0');
      });

      // Trigger metrics collection
      const metricsPromise = new Promise<RateLimitMetrics>((resolve) => {
        rateLimitMonitoringService.on('metrics', resolve);
      });

      // Wait for metrics to be collected
      const metrics = await metricsPromise;

      expect(metrics).toMatchObject({
        totalRequests: 100,
        rateLimitedRequests: 10,
        rateLimitHits: 10,
        rateLimitMisses: 90
      });
    });
  });

  describe('checkAlerts', () => {
    it('should generate alerts for high rate limit hits', async () => {
      // Mock Redis responses for high hit rate
      mockRedisService.get.mockImplementation((key: string) => {
        if (key.includes('requests:total')) return Promise.resolve('100');
        if (key.includes('rate_limited:total')) return Promise.resolve('20'); // 20% hit rate
        return Promise.resolve('0');
      });

      // Listen for alerts
      const alertPromise = new Promise<RateLimitAlert>((resolve) => {
        rateLimitMonitoringService.on('alert', resolve);
      });

      // Trigger alert check
      await rateLimitMonitoringService.trackRequest('test', 'default', true, 100);

      const alert = await alertPromise;
      expect(alert.type).toBe('HIGH_RATE_LIMIT_HITS');
      expect(alert.message).toContain('High rate limit hit percentage');
    });

    it('should generate alerts for high latency', async () => {
      // Listen for alerts
      const alertPromise = new Promise<RateLimitAlert>((resolve) => {
        rateLimitMonitoringService.on('alert', resolve);
      });

      // Trigger alert check with high latency
      await rateLimitMonitoringService.trackRequest('test', 'default', false, 2000); // 2 seconds

      const alert = await alertPromise;
      expect(alert.type).toBe('HIGH_LATENCY');
      expect(alert.message).toContain('High latency detected');
    });
  });

  describe('getMetrics', () => {
    it('should return stored metrics', () => {
      const metrics = rateLimitMonitoringService.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getAlerts', () => {
    it('should return stored alerts', () => {
      const alerts = rateLimitMonitoringService.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('getDailyMetrics', () => {
    it('should return daily metrics for a specific date', async () => {
      const date = '2024-03-20';
      mockRedisService.get.mockImplementation((key: string) => {
        if (key.includes('requests:total')) return Promise.resolve('50');
        if (key.includes('rate_limited:total')) return Promise.resolve('5');
        return Promise.resolve('0');
      });

      const metrics = await rateLimitMonitoringService.getDailyMetrics(date);

      expect(metrics).toMatchObject({
        timestamp: new Date(date),
        totalRequests: 50,
        rateLimitedRequests: 5,
        rateLimitHits: 5,
        rateLimitMisses: 45
      });
    });
  });

  describe('cleanup', () => {
    it('should clean up old metrics and alerts', async () => {
      // Add some old metrics and alerts
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      const oldMetrics: RateLimitMetrics = {
        timestamp: oldDate,
        totalRequests: 0,
        rateLimitedRequests: 0,
        rateLimitHits: 0,
        rateLimitMisses: 0,
        averageLatency: 0,
        byTier: {},
        byIdentifier: {}
      };

      // Mock Redis keys for cleanup
      mockRedisService.keys.mockResolvedValueOnce([
        'ratelimit:metrics:daily:2024-02-20',
        'ratelimit:metrics:daily:2024-03-20'
      ]);

      await rateLimitMonitoringService.cleanup();

      expect(mockRedisService.del).toHaveBeenCalledWith(expect.stringContaining('2024-02-20'));
      expect(mockRedisService.del).not.toHaveBeenCalledWith(expect.stringContaining('2024-03-20'));
    });
  });
}); 
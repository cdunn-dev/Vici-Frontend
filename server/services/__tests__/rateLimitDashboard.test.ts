import { RateLimitDashboard, RateLimitDashboardData } from '../rateLimitDashboard';
import { RateLimitMonitoringService } from '../rateLimitMonitoringService';
import { MonitoringService } from '../monitoring';
import { EventEmitter } from 'events';

jest.mock('../rateLimitMonitoringService');
jest.mock('../monitoring');

describe('RateLimitDashboard', () => {
  let rateLimitDashboard: RateLimitDashboard;
  let mockRateLimitMonitoringService: jest.Mocked<RateLimitMonitoringService>;
  let mockMonitoringService: jest.Mocked<MonitoringService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock services
    mockRateLimitMonitoringService = {
      getInstance: jest.fn().mockReturnThis(),
      getMetrics: jest.fn().mockReturnValue([]),
      on: jest.fn(),
      removeAllListeners: jest.fn()
    } as unknown as jest.Mocked<RateLimitMonitoringService>;

    mockMonitoringService = {
      getInstance: jest.fn().mockReturnThis()
    } as unknown as jest.Mocked<MonitoringService>;

    // Initialize the dashboard
    rateLimitDashboard = RateLimitDashboard.getInstance(
      mockRateLimitMonitoringService,
      mockMonitoringService
    );
  });

  describe('start', () => {
    it('should start the dashboard and set up event listeners', async () => {
      await rateLimitDashboard.start();

      expect(mockRateLimitMonitoringService.on).toHaveBeenCalledWith('metrics', expect.any(Function));
      expect(mockRateLimitMonitoringService.on).toHaveBeenCalledWith('alert', expect.any(Function));
    });

    it('should handle errors during startup', async () => {
      const error = new Error('Startup error');
      mockRateLimitMonitoringService.getMetrics.mockRejectedValueOnce(error);

      await expect(rateLimitDashboard.start()).rejects.toThrow('Startup error');
    });
  });

  describe('stop', () => {
    it('should stop the dashboard and clean up event listeners', async () => {
      await rateLimitDashboard.start();
      await rateLimitDashboard.stop();

      expect(mockRateLimitMonitoringService.removeAllListeners).toHaveBeenCalledWith('metrics');
      expect(mockRateLimitMonitoringService.removeAllListeners).toHaveBeenCalledWith('alert');
    });
  });

  describe('updateDashboardData', () => {
    it('should update dashboard data and emit update event', async () => {
      const mockMetrics = {
        totalRequests: 100,
        rateLimitedRequests: 10,
        rateLimitHits: 5,
        rateLimitMisses: 95,
        averageLatency: 50,
        byTier: {},
        byIdentifier: {}
      };

      mockRateLimitMonitoringService.getMetrics.mockReturnValueOnce([mockMetrics]);

      const updatePromise = new Promise<RateLimitDashboardData>((resolve) => {
        rateLimitDashboard.on('update', resolve);
      });

      await rateLimitDashboard.start();
      const dashboardData = await updatePromise;

      expect(dashboardData).toMatchObject({
        metrics: mockMetrics,
        alerts: expect.any(Object),
        trends: expect.any(Object)
      });
    });
  });

  describe('checkAlerts', () => {
    it('should detect high rate limit hits', async () => {
      const mockMetrics = {
        totalRequests: 100,
        rateLimitedRequests: 20,
        rateLimitHits: 15,
        rateLimitMisses: 85,
        averageLatency: 50,
        byTier: {},
        byIdentifier: {}
      };

      mockRateLimitMonitoringService.getMetrics.mockReturnValueOnce([mockMetrics]);

      const updatePromise = new Promise<RateLimitDashboardData>((resolve) => {
        rateLimitDashboard.on('update', resolve);
      });

      await rateLimitDashboard.start();
      const dashboardData = await updatePromise;

      expect(dashboardData.alerts.highRateLimitHits).toBe(true);
    });

    it('should detect high latency', async () => {
      const mockMetrics = {
        totalRequests: 100,
        rateLimitedRequests: 10,
        rateLimitHits: 5,
        rateLimitMisses: 95,
        averageLatency: 1500,
        byTier: {},
        byIdentifier: {}
      };

      mockRateLimitMonitoringService.getMetrics.mockReturnValueOnce([mockMetrics]);

      const updatePromise = new Promise<RateLimitDashboardData>((resolve) => {
        rateLimitDashboard.on('update', resolve);
      });

      await rateLimitDashboard.start();
      const dashboardData = await updatePromise;

      expect(dashboardData.alerts.highLatency).toBe(true);
    });
  });

  describe('getDashboardData', () => {
    it('should return stored dashboard data', async () => {
      const mockMetrics = {
        totalRequests: 100,
        rateLimitedRequests: 10,
        rateLimitHits: 5,
        rateLimitMisses: 95,
        averageLatency: 50,
        byTier: {},
        byIdentifier: {}
      };

      mockRateLimitMonitoringService.getMetrics.mockReturnValueOnce([mockMetrics]);

      await rateLimitDashboard.start();
      const dashboardData = rateLimitDashboard.getDashboardData();

      expect(Array.isArray(dashboardData)).toBe(true);
      expect(dashboardData.length).toBeGreaterThan(0);
    });
  });

  describe('getLatestDashboardData', () => {
    it('should return the most recent dashboard data', async () => {
      const mockMetrics = {
        totalRequests: 100,
        rateLimitedRequests: 10,
        rateLimitHits: 5,
        rateLimitMisses: 95,
        averageLatency: 50,
        byTier: {},
        byIdentifier: {}
      };

      mockRateLimitMonitoringService.getMetrics.mockReturnValueOnce([mockMetrics]);

      await rateLimitDashboard.start();
      const latestData = rateLimitDashboard.getLatestDashboardData();

      expect(latestData).not.toBeNull();
      expect(latestData?.metrics).toMatchObject(mockMetrics);
    });
  });
}); 
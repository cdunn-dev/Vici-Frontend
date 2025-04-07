import { debugUtils } from '../utils/debug';
import { logger } from '../utils/logger';

describe('DebugUtils', () => {
  beforeEach(() => {
    // Clear logs and network requests before each test
    logger.clearLogs();
    debugUtils.clearNetworkRequests();
  });

  describe('Network Logging', () => {
    it('should track network requests', () => {
      // Mock XMLHttpRequest
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        addEventListener: jest.fn(),
        status: 200,
      };

      // @ts-ignore
      global.XMLHttpRequest = jest.fn(() => mockXHR);

      // Simulate a network request
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://api.example.com/test');
      xhr.send();

      // Simulate load event
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'load'
      )[1];
      loadHandler();

      const requests = debugUtils.getNetworkRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatchObject({
        method: 'GET',
        url: 'https://api.example.com/test',
        status: 200,
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should enable performance monitoring in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      debugUtils.enablePerformanceMonitoring();
      const logs = logger.getLogs();
      expect(logs).toContainEqual(
        expect.objectContaining({
          message: 'Performance monitoring enabled',
          level: 'info',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Redux DevTools', () => {
    it('should enable Redux DevTools in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      debugUtils.enableReduxDevTools();
      const logs = logger.getLogs();
      expect(logs).toContainEqual(
        expect.objectContaining({
          message: 'Redux DevTools enabled',
          level: 'info',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
}); 
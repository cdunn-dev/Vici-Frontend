import { ErrorHandlingService, ErrorHandlingConfig, ErrorCategory, ErrorSeverity, ErrorDetails } from '../errorHandlingService';
import { AuditLoggingService } from '../auditLoggingService';
import { Pool, PoolClient } from 'pg';
import { EventEmitter } from 'events';

jest.mock('../auditLoggingService');
jest.mock('pg');

describe('ErrorHandlingService', () => {
  let errorHandlingService: ErrorHandlingService;
  let mockAuditLoggingService: jest.Mocked<AuditLoggingService>;
  let mockDbPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;

  const mockConfig: ErrorHandlingConfig = {
  enabled: true,
  logToDatabase: true,
  logToFile: true,
  logFilePath: '/tmp/error.log',
  maxLogFileSize: 1024 * 1024,
  maxLogFiles: 5,
  enableErrorTracking: true,
    errorTrackingSampleRate: 1,
  enableErrorReporting: true,
    errorReportingEndpoint: 'http://localhost:3000/errors',
  errorReportingApiKey: 'test-key',
  enableErrorRecovery: true,
  maxRecoveryAttempts: 3,
  recoveryAttemptDelay: 1000,
  enableErrorNotification: true,
  errorNotificationChannels: ['email', 'slack'],
  errorNotificationRecipients: ['admin@example.com'],
  enableErrorAggregation: true,
  errorAggregationWindow: 60000,
    errorAggregationThreshold: 10,
  errorRateLimiting: {
      enabled: true,
    windowMs: 60000,
    maxErrorsPerWindow: 100,
    categoryLimits: {
        [ErrorCategory.DATABASE]: 50,
        [ErrorCategory.NETWORK]: 30,
        [ErrorCategory.VALIDATION]: 20,
        [ErrorCategory.AUTHENTICATION]: 10,
        [ErrorCategory.AUTHORIZATION]: 10,
        [ErrorCategory.INTEGRATION]: 20,
        [ErrorCategory.PERFORMANCE]: 30,
      [ErrorCategory.SECURITY]: 5,
        [ErrorCategory.SYSTEM]: 20,
        [ErrorCategory.BUSINESS]: 15
    }
  },
  errorSampling: {
      enabled: true,
      sampleRate: 1,
    severityRates: {
        [ErrorSeverity.LOW]: 0.5,
        [ErrorSeverity.MEDIUM]: 0.8,
        [ErrorSeverity.HIGH]: 1,
        [ErrorSeverity.CRITICAL]: 1
    },
    categoryRates: {
        [ErrorCategory.DATABASE]: 1,
        [ErrorCategory.NETWORK]: 1,
        [ErrorCategory.VALIDATION]: 0.5,
        [ErrorCategory.AUTHENTICATION]: 1,
        [ErrorCategory.AUTHORIZATION]: 1,
        [ErrorCategory.INTEGRATION]: 0.8,
        [ErrorCategory.PERFORMANCE]: 0.8,
        [ErrorCategory.SECURITY]: 1,
        [ErrorCategory.SYSTEM]: 1,
        [ErrorCategory.BUSINESS]: 0.5
    }
  },
  errorContextEnrichment: {
      enabled: true,
      includeSystemMetrics: true,
      includeRequestData: true,
      includeResponseData: true,
    customEnrichers: []
  },
  errorCorrelation: {
      enabled: true,
      correlationWindowMs: 300000,
    maxCorrelationDistance: 5,
      correlationKeys: ['requestId', 'userId', 'correlationId']
    },
    recoveryStrategies: {
      [ErrorCategory.DATABASE]: {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          resetTimeout: 60000
        }
      },
      [ErrorCategory.NETWORK]: {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          resetTimeout: 60000
        }
      },
      [ErrorCategory.VALIDATION]: {
        enabled: true,
        maxAttempts: 1,
        baseDelay: 0,
        maxDelay: 0,
        circuitBreaker: {
          enabled: false,
          failureThreshold: 0,
          resetTimeout: 0
        }
      },
      [ErrorCategory.AUTHENTICATION]: {
        enabled: true,
        maxAttempts: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          resetTimeout: 30000
        }
      },
      [ErrorCategory.AUTHORIZATION]: {
        enabled: true,
        maxAttempts: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          resetTimeout: 30000
        }
      },
      [ErrorCategory.INTEGRATION]: {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          resetTimeout: 60000
        }
      },
      [ErrorCategory.PERFORMANCE]: {
        enabled: true,
        maxAttempts: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          resetTimeout: 30000
        }
      },
      [ErrorCategory.SECURITY]: {
        enabled: true,
        maxAttempts: 1,
        baseDelay: 0,
        maxDelay: 0,
        circuitBreaker: {
          enabled: false,
          failureThreshold: 0,
          resetTimeout: 0
        }
      },
      [ErrorCategory.SYSTEM]: {
        enabled: true,
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          resetTimeout: 60000
        }
      },
      [ErrorCategory.BUSINESS]: {
        enabled: true,
        maxAttempts: 1,
        baseDelay: 0,
        maxDelay: 0,
        circuitBreaker: {
          enabled: false,
          failureThreshold: 0,
          resetTimeout: 0
        }
      }
    }
  };

  beforeAll(() => {
    // Reset the singleton instance
    (ErrorHandlingService as any).instance = undefined;
  });

  beforeEach(() => {
    // Create fresh mock functions
    const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    const mockRelease = jest.fn();
    const mockConnect = jest.fn().mockResolvedValue({
      query: mockQuery,
      release: mockRelease
    });

    mockDbPool = {
      connect: mockConnect
    } as unknown as jest.Mocked<Pool>;
    
    mockClient = {
      query: mockQuery,
      release: mockRelease
    } as unknown as jest.Mocked<PoolClient>;
    
    // Create a mock AuditLoggingService with the required parameters
    mockAuditLoggingService = new AuditLoggingService(mockDbPool, {}) as jest.Mocked<AuditLoggingService>;

    // Initialize the service with required parameters
    errorHandlingService = ErrorHandlingService.getInstance(mockConfig, mockAuditLoggingService, mockDbPool);
  });

  afterAll(() => {
    // Reset the singleton instance
    (ErrorHandlingService as any).instance = undefined;
  });

  describe('Error Recovery', () => {
    it('should attempt recovery for database errors', async () => {
      const error = new Error('Database connection failed');
      const context = {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'query',
          query: 'SELECT * FROM users'
        }
      };

      // Create a promise that resolves when the error event is emitted
      const errorPromise = new Promise<ErrorDetails>((resolve) => {
        const errorHandler = (errorDetails: ErrorDetails) => {
          resolve(errorDetails);
        };
        errorHandlingService.onError(errorHandler);
      });

      // Handle the error
      await errorHandlingService.handleError(error, context);

      // Wait for the error event and verify the details
      const errorDetails = await errorPromise;
      expect(errorDetails).toMatchObject({
        message: error.message,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        recoveryAttempted: true
      });

      expect(mockDbPool.connect).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('Error Notification', () => {
    it('should send notifications based on error severity and configuration', async () => {
      // Create a spy on the logger to verify notification calls
      const loggerSpy = jest.spyOn(require('../../utils/logger'), 'info');
      
      // Create a critical error
      const error = new Error('Critical system failure');
      const context = {
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.SYSTEM,
        context: {
          component: 'core',
          operation: 'systemCheck'
        }
      };

      // Create a promise that resolves when the error event is emitted
      const errorPromise = new Promise<ErrorDetails>((resolve) => {
        const errorHandler = (errorDetails: ErrorDetails) => {
          resolve(errorDetails);
        };
        errorHandlingService.onError(errorHandler);
      });

      // Handle the error
      await errorHandlingService.handleError(error, context);

      // Wait for the error event
      const errorDetails = await errorPromise;
      
      // Verify that notifications were sent
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Email notification sent'));
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Slack notification sent'));
      
      // Verify that the notification message contains the error details
      const notificationCalls = loggerSpy.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0].includes('notification sent')
      );
      
      expect(notificationCalls.length).toBeGreaterThan(0);
      expect(typeof notificationCalls[0][0] === 'string' && notificationCalls[0][0].includes(error.message)).toBe(true);
      expect(typeof notificationCalls[0][0] === 'string' && notificationCalls[0][0].includes(ErrorSeverity.CRITICAL)).toBe(true);
      expect(typeof notificationCalls[0][0] === 'string' && notificationCalls[0][0].includes(ErrorCategory.SYSTEM)).toBe(true);
    });

    it('should use different notification channels based on error severity', async () => {
      // Create a spy on the logger to verify notification calls
      const loggerSpy = jest.spyOn(require('../../utils/logger'), 'info');
      
      // Create a low severity error
      const lowError = new Error('Minor validation issue');
      const lowContext = {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.VALIDATION,
        context: {
          field: 'email',
          value: 'invalid-email'
        }
      };

      // Handle the low severity error
      await errorHandlingService.handleError(lowError, lowContext);
      
      // Verify that only log notifications were sent for low severity
      const lowSeverityCalls = loggerSpy.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0].includes('notification sent')
      );
      
      expect(lowSeverityCalls.length).toBeGreaterThan(0);
      expect(lowSeverityCalls.every(call => typeof call[0] === 'string' && call[0].includes('log'))).toBe(true);
      
      // Reset the spy
      loggerSpy.mockClear();
      
      // Create a high severity error
      const highError = new Error('Authentication failure');
      const highContext = {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHENTICATION,
        context: {
          userId: 'user123',
          attempt: 3
        }
      };

      // Handle the high severity error
      await errorHandlingService.handleError(highError, highContext);
      
      // Verify that email and slack notifications were sent for high severity
      const highSeverityCalls = loggerSpy.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0].includes('notification sent')
      );
      
      expect(highSeverityCalls.some(call => typeof call[0] === 'string' && call[0].includes('Email notification sent'))).toBe(true);
      expect(highSeverityCalls.some(call => typeof call[0] === 'string' && call[0].includes('Slack notification sent'))).toBe(true);
    });
  });

  describe('Error Aggregation', () => {
    it('should aggregate errors that occur multiple times within the aggregation window', async () => {
      // Create a promise that resolves when the aggregated error event is emitted
      const aggregatedErrorPromise = new Promise<any>((resolve) => {
        const aggregatedErrorHandler = (aggregatedError: any) => {
          resolve(aggregatedError);
        };
        errorHandlingService.onErrorAggregated(aggregatedErrorHandler);
      });

      // Create an error that will be repeated
      const error = new Error('Database connection failed');
      const context = {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        context: {
          operation: 'query',
          query: 'SELECT * FROM users'
        }
      };

      // Simulate multiple occurrences of the same error within the aggregation window
      const numOccurrences = mockConfig.errorAggregationThreshold + 1;
      for (let i = 0; i < numOccurrences; i++) {
        await errorHandlingService.handleError(error, context);
      }

      // Wait for the aggregated error event
      const aggregatedError = await aggregatedErrorPromise;

      // Verify the aggregated error details
      expect(aggregatedError).toMatchObject({
        key: `${ErrorCategory.DATABASE}:${error.name}`,
        count: numOccurrences,
        error: expect.objectContaining({
          message: error.message,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.DATABASE
        })
      });

      // Verify that the error count was reset after aggregation
      const errorCount = errorHandlingService['errorCounts'].get(`${ErrorCategory.DATABASE}:${error.name}`);
      expect(errorCount).toBe(0);
    });

    it('should not aggregate errors that occur outside the aggregation window', async () => {
      // Create a spy on the event emitter
      const eventEmitterSpy = jest.spyOn(errorHandlingService['eventEmitter'], 'emit');

      // Create an error
      const error = new Error('Network timeout');
      const context = {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        context: {
          endpoint: 'api/users',
          timeout: 5000
        }
      };

      // Simulate error occurrences with delays outside the aggregation window
      await errorHandlingService.handleError(error, context);
      
      // Wait for a time longer than the aggregation window
      await new Promise(resolve => setTimeout(resolve, mockConfig.errorAggregationWindow + 100));
      
      // Trigger another error
      await errorHandlingService.handleError(error, context);

      // Verify that no aggregated error event was emitted
      expect(eventEmitterSpy).not.toHaveBeenCalledWith('errorAggregated', expect.any(Object));
    });

    it('should track error counts correctly for different error categories', async () => {
      // Create different types of errors
      const errors = [
        {
          error: new Error('Database error'),
          context: {
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.DATABASE
          }
        },
        {
          error: new Error('Network error'),
          context: {
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.NETWORK
          }
        },
        {
          error: new Error('Validation error'),
          context: {
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.VALIDATION
          }
        }
      ];

      // Handle each error multiple times
      for (const { error, context } of errors) {
        for (let i = 0; i < 3; i++) {
          await errorHandlingService.handleError(error, context);
        }
      }

      // Verify error counts for each category
      const errorCounts = errorHandlingService['errorCounts'];
      expect(errorCounts.get(`${ErrorCategory.DATABASE}:${errors[0].error.name}`)).toBe(3);
      expect(errorCounts.get(`${ErrorCategory.NETWORK}:${errors[1].error.name}`)).toBe(3);
      expect(errorCounts.get(`${ErrorCategory.VALIDATION}:${errors[2].error.name}`)).toBe(3);
    });
  });

  describe('Error Tracking', () => {
    it('should track errors and maintain error counts', async () => {
      // Create different types of errors
      const errors = [
        {
          error: new Error('Database error'),
          context: {
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.DATABASE
          }
        },
        {
          error: new Error('Network error'),
          context: {
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.NETWORK
          }
        }
      ];

      // Handle each error multiple times
      for (const { error, context } of errors) {
        for (let i = 0; i < 3; i++) {
          await errorHandlingService.handleError(error, context);
        }
      }

      // Get error metrics
      const metrics = errorHandlingService.getErrorMetrics();

      // Verify total errors
      expect(metrics.totalErrors).toBe(2); // Two unique error types

      // Verify error counts by category
      expect(metrics.errorCounts[ErrorCategory.DATABASE]).toBe(3);
      expect(metrics.errorCounts[ErrorCategory.NETWORK]).toBe(3);

      // Verify severity counts
      expect(metrics.severityCounts[ErrorSeverity.HIGH]).toBe(3);
      expect(metrics.severityCounts[ErrorSeverity.MEDIUM]).toBe(3);
    });

    it('should respect error tracking sample rate', async () => {
      // Create a spy on the logger to verify tracking calls
      const loggerSpy = jest.spyOn(require('../../utils/logger'), 'debug');

      // Create an error
      const error = new Error('Test error');
      const context = {
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.VALIDATION
      };

      // Handle the error multiple times
      const numOccurrences = 10;
      for (let i = 0; i < numOccurrences; i++) {
        await errorHandlingService.handleError(error, context);
      }

      // Verify that some errors were sampled out based on the sample rate
      const trackingCalls = loggerSpy.mock.calls.filter(call => 
        typeof call[0] === 'string' && call[0].includes('Error sampled out')
      );

      expect(trackingCalls.length).toBeGreaterThan(0);
      expect(trackingCalls.length).toBeLessThan(numOccurrences);
    });

    it('should track error metrics correctly', async () => {
      // Create errors with different severities and categories
      const errors = [
        {
          error: new Error('Critical system error'),
          context: {
            severity: ErrorSeverity.CRITICAL,
            category: ErrorCategory.SYSTEM
          }
        },
        {
          error: new Error('High severity auth error'),
          context: {
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.AUTHENTICATION
          }
        },
        {
          error: new Error('Medium severity network error'),
          context: {
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.NETWORK
          }
        },
        {
          error: new Error('Low severity validation error'),
          context: {
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.VALIDATION
          }
        }
      ];

      // Handle each error
      for (const { error, context } of errors) {
        await errorHandlingService.handleError(error, context);
      }

      // Get error metrics
      const metrics = errorHandlingService.getErrorMetrics();

      // Verify error counts by category
      expect(metrics.errorCounts[ErrorCategory.SYSTEM]).toBe(1);
      expect(metrics.errorCounts[ErrorCategory.AUTHENTICATION]).toBe(1);
      expect(metrics.errorCounts[ErrorCategory.NETWORK]).toBe(1);
      expect(metrics.errorCounts[ErrorCategory.VALIDATION]).toBe(1);

      // Verify severity counts
      expect(metrics.severityCounts[ErrorSeverity.CRITICAL]).toBe(1);
      expect(metrics.severityCounts[ErrorSeverity.HIGH]).toBe(1);
      expect(metrics.severityCounts[ErrorSeverity.MEDIUM]).toBe(1);
      expect(metrics.severityCounts[ErrorSeverity.LOW]).toBe(1);

      // Verify total errors
      expect(metrics.totalErrors).toBe(4);
    });
  });

  describe('Error Reporting', () => {
    let fetchMock: jest.Mock;

    beforeEach(() => {
      // Mock fetch for testing HTTP requests
      fetchMock = jest.fn();
      global.fetch = fetchMock;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should report errors to external service when enabled', async () => {
      // Mock successful response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Create a test error
      const error = new Error('Test error');
      const context = {
          severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        source: 'test',
        userId: 'user123',
        requestId: 'req123',
        correlationId: 'corr123'
      };

      // Handle the error
      await errorHandlingService.handleError(error, context);

      // Verify that fetch was called with correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        mockConfig.errorReportingEndpoint,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockConfig.errorReportingApiKey}`
          }),
          body: expect.stringContaining(error.message)
        })
      );

      // Verify the report content
      const reportBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(reportBody).toMatchObject({
        message: error.message,
        code: error.name,
          severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM,
        source: 'test',
        context: expect.objectContaining({
          userId: 'user123',
          requestId: 'req123',
          correlationId: 'corr123'
        })
      });
    });

    it('should retry failed error reports', async () => {
      // Mock two failed attempts followed by a success
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const error = new Error('Test error');
      await errorHandlingService.handleError(error, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SYSTEM
      });

      // Verify that fetch was called three times
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should batch report multiple errors', async () => {
      // Mock successful response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Create multiple errors
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3')
      ];

      // Handle all errors
      await Promise.all(errors.map(error => 
        errorHandlingService.handleError(error, {
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.SYSTEM
        })
      ));

      // Verify that fetch was called with batch report
      expect(fetchMock).toHaveBeenCalledWith(
        mockConfig.errorReportingEndpoint,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('errors')
        })
      );

      // Verify batch report content
      const reportBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(reportBody.errors).toHaveLength(3);
      expect(reportBody.errors[0].message).toBe('Error 1');
      expect(reportBody.errors[1].message).toBe('Error 2');
      expect(reportBody.errors[2].message).toBe('Error 3');
    });

    it('should report aggregated errors', async () => {
      // Mock successful response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Create a promise that resolves when the aggregated error event is emitted
      const aggregatedErrorPromise = new Promise<any>((resolve) => {
        const aggregatedErrorHandler = (aggregatedError: any) => {
          resolve(aggregatedError);
        };
        errorHandlingService.onErrorAggregated(aggregatedErrorHandler);
      });

      // Create an error that will be repeated
      const error = new Error('Database connection failed');
      const context = {
          severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE
      };

      // Simulate multiple occurrences of the same error
      const numOccurrences = mockConfig.errorAggregationThreshold + 1;
      for (let i = 0; i < numOccurrences; i++) {
        await errorHandlingService.handleError(error, context);
      }

      // Wait for the aggregated error event
      const aggregatedError = await aggregatedErrorPromise;

      // Verify that fetch was called with aggregated error report
      expect(fetchMock).toHaveBeenCalledWith(
        mockConfig.errorReportingEndpoint,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('type')
        })
      );

      // Verify aggregated error report content
      const reportBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(reportBody).toMatchObject({
        type: 'aggregated',
        count: numOccurrences,
        error: expect.objectContaining({
          message: error.message,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.DATABASE
        })
      });
    });

    it('should report correlated errors', async () => {
      // Mock successful response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Create a promise that resolves when the correlated errors event is emitted
      const correlatedErrorsPromise = new Promise<any>((resolve) => {
        const correlatedErrorsHandler = (correlatedErrors: any) => {
          resolve(correlatedErrors);
        };
        errorHandlingService.onErrorsCorrelated(correlatedErrorsHandler);
      });

      // Create multiple related errors
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3')
      ];

      // Handle all errors with the same correlation ID
      const correlationId = 'corr123';
      await Promise.all(errors.map(error => 
        errorHandlingService.handleError(error, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.SYSTEM,
          correlationId
        })
      ));

      // Wait for the correlated errors event
      const correlatedErrors = await correlatedErrorsPromise;

      // Verify that fetch was called with correlated errors report
      expect(fetchMock).toHaveBeenCalledWith(
        mockConfig.errorReportingEndpoint,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('type')
        })
      );

      // Verify correlated errors report content
      const reportBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(reportBody).toMatchObject({
        type: 'correlated',
        count: errors.length,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: errors[0].message,
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.SYSTEM
          })
        ])
      });
    });
  });
}); 
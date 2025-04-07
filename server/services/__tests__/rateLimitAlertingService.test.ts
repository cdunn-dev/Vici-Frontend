import { RateLimitAlertingService, RateLimitAlert, RateLimitAlertConfig } from '../rateLimitAlertingService';
import { RateLimitMonitoringService } from '../rateLimitMonitoringService';
import { ErrorHandlingService, ErrorHandlingConfig, ErrorCategory, ErrorSeverity } from '../errorHandlingService';
import { RedisService } from '../redis';
import { EventEmitter } from 'events';
import { AuditLoggingService } from '../auditLoggingService';
import { Pool } from 'pg';

jest.mock('../rateLimitMonitoringService');
jest.mock('../errorHandlingService');
jest.mock('../redis');
jest.mock('../auditLoggingService');
jest.mock('pg');

describe('RateLimitAlertingService', () => {
  let alertingService: RateLimitAlertingService;
  let mockRateLimitMonitoringService: jest.Mocked<RateLimitMonitoringService>;
  let mockErrorHandlingService: jest.Mocked<ErrorHandlingService>;
  let mockRedis: jest.Mocked<RedisService>;
  let mockAuditLoggingService: jest.Mocked<AuditLoggingService>;
  let mockPool: jest.Mocked<Pool>;

  const defaultErrorConfig: ErrorHandlingConfig = {
    enabled: true,
    logToDatabase: true,
    logToFile: true,
    logFilePath: '/tmp/errors.log',
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
        maxAttempts: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        circuitBreaker: {
          enabled: true,
          failureThreshold: 3,
          resetTimeout: 30000
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = new Pool() as jest.Mocked<Pool>;
    mockAuditLoggingService = new AuditLoggingService(mockPool) as jest.Mocked<AuditLoggingService>;
    mockErrorHandlingService = ErrorHandlingService.getInstance(defaultErrorConfig, mockAuditLoggingService) as jest.Mocked<ErrorHandlingService>;
    mockRateLimitMonitoringService = RateLimitMonitoringService.getInstance(mockErrorHandlingService) as jest.Mocked<RateLimitMonitoringService>;
    mockRedis = RedisService.getInstance() as jest.Mocked<RedisService>;

    // Mock Redis methods
    mockRedis.set = jest.fn().mockResolvedValue('OK');
    mockRedis.get = jest.fn().mockResolvedValue(null);
    mockRedis.del = jest.fn().mockResolvedValue(1);

    alertingService = RateLimitAlertingService.getInstance(
      mockRateLimitMonitoringService,
      mockErrorHandlingService
    );
  });

  describe('alert handling', () => {
    it('should handle new alerts and emit events', async () => {
      const alertHandler = jest.fn();
      alertingService.on('alert', alertHandler);

      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'High rate limit hits detected',
        details: {
          identifier: 'test-user',
          tier: 'default',
          value: 0.15,
          threshold: 0.1
        }
      };

      // Simulate alert from monitoring service
      mockRateLimitMonitoringService.emit('alert', testAlert);

      expect(alertHandler).toHaveBeenCalled();
      const emittedAlert = alertHandler.mock.calls[0][0] as RateLimitAlert;
      expect(emittedAlert.type).toBe('HIGH_RATE_LIMIT_HITS');
      expect(emittedAlert.severity).toBe('error');
      expect(emittedAlert.status).toBe('active');
    });

    it('should respect cooldown period', async () => {
      const alertHandler = jest.fn();
      alertingService.on('alert', alertHandler);

      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'High rate limit hits detected',
        details: {
          identifier: 'test-user',
          value: 0.15,
          threshold: 0.1
        }
      };

      // Send multiple alerts in quick succession
      for (let i = 0; i < 10; i++) {
        mockRateLimitMonitoringService.emit('alert', testAlert);
      }

      // Should only emit one alert due to cooldown
      expect(alertHandler).toHaveBeenCalledTimes(1);
    });

    it('should determine severity based on ratio', async () => {
      const alertHandler = jest.fn();
      alertingService.on('alert', alertHandler);

      // Test warning severity (ratio < 1.5)
      const warningAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'High rate limit hits detected',
        details: {
          value: 0.12,
          threshold: 0.1
        }
      };
      mockRateLimitMonitoringService.emit('alert', warningAlert);
      expect(alertHandler.mock.calls[0][0].severity).toBe('warning');

      // Test error severity (1.5 <= ratio < 2)
      const errorAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'High rate limit hits detected',
        details: {
          value: 0.18,
          threshold: 0.1
        }
      };
      mockRateLimitMonitoringService.emit('alert', errorAlert);
      expect(alertHandler.mock.calls[1][0].severity).toBe('error');

      // Test critical severity (ratio >= 2)
      const criticalAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'High rate limit hits detected',
        details: {
          value: 0.25,
          threshold: 0.1
        }
      };
      mockRateLimitMonitoringService.emit('alert', criticalAlert);
      expect(alertHandler.mock.calls[2][0].severity).toBe('critical');
    });

    it('should store alerts in Redis', async () => {
      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'High rate limit hits detected',
        details: {
          value: 0.15,
          threshold: 0.1
        }
      };

      mockRateLimitMonitoringService.emit('alert', testAlert);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockRedis.set).toHaveBeenCalled();
      const setCall = mockRedis.set.mock.calls[0];
      expect(setCall[0]).toMatch(/^ratelimit:alert:/);
      expect(JSON.parse(setCall[1])).toHaveProperty('type', 'HIGH_RATE_LIMIT_HITS');
    });
  });

  describe('alert management', () => {
    it('should acknowledge alerts', async () => {
      const updateHandler = jest.fn();
      alertingService.on('alertUpdated', updateHandler);

      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'Test alert',
        details: {
          value: 0.15,
          threshold: 0.1
        }
      };

      mockRateLimitMonitoringService.emit('alert', testAlert);
      const emittedAlert = updateHandler.mock.calls[0][0] as RateLimitAlert;

      await alertingService.acknowledgeAlert(emittedAlert.id);
      expect(updateHandler).toHaveBeenCalledTimes(2);
      expect(updateHandler.mock.calls[1][0].status).toBe('acknowledged');
    });

    it('should resolve alerts', async () => {
      const updateHandler = jest.fn();
      alertingService.on('alertUpdated', updateHandler);

      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'Test alert',
        details: {
          value: 0.15,
          threshold: 0.1
        }
      };

      mockRateLimitMonitoringService.emit('alert', testAlert);
      const emittedAlert = updateHandler.mock.calls[0][0] as RateLimitAlert;

      await alertingService.resolveAlert(emittedAlert.id);
      expect(updateHandler).toHaveBeenCalledTimes(2);
      expect(updateHandler.mock.calls[1][0].status).toBe('resolved');
    });
  });

  describe('alert retrieval', () => {
    it('should return all alerts', () => {
      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'Test alert',
        details: {
          value: 0.15,
          threshold: 0.1
        }
      };

      mockRateLimitMonitoringService.emit('alert', testAlert);
      const alerts = alertingService.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('HIGH_RATE_LIMIT_HITS');
    });

    it('should return only active alerts', () => {
      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'Test alert',
        details: {
          value: 0.15,
          threshold: 0.1
        }
      };

      mockRateLimitMonitoringService.emit('alert', testAlert);
      const activeAlerts = alertingService.getActiveAlerts();
      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].status).toBe('active');
    });
  });

  describe('cleanup', () => {
    it('should cleanup old alerts', async () => {
      const testAlert = {
        type: 'HIGH_RATE_LIMIT_HITS',
        message: 'Test alert',
        details: {
          value: 0.15,
          threshold: 0.1
        }
      };

      mockRateLimitMonitoringService.emit('alert', testAlert);
      await alertingService.stop();
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  // Additional test cases for alert deduplication
  describe('Alert Deduplication', () => {
    it('should deduplicate identical alerts within cooldown period', async () => {
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      // First alert should be processed
      await alertingService.handleAlert(alertDetails);
      expect(alertingService['emit']).toHaveBeenCalledTimes(1);

      // Second identical alert within cooldown should be deduplicated
      await alertingService.handleAlert(alertDetails);
      expect(alertingService['emit']).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should not deduplicate alerts with different identifiers', async () => {
      const alertDetails1 = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier-1',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      const alertDetails2 = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier-2',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      // First alert
      await alertingService.handleAlert(alertDetails1);
      // Second alert with different identifier
      await alertingService.handleAlert(alertDetails2);
      
      expect(alertingService['emit']).toHaveBeenCalledTimes(2); // Called twice for different identifiers
    });

    it('should not deduplicate alerts with different types', async () => {
      const alertDetails1 = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      const alertDetails2 = {
        type: 'rate_limit_warning',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      // First alert
      await alertingService.handleAlert(alertDetails1);
      // Second alert with different type
      await alertingService.handleAlert(alertDetails2);
      
      expect(alertingService['emit']).toHaveBeenCalledTimes(2); // Called twice for different types
    });
  });

  // Additional test cases for alert expiration
  describe('Alert Expiration', () => {
    it('should not return expired alerts in getActiveAlerts', async () => {
      // Mock Redis to return an expired alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now() - 3600000 // 1 hour ago
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000
      }));

      const activeAlerts = await alertingService.getActiveAlerts();
      expect(activeAlerts).toHaveLength(0); // No active alerts should be returned
    });

    it('should properly clean up expired alerts', async () => {
      // Mock Redis to return an expired alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now() - 3600000 // 1 hour ago
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000
      }));

      // Mock Redis to return an active alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id-2',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier-2',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now() // Current time
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      // Mock Redis keys to return both alert IDs
      mockRedis.keys.mockResolvedValueOnce(['alert:test-id', 'alert:test-id-2']);

      // Call cleanup
      await alertingService['cleanup']();

      // Verify that only the expired alert was deleted
      expect(mockRedis.del).toHaveBeenCalledWith('alert:test-id');
      expect(mockRedis.del).not.toHaveBeenCalledWith('alert:test-id-2');
    });
  });

  // Additional test cases for error handling
  describe('Error Handling', () => {
    it('should handle Redis operation failures gracefully', async () => {
      // Mock Redis to throw an error
      mockRedis.set.mockRejectedValueOnce(new Error('Redis connection failed'));

      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      // Should not throw an error
      await expect(alertingService.handleAlert(alertDetails)).resolves.not.toThrow();
      
      // Should log the error
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });

    it('should handle invalid alerts from monitoring service', async () => {
      const invalidAlertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          // Missing required fields
          timestamp: Date.now()
        }
      };

      // Should not throw an error
      await expect(alertingService.handleAlert(invalidAlertDetails)).resolves.not.toThrow();
      
      // Should log the error
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });

    it('should handle errors during alert acknowledgment', async () => {
      // Mock Redis to throw an error during acknowledgment
      mockRedis.get.mockRejectedValueOnce(new Error('Redis connection failed'));

      // Should not throw an error
      await expect(alertingService.acknowledgeAlert('test-id')).resolves.not.toThrow();
      
      // Should log the error
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  // Additional test cases for edge cases
  describe('Edge Cases', () => {
    it('should handle empty alert details', async () => {
      const emptyAlertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {}
      };

      // Should not throw an error
      await expect(alertingService.handleAlert(emptyAlertDetails)).resolves.not.toThrow();
      
      // Should log the error
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });

    it('should handle malformed alert details', async () => {
      const malformedAlertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 'not-a-number',
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };

      // Should not throw an error
      await expect(alertingService.handleAlert(malformedAlertDetails)).resolves.not.toThrow();
      
      // Should log the error
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });

    it('should handle extreme ratio values', async () => {
      const highRatioAlert = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier-high',
        details: {
          current: 1000,
          limit: 10,
          window: 60000,
          timestamp: Date.now()
        }
      };

      const lowRatioAlert = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier-low',
        details: {
          current: 1,
          limit: 1000,
          window: 60000,
          timestamp: Date.now()
        }
      };

      // Process high ratio alert
      await alertingService.handleAlert(highRatioAlert);
      expect(alertingService['emit']).toHaveBeenCalledWith('alert', expect.objectContaining({
        severity: 'critical'
      }));

      // Process low ratio alert
      await alertingService.handleAlert(lowRatioAlert);
      expect(alertingService['emit']).toHaveBeenCalledWith('alert', expect.objectContaining({
        severity: 'low'
      }));
    });

    it('should handle service restart', async () => {
      // Stop the service
      await alertingService.stop();
      
      // Verify cleanup was called
      expect(mockRedis.keys).toHaveBeenCalled();
      
      // Start the service again
      await alertingService.start();
      
      // Verify monitoring service was started
      expect(mockRateLimitMonitoringService.start).toHaveBeenCalled();
    });
  });

  // Additional test cases for concurrency
  describe('Concurrency', () => {
    it('should handle multiple alerts simultaneously', async () => {
      const alertPromises = [];
      
      // Create 10 alerts to process simultaneously
      for (let i = 0; i < 10; i++) {
        const alertDetails = {
          type: 'rate_limit_exceeded',
          identifier: `test-identifier-${i}`,
          details: {
            current: 100,
            limit: 50,
            window: 60000,
            timestamp: Date.now()
          }
        };
        
        alertPromises.push(alertingService.handleAlert(alertDetails));
      }
      
      // Wait for all alerts to be processed
      await Promise.all(alertPromises);
      
      // Verify that all alerts were processed
      expect(alertingService['emit']).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent acknowledge/resolve operations', async () => {
      // Mock Redis to return an alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      // Perform concurrent acknowledge and resolve operations
      const acknowledgePromise = alertingService.acknowledgeAlert('test-id');
      const resolvePromise = alertingService.resolveAlert('test-id');
      
      // Wait for both operations to complete
      await Promise.all([acknowledgePromise, resolvePromise]);
      
      // Verify that the alert was updated
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should handle race conditions in alert status updates', async () => {
      // Mock Redis to return an alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      // Mock Redis to return a different status when getting the alert again
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        },
        severity: 'high',
        status: 'acknowledged', // Different status
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      // Acknowledge the alert
      await alertingService.acknowledgeAlert('test-id');
      
      // Verify that the alert was updated with the correct status
      expect(mockRedis.set).toHaveBeenCalledWith(
        'alert:test-id',
        expect.stringContaining('"status":"acknowledged"'),
        expect.any(Object)
      );
    });
  });

  // Additional test cases for configuration
  describe('Configuration', () => {
    it('should respect custom configuration values', async () => {
      // Create a service with custom configuration
      const customService = new RateLimitAlertingService(
        mockRateLimitMonitoringService,
        mockErrorHandlingService,
        mockRedis,
        mockAuditLoggingService,
        {
          alertTTL: 3600, // 1 hour
          cleanupInterval: 300000, // 5 minutes
          cooldownPeriod: 300000 // 5 minutes
        }
      );
      
      // Start the service
      await customService.start();
      
      // Verify that the custom configuration was used
      expect(customService['config'].alertTTL).toBe(3600);
      expect(customService['config'].cleanupInterval).toBe(300000);
      expect(customService['config'].cooldownPeriod).toBe(300000);
      
      // Stop the service
      await customService.stop();
    });

    it('should handle configuration updates', async () => {
      // Create a service with initial configuration
      const configurableService = new RateLimitAlertingService(
        mockRateLimitMonitoringService,
        mockErrorHandlingService,
        mockRedis,
        mockAuditLoggingService,
        {
          alertTTL: 3600,
          cleanupInterval: 300000,
          cooldownPeriod: 300000
        }
      );
      
      // Start the service
      await configurableService.start();
      
      // Update the configuration
      configurableService.updateConfig({
        alertTTL: 7200, // 2 hours
        cleanupInterval: 600000, // 10 minutes
        cooldownPeriod: 600000 // 10 minutes
      });
      
      // Verify that the configuration was updated
      expect(configurableService['config'].alertTTL).toBe(7200);
      expect(configurableService['config'].cleanupInterval).toBe(600000);
      expect(configurableService['config'].cooldownPeriod).toBe(600000);
      
      // Stop the service
      await configurableService.stop();
    });

    it('should validate configuration parameters', async () => {
      // Create a service with invalid configuration
      const invalidService = new RateLimitAlertingService(
        mockRateLimitMonitoringService,
        mockErrorHandlingService,
        mockRedis,
        mockAuditLoggingService,
        {
          alertTTL: -1, // Invalid TTL
          cleanupInterval: 300000,
          cooldownPeriod: 300000
        }
      );
      
      // Start the service should use default values for invalid parameters
      await invalidService.start();
      
      // Verify that default values were used for invalid parameters
      expect(invalidService['config'].alertTTL).toBe(3600); // Default value
      
      // Stop the service
      await invalidService.stop();
    });
  });

  // Additional test cases for integration
  describe('Integration', () => {
    it('should properly integrate with monitoring service', async () => {
      // Verify that the monitoring service was started
      expect(mockRateLimitMonitoringService.start).toHaveBeenCalled();
      
      // Verify that the monitoring service event listener was set up
      expect(mockRateLimitMonitoringService.on).toHaveBeenCalledWith('rate_limit_exceeded', expect.any(Function));
      
      // Get the event handler function
      const eventHandler = mockRateLimitMonitoringService.on.mock.calls[0][1];
      
      // Create an alert
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };
      
      // Call the event handler directly
      await eventHandler(alertDetails);
      
      // Verify that the alert was processed
      expect(alertingService['emit']).toHaveBeenCalledWith('alert', expect.any(Object));
    });

    it('should properly integrate with error handling service', async () => {
      // Create an alert with invalid details to trigger error handling
      const invalidAlertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          // Missing required fields
          timestamp: Date.now()
        }
      };
      
      // Process the invalid alert
      await alertingService.handleAlert(invalidAlertDetails);
      
      // Verify that the error handling service was called
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });

    it('should properly integrate with audit logging service', async () => {
      // Create an alert
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };
      
      // Process the alert
      await alertingService.handleAlert(alertDetails);
      
      // Verify that the audit logging service was called
      expect(mockAuditLoggingService.log).toHaveBeenCalled();
    });
  });

  // Additional test cases for performance
  describe('Performance', () => {
    it('should handle high alert volume', async () => {
      const alertPromises = [];
      
      // Create 100 alerts to process
      for (let i = 0; i < 100; i++) {
        const alertDetails = {
          type: 'rate_limit_exceeded',
          identifier: `test-identifier-${i}`,
          details: {
            current: 100,
            limit: 50,
            window: 60000,
            timestamp: Date.now()
          }
        };
        
        alertPromises.push(alertingService.handleAlert(alertDetails));
      }
      
      // Wait for all alerts to be processed
      await Promise.all(alertPromises);
      
      // Verify that all alerts were processed
      expect(alertingService['emit']).toHaveBeenCalledTimes(100);
    });

    it('should handle large numbers of alerts in Redis', async () => {
      // Mock Redis to return 1000 alerts
      const mockAlerts = [];
      for (let i = 0; i < 1000; i++) {
        mockAlerts.push(`alert:test-id-${i}`);
      }
      
      mockRedis.keys.mockResolvedValueOnce(mockAlerts);
      
      // Mock Redis to return an alert for each key
      for (let i = 0; i < 1000; i++) {
        mockRedis.get.mockResolvedValueOnce(JSON.stringify({
          id: `test-id-${i}`,
          type: 'rate_limit_exceeded',
          identifier: `test-identifier-${i}`,
          details: {
            current: 100,
            limit: 50,
            window: 60000,
            timestamp: Date.now()
          },
          severity: 'high',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }));
      }
      
      // Get all alerts
      const alerts = await alertingService.getAllAlerts();
      
      // Verify that all alerts were retrieved
      expect(alerts).toHaveLength(1000);
    });

    it('should handle Redis operation performance', async () => {
      // Create an alert
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };
      
      // Process the alert
      const startTime = Date.now();
      await alertingService.handleAlert(alertDetails);
      const endTime = Date.now();
      
      // Verify that the operation completed in a reasonable time
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  // Additional test cases for recovery
  describe('Recovery', () => {
    it('should recover from Redis connection failure', async () => {
      // Mock Redis to throw an error on the first call
      mockRedis.set.mockRejectedValueOnce(new Error('Redis connection failed'));
      
      // Mock Redis to succeed on the second call
      mockRedis.set.mockResolvedValueOnce('OK');
      
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };
      
      // Process the alert
      await alertingService.handleAlert(alertDetails);
      
      // Verify that the error was handled
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
      
      // Verify that the service continued to function
      expect(alertingService['emit']).toHaveBeenCalled();
    });

    it('should recover alert state after service restart', async () => {
      // Stop the service
      await alertingService.stop();
      
      // Mock Redis to return an alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));
      
      // Start the service again
      await alertingService.start();
      
      // Get all alerts
      const alerts = await alertingService.getAllAlerts();
      
      // Verify that the alert was recovered
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('test-id');
    });

    it('should handle partial failures during alert processing', async () => {
      // Mock Redis to throw an error on set but succeed on get
      mockRedis.set.mockRejectedValueOnce(new Error('Redis set failed'));
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));
      
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        }
      };
      
      // Process the alert
      await alertingService.handleAlert(alertDetails);
      
      // Verify that the error was handled
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
      
      // Verify that the service continued to function
      expect(alertingService['emit']).toHaveBeenCalled();
    });
  });

  // Additional test cases for security
  describe('Security', () => {
    it('should sanitize alert data', async () => {
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now(),
          // Include potentially sensitive data
          user: {
            id: 123,
            email: 'test@example.com',
            password: 'password123'
          }
        }
      };
      
      // Process the alert
      await alertingService.handleAlert(alertDetails);
      
      // Verify that the alert was processed
      expect(alertingService['emit']).toHaveBeenCalled();
      
      // Verify that sensitive data was not included in the emitted alert
      const emittedAlert = alertingService['emit'].mock.calls[0][1];
      expect(emittedAlert.details.user).toBeUndefined();
    });

    it('should enforce access control for alert operations', async () => {
      // Mock Redis to return an alert
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        id: 'test-id',
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now()
        },
        severity: 'high',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));
      
      // Acknowledge the alert
      await alertingService.acknowledgeAlert('test-id');
      
      // Verify that the audit logging service was called with access control information
      expect(mockAuditLoggingService.log).toHaveBeenCalledWith(
        expect.stringContaining('alert acknowledged'),
        expect.objectContaining({
          action: 'acknowledge_alert',
          resourceId: 'test-id'
        })
      );
    });

    it('should handle sensitive information in alerts', async () => {
      const alertDetails = {
        type: 'rate_limit_exceeded',
        identifier: 'test-identifier',
        details: {
          current: 100,
          limit: 50,
          window: 60000,
          timestamp: Date.now(),
          // Include sensitive information
          apiKey: 'secret-api-key',
          token: 'secret-token'
        }
      };
      
      // Process the alert
      await alertingService.handleAlert(alertDetails);
      
      // Verify that the alert was processed
      expect(alertingService['emit']).toHaveBeenCalled();
      
      // Verify that sensitive information was not included in the emitted alert
      const emittedAlert = alertingService['emit'].mock.calls[0][1];
      expect(emittedAlert.details.apiKey).toBeUndefined();
      expect(emittedAlert.details.token).toBeUndefined();
    });
  });
}); 
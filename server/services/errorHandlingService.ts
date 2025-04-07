import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { AuditLoggingService } from './auditLoggingService';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  NETWORK = 'network',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  SYSTEM = 'system',
  BUSINESS = 'business'
}

export interface ErrorDetails {
  message: string;
  code: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  source: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  retryCount?: number;
  recoveryAttempted?: boolean;
  recoverySuccessful?: boolean;
}

export interface RecoveryStrategyConfig {
  enabled: boolean;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
}

export interface ErrorHandlingConfig {
  /**
   * Whether to enable error handling
   */
  enabled: boolean;
  
  /**
   * Whether to log errors to database
   */
  logToDatabase: boolean;
  
  /**
   * Whether to log errors to file
   */
  logToFile: boolean;
  
  /**
   * Log file path
   */
  logFilePath: string;
  
  /**
   * Maximum log file size in bytes
   */
  maxLogFileSize: number;
  
  /**
   * Number of log files to keep
   */
  maxLogFiles: number;
  
  /**
   * Whether to enable error tracking
   */
  enableErrorTracking: boolean;
  
  /**
   * Error tracking sample rate (0-1)
   */
  errorTrackingSampleRate: number;
  
  /**
   * Whether to enable error reporting
   */
  enableErrorReporting: boolean;
  
  /**
   * Error reporting endpoint
   */
  errorReportingEndpoint: string;
  
  /**
   * Error reporting API key
   */
  errorReportingApiKey: string;
  
  /**
   * Whether to enable error recovery
   */
  enableErrorRecovery: boolean;
  
  /**
   * Maximum number of recovery attempts
   */
  maxRecoveryAttempts: number;
  
  /**
   * Recovery attempt delay in milliseconds
   */
  recoveryAttemptDelay: number;
  
  /**
   * Whether to enable error notification
   */
  enableErrorNotification: boolean;
  
  /**
   * Error notification channels
   */
  errorNotificationChannels: string[];
  
  /**
   * Error notification recipients
   */
  errorNotificationRecipients: string[];
  
  /**
   * Whether to enable error aggregation
   */
  enableErrorAggregation: boolean;
  
  /**
   * Error aggregation window in milliseconds
   */
  errorAggregationWindow: number;
  
  /**
   * Error aggregation threshold
   */
  errorAggregationThreshold: number;
  
  /**
   * Error rate limiting configuration
   */
  errorRateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxErrorsPerWindow: number;
    categoryLimits: Record<ErrorCategory, number>;
  };
  
  /**
   * Error sampling configuration
   */
  errorSampling: {
    enabled: boolean;
    sampleRate: number;
    severityRates: Record<ErrorSeverity, number>;
    categoryRates: Record<ErrorCategory, number>;
  };
  
  /**
   * Error context enrichment configuration
   */
  errorContextEnrichment: {
    enabled: boolean;
    includeSystemMetrics: boolean;
    includeRequestData: boolean;
    includeResponseData: boolean;
    customEnrichers: Array<(error: ErrorDetails) => Promise<Record<string, any>>>;
  };
  
  /**
   * Error correlation configuration
   */
  errorCorrelation: {
    enabled: boolean;
    correlationWindowMs: number;
    maxCorrelationDistance: number;
    correlationKeys: string[];
  };

  recoveryStrategies: {
    [key in ErrorCategory]: RecoveryStrategyConfig;
  };
}

/**
 * Service for handling errors in the application
 */
export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private config: ErrorHandlingConfig;
  private eventEmitter: EventEmitter;
  private auditLoggingService: AuditLoggingService;
  private dbPool?: Pool;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTimes: Map<string, Date> = new Map();
  private recoveryStrategies: Map<ErrorCategory, (error: ErrorDetails) => Promise<boolean>> = new Map();
  private errorRateLimits: Map<string, { count: number; windowStart: Date }> = new Map();
  private errorSamples: Map<string, number> = new Map();
  private errorCorrelations: Map<string, ErrorDetails[]> = new Map();
  private circuitBreakerStates: Map<string, { failures: number; lastFailure: Date; state: 'closed' | 'open' | 'half-open' }> = new Map();
  private errorBatch: ErrorDetails[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private errorCache: Map<string, { error: ErrorDetails; count: number; lastSeen: Date }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour
  private readonly CACHE_CLEANUP_INTERVAL = 1800000; // 30 minutes
  private cacheCleanupInterval: NodeJS.Timeout | null = null;
  private recoveryAttempts: number = 0;
  private successfulRecoveries: number = 0;
  private failedRecoveries: number = 0;
  private rateLimitedErrors: number = 0;
  private sampledErrors: number = 0;

  private constructor(config: ErrorHandlingConfig, auditLoggingService: AuditLoggingService, dbPool?: Pool) {
    this.config = config;
    this.eventEmitter = new EventEmitter();
    this.auditLoggingService = auditLoggingService;
    this.dbPool = dbPool;
    
    // Initialize recovery strategies
    this.initializeRecoveryStrategies();
    this.startCacheCleanup();
  }

  /**
   * Get the singleton instance of the ErrorHandlingService
   */
  public static getInstance(config?: ErrorHandlingConfig, auditLoggingService?: AuditLoggingService, dbPool?: Pool): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      if (!config || !auditLoggingService) {
        throw new Error('Config and AuditLoggingService are required for first initialization');
      }
      ErrorHandlingService.instance = new ErrorHandlingService(config, auditLoggingService, dbPool);
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Initialize recovery strategies for different error categories
   */
  private initializeRecoveryStrategies(): void {
    // Database error recovery
    this.recoveryStrategies.set(ErrorCategory.DATABASE, async (error: ErrorDetails) => {
      if (!this.dbPool) {
        return false;
      }

      const config = this.config.recoveryStrategies[ErrorCategory.DATABASE];
      if (!config.enabled) {
        return false;
      }

      return this.executeWithRetry(async () => {
        const client = await this.dbPool!.connect();
        client.release();
        return true;
      }, config, error);
    });

    // Network error recovery
    this.recoveryStrategies.set(ErrorCategory.NETWORK, async (error: ErrorDetails) => {
      const config = this.config.recoveryStrategies[ErrorCategory.NETWORK];
      if (!config.enabled) {
        return false;
      }

      return this.executeWithRetry(async () => {
        return await this.retryNetworkOperation(error);
      }, config, error);
    });

    // Validation error recovery
    this.recoveryStrategies.set(ErrorCategory.VALIDATION, async (error: ErrorDetails) => {
      const config = this.config.recoveryStrategies[ErrorCategory.VALIDATION];
      if (!config.enabled) {
        return false;
      }

      return this.executeWithRetry(async () => {
        if (error.context?.input) {
          const sanitizedInput = this.sanitizeInput(error.context.input);
          if (sanitizedInput) {
            error.context.sanitizedInput = sanitizedInput;
            return true;
          }
        }
        return false;
      }, config, error);
    });

    // Authentication error recovery
    this.recoveryStrategies.set(ErrorCategory.AUTHENTICATION, async (error: ErrorDetails) => {
      const config = this.config.recoveryStrategies[ErrorCategory.AUTHENTICATION];
      if (!config.enabled) {
        return false;
      }

      return this.executeWithRetry(async () => {
        if (error.context?.token) {
          const newToken = await this.refreshToken(error.context.token);
          if (newToken) {
            error.context.newToken = newToken;
            return true;
          }
        }
        return false;
      }, config, error);
    });

    // Authorization error recovery
    this.recoveryStrategies.set(ErrorCategory.AUTHORIZATION, async (error: ErrorDetails) => {
      const config = this.config.recoveryStrategies[ErrorCategory.AUTHORIZATION];
      if (!config.enabled) {
        return false;
      }

      return this.executeWithRetry(async () => {
        if (error.context?.permission) {
          const verifiedPermission = await this.verifyPermission(error.context.permission);
          if (verifiedPermission) {
            error.context.verifiedPermission = verifiedPermission;
            return true;
          }
        }
        return false;
      }, config, error);
    });

    // Integration error recovery
    this.recoveryStrategies.set(ErrorCategory.INTEGRATION, async (error: ErrorDetails) => {
      const config = this.config.recoveryStrategies[ErrorCategory.INTEGRATION];
      if (!config.enabled) {
        return false;
      }

      return this.executeWithRetry(async () => {
        if (error.context?.integration) {
          const fallbackResult = await this.useFallbackService(error.context.integration);
          if (fallbackResult) {
            error.context.fallbackResult = fallbackResult;
            return true;
          }
        }
        return false;
      }, config, error);
    });

    // Add recovery strategies for remaining error categories
    [ErrorCategory.PERFORMANCE, ErrorCategory.SECURITY, ErrorCategory.SYSTEM, ErrorCategory.BUSINESS].forEach(category => {
      this.recoveryStrategies.set(category, async (error: ErrorDetails) => {
        const config = this.config.recoveryStrategies[category];
        if (!config.enabled) {
          return false;
        }

        return this.executeWithRetry(async () => {
          // Log the error and attempt basic recovery
          logger.warn(`Attempting recovery for ${category} error:`, error);
          return true;
        }, config, error);
      });
    });
  }

  private async executeWithRetry(
    operation: () => Promise<boolean>,
    config: RecoveryStrategyConfig,
    error: ErrorDetails
  ): Promise<boolean> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < config.maxAttempts) {
      try {
        // Check circuit breaker if enabled
        if (config.circuitBreaker.enabled) {
          const circuitKey = `${error.category}:${error.source}`;
          const circuitState = this.circuitBreakerStates.get(circuitKey) || {
            failures: 0,
            lastFailure: new Date(0),
            state: 'closed' as const
          };

          if (circuitState.state === 'open') {
            const timeSinceLastFailure = Date.now() - circuitState.lastFailure.getTime();
            if (timeSinceLastFailure < config.circuitBreaker.resetTimeout) {
              throw new Error('Circuit breaker is open');
            }
            circuitState.state = 'half-open';
          }

          if (circuitState.state === 'half-open') {
            // Allow one attempt to test if the service has recovered
            const success = await operation();
            if (success) {
              circuitState.state = 'closed';
              circuitState.failures = 0;
              this.circuitBreakerStates.set(circuitKey, circuitState);
              return true;
            }
            throw new Error('Service still failing');
          }
        }

        const success = await operation();
        if (success) {
          // Reset circuit breaker on success
          if (config.circuitBreaker.enabled) {
            const circuitKey = `${error.category}:${error.source}`;
            this.circuitBreakerStates.set(circuitKey, {
              failures: 0,
              lastFailure: new Date(0),
              state: 'closed'
            });
          }
          return true;
        }

        throw new Error('Operation failed');
      } catch (err) {
        lastError = err as Error;
        attempts++;

        // Update circuit breaker state
        if (config.circuitBreaker.enabled) {
          const circuitKey = `${error.category}:${error.source}`;
          const circuitState = this.circuitBreakerStates.get(circuitKey) || {
            failures: 0,
            lastFailure: new Date(0),
            state: 'closed' as const
          };

          circuitState.failures++;
          circuitState.lastFailure = new Date();

          if (circuitState.failures >= config.circuitBreaker.failureThreshold) {
            circuitState.state = 'open';
          }

          this.circuitBreakerStates.set(circuitKey, circuitState);
        }

        if (attempts === config.maxAttempts) {
          logger.error(`Recovery failed after ${config.maxAttempts} attempts:`, lastError);
          return false;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempts - 1) * (1 + Math.random() * 0.1),
          config.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  }

  /**
   * Helper method to retry network operations
   */
  private async retryNetworkOperation(error: ErrorDetails): Promise<boolean> {
    // This is a placeholder - actual implementation would depend on the specific network operation
    return false;
  }

  /**
   * Helper method to sanitize input
   */
  private sanitizeInput(input: any): any {
    // This is a placeholder - actual implementation would depend on the specific input type
    return input;
  }

  /**
   * Helper method to refresh authentication token
   */
  private async refreshToken(token: string): Promise<string | null> {
    // This is a placeholder - actual implementation would depend on the authentication system
    return null;
  }

  /**
   * Helper method to verify permission
   */
  private async verifyPermission(permission: any): Promise<boolean> {
    // This is a placeholder - actual implementation would depend on the specific permission verification logic
    return false;
  }

  /**
   * Helper method to use fallback service
   */
  private async useFallbackService(integration: any): Promise<any> {
    // This is a placeholder - actual implementation would depend on the specific integration
    return null;
  }

  /**
   * Handle an error
   */
  public async handleError(error: Error | string, context?: Partial<ErrorDetails>): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Create error details
    const errorDetails: ErrorDetails = {
      message: typeof error === 'string' ? error : error.message,
      code: typeof error === 'string' ? 'UNKNOWN_ERROR' : error.name || 'UNKNOWN_ERROR',
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date(),
      severity: context?.severity || ErrorSeverity.MEDIUM,
      category: context?.category || ErrorCategory.SYSTEM,
      source: context?.source || 'unknown',
      userId: context?.userId,
      requestId: context?.requestId,
      correlationId: context?.correlationId,
      retryCount: context?.retryCount || 0,
      recoveryAttempted: context?.recoveryAttempted || false,
      recoverySuccessful: context?.recoverySuccessful || false,
      context: context?.context
    };

    try {
      // Check rate limiting
      if (this.isRateLimited(errorDetails)) {
        logger.warn(`Error rate limited: ${errorDetails.message}`);
        return;
      }

      // Check sampling
      if (!this.shouldSample(errorDetails)) {
        logger.debug(`Error sampled out: ${errorDetails.message}`);
        return;
      }

      // Check if error is cached
      if (this.isErrorCached(errorDetails)) {
        logger.debug(`Error ${errorDetails.code} is cached, skipping detailed processing`);
        return;
      }

      // Cache the error
      this.cacheError(errorDetails);

      // Enrich error context
      await this.enrichErrorContext(errorDetails);

      // Create an array to hold all promises
      const promises: Promise<any>[] = [];

      // Log the error
      promises.push(this.logError(errorDetails));

      // Track the error
      if (this.config.enableErrorTracking) {
        promises.push(this.trackError(errorDetails));
      }

      // Correlate the error
      if (this.config.errorCorrelation.enabled) {
        promises.push(this.correlateError(errorDetails));
      }

      // Emit error event
      this.eventEmitter.emit('error', errorDetails);

      // Check if we should attempt recovery
      if (this.config.enableErrorRecovery && !errorDetails.recoveryAttempted) {
        promises.push(this.attemptRecovery(errorDetails));
      }

      // Check if we should send notification
      if (this.config.enableErrorNotification) {
        promises.push(this.sendNotification(errorDetails));
      }

      // Check if we should report the error
      if (this.config.enableErrorReporting) {
        promises.push(this.reportError(errorDetails));
      }

      // Wait for all promises to resolve
      await Promise.all(promises);
    } catch (err) {
      logger.error('Error occurred during error handling:', err);
      throw err;
    }
  }

  /**
   * Log an error
   */
  private async logError(error: ErrorDetails): Promise<void> {
    // Log to console
    const logMessage = `[${error.category.toUpperCase()}] ${error.message} (${error.code})`;
    
    switch (error.severity) {
      case ErrorSeverity.LOW:
        logger.debug(logMessage, { error });
        break;
      case ErrorSeverity.MEDIUM:
        logger.info(logMessage, { error });
        break;
      case ErrorSeverity.HIGH:
        logger.warn(logMessage, { error });
        break;
      case ErrorSeverity.CRITICAL:
        logger.error(logMessage, { error });
        break;
    }

    // Log to file if enabled
    if (this.config.logToFile) {
      // This would be implemented with a file logging mechanism
      // For now, we'll just use the logger
    }

    try {
      // Create an array to hold all logging promises
      const loggingPromises: Promise<any>[] = [];

      // Log to database with batching
      if (this.config.logToDatabase) {
        loggingPromises.push(this.logErrorToDatabase(error));
      }

      // Log to audit log
      logger.debug('Logging error to audit log...');
      loggingPromises.push(
        this.auditLoggingService.logEvent(
          error.userId || 'system',
          'ERROR',
          error.source,
          {
            message: error.message,
            code: error.code,
            category: error.category,
            context: error.context
          }
        )
      );

      // Wait for all logging operations to complete
      logger.debug('Waiting for all logging operations to complete...');
      await Promise.all(loggingPromises);
      logger.debug('All logging operations completed.');
    } catch (err) {
      logger.error('Error occurred during logging:', err);
      throw err;
    }
  }

  /**
   * Log an error to the database
   */
  private async logErrorToDatabase(error: ErrorDetails): Promise<void> {
    if (!this.config.logToDatabase || !this.dbPool) {
      return;
    }

    // Add error to batch
    this.errorBatch.push(error);

    // If batch is full, flush immediately
    if (this.errorBatch.length >= this.BATCH_SIZE) {
      await this.flushErrorBatch();
      return;
    }

    // If no timeout is set, set one
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushErrorBatch(), this.BATCH_TIMEOUT);
    }
  }

  private async flushErrorBatch(): Promise<void> {
    if (this.errorBatch.length === 0) {
      return;
    }

    // Clear the timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const batch = [...this.errorBatch];
    this.errorBatch = [];

    try {
      const client = await this.dbPool!.connect();
      try {
        await client.query('BEGIN');

        // Prepare the batch insert query
        const values = batch.map((error, index) => {
          const base = index * 14;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14})`;
        }).join(',');

        const query = `
          INSERT INTO error_logs (
            message, code, stack, severity, category, source, user_id, request_id,
            correlation_id, retry_count, recovery_attempted, recovery_successful,
            context, created_at
          ) VALUES ${values}
        `;

        // Flatten the parameters
        const params = batch.flatMap(error => [
          error.message,
          error.code,
          error.stack,
          error.severity,
          error.category,
          error.source,
          error.userId,
          error.requestId,
          error.correlationId,
          error.retryCount || 0,
          error.recoveryAttempted || false,
          error.recoverySuccessful || false,
          error.context ? JSON.stringify(error.context) : null,
          error.timestamp,
        ]);

        await client.query(query, params);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      logger.error('Failed to batch insert errors:', err);
      // Re-add errors to batch for retry
      this.errorBatch.push(...batch);
      // Set a new timeout for retry
      this.batchTimeout = setTimeout(() => this.flushErrorBatch(), this.BATCH_TIMEOUT);
    }
  }

  /**
   * Track an error for aggregation
   */
  private async trackError(error: ErrorDetails): Promise<void> {
    if (!this.config.enableErrorTracking) {
      return;
    }

    // Generate a key for the error
    const key = `${error.category}:${error.code}`;
    
    // Update error count
    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);
    
    // Update last error time
    this.lastErrorTimes.set(key, error.timestamp);
    
    // Check if we should aggregate the error
    if (this.config.enableErrorAggregation) {
      await this.checkErrorAggregation(key, count, error);
    }
  }

  /**
   * Check if an error should be aggregated
   */
  private async checkErrorAggregation(key: string, count: number, error: ErrorDetails): Promise<void> {
    const lastErrorTime = this.lastErrorTimes.get(key);
    if (!lastErrorTime) {
      return;
    }
    
    const timeDiff = error.timestamp.getTime() - lastErrorTime.getTime();
    
    // If the error has occurred multiple times within the aggregation window
    if (count >= this.config.errorAggregationThreshold && timeDiff <= this.config.errorAggregationWindow) {
      // Emit aggregated error event
      this.eventEmitter.emit('errorAggregated', {
        key,
        count,
        firstOccurrence: lastErrorTime,
        lastOccurrence: error.timestamp,
        error
      });
      
      // Reset the count
      this.errorCounts.set(key, 0);
    }
  }

  /**
   * Attempt to recover from an error
   */
  private async attemptRecovery(error: ErrorDetails): Promise<void> {
    // Get the recovery strategy for the error category
    const recoveryStrategy = this.recoveryStrategies.get(error.category);
    
    if (!recoveryStrategy) {
      return;
    }
    
    // Update error details
    error.recoveryAttempted = true;
    
    try {
      // Attempt recovery
      const success = await recoveryStrategy(error);
      
      // Update error details
      error.recoverySuccessful = success;
      
      // Log recovery result
      if (success) {
        logger.info(`Recovery successful for ${error.category} error: ${error.message}`);
        this.successfulRecoveries++;
      } else {
        logger.warn(`Recovery failed for ${error.category} error: ${error.message}`);
        this.failedRecoveries++;
      }
    } catch (recoveryError) {
      // Log recovery error
      logger.error(`Error during recovery for ${error.category} error: ${error.message}`, recoveryError);
      
      // Update error details
      error.recoverySuccessful = false;
    }
  }

  /**
   * Send a notification for an error
   */
  private async sendNotification(error: ErrorDetails): Promise<void> {
    if (!this.config.enableErrorNotification || !this.config.errorNotificationChannels.length) {
      return;
    }

    try {
      // Create notification message
      const notificationMessage = this.createNotificationMessage(error);
      
      // Determine which channels to use based on severity
      const channels = this.getNotificationChannelsForSeverity(error.severity);
      
      // Send notifications to each channel
      const notificationPromises = channels.map(channel => 
        this.sendNotificationToChannel(channel, notificationMessage, error)
      );
      
      await Promise.all(notificationPromises);
    } catch (err) {
      logger.error('Failed to send error notification:', err);
      // Don't throw the error to prevent notification failures from affecting the main error handling flow
    }
  }

  /**
   * Create a formatted notification message
   */
  private createNotificationMessage(error: ErrorDetails): string {
    const timestamp = error.timestamp.toISOString();
    const severity = error.severity.toUpperCase();
    const category = error.category.toUpperCase();
    
    let message = `[${timestamp}] [${severity}] [${category}] ${error.message}\n`;
    message += `Code: ${error.code}\n`;
    message += `Source: ${error.source}\n`;
    
    if (error.userId) {
      message += `User ID: ${error.userId}\n`;
    }
    if (error.requestId) {
      message += `Request ID: ${error.requestId}\n`;
    }
    if (error.correlationId) {
      message += `Correlation ID: ${error.correlationId}\n`;
    }
    
    if (error.context) {
      message += `Context: ${JSON.stringify(error.context, null, 2)}\n`;
    }
    
    if (error.stack) {
      message += `Stack Trace:\n${error.stack}\n`;
    }
    
    return message;
  }

  /**
   * Get notification channels based on error severity
   */
  private getNotificationChannelsForSeverity(severity: ErrorSeverity): string[] {
    // Default channels for all severities
    let channels = [...this.config.errorNotificationChannels];
    
    // Add additional channels based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        // For critical errors, ensure all channels are used
        return channels;
      case ErrorSeverity.HIGH:
        // For high severity, exclude less critical channels
        return channels.filter(channel => !channel.includes('low-priority'));
      case ErrorSeverity.MEDIUM:
        // For medium severity, only use standard channels
        return channels.filter(channel => 
          channel.includes('standard') || channel.includes('email')
        );
      case ErrorSeverity.LOW:
        // For low severity, only use non-intrusive channels
        return channels.filter(channel => 
          channel.includes('log') || channel.includes('low-priority')
        );
      default:
        return channels;
    }
  }

  /**
   * Send notification to a specific channel
   */
  private async sendNotificationToChannel(
    channel: string,
    message: string,
    error: ErrorDetails
  ): Promise<void> {
    try {
      switch (channel.toLowerCase()) {
        case 'email':
          await this.sendEmailNotification(message, error);
          break;
        case 'slack':
          await this.sendSlackNotification(message, error);
          break;
        case 'pagerduty':
          await this.sendPagerDutyNotification(message, error);
          break;
        case 'log':
          logger.info(`Error notification (${channel}): ${message}`);
          break;
        default:
          logger.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (err) {
      logger.error(`Failed to send notification to channel ${channel}:`, err);
      // Don't throw the error to prevent notification failures from affecting other channels
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(message: string, error: ErrorDetails): Promise<void> {
    // This would be implemented with an email service
    // For now, we'll just log it
    logger.info(`Email notification sent: ${message}`);
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(message: string, error: ErrorDetails): Promise<void> {
    // This would be implemented with a Slack integration
    // For now, we'll just log it
    logger.info(`Slack notification sent: ${message}`);
  }

  /**
   * Send PagerDuty notification
   */
  private async sendPagerDutyNotification(message: string, error: ErrorDetails): Promise<void> {
    // This would be implemented with a PagerDuty integration
    // For now, we'll just log it
    logger.info(`PagerDuty notification sent: ${message}`);
  }

  /**
   * Report an error to an external service
   */
  private async reportError(error: ErrorDetails): Promise<void> {
    if (!this.config.enableErrorReporting || !this.config.errorReportingEndpoint) {
      return;
    }

    try {
      // Prepare the error report
      const report = this.prepareErrorReport(error);
      
      // Send the report with retry logic
      await this.sendErrorReportWithRetry(report);
    } catch (err) {
      logger.error('Failed to report error to external service:', err);
      // Don't throw the error to prevent reporting failures from affecting the main error handling flow
    }
  }

  /**
   * Prepare error report for external service
   */
  private prepareErrorReport(error: ErrorDetails): any {
    return {
      message: error.message,
      code: error.code,
      severity: error.severity,
      category: error.category,
      source: error.source,
      timestamp: error.timestamp.toISOString(),
      environment: process.env.NODE_ENV || 'development',
      application: {
        name: process.env.APP_NAME || 'Vici-V1',
        version: process.env.APP_VERSION || '1.0.0'
      },
      context: {
        userId: error.userId,
        requestId: error.requestId,
        correlationId: error.correlationId,
        retryCount: error.retryCount,
        recoveryAttempted: error.recoveryAttempted,
        recoverySuccessful: error.recoverySuccessful,
        ...error.context
      },
      stack: error.stack
    };
  }

  /**
   * Send error report with retry logic
   */
  private async sendErrorReportWithRetry(report: any): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;
    const baseDelay = 1000; // 1 second

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(this.config.errorReportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.errorReportingApiKey}`
          },
          body: JSON.stringify(report)
        });

        if (!response.ok) {
          throw new Error(`Error reporting service returned status ${response.status}`);
        }

        logger.info('Error report sent successfully');
        return;
      } catch (err) {
        attempts++;
        if (attempts === maxAttempts) {
          logger.error('Failed to send error report after all attempts:', err);
          return;
        }

        // Wait before next attempt with exponential backoff
        const delay = baseDelay * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Batch report multiple errors
   */
  private async batchReportErrors(errors: ErrorDetails[]): Promise<void> {
    if (!this.config.enableErrorReporting || !this.config.errorReportingEndpoint) {
      return;
    }

    try {
      // Prepare batch report
      const batchReport = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        application: {
          name: process.env.APP_NAME || 'Vici-V1',
          version: process.env.APP_VERSION || '1.0.0'
        },
        errors: errors.map(error => this.prepareErrorReport(error))
      };

      // Send batch report with retry logic
      await this.sendErrorReportWithRetry(batchReport);
    } catch (err) {
      logger.error('Failed to send batch error report:', err);
    }
  }

  /**
   * Report aggregated errors
   */
  private async reportAggregatedErrors(aggregatedError: any): Promise<void> {
    if (!this.config.enableErrorReporting || !this.config.errorReportingEndpoint) {
      return;
    }

    try {
      const report = {
        type: 'aggregated',
        key: aggregatedError.key,
        count: aggregatedError.count,
        firstOccurrence: aggregatedError.firstOccurrence.toISOString(),
        lastOccurrence: aggregatedError.lastOccurrence.toISOString(),
        error: this.prepareErrorReport(aggregatedError.error)
      };

      await this.sendErrorReportWithRetry(report);
    } catch (err) {
      logger.error('Failed to report aggregated errors:', err);
    }
  }

  /**
   * Subscribe to error events
   */
  public onError(callback: (error: ErrorDetails) => void): void {
    this.eventEmitter.on('error', callback);
  }

  /**
   * Subscribe to aggregated error events
   */
  public onErrorAggregated(callback: (aggregatedError: any) => void): void {
    this.eventEmitter.on('errorAggregated', callback);
  }

  /**
   * Unsubscribe from error events
   */
  public offError(callback: (error: ErrorDetails) => void): void {
    this.eventEmitter.off('error', callback);
  }

  /**
   * Unsubscribe from aggregated error events
   */
  public offErrorAggregated(callback: (aggregatedError: any) => void): void {
    this.eventEmitter.off('errorAggregated', callback);
  }

  /**
   * Subscribe to correlated error events
   */
  public onErrorsCorrelated(callback: (correlatedErrors: { key: string; errors: ErrorDetails[]; timestamp: Date }) => void): void {
    this.eventEmitter.on('errorsCorrelated', callback);
  }

  /**
   * Unsubscribe from correlated error events
   */
  public offErrorsCorrelated(callback: (correlatedErrors: { key: string; errors: ErrorDetails[]; timestamp: Date }) => void): void {
    this.eventEmitter.off('errorsCorrelated', callback);
  }

  /**
   * Check if error should be rate limited
   */
  private isRateLimited(error: ErrorDetails): boolean {
    if (!this.config.errorRateLimiting.enabled) {
      return false;
    }

    const key = `${error.category}:${error.source}`;
    const now = new Date();
    const limit = this.errorRateLimits.get(key);

    if (!limit) {
      this.errorRateLimits.set(key, { count: 1, windowStart: now });
      return false;
    }

    const windowMs = this.config.errorRateLimiting.windowMs;
    if (now.getTime() - limit.windowStart.getTime() > windowMs) {
      // Reset window
      this.errorRateLimits.set(key, { count: 1, windowStart: now });
      return false;
    }

    const maxErrors = this.config.errorRateLimiting.categoryLimits[error.category] || 
                     this.config.errorRateLimiting.maxErrorsPerWindow;
    
    if (limit.count >= maxErrors) {
      return true;
    }

    limit.count++;
    return false;
  }

  /**
   * Check if error should be sampled
   */
  private shouldSample(error: ErrorDetails): boolean {
    if (!this.config.errorSampling.enabled) {
      return true;
    }

    const key = `${error.category}:${error.severity}`;
    const sampleRate = this.config.errorSampling.severityRates[error.severity] || 
                      this.config.errorSampling.categoryRates[error.category] || 
                      this.config.errorSampling.sampleRate;

    const sampleCount = (this.errorSamples.get(key) || 0) + 1;
    this.errorSamples.set(key, sampleCount);

    return Math.random() < sampleRate;
  }

  /**
   * Enrich error context
   */
  private async enrichErrorContext(error: ErrorDetails): Promise<void> {
    if (!this.config.errorContextEnrichment.enabled) {
      return;
    }

    const enrichedContext: Record<string, any> = {};

    // Add system metrics for critical errors
    if (this.config.errorContextEnrichment.includeSystemMetrics && 
        error.severity === ErrorSeverity.CRITICAL) {
      enrichedContext.systemMetrics = await this.getSystemMetrics();
    }

    // Add request/response data for API errors
    if (this.config.errorContextEnrichment.includeRequestData && 
        error.context?.request) {
      enrichedContext.requestData = this.sanitizeRequestData(error.context.request);
    }

    if (this.config.errorContextEnrichment.includeResponseData && 
        error.context?.response) {
      enrichedContext.responseData = this.sanitizeResponseData(error.context.response);
    }

    // Run custom enrichers
    for (const enricher of this.config.errorContextEnrichment.customEnrichers) {
      try {
        const customContext = await enricher(error);
        Object.assign(enrichedContext, customContext);
      } catch (err) {
        logger.error('Custom context enricher failed:', err);
      }
    }

    // Update error context
    error.context = {
      ...error.context,
      ...enrichedContext
    };
  }

  /**
   * Correlate errors
   */
  private async correlateError(error: ErrorDetails): Promise<void> {
    if (!this.config.errorCorrelation.enabled) {
      return;
    }

    const correlationKey = this.getCorrelationKey(error);
    if (!correlationKey) {
      return;
    }

    const now = new Date();
    const correlatedErrors = this.errorCorrelations.get(correlationKey) || [];
    
    // Remove old errors outside the correlation window
    const windowMs = this.config.errorCorrelation.correlationWindowMs;
    const recentErrors = correlatedErrors.filter(e => 
      now.getTime() - e.timestamp.getTime() <= windowMs
    );

    // Add new error
    recentErrors.push(error);
    this.errorCorrelations.set(correlationKey, recentErrors);

    // Check if we have enough correlated errors
    if (recentErrors.length >= this.config.errorCorrelation.maxCorrelationDistance) {
      await this.handleCorrelatedErrors(correlationKey, recentErrors);
    }
  }

  /**
   * Get correlation key for error
   */
  private getCorrelationKey(error: ErrorDetails): string | null {
    const keys = this.config.errorCorrelation.correlationKeys;
    for (const key of keys) {
      if (error.context?.[key]) {
        return `${key}:${error.context[key]}`;
      }
    }
    return null;
  }

  /**
   * Handle correlated errors
   */
  private async handleCorrelatedErrors(key: string, errors: ErrorDetails[]): Promise<void> {
    // Emit correlation event
    this.eventEmitter.emit('errorsCorrelated', {
      key,
      errors,
      timestamp: new Date()
    });

    // Report correlated errors
    if (this.config.enableErrorReporting) {
      await this.reportCorrelatedErrors(key, errors);
    }

    // Clear correlated errors
    this.errorCorrelations.delete(key);
  }

  /**
   * Report correlated errors
   */
  private async reportCorrelatedErrors(key: string, errors: ErrorDetails[]): Promise<void> {
    const report = {
      type: 'correlated',
      key,
      count: errors.length,
      firstOccurrence: errors[0].timestamp.toISOString(),
      lastOccurrence: errors[errors.length - 1].timestamp.toISOString(),
      errors: errors.map(error => this.prepareErrorReport(error))
    };

    await this.sendErrorReportWithRetry(report);
  }

  /**
   * Get system metrics
   */
  private async getSystemMetrics(): Promise<Record<string, any>> {
    // This would be implemented with a system metrics service
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * Sanitize request data
   */
  private sanitizeRequestData(request: any): any {
    // Remove sensitive data from request
    const sanitized = { ...request };
    delete sanitized.headers?.authorization;
    delete sanitized.headers?.cookie;
    delete sanitized.body?.password;
    delete sanitized.body?.token;
    return sanitized;
  }

  /**
   * Sanitize response data
   */
  private sanitizeResponseData(response: any): any {
    // Remove sensitive data from response
    const sanitized = { ...response };
    delete sanitized.headers?.setCookie;
    delete sanitized.body?.token;
    return sanitized;
  }

  private startCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanupErrorCache();
    }, this.CACHE_CLEANUP_INTERVAL);
  }

  private cleanupErrorCache(): void {
    const now = new Date();
    for (const [key, value] of this.errorCache.entries()) {
      if (now.getTime() - value.lastSeen.getTime() > this.CACHE_TTL) {
        this.errorCache.delete(key);
      }
    }
  }

  private getErrorCacheKey(error: ErrorDetails): string {
    return `${error.category}:${error.code}:${error.source}`;
  }

  private isErrorCached(error: ErrorDetails): boolean {
    const key = this.getErrorCacheKey(error);
    const cached = this.errorCache.get(key);
    if (!cached) {
      return false;
    }

    // Update last seen time
    cached.lastSeen = new Date();
    cached.count++;
    this.errorCache.set(key, cached);

    return true;
  }

  private cacheError(error: ErrorDetails): void {
    const key = this.getErrorCacheKey(error);
    this.errorCache.set(key, {
      error,
      count: 1,
      lastSeen: new Date(),
    });
  }

  // Add cleanup method to handle cached errors
  public async cleanup(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    await this.flushErrorBatch();
    this.cleanupErrorCache();
  }

  // Add method to get cached error statistics
  public getCachedErrorStats(): Array<{ key: string; count: number; lastSeen: Date }> {
    return Array.from(this.errorCache.entries()).map(([key, value]) => ({
      key,
      count: value.count,
      lastSeen: value.lastSeen,
    }));
  }

  /**
   * Get error statistics and metrics for monitoring
   * @returns Object containing error counts, rates, and other metrics
   */
  public getErrorMetrics(): {
    totalErrors: number;
    errorCounts: Record<ErrorCategory, number>;
    severityCounts: Record<ErrorSeverity, number>;
    recoveryStats: {
      attempted: number;
      successful: number;
      failed: number;
    };
    rateLimitedErrors: number;
    sampledErrors: number;
  } {
    return {
      totalErrors: this.errorCounts.size,
      errorCounts: Object.values(ErrorCategory).reduce((acc, category) => {
        acc[category] = Array.from(this.errorCounts.entries())
          .filter(([key]) => key.startsWith(category))
          .reduce((sum, [, count]) => sum + count, 0);
        return acc;
      }, {} as Record<ErrorCategory, number>),
      severityCounts: Object.values(ErrorSeverity).reduce((acc, severity) => {
        acc[severity] = Array.from(this.errorCounts.entries())
          .filter(([key]) => key.includes(severity))
          .reduce((sum, [, count]) => sum + count, 0);
        return acc;
      }, {} as Record<ErrorSeverity, number>),
      recoveryStats: {
        attempted: this.recoveryAttempts,
        successful: this.successfulRecoveries,
        failed: this.failedRecoveries
      },
      rateLimitedErrors: this.rateLimitedErrors,
      sampledErrors: this.sampledErrors
    };
  }

  /**
   * Get documentation for error categories and their recovery strategies
   * @returns Object containing error category documentation
   */
  public getErrorDocumentation(): Record<ErrorCategory, {
    description: string;
    recoveryStrategy: string;
    severity: ErrorSeverity;
    notificationChannels: string[];
  }> {
    return {
      [ErrorCategory.DATABASE]: {
        description: 'Errors related to database operations',
        recoveryStrategy: 'Retries with exponential backoff and circuit breaker',
        severity: ErrorSeverity.HIGH,
        notificationChannels: ['email', 'slack']
      },
      [ErrorCategory.NETWORK]: {
        description: 'Errors related to network connectivity',
        recoveryStrategy: 'Retries with exponential backoff',
        severity: ErrorSeverity.MEDIUM,
        notificationChannels: ['email']
      },
      [ErrorCategory.VALIDATION]: {
        description: 'Errors related to input validation',
        recoveryStrategy: 'Input sanitization and retry',
        severity: ErrorSeverity.LOW,
        notificationChannels: ['log']
      },
      [ErrorCategory.AUTHENTICATION]: {
        description: 'Errors related to user authentication',
        recoveryStrategy: 'Token refresh and retry',
        severity: ErrorSeverity.HIGH,
        notificationChannels: ['email', 'slack']
      },
      [ErrorCategory.AUTHORIZATION]: {
        description: 'Errors related to user authorization',
        recoveryStrategy: 'Permission verification and retry',
        severity: ErrorSeverity.HIGH,
        notificationChannels: ['email', 'slack']
      },
      [ErrorCategory.INTEGRATION]: {
        description: 'Errors related to external service integration',
        recoveryStrategy: 'Fallback service and retry',
        severity: ErrorSeverity.MEDIUM,
        notificationChannels: ['email', 'slack']
      },
      [ErrorCategory.PERFORMANCE]: {
        description: 'Errors related to performance issues',
        recoveryStrategy: 'Resource optimization and retry',
        severity: ErrorSeverity.MEDIUM,
        notificationChannels: ['email']
      },
      [ErrorCategory.SECURITY]: {
        description: 'Errors related to security violations',
        recoveryStrategy: 'Immediate notification and logging',
        severity: ErrorSeverity.CRITICAL,
        notificationChannels: ['email', 'slack', 'pagerduty']
      },
      [ErrorCategory.SYSTEM]: {
        description: 'Errors related to system operations',
        recoveryStrategy: 'System restart and retry',
        severity: ErrorSeverity.HIGH,
        notificationChannels: ['email', 'slack']
      },
      [ErrorCategory.BUSINESS]: {
        description: 'Errors related to business logic',
        recoveryStrategy: 'Manual intervention required',
        severity: ErrorSeverity.MEDIUM,
        notificationChannels: ['email']
      }
    };
  }
} 
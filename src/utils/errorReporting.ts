import { logger } from './logger';
import { Sentry } from '../config/sentry';
import { environment } from '../config/environment';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}

interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'error' | 'warning' | 'info';
}

interface ErrorReportingService {
  captureError(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, context?: ErrorContext): void;
  setUser(userId: string): void;
  clearUser(): void;
}

export class ErrorReportingService {
  private static instance: ErrorReportingService;

  private constructor() {}

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public captureError(error: Error, context?: ErrorContext): void {
    // Log error locally
    logger.error('Error captured', {
      error: error.message,
      stack: error.stack,
      context,
    });

    // Send to Sentry in production
    if (environment.sentry.enabled) {
      Sentry.captureException(error, {
        contexts: {
          app: context,
        },
      });
    }
  }

  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    // Log message locally
    logger[level](message, { context });

    // Send to Sentry in production
    if (environment.sentry.enabled) {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        contexts: {
          app: context,
        },
      });
    }
  }

  public setUser(user: { id: string; email?: string; username?: string }): void {
    // Set user in Sentry
    if (environment.sentry.enabled) {
      Sentry.setUser(user);
    }
  }

  public clearUser(): void {
    // Clear user in Sentry
    if (environment.sentry.enabled) {
      Sentry.setUser(null);
    }
  }

  public addBreadcrumb(message: string, category: string, data?: any): void {
    // Add breadcrumb to Sentry
    if (environment.sentry.enabled) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  }
}

export const errorReporting = ErrorReportingService.getInstance(); 
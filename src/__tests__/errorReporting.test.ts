import { errorReporting } from '../utils/errorReporting';
import { logger } from '../utils/logger';
import { Sentry } from '../config/sentry';
import { environment } from '../config/environment';

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../config/sentry', () => ({
  Sentry: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
  },
}));

jest.mock('../config/environment', () => ({
  environment: {
    sentry: {
      enabled: true,
    },
  },
}));

describe('ErrorReportingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('captures errors and sends them to both logger and Sentry', () => {
    const error = new Error('Test error');
    const context = { userId: '123' };

    errorReporting.captureError(error, context);

    expect(logger.error).toHaveBeenCalledWith('Error captured', {
      error: error.message,
      stack: error.stack,
      context,
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: {
        app: context,
      },
    });
  });

  it('captures messages with different levels', () => {
    const message = 'Test message';
    const context = { userId: '123' };

    // Test info level
    errorReporting.captureMessage(message, 'info', context);
    expect(logger.info).toHaveBeenCalledWith(message, { context });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
      level: 'info',
      contexts: {
        app: context,
      },
    });

    // Test warning level
    errorReporting.captureMessage(message, 'warning', context);
    expect(logger.warn).toHaveBeenCalledWith(message, { context });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
      level: 'warning',
      contexts: {
        app: context,
      },
    });

    // Test error level
    errorReporting.captureMessage(message, 'error', context);
    expect(logger.error).toHaveBeenCalledWith(message, { context });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(message, {
      level: 'error',
      contexts: {
        app: context,
      },
    });
  });

  it('sets and clears user in Sentry', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    };

    errorReporting.setUser(user);
    expect(Sentry.setUser).toHaveBeenCalledWith(user);

    errorReporting.clearUser();
    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });

  it('adds breadcrumbs to Sentry', () => {
    const message = 'User action';
    const category = 'user';
    const data = { action: 'click' };

    errorReporting.addBreadcrumb(message, category, data);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message,
      category,
      data,
      level: 'info',
    });
  });

  it('handles Sentry being disabled', () => {
    // Mock environment to disable Sentry
    (environment.sentry.enabled as boolean) = false;

    const error = new Error('Test error');
    errorReporting.captureError(error);

    expect(logger.error).toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
}); 
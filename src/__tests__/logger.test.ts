import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { logger, LogLevel } from '../utils/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log');
    consoleSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Log Levels', () => {
    it('should log debug messages in development', () => {
      logger.debug('Test debug message', { test: true });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Test info message', { test: true });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message', { test: true });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error, { test: true });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Log Formatting', () => {
    it('should include timestamp in log entries', () => {
      logger.info('Test message');
      const logCall = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.split('%c')[0]);
      expect(logEntry).toHaveProperty('timestamp');
      expect(new Date(logEntry.timestamp)).toBeInstanceOf(Date);
    });

    it('should include log level in entries', () => {
      logger.info('Test message');
      const logCall = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.split('%c')[0]);
      expect(logEntry).toHaveProperty('level', LogLevel.INFO);
    });

    it('should include context in log entries', () => {
      const context = { test: true, value: 123 };
      logger.info('Test message', context);
      const logCall = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.split('%c')[0]);
      expect(logEntry).toHaveProperty('context', context);
    });

    it('should include error in error log entries', () => {
      const error = new Error('Test error');
      logger.error('Test message', error);
      const logCall = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall.split('%c')[0]);
      expect(logEntry).toHaveProperty('error');
      expect(logEntry.error).toHaveProperty('message', 'Test error');
    });
  });

  describe('Log Level Filtering', () => {
    it('should filter logs based on environment', () => {
      // TODO: Implement environment-based log level testing
      // This would require mocking the environment configuration
    });
  });
}); 
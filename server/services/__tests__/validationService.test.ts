import { ValidationService } from '../validationService';
import { ErrorHandlingService } from '../errorHandlingService';
import { AuditLoggingService } from '../auditLoggingService';
import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import * as apiSchemas from '../../schemas/apiValidationSchemas';

// Mock dependencies
jest.mock('pg');
jest.mock('../../utils/logger');
jest.mock('../errorHandlingService');
jest.mock('../auditLoggingService');

describe('ValidationService', () => {
  let validationService: ValidationService;
  let mockErrorHandlingService: jest.Mocked<ErrorHandlingService>;
  let mockAuditLoggingService: jest.Mocked<AuditLoggingService>;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockPool = new Pool() as jest.Mocked<Pool>;
    mockAuditLoggingService = new AuditLoggingService(mockPool) as jest.Mocked<AuditLoggingService>;
    mockErrorHandlingService = ErrorHandlingService.getInstance({} as any, mockAuditLoggingService) as jest.Mocked<ErrorHandlingService>;

    // Initialize service
    validationService = ValidationService.getInstance(mockErrorHandlingService);
  });

  describe('validate', () => {
    it('should validate data against a schema successfully', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0)
      });

      const data = {
        name: 'John',
        age: 30
      };

      const result = await validationService.validate(schema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.errors).toBeUndefined();
    });

    it('should handle validation errors', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0)
      });

      const data = {
        name: 'John',
        age: -1
      };

      const result = await validationService.validate(schema, data);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(mockErrorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('validateRequest', () => {
    it('should validate and sanitize request data', async () => {
      const data = {
        body: {
          title: '<script>alert("xss")</script>Hello',
          content: '<p>Test content</p>',
          tags: ['tag1', 'tag2']
        }
      };

      const result = await validationService.validateRequest(apiSchemas.createContentRequestSchema, data);

      expect(result.success).toBe(true);
      expect(result.data?.body.title).toBe('Hello');
      expect(result.data?.body.content).toBe('<p>Test content</p>');
    });

    it('should handle invalid request data', async () => {
      const data = {
        body: {
          title: '',  // Invalid: empty string
          content: 'Test',  // Invalid: too short
          tags: ['tag1', 'tag2']
        }
      };

      const result = await validationService.validateRequest(apiSchemas.createContentRequestSchema, data);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const html = '<script>alert("xss")</script><p>Hello <strong>World</strong></p>';
      const sanitized = validationService.sanitizeHtml(html);

      expect(sanitized).toBe('<p>Hello <strong>World</strong></p>');
    });

    it('should respect custom sanitization options', () => {
      const html = '<div class="test"><p>Hello</p></div>';
      const options = {
        allowedTags: ['div'],
        allowedAttributes: {
          'div': ['class']
        }
      };

      const sanitized = validationService.sanitizeHtml(html, options);

      expect(sanitized).toBe('<div class="test"></div>');
    });
  });

  describe('sanitizeData', () => {
    it('should sanitize nested objects', async () => {
      const data = {
        user: {
          name: '<script>alert("xss")</script>John',
          email: ' test@example.com ',
          urls: ['http://example.com', 'invalid-url']
        }
      };

      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string(),
          urls: z.array(z.string())
        })
      });

      const result = await validationService.validateRequest(schema, data);

      expect(result.success).toBe(true);
      expect(result.data?.user.name).toBe('John');
      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.user.urls[0]).toBe('http://example.com');
      expect(result.data?.user.urls[1]).toBe('');
    });
  });

  describe('getSchema', () => {
    it('should return the correct schema for a given name', () => {
      const schema = validationService.getSchema('userSchema');
      expect(schema).toBe(apiSchemas.userSchema);
    });

    it('should throw an error for invalid schema names', () => {
      expect(() => {
        validationService.getSchema('invalidSchema' as any);
      }).toThrow();
    });
  });

  describe('sanitization', () => {
    it('should sanitize SQL input', () => {
      const input = "'; DROP TABLE users; --";
      const result = validationService.sanitizeSql(input);

      expect(result).toBe("\\'; DROP TABLE users; --");
    });

    it('should sanitize file paths', () => {
      const input = '../../../etc/passwd';
      const result = validationService.sanitizeFilePath(input);

      expect(result).toBe('etc/passwd');
    });

    it('should sanitize email addresses', () => {
      const input = 'test@example.com<script>alert("xss")</script>';
      const result = validationService.sanitizeEmail(input);

      expect(result).toBe('test@example.com');
    });

    it('should sanitize phone numbers', () => {
      const input = '+1 (555) 123-4567<script>alert("xss")</script>';
      const result = validationService.sanitizePhone(input);

      expect(result).toBe('+1 (555) 123-4567');
    });

    it('should sanitize URLs', () => {
      const input = 'https://example.com<script>alert("xss")</script>';
      const result = validationService.sanitizeUrl(input);

      expect(result).toBe('https://example.com');
    });

    it('should sanitize object keys', () => {
      const input = {
        'normal-key': 'value',
        '__proto__': 'malicious',
        'constructor': 'malicious',
        'prototype': 'malicious'
      };

      const result = validationService.sanitizeObjectKeys(input);

      expect(result).toEqual({
        'normal-key': 'value'
      });
    });
  });

  describe('error handling', () => {
    it('should handle unexpected errors during validation', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0)
      });

      // Mock ErrorHandlingService to throw an error
      mockErrorHandlingService.handleError.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const data = {
        name: 'John',
        age: -1
      };

      const result = validationService.validate(schema, data);

      expect(result).toEqual({
        success: false,
        error: expect.any(Error)
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Unexpected error during validation:',
        expect.any(Error)
      );
    });
  });
}); 
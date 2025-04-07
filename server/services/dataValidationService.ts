import { logger } from '../utils/logger';
import { ErrorHandlingService, ErrorCategory, ErrorSeverity, ErrorDetails } from './errorHandlingService';
import { Pool } from 'pg';
import { z } from 'zod';
import { escape } from 'html-escaper';
import sanitize = require('sanitize-html');

export interface ValidationConfig {
  enabled: boolean;
  strictMode: boolean;
  maxStringLength: number;
  allowedHtmlTags: string[];
  allowedHtmlAttributes: string[];
  customValidators: Record<string, (value: any) => boolean>;
}

export interface ValidationError extends Error {
  code: string;
  details?: any;
}

export class DataValidationService {
  private static instance: DataValidationService;
  private config: ValidationConfig;
  private errorHandlingService: ErrorHandlingService;
  private dbPool?: Pool;

  private constructor(config: ValidationConfig, errorHandlingService: ErrorHandlingService, dbPool?: Pool) {
    this.config = config;
    this.errorHandlingService = errorHandlingService;
    this.dbPool = dbPool;
  }

  public static getInstance(config?: ValidationConfig, errorHandlingService?: ErrorHandlingService, dbPool?: Pool): DataValidationService {
    if (!DataValidationService.instance) {
      if (!config || !errorHandlingService) {
        throw new Error('Config and ErrorHandlingService are required for first initialization');
      }
      DataValidationService.instance = new DataValidationService(config, errorHandlingService, dbPool);
    }
    return DataValidationService.instance;
  }

  /**
   * Validate input data against a schema
   * @param data The data to validate
   * @param schema The Zod schema to validate against
   * @returns The validated data or throws an error
   */
  public validateInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      const validationError = new Error(errorMessage);
      validationError.name = 'ValidationError';
      (validationError as any).details = {
        code: 'VALIDATION_ERROR',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        source: 'DataValidationService',
        timestamp: new Date(),
        context: { error: errorMessage }
      };

      this.errorHandlingService.handleError(errorMessage, {
        code: 'VALIDATION_ERROR',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        source: 'DataValidationService',
        context: { error: errorMessage }
      });
      throw validationError;
    }
  }

  /**
   * Sanitize HTML content
   * @param content The HTML content to sanitize
   * @returns The sanitized HTML content
   */
  public sanitizeHtml(content: string): string {
    return sanitize(content, {
      allowedTags: this.config.allowedHtmlTags,
      allowedAttributes: {
        '*': this.config.allowedHtmlAttributes
      }
    });
  }

  /**
   * Escape HTML content
   * @param content The content to escape
   * @returns The escaped content
   */
  public escapeHtml(content: string): string {
    return escape(content);
  }

  /**
   * Validate and sanitize database query parameters
   * @param query The SQL query with placeholders
   * @param params The parameters to validate and sanitize
   * @returns The sanitized parameters
   */
  public validateQueryParams(query: string, params: any[]): any[] {
    if (!this.dbPool) {
      throw new Error('Database pool not initialized');
    }

    // Validate parameter count matches placeholders
    const placeholderCount = (query.match(/\$/g) || []).length;
    if (placeholderCount !== params.length) {
      throw new Error(`Parameter count mismatch: expected ${placeholderCount}, got ${params.length}`);
    }

    // Sanitize each parameter
    return params.map(param => {
      if (typeof param === 'string') {
        // For strings, escape special characters
        return this.escapeHtml(param);
      } else if (typeof param === 'number') {
        // For numbers, ensure it's a valid number
        if (isNaN(param) || !isFinite(param)) {
          throw new Error('Invalid number parameter');
        }
        return param;
      } else if (param instanceof Date) {
        // For dates, ensure it's a valid date
        if (isNaN(param.getTime())) {
          throw new Error('Invalid date parameter');
        }
        return param;
      } else if (Array.isArray(param)) {
        // For arrays, validate each element
        return param.map(element => this.validateQueryParams('$1', [element])[0]);
      } else if (param === null || param === undefined) {
        return param;
      } else {
        throw new Error(`Unsupported parameter type: ${typeof param}`);
      }
    });
  }

  /**
   * Validate JSON payload against a schema
   * @param payload The JSON payload to validate
   * @param schema The JSON schema to validate against
   * @returns The validated payload or throws an error
   */
  public validateJsonPayload<T>(payload: unknown, schema: z.ZodSchema<T>): T {
    try {
      return this.validateInput(payload, schema);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      const validationError = new Error(errorMessage);
      validationError.name = 'ValidationError';
      (validationError as any).details = {
        code: 'JSON_VALIDATION_ERROR',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        source: 'DataValidationService',
        timestamp: new Date(),
        context: { error: errorMessage }
      };

      this.errorHandlingService.handleError(errorMessage, {
        code: 'JSON_VALIDATION_ERROR',
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.VALIDATION,
        source: 'DataValidationService',
        context: { error: errorMessage }
      });
      throw validationError;
    }
  }

  /**
   * Validate email address
   * @param email The email address to validate
   * @returns True if valid, false otherwise
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param password The password to validate
   * @returns True if valid, false otherwise
   */
  public validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate URL
   * @param url The URL to validate
   * @returns True if valid, false otherwise
   */
  public validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number
   * @param phone The phone number to validate
   * @returns True if valid, false otherwise
   */
  public validatePhone(phone: string): boolean {
    // Basic phone number validation - can be customized based on requirements
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate credit card number
   * @param cardNumber The credit card number to validate
   * @returns True if valid, false otherwise
   */
  public validateCreditCard(cardNumber: string): boolean {
    // Luhn algorithm for credit card validation
    const sanitized = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate date format
   * @param date The date to validate
   * @param format The expected date format
   * @returns True if valid, false otherwise
   */
  public validateDateFormat(date: string, format: string): boolean {
    try {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Validate file type
   * @param file The file to validate
   * @param allowedTypes Array of allowed MIME types
   * @returns True if valid, false otherwise
   */
  public validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   * @param file The file to validate
   * @param maxSize Maximum file size in bytes
   * @returns True if valid, false otherwise
   */
  public validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
} 
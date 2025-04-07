import { z } from 'zod';
import { logger } from '../utils/logger';
import { ErrorHandlingService, ErrorCategory, ErrorSeverity } from './errorHandlingService';
import sanitizeHtml from 'sanitize-html';
import { escape } from 'html-escaper';
import * as apiSchemas from '../schemas/apiValidationSchemas';
import Redis, { RedisOptions } from 'ioredis';

/**
 * Validation service for handling data validation and sanitization
 */
export class ValidationService {
  private static instance: ValidationService;
  private errorHandlingService: ErrorHandlingService;
  private defaultSanitizeOptions: sanitizeHtml.IOptions;
  private redisClient: Redis | null = null;
  private validationCache: Map<string, boolean> = new Map();
  private validationCacheTTL: number = 3600; // 1 hour in seconds

  private constructor(errorHandlingService: ErrorHandlingService) {
    this.errorHandlingService = errorHandlingService;
    this.defaultSanitizeOptions = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {
        'a': ['href', 'target', 'rel']
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      disallowedTagsMode: 'discard'
    };
  }

  /**
   * Get the singleton instance of the ValidationService
   */
  public static getInstance(errorHandlingService?: ErrorHandlingService): ValidationService {
    if (!ValidationService.instance) {
      if (!errorHandlingService) {
        throw new Error('ErrorHandlingService is required for first initialization');
      }
      ValidationService.instance = new ValidationService(errorHandlingService);
    }
    return ValidationService.instance;
  }

  /**
   * Initialize Redis client for distributed caching
   */
  public initRedis(config: RedisOptions): void {
    try {
      this.redisClient = new Redis(config);
      logger.info('Redis client initialized for validation service');
    } catch (error) {
      logger.error('Failed to initialize Redis client', { error });
      this.redisClient = null;
    }
  }

  /**
   * Validate data against a Zod schema
   */
  public async validate<T>(schema: z.ZodSchema<T>, data: unknown): Promise<{ success: boolean; data?: T; errors?: any[] }> {
    try {
      const validatedData = await schema.parseAsync(data);
      return { success: true, data: validatedData };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err: z.ZodIssue) => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        // Log validation error
        await this.errorHandlingService.handleError(
          new Error(`Validation failed: ${JSON.stringify(errors)}`),
          {
            category: ErrorCategory.VALIDATION,
            severity: ErrorSeverity.LOW,
            context: { data, errors }
          }
        );
        
        return { success: false, errors };
      }
      
      // Handle unexpected errors
      if (error instanceof Error) {
        await this.errorHandlingService.handleError(error.message);
      } else {
        await this.errorHandlingService.handleError('Unknown validation error');
      }
      
      return { success: false, errors: [{ message: 'Unexpected validation error' }] };
    }
  }

  /**
   * Validate and sanitize request data using API schemas
   */
  public async validateRequest<T extends z.ZodType>(schema: T, data: unknown): Promise<{ success: boolean; data?: z.infer<T>; errors?: any[] }> {
    const result = await this.validate(schema, data);
    
    if (result.success && result.data) {
      // Sanitize the validated data
      result.data = this.sanitizeData(result.data);
    }
    
    return result;
  }

  /**
   * Validate data against a JSON schema
   */
  public async validateAgainstSchema(
    data: unknown, 
    schema: any, 
    options: { stripUnknown?: boolean; abortEarly?: boolean } = {}
  ): Promise<{ isValid: boolean; data?: any; errors?: any[] }> {
    try {
      // Convert JSON schema to Zod schema
      const zodSchema = this.jsonSchemaToZod(schema);
      
      // Validate against the Zod schema
      const result = await this.validate(zodSchema, data);
      
      return {
        isValid: result.success,
        data: result.data,
        errors: result.errors
      };
    } catch (error) {
      logger.error('Schema validation error', { error });
      
      return {
        isValid: false,
        errors: [{ message: 'Schema validation failed' }]
      };
    }
  }

  /**
   * Convert JSON schema to Zod schema
   * This is a simplified implementation and may not support all JSON schema features
   */
  private jsonSchemaToZod(schema: any): z.ZodType {
    if (!schema || typeof schema !== 'object') {
      return z.any();
    }
    
    // Handle type property
    if (schema.type) {
      switch (schema.type) {
        case 'string':
          let stringSchema = z.string();
          if (schema.minLength !== undefined) stringSchema = stringSchema.min(schema.minLength);
          if (schema.maxLength !== undefined) stringSchema = stringSchema.max(schema.maxLength);
          if (schema.pattern) stringSchema = stringSchema.regex(new RegExp(schema.pattern));
          return stringSchema;
        case 'number':
          let numberSchema = z.number();
          if (schema.minimum !== undefined) numberSchema = numberSchema.min(schema.minimum);
          if (schema.maximum !== undefined) numberSchema = numberSchema.max(schema.maximum);
          return numberSchema;
        case 'integer':
          let integerSchema = z.number().int();
          if (schema.minimum !== undefined) integerSchema = integerSchema.min(schema.minimum);
          if (schema.maximum !== undefined) integerSchema = integerSchema.max(schema.maximum);
          return integerSchema;
        case 'boolean':
          return z.boolean();
        case 'array':
          const itemSchema = schema.items ? this.jsonSchemaToZod(schema.items) : z.any();
          let arraySchema = z.array(itemSchema);
          if (schema.minItems !== undefined) arraySchema = arraySchema.min(schema.minItems);
          if (schema.maxItems !== undefined) arraySchema = arraySchema.max(schema.maxItems);
          return arraySchema;
        case 'object':
          if (!schema.properties) return z.record(z.any());
          
          const shape: Record<string, z.ZodType> = {};
          for (const [key, value] of Object.entries(schema.properties)) {
            shape[key] = this.jsonSchemaToZod(value as any);
          }
          
          let objectSchema = z.object(shape);
          if (schema.required && Array.isArray(schema.required)) {
            objectSchema = objectSchema.required(schema.required);
          }
          return objectSchema;
        case 'null':
          return z.null();
        default:
          return z.any();
      }
    }
    
    // Handle enum
    if (schema.enum) {
      return z.enum(schema.enum as [string, ...string[]]);
    }
    
    // Default to any
    return z.any();
  }

  /**
   * Sanitize data based on its type
   */
  public sanitizeData<T>(data: T): T {
    if (typeof data === 'string') {
      return this.sanitizeHtml(data) as T;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item)) as T;
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized as T;
    }
    
    return data;
  }

  /**
   * Sanitize HTML content with configurable options
   */
  public sanitizeHtml(html: string, options: sanitizeHtml.IOptions = {}): string {
    return sanitizeHtml(html, { ...this.defaultSanitizeOptions, ...options });
  }

  /**
   * Escape HTML content
   */
  public escapeHtml(text: string): string {
    return escape(text);
  }

  /**
   * Sanitize SQL input to prevent SQL injection
   */
  public sanitizeSql(input: string): string {
    // Basic SQL injection prevention - in production, use parameterized queries instead
    return input.replace(/['";\\]/g, '');
  }

  /**
   * Sanitize file path to prevent directory traversal attacks
   */
  public sanitizeFilePath(path: string): string {
    // Remove any directory traversal attempts
    return path.replace(/\.\./g, '');
  }

  /**
   * Sanitize email address
   */
  public sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize phone number
   */
  public sanitizePhone(phone: string): string {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }

  /**
   * Sanitize URL
   */
  public sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch (error) {
      logger.warn(`Invalid URL: ${url}`);
      return '';
    }
  }

  /**
   * Sanitize object keys to prevent prototype pollution
   */
  public sanitizeObjectKeys<T extends Record<string, any>>(obj: T): T {
    const sanitized: Record<string, any> = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip keys that could lead to prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue;
        }
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = this.sanitizeObjectKeys(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    
    return sanitized as T;
  }

  /**
   * Get a validation schema for a specific API endpoint
   */
  public getSchema(schemaName: keyof typeof apiSchemas): z.ZodType {
    return apiSchemas[schemaName];
  }

  /**
   * Get a cached validation result
   */
  public async getCachedValidation(cacheKey: string): Promise<boolean | null> {
    // Check in-memory cache first
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey) || false;
    }
    
    // Check Redis if available
    if (this.redisClient) {
      try {
        const result = await this.redisClient.get(`validation:${cacheKey}`);
        if (result !== null) {
          const isValid = result === 'true';
          // Update in-memory cache
          this.validationCache.set(cacheKey, isValid);
          return isValid;
        }
      } catch (error) {
        logger.error('Redis cache error', { error });
      }
    }
    
    return null;
  }

  /**
   * Cache a validation result
   */
  public async cacheValidationResult(cacheKey: string, isValid: boolean): Promise<void> {
    // Update in-memory cache
    this.validationCache.set(cacheKey, isValid);
    
    // Update Redis if available
    if (this.redisClient) {
      try {
        await this.redisClient.set(
          `validation:${cacheKey}`,
          isValid ? 'true' : 'false',
          'EX',
          this.validationCacheTTL
        );
      } catch (error) {
        logger.error('Redis cache error', { error });
      }
    }
  }
} 
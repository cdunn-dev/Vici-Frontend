import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../services/validationService';
import { ErrorHandlingService } from '../services/errorHandlingService';
import { logger } from '../utils/logger';

/**
 * Configuration options for the validation middleware
 */
export interface ValidationMiddlewareOptions {
  /**
   * Whether to sanitize the request body
   */
  sanitizeBody?: boolean;
  
  /**
   * Whether to sanitize query parameters
   */
  sanitizeQuery?: boolean;
  
  /**
   * Whether to sanitize URL parameters
   */
  sanitizeParams?: boolean;
  
  /**
   * Whether to sanitize headers
   */
  sanitizeHeaders?: boolean;
  
  /**
   * Custom validation function to run after sanitization
   */
  validate?: (req: Request) => Promise<boolean>;
  
  /**
   * Custom error message for validation failures
   */
  errorMessage?: string;
  
  /**
   * Whether to strip unknown properties from the request body
   */
  stripUnknown?: boolean;
  
  /**
   * Whether to abort early on the first error
   */
  abortEarly?: boolean;
  
  /**
   * Whether to cache validation results
   */
  cache?: boolean;
}

/**
 * Creates a validation middleware that uses the ValidationService to validate and sanitize incoming requests
 * 
 * @param validationService The ValidationService instance
 * @param errorHandlingService The ErrorHandlingService instance
 * @param options Configuration options for the middleware
 * @returns Express middleware function
 */
export const createValidationMiddleware = (
  validationService: ValidationService,
  errorHandlingService: ErrorHandlingService,
  options: ValidationMiddlewareOptions = {}
) => {
  // Set default options
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeParams = true,
    sanitizeHeaders = false,
    validate,
    errorMessage = 'Validation failed',
    stripUnknown = true,
    abortEarly = false,
    cache = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a cache key for this request if caching is enabled
      const cacheKey = cache ? `validation:${req.method}:${req.path}:${JSON.stringify(req.query)}` : null;
      
      // Check if we have a cached validation result
      if (cacheKey) {
        const cachedResult = await validationService.getCachedValidation(cacheKey);
        if (cachedResult !== null) {
          if (cachedResult) {
            return next();
          } else {
            return res.status(400).json({
              error: {
                message: errorMessage,
                code: 'VALIDATION_ERROR'
              }
            });
          }
        }
      }

      // Sanitize request body if enabled
      if (sanitizeBody && req.body) {
        req.body = validationService.sanitizeData(req.body);
      }

      // Sanitize query parameters if enabled
      if (sanitizeQuery && req.query) {
        req.query = validationService.sanitizeData(req.query);
      }

      // Sanitize URL parameters if enabled
      if (sanitizeParams && req.params) {
        req.params = validationService.sanitizeData(req.params);
      }

      // Sanitize headers if enabled
      if (sanitizeHeaders && req.headers) {
        // Create a copy of headers to sanitize
        const sanitizedHeaders = validationService.sanitizeData(req.headers);
        
        // Update headers with sanitized values
        Object.keys(sanitizedHeaders).forEach(key => {
          if (typeof sanitizedHeaders[key] === 'string') {
            req.headers[key] = sanitizedHeaders[key] as string;
          }
        });
      }

      // Run custom validation if provided
      if (validate) {
        const isValid = await validate(req);
        
        // Cache the validation result if caching is enabled
        if (cacheKey) {
          await validationService.cacheValidationResult(cacheKey, isValid);
        }
        
        if (!isValid) {
          return res.status(400).json({
            error: {
              message: errorMessage,
              code: 'VALIDATION_ERROR'
            }
          });
        }
      }

      // If we get here, validation passed
      next();
    } catch (error) {
      // Log the error
      logger.error('Validation middleware error', { error });
      
      // Handle the error using the error handling service
      await errorHandlingService.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        {
          source: 'validationMiddleware',
          requestId: (req as any).id,
          userId: (req as any).user?.id
        }
      );
      
      // Return the error response
      return res.status(400).json({
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR'
        }
      });
    }
  };
};

/**
 * Creates a schema validation middleware that validates request data against a JSON schema
 * 
 * @param validationService The ValidationService instance
 * @param errorHandlingService The ErrorHandlingService instance
 * @param schema The JSON schema to validate against
 * @param options Configuration options for the middleware
 * @returns Express middleware function
 */
export const createSchemaValidationMiddleware = (
  validationService: ValidationService,
  errorHandlingService: ErrorHandlingService,
  schema: any,
  options: ValidationMiddlewareOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a cache key for this request if caching is enabled
      const cacheKey = options.cache ? `schema:${req.method}:${req.path}:${JSON.stringify(schema)}` : null;
      
      // Check if we have a cached validation result
      if (cacheKey) {
        const cachedResult = await validationService.getCachedValidation(cacheKey);
        if (cachedResult !== null) {
          if (cachedResult) {
            return next();
          } else {
            return res.status(400).json({
              error: {
                message: options.errorMessage || 'Schema validation failed',
                code: 'SCHEMA_VALIDATION_ERROR'
              }
            });
          }
        }
      }

      // Validate the request data against the schema
      const validationResult = await validationService.validateAgainstSchema(req.body, schema, {
        stripUnknown: options.stripUnknown,
        abortEarly: options.abortEarly
      });
      
      // Cache the validation result if caching is enabled
      if (cacheKey) {
        await validationService.cacheValidationResult(cacheKey, validationResult.isValid);
      }
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: {
            message: options.errorMessage || 'Schema validation failed',
            code: 'SCHEMA_VALIDATION_ERROR',
            details: validationResult.errors
          }
        });
      }
      
      // If validation passed, update the request body with the validated data
      req.body = validationResult.data;
      
      next();
    } catch (error) {
      // Log the error
      logger.error('Schema validation middleware error', { error });
      
      // Handle the error using the error handling service
      await errorHandlingService.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        {
          source: 'schemaValidationMiddleware',
          requestId: (req as any).id,
          userId: (req as any).user?.id
        }
      );
      
      // Return the error response
      return res.status(400).json({
        error: {
          message: 'Schema validation error',
          code: 'SCHEMA_VALIDATION_ERROR'
        }
      });
    }
  };
}; 
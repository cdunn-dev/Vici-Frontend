import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { logger } from '../utils/logger';
import { ValidationService } from '../services/validationService';
import { ErrorHandlingService } from '../services/errorHandlingService';

/**
 * Middleware to validate request data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param options Validation options
 */
export const validateRequest = (schema: AnyZodObject, options: { sanitize?: boolean } = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get validation service instance
      const validationService = ValidationService.getInstance();
      
      // Validate request data
      const result = await validationService.validateRequest(schema, {
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.errors
        });
      }
      
      // Update request with validated and sanitized data
      if (result.data) {
        if (result.data.body) {
          req.body = result.data.body;
        }
        if (result.data.query) {
          req.query = result.data.query;
        }
        if (result.data.params) {
          req.params = result.data.params;
        }
      }
      
      return next();
    } catch (error: unknown) {
      logger.error('Validation error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation'
      });
    }
  };
}; 
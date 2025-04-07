import { Request, Response, NextFunction } from 'express';
import { ErrorHandlingService, ErrorSeverity, ErrorCategory, ErrorDetails } from '../services/errorHandlingService';
import { logger } from '../utils/logger';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      id?: string;
      correlationId?: string;
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Error handling middleware for Express
 */
export const errorHandler = (errorHandlingService: ErrorHandlingService) => {
  return async (err: Error, req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract error details from the request
      const errorContext: Partial<ErrorDetails> = {
        userId: req.user?.id,
        requestId: req.id,
        correlationId: req.correlationId,
        source: `${req.method} ${req.path}`,
        context: {
          query: req.query,
          params: req.params,
          body: req.body,
          headers: req.headers,
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      };

      // Determine error severity based on status code
      let severity = ErrorSeverity.MEDIUM;
      if (err.name === 'ValidationError') {
        severity = ErrorSeverity.LOW;
      } else if (err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
        severity = ErrorSeverity.HIGH;
      } else if (err.name === 'DatabaseError' || err.name === 'ConnectionError') {
        severity = ErrorSeverity.CRITICAL;
      }

      // Determine error category
      let category = ErrorCategory.SYSTEM;
      if (err.name === 'ValidationError') {
        category = ErrorCategory.VALIDATION;
      } else if (err.name === 'UnauthorizedError') {
        category = ErrorCategory.AUTHENTICATION;
      } else if (err.name === 'ForbiddenError') {
        category = ErrorCategory.AUTHORIZATION;
      } else if (err.name === 'DatabaseError') {
        category = ErrorCategory.DATABASE;
      } else if (err.name === 'ConnectionError' || err.name === 'NetworkError') {
        category = ErrorCategory.NETWORK;
      } else if (err.name === 'IntegrationError') {
        category = ErrorCategory.INTEGRATION;
      }

      // Add severity and category to context
      errorContext.severity = severity;
      errorContext.category = category;

      // Handle the error using our service
      await errorHandlingService.handleError(err.message || 'Unknown error', errorContext);

      // Determine appropriate status code
      let statusCode = 500;
      if (err.name === 'ValidationError') {
        statusCode = 400;
      } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
      } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
      } else if (err.name === 'NotFoundError') {
        statusCode = 404;
      } else if (err.name === 'ConflictError') {
        statusCode = 409;
      }

      // Send error response
      res.status(statusCode).json({
        error: {
          message: err.message || 'An unexpected error occurred',
          code: err.name || 'UNKNOWN_ERROR',
          status: statusCode
        }
      });
    } catch (error) {
      // If error handling fails, log it and send a generic error
      logger.error('Error in error handler middleware:', error);
      res.status(500).json({
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_SERVER_ERROR',
          status: 500
        }
      });
    }
  };
};

/**
 * Request ID middleware to add a unique ID to each request
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  next();
};

/**
 * Correlation ID middleware to track related requests
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use existing correlation ID from header or generate a new one
  req.correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  next();
};

/**
 * Error boundary middleware to catch unhandled errors
 */
export const errorBoundary = (errorHandlingService: ErrorHandlingService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original error handler
    const originalErrorHandler = res.locals.errorHandler;
    
    // Override the error handler
    res.locals.errorHandler = (err: Error) => {
      // Call the original error handler if it exists
      if (originalErrorHandler) {
        originalErrorHandler(err);
      }
      
      // Handle the error with our service
      errorHandlingService.handleError(err, {
        userId: req.user?.id,
        requestId: req.id,
        correlationId: req.correlationId,
        source: `${req.method} ${req.path}`,
        context: {
          query: req.query,
          params: req.params,
          body: req.body
        }
      });
    };
    
    next();
  };
}; 
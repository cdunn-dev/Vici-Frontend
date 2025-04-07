import { Request, Response, NextFunction } from 'express';
import { PerformanceMonitoringService } from '../services/performanceMonitoringService';
import { logger } from '../utils/logger';

/**
 * Middleware to track endpoint performance
 * This middleware should be added to the Express app to track performance metrics for all endpoints
 */
export const performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip tracking for certain paths (e.g., health checks, metrics endpoints)
  if (req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
    return next();
  }

  // Get the start time
  const startTime = process.hrtime.bigint();
  
  // Get request size
  const requestSize = req.headers['content-length'] 
    ? parseInt(req.headers['content-length'] as string, 10) 
    : 0;
  
  // Store original end function
  const originalEnd = res.end;
  let responseSize = 0;
  
  // Override end function to capture response size
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    // Calculate response size
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
    }
    
    // Restore original end function
    res.end = originalEnd;
    
    // Call original end
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  // Add listener for when response is finished
  res.on('finish', () => {
    try {
      // Calculate response time in milliseconds
      const endTime = process.hrtime.bigint();
      const responseTimeNs = Number(endTime - startTime);
      const responseTimeMs = responseTimeNs / 1_000_000;
      
      // Get performance monitoring service
      const performanceService = PerformanceMonitoringService.getInstance();
      
      // Track endpoint performance
      performanceService.trackEndpointPerformance(
        req.path,
        req.method,
        res.statusCode,
        responseTimeMs,
        requestSize,
        responseSize
      );
    } catch (error) {
      // Log error but don't throw to avoid breaking the request
      logger.error('Error tracking endpoint performance', { 
        error, 
        path: req.path, 
        method: req.method 
      });
    }
  });
  
  // Continue to next middleware
  next();
}; 
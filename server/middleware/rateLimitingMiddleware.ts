import { Request, Response, NextFunction } from 'express';
import { RateLimitingService } from '../services/rateLimitingService';
import { ErrorHandlingService, ErrorCategory, ErrorSeverity } from '../services/errorHandlingService';

/**
 * Rate limiting middleware configuration
 */
export interface RateLimitingMiddlewareConfig {
  // Whether to use IP-based rate limiting
  useIpBasedLimiting: boolean;
  // Whether to use user-based rate limiting
  useUserBasedLimiting: boolean;
  // Default rate limit tier to use
  defaultTier: string;
  // Custom identifier function
  getIdentifier?: (req: Request) => string;
  // Path-specific rate limit tiers
  pathTiers?: { [path: string]: string };
  // Paths to exclude from rate limiting
  excludePaths?: string[];
}

// Default configuration
const DEFAULT_CONFIG: RateLimitingMiddlewareConfig = {
  useIpBasedLimiting: true,
  useUserBasedLimiting: false,
  defaultTier: 'default',
  pathTiers: {
    '/api/v1/auth': 'auth', // Lower limits for auth endpoints
    '/api/v1/users': 'users', // Standard limits for user endpoints
    '/api/v1/training': 'training', // Higher limits for training endpoints
    '/api/v1/workouts': 'workouts' // Higher limits for workout endpoints
  },
  excludePaths: ['/health', '/docs'] // Exclude health checks and docs
};

/**
 * Create a rate limiting middleware
 */
export const createRateLimitingMiddleware = (
  rateLimitingService: RateLimitingService,
  errorHandlingService: ErrorHandlingService,
  config: Partial<RateLimitingMiddlewareConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting for excluded paths
      if (finalConfig.excludePaths?.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Get the identifier for rate limiting
      let identifier: string | undefined;
      
      if (finalConfig.getIdentifier) {
        identifier = finalConfig.getIdentifier(req);
      } else if (finalConfig.useUserBasedLimiting && req.user?.id) {
        identifier = `user:${req.user.id}`;
      } else if (finalConfig.useIpBasedLimiting) {
        identifier = `ip:${req.ip}`;
      }
      
      if (!identifier) {
        return next();
      }

      // Get the appropriate tier for the path
      let tier = finalConfig.defaultTier;
      if (finalConfig.pathTiers) {
        const matchingPath = Object.keys(finalConfig.pathTiers)
          .find(path => req.path.startsWith(path));
        if (matchingPath) {
          tier = finalConfig.pathTiers[matchingPath];
        }
      }
      
      // Check if the request should be rate limited
      const { limited, remaining, reset } = await rateLimitingService.isRateLimited(
        identifier,
        tier
      );
      
      // Add rate limit headers
      const headers = await rateLimitingService.getRateLimitHeaders(identifier, tier);
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      if (limited) {
        // Return 429 Too Many Requests
        return res.status(429).json({
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((reset - Date.now()) / 1000)
          }
        });
      }
      
      next();
    } catch (error) {
      // Handle any errors from the rate limiting service
      await errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitingMiddleware'
      });
      
      // Continue the request even if rate limiting fails
      next();
    }
  };
}; 
import { Request, Response, NextFunction } from 'express';
import { createRateLimitingMiddleware, RateLimitingMiddlewareConfig } from '../rateLimitingMiddleware';
import { RateLimitingService } from '../../services/rateLimitingService';
import { ErrorHandlingService } from '../../services/errorHandlingService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

jest.mock('../../services/rateLimitingService', () => ({
  RateLimitingService: {
    getInstance: jest.fn().mockReturnValue({
      isRateLimited: jest.fn(),
      getRateLimitHeaders: jest.fn()
    })
  }
}));

jest.mock('../../services/errorHandlingService', () => ({
  ErrorHandlingService: {
    getInstance: jest.fn().mockReturnValue({
      handleError: jest.fn()
    })
  }
}));

describe('RateLimitingMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let rateLimitingService: jest.Mocked<RateLimitingService>;
  let errorHandlingService: jest.Mocked<ErrorHandlingService>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock request
    mockRequest = {
      ip: '127.0.0.1',
      user: { id: 'test-user-id' }
    };
    
    // Create mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
    
    // Create mock next function
    nextFunction = jest.fn();
    
    // Get mock services
    rateLimitingService = RateLimitingService.getInstance() as jest.Mocked<RateLimitingService>;
    errorHandlingService = ErrorHandlingService.getInstance() as jest.Mocked<ErrorHandlingService>;
    
    // Mock rate limiting service methods
    rateLimitingService.isRateLimited = jest.fn().mockResolvedValue({
      limited: false,
      remaining: 99,
      reset: Date.now() + 60000
    });
    
    rateLimitingService.getRateLimitHeaders = jest.fn().mockResolvedValue({
      'X-RateLimit-Limit': 100,
      'X-RateLimit-Remaining': 99,
      'X-RateLimit-Reset': Math.ceil((Date.now() + 60000) / 1000)
    });
  });
  
  describe('IP-based rate limiting', () => {
    it('should use IP-based rate limiting when configured', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: true,
        useUserBasedLimiting: false,
        defaultTier: 'default'
      };
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(rateLimitingService.isRateLimited).toHaveBeenCalledWith('ip:127.0.0.1', 'default');
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('User-based rate limiting', () => {
    it('should use user-based rate limiting when configured and user is present', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: false,
        useUserBasedLimiting: true,
        defaultTier: 'default'
      };
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(rateLimitingService.isRateLimited).toHaveBeenCalledWith('user:test-user-id', 'default');
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should skip rate limiting when user is not present', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: false,
        useUserBasedLimiting: true,
        defaultTier: 'default'
      };
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      // Remove user from request
      mockRequest.user = undefined;
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(rateLimitingService.isRateLimited).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('Custom identifier function', () => {
    it('should use custom identifier function when provided', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: false,
        useUserBasedLimiting: false,
        defaultTier: 'default',
        getIdentifier: (req) => `custom:${req.ip}-${req.user?.id}`
      };
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(rateLimitingService.isRateLimited).toHaveBeenCalledWith('custom:127.0.0.1-test-user-id', 'default');
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('Rate limit headers', () => {
    it('should set rate limit headers on response', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: true,
        useUserBasedLimiting: false,
        defaultTier: 'default'
      };
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });
  });
  
  describe('Rate limit exceeded', () => {
    it('should return 429 status when rate limit is exceeded', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: true,
        useUserBasedLimiting: false,
        defaultTier: 'default'
      };
      
      // Mock rate limit exceeded
      rateLimitingService.isRateLimited = jest.fn().mockResolvedValue({
        limited: true,
        remaining: 0,
        reset: Date.now() + 60000
      });
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: expect.any(Number)
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
  
  describe('Error handling', () => {
    it('should handle errors from rate limiting service', async () => {
      const config: RateLimitingMiddlewareConfig = {
        useIpBasedLimiting: true,
        useUserBasedLimiting: false,
        defaultTier: 'default'
      };
      
      // Mock rate limiting service error
      const error = new Error('Rate limiting service error');
      rateLimitingService.isRateLimited = jest.fn().mockRejectedValue(error);
      
      const middleware = createRateLimitingMiddleware(rateLimitingService, errorHandlingService, config);
      
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(errorHandlingService.handleError).toHaveBeenCalledWith(error, {
        category: 'SYSTEM',
        severity: 'HIGH',
        source: 'RateLimitingMiddleware'
      });
      expect(nextFunction).toHaveBeenCalled();
    });
  });
}); 
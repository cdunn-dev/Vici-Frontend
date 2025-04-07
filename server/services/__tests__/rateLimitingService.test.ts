import { RateLimitingService, RateLimitConfig, RateLimitTier } from '../rateLimitingService';
import { ErrorHandlingService } from '../errorHandlingService';
import { ErrorCategory, ErrorSeverity } from '../errorHandlingService';

jest.mock('../errorHandlingService', () => ({
  ErrorHandlingService: {
    getInstance: jest.fn().mockReturnValue({
      handleError: jest.fn()
    })
  }
}));

describe('RateLimitingService', () => {
  let rateLimitingService: RateLimitingService;
  let errorHandlingService: jest.Mocked<ErrorHandlingService>;
  
  beforeEach(() => {
    // Reset the singleton instance
    (RateLimitingService as any).instance = undefined;
    
    // Get the mock error handling service
    errorHandlingService = ErrorHandlingService.getInstance() as jest.Mocked<ErrorHandlingService>;
    
    // Create a new instance of the rate limiting service
    rateLimitingService = RateLimitingService.getInstance(errorHandlingService);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = RateLimitingService.getInstance();
      const instance2 = RateLimitingService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    it('should throw an error if ErrorHandlingService is not provided for first initialization', () => {
      (RateLimitingService as any).instance = undefined;
      
      expect(() => RateLimitingService.getInstance()).toThrow('ErrorHandlingService is required for first initialization');
    });
  });
  
  describe('addTier', () => {
    it('should add a new rate limit tier', async () => {
      const tier: RateLimitTier = {
        name: 'test',
        maxTokens: 10,
        refillRate: 1,
        timeWindow: 60
      };
      
      rateLimitingService.addTier('test', tier);
      
      // Verify the tier was added by checking rate limiting
      const result = await rateLimitingService.isRateLimited('test-identifier', 'test');
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(9);
    });
  });
  
  describe('addToBypassList', () => {
    it('should add an identifier to the bypass list', async () => {
      const identifier = 'test-identifier';
      
      rateLimitingService.addToBypassList(identifier);
      
      // Verify the identifier is bypassed
      const result = await rateLimitingService.isRateLimited(identifier);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(-1);
    });
  });
  
  describe('removeFromBypassList', () => {
    it('should remove an identifier from the bypass list', async () => {
      const identifier = 'test-identifier';
      
      rateLimitingService.addToBypassList(identifier);
      rateLimitingService.removeFromBypassList(identifier);
      
      // Verify the identifier is no longer bypassed
      const result = await rateLimitingService.isRateLimited(identifier);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(99); // Default maxTokens - 1
    });
  });
  
  describe('isRateLimited', () => {
    it('should rate limit requests based on the token bucket algorithm', async () => {
      const identifier = 'test-identifier';
      
      // First request should not be limited
      const result1 = await rateLimitingService.isRateLimited(identifier);
      expect(result1.limited).toBe(false);
      expect(result1.remaining).toBe(99);
      
      // Make 100 requests (default maxTokens)
      for (let i = 0; i < 100; i++) {
        await rateLimitingService.isRateLimited(identifier);
      }
      
      // Next request should be limited
      const result2 = await rateLimitingService.isRateLimited(identifier);
      expect(result2.limited).toBe(true);
      expect(result2.remaining).toBe(0);
    });
    
    it('should refill tokens based on the refill rate', async () => {
      const identifier = 'test-identifier';
      
      // Make 100 requests to empty the bucket
      for (let i = 0; i < 100; i++) {
        await rateLimitingService.isRateLimited(identifier);
      }
      
      // Wait for 1 second (default refillRate is 10 tokens per second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Should have 10 tokens available
      const result = await rateLimitingService.isRateLimited(identifier);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(9);
    });
  });
  
  describe('getRateLimitHeaders', () => {
    it('should return the correct rate limit headers', async () => {
      const identifier = 'test-identifier';
      
      const headers = await rateLimitingService.getRateLimitHeaders(identifier);
      
      expect(headers).toEqual({
        'X-RateLimit-Limit': 100,
        'X-RateLimit-Remaining': 99,
        'X-RateLimit-Reset': expect.any(Number)
      });
    });
  });
  
  describe('cleanup', () => {
    it('should clean up resources', async () => {
      await rateLimitingService.cleanup();
      // No errors should be thrown
    });
  });
}); 
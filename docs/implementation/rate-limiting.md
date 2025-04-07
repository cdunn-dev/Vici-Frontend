# Rate Limiting Implementation

## Overview

The rate limiting system provides API rate limiting and request throttling capabilities. It includes:

- Token bucket algorithm for rate limiting
- IP-based and user-based rate limiting
- Custom rate limit tiers
- Redis support for distributed rate limiting
- Request throttling with different strategies

## Implementation Details

### Rate Limiting Service

The `RateLimitingService` is a singleton service that manages rate limiting throughout the application.

#### Basic Usage

```typescript
import { RateLimitingService } from '../services/rateLimitingService';
import { RedisService } from '../services/redisService';

// Get the rate limiting service instance
const rateLimitingService = RateLimitingService.getInstance(redisService);

// Check if a request should be rate limited
const result = await rateLimitingService.checkRateLimit({
  key: 'user:123',
  limit: 100,
  window: 3600 // 1 hour
});

if (result.allowed) {
  // Process the request
} else {
  // Handle rate limit exceeded
  throw new RateLimitExceededError({
    retryAfter: result.retryAfter,
    limit: result.limit,
    remaining: result.remaining
  });
}
```

### Rate Limit Tiers

The system supports different rate limit tiers:

```typescript
enum RateLimitTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

interface RateLimitConfig {
  [RateLimitTier.FREE]: {
    requestsPerMinute: 60,
    burstSize: 10
  },
  [RateLimitTier.BASIC]: {
    requestsPerMinute: 300,
    burstSize: 50
  },
  [RateLimitTier.PREMIUM]: {
    requestsPerMinute: 1000,
    burstSize: 200
  },
  [RateLimitTier.ENTERPRISE]: {
    requestsPerMinute: 5000,
    burstSize: 1000
  }
}
```

### Token Bucket Algorithm

The system uses the token bucket algorithm for rate limiting:

```typescript
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
}

class TokenBucketRateLimiter {
  private buckets: Map<string, TokenBucket>;

  constructor() {
    this.buckets = new Map();
  }

  async checkRateLimit(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const bucket = this.getOrCreateBucket(key, limit, window);
    return this.processRequest(bucket);
  }

  private getOrCreateBucket(key: string, limit: number, window: number): TokenBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: limit,
        lastRefill: Date.now(),
        capacity: limit,
        refillRate: limit / window
      });
    }
    return this.buckets.get(key)!;
  }

  private processRequest(bucket: TokenBucket): RateLimitResult {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * bucket.refillRate;
    
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        reset: now + (bucket.capacity - bucket.tokens) / bucket.refillRate
      };
    }

    return {
      allowed: false,
      remaining: 0,
      reset: now + (1 - bucket.tokens) / bucket.refillRate
    };
  }
}
```

### Rate Limiting Middleware

The system includes middleware for easy integration with Express:

```typescript
import { createRateLimitingMiddleware } from '../middleware/rateLimitingMiddleware';
import { RateLimitingService } from '../services/rateLimitingService';

// Create the middleware
const rateLimitingMiddleware = createRateLimitingMiddleware(
  rateLimitingService,
  {
    keyGenerator: (req) => req.user?.id || req.ip,
    limit: 100,
    window: 3600,
    errorMessage: 'Rate limit exceeded'
  }
);

// Use the middleware
app.use('/api', rateLimitingMiddleware);
```

### Request Throttling

The system supports different throttling strategies:

```typescript
enum ThrottlingStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket'
}

interface ThrottlingConfig {
  strategy: ThrottlingStrategy;
  limit: number;
  window: number;
  burstSize?: number;
}
```

## Rate Limit Headers

The system includes standard rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

## Monitoring and Analytics

### Rate Limit Tracking
1. Track rate limit hits and misses
2. Monitor rate limit effectiveness
3. Generate rate limit reports

### Analytics Dashboard
1. Real-time rate limit monitoring
2. Historical rate limit data
3. Rate limit pattern analysis

## Performance Considerations

### Redis Integration
1. Use Redis for distributed rate limiting
2. Configure Redis connection pooling
3. Implement Redis failover

### Memory Management
1. Clean up expired rate limit records
2. Monitor memory usage
3. Implement cache eviction policies

## Testing

The rate limiting system includes comprehensive tests:

```bash
# Run rate limiting tests
npm test rate-limiting

# Run specific test categories
npm test rate-limiting:token-bucket
npm test rate-limiting:throttling
npm test rate-limiting:redis
```

## Troubleshooting

### Common Issues
1. Rate Limit Inconsistencies
   - Check Redis connectivity
   - Verify rate limit configuration
   - Monitor rate limit headers

2. Performance Issues
   - Check Redis performance
   - Monitor memory usage
   - Review rate limit settings

3. Throttling Issues
   - Verify throttling strategy
   - Check burst size settings
   - Monitor request patterns

### Debugging

Enable debug logging for detailed rate limiting information:

```typescript
// Set the log level to debug
logger.level = 'debug';
``` 
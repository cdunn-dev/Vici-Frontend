# Rate Limiting System Developer Guide

## Overview

The rate limiting system provides a flexible and scalable way to control API request rates. It implements the token bucket algorithm and supports both local and distributed rate limiting using Redis.

## Features

- Token bucket algorithm for rate limiting
- IP-based and user-based rate limiting
- Custom rate limit tiers
- Redis support for distributed rate limiting
- Rate limit headers
- Bypass lists for trusted clients
- Comprehensive test coverage

## Usage

### Basic Usage

```typescript
import { RateLimitingService } from '../services/rateLimitingService';
import { ErrorHandlingService } from '../services/errorHandlingService';

// Get the rate limiting service instance
const rateLimitingService = RateLimitingService.getInstance(errorHandlingService);

// Check if a request should be rate limited
const { limited, remaining, reset } = await rateLimitingService.isRateLimited('user:123');

if (limited) {
  // Handle rate limited request
  return res.status(429).json({
    error: {
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((reset - Date.now()) / 1000)
    }
  });
}

// Process the request
```

### Using the Middleware

```typescript
import { createRateLimitingMiddleware } from '../middleware/rateLimitingMiddleware';
import { RateLimitingService } from '../services/rateLimitingService';
import { ErrorHandlingService } from '../services/errorHandlingService';

// Get the services
const rateLimitingService = RateLimitingService.getInstance(errorHandlingService);

// Create the middleware with default configuration
const rateLimitingMiddleware = createRateLimitingMiddleware(
  rateLimitingService,
  errorHandlingService
);

// Use the middleware in your Express app
app.use(rateLimitingMiddleware);

// Or with custom configuration
const customRateLimitingMiddleware = createRateLimitingMiddleware(
  rateLimitingService,
  errorHandlingService,
  {
    useIpBasedLimiting: true,
    useUserBasedLimiting: true,
    defaultTier: 'default',
    getIdentifier: (req) => `custom:${req.ip}-${req.user?.id}`
  }
);

app.use('/api', customRateLimitingMiddleware);
```

### Creating Custom Rate Limit Tiers

```typescript
// Add a new rate limit tier
rateLimitingService.addTier('premium', {
  name: 'premium',
  maxTokens: 1000,
  refillRate: 100,
  timeWindow: 60
});

// Use the tier in the middleware
const premiumRateLimitingMiddleware = createRateLimitingMiddleware(
  rateLimitingService,
  errorHandlingService,
  {
    useIpBasedLimiting: false,
    useUserBasedLimiting: true,
    defaultTier: 'premium'
  }
);

app.use('/api/premium', premiumRateLimitingMiddleware);
```

### Using Redis for Distributed Rate Limiting

```typescript
// Initialize the rate limiting service with Redis
const rateLimitingService = RateLimitingService.getInstance(errorHandlingService, {
  maxTokens: 100,
  refillRate: 10,
  timeWindow: 60,
  useRedis: true,
  redisConfig: {
    host: 'localhost',
    port: 6379,
    password: 'your-password',
    db: 0
  }
});
```

### Managing Bypass Lists

```typescript
// Add an IP or user ID to the bypass list
rateLimitingService.addToBypassList('ip:127.0.0.1');
rateLimitingService.addToBypassList('user:admin');

// Remove from bypass list
rateLimitingService.removeFromBypassList('ip:127.0.0.1');
```

## Rate Limit Headers

The rate limiting middleware adds the following headers to responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current time window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit will reset

## Error Handling

The rate limiting system integrates with the error handling service to handle errors gracefully. When a rate limit is exceeded, it returns a 429 Too Many Requests response with the following format:

```json
{
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

## Best Practices

1. **Choose Appropriate Rate Limits**
   - Set rate limits based on your API's capabilities and user needs
   - Consider different tiers for different user types
   - Monitor rate limit effectiveness and adjust as needed

2. **Use Distributed Rate Limiting**
   - Use Redis for distributed rate limiting in multi-server environments
   - Ensure Redis is properly configured for high availability
   - Monitor Redis performance and connection status

3. **Handle Rate Limit Errors Gracefully**
   - Always include the `retryAfter` field in error responses
   - Use the rate limit headers to inform clients about their limits
   - Implement exponential backoff in clients when rate limited

4. **Monitor and Adjust**
   - Track rate limit hits and misses
   - Monitor rate limit effectiveness
   - Adjust rate limits based on usage patterns
   - Use bypass lists sparingly and monitor their usage

## Testing

The rate limiting system includes comprehensive tests for both the service and middleware. Run the tests using:

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Rate Limits Too Restrictive**
   - Check the tier configuration
   - Verify the time window and token refill rate
   - Consider adjusting the limits based on usage patterns

2. **Redis Connection Issues**
   - Verify Redis is running and accessible
   - Check Redis configuration
   - Monitor Redis connection status
   - Consider fallback to local rate limiting

3. **Inconsistent Rate Limiting**
   - Verify Redis is properly configured for distributed rate limiting
   - Check for network issues between servers
   - Monitor Redis performance and connection status

### Debugging

Enable debug logging to see detailed rate limiting information:

```typescript
// Set the log level to debug
logger.level = 'debug';
```

## Contributing

When contributing to the rate limiting system:

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Consider backward compatibility
5. Test with both local and Redis-based rate limiting 
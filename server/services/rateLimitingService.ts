import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { ErrorHandlingService, ErrorCategory, ErrorSeverity } from './errorHandlingService';
import Redis from 'ioredis';
import { RedisService } from './redis';

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  // Maximum number of tokens in the bucket
  maxTokens: number;
  // Rate at which tokens are added to the bucket (tokens per second)
  refillRate: number;
  // Time window for rate limiting (in seconds)
  timeWindow: number;
  // Whether to use Redis for distributed rate limiting
  useRedis?: boolean;
  // Redis configuration (if useRedis is true)
  redisConfig?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  // Monitoring configuration
  monitoring?: {
    // Threshold for rate limit hits percentage to trigger an alert
    rateLimitHitThreshold: number;
    // Threshold for average latency to trigger an alert (in milliseconds)
    latencyThreshold: number;
    // Window size for pattern detection (in minutes)
    patternDetectionWindow: number;
    // Maximum number of metrics to keep in memory
    maxMetricsHistory: number;
  };
}

/**
 * Rate limit tier configuration
 */
export interface RateLimitTier {
  // Tier name
  name: string;
  // Maximum number of tokens in the bucket
  maxTokens: number;
  // Rate at which tokens are added to the bucket (tokens per second)
  refillRate: number;
  // Time window for rate limiting (in seconds)
  timeWindow: number;
}

/**
 * Rate limit metrics interface
 */
export interface RateLimitMetrics {
  timestamp: Date;
  totalRequests: number;
  rateLimitedRequests: number;
  rateLimitHits: number;
  rateLimitMisses: number;
  averageLatency: number;
  byTier: {
    [tier: string]: {
      requests: number;
      rateLimited: number;
      hits: number;
      misses: number;
      averageLatency: number;
    };
  };
  byIdentifier: {
    [identifier: string]: {
      requests: number;
      rateLimited: number;
      hits: number;
      misses: number;
      averageLatency: number;
    };
  };
}

/**
 * Rate limit alert interface
 */
export interface RateLimitAlert {
  timestamp: Date;
  type: 'HIGH_RATE_LIMIT_HITS' | 'HIGH_LATENCY' | 'UNUSUAL_PATTERN';
  message: string;
  details: Record<string, any>;
}

const DEFAULT_MONITORING_CONFIG = {
  rateLimitHitThreshold: 0.1, // 10% rate limit hits threshold
  latencyThreshold: 1000, // 1 second latency threshold
  patternDetectionWindow: 60, // 1 hour window
  maxMetricsHistory: 1000 // Keep last 1000 metrics
};

/**
 * Rate limiting service for API rate limiting
 */
export class RateLimitingService extends EventEmitter {
  private static instance: RateLimitingService;
  private errorHandlingService: ErrorHandlingService;
  private redisClient?: Redis;
  private redisService: RedisService;
  private localBuckets: Map<string, { tokens: number; lastRefill: number }>;
  private defaultConfig: RateLimitConfig;
  private tiers: Map<string, RateLimitTier>;
  private bypassList: Set<string>;
  private metrics: RateLimitMetrics[] = [];
  private alerts: RateLimitAlert[] = [];
  private readonly METRICS_KEY_PREFIX = 'ratelimit:metrics:';
  private readonly DAILY_METRICS_KEY_PREFIX = 'ratelimit:metrics:daily:';

  private constructor(errorHandlingService: ErrorHandlingService, config?: RateLimitConfig) {
    super();
    this.errorHandlingService = errorHandlingService;
    this.redisService = RedisService.getInstance();
    this.localBuckets = new Map();
    this.tiers = new Map();
    this.bypassList = new Set();
    
    // Default configuration
    this.defaultConfig = {
      maxTokens: 100,
      refillRate: 10,
      timeWindow: 60,
      useRedis: false,
      monitoring: DEFAULT_MONITORING_CONFIG,
      ...config
    };
    
    // Initialize Redis if configured
    if (this.defaultConfig.useRedis && this.defaultConfig.redisConfig) {
      this.redisClient = new Redis(this.defaultConfig.redisConfig);
      this.redisClient.on('error', (error) => {
        logger.error('Redis error:', error);
        this.errorHandlingService.handleError(error.message, {
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.HIGH,
          context: { service: 'RateLimitingService', error }
        });
      });
    }
    
    // Add default tier
    this.addTier('default', {
      name: 'default',
      maxTokens: this.defaultConfig.maxTokens,
      refillRate: this.defaultConfig.refillRate,
      timeWindow: this.defaultConfig.timeWindow
    });

    // Start monitoring if Redis is available
    if (this.defaultConfig.useRedis) {
      this.startMonitoring();
    }
  }

  /**
   * Get the singleton instance of the RateLimitingService
   */
  public static getInstance(errorHandlingService?: ErrorHandlingService, config?: RateLimitConfig): RateLimitingService {
    if (!RateLimitingService.instance) {
      if (!errorHandlingService) {
        throw new Error('ErrorHandlingService is required for first initialization');
      }
      RateLimitingService.instance = new RateLimitingService(errorHandlingService, config);
    }
    return RateLimitingService.instance;
  }

  /**
   * Add a rate limit tier
   */
  public addTier(name: string, tier: RateLimitTier): void {
    this.tiers.set(name, tier);
  }

  /**
   * Add an IP or user ID to the bypass list
   */
  public addToBypassList(identifier: string): void {
    this.bypassList.add(identifier);
  }

  /**
   * Remove an IP or user ID from the bypass list
   */
  public removeFromBypassList(identifier: string): void {
    this.bypassList.delete(identifier);
  }

  /**
   * Check if a request should be rate limited
   */
  public async isRateLimited(identifier: string, tier: string = 'default'): Promise<{ limited: boolean; remaining: number; reset: number }> {
    // Check if the identifier is in the bypass list
    if (this.bypassList.has(identifier)) {
      return { limited: false, remaining: -1, reset: 0 };
    }
    
    // Get the tier configuration
    const tierConfig = this.tiers.get(tier) || this.tiers.get('default')!;
    
    // Use Redis for distributed rate limiting if configured
    if (this.defaultConfig.useRedis && this.redisClient) {
      return this.isRateLimitedRedis(identifier, tierConfig);
    }
    
    // Use local rate limiting
    return this.isRateLimitedLocal(identifier, tierConfig);
  }

  /**
   * Check if a request should be rate limited using Redis
   */
  private async isRateLimitedRedis(identifier: string, tier: RateLimitTier): Promise<{ limited: boolean; remaining: number; reset: number }> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }
    
    const key = `ratelimit:${identifier}:${tier.name}`;
    const now = Date.now();
    const windowStart = now - (tier.timeWindow * 1000);
    
    // Use Redis transaction to ensure atomicity
    const result = await this.redisClient.multi()
      .zremrangebyscore(key, 0, windowStart)
      .zcard(key)
      .zadd(key, now, `${now}-${Math.random()}`)
      .expire(key, tier.timeWindow)
      .exec();
    
    if (!result) {
      throw new Error('Redis transaction failed');
    }
    
    const requestCount = result[1][1] as number;
    const limited = requestCount > tier.maxTokens;
    const remaining = Math.max(0, tier.maxTokens - requestCount);
    const reset = now + (tier.timeWindow * 1000);
    
    return { limited, remaining, reset };
  }

  /**
   * Check if a request should be rate limited using local storage
   */
  private isRateLimitedLocal(identifier: string, tier: RateLimitTier): { limited: boolean; remaining: number; reset: number } {
    const key = `${identifier}:${tier.name}`;
    const now = Date.now();
    
    // Get or create bucket
    let bucket = this.localBuckets.get(key);
    if (!bucket) {
      bucket = { tokens: tier.maxTokens, lastRefill: now };
      this.localBuckets.set(key, bucket);
    }
    
    // Refill tokens
    const timePassed = (now - bucket.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * tier.refillRate;
    bucket.tokens = Math.min(tier.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    // Check if rate limited
    const limited = bucket.tokens < 1;
    const remaining = Math.floor(bucket.tokens);
    const reset = now + ((1 - bucket.tokens) / tier.refillRate * 1000);
    
    // Consume token if not limited
    if (!limited) {
      bucket.tokens -= 1;
    }
    
    return { limited, remaining, reset };
  }

  /**
   * Get rate limit headers for a response
   */
  public getRateLimitHeaders(identifier: string, tier: string = 'default'): Promise<{ 'X-RateLimit-Limit': number; 'X-RateLimit-Remaining': number; 'X-RateLimit-Reset': number }> {
    return this.isRateLimited(identifier, tier).then(({ remaining, reset }) => {
      const tierConfig = this.tiers.get(tier) || this.tiers.get('default')!;
      return {
        'X-RateLimit-Limit': tierConfig.maxTokens,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': Math.ceil(reset / 1000) // Convert to Unix timestamp
      };
    });
  }

  /**
   * Track a rate limit request for monitoring
   */
  private async trackRequest(
    identifier: string,
    tier: string,
    rateLimited: boolean,
    latency: number
  ): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const timestamp = new Date();

      // Track total requests
      await this.redisService.incr(`${this.METRICS_KEY_PREFIX}requests:total`);
      await this.redisService.incr(`${this.METRICS_KEY_PREFIX}requests:tier:${tier}`);
      await this.redisService.incr(`${this.METRICS_KEY_PREFIX}requests:identifier:${identifier}`);

      // Track rate limited requests
      if (rateLimited) {
        await this.redisService.incr(`${this.METRICS_KEY_PREFIX}rate_limited:total`);
        await this.redisService.incr(`${this.METRICS_KEY_PREFIX}rate_limited:tier:${tier}`);
        await this.redisService.incr(`${this.METRICS_KEY_PREFIX}rate_limited:identifier:${identifier}`);
      }

      // Track latency
      await this.redisService.lpush(`${this.METRICS_KEY_PREFIX}latency:${tier}`, latency.toString());
      await this.redisService.ltrim(`${this.METRICS_KEY_PREFIX}latency:${tier}`, 0, 999);

      // Track daily metrics
      await this.redisService.incr(`${this.DAILY_METRICS_KEY_PREFIX}${date}:requests:total`);
      await this.redisService.incr(`${this.DAILY_METRICS_KEY_PREFIX}${date}:requests:tier:${tier}`);
      if (rateLimited) {
        await this.redisService.incr(`${this.DAILY_METRICS_KEY_PREFIX}${date}:rate_limited:total`);
        await this.redisService.incr(`${this.DAILY_METRICS_KEY_PREFIX}${date}:rate_limited:tier:${tier}`);
      }

      // Check for alerts
      await this.checkAlerts(identifier, tier, rateLimited, latency);
    } catch (error) {
      logger.error('Error tracking rate limit request:', error);
      await this.errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitingService'
      });
    }
  }

  /**
   * Start monitoring rate limits
   */
  private startMonitoring(): void {
    // Collect metrics every minute
    setInterval(() => this.collectMetrics(), 60000);
  }

  /**
   * Collect rate limit metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date();
      const metrics: RateLimitMetrics = {
        timestamp,
        totalRequests: parseInt(await this.redisService.get(`${this.METRICS_KEY_PREFIX}requests:total`) || '0'),
        rateLimitedRequests: parseInt(await this.redisService.get(`${this.METRICS_KEY_PREFIX}rate_limited:total`) || '0'),
        rateLimitHits: 0,
        rateLimitMisses: 0,
        averageLatency: 0,
        byTier: {},
        byIdentifier: {}
      };

      // Calculate rate limit hits and misses
      metrics.rateLimitHits = metrics.rateLimitedRequests;
      metrics.rateLimitMisses = metrics.totalRequests - metrics.rateLimitedRequests;

      // Calculate average latency
      const latencies = await this.redisService.lrange(`${this.METRICS_KEY_PREFIX}latency:total`, 0, -1);
      if (latencies.length > 0) {
        metrics.averageLatency = latencies.reduce((sum: number, lat: string) => sum + parseFloat(lat), 0) / latencies.length;
      }

      // Add metrics to history
      this.metrics.push(metrics);
      if (this.metrics.length > this.defaultConfig.monitoring!.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.defaultConfig.monitoring!.maxMetricsHistory);
      }

      // Emit metrics event
      this.emit('metrics', metrics);
    } catch (error) {
      logger.error('Error collecting rate limit metrics:', error);
      await this.errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitingService'
      });
    }
  }

  /**
   * Check for rate limit alerts
   */
  private async checkAlerts(
    identifier: string,
    tier: string,
    rateLimited: boolean,
    latency: number
  ): Promise<void> {
    try {
      // Check rate limit hit percentage
      const totalRequests = parseInt(await this.redisService.get(`${this.METRICS_KEY_PREFIX}requests:total`) || '0');
      const rateLimitedRequests = parseInt(await this.redisService.get(`${this.METRICS_KEY_PREFIX}rate_limited:total`) || '0');
      const hitPercentage = totalRequests > 0 ? rateLimitedRequests / totalRequests : 0;

      if (hitPercentage > this.defaultConfig.monitoring!.rateLimitHitThreshold) {
        const alert: RateLimitAlert = {
          timestamp: new Date(),
          type: 'HIGH_RATE_LIMIT_HITS',
          message: `High rate limit hit percentage: ${(hitPercentage * 100).toFixed(2)}%`,
          details: {
            hitPercentage,
            totalRequests,
            rateLimitedRequests,
            tier,
            identifier
          }
        };
        this.alerts.push(alert);
        this.emit('alert', alert);
      }

      // Check latency threshold
      if (latency > this.defaultConfig.monitoring!.latencyThreshold) {
        const alert: RateLimitAlert = {
          timestamp: new Date(),
          type: 'HIGH_LATENCY',
          message: `High rate limit latency: ${latency}ms`,
          details: {
            latency,
            threshold: this.defaultConfig.monitoring!.latencyThreshold,
            tier,
            identifier
          }
        };
        this.alerts.push(alert);
        this.emit('alert', alert);
      }

      // Check for unusual patterns
      await this.checkUnusualPatterns(identifier, tier);
    } catch (error) {
      logger.error('Error checking rate limit alerts:', error);
      await this.errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitingService'
      });
    }
  }

  /**
   * Check for unusual rate limit patterns
   */
  private async checkUnusualPatterns(identifier: string, tier: string): Promise<void> {
    try {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - this.defaultConfig.monitoring!.patternDetectionWindow);

      // Get requests in the window
      const requests = this.metrics
        .filter(m => m.timestamp >= windowStart)
        .reduce((acc, m) => {
          const tierMetrics = m.byTier[tier];
          if (tierMetrics) {
            acc.requests += tierMetrics.requests;
            acc.rateLimited += tierMetrics.rateLimited;
          }
          return acc;
        }, { requests: 0, rateLimited: 0 });

      // Check for sudden spikes
      const previousWindow = this.metrics
        .filter(m => m.timestamp >= new Date(windowStart.getTime() - this.defaultConfig.monitoring!.patternDetectionWindow * 60000))
        .filter(m => m.timestamp < windowStart)
        .reduce((acc, m) => {
          const tierMetrics = m.byTier[tier];
          if (tierMetrics) {
            acc.requests += tierMetrics.requests;
            acc.rateLimited += tierMetrics.rateLimited;
          }
          return acc;
        }, { requests: 0, rateLimited: 0 });

      const requestIncrease = previousWindow.requests > 0
        ? (requests.requests - previousWindow.requests) / previousWindow.requests
        : 0;

      if (requestIncrease > 2) { // More than 200% increase
        const alert: RateLimitAlert = {
          timestamp: new Date(),
          type: 'UNUSUAL_PATTERN',
          message: `Unusual increase in rate limit requests: ${(requestIncrease * 100).toFixed(2)}%`,
          details: {
            requestIncrease,
            currentRequests: requests.requests,
            previousRequests: previousWindow.requests,
            tier,
            identifier
          }
        };
        this.alerts.push(alert);
        this.emit('alert', alert);
      }
    } catch (error) {
      logger.error('Error checking unusual patterns:', error);
      await this.errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitingService'
      });
    }
  }

  /**
   * Get rate limit metrics
   */
  public getMetrics(): RateLimitMetrics[] {
    return this.metrics;
  }

  /**
   * Get rate limit alerts
   */
  public getAlerts(): RateLimitAlert[] {
    return this.alerts;
  }

  /**
   * Get daily rate limit metrics
   */
  public async getDailyMetrics(date: string): Promise<RateLimitMetrics> {
    const metrics: RateLimitMetrics = {
      timestamp: new Date(`${date}T00:00:00Z`),
      totalRequests: parseInt(await this.redisService.get(`${this.DAILY_METRICS_KEY_PREFIX}${date}:requests:total`) || '0'),
      rateLimitedRequests: parseInt(await this.redisService.get(`${this.DAILY_METRICS_KEY_PREFIX}${date}:rate_limited:total`) || '0'),
      rateLimitHits: 0,
      rateLimitMisses: 0,
      averageLatency: 0,
      byTier: {},
      byIdentifier: {}
    };

    metrics.rateLimitHits = metrics.rateLimitedRequests;
    metrics.rateLimitMisses = metrics.totalRequests - metrics.rateLimitedRequests;

    return metrics;
  }

  /**
   * Cleanup rate limit data
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.redisClient) {
        // Clear metrics older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        this.metrics = this.metrics.filter(m => m.timestamp >= thirtyDaysAgo);
        this.alerts = this.alerts.filter(a => a.timestamp >= thirtyDaysAgo);

        // Clear Redis keys
        const keys = await this.redisService.keys(`${this.DAILY_METRICS_KEY_PREFIX}*`);
        for (const key of keys) {
          const date = key.split(':')[3];
          if (new Date(date) < thirtyDaysAgo) {
            await this.redisService.del(key);
          }
        }
      }
    } catch (error) {
      logger.error('Error cleaning up rate limit data:', error);
      await this.errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitingService'
      });
    }
  }
}
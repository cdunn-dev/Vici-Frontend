import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

export type ShardingStrategy = 'modulo' | 'range' | 'geographic' | 'composite' | 'dynamic';

interface ShardConfig {
  id: number;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  region?: string; // For geographic sharding
  rangeStart?: number; // For range sharding
  rangeEnd?: number; // For range sharding
}

interface ShardMetrics {
  shardId: number;
  loadPercentage: number;
  rowCount: number;
  queryCount: number;
  lastRebalanced: Date;
}

export interface ShardingConfig {
  shards: ShardConfig[];
  shardCount: number;
  defaultShard: number;
  strategy: ShardingStrategy;
  // Additional configuration based on strategy
  moduloConfig?: {
    // No additional config needed for modulo
  };
  rangeConfig?: {
    ranges: Array<{ start: number; end: number; shardId: number }>;
  };
  geographicConfig?: {
    regions: Record<string, number[]>; // region -> shardIds
  };
  compositeConfig?: {
    primaryStrategy: ShardingStrategy;
    secondaryStrategy: ShardingStrategy;
  };
  dynamicConfig?: {
    rebalanceThreshold: number;
    minShardSize: number;
    maxShardSize: number;
    loadThreshold: number;
    monitoringInterval: number;
    maxShardCount: number;
    minShardCount: number;
  };
}

export class ShardingService {
  private static instance: ShardingService;
  private shardPools: Map<number, Pool>;
  private config: ShardingConfig;
  private isInitialized: boolean = false;
  private metrics: Map<number, ShardMetrics>;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private autoScalingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.shardPools = new Map();
    this.metrics = new Map();
    this.config = {
      shards: [],
      shardCount: 0,
      defaultShard: 0,
      strategy: 'modulo'
    };
  }

  public static getInstance(): ShardingService {
    if (!ShardingService.instance) {
      ShardingService.instance = new ShardingService();
    }
    return ShardingService.instance;
  }

  public getShardCount(): number {
    return this.config.shardCount;
  }

  public async initialize(config: ShardingConfig): Promise<void> {
    if (this.isInitialized) {
      logger.warn('ShardingService is already initialized');
      return;
    }

    try {
      this.config = config;
      
      // Initialize connection pools for each shard
      for (const shard of config.shards) {
        const poolConfig: PoolConfig = {
          host: shard.host,
          port: shard.port,
          database: shard.database,
          user: shard.user,
          password: shard.password,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        };

        const pool = new Pool(poolConfig);
        
        // Test the connection
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();

        this.shardPools.set(shard.id, pool);
        this.metrics.set(shard.id, {
          shardId: shard.id,
          loadPercentage: 0,
          rowCount: 0,
          queryCount: 0,
          lastRebalanced: new Date()
        });
        logger.info(`Initialized connection pool for shard ${shard.id}`);
      }

      // Start monitoring if using dynamic sharding
      if (config.strategy === 'dynamic' && config.dynamicConfig) {
        await this.startMonitoring();
      }

      this.isInitialized = true;
      logger.info('ShardingService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ShardingService:', error);
      throw new Error('Failed to initialize sharding service');
    }
  }

  private getShardKeyModulo(userId: number): number {
    return userId % this.config.shardCount;
  }

  private getShardKeyRange(userId: number): number {
    if (!this.config.rangeConfig) {
      throw new Error('Range configuration not provided');
    }

    for (const range of this.config.rangeConfig.ranges) {
      if (userId >= range.start && userId <= range.end) {
        return range.shardId;
      }
    }

    return this.config.defaultShard;
  }

  private getShardKeyGeographic(region: string): number {
    if (!this.config.geographicConfig) {
      throw new Error('Geographic configuration not provided');
    }

    const shardIds = this.config.geographicConfig.regions[region];
    if (!shardIds || shardIds.length === 0) {
      return this.config.defaultShard;
    }

    // Simple round-robin for now, could be enhanced
    return shardIds[0];
  }

  private getShardKeyComposite(userId: number, region?: string): number {
    if (!this.config.compositeConfig) {
      throw new Error('Composite configuration not provided');
    }

    const primaryKey = this.getShardKey(userId, region);
    const secondaryKey = this.getShardKey(userId, region);

    // Combine keys in a way that ensures even distribution
    return (primaryKey + secondaryKey) % this.config.shardCount;
  }

  public getShardKey(userId: number, region?: string): number {
    if (!this.isInitialized) {
      throw new Error('ShardingService not initialized');
    }

    switch (this.config.strategy) {
      case 'modulo':
        return this.getShardKeyModulo(userId);
      case 'range':
        return this.getShardKeyRange(userId);
      case 'geographic':
        if (!region) {
          throw new Error('Region required for geographic sharding');
        }
        return this.getShardKeyGeographic(region);
      case 'composite':
        return this.getShardKeyComposite(userId, region);
      case 'dynamic':
        // Dynamic sharding would involve more complex logic
        // For now, fall back to modulo
        return this.getShardKeyModulo(userId);
      default:
        return this.config.defaultShard;
    }
  }

  public async getShardPool(userId: number, region?: string): Promise<Pool> {
    if (!this.isInitialized) {
      throw new Error('ShardingService not initialized');
    }

    const shardId = this.getShardKey(userId, region);
    const pool = this.shardPools.get(shardId);

    if (!pool) {
      logger.error(`No connection pool found for shard ${shardId}`);
      throw new Error(`No connection pool found for shard ${shardId}`);
    }

    // Update metrics
    const currentQueries = this.metrics.get(shardId)?.queryCount || 0;
    this.metrics.set(shardId, {
      ...this.metrics.get(shardId)!,
      queryCount: currentQueries + 1
    });

    return pool;
  }

  public async executeQuery<T extends Record<string, any>>(
    userId: number,
    query: string,
    params?: any[],
    region?: string
  ): Promise<T[]> {
    const pool = await this.getShardPool(userId, region);
    const result = await pool.query<T>(query, params);
    return result.rows;
  }

  public async executeTransaction<T>(
    userId: number,
    callback: (client: any) => Promise<T>,
    region?: string
  ): Promise<T> {
    const pool = await this.getShardPool(userId, region);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<Map<number, boolean>> {
    const results = new Map<number, boolean>();

    for (const [shardId, pool] of this.shardPools) {
      try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        results.set(shardId, true);
      } catch (error) {
        logger.error(`Health check failed for shard ${shardId}:`, error);
        results.set(shardId, false);
      }
    }

    return results;
  }

  public getMetrics(): Map<number, ShardMetrics> {
    return this.metrics;
  }

  public async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.autoScalingInterval) {
      clearInterval(this.autoScalingInterval);
      this.autoScalingInterval = null;
    }

    // Close all connection pools
    for (const pool of this.shardPools.values()) {
      await pool.end();
    }
    
    this.shardPools.clear();
    this.metrics.clear();
    this.isInitialized = false;
  }

  /**
   * Start monitoring shard metrics for dynamic sharding
   */
  private async startMonitoring(): Promise<void> {
    if (!this.config.dynamicConfig) {
      throw new Error('Dynamic sharding configuration not provided');
    }

    logger.info('Starting shard monitoring');
    
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkRebalancing();
    }, this.config.dynamicConfig.monitoringInterval);

    this.autoScalingInterval = setInterval(async () => {
      await this.checkScaling();
    }, this.config.dynamicConfig.monitoringInterval);
  }

  /**
   * Collect metrics for all shards
   */
  private async collectMetrics(): Promise<void> {
    for (const [shardId, metrics] of this.metrics) {
      const pool = this.shardPools.get(shardId);
      if (!pool) continue;
      
      try {
        // Get row count
        const rowCountResult = await pool.query(`
          SELECT COUNT(*) as count FROM (
            SELECT 'users' as table_name, COUNT(*) as count FROM users
            UNION ALL
            SELECT 'training_plans', COUNT(*) FROM training_plans
            UNION ALL
            SELECT 'workout_notes', COUNT(*) FROM workout_notes
          ) as counts
        `);
        
        // Get query count (from pg_stat_statements)
        const queryCountResult = await pool.query(`
          SELECT sum(calls) as total_queries
          FROM pg_stat_statements
        `);
        
        // Calculate load percentage based on row count and query count
        const rowCount = parseInt(rowCountResult.rows[0].count);
        const queryCount = parseInt(queryCountResult.rows[0].total_queries);
        const loadPercentage = this.calculateLoadPercentage(rowCount, queryCount);
        
        this.metrics.set(shardId, {
          ...metrics,
          rowCount,
          queryCount,
          loadPercentage
        });
        
        logger.debug(`Shard ${shardId} metrics updated`, {
          shardId,
          rowCount,
          queryCount,
          loadPercentage
        });
      } catch (error) {
        logger.error(`Failed to collect metrics for shard ${shardId}`, { error });
      }
    }
  }

  /**
   * Calculate load percentage based on row count and query count
   */
  private calculateLoadPercentage(rowCount: number, queryCount: number): number {
    if (!this.config.dynamicConfig) {
      throw new Error('Dynamic sharding configuration not provided');
    }

    const maxRows = this.config.dynamicConfig.maxShardSize;
    const maxQueries = 10000; // Example max queries per interval
    
    const rowLoad = rowCount / maxRows;
    const queryLoad = queryCount / maxQueries;
    
    return Math.max(rowLoad, queryLoad);
  }

  /**
   * Check if rebalancing is needed
   */
  private async checkRebalancing(): Promise<void> {
    if (!this.config.dynamicConfig) {
      throw new Error('Dynamic sharding configuration not provided');
    }

    const metrics = Array.from(this.metrics.values());
    const avgLoad = metrics.reduce((sum, m) => sum + m.loadPercentage, 0) / metrics.length;
    
    // Find shards that need rebalancing
    const overloadedShards = metrics.filter(m => 
      m.loadPercentage > avgLoad * (1 + this.config.dynamicConfig!.rebalanceThreshold)
    );
    const underloadedShards = metrics.filter(m => 
      m.loadPercentage < avgLoad * (1 - this.config.dynamicConfig!.rebalanceThreshold)
    );
    
    if (overloadedShards.length > 0 && underloadedShards.length > 0) {
      logger.info('Rebalancing needed', {
        overloadedShards: overloadedShards.map(s => s.shardId),
        underloadedShards: underloadedShards.map(s => s.shardId)
      });
      
      await this.rebalanceShards(overloadedShards, underloadedShards);
    }
  }

  /**
   * Check if scaling is needed
   */
  private async checkScaling(): Promise<void> {
    if (!this.config.dynamicConfig) {
      throw new Error('Dynamic sharding configuration not provided');
    }

    const metrics = Array.from(this.metrics.values());
    const avgLoad = metrics.reduce((sum, m) => sum + m.loadPercentage, 0) / metrics.length;

    if (avgLoad > this.config.dynamicConfig.loadThreshold && 
        this.config.shardCount < this.config.dynamicConfig.maxShardCount) {
      await this.scaleUp();
    } else if (avgLoad < this.config.dynamicConfig.loadThreshold / 2 && 
               this.config.shardCount > this.config.dynamicConfig.minShardCount) {
      await this.scaleDown();
    }
  }

  /**
   * Scale up by adding a new shard
   */
  private async scaleUp(): Promise<void> {
    // Implementation for adding a new shard
    logger.info('Scaling up - adding new shard');
    // This would involve:
    // 1. Creating a new database instance
    // 2. Updating the configuration
    // 3. Rebalancing data
  }

  /**
   * Scale down by removing an underutilized shard
   */
  private async scaleDown(): Promise<void> {
    // Implementation for removing a shard
    logger.info('Scaling down - removing underutilized shard');
    // This would involve:
    // 1. Identifying the least utilized shard
    // 2. Moving its data to other shards
    // 3. Removing the shard
  }

  /**
   * Rebalance data between shards
   */
  private async rebalanceShards(
    overloadedShards: ShardMetrics[],
    underloadedShards: ShardMetrics[]
  ): Promise<void> {
    // Implementation for rebalancing data between shards
    logger.info('Rebalancing shards');
    // This would involve:
    // 1. Calculating how much data to move
    // 2. Moving data between shards
    // 3. Updating shard mappings
  }
} 
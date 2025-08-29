import { Knex } from 'knex';
import Redis from 'redis';
import logger from './logger';

interface QueryPerformanceMetrics {
  query: string;
  duration: number;
  timestamp: number;
  cacheHit?: boolean;
  rowCount?: number;
}

interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPattern: string;
  dependencies?: string[]; // Cache invalidation dependencies
}

class DatabasePerformanceOptimizer {
  private static instance: DatabasePerformanceOptimizer;
  private redis!: Redis.RedisClientType;
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private slowQueryThreshold = 1000; // 1 second
  private cacheConfigs: Map<string, CacheConfig> = new Map();

  constructor() {
    this.initializeRedis();
    this.setupDefaultCacheConfigs();
  }

  static getInstance(): DatabasePerformanceOptimizer {
    if (!DatabasePerformanceOptimizer.instance) {
      DatabasePerformanceOptimizer.instance = new DatabasePerformanceOptimizer();
    }
    return DatabasePerformanceOptimizer.instance;
  }

  private async initializeRedis() {
    try {
      this.redis = Redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DB || '0'),
        // Connection optimization
        commandsQueueMaxLength: 100,
      });

      this.redis.on('error', (err) => {
        logger.error('Redis connection error:', err);
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
    }
  }

  private setupDefaultCacheConfigs() {
    // User data - longer TTL as it changes less frequently
    this.cacheConfigs.set('users', {
      ttl: 3600, // 1 hour
      keyPattern: 'user:',
      dependencies: ['user_updates', 'user_deletions'],
    });

    // Vehicle inventory - medium TTL
    this.cacheConfigs.set('vehicles', {
      ttl: 1800, // 30 minutes
      keyPattern: 'vehicle:',
      dependencies: ['vehicle_updates', 'inventory_changes'],
    });

    // Dashboard stats - short TTL for real-time feel
    this.cacheConfigs.set('dashboard_stats', {
      ttl: 300, // 5 minutes
      keyPattern: 'dashboard:',
      dependencies: ['sales_updates', 'inventory_changes'],
    });

    // CRM data - medium TTL
    this.cacheConfigs.set('crm_data', {
      ttl: 1800, // 30 minutes
      keyPattern: 'crm:',
      dependencies: ['customer_updates', 'lead_updates'],
    });

    // Search results - short TTL
    this.cacheConfigs.set('search_results', {
      ttl: 600, // 10 minutes
      keyPattern: 'search:',
      dependencies: ['data_updates'],
    });
  }

  // Enhanced query wrapper with performance monitoring and caching
  async executeQuery<T = any>(
    _knex: Knex,
    queryBuilder: () => Knex.QueryBuilder,
    cacheKey?: string,
    cacheType?: string
  ): Promise<T> {
    const startTime = Date.now();
    const query = queryBuilder().toString();
    
    // Try cache first if cacheKey provided
    if (cacheKey && this.redis && this.redis.isReady) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const duration = Date.now() - startTime;
          this.trackQuery(query, duration, true);
          
          logger.debug(`Cache hit for key: ${cacheKey}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        logger.warn('Cache read error:', error);
      }
    }

    // Execute query
    try {
      const result = await queryBuilder();
      const duration = Date.now() - startTime;
      
      this.trackQuery(query, duration, false, Array.isArray(result) ? result.length : 1);

      // Cache the result if cacheKey provided
      if (cacheKey && cacheType && this.redis && this.redis.isReady) {
        try {
          const config = this.cacheConfigs.get(cacheType);
          if (config) {
            await this.redis.setEx(cacheKey, config.ttl, JSON.stringify(result));
            logger.debug(`Cached result for key: ${cacheKey}, TTL: ${config.ttl}s`);
          }
        } catch (error) {
          logger.warn('Cache write error:', error);
        }
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.trackQuery(query, duration, false, 0);
      logger.error(`Query failed (${duration}ms):`, query, error);
      throw error;
    }
  }

  // Batch operations for better performance
  async executeBatch<T = any>(
    knex: Knex,
    queries: Array<() => Knex.QueryBuilder>,
    transaction?: boolean
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      if (transaction) {
        return await knex.transaction(async (trx) => {
          return Promise.all(queries.map(queryBuilder => queryBuilder().transacting(trx)));
        });
      } else {
        return await Promise.all(queries.map(queryBuilder => queryBuilder()));
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Batch execution failed (${duration}ms):`, error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      logger.info(`Batch execution completed in ${duration}ms (${queries.length} queries)`);
    }
  }

  // Optimized pagination with cursor-based pagination for large datasets
  async paginatedQuery<T = any>(
    knex: Knex,
    baseQuery: () => Knex.QueryBuilder,
    {
      limit = 20,
      offset = 0,
      cursor,
      cursorField = 'id',
      orderBy = 'id',
      orderDirection = 'asc' as 'asc' | 'desc',
      cacheKey,
      cacheType,
    }: {
      limit?: number;
      offset?: number;
      cursor?: any;
      cursorField?: string;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
      cacheKey?: string;
      cacheType?: string;
    }
  ): Promise<{
    data: T[];
    pagination: {
      limit: number;
      offset?: number;
      cursor?: any;
      hasMore: boolean;
      total?: number;
    };
  }> {
    const startTime = Date.now();

    try {
      let query = baseQuery().orderBy(orderBy, orderDirection);

      // Use cursor-based pagination for better performance on large datasets
      if (cursor) {
        const operator = orderDirection === 'asc' ? '>' : '<';
        query = query.where(cursorField, operator, cursor);
      } else if (offset > 0) {
        query = query.offset(offset);
      }

      query = query.limit(limit + 1); // Get one extra to check if there are more

      const results = await this.executeQuery(knex, () => query, cacheKey, cacheType);
      
      const hasMore = results.length > limit;
      const data = hasMore ? results.slice(0, limit) : results;
      
      let nextCursor;
      if (hasMore && data.length > 0) {
        nextCursor = data[data.length - 1][cursorField];
      }

      const duration = Date.now() - startTime;
      logger.debug(`Paginated query completed in ${duration}ms, returned ${data.length} items`);

      return {
        data,
        pagination: {
          limit,
          offset: cursor ? undefined : offset,
          cursor: nextCursor,
          hasMore,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Paginated query failed (${duration}ms):`, error);
      throw error;
    }
  }

  // Cache invalidation
  async invalidateCache(pattern: string): Promise<void> {
    if (!this.redis || !this.redis.isReady) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  // Invalidate cache by dependencies
  async invalidateCacheByDependency(dependency: string): Promise<void> {
    for (const [cacheType, config] of this.cacheConfigs.entries()) {
      if (config.dependencies?.includes(dependency)) {
        await this.invalidateCache(`${config.keyPattern}*`);
      }
    }
  }

  // Bulk cache warming
  async warmCache(
    _knex: Knex,
    cacheSpecs: Array<{
      key: string;
      type: string;
      queryBuilder: () => Knex.QueryBuilder;
    }>
  ): Promise<void> {
    if (!this.redis || !this.redis.isReady) {
      return;
    }

    const startTime = Date.now();
    
    try {
      const promises = cacheSpecs.map(async ({ key, type, queryBuilder }) => {
        // Check if already cached
        const exists = await this.redis.exists(key);
        if (exists) {
          return;
        }

        // Execute query and cache result
        const result = await queryBuilder();
        const config = this.cacheConfigs.get(type);
        
        if (config) {
          await this.redis.setEx(key, config.ttl, JSON.stringify(result));
        }
      });

      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      logger.info(`Cache warming completed in ${duration}ms for ${cacheSpecs.length} items`);
    } catch (error) {
      logger.error('Cache warming failed:', error);
    }
  }

  // Query performance tracking
  private trackQuery(
    query: string,
    duration: number,
    cacheHit: boolean = false,
    rowCount?: number
  ) {
    const metric: QueryPerformanceMetrics = {
      query: query.substring(0, 200), // Truncate for storage
      duration,
      timestamp: Date.now(),
      cacheHit,
      rowCount,
    };

    this.queryMetrics.push(metric);

    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn(`Slow query detected (${duration}ms):`, query.substring(0, 100));
    }

    // Log cache miss for cacheable queries
    if (!cacheHit && duration > 100) {
      logger.debug(`Cache miss for query (${duration}ms):`, query.substring(0, 100));
    }
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const recentMetrics = this.queryMetrics.slice(-100); // Last 100 queries
    
    const totalQueries = recentMetrics.length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length;
    const averageDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries;
    
    return {
      totalQueries,
      cacheHitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
      slowQueryCount: slowQueries,
      averageQueryDuration: averageDuration,
      slowQueryThreshold: this.slowQueryThreshold,
      recentMetrics: recentMetrics.slice(-10), // Last 10 for debugging
    };
  }

  // Generate performance report
  generatePerformanceReport() {
    const metrics = this.getPerformanceMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      performance: {
        score: this.calculatePerformanceScore(metrics),
        ...metrics,
      },
      recommendations: this.generateRecommendations(metrics),
    };

    logger.info('Database Performance Report:', report);
    return report;
  }

  private calculatePerformanceScore(metrics: any): number {
    let score = 100;
    
    // Penalize low cache hit rate
    if (metrics.cacheHitRate < 50) score -= 20;
    if (metrics.cacheHitRate < 25) score -= 20;
    
    // Penalize slow queries
    const slowQueryPercentage = (metrics.slowQueryCount / metrics.totalQueries) * 100;
    if (slowQueryPercentage > 10) score -= 30;
    if (slowQueryPercentage > 20) score -= 20;
    
    // Penalize high average duration
    if (metrics.averageQueryDuration > 500) score -= 15;
    if (metrics.averageQueryDuration > 1000) score -= 15;
    
    return Math.max(score, 0);
  }

  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.cacheHitRate < 50) {
      recommendations.push('Improve cache hit rate by implementing more granular caching strategies');
    }
    
    if (metrics.slowQueryCount > 0) {
      recommendations.push('Optimize slow queries by adding database indexes and reviewing query structure');
    }
    
    if (metrics.averageQueryDuration > 500) {
      recommendations.push('Consider implementing query optimization techniques and connection pooling');
    }
    
    return recommendations;
  }

  // Cleanup
  async cleanup() {
    try {
      if (this.redis && this.redis.isReady) {
        await this.redis.disconnect();
      }
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const dbPerformanceOptimizer = DatabasePerformanceOptimizer.getInstance();

export default DatabasePerformanceOptimizer;
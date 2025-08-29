import { Knex } from 'knex';
import db from '../config/database';
import cache, { CacheTTL } from '../config/redis';
import logger from '../utils/logger';

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fields?: string[];
  include?: string[];
  transaction?: Knex.Transaction;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export abstract class BaseRepository<T> {
  protected tableName: string;
  protected db: Knex;
  protected cachePrefix: string;
  protected cacheTTL: number = CacheTTL.MEDIUM;

  constructor(tableName: string, cachePrefix: string) {
    this.tableName = tableName;
    this.db = db;
    this.cachePrefix = cachePrefix;
  }

  protected getTable(trx?: Knex.Transaction) {
    return trx ? trx(this.tableName) : this.db(this.tableName);
  }

  protected getCacheKey(suffix: string): string {
    return `${this.cachePrefix}${suffix}`;
  }

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    try {
      // Try cache first
      const cacheKey = this.getCacheKey(id);
      const cached = await cache.get<T>(cacheKey);
      if (cached) return cached;

      // Query database
      const query = this.getTable(options?.transaction).where('id', id);
      
      if (options?.fields) {
        query.select(options.fields);
      }
      
      const result = await query.first();
      
      if (result) {
        // Cache the result
        await cache.set(cacheKey, result, this.cacheTTL);
      }
      
      return result || null;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      const query = this.getTable(options?.transaction);
      
      if (options?.fields) {
        query.select(options.fields);
      }
      
      if (options?.sortBy) {
        query.orderBy(options.sortBy, options.sortOrder || 'asc');
      }
      
      if (options?.limit) {
        query.limit(options.limit);
        
        if (options?.page && options.page > 1) {
          query.offset((options.page - 1) * options.limit);
        }
      }
      
      return await query;
    } catch (error) {
      logger.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  async findByCondition(
    condition: Partial<T>,
    options?: QueryOptions
  ): Promise<T[]> {
    try {
      const query = this.getTable(options?.transaction).where(condition);
      
      if (options?.fields) {
        query.select(options.fields);
      }
      
      if (options?.sortBy) {
        query.orderBy(options.sortBy, options.sortOrder || 'asc');
      }
      
      if (options?.limit) {
        query.limit(options.limit);
        
        if (options?.page && options.page > 1) {
          query.offset((options.page - 1) * options.limit);
        }
      }
      
      return await query;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by condition:`, error);
      throw error;
    }
  }

  async findOneByCondition(
    condition: Partial<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    try {
      const query = this.getTable(options?.transaction).where(condition);
      
      if (options?.fields) {
        query.select(options.fields);
      }
      
      return (await query.first()) || null;
    } catch (error) {
      logger.error(`Error finding one ${this.tableName} by condition:`, error);
      throw error;
    }
  }

  async paginate(options: QueryOptions): Promise<PaginatedResult<T>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;
      
      // Get total count
      const countQuery = this.getTable(options.transaction).count('* as total');
      const [{ total }] = await countQuery;
      
      // Get paginated data
      const query = this.getTable(options.transaction);
      
      if (options.fields) {
        query.select(options.fields);
      }
      
      if (options.sortBy) {
        query.orderBy(options.sortBy, options.sortOrder || 'asc');
      }
      
      const data = await query.limit(limit).offset(offset);
      
      const totalPages = Math.ceil(Number(total) / limit);
      
      return {
        data,
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      logger.error(`Error paginating ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data: Partial<T>, options?: QueryOptions): Promise<T> {
    try {
      const [result] = await this.getTable(options?.transaction)
        .insert(data)
        .returning('*');
      
      // Invalidate related cache
      await this.invalidateCache();
      
      return result;
    } catch (error) {
      logger.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async createMany(data: Partial<T>[], options?: QueryOptions): Promise<T[]> {
    try {
      const results = await this.getTable(options?.transaction)
        .insert(data)
        .returning('*');
      
      // Invalidate related cache
      await this.invalidateCache();
      
      return results;
    } catch (error) {
      logger.error(`Error creating many ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    try {
      const [result] = await this.getTable(options?.transaction)
        .where('id', id)
        .update(data)
        .returning('*');
      
      if (result) {
        // Invalidate cache for this item
        const cacheKey = this.getCacheKey(id);
        await cache.delete(cacheKey);
      }
      
      return result || null;
    } catch (error) {
      logger.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  async updateByCondition(
    condition: Partial<T>,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<number> {
    try {
      const count = await this.getTable(options?.transaction)
        .where(condition)
        .update(data);
      
      // Invalidate related cache
      await this.invalidateCache();
      
      return count;
    } catch (error) {
      logger.error(`Error updating ${this.tableName} by condition:`, error);
      throw error;
    }
  }

  async delete(id: string, options?: QueryOptions): Promise<boolean> {
    try {
      const count = await this.getTable(options?.transaction)
        .where('id', id)
        .delete();
      
      if (count > 0) {
        // Invalidate cache for this item
        const cacheKey = this.getCacheKey(id);
        await cache.delete(cacheKey);
      }
      
      return count > 0;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  async deleteByCondition(
    condition: Partial<T>,
    options?: QueryOptions
  ): Promise<number> {
    try {
      const count = await this.getTable(options?.transaction)
        .where(condition)
        .delete();
      
      // Invalidate related cache
      await this.invalidateCache();
      
      return count;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName} by condition:`, error);
      throw error;
    }
  }

  async exists(condition: Partial<T>): Promise<boolean> {
    try {
      const result = await this.getTable()
        .where(condition)
        .first();
      
      return !!result;
    } catch (error) {
      logger.error(`Error checking existence in ${this.tableName}:`, error);
      throw error;
    }
  }

  async count(condition?: Partial<T>): Promise<number> {
    try {
      const query = this.getTable().count('* as total');
      
      if (condition) {
        query.where(condition);
      }
      
      const [{ total }] = await query;
      return Number(total);
    } catch (error) {
      logger.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  protected async invalidateCache(): Promise<void> {
    try {
      await cache.deletePattern(`${this.cachePrefix}*`);
    } catch (error) {
      logger.warn(`Failed to invalidate cache for ${this.tableName}:`, error);
    }
  }
}
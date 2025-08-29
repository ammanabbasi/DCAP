import { BaseRepository, QueryOptions, PaginatedResult } from './BaseRepository';
import { CacheKeys } from '../config/redis';
import logger from '../utils/logger';

export interface Vehicle {
  id: string;
  dealership_id: string;
  vin: string;
  stock_number: string;
  status: 'available' | 'pending' | 'sold' | 'wholesale' | 'service' | 'transit';
  type: 'new' | 'used' | 'certified';
  year: number;
  make: string;
  model: string;
  trim?: string;
  body_style?: string;
  exterior_color?: string;
  interior_color?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuel_type?: string;
  cylinders?: number;
  engine_size?: number;
  doors?: number;
  passengers?: number;
  mileage?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  condition_score?: number;
  damage_notes?: any;
  cost?: number;
  list_price?: number;
  sale_price?: number;
  internet_price?: number;
  wholesale_price?: number;
  invoice_price?: number;
  msrp?: number;
  discount_amount?: number;
  discount_description?: string;
  location?: string;
  lot_number?: string;
  source?: 'trade_in' | 'auction' | 'wholesale' | 'consignment' | 'lease_return';
  purchase_date?: Date;
  purchased_from_id?: string;
  features?: any;
  packages?: any;
  description?: string;
  dealer_notes?: string;
  images?: any;
  main_image_url?: string;
  videos?: any;
  documents?: any;
  one_owner?: boolean;
  accident_free?: boolean;
  service_records?: boolean;
  carfax_url?: string;
  autocheck_url?: string;
  warranty_expires?: Date;
  certified?: boolean;
  certified_date?: Date;
  featured?: boolean;
  published?: boolean;
  published_at?: Date;
  marketing_comments?: any;
  views?: number;
  inquiries?: number;
  test_drives?: number;
  days_in_stock?: number;
  added_to_inventory?: Date;
  sold_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleSearchParams {
  dealership_id?: string;
  status?: Vehicle['status'] | Vehicle['status'][];
  type?: Vehicle['type'] | Vehicle['type'][];
  make?: string | string[];
  model?: string | string[];
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  mileage_max?: number;
  body_style?: string | string[];
  color?: string;
  featured?: boolean;
  published?: boolean;
  search?: string;
}

export class VehicleRepository extends BaseRepository<Vehicle> {
  constructor() {
    super('vehicles', CacheKeys.VEHICLE);
  }

  async findByVIN(vin: string): Promise<Vehicle | null> {
    try {
      const cacheKey = this.getCacheKey(`vin:${vin}`);
      const cached = await this.cache.get<Vehicle>(cacheKey);
      if (cached) return cached;

      const vehicle = await this.findOneByCondition({ vin });
      
      if (vehicle) {
        await this.cache.set(cacheKey, vehicle, this.cacheTTL);
      }
      
      return vehicle;
    } catch (error) {
      logger.error('Error finding vehicle by VIN:', error);
      throw error;
    }
  }

  async findByStockNumber(
    dealershipId: string,
    stockNumber: string
  ): Promise<Vehicle | null> {
    try {
      return await this.findOneByCondition({
        dealership_id: dealershipId,
        stock_number: stockNumber,
      });
    } catch (error) {
      logger.error('Error finding vehicle by stock number:', error);
      throw error;
    }
  }

  async searchVehicles(
    params: VehicleSearchParams,
    options?: QueryOptions
  ): Promise<PaginatedResult<Vehicle>> {
    try {
      const query = this.getTable(options?.transaction);

      // Apply filters
      if (params.dealership_id) {
        query.where('dealership_id', params.dealership_id);
      }

      if (params.status) {
        if (Array.isArray(params.status)) {
          query.whereIn('status', params.status);
        } else {
          query.where('status', params.status);
        }
      }

      if (params.type) {
        if (Array.isArray(params.type)) {
          query.whereIn('type', params.type);
        } else {
          query.where('type', params.type);
        }
      }

      if (params.make) {
        if (Array.isArray(params.make)) {
          query.whereIn('make', params.make);
        } else {
          query.where('make', params.make);
        }
      }

      if (params.model) {
        if (Array.isArray(params.model)) {
          query.whereIn('model', params.model);
        } else {
          query.where('model', params.model);
        }
      }

      if (params.year_min) {
        query.where('year', '>=', params.year_min);
      }

      if (params.year_max) {
        query.where('year', '<=', params.year_max);
      }

      if (params.price_min) {
        query.where('internet_price', '>=', params.price_min);
      }

      if (params.price_max) {
        query.where('internet_price', '<=', params.price_max);
      }

      if (params.mileage_max) {
        query.where('mileage', '<=', params.mileage_max);
      }

      if (params.body_style) {
        if (Array.isArray(params.body_style)) {
          query.whereIn('body_style', params.body_style);
        } else {
          query.where('body_style', params.body_style);
        }
      }

      if (params.color) {
        query.where(function() {
          this.where('exterior_color', 'like', `%${params.color}%`)
              .orWhere('interior_color', 'like', `%${params.color}%`);
        });
      }

      if (params.featured !== undefined) {
        query.where('featured', params.featured);
      }

      if (params.published !== undefined) {
        query.where('published', params.published);
      }

      if (params.search) {
        query.where(function() {
          this.where('vin', 'like', `%${params.search}%`)
              .orWhere('stock_number', 'like', `%${params.search}%`)
              .orWhere('make', 'like', `%${params.search}%`)
              .orWhere('model', 'like', `%${params.search}%`)
              .orWhere('description', 'like', `%${params.search}%`);
        });
      }

      // Get total count
      const countQuery = query.clone().count('* as total');
      const [{ total }] = await countQuery;

      // Apply pagination
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const offset = (page - 1) * limit;

      // Apply sorting
      if (options?.sortBy) {
        query.orderBy(options.sortBy, options.sortOrder || 'asc');
      } else {
        query.orderBy('created_at', 'desc');
      }

      // Get paginated data
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
      logger.error('Error searching vehicles:', error);
      throw error;
    }
  }

  async updateStatus(
    vehicleId: string,
    status: Vehicle['status']
  ): Promise<boolean> {
    try {
      const updates: Partial<Vehicle> = { status };
      
      if (status === 'sold') {
        updates.sold_date = new Date();
      }
      
      const result = await this.update(vehicleId, updates);
      return !!result;
    } catch (error) {
      logger.error('Error updating vehicle status:', error);
      throw error;
    }
  }

  async incrementViewCount(vehicleId: string): Promise<void> {
    try {
      await this.db.raw(
        'UPDATE vehicles SET views = views + 1 WHERE id = ?',
        [vehicleId]
      );
      
      // Invalidate cache for this vehicle
      const cacheKey = this.getCacheKey(vehicleId);
      await this.cache.delete(cacheKey);
    } catch (error) {
      logger.error('Error incrementing view count:', error);
      throw error;
    }
  }

  async getFeaturedVehicles(
    dealershipId: string,
    limit: number = 10
  ): Promise<Vehicle[]> {
    try {
      return await this.findByCondition(
        {
          dealership_id: dealershipId,
          featured: true,
          published: true,
          status: 'available',
        },
        { limit, sortBy: 'created_at', sortOrder: 'desc' }
      );
    } catch (error) {
      logger.error('Error getting featured vehicles:', error);
      throw error;
    }
  }

  async getInventoryStats(dealershipId: string): Promise<any> {
    try {
      const stats = await this.db('vehicles')
        .where('dealership_id', dealershipId)
        .select(
          this.db.raw('COUNT(*) as total'),
          this.db.raw("COUNT(CASE WHEN status = 'available' THEN 1 END) as available"),
          this.db.raw("COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending"),
          this.db.raw("COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold"),
          this.db.raw("COUNT(CASE WHEN type = 'new' THEN 1 END) as new_vehicles"),
          this.db.raw("COUNT(CASE WHEN type = 'used' THEN 1 END) as used_vehicles"),
          this.db.raw('AVG(days_in_stock) as avg_days_in_stock'),
          this.db.raw('SUM(list_price) as total_value')
        )
        .first();

      return stats;
    } catch (error) {
      logger.error('Error getting inventory stats:', error);
      throw error;
    }
  }

  private get cache() {
    return require('../config/redis').default;
  }
}
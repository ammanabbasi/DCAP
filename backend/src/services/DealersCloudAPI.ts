import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import cache, { CacheKeys, CacheTTL } from '../config/redis';
import logger from '../utils/logger';

export interface DealersCloudConfig {
  apiUrl: string;
  portalUrl: string;
  username: string;
  password: string;
  dealershipId?: string;
}

export interface VehicleData {
  vin: string;
  stockNumber: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  color?: string;
  status?: string;
  [key: string]: any;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

export interface LeadData {
  customerId?: string;
  vehicleId?: string;
  source: string;
  status: string;
  notes?: string;
  [key: string]: any;
}

export class DealersCloudAPI {
  private axiosInstance: AxiosInstance;
  private config: DealersCloudConfig;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config?: Partial<DealersCloudConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || 'https://dcgptrnapi.azurewebsites.net/api',
      portalUrl: config?.portalUrl || 'https://yahauto.autodealerscloud.com',
      username: config?.username || 'aitest',
      password: config?.password || '1234',
      dealershipId: config?.dealershipId,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        // Add dealership ID if available
        if (this.config.dealershipId) {
          config.headers['X-Dealership-Id'] = this.config.dealershipId;
        }

        // Log request
        logger.debug('DealersCloud API Request:', {
          method: config.method,
          url: config.url,
          params: config.params,
        });

        return config;
      },
      (error) => {
        logger.error('DealersCloud API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug('DealersCloud API Response:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          logger.info('DealersCloud token expired, attempting to refresh...');
          await this.authenticate();
          
          // Retry original request
          const originalRequest = error.config;
          originalRequest.headers['Authorization'] = `Bearer ${this.authToken}`;
          return this.axiosInstance(originalRequest);
        }

        logger.error('DealersCloud API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async authenticate(): Promise<boolean> {
    try {
      // Check if we have a valid cached token
      if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return true;
      }

      // Check cache for token
      const cachedToken = await cache.get<{ token: string; expiry: string }>(
        `${CacheKeys.API_RESPONSE}dealerscloud:auth`
      );

      if (cachedToken && new Date(cachedToken.expiry) > new Date()) {
        this.authToken = cachedToken.token;
        this.tokenExpiry = new Date(cachedToken.expiry);
        return true;
      }

      // Authenticate with DealersCloud
      const response = await this.axiosInstance.post('/auth/login', {
        username: this.config.username,
        password: this.config.password,
        portalUrl: this.config.portalUrl,
      });

      if (response.data.success && response.data.token) {
        this.authToken = response.data.token;
        this.tokenExpiry = new Date(Date.now() + (response.data.expiresIn || 3600) * 1000);

        // Cache the token
        await cache.set(
          `${CacheKeys.API_RESPONSE}dealerscloud:auth`,
          {
            token: this.authToken,
            expiry: this.tokenExpiry.toISOString(),
          },
          Math.floor((this.tokenExpiry.getTime() - Date.now()) / 1000)
        );

        logger.info('Successfully authenticated with DealersCloud API');
        return true;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      logger.error('Failed to authenticate with DealersCloud:', error);
      return false;
    }
  }

  // Vehicles
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    status?: string;
    make?: string;
    model?: string;
    year?: number;
  }): Promise<{ vehicles: VehicleData[]; total: number }> {
    try {
      await this.authenticate();

      const cacheKey = `${CacheKeys.API_RESPONSE}vehicles:${JSON.stringify(params)}`;
      const cached = await cache.get<{ vehicles: VehicleData[]; total: number }>(cacheKey);
      if (cached) return cached;

      const response = await this.axiosInstance.get('/vehicles', { params });
      
      const result = {
        vehicles: response.data.vehicles || [],
        total: response.data.total || 0,
      };

      await cache.set(cacheKey, result, CacheTTL.MEDIUM);
      
      return result;
    } catch (error) {
      logger.error('Failed to fetch vehicles from DealersCloud:', error);
      throw error;
    }
  }

  async getVehicleByVIN(vin: string): Promise<VehicleData | null> {
    try {
      await this.authenticate();

      const cacheKey = `${CacheKeys.API_RESPONSE}vehicle:vin:${vin}`;
      const cached = await cache.get<VehicleData>(cacheKey);
      if (cached) return cached;

      const response = await this.axiosInstance.get(`/vehicles/vin/${vin}`);
      
      if (response.data.success && response.data.vehicle) {
        await cache.set(cacheKey, response.data.vehicle, CacheTTL.LONG);
        return response.data.vehicle;
      }

      return null;
    } catch (error) {
      logger.error(`Failed to fetch vehicle by VIN ${vin}:`, error);
      return null;
    }
  }

  async createVehicle(vehicleData: VehicleData): Promise<VehicleData | null> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.post('/vehicles', vehicleData);
      
      if (response.data.success && response.data.vehicle) {
        // Invalidate cache
        await cache.deletePattern(`${CacheKeys.API_RESPONSE}vehicles:*`);
        return response.data.vehicle;
      }

      return null;
    } catch (error) {
      logger.error('Failed to create vehicle in DealersCloud:', error);
      throw error;
    }
  }

  async updateVehicle(id: string, updates: Partial<VehicleData>): Promise<boolean> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.put(`/vehicles/${id}`, updates);
      
      if (response.data.success) {
        // Invalidate cache
        await cache.deletePattern(`${CacheKeys.API_RESPONSE}vehicle:*`);
        await cache.deletePattern(`${CacheKeys.API_RESPONSE}vehicles:*`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Failed to update vehicle ${id}:`, error);
      return false;
    }
  }

  // Customers
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ customers: CustomerData[]; total: number }> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.get('/customers', { params });
      
      return {
        customers: response.data.customers || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      logger.error('Failed to fetch customers from DealersCloud:', error);
      throw error;
    }
  }

  async createCustomer(customerData: CustomerData): Promise<CustomerData | null> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.post('/customers', customerData);
      
      if (response.data.success && response.data.customer) {
        return response.data.customer;
      }

      return null;
    } catch (error) {
      logger.error('Failed to create customer in DealersCloud:', error);
      throw error;
    }
  }

  // Leads
  async getLeads(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assignedTo?: string;
  }): Promise<{ leads: LeadData[]; total: number }> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.get('/leads', { params });
      
      return {
        leads: response.data.leads || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      logger.error('Failed to fetch leads from DealersCloud:', error);
      throw error;
    }
  }

  async createLead(leadData: LeadData): Promise<LeadData | null> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.post('/leads', leadData);
      
      if (response.data.success && response.data.lead) {
        return response.data.lead;
      }

      return null;
    } catch (error) {
      logger.error('Failed to create lead in DealersCloud:', error);
      throw error;
    }
  }

  // Reports
  async getInventoryReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.get('/reports/inventory', { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch inventory report:', error);
      throw error;
    }
  }

  async getSalesReport(params?: {
    startDate?: string;
    endDate?: string;
    salespersonId?: string;
  }): Promise<any> {
    try {
      await this.authenticate();

      const response = await this.axiosInstance.get('/reports/sales', { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch sales report:', error);
      throw error;
    }
  }

  // VIN Decoder
  async decodeVIN(vin: string): Promise<any> {
    try {
      await this.authenticate();

      const cacheKey = `${CacheKeys.API_RESPONSE}vin-decode:${vin}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const response = await this.axiosInstance.get(`/vin/decode/${vin}`);
      
      if (response.data.success) {
        await cache.set(cacheKey, response.data.decoded, CacheTTL.VERY_LONG);
        return response.data.decoded;
      }

      return null;
    } catch (error) {
      logger.error(`Failed to decode VIN ${vin}:`, error);
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.data.status === 'OK';
    } catch (error) {
      logger.error('DealersCloud API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dealersCloudAPI = new DealersCloudAPI();
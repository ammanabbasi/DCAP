import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { MMKV } from 'react-native-mmkv';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';

// Storage instance for token management
const storage = new MMKV({ id: 'api-storage' });

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:5000/api' : 'https://api.dealerscloud.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Token management
export class TokenManager {
  private static TOKEN_KEY = 'auth_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static getToken(): string | null {
    return storage.getString(this.TOKEN_KEY) || null;
  }

  static setToken(token: string): void {
    storage.set(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return storage.getString(this.REFRESH_TOKEN_KEY) || null;
  }

  static setRefreshToken(token: string): void {
    storage.set(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    storage.delete(this.TOKEN_KEY);
    storage.delete(this.REFRESH_TOKEN_KEY);
  }
}

// Error types
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  originalError?: any;
}

// API Client class with interceptors and error handling
export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': Platform.OS,
        'X-Platform-Version': Platform.Version?.toString() || 'unknown',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (__DEV__) {
          console.log('API Request:', {
            url: `${config.baseURL}${config.url}`,
            method: config.method,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (__DEV__) {
          console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            originalRequest._retry = true;

            try {
              const refreshToken = TokenManager.getRefreshToken();
              if (refreshToken) {
                const response = await this.refreshAuthToken(refreshToken);
                const newToken = response.data.token;
                TokenManager.setToken(newToken);
                this.isRefreshing = false;
                this.onTokenRefreshed(newToken);
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              this.isRefreshing = false;
              TokenManager.clearTokens();
              // Navigate to login screen
              this.handleAuthError();
              return Promise.reject(this.handleError(refreshError));
            }
          }

          // Queue requests while refreshing
          return new Promise((resolve) => {
            this.subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(this.client(originalRequest));
            });
          });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshAuthToken(refreshToken: string): Promise<any> {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private handleError(error: any): ApiError {
    let apiError: ApiError = {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
      originalError: error,
    };

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      apiError.statusCode = status;

      if (status >= 400 && status < 500) {
        apiError.code = status === 401 ? ErrorCode.AUTH_ERROR : ErrorCode.CLIENT_ERROR;
        apiError.message = error.response.data?.message || `Client error: ${status}`;
      } else if (status >= 500) {
        apiError.code = ErrorCode.SERVER_ERROR;
        apiError.message = error.response.data?.message || `Server error: ${status}`;
      }
    } else if (error.request) {
      // Request made but no response
      if (error.code === 'ECONNABORTED') {
        apiError.code = ErrorCode.TIMEOUT_ERROR;
        apiError.message = 'Request timed out. Please check your connection.';
      } else {
        apiError.code = ErrorCode.NETWORK_ERROR;
        apiError.message = 'Network error. Please check your internet connection.';
      }
    }

    // Show error toast
    this.showErrorToast(apiError);

    return apiError;
  }

  private showErrorToast(error: ApiError): void {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error.message,
      position: 'top',
      visibilityTime: 4000,
    });
  }

  private handleAuthError(): void {
    // This should trigger navigation to login screen
    // Will be handled by navigation service
    Toast.show({
      type: 'error',
      text1: 'Session Expired',
      text2: 'Please login again',
      position: 'top',
      visibilityTime: 4000,
    });
  }

  // HTTP Methods with retry logic
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(() => this.client.get<T>(url, config));
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(() => this.client.post<T>(url, data, config));
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(() => this.client.put<T>(url, data, config));
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(() => this.client.patch<T>(url, data, config));
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(() => this.client.delete<T>(url, config));
  }

  // Upload method for multipart/form-data
  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }).then(response => response.data);
  }

  // Retry logic for failed requests
  private async retryRequest<T>(request: () => Promise<{ data: T }>): Promise<T> {
    let lastError: ApiError | null = null;
    
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await request();
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry auth errors
        if (error.code === ErrorCode.AUTH_ERROR) {
          throw error;
        }
        
        // Only retry on network or timeout errors
        if (
          attempt < API_CONFIG.RETRY_ATTEMPTS &&
          (error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.TIMEOUT_ERROR)
        ) {
          await this.delay(API_CONFIG.RETRY_DELAY * attempt);
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;
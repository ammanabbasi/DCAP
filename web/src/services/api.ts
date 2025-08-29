import axios, { AxiosResponse, AxiosError } from 'axios';
import { store } from '@/store/store';
import { logout, tokenRefreshed } from '@/store/slices/authSlice';
import { showSnackbar } from '@/store/slices/uiSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        store.dispatch(tokenRefreshed({ token, refreshToken: newRefreshToken }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        store.dispatch(showSnackbar({
          message: 'Session expired. Please login again.',
          severity: 'error',
        }));
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      store.dispatch(showSnackbar({
        message: error.response.data.message,
        severity: 'error',
      }));
    } else {
      store.dispatch(showSnackbar({
        message: 'An unexpected error occurred',
        severity: 'error',
      }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
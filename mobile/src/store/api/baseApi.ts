import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, TokenManager } from '../../services/api/client';
import type { RootState } from '../store';

// Define base query with auth headers
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  prepareHeaders: (headers, { getState }) => {
    const token = TokenManager.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Add retry logic to base query
const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

// Base API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'Auth',
    'User',
    'Vehicle',
    'CRM',
    'Lead',
    'Task',
    'Note',
    'Document',
    'Message',
    'Appointment',
    'Timeline',
    'Dashboard',
    'Inventory',
  ],
  endpoints: () => ({}),
});

export default baseApi;
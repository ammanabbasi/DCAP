// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  VEHICLES: '/vehicles',
  CRM: {
    LEADS: '/crm/leads',
  },
  MESSAGING: {
    CONVERSATIONS: '/messaging/conversations',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
} as const;

// App Constants
export const APP_CONFIG = {
  NAME: 'DealersCloud',
  VERSION: '1.0.0',
  DESCRIPTION: 'Complete automotive dealership management platform',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DRAWER_WIDTH: 240,
  TOOLBAR_HEIGHT: 64,
  PAGE_SIZES: [10, 25, 50, 100],
  DEBOUNCE_DELAY: 300,
} as const;

// Status Constants
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  PENDING: 'pending',
} as const;

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED: 'closed',
  LOST: 'lost',
} as const;

// Theme Constants
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  THEME_MODE: 'theme',
  SIDEBAR_STATE: 'sidebarOpen',
} as const;
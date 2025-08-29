import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { theme } from '../theme/theme';
import { store } from '../store/store';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Mock store creation
const createMockStore = (preloadedState: any = {}) =>
  configureStore({
    reducer: store.getState,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

// All the providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  store?: EnhancedStore;
  queryClient?: QueryClient;
}

const AllProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  store: mockStore = store,
  queryClient = createTestQueryClient()
}) => {
  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: EnhancedStore;
  queryClient?: QueryClient;
  route?: string;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    preloadedState,
    store: mockStore = createMockStore(preloadedState),
    queryClient = createTestQueryClient(),
    route = '/',
    ...renderOptions
  } = options;

  // Set initial route
  if (route !== '/') {
    window.history.pushState({}, 'Test page', route);
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders store={mockStore} queryClient={queryClient}>
      {children}
    </AllProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store: mockStore,
    queryClient,
  };
};

// Mock data generators
export const mockUser = {
  id: '1',
  email: 'test@dealerscloud.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin' as const,
  dealershipId: '1',
  isVerified: true,
  permissions: ['read', 'write', 'delete'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockVehicle = {
  id: '1',
  vin: 'JH4KA8260PC123456',
  make: 'Honda',
  model: 'Accord',
  year: 2022,
  price: 25000,
  mileage: 15000,
  condition: 'used' as const,
  status: 'available' as const,
  images: [
    'https://example.com/car1.jpg',
    'https://example.com/car2.jpg',
  ],
  dealershipId: '1',
  description: 'Well-maintained Honda Accord',
  features: ['AC', 'Power Windows', 'ABS'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockLead = {
  id: '1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@email.com',
  phone: '555-0123',
  source: 'website' as const,
  status: 'new' as const,
  assignedTo: mockUser.id,
  interestedVehicles: [mockVehicle.id],
  notes: 'Interested in Honda models',
  dealershipId: '1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockDashboardStats = {
  totalVehicles: 150,
  availableVehicles: 120,
  soldVehicles: 30,
  totalLeads: 45,
  newLeads: 12,
  qualifiedLeads: 20,
  convertedLeads: 8,
  totalSales: 850000,
  monthlySales: 125000,
  avgDealValue: 28333,
  conversionRate: 17.8,
};

// Mock API responses
export const mockApiResponses = {
  login: {
    success: true,
    data: {
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser,
    },
  },
  vehicles: {
    success: true,
    data: {
      vehicles: [mockVehicle],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    },
  },
  leads: {
    success: true,
    data: {
      leads: [mockLead],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    },
  },
  dashboard: {
    success: true,
    data: mockDashboardStats,
  },
};

// Test helpers
export const TestHelpers = {
  // Wait for async operations
  waitFor: (ms: number = 100): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Create mock Redux state
  createMockState: (overrides: any = {}) => ({
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      ...overrides.auth,
    },
    ui: {
      theme: 'light',
      sidebarOpen: true,
      loading: false,
      notifications: [],
      ...overrides.ui,
    },
    ...overrides,
  }),

  // Create authenticated state
  createAuthenticatedState: (user = mockUser) => ({
    auth: {
      user,
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    },
    ui: {
      theme: 'light',
      sidebarOpen: true,
      loading: false,
      notifications: [],
    },
  }),

  // Mock form data
  fillForm: async (user: any, formData: Record<string, string>) => {
    for (const [field, value] of Object.entries(formData)) {
      const element = document.querySelector(`[name="${field}"]`) as HTMLInputElement;
      if (element) {
        await user.clear(element);
        await user.type(element, value);
      }
    }
  },

  // Mock file upload
  createMockFile: (name = 'test.jpg', type = 'image/jpeg'): File => {
    return new File(['test content'], name, { type });
  },

  // Performance measurement
  measureRenderTime: async (renderFn: () => any, iterations = 10) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      renderFn();
      const end = performance.now();
      times.push(end - start);
    }

    return {
      average: times.reduce((a, b) => a + b) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      times,
    };
  },
};

// Accessibility helpers
export const AccessibilityHelpers = {
  expectToBeAccessible: async (element: HTMLElement) => {
    // Basic accessibility checks
    if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
      expect(element).toHaveAttribute('type');
    }
    
    if (element.tagName === 'IMG') {
      expect(element).toHaveAttribute('alt');
    }

    if (element.tagName === 'INPUT') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      
      expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  },

  expectProperHeadingStructure: (container: HTMLElement) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    });
  },
};

// MSW (Mock Service Worker) helpers
export const createMockHandlers = () => {
  // This would typically import from msw and create handlers
  // For now, we'll return an empty array as msw setup is complex
  return [];
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };
export { userEvent } from '@testing-library/user-event';
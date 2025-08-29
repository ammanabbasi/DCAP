import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { rootReducer, RootState } from '../../redux/rootReducer';

// Mock store configuration
const createMockStore = (preloadedState?: Partial<RootState>): EnhancedStore => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Mock navigation container
const MockNavigationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore;
  withNavigation?: boolean;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    preloadedState,
    store = createMockStore(preloadedState),
    withNavigation = false,
    ...renderOptions
  } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = (
      <Provider store={store}>
        {children}
      </Provider>
    );

    if (withNavigation) {
      return <MockNavigationContainer>{content}</MockNavigationContainer>;
    }

    return content;
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};

// Mock user data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer' as const,
  dealershipId: '1',
  isVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock vehicle data
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
    { id: '1', url: 'https://example.com/car1.jpg', isPrimary: true },
    { id: '2', url: 'https://example.com/car2.jpg', isPrimary: false },
  ],
  dealershipId: '1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock lead data
export const mockLead = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-1234',
  source: 'website' as const,
  status: 'new' as const,
  assignedToId: '1',
  dealershipId: '1',
  interestedVehicles: [mockVehicle.id],
  notes: 'Interested in Honda Accord',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock navigation object
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => 'test-screen'),
  getParent: jest.fn(),
  getState: jest.fn(),
};

// Mock route object
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen' as const,
  params: {},
  path: undefined,
};

// Mock API responses
export const mockApiResponses = {
  login: {
    success: true,
    data: {
      token: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
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
};

// Test helpers
export const TestHelpers = {
  // Wait for async operations
  waitFor: (ms: number = 100): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Trigger async state updates
  flushPromises: (): Promise<void> => {
    return new Promise(setImmediate);
  },

  // Mock press events
  mockPressEvent: {
    nativeEvent: { locationX: 0, locationY: 0 },
    persist: jest.fn(),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: {},
    timeStamp: Date.now(),
    type: 'press',
  },

  // Mock text input events
  mockTextInputEvent: (text: string) => ({
    nativeEvent: {
      text,
      target: {},
      eventCount: 1,
    },
    persist: jest.fn(),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    timeStamp: Date.now(),
    type: 'textInput',
  }),

  // Create mock Redux state
  createMockState: (overrides: Partial<RootState> = {}): RootState => ({
    user: {
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      ...overrides.user,
    },
    vehicles: {
      vehicles: [],
      currentVehicle: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      ...overrides.vehicles,
    },
    leads: {
      leads: [],
      currentLead: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      ...overrides.leads,
    },
    ui: {
      theme: 'light',
      loading: false,
      snackbar: {
        visible: false,
        message: '',
        type: 'info',
      },
      ...overrides.ui,
    },
    ...overrides,
  }),
};

// Performance testing utilities
export const PerformanceHelpers = {
  measureRenderTime: async (renderFn: () => any, iterations: number = 10) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await renderFn();
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

  expectRenderTime: (time: number, maxTime: number) => {
    expect(time).toBeLessThan(maxTime);
  },
};

// Accessibility testing helpers
export const AccessibilityHelpers = {
  expectAccessible: (element: any) => {
    expect(element).toBeAccessible();
  },

  expectHasAccessibilityLabel: (element: any, label: string) => {
    expect(element).toHaveProp('accessibilityLabel', label);
  },

  expectHasAccessibilityRole: (element: any, role: string) => {
    expect(element).toHaveProp('accessibilityRole', role);
  },
};

// Export all utilities
export * from '@testing-library/react-native';
export { customRender as render, createMockStore };
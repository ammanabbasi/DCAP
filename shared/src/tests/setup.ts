// Jest setup file for the shared package

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Global test utilities
export const createMockDate = (dateString: string): Date => {
  return new Date(dateString)
}

// Mock implementations for common utilities
export const mockUtilities = {
  delay: jest.fn().mockResolvedValue(undefined),
  retry: jest.fn(),
  debounce: jest.fn((fn: Function) => fn),
  throttle: jest.fn((fn: Function) => fn),
}

// Test data factories
export const createTestUser = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@dealerscloud.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'salesperson' as const,
  dealershipId: '123e4567-e89b-12d3-a456-426614174001',
  isActive: true,
  createdAt: createMockDate('2024-01-01T00:00:00Z'),
  updatedAt: createMockDate('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const createTestVehicle = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  vin: '1HGBH41JXMN109186',
  make: 'Honda',
  model: 'Civic',
  year: 2023,
  mileage: 15000,
  price: 25000,
  status: 'available' as const,
  condition: 'used' as const,
  fuelType: 'gasoline' as const,
  transmission: 'automatic' as const,
  bodyType: 'sedan' as const,
  images: [],
  documents: [],
  features: [],
  dealershipId: '123e4567-e89b-12d3-a456-426614174001',
  createdAt: createMockDate('2024-01-01T00:00:00Z'),
  updatedAt: createMockDate('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const createTestCustomer = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174003',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  phone: '+1234567890',
  status: 'active' as const,
  tags: [],
  notes: [],
  vehicles: [],
  dealershipId: '123e4567-e89b-12d3-a456-426614174001',
  createdAt: createMockDate('2024-01-01T00:00:00Z'),
  updatedAt: createMockDate('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const createTestAddress = (overrides = {}) => ({
  street: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zipCode: '12345',
  country: 'US',
  ...overrides,
})
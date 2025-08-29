# @dealerscloud/shared

Shared types, utilities, and constants for the DealersCloud platform.

## Overview

This package contains common code shared across all DealersCloud applications:
- **Backend API** (Express.js)
- **Web Dashboard** (React)
- **Mobile App** (React Native)

## Installation

```bash
npm install @dealerscloud/shared
```

## Usage

```typescript
import { 
  User, 
  Vehicle, 
  validateEmail, 
  formatCurrency,
  UserRole 
} from '@dealerscloud/shared'

// Use shared types
const user: User = {
  id: '123',
  email: 'user@example.com',
  role: UserRole.SALESPERSON,
  // ... other properties
}

// Use validation utilities
if (validateEmail('test@example.com')) {
  // Valid email
}

// Use formatting utilities
const price = formatCurrency(25000) // $25,000.00
```

## What's Included

### Types (`/types`)
- **User Types**: User, UserProfile, UserPreferences
- **Vehicle Types**: Vehicle, VehicleDocument
- **Customer Types**: Customer, CustomerNote, CustomerVehicle
- **Lead Types**: Lead, LeadActivity
- **Task Types**: Task
- **Dealership Types**: Dealership, DealershipSettings
- **API Types**: ApiResponse, ApiError, PaginationInfo
- **WebSocket Types**: WebSocketMessage

### Enums (`/enums`)
- UserRole, VehicleStatus, VehicleCondition
- LeadStatus, LeadPriority, TaskStatus
- DocumentType, ActivityType
- And many more...

### Constants (`/constants`)
- Application settings (timeouts, limits)
- File upload constraints
- Validation patterns (regex)
- Popular vehicle makes
- US states list
- Error and success messages

### Utilities (`/utils`)

#### Validation
- `validateEmail(email: string): boolean`
- `validatePhone(phone: string): boolean`
- `validateVIN(vin: string): boolean`
- `validateZipCode(zipCode: string): boolean`

#### String Manipulation
- `capitalizeFirst(str: string): string`
- `capitalizeWords(str: string): string`
- `slugify(text: string): string`
- `truncate(text: string, maxLength: number): string`

#### Number Formatting
- `formatCurrency(amount: number, currency?: string): string`
- `formatNumber(num: number, locale?: string): string`
- `clamp(value: number, min: number, max: number): number`

#### Date Utilities
- `formatDate(date: Date | string, locale?: string): string`
- `addDays(date: Date, days: number): Date`
- `getDaysBetween(startDate: Date, endDate: Date): number`

#### Array Utilities
- `unique<T>(array: T[]): T[]`
- `groupBy<T, K>(array: T[], keyFn: (item: T) => K): Record<K, T[]>`
- `chunk<T>(array: T[], size: number): T[][]`

#### Object Utilities
- `pick<T, K>(obj: T, keys: K[]): Pick<T, K>`
- `omit<T, K>(obj: T, keys: K[]): Omit<T, K>`
- `isEmpty(value: unknown): boolean`

#### Async Utilities
- `delay(ms: number): Promise<void>`
- `retry<T>(fn: () => Promise<T>, maxAttempts?: number): Promise<T>`
- `debounce<T>(fn: T, delay: number): T`
- `throttle<T>(fn: T, limit: number): T`

#### URL Utilities
- `isValidUrl(url: string): boolean`
- `buildQueryString(params: Record<string, any>): string`

#### File Utilities
- `getFileExtension(filename: string): string`
- `formatFileSize(bytes: number): string`

### Validation Schemas (`/schemas`)
Zod schemas for runtime validation:
- `UserCreateSchema`, `UserUpdateSchema`, `UserLoginSchema`
- `VehicleCreateSchema`, `VehicleUpdateSchema`, `VehicleSearchSchema`
- `CustomerCreateSchema`, `CustomerUpdateSchema`
- `LeadCreateSchema`, `LeadUpdateSchema`
- `TaskCreateSchema`, `TaskUpdateSchema`
- `PaginationSchema`
- `ApiResponseSchema<T>`

## Development

### Scripts

```bash
# Build the package
npm run build

# Watch for changes during development
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint the code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck
```

### Adding New Shared Code

1. **Types**: Add to `src/types/index.ts`
2. **Constants**: Add to `src/constants/index.ts`
3. **Utilities**: Add to `src/utils/index.ts`
4. **Enums**: Add to `src/enums/index.ts`
5. **Schemas**: Add to `src/schemas/index.ts`

Make sure to:
- Add proper TypeScript types
- Write unit tests
- Update this README
- Export from `src/index.ts`

### Testing

Tests are located alongside the source files with `.test.ts` extension.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Building

The package is built using TypeScript compiler:

```bash
npm run build
```

This creates:
- `dist/` - Compiled JavaScript
- `dist/index.d.ts` - Type definitions
- `dist/index.js.map` - Source maps

## Best Practices

1. **Types First**: Always define TypeScript types/interfaces
2. **Validation**: Use Zod schemas for runtime validation
3. **Testing**: Write tests for all utilities and validation functions
4. **Documentation**: Document complex functions with JSDoc
5. **Backwards Compatibility**: Don't break existing APIs without version bump

## Versioning

This package follows [Semantic Versioning](https://semver.org/):

- **PATCH**: Bug fixes, documentation updates
- **MINOR**: New features, non-breaking changes
- **MAJOR**: Breaking changes

## License

MIT
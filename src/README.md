# DealersCloud API Client

A minimal, production-ready TypeScript API client for the DealersCloud backend.

## Features

- 🔐 JWT Bearer authentication
- 🔄 Automatic retry on rate limiting (429)
- 📦 Zero dependencies (uses native fetch)
- 🎯 Full TypeScript support
- ⚡ Lightweight (< 300 LOC)
- 🛡️ Secure token handling
- 📤 Multipart file upload support
- ❌ Request cancellation via AbortSignal

## Requirements

- Node.js 18+ (native fetch and FormData support)
- TypeScript 5+

## Installation

```bash
# Copy the files to your project
cp src/apiClient.ts your-project/
cp src/types.d.ts your-project/
```

## Configuration

### Environment Variables

```bash
# Base URL for the API (optional)
API_BASE_URL=http://localhost:5000

# JWT authentication token (required)
AUTH_TOKEN=your-jwt-token-here
```

**Important**: Never hardcode tokens in your code. Always use environment variables.

## Usage

### Basic Setup

```typescript
import { DealersCloudClient } from './apiClient';

// Initialize with environment variables
const client = new DealersCloudClient({
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  token: process.env.AUTH_TOKEN  // Required - no fallback
});

// Or set token later
client.setToken('new-token');
```

### API Endpoints

#### Health Check
```typescript
const health = await client.health.get();
console.log(health.status); // 'OK'
```

#### Authentication
```typescript
// Get user profile
const profile = await client.auth.getProfile();
if (profile.success) {
  console.log(profile.data.user);
}

// Verify token
const verification = await client.auth.verifyToken();
if (verification.success && verification.data.valid) {
  console.log('Token is valid');
}
```

#### Vehicles
```typescript
// List vehicles with filters
const vehicles = await client.vehicles.list({
  page: 1,
  limit: 10,
  status: 'available',
  make: 'Toyota',
  model: 'Camry',
  year: 2024,
  priceMin: 20000,
  priceMax: 40000,
  search: 'hybrid'
});

// Get single vehicle
const vehicle = await client.vehicles.get('vehicle-id');

// Create vehicle
const newVehicle = await client.vehicles.create({
  vin: '1HGBH41JXMN109186',
  make: 'Honda',
  model: 'Civic',
  year: 2024,
  price: 25000,
  status: 'available'
});

// Update vehicle
const updated = await client.vehicles.update('vehicle-id', {
  price: 24000,
  status: 'sold'
});

// Delete vehicle
const deleted = await client.vehicles.delete('vehicle-id');
```

#### CRM
```typescript
// List leads
const leads = await client.crm.listLeads({
  page: 1,
  limit: 10,
  status: 'new',
  source: 'website',
  assignedTo: 'user-id'
});

// Create lead
const lead = await client.crm.createLead({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-0123',
  status: 'new',
  source: 'website'
});

// Get activities
const activities = await client.crm.activities();
```

#### Messaging
```typescript
// List conversations
const conversations = await client.messaging.listConversations();

// Get messages
const messages = await client.messaging.getMessages('conversation-id');

// Send message
const message = await client.messaging.sendMessage('conversation-id', {
  content: 'Hello!',
  type: 'text'  // 'text' | 'image' | 'document'
});
```

#### Documents
```typescript
// Upload file (Browser)
const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
const upload = await client.documents.upload(file, {
  category: 'contracts',
  vehicleId: 'vehicle-123',
  leadId: 'lead-456'
});

// Upload from Buffer (Node.js)
const buffer = Buffer.from('document content');
const upload = await client.documents.upload(buffer, {
  category: 'reports'
});

// List documents
const documents = await client.documents.list();
```

### Error Handling

The client throws typed `ApiError` objects with detailed information:

```typescript
try {
  const vehicle = await client.vehicles.get('invalid-id');
} catch (error) {
  if (error.status === 404) {
    console.log('Vehicle not found');
  } else if (error.status === 429) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else {
    console.log(`Error: ${error.message}`);
    console.log(`Details:`, error.details);
    console.log(`Request ID:`, error.requestId);
  }
}
```

### Request Cancellation

Use AbortSignal to cancel requests:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const vehicles = await client.vehicles.list(
    { page: 1 },
    { signal: controller.signal }
  );
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}
```

## TypeScript Types

All types are exported and available for use:

```typescript
import type {
  ApiError,
  Vehicle,
  VehicleCreate,
  VehicleUpdate,
  Lead,
  LeadCreate,
  Activity,
  Conversation,
  Message,
  DocumentMeta,
  Pagination
} from './types';
```

## Response Format

All API responses follow this structure:

```typescript
// Success response
{
  success: true,
  data: {
    // Response data
  }
}

// Error response (thrown as ApiError)
{
  status: 400,
  code: 'VALIDATION_ERROR',
  message: 'Invalid input',
  details: { /* error details */ },
  retryAfter: 60,  // For rate limiting
  requestId: 'req-123'
}
```

## Rate Limiting

The client automatically retries once on 429 (Too Many Requests) responses:
- Uses exponential backoff: 400ms * 2^attempt
- Respects Retry-After header (max 2 seconds)
- Throws ApiError with retryAfter value if still rate limited

## Security

- Never log or print JWT tokens
- Always use environment variables for sensitive data
- Token is only sent to authenticated endpoints
- No hardcoded fallback tokens

## Testing

Run the example:

```bash
# Set environment variable
export AUTH_TOKEN=your-jwt-token

# Run example
node exampleUsage.js
```

## Files

- `apiClient.ts` - Main API client implementation
- `types.d.ts` - TypeScript type definitions
- `exampleUsage.ts` - Usage examples
- `README.md` - This documentation

## License

MIT
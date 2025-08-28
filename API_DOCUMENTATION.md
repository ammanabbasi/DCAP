# DealerVait API Documentation

## 🌐 API Overview

**Base URL**: `https://dcgptrnapi.azurewebsites.net/api/`  
**Documentation**: `https://dcgptrnapi.azurewebsites.net/api-docs/`  
**Authentication**: Bearer JWT Token  
**Content-Type**: `application/json`

## 🔐 Authentication

### **Login**
```http
POST /api/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 4695541,
    "username": "aitest",
    "dealershipId": 11,
    "role": "admin"
  }
}
```

### **Token Refresh**  
```http
POST /api/refresh-token
Authorization: Bearer {refresh_token}

{
  "refreshToken": "refresh_token_here"
}
```

### **Logout**
```http
POST /api/logout
Authorization: Bearer {token}
```

## 📊 Dashboard Endpoints

### **Get Dashboard Data**
```http
GET /api/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "summary": {
    "totalRevenue": 125000.00,
    "totalSales": 15,
    "activeLeads": 23,
    "totalInventory": 150
  },
  "recentActivity": [...],
  "salesTrends": [...],
  "topPerformers": [...]
}
```

### **Get Dashboard Metrics**
```http
GET /api/dashboard/metrics?period=30days
Authorization: Bearer {token}
```

## 🚗 Vehicle Management

### **Get All Vehicles**
```http
GET /api/vehicles?page=1&limit=20&search=honda
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term
- `make`: Filter by make
- `model`: Filter by model
- `year`: Filter by year
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

### **Get Vehicle by ID**
```http
GET /api/vehicles/{id}
Authorization: Bearer {token}
```

### **Add New Vehicle**
```http
POST /api/vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "make": "Honda",
  "model": "Civic",
  "year": 2023,
  "price": 25000.00,
  "mileage": 15000,
  "color": "Blue",
  "vin": "1HGBH41JXMN109186",
  "description": "Excellent condition",
  "images": ["image1.jpg", "image2.jpg"]
}
```

### **Update Vehicle**
```http
PUT /api/vehicles/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 24000.00,
  "description": "Updated description"
}
```

### **Delete Vehicle**
```http
DELETE /api/vehicles/{id}
Authorization: Bearer {token}
```

### **Upload Vehicle Images**
```http
POST /api/vehicles/{id}/images
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [image files]
```

## 👥 CRM Endpoints

### **Get All Leads**
```http
GET /api/leads?page=1&limit=20&status=new
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: Lead status (new, contacted, qualified, converted)
- `source`: Lead source
- `dateFrom`: Start date filter
- `dateTo`: End date filter

### **Get Lead by ID**
```http
GET /api/leads/{id}
Authorization: Bearer {token}
```

### **Create New Lead**
```http
POST /api/leads
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "source": "website",
  "interestedVehicleId": 123,
  "notes": "Interested in financing options"
}
```

### **Update Lead**
```http
PUT /api/leads/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Called customer, interested in test drive"
}
```

### **Convert Lead to Sale**
```http
POST /api/leads/{id}/convert
Authorization: Bearer {token}
Content-Type: application/json

{
  "vehicleId": 123,
  "salePrice": 25000.00,
  "saleDate": "2024-01-15"
}
```

## 💬 Messaging System

### **Get Conversations**
```http
GET /api/conversations
Authorization: Bearer {token}
```

### **Get Conversation Messages**
```http
GET /api/conversations/{id}/messages?page=1&limit=50
Authorization: Bearer {token}
```

### **Send Message**
```http
POST /api/conversations/{id}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello, how can I help you?",
  "messageType": "text",
  "replyToMessageId": null
}
```

### **Create Conversation**
```http
POST /api/conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Customer Inquiry",
  "type": "customer",
  "participantIds": [1, 2],
  "entityType": "lead",
  "entityId": "123"
}
```

### **Upload Message Attachment**
```http
POST /api/conversations/{id}/attachments
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [file]
```

## 📄 Document Management

### **Get Documents**
```http
GET /api/documents?category=vehicle&entityId=123
Authorization: Bearer {token}
```

### **Upload Document**
```http
POST /api/documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [document files]
category: "vehicle"
entityId: 123
description: "Vehicle title document"
```

### **Download Document**
```http
GET /api/documents/{id}/download
Authorization: Bearer {token}
```

### **Delete Document**
```http
DELETE /api/documents/{id}
Authorization: Bearer {token}
```

## 📊 Analytics & Reporting

### **Get Dashboard Analytics**
```http
GET /api/analytics/dashboard?startDate=1640995200000&endDate=1672531200000
Authorization: Bearer {token}
```

### **Get Sales Trends**
```http
GET /api/analytics/sales/trends?period=monthly&startDate=1640995200000&endDate=1672531200000
Authorization: Bearer {token}
```

### **Get Inventory Analytics**
```http
GET /api/analytics/inventory?startDate=1640995200000&endDate=1672531200000
Authorization: Bearer {token}
```

### **Get Performance Metrics**
```http
GET /api/analytics/performance?startDate=1640995200000&endDate=1672531200000
Authorization: Bearer {token}
```

### **Export Report**
```http
POST /api/analytics/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportType": "sales",
  "format": "PDF",
  "dateRange": {
    "startDate": 1640995200000,
    "endDate": 1672531200000
  },
  "filters": {
    "vehicleMake": "Honda"
  }
}
```

## 🔔 Notification Endpoints

### **Get Notifications**
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer {token}
```

### **Mark Notification as Read**
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

### **Update FCM Token**
```http
POST /api/notifications/fcm-token
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "fcm_token_here",
  "deviceId": "device_unique_id"
}
```

## 👤 User Profile

### **Get User Profile**
```http
GET /api/profile
Authorization: Bearer {token}
```

### **Update Profile**
```http
PUT /api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "displayName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

## 🛠️ Utility Endpoints

### **Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 12345
}
```

### **Get Dropdown Options**
```http
GET /api/dropdown/{type}
Authorization: Bearer {token}
```

Types: `makes`, `models`, `years`, `colors`, `leadSources`, `leadStatuses`

### **Search Vehicles**
```http
POST /api/search/vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "honda civic 2020",
  "filters": {
    "priceRange": [20000, 30000],
    "year": 2020
  }
}
```

## 🔄 WebSocket Events

**Connection URL**: `wss://dcgptrnapi.azurewebsites.net/socket`

### **Authentication**
```javascript
{
  "type": "auth",
  "token": "jwt_token_here"
}
```

### **Join Conversation**
```javascript
{
  "type": "join_conversation",
  "conversationId": "conv_123"
}
```

### **Send Message**
```javascript
{
  "type": "message",
  "conversationId": "conv_123",
  "content": "Hello!",
  "messageType": "text"
}
```

### **Typing Indicator**
```javascript
{
  "type": "typing",
  "conversationId": "conv_123",
  "isTyping": true
}
```

## 📝 Response Format

### **Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### **Pagination Response**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | Token is invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request data validation failed |
| `NOT_FOUND` | Requested resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## 📋 Request Headers

### **Required Headers**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### **Optional Headers**
```
X-Device-ID: unique_device_identifier
X-App-Version: 1.0.0
X-Platform: Android
```

## 🔒 Authentication Details

### **Development Token**
For testing purposes, use this token:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ2OTU1NDEsInVzZXJuYW1lIjoiYWl0ZXN0IiwiRGVhbGVyc2hpcElEIjoxMSwiaWF0IjoxNzUwOTQ0NDUxLCJleHAiOjQ5MDY3MDQ0NTF9.AiINkVc8CNZEUHN_jMmYiWbcbZpuRi4_UthGviRB-ys
```

### **Token Payload**
```json
{
  "userId": 4695541,
  "username": "aitest",
  "dealershipId": 11,
  "iat": 1750944451,
  "exp": 4906704451
}
```

## 📊 Rate Limiting

- **Authentication**: 5 requests/minute
- **General API**: 100 requests/minute  
- **File Upload**: 10 uploads/minute
- **Search**: 30 requests/minute

## 🌐 CORS Policy

The API supports CORS for web applications with the following allowed origins:
- `https://dealervait.com`
- `https://app.dealervait.com`
- `http://localhost:*` (development)

---

**📱 This API documentation covers all endpoints used by the DealerVait Android application. For the most up-to-date API documentation, visit: https://dcgptrnapi.azurewebsites.net/api-docs/**
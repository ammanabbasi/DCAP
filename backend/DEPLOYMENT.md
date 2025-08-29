# DealersCloud Backend Deployment Guide

## Environment Variables

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Azure SQL)
DB_SERVER=your-azure-sql-server.database.windows.net
DB_NAME=dealerscloud
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_PORT=1433
DB_ENCRYPT=true

# JWT Authentication
JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Redis Cache
REDIS_URL=redis://your-redis-server:6379
REDIS_PASSWORD=your-redis-password

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=yourkey;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=dealerscloud-files

# SendGrid Email
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@dealerscloud.com
SENDGRID_FROM_NAME=DealersCloud

# Security
SESSION_SECRET=your-session-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars
ENCRYPTION_IV=your-encryption-iv-16-chars

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Keys (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# CarFax Integration (Optional)
CARFAX_API_KEY=your-carfax-api-key
CARFAX_API_URL=https://api.carfax.com/v1

# VIN Decoder (Optional)
VIN_DECODER_API_KEY=your-vin-decoder-key
```

## Deployment Steps

### 1. Prerequisites
- Node.js 18+ and npm 9+
- Azure SQL Database
- Redis instance
- Azure Blob Storage account
- SendGrid account

### 2. Build the Application

```bash
# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Run database migrations
npm run migrate
```

### 3. Start Commands

#### Development
```bash
npm run dev
```

#### Production
```bash
# Standard server
npm start

# Secure server with enhanced security
npm run start:secure
```

### 4. Database Migrations

```bash
# Run pending migrations
npm run migrate

# Rollback last migration
npx knex migrate:rollback

# Create new migration
npx knex migrate:make migration_name
```

### 5. Health Check

The server exposes a health endpoint at `/health` that verifies:
- Server status
- Database connectivity
- Redis connectivity
- Azure Blob Storage access

### 6. Deployment Checklist

- [ ] Set all required environment variables
- [ ] Configure Azure SQL firewall rules
- [ ] Set up Redis with proper authentication
- [ ] Configure Azure Blob Storage CORS
- [ ] Set up SendGrid domain authentication
- [ ] Enable SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all integrations

### 7. Production Scripts

Add these to package.json for production:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "start:secure": "node dist/server.secured.js",
    "build": "tsc",
    "migrate": "knex migrate:latest",
    "rollback": "knex migrate:rollback"
  }
}
```

### 8. Process Management

For production, use PM2:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name dealerscloud-api

# Auto-restart on failure
pm2 startup
pm2 save
```

### 9. Monitoring

- Use Azure Application Insights for monitoring
- Configure Winston logs to Azure Blob Storage
- Set up alerts for critical errors
- Monitor response times and error rates

### 10. Security Notes

- Never commit .env files
- Rotate JWT secrets regularly
- Use Azure Key Vault for secrets in production
- Enable audit logging for all sensitive operations
- Implement IP whitelisting for admin endpoints
- Regular security updates for dependencies
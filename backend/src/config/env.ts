import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Environment variable schema with strict validation
 * CRITICAL: No fallback values for security-sensitive configurations
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  
  // Security - REQUIRED, NO FALLBACKS
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // Security - Optional but recommended
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/).transform(Number).default('12'),
  
  // Database - REQUIRED for production
  DATABASE_URL: z.string().url().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_NAME: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  
  // Redis Cache (optional)
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Email Service (required for production)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  
  // AWS S3 (for file uploads)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Client URLs
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  MOBILE_APP_URL: z.string().url().optional(),
  
  // API Keys (optional)
  CARFAX_API_KEY: z.string().optional(),
  AUTOCHECK_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Security Headers
  CORS_ALLOWED_ORIGINS: z.string().optional(), // comma-separated
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  
  // Session Configuration
  SESSION_SECRET: z.string().min(32).optional(),
  SESSION_TIMEOUT_HOURS: z.string().regex(/^\d+$/).transform(Number).default('24'),
  MAX_LOGIN_ATTEMPTS: z.string().regex(/^\d+$/).transform(Number).default('5'),
  LOCKOUT_DURATION_MINUTES: z.string().regex(/^\d+$/).transform(Number).default('30'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
});

/**
 * Parse and validate environment variables
 * Throws an error if required variables are missing or invalid
 */
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      console.error('\n🚨 CRITICAL SECURITY ERROR: Required environment variables are missing or invalid!\n');
      console.error('The following environment variables have issues:\n');
      console.error(missingVars);
      console.error('\n⚠️  SECURITY NOTICE: This application requires proper security configuration.');
      console.error('Please set all required environment variables before starting the application.');
      console.error('Refer to .env.example for the complete list of required variables.\n');
      
      // FAIL FAST - Exit immediately for security
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Validated environment configuration
 * This object contains all validated environment variables
 */
export const env = parseEnv();

/**
 * Security configuration derived from environment
 */
export const securityConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },
  session: {
    secret: env.SESSION_SECRET,
    timeoutHours: env.SESSION_TIMEOUT_HOURS,
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    lockoutDurationMinutes: env.LOCKOUT_DURATION_MINUTES,
  },
  cors: {
    origins: env.CORS_ALLOWED_ORIGINS?.split(',').map((origin: string) => origin.trim()) || [env.CLIENT_URL],
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
};

/**
 * Database configuration
 */
export const databaseConfig = {
  url: env.DATABASE_URL,
  host: env.DATABASE_HOST || 'localhost',
  port: env.DATABASE_PORT || 1433,
  name: env.DATABASE_NAME || 'dealerscloud',
  user: env.DATABASE_USER || '',
  password: env.DATABASE_PASSWORD || '',
};

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isStaging = env.NODE_ENV === 'staging';

/**
 * Additional production validations
 */
if (isProduction) {
  // Ensure database is configured in production
  if (!env.DATABASE_URL && (!env.DATABASE_HOST || !env.DATABASE_NAME)) {
    console.error('\n🚨 PRODUCTION ERROR: Database configuration is required in production!');
    console.error('Please set DATABASE_URL or DATABASE_HOST/DATABASE_NAME/DATABASE_USER/DATABASE_PASSWORD\n');
    process.exit(1);
  }
  
  // Ensure email service is configured in production
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.warn('\n⚠️  WARNING: Email service is not configured. Password reset and notifications will not work.');
  }
  
  // Ensure session secret is set in production
  if (!env.SESSION_SECRET) {
    console.error('\n🚨 PRODUCTION ERROR: SESSION_SECRET is required in production!');
    process.exit(1);
  }
  
  // Ensure proper CORS configuration in production
  if (env.CLIENT_URL === 'http://localhost:3000') {
    console.warn('\n⚠️  WARNING: Using localhost CLIENT_URL in production. Please update CLIENT_URL.');
  }
}

// Log successful configuration (without exposing secrets)
console.log('✅ Environment configuration validated successfully');
console.log(`📍 Environment: ${env.NODE_ENV}`);
console.log(`🔒 Security configuration: Loaded`);
console.log(`🌐 Server will run on port: ${env.PORT}`);

// Export unified config object
export const config = {
  isDevelopment,
  isProduction,
  isStaging,
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  clientUrl: env.CLIENT_URL,
  database: databaseConfig,
  security: securityConfig,
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM_EMAIL,
    fromName: env.SMTP_FROM_NAME,
  },
  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST || 'localhost',
    port: env.REDIS_PORT || 6379,
    password: env.REDIS_PASSWORD,
  },
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: env.AWS_S3_BUCKET,
  },
  logging: {
    level: env.LOG_LEVEL,
    filePath: env.LOG_FILE_PATH,
  },
};

export default env;
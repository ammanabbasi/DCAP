import knex, { Knex } from 'knex';
import { config } from './env';
import logger from '../utils/logger';

// Database configuration
const dbConfig: Knex.Config = {
  client: 'mssql',
  connection: {
    server: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    options: {
      encrypt: true, // Use encryption for Azure SQL
      trustServerCertificate: false, // For production
      enableArithAbort: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  } as any,
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'ts',
  },
  log: {
    warn(message: string) {
      logger.warn('Database warning:', message);
    },
    error(message: string) {
      logger.error('Database error:', message);
    },
    deprecate(message: string) {
      logger.warn('Database deprecation:', message);
    },
    debug(message: string) {
      if (config.isDevelopment) {
        logger.debug('Database debug:', message);
      }
    },
  },
};

// Create Knex instance
const db = knex(dbConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Transaction helper
export const transaction = async <T>(
  callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> => {
  return db.transaction(callback);
};

// Health check
export const healthCheck = async (): Promise<{
  connected: boolean;
  latency: number;
  details?: any;
}> => {
  const start = Date.now();
  try {
    const result = await db.raw('SELECT 1 as health');
    return {
      connected: true,
      latency: Date.now() - start,
      details: result,
    };
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - start,
      details: error,
    };
  }
};

export default db;
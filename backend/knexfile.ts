import type { Knex } from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mssql',
    connection: {
      server: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '1433'),
      database: process.env.DATABASE_NAME || 'dealerscloud_dev',
      user: process.env.DATABASE_USER || 'sa',
      password: process.env.DATABASE_PASSWORD || '',
      options: {
        encrypt: true,
        trustServerCertificate: true, // For development only
        enableArithAbort: true,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },

  staging: {
    client: 'mssql',
    connection: {
      server: process.env.DATABASE_HOST!,
      port: parseInt(process.env.DATABASE_PORT || '1433'),
      database: process.env.DATABASE_NAME!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'mssql',
    connection: {
      server: process.env.DATABASE_HOST!,
      port: parseInt(process.env.DATABASE_PORT || '1433'),
      database: process.env.DATABASE_NAME!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
    },
    pool: {
      min: 2,
      max: 20,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
};

module.exports = config;
export default config;
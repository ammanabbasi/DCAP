import { Knex } from 'knex';
import knex from 'knex';
import { createClient } from 'redis';

export default async function globalSetup() {
  console.log('Setting up test environment...');
  
  // Setup test database
  const testDb: Knex = knex({
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/database/migrations'
    }
  });

  try {
    // Run migrations for test database
    await testDb.migrate.latest();
    console.log('Test database migrations completed');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }

  // Store database instance globally for tests
  (global as any).__TEST_DB__ = testDb;

  // Setup Redis connection for tests (if needed)
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    await redisClient.connect();
    await redisClient.flushAll(); // Clear all Redis data before tests
    (global as any).__TEST_REDIS__ = redisClient;
    console.log('Test Redis setup completed');
  } catch (error) {
    console.warn('Redis not available for tests, using mocks');
  }
}
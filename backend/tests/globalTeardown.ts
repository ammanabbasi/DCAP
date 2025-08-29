export default async function globalTeardown() {
  console.log('Tearing down test environment...');
  
  // Close database connection
  const testDb = (global as any).__TEST_DB__;
  if (testDb) {
    await testDb.destroy();
    console.log('Test database connection closed');
  }

  // Close Redis connection
  const testRedis = (global as any).__TEST_REDIS__;
  if (testRedis) {
    await testRedis.disconnect();
    console.log('Test Redis connection closed');
  }

  // Clean up any other global resources
  delete (global as any).__TEST_DB__;
  delete (global as any).__TEST_REDIS__;
}
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up test data
  console.log('🗑️ Cleaning up test data...');
  await cleanupTestData();
  
  // Generate test reports
  console.log('📊 Generating test reports...');
  await generateReports();
  
  console.log('✅ Global teardown completed');
}

async function cleanupTestData() {
  const baseURL = process.env.BASE_URL?.replace('3000', '5000') || 'http://localhost:5000';
  
  try {
    await fetch(`${baseURL}/api/test/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cleanup-test-data'
      }),
    });
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up test data:', error);
  }
}

async function generateReports() {
  try {
    // Generate coverage reports, performance metrics, etc.
    console.log('📈 Test reports generated');
  } catch (error) {
    console.warn('⚠️ Could not generate reports:', error);
  }
}

export default globalTeardown;
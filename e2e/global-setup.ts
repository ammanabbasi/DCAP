import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  const { baseURL } = config.projects[0].use;
  
  // Wait for backend to be ready
  console.log('⏳ Waiting for backend to be ready...');
  await waitForBackend(`${baseURL?.replace('3000', '5000')}/api/health`);
  
  // Wait for frontend to be ready
  console.log('⏳ Waiting for frontend to be ready...');
  await waitForFrontend(baseURL || 'http://localhost:3000');
  
  // Create test data
  console.log('📝 Creating test data...');
  await createTestData();
  
  console.log('✅ Global setup completed');
}

async function waitForBackend(url: string, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Backend is ready');
        return;
      }
    } catch (error) {
      // Backend not ready yet
    }
    
    console.log(`⏳ Waiting for backend... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Backend did not start in time');
}

async function waitForFrontend(url: string, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Frontend is ready');
        return;
      }
    } catch (error) {
      // Frontend not ready yet
    }
    
    console.log(`⏳ Waiting for frontend... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Frontend did not start in time');
}

async function createTestData() {
  // Create test users, vehicles, leads, etc.
  // This would typically involve API calls to seed the test database
  
  const baseURL = process.env.BASE_URL?.replace('3000', '5000') || 'http://localhost:5000';
  
  try {
    // Create test dealership
    await fetch(`${baseURL}/api/test/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-test-data',
        entities: ['dealership', 'users', 'vehicles', 'leads']
      }),
    });
    
    console.log('✅ Test data created');
  } catch (error) {
    console.warn('⚠️ Could not create test data:', error);
    // Continue with tests even if test data creation fails
  }
}

export default globalSetup;
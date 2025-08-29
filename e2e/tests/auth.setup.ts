import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');
const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as regular user', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid=email-input]', 'test.user@dealerscloud.com');
  await page.fill('[data-testid=password-input]', 'TestPassword123!');
  
  // Click login button
  await page.click('[data-testid=login-button]');
  
  // Wait for successful login - should redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Verify user is logged in
  await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});

setup('authenticate as admin user', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form with admin credentials
  await page.fill('[data-testid=email-input]', 'admin@dealerscloud.com');
  await page.fill('[data-testid=password-input]', 'AdminPassword123!');
  
  // Click login button
  await page.click('[data-testid=login-button]');
  
  // Wait for successful login
  await page.waitForURL('/dashboard');
  
  // Verify admin is logged in
  await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
  await expect(page.locator('[data-testid=admin-panel]')).toBeVisible();
  
  // Save admin authentication state
  await page.context().storageState({ path: adminAuthFile });
});

setup('create test dealership if not exists', async ({ page }) => {
  // This setup creates a test dealership for E2E tests
  const baseURL = process.env.BASE_URL?.replace('3000', '5000') || 'http://localhost:5000';
  
  try {
    const response = await page.request.post(`${baseURL}/api/test/dealership`, {
      data: {
        name: 'Test Dealership',
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '90210',
        phone: '555-0123',
        email: 'test@dealership.com',
      }
    });
    
    if (response.ok()) {
      console.log('✅ Test dealership created');
    }
  } catch (error) {
    console.warn('⚠️ Could not create test dealership:', error);
  }
});
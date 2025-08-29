import { test, expect } from '@playwright/test';

test.describe('Critical User Flows @critical @web', () => {
  test.describe('Authentication Flow', () => {
    test('should login successfully with valid credentials @smoke', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Verify login page loads
      await expect(page.locator('h1')).toContainText('Welcome to DealersCloud');
      
      // Fill login form
      await page.fill('[data-testid=email-input]', 'test.user@dealerscloud.com');
      await page.fill('[data-testid=password-input]', 'TestPassword123!');
      
      // Submit form
      await page.click('[data-testid=login-button]');
      
      // Verify successful login
      await page.waitForURL('/dashboard');
      await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
      
      // Verify user name is displayed
      await expect(page.locator('[data-testid=user-name]')).toContainText('Test User');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Try invalid credentials
      await page.fill('[data-testid=email-input]', 'invalid@dealerscloud.com');
      await page.fill('[data-testid=password-input]', 'WrongPassword');
      await page.click('[data-testid=login-button]');
      
      // Verify error message
      await expect(page.locator('[role=alert]')).toBeVisible();
      await expect(page.locator('[role=alert]')).toContainText('Invalid email or password');
      
      // Verify still on login page
      await expect(page.url()).toContain('/login');
    });

    test('should logout successfully', async ({ page }) => {
      // Start from dashboard (user is already authenticated)
      await page.goto('/dashboard');
      
      // Click user menu
      await page.click('[data-testid=user-menu]');
      
      // Click logout
      await page.click('[data-testid=logout-button]');
      
      // Verify redirected to login
      await page.waitForURL('/login');
      await expect(page.locator('h1')).toContainText('Welcome to DealersCloud');
    });
  });

  test.describe('Vehicle Management Flow', () => {
    test('should create a new vehicle successfully', async ({ page }) => {
      // Navigate to vehicles page
      await page.goto('/vehicles');
      
      // Click add vehicle button
      await page.click('[data-testid=add-vehicle-button]');
      
      // Verify modal opens
      await expect(page.locator('[data-testid=vehicle-form-modal]')).toBeVisible();
      
      // Fill vehicle form
      await page.fill('[data-testid=vin-input]', 'JH4KA8260PC123456');
      await page.selectOption('[data-testid=make-select]', 'Honda');
      await page.fill('[data-testid=model-input]', 'Accord');
      await page.fill('[data-testid=year-input]', '2022');
      await page.fill('[data-testid=price-input]', '25000');
      await page.fill('[data-testid=mileage-input]', '15000');
      await page.selectOption('[data-testid=condition-select]', 'used');
      
      // Submit form
      await page.click('[data-testid=save-vehicle-button]');
      
      // Verify success message
      await expect(page.locator('[data-testid=success-message]')).toBeVisible();
      await expect(page.locator('[data-testid=success-message]')).toContainText('Vehicle added successfully');
      
      // Verify vehicle appears in list
      await expect(page.locator('[data-testid=vehicle-list]')).toContainText('JH4KA8260PC123456');
      await expect(page.locator('[data-testid=vehicle-list]')).toContainText('Honda Accord');
    });

    test('should edit vehicle details', async ({ page }) => {
      await page.goto('/vehicles');
      
      // Find and click edit button for first vehicle
      await page.click('[data-testid=vehicle-item]:first-child [data-testid=edit-vehicle-button]');
      
      // Verify edit modal opens
      await expect(page.locator('[data-testid=vehicle-form-modal]')).toBeVisible();
      
      // Update price
      await page.fill('[data-testid=price-input]', '26000');
      
      // Update mileage
      await page.fill('[data-testid=mileage-input]', '16000');
      
      // Save changes
      await page.click('[data-testid=save-vehicle-button]');
      
      // Verify success
      await expect(page.locator('[data-testid=success-message]')).toBeVisible();
      
      // Verify updated values are displayed
      const vehicleItem = page.locator('[data-testid=vehicle-item]:first-child');
      await expect(vehicleItem).toContainText('$26,000');
      await expect(vehicleItem).toContainText('16,000 miles');
    });

    test('should delete a vehicle', async ({ page }) => {
      await page.goto('/vehicles');
      
      // Get initial vehicle count
      const initialCount = await page.locator('[data-testid=vehicle-item]').count();
      
      // Click delete button for first vehicle
      await page.click('[data-testid=vehicle-item]:first-child [data-testid=delete-vehicle-button]');
      
      // Confirm deletion
      await expect(page.locator('[data-testid=confirm-delete-dialog]')).toBeVisible();
      await page.click('[data-testid=confirm-delete-button]');
      
      // Verify success message
      await expect(page.locator('[data-testid=success-message]')).toBeVisible();
      
      // Verify vehicle count decreased
      await expect(page.locator('[data-testid=vehicle-item]')).toHaveCount(initialCount - 1);
    });

    test('should search and filter vehicles', async ({ page }) => {
      await page.goto('/vehicles');
      
      // Search by make
      await page.fill('[data-testid=search-input]', 'Honda');
      await page.press('[data-testid=search-input]', 'Enter');
      
      // Verify filtered results
      const searchResults = page.locator('[data-testid=vehicle-item]');
      await expect(searchResults.first()).toContainText('Honda');
      
      // Clear search
      await page.fill('[data-testid=search-input]', '');
      await page.press('[data-testid=search-input]', 'Enter');
      
      // Apply filters
      await page.click('[data-testid=filter-button]');
      await page.selectOption('[data-testid=condition-filter]', 'used');
      await page.fill('[data-testid=min-price-filter]', '20000');
      await page.fill('[data-testid=max-price-filter]', '30000');
      await page.click('[data-testid=apply-filters-button]');
      
      // Verify filtered results
      const filteredResults = page.locator('[data-testid=vehicle-item]');
      const count = await filteredResults.count();
      expect(count).toBeGreaterThan(0);
      
      // Verify all results match filter criteria
      for (let i = 0; i < count; i++) {
        const item = filteredResults.nth(i);
        await expect(item).toContainText('Used');
        // Price should be between $20,000 and $30,000
        const priceText = await item.locator('[data-testid=vehicle-price]').textContent();
        const price = parseInt(priceText?.replace(/[$,]/g, '') || '0');
        expect(price).toBeGreaterThanOrEqual(20000);
        expect(price).toBeLessThanOrEqual(30000);
      }
    });
  });

  test.describe('Lead Management Flow', () => {
    test('should create a new lead successfully', async ({ page }) => {
      await page.goto('/leads');
      
      // Click add lead button
      await page.click('[data-testid=add-lead-button]');
      
      // Fill lead form
      await page.fill('[data-testid=first-name-input]', 'John');
      await page.fill('[data-testid=last-name-input]', 'Doe');
      await page.fill('[data-testid=email-input]', 'john.doe@email.com');
      await page.fill('[data-testid=phone-input]', '555-1234');
      await page.selectOption('[data-testid=source-select]', 'website');
      await page.fill('[data-testid=notes-input]', 'Interested in Honda Accord');
      
      // Submit form
      await page.click('[data-testid=save-lead-button]');
      
      // Verify success
      await expect(page.locator('[data-testid=success-message]')).toBeVisible();
      
      // Verify lead appears in list
      await expect(page.locator('[data-testid=lead-list]')).toContainText('John Doe');
      await expect(page.locator('[data-testid=lead-list]')).toContainText('john.doe@email.com');
    });

    test('should convert lead through sales funnel', async ({ page }) => {
      await page.goto('/leads');
      
      // Find a lead and click on it
      await page.click('[data-testid=lead-item]:first-child');
      
      // Verify lead details page
      await expect(page.locator('[data-testid=lead-details]')).toBeVisible();
      
      // Update lead status to contacted
      await page.click('[data-testid=status-dropdown]');
      await page.click('[data-testid=status-contacted]');
      
      // Add follow-up note
      await page.fill('[data-testid=new-note-input]', 'Customer interested in test drive');
      await page.click('[data-testid=add-note-button]');
      
      // Schedule appointment
      await page.click('[data-testid=schedule-appointment-button]');
      await page.fill('[data-testid=appointment-date]', '2024-12-01');
      await page.fill('[data-testid=appointment-time]', '10:00 AM');
      await page.click('[data-testid=save-appointment-button]');
      
      // Mark as qualified
      await page.click('[data-testid=status-dropdown]');
      await page.click('[data-testid=status-qualified]');
      
      // Verify status updates
      await expect(page.locator('[data-testid=lead-status]')).toContainText('Qualified');
      await expect(page.locator('[data-testid=lead-timeline]')).toContainText('Customer interested in test drive');
      await expect(page.locator('[data-testid=upcoming-appointments]')).toContainText('Dec 1, 2024');
    });
  });

  test.describe('Dashboard Analytics', () => {
    test('should display key metrics correctly @smoke', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Verify KPI cards are visible
      await expect(page.locator('[data-testid=total-vehicles-kpi]')).toBeVisible();
      await expect(page.locator('[data-testid=total-leads-kpi]')).toBeVisible();
      await expect(page.locator('[data-testid=monthly-sales-kpi]')).toBeVisible();
      await expect(page.locator('[data-testid=conversion-rate-kpi]')).toBeVisible();
      
      // Verify metrics have values
      const totalVehicles = page.locator('[data-testid=total-vehicles-kpi] [data-testid=kpi-value]');
      await expect(totalVehicles).not.toBeEmpty();
      
      const totalLeads = page.locator('[data-testid=total-leads-kpi] [data-testid=kpi-value]');
      await expect(totalLeads).not.toBeEmpty();
      
      // Verify charts are loaded
      await expect(page.locator('[data-testid=sales-chart]')).toBeVisible();
      await expect(page.locator('[data-testid=leads-chart]')).toBeVisible();
    });

    test('should filter dashboard by date range', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Open date range picker
      await page.click('[data-testid=date-range-picker]');
      
      // Select last 30 days
      await page.click('[data-testid=last-30-days]');
      
      // Wait for data to update
      await page.waitForTimeout(2000);
      
      // Verify date range is applied
      await expect(page.locator('[data-testid=date-range-display]')).toContainText('Last 30 days');
      
      // Verify charts update
      await expect(page.locator('[data-testid=sales-chart]')).toBeVisible();
    });
  });

  test.describe('Real-time Messaging', () => {
    test('should send and receive messages', async ({ page, context }) => {
      // Open two pages to simulate real-time messaging
      const page1 = page;
      const page2 = await context.newPage();
      
      // Navigate both pages to messaging
      await page1.goto('/messages');
      await page2.goto('/messages');
      
      // Select a conversation on page1
      await page1.click('[data-testid=conversation-item]:first-child');
      
      // Select the same conversation on page2
      await page2.click('[data-testid=conversation-item]:first-child');
      
      // Send a message from page1
      const testMessage = 'Hello from automated test!';
      await page1.fill('[data-testid=message-input]', testMessage);
      await page1.click('[data-testid=send-message-button]');
      
      // Verify message appears on page1
      await expect(page1.locator('[data-testid=message-list]')).toContainText(testMessage);
      
      // Verify message appears on page2 (real-time update)
      await expect(page2.locator('[data-testid=message-list]')).toContainText(testMessage, { timeout: 10000 });
      
      await page2.close();
    });
  });

  test.describe('Offline Functionality', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
      await page.goto('/vehicles');
      
      // Simulate offline mode
      await context.setOffline(true);
      
      // Try to perform an action
      await page.click('[data-testid=add-vehicle-button]');
      
      // Verify offline message
      await expect(page.locator('[data-testid=offline-indicator]')).toBeVisible();
      await expect(page.locator('[data-testid=offline-message]')).toContainText('You are currently offline');
      
      // Restore online mode
      await context.setOffline(false);
      
      // Verify online indicator
      await expect(page.locator('[data-testid=offline-indicator]')).not.toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load dashboard within performance budget', async ({ page }) => {
      // Start performance monitoring
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      
      // Wait for all content to load
      await page.waitForSelector('[data-testid=dashboard-loaded]');
      
      const loadTime = Date.now() - startTime;
      
      // Verify load time is under 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check for performance metrics
      const performanceEntries = await page.evaluate(() => {
        return JSON.stringify(performance.getEntriesByType('navigation'));
      });
      
      const entries = JSON.parse(performanceEntries);
      const navigationEntry = entries[0];
      
      // Verify Time to First Byte (TTFB) is reasonable
      expect(navigationEntry.responseStart - navigationEntry.requestStart).toBeLessThan(1000);
      
      // Verify DOM Content Loaded is reasonable
      expect(navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart).toBeLessThan(2000);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Navigate to vehicles page with large dataset
      await page.goto('/vehicles?limit=1000');
      
      const startTime = Date.now();
      
      // Wait for all vehicles to load
      await page.waitForSelector('[data-testid=vehicle-list]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time even with large dataset
      expect(loadTime).toBeLessThan(5000);
      
      // Verify pagination or virtual scrolling is working
      const visibleItems = await page.locator('[data-testid=vehicle-item]').count();
      expect(visibleItems).toBeLessThanOrEqual(50); // Should use pagination/virtualization
    });
  });

  test.describe('Security Tests', () => {
    test('should prevent XSS attacks in form inputs', async ({ page }) => {
      await page.goto('/leads');
      await page.click('[data-testid=add-lead-button]');
      
      // Try to inject XSS payload
      const xssPayload = '<script>alert("xss")</script>';
      await page.fill('[data-testid=first-name-input]', xssPayload);
      await page.fill('[data-testid=notes-input]', '<img src=x onerror=alert("xss")>');
      
      await page.click('[data-testid=save-lead-button]');
      
      // Verify XSS payload is sanitized
      await expect(page.locator('[data-testid=lead-list]')).not.toContainText('<script>');
      await expect(page.locator('[data-testid=lead-list]')).not.toContainText('onerror=');
    });

    test('should enforce authentication on protected routes', async ({ browser }) => {
      // Create new context without authentication
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Try to access protected route
      await page.goto('/dashboard');
      
      // Should redirect to login
      await page.waitForURL('/login');
      await expect(page.locator('h1')).toContainText('Welcome to DealersCloud');
      
      await context.close();
    });

    test('should handle session expiration gracefully', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Simulate session expiration by clearing storage
      await page.evaluate(() => {
        localStorage.removeItem('auth_token');
        sessionStorage.clear();
      });
      
      // Try to perform an authenticated action
      await page.goto('/vehicles');
      
      // Should redirect to login with session expired message
      await page.waitForURL('/login');
      await expect(page.locator('[data-testid=session-expired-message]')).toContainText('Your session has expired');
    });
  });
});
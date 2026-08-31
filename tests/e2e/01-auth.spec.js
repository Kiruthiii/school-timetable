import { test, expect } from '@playwright/test';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbXhta25kdHZpZW5vZHRwb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDkzMDIsImV4cCI6MjA5NzE4NTMwMn0.bBnXUdOax_f6eOUszsadnKIZHKm4llzv5WbipEmkgQM';

test.describe('TS_AUTH: Authentication', () => {
  // Reset storage state to ensure a clean session for authentication tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC_AUTH_01: Valid Login', async ({ page }) => {
    // Intercept the authentication token request and return a mocked successful response
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: anonKey,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: anonKey,
          user: {
            id: 'd04085b3-d0db-4d32-850d-13a863f890ff',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'schooladmin@gmail.com',
            email_confirmed_at: '2026-07-30T10:00:00Z',
            phone: '',
            confirmed_at: '2026-07-30T10:00:00Z',
            last_sign_in_at: '2026-07-30T10:00:00Z',
            app_metadata: {
              provider: 'email',
              providers: ['email']
            },
            user_metadata: {},
            identities: [],
            created_at: '2026-07-30T10:00:00Z',
            updated_at: '2026-07-30T10:00:00Z'
          }
        })
      });
    });

    // Navigate to the application
    await page.goto('/');

    // Fill in valid credentials
    await page.fill('input[type="email"]', 'schooladmin@gmail.com');
    await page.fill('input[type="password"]', 'password123');

    // Click Login
    await page.click('button:has-text("Log In")');

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verify Sidebar is visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('TC_AUTH_02: Invalid Login', async ({ page }) => {
    // Intercept the authentication token request and return an error response
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials'
        })
      });
    });

    await page.goto('/');

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click Login
    await page.click('button:has-text("Log In")');

    // Verify user remains on the login page
    await expect(page).toHaveURL(/.*\//);
    
    // Verify error inline alert (uses role="alert" in Login.jsx)
    await expect(page.locator('[role="alert"]')).toContainText(/invalid/i);
  });

  test('TC_AUTH_03: Protected Route Enforcement', async ({ page }) => {
    // Attempt to access a protected route directly without logging in
    await page.goto('/consolidated-timetable');

    // Verify redirection back to the login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('button:has-text("Log In")')).toBeVisible();
  });
});

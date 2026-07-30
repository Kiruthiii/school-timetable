import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbXhta25kdHZpZW5vZHRwb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDkzMDIsImV4cCI6MjA5NzE4NTMwMn0.bBnXUdOax_f6eOUszsadnKIZHKm4llzv5WbipEmkgQM';

setup('authenticate', async ({ page }) => {
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

  // Navigate to login
  await page.goto('/');

  // Fill credentials
  await page.fill('input[type="email"]', 'schooladmin@gmail.com');
  await page.fill('input[type="password"]', 'password123');

  // Submit and wait for redirection to dashboard
  await page.click('button:has-text("Log In")');
  await expect(page).toHaveURL(/.*\/dashboard/);

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});

import { test, expect } from '@playwright/test';

test.describe('TS_AUTH: Authentication', () => {
  test('TC_AUTH_01: Valid Login', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Fill in valid credentials (these should be environment variables in a real setup)
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click Login
    await page.click('button:has-text("Login")');

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verify Sidebar is visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('TC_AUTH_02: Invalid Login', async ({ page }) => {
    await page.goto('/');

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click Login
    await page.click('button:has-text("Login")');

    // Verify user remains on the login page
    await expect(page).toHaveURL(/.*\//);
    
    // Verify error toast (react-hot-toast creates a div with role="status")
    await expect(page.locator('[role="status"]')).toContainText(/invalid/i);
  });

  test('TC_AUTH_03: Protected Route Enforcement', async ({ page }) => {
    // Attempt to access a protected route directly without logging in
    await page.goto('/consolidated-timetable');

    // Verify redirection back to the login page
    await expect(page).toHaveURL(/.*\//);
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('TS_TIMETABLE: Timetable Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
  });

  test('TC_TT_01: Mark Teacher as Unavailable', async ({ page }) => {
    await page.click('text=Teachers');
    await page.click('button:has-text("Availability")');
    
    // Assuming date picker and availability toggle logic
    await page.fill('input[type="date"]', '2027-01-01');
    const toggleButton = page.locator('button:has-text("Mark Unavailable")').first();
    if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.click('button:has-text("Save")');
        await expect(page.locator('[role="status"]')).toContainText(/success/i);
    }
  });

  test('TC_TT_02: Generate Timetable Successfully', async ({ page }) => {
    await page.click('text=Consolidated Timetable');
    await expect(page).toHaveURL(/.*\/consolidated-timetable/);

    // Set a date for generation
    await page.fill('input[type="date"]', '2027-01-01');
    
    await page.click('button:has-text("Generate")');
    
    // Wait for the loader to appear and then disappear (if implemented)
    // await expect(page.locator('.lucide-loader2')).toBeVisible();
    await expect(page.locator('.lucide-loader2')).toBeHidden({ timeout: 15000 });
    
    await expect(page.locator('[role="status"]')).toContainText(/success/i);
    // Verify grid exists
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC_TT_03: Switch Timetable Views', async ({ page }) => {
    await page.click('text=Consolidated Timetable');
    
    // Wait for timetable to load or generate one
    await expect(page.locator('button:has-text("Class View")')).toBeVisible();
    
    await page.click('button:has-text("Class View")');
    // Verify view change (e.g. column headers change)
    await expect(page.locator('text=Class View Active').or(page.locator('th:has-text("Class")'))).toBeVisible();

    await page.click('button:has-text("Teacher View")');
    await expect(page.locator('text=Teacher View Active').or(page.locator('th:has-text("Teacher")'))).toBeVisible();

    await page.click('button:has-text("Master View")');
  });

  test('TC_TT_04: Export Timetable to PDF', async ({ page }) => {
    await page.click('text=Consolidated Timetable');
    
    // Ensure schedule is loaded first
    await expect(page.locator('table')).toBeVisible();

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    
    // Verify the download is a PDF
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});

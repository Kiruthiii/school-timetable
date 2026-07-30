import { test, expect } from '@playwright/test';

test.describe('TS_TIMETABLE: Timetable Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('TC_TT_01: Mark Teacher as Unavailable', async ({ page }) => {
    await page.click('text=Teachers');
    await expect(page).toHaveURL(/.*\/teachers/);

    // Set date to 2027-01-01
    await page.fill('input[type="date"]', '2027-01-01');

    // Click Leave on the first teacher
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('button:has-text("Leave")').click();

    // Verify success toast
    await expect(page.locator('[role="status"]').first()).toContainText(/updated|success/i);
  });

  test('TC_TT_02: Generate Timetable Successfully', async ({ page }) => {
    await page.click('text=Consolidated Timetable');
    await expect(page).toHaveURL(/.*\/consolidated-timetable/);

    // Set a date for generation
    await page.fill('input[type="date"]', '2027-01-01');
    
    // Click Generate Day button
    await page.click('button:has-text("Generate Day")');
    
    // Wait for the loader to disappear
    await expect(page.locator('text=Generating master schedule...')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('text=Loading master schedule...')).toBeHidden({ timeout: 15000 });
    
    // Verify grid table exists
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC_TT_03: Switch Timetable Views', async ({ page }) => {
    await page.click('text=Consolidated Timetable');
    await expect(page).toHaveURL(/.*\/consolidated-timetable/);

    // Set a date that has timetable generated
    await page.fill('input[type="date"]', '2027-01-01');

    // Generate if it doesn't exist
    if (await page.locator('table').isHidden()) {
      await page.click('button:has-text("Generate Day")');
      await expect(page.locator('text=Generating master schedule...')).toBeHidden({ timeout: 15000 });
      await expect(page.locator('text=Loading master schedule...')).toBeHidden({ timeout: 15000 });
    }

    // Default view is Master Grid (Verify "Period" header is visible)
    await expect(page.locator('th:has-text("Period")').first()).toBeVisible();

    // Switch to Class Schedules
    await page.click('button:has-text("Class Schedules")');
    await expect(page.locator('th:has-text("Class Name")').first()).toBeVisible();

    // Switch to Teacher Schedules
    await page.click('button:has-text("Teacher Schedules")');
    await expect(page.locator('th:has-text("Teacher Name")').first()).toBeVisible();

    // Switch back to Master Grid
    await page.click('button:has-text("Master Grid")');
    await expect(page.locator('th:has-text("Period")').first()).toBeVisible();
  });

  test('TC_TT_04: Export Timetable to PDF', async ({ page }) => {
    await page.click('text=Consolidated Timetable');
    await expect(page).toHaveURL(/.*\/consolidated-timetable/);

    // Set a date that has timetable generated
    await page.fill('input[type="date"]', '2027-01-01');

    // Generate if it doesn't exist
    if (await page.locator('table').isHidden()) {
      await page.click('button:has-text("Generate Day")');
      await expect(page.locator('text=Generating master schedule...')).toBeHidden({ timeout: 15000 });
      await expect(page.locator('text=Loading master schedule...')).toBeHidden({ timeout: 15000 });
    }

    // Ensure schedule table is loaded first
    await expect(page.locator('table')).toBeVisible();

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export PDF")');
    const download = await downloadPromise;
    
    // Verify the download is a PDF
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});

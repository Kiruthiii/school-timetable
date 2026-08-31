import { test, expect } from '@playwright/test';

test.describe('TS_CONSTRAINTS: Constraints & Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('TC_CONS_01: Create Teacher-Subject-Class Mapping', async ({ page }) => {
    await page.click('text=Mapping');
    await expect(page).toHaveURL(/.*\/mapping/);

    await page.click('button:has-text("Add Mapping")');
    
    // Select first teacher in dropdown
    await page.locator('form select').nth(0).selectOption({ index: 1 });
    
    // Select first subject in dropdown
    await page.locator('form select').nth(1).selectOption({ index: 1 });
    
    // Select first class checkbox in the form table
    const classRow = page.locator('form table tbody tr').first();
    await classRow.locator('input[type="checkbox"]').check();
    
    // Fill weekly periods
    await classRow.locator('input[type="number"]').fill('3');
    
    // Submit mapping
    await page.click('button:has-text("Save All")');
    
    await expect(page.locator('[role="status"]').first()).toContainText(/success|already exists/i);
  });

  test('TC_CONS_02: Add Fixed Slot', async ({ page }) => {
    await page.click('text=Fixed Slots');
    await expect(page).toHaveURL(/.*\/fixed-slots/);

    await page.click('button:has-text("Reserve Period")');
    
    await page.selectOption('select[name="day_of_week"]', { label: 'Monday' });
    await page.selectOption('select[name="period"]', { label: 'Period 1' });
    await page.selectOption('select[name="type"]', { label: 'Assembly' });
    
    // Wait for classes to load in modal
    await page.waitForSelector('input[id^="class-"]', { timeout: 10000 }).catch(() => {});
    
    // Check Select All Classes checkbox
    const selectAll = page.locator('#selectAll');
    if (await selectAll.isVisible()) {
      await selectAll.check();
    }
    
    await page.click('form button[type="submit"]:has-text("Save")');
    
    await expect(page.locator('[role="status"]').first()).toContainText(/created|success|skipped/i);
  });
});

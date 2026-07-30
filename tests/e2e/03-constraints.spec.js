import { test, expect } from '@playwright/test';

test.describe('TS_CONSTRAINTS: Constraints & Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
  });

  test('TC_CONS_01: Create Teacher-Subject-Class Mapping', async ({ page }) => {
    await page.click('text=Mapping');
    await expect(page).toHaveURL(/.*\/mapping/);

    await page.click('button:has-text("Add Mapping")');
    
    // Select options from dropdowns (assuming standard select or combobox)
    await page.selectOption('select[name="teacherId"]', { index: 1 });
    await page.selectOption('select[name="subjectId"]', { index: 1 });
    await page.selectOption('select[name="classId"]', { index: 1 });
    
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('[role="status"]')).toContainText(/success/i);
    // Verifying it appears in table requires knowing the selected text, skipped for generic test
  });

  test('TC_CONS_02: Add Fixed Slot', async ({ page }) => {
    await page.click('text=Fixed Slots');
    await expect(page).toHaveURL(/.*\/fixed-slots/);

    await page.click('button:has-text("Add Fixed Slot")');
    
    await page.selectOption('select[name="classId"]', { index: 1 });
    await page.selectOption('select[name="day"]', { label: 'Monday' });
    await page.selectOption('select[name="period"]', { label: '1' });
    await page.selectOption('select[name="subjectId"]', { index: 1 });
    
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('[role="status"]')).toContainText(/success/i);
  });
});

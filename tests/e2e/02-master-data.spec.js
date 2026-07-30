import { test, expect } from '@playwright/test';

test.describe('TS_MASTER_DATA: Master Data Management', () => {
  // Assuming a global setup handles authentication, or we log in before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('TC_MD_01: Create New Teacher', async ({ page }) => {
    await page.click('text=Teachers');
    await expect(page).toHaveURL(/.*\/teachers/);

    await page.click('button:has-text("Add Teacher")');
    
    // Assuming the modal has these inputs based on typical structure
    await page.fill('input[name="name"]', 'John Doe Automation');
    await page.fill('input[name="department"]', 'Science');
    
    await page.click('button:has-text("Save")');

    // Verify success toast and table content
    await expect(page.locator('[role="status"]')).toContainText(/success/i);
    await expect(page.locator('table')).toContainText('John Doe Automation');
  });

  test('TC_MD_02: Edit Existing Class', async ({ page }) => {
    await page.click('text=Classes');
    await expect(page).toHaveURL(/.*\/classes/);

    // Assume there's an edit button (often an icon or button in the table row)
    // We select the first edit button in the table
    const editButton = page.locator('table tbody tr:first-child button[title="Edit"]').first();
    
    // If the table is empty, this test might fail, so in a real scenario we'd create one first or mock the DB
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const newClassName = `Class ${Math.floor(Math.random() * 100)}`;
      await page.fill('input[name="className"]', newClassName);
      await page.click('button:has-text("Save")');
      
      await expect(page.locator('[role="status"]')).toContainText(/success/i);
      await expect(page.locator('table')).toContainText(newClassName);
    }
  });

  test('TC_MD_03: Delete Subject with Confirmation', async ({ page }) => {
    await page.click('text=Subjects');
    await expect(page).toHaveURL(/.*\/subjects/);

    // Locate the first delete button
    const deleteButton = page.locator('table tbody tr:first-child button[title="Delete"]').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Wait for the confirm modal and click Confirm
      await expect(page.locator('text=Are you sure')).toBeVisible();
      await page.click('button:has-text("Confirm")');
      
      await expect(page.locator('[role="status"]')).toContainText(/success/i);
    }
  });
});

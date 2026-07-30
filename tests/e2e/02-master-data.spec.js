import { test, expect } from '@playwright/test';

test.describe('TS_MASTER_DATA: Master Data Management', () => {
  // Rely on global storage state

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('TC_MD_01: Create and Delete Teacher', async ({ page }) => {
    await page.click('text=Teachers');
    await expect(page).toHaveURL(/.*\/teachers/);

    // If "John Doe Automation" already exists from a crashed run, delete it first
    const existingRow = page.locator('table tbody tr', { hasText: 'John Doe Automation' });
    if (await existingRow.count() > 0) {
      await existingRow.locator('button[aria-label^="Delete "]').first().click();
      await page.click('button:has-text("Delete Teacher")');
      await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
    }

    await page.click('button:has-text("Add Teacher")');
    
    await page.fill('input[name="teacher_name"]', 'John Doe Automation');
    await page.fill('input[name="short_name"]', 'JDA');
    await page.fill('input[name="mobile"]', '1234567890');
    await page.fill('input[name="email"]', 'jda@example.com');
    
    await page.click('form button[type="submit"]:has-text("Add Teacher")');

    // Verify success toast and table content
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
    await expect(page.locator('table')).toContainText('John Doe Automation');

    // Delete the teacher as cleanup
    const row = page.locator('table tbody tr', { hasText: 'John Doe Automation' });
    await row.locator('button[aria-label^="Delete "]').first().click();
    await page.click('button:has-text("Delete Teacher")');
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  });

  test('TC_MD_02: Create, Edit and Delete Class', async ({ page }) => {
    await page.click('text=Classes');
    await expect(page).toHaveURL(/.*\/classes/);

    const className = 'Temp Class E2E';
    const editedClassName = 'Temp Class E2E Edited';

    // Cleanup existing classes from previous runs if they exist
    for (const name of [className, editedClassName]) {
      const existingRow = page.locator('table tbody tr', { hasText: name });
      if (await existingRow.count() > 0) {
        await existingRow.locator('button[aria-label^="Delete "]').first().click();
        await page.click('button:has-text("Delete Class")');
        await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
      }
    }

    // Create a new class
    await page.click('button:has-text("Add Class")');
    await page.fill('input[name="class_name"]', className);
    await page.click('button[type="submit"]:has-text("Add Class")');
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
    await expect(page.locator('table')).toContainText(className);

    // Edit the class
    const row = page.locator('table tbody tr', { hasText: className });
    await row.locator('button[aria-label^="Edit "]').first().click();
    await page.fill('input[name="class_name"]', editedClassName);
    await page.click('button[type="submit"]:has-text("Update Class")');
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
    await expect(page.locator('table')).toContainText(editedClassName);

    // Clean up
    const editedRow = page.locator('table tbody tr', { hasText: editedClassName });
    await editedRow.locator('button[aria-label^="Delete "]').first().click();
    await page.click('button:has-text("Delete Class")');
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  });

  test('TC_MD_03: Create and Delete Subject', async ({ page }) => {
    await page.click('text=Subjects');
    await expect(page).toHaveURL(/.*\/subjects/);

    const subjectName = 'Temp Subject E2E';

    // Cleanup existing subjects from previous runs if they exist
    const existingRow = page.locator('table tbody tr', { hasText: subjectName });
    if (await existingRow.count() > 0) {
      await existingRow.locator('button[aria-label^="Delete "]').first().click();
      await page.click('button:has-text("Delete Subject")');
      await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
    }

    // Add subject
    await page.click('button:has-text("Add Subject")');
    await page.fill('input[name="subject_name"]', subjectName);
    await page.fill('input[name="short_name"]', 'TSE');
    await page.click('button[type="submit"]:has-text("Add Subject")');
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
    await expect(page.locator('table')).toContainText(subjectName);

    // Clean up
    const row = page.locator('table tbody tr', { hasText: subjectName });
    await row.locator('button[aria-label^="Delete "]').first().click();
    await page.click('button:has-text("Delete Subject")');
    await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  });
});

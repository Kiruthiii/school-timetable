# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-master-data.spec.js >> TS_MASTER_DATA: Master Data Management >> TC_MD_02: Create, Edit and Delete Class
- Location: tests/e2e/02-master-data.spec.js:42:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[role="status"]').first()
Expected pattern: /success/i
Received string:  "new row violates row-level security policy for table \"classes\""
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('[role="status"]').first()
    8 × locator resolved to <div role="status" aria-live="polite" class="go3958317564">new row violates row-level security policy for ta…</div>
      - unexpected value "new row violates row-level security policy for table "classes""

```

```yaml
- status: new row violates row-level security policy for table "classes"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('TS_MASTER_DATA: Master Data Management', () => {
  4   |   // Rely on global storage state
  5   | 
  6   |   test.beforeEach(async ({ page }) => {
  7   |     await page.goto('/dashboard');
  8   |   });
  9   | 
  10  |   test('TC_MD_01: Create and Delete Teacher', async ({ page }) => {
  11  |     await page.click('text=Teachers');
  12  |     await expect(page).toHaveURL(/.*\/teachers/);
  13  | 
  14  |     // If "John Doe Automation" already exists from a crashed run, delete it first
  15  |     const existingRow = page.locator('table tbody tr', { hasText: 'John Doe Automation' });
  16  |     if (await existingRow.count() > 0) {
  17  |       await existingRow.locator('button[aria-label^="Delete "]').first().click();
  18  |       await page.click('button:has-text("Delete Teacher")');
  19  |       await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  20  |     }
  21  | 
  22  |     await page.click('button:has-text("Add Teacher")');
  23  |     
  24  |     await page.fill('input[name="teacher_name"]', 'John Doe Automation');
  25  |     await page.fill('input[name="short_name"]', 'JDA');
  26  |     await page.fill('input[name="mobile"]', '1234567890');
  27  |     await page.fill('input[name="email"]', 'jda@example.com');
  28  |     
  29  |     await page.click('form button[type="submit"]:has-text("Add Teacher")');
  30  | 
  31  |     // Verify success toast and table content
  32  |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  33  |     await expect(page.locator('table')).toContainText('John Doe Automation');
  34  | 
  35  |     // Delete the teacher as cleanup
  36  |     const row = page.locator('table tbody tr', { hasText: 'John Doe Automation' });
  37  |     await row.locator('button[aria-label^="Delete "]').first().click();
  38  |     await page.click('button:has-text("Delete Teacher")');
  39  |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  40  |   });
  41  | 
  42  |   test('TC_MD_02: Create, Edit and Delete Class', async ({ page }) => {
  43  |     await page.click('text=Classes');
  44  |     await expect(page).toHaveURL(/.*\/classes/);
  45  | 
  46  |     const className = 'Temp Class E2E';
  47  |     const editedClassName = 'Temp Class E2E Edited';
  48  | 
  49  |     // Cleanup existing classes from previous runs if they exist
  50  |     for (const name of [className, editedClassName]) {
  51  |       const existingRow = page.locator('table tbody tr', { hasText: name });
  52  |       if (await existingRow.count() > 0) {
  53  |         await existingRow.locator('button[aria-label^="Delete "]').first().click();
  54  |         await page.click('button:has-text("Delete Class")');
  55  |         await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  56  |       }
  57  |     }
  58  | 
  59  |     // Create a new class
  60  |     await page.locator('div.space-y-6 button:has-text("Add Class")').first().click();
  61  |     await page.fill('input[name="class_name"]', className);
  62  |     await page.click('form button[type="submit"]');
> 63  |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
      |                                                           ^ Error: expect(locator).toContainText(expected) failed
  64  |     await expect(page.locator('table')).toContainText(className);
  65  | 
  66  |     // Edit the class
  67  |     const row = page.locator('table tbody tr', { hasText: className });
  68  |     await row.locator('button[aria-label^="Edit "]').first().click();
  69  |     await page.fill('input[name="class_name"]', editedClassName);
  70  |     await page.click('button[type="submit"]:has-text("Update Class")');
  71  |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  72  |     await expect(page.locator('table')).toContainText(editedClassName);
  73  | 
  74  |     // Clean up
  75  |     const editedRow = page.locator('table tbody tr', { hasText: editedClassName });
  76  |     await editedRow.locator('button[aria-label^="Delete "]').first().click();
  77  |     await page.click('button:has-text("Delete Class")');
  78  |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  79  |   });
  80  | 
  81  |   test('TC_MD_03: Create and Delete Subject', async ({ page }) => {
  82  |     await page.click('text=Subjects');
  83  |     await expect(page).toHaveURL(/.*\/subjects/);
  84  | 
  85  |     const subjectName = 'Temp Subject E2E';
  86  | 
  87  |     // Cleanup existing subjects from previous runs if they exist
  88  |     const existingRow = page.locator('table tbody tr', { hasText: subjectName });
  89  |     if (await existingRow.count() > 0) {
  90  |       await existingRow.locator('button[aria-label^="Delete "]').first().click();
  91  |       await page.click('button:has-text("Delete Subject")');
  92  |       await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  93  |     }
  94  | 
  95  |     // Add subject
  96  |     await page.click('button:has-text("Add Subject")');
  97  |     await page.fill('input[name="subject_name"]', subjectName);
  98  |     await page.fill('input[name="short_name"]', 'TSE');
  99  |     await page.click('button[type="submit"]:has-text("Add Subject")');
  100 |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  101 |     await expect(page.locator('table')).toContainText(subjectName);
  102 | 
  103 |     // Clean up
  104 |     const row = page.locator('table tbody tr', { hasText: subjectName });
  105 |     await row.locator('button[aria-label^="Delete "]').first().click();
  106 |     await page.click('button:has-text("Delete Subject")');
  107 |     await expect(page.locator('[role="status"]').first()).toContainText(/success/i);
  108 |   });
  109 | });
  110 | 
```
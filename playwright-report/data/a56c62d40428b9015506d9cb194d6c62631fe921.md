# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-timetable.spec.js >> TS_TIMETABLE: Timetable Generation >> TC_TT_01: Mark Teacher as Unavailable
- Location: tests/e2e/04-timetable.spec.js:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('table tbody tr').first().locator('button:has-text("Leave")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Timetable
      - button "Collapse sidebar" [expanded] [ref=e14]
    - navigation "Main navigation" [ref=e18]:
      - list [ref=e19]:
        - listitem [ref=e20]:
          - link "Dashboard" [ref=e21] [cursor=pointer]:
            - /url: /dashboard
        - listitem [ref=e28]:
          - link "Teachers" [ref=e29] [cursor=pointer]:
            - /url: /teachers
        - listitem [ref=e34]:
          - link "Subjects" [ref=e35] [cursor=pointer]:
            - /url: /subjects
        - listitem [ref=e39]:
          - link "Classes" [ref=e40] [cursor=pointer]:
            - /url: /classes
        - listitem [ref=e46]:
          - link "Mapping" [ref=e47] [cursor=pointer]:
            - /url: /mapping
        - listitem [ref=e52]:
          - link "Consolidated Timetable" [ref=e53] [cursor=pointer]:
            - /url: /consolidated-timetable
        - listitem [ref=e57]:
          - link "Fixed Slots" [ref=e58] [cursor=pointer]:
            - /url: /fixed-slots
    - generic [ref=e65]:
      - paragraph [ref=e66]: School ERP System
      - paragraph [ref=e67]: v1.0.0
  - generic [ref=e68]:
    - banner [ref=e69]:
      - heading "School Timetable Management System" [level=1] [ref=e71]
      - generic [ref=e72]:
        - generic [ref=e73]: schooladmin
        - button "Logout" [ref=e79]
    - main [ref=e84]:
      - generic [ref=e85]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - heading "Teachers" [level=1] [ref=e89]
            - paragraph [ref=e90]: Manage your teaching staff
          - button "Add Teacher" [ref=e92]
        - generic [ref=e96]:
          - textbox "Search teachers by name, email, or mobile..." [ref=e98]
          - generic [ref=e99]:
            - generic [ref=e100]: "Select Date:"
            - textbox "Select Date:" [active] [ref=e101]: 2027-01-01
        - generic [ref=e103]:
          - heading "No teachers found" [level=3] [ref=e109]
          - paragraph [ref=e110]: Get started by adding your first teacher
          - button "Add Teacher" [ref=e111]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('TS_TIMETABLE: Timetable Generation', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |   });
  7  | 
  8  |   test('TC_TT_01: Mark Teacher as Unavailable', async ({ page }) => {
  9  |     await page.click('text=Teachers');
  10 |     await expect(page).toHaveURL(/.*\/teachers/);
  11 | 
  12 |     // Set date to 2027-01-01
  13 |     await page.fill('input[type="date"]', '2027-01-01');
  14 | 
  15 |     // Click Leave on the first teacher
  16 |     const firstRow = page.locator('table tbody tr').first();
> 17 |     await firstRow.locator('button:has-text("Leave")').click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  18 | 
  19 |     // Verify success toast
  20 |     await expect(page.locator('[role="status"]').first()).toContainText(/updated|success/i);
  21 |   });
  22 | 
  23 |   test('TC_TT_02: Generate Timetable Successfully', async ({ page }) => {
  24 |     await page.click('text=Consolidated Timetable');
  25 |     await expect(page).toHaveURL(/.*\/consolidated-timetable/);
  26 | 
  27 |     // Set a date for generation
  28 |     await page.fill('input[type="date"]', '2027-01-01');
  29 |     
  30 |     // Click Generate Day button
  31 |     await page.click('button:has-text("Generate Day")');
  32 |     
  33 |     // Wait for the loader to disappear
  34 |     await expect(page.locator('text=Generating master schedule...')).toBeHidden({ timeout: 15000 });
  35 |     await expect(page.locator('text=Loading master schedule...')).toBeHidden({ timeout: 15000 });
  36 |     
  37 |     // Verify grid table exists
  38 |     await expect(page.locator('table')).toBeVisible();
  39 |   });
  40 | 
  41 |   test('TC_TT_03: Switch Timetable Views', async ({ page }) => {
  42 |     await page.click('text=Consolidated Timetable');
  43 |     await expect(page).toHaveURL(/.*\/consolidated-timetable/);
  44 | 
  45 |     // Set a date that has timetable generated
  46 |     await page.fill('input[type="date"]', '2027-01-01');
  47 | 
  48 |     // Generate if it doesn't exist
  49 |     if (await page.locator('table').isHidden()) {
  50 |       await page.click('button:has-text("Generate Day")');
  51 |       await expect(page.locator('text=Generating master schedule...')).toBeHidden({ timeout: 15000 });
  52 |       await expect(page.locator('text=Loading master schedule...')).toBeHidden({ timeout: 15000 });
  53 |     }
  54 | 
  55 |     // Default view is Master Grid (Verify "Period" header is visible)
  56 |     await expect(page.locator('th:has-text("Period")').first()).toBeVisible();
  57 | 
  58 |     // Switch to Class Schedules
  59 |     await page.click('button:has-text("Class Schedules")');
  60 |     await expect(page.locator('th:has-text("Class Name")').first()).toBeVisible();
  61 | 
  62 |     // Switch to Teacher Schedules
  63 |     await page.click('button:has-text("Teacher Schedules")');
  64 |     await expect(page.locator('th:has-text("Teacher Name")').first()).toBeVisible();
  65 | 
  66 |     // Switch back to Master Grid
  67 |     await page.click('button:has-text("Master Grid")');
  68 |     await expect(page.locator('th:has-text("Period")').first()).toBeVisible();
  69 |   });
  70 | 
  71 |   test('TC_TT_04: Export Timetable to PDF', async ({ page }) => {
  72 |     await page.click('text=Consolidated Timetable');
  73 |     await expect(page).toHaveURL(/.*\/consolidated-timetable/);
  74 | 
  75 |     // Set a date that has timetable generated
  76 |     await page.fill('input[type="date"]', '2027-01-01');
  77 | 
  78 |     // Generate if it doesn't exist
  79 |     if (await page.locator('table').isHidden()) {
  80 |       await page.click('button:has-text("Generate Day")');
  81 |       await expect(page.locator('text=Generating master schedule...')).toBeHidden({ timeout: 15000 });
  82 |       await expect(page.locator('text=Loading master schedule...')).toBeHidden({ timeout: 15000 });
  83 |     }
  84 | 
  85 |     // Ensure schedule table is loaded first
  86 |     await expect(page.locator('table')).toBeVisible();
  87 | 
  88 |     // Start waiting for download before clicking
  89 |     const downloadPromise = page.waitForEvent('download');
  90 |     await page.click('button:has-text("Export PDF")');
  91 |     const download = await downloadPromise;
  92 |     
  93 |     // Verify the download is a PDF
  94 |     expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  95 |   });
  96 | });
  97 | 
```
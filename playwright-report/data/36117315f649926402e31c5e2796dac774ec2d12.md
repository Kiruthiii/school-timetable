# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-constraints.spec.js >> TS_CONSTRAINTS: Constraints & Rules >> TC_CONS_01: Create Teacher-Subject-Class Mapping
- Location: tests/e2e/03-constraints.spec.js:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('form select').first()
    - locator resolved to <select required="" class="w-full border rounded-xl px-4 py-3">…</select>
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
      - waiting 100ms
    58 × waiting for element to be visible and enabled
       - did not find some options
     - retrying select option action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
              - heading "Mapping" [level=1] [ref=e89]
              - paragraph [ref=e90]: Manage class-subject-teacher mappings via visual workflow nodes or table list
            - generic [ref=e92]:
              - generic [ref=e93]:
                - button "n8n Canvas Node View" [ref=e94]
                - button "Table View" [ref=e101]
              - button "Add Mapping Node" [active] [ref=e105]
          - generic [ref=e108]:
            - button "All Classes 0" [ref=e110]:
              - generic [ref=e115]: All Classes
              - generic [ref=e116]: "0"
            - generic [ref=e117]:
              - button "Zoom Out" [ref=e118]
              - generic [ref=e122]: 100%
              - button "Zoom In" [ref=e123]
              - button "Reset Zoom" [ref=e127]
  - dialog [ref=e135]:
    - generic [ref=e136]:
      - generic [ref=e137]:
        - heading "Add Mapping" [level=2] [ref=e138]
        - paragraph [ref=e139]: Create a new mapping
      - button "Close modal" [ref=e140]
    - generic [ref=e145]:
      - generic [ref=e146]:
        - generic [ref=e147]: Teacher *
        - combobox [ref=e148]:
          - option "Select Teacher" [selected]
      - generic [ref=e149]:
        - generic [ref=e150]: Subject *
        - combobox [ref=e151]:
          - option "Select Subject" [selected]
      - table [ref=e153]:
        - rowgroup [ref=e154]:
          - row [ref=e155]:
            - columnheader "Select" [ref=e156]
            - columnheader "Class" [ref=e157]
            - columnheader "Weekly Periods" [ref=e158]
        - rowgroup
      - generic [ref=e159]:
        - button "Cancel" [ref=e160]
        - button "Save All" [ref=e161]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('TS_CONSTRAINTS: Constraints & Rules', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |   });
  7  | 
  8  |   test('TC_CONS_01: Create Teacher-Subject-Class Mapping', async ({ page }) => {
  9  |     await page.click('text=Mapping');
  10 |     await expect(page).toHaveURL(/.*\/mapping/);
  11 | 
  12 |     await page.click('button:has-text("Add Mapping")');
  13 |     
  14 |     // Select first teacher in dropdown
> 15 |     await page.locator('form select').nth(0).selectOption({ index: 1 });
     |                                              ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  16 |     
  17 |     // Select first subject in dropdown
  18 |     await page.locator('form select').nth(1).selectOption({ index: 1 });
  19 |     
  20 |     // Select first class checkbox in the form table
  21 |     const classRow = page.locator('form table tbody tr').first();
  22 |     await classRow.locator('input[type="checkbox"]').check();
  23 |     
  24 |     // Fill weekly periods
  25 |     await classRow.locator('input[type="number"]').fill('3');
  26 |     
  27 |     // Submit mapping
  28 |     await page.click('button:has-text("Save All")');
  29 |     
  30 |     await expect(page.locator('[role="status"]').first()).toContainText(/success|already exists/i);
  31 |   });
  32 | 
  33 |   test('TC_CONS_02: Add Fixed Slot', async ({ page }) => {
  34 |     await page.click('text=Fixed Slots');
  35 |     await expect(page).toHaveURL(/.*\/fixed-slots/);
  36 | 
  37 |     await page.click('button:has-text("Reserve Period")');
  38 |     
  39 |     await page.selectOption('select[name="day_of_week"]', { label: 'Monday' });
  40 |     await page.selectOption('select[name="period"]', { label: 'Period 1' });
  41 |     await page.selectOption('select[name="type"]', { label: 'Assembly' });
  42 |     
  43 |     // Wait for classes to load in modal
  44 |     await page.waitForSelector('input[id^="class-"]', { timeout: 10000 }).catch(() => {});
  45 |     
  46 |     // Check Select All Classes checkbox
  47 |     const selectAll = page.locator('#selectAll');
  48 |     if (await selectAll.isVisible()) {
  49 |       await selectAll.check();
  50 |     }
  51 |     
  52 |     await page.click('form button[type="submit"]:has-text("Save")');
  53 |     
  54 |     await expect(page.locator('[role="status"]').first()).toContainText(/created|success|skipped/i);
  55 |   });
  56 | });
  57 | 
```
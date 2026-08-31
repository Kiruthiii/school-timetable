# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-constraints.spec.js >> TS_CONSTRAINTS: Constraints & Rules >> TC_CONS_02: Add Fixed Slot
- Location: tests/e2e/03-constraints.spec.js:33:3

# Error details

```
Error: locator.check: Clicking the checkbox did not change its state
Call log:
  - waiting for locator('#selectAll')
    - locator resolved to <input id="selectAll" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

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
              - heading "Reserved Periods" [level=1] [ref=e89]
              - paragraph [ref=e90]: Configure reserved periods such as Assembly and ECA.
            - button "Reserve Period" [ref=e92]
          - generic [ref=e94]:
            - textbox "Search by Class..." [ref=e95]
            - combobox [ref=e96]:
              - option "All Days" [selected]
              - option "Monday"
              - option "Tuesday"
              - option "Wednesday"
              - option "Thursday"
              - option "Friday"
              - option "Saturday"
            - combobox [ref=e97]:
              - option "All Periods" [selected]
              - option "Period 1"
              - option "Period 2"
              - option "Period 3"
              - option "Period 4"
              - option "Period 5"
              - option "Period 6"
              - option "Period 7"
              - option "Period 8"
            - combobox [ref=e98]:
              - option "All Reserved Slots" [selected]
              - option "Assembly"
              - option "ECA"
          - table [ref=e102]:
            - rowgroup [ref=e103]:
              - row [ref=e104]:
                - columnheader "Class" [ref=e105]
                - columnheader "Day" [ref=e106]
                - columnheader "Period" [ref=e107]
                - columnheader "Reserved Period" [ref=e108]
                - columnheader "Actions" [ref=e109]
            - rowgroup [ref=e110]:
              - row [ref=e111]:
                - cell "📅 No reserved periods configured yet. Reserve periods like Assembly and ECA to prevent subjects from being scheduled in those slots. + Reserve Period" [ref=e112]:
                  - generic [ref=e113]:
                    - generic [ref=e114]: 📅
                    - paragraph [ref=e115]: No reserved periods configured yet.
                    - paragraph [ref=e116]: Reserve periods like Assembly and ECA to prevent subjects from being scheduled in those slots.
                    - button "+ Reserve Period" [ref=e118]
  - dialog [ref=e122]:
    - generic [ref=e123]:
      - generic [ref=e124]:
        - heading "Reserve Period" [level=2] [ref=e125]
        - paragraph [ref=e126]: Reserve a new period for a class
      - button "Close modal" [ref=e127]
    - generic [ref=e132]:
      - generic [ref=e133]:
        - generic [ref=e134]: Type *
        - combobox "Type *" [ref=e135]:
          - option "Assembly" [selected]
          - option "ECA"
      - generic [ref=e136]:
        - generic [ref=e137]: Day *
        - combobox "Day *" [ref=e138]:
          - option "Monday" [selected]
          - option "Tuesday"
          - option "Wednesday"
          - option "Thursday"
          - option "Friday"
          - option "Saturday"
      - generic [ref=e139]:
        - generic [ref=e140]: Period *
        - combobox "Period *" [ref=e141]:
          - option "Period 1" [selected]
          - option "Period 2"
          - option "Period 3"
          - option "Period 4"
          - option "Period 5"
          - option "Period 6"
          - option "Period 7"
          - option "Period 8"
      - generic [ref=e142]:
        - generic [ref=e143]: Classes
        - generic [ref=e144]:
          - checkbox "Select All Classes" [active] [ref=e145]
          - generic [ref=e146]: Select All Classes
      - generic [ref=e148]:
        - button "Cancel" [ref=e149]
        - button "Save" [ref=e150]
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
  15 |     await page.locator('form select').nth(0).selectOption({ index: 1 });
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
> 49 |       await selectAll.check();
     |                       ^ Error: locator.check: Clicking the checkbox did not change its state
  50 |     }
  51 |     
  52 |     await page.click('form button[type="submit"]:has-text("Save")');
  53 |     
  54 |     await expect(page.locator('[role="status"]').first()).toContainText(/created|success|skipped/i);
  55 |   });
  56 | });
  57 | 
```
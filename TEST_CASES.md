# School Timetable - Playwright E2E Test Cases & Run Guide

This document describes the Playwright End-to-End (E2E) testing suite, details all test cases, and provides run commands for individual tests, suites, and advanced Playwright features (UI Mode, Headed, Debugging, etc.).

---

## 🛠️ Setup & Prerequisites

Before running the tests, ensure you have installed the project dependencies:

```bash
# Install node packages (including Playwright)
npm install

# Install Playwright browsers (if not already installed)
npx playwright install
```

---

## 🚀 Playwright Run Commands

Below is a comprehensive list of run commands using both standard npm scripts (defined in [package.json](file:///Users/rr/Akshay/school-timetable/package.json)) and direct Playwright CLI commands.

### 1. Run All Tests

Run all end-to-end tests headless (default CI configuration).

```bash
# Using npm script
npm run test:e2e

# Or directly using npx
npx playwright test
```

### 2. Run Tests in Interactive UI Mode (Recommended for development)

Launches the interactive Playwright UI Runner where you can see execution flows, time-travel debug, view locator targets, and reload tests on change.

```bash
# Using npm script
npm run test:e2e:ui

# Or directly using npx
npx playwright test --ui
```

### 3. Run Tests in Headed Mode

Runs the tests in a real visible browser window.

```bash
npx playwright test --headed
```

### 4. Run a Specific Test Suite (File)

To run all tests within a specific file:

```bash
# Run Authentication tests
npx playwright test tests/e2e/01-auth.spec.js

# Run Master Data Management tests
npx playwright test tests/e2e/02-master-data.spec.js

# Run Constraints tests
npx playwright test tests/e2e/03-constraints.spec.js

# Run Timetable Generation tests
npx playwright test tests/e2e/04-timetable.spec.js
```

### 5. Run a Single Test Case (Grep Pattern)

To run a specific test case matching its title or ID:

```bash
# Run only TC_AUTH_01 (Valid Login)
npx playwright test -g "TC_AUTH_01"

# Run only TC_MD_02 (Create, Edit and Delete Class)
npx playwright test -g "TC_MD_02"

# Run all Master Data tests
npx playwright test -g "TS_MASTER_DATA"
```

### 6. Debugging Tests

Launches the Playwright Inspector, allowing you to step through the test code line-by-line:

```bash
npx playwright test --debug
```

### 7. View Test Reports

Playwright automatically generates an HTML report on failure or when completed. To open the last run's HTML report:

```bash
npx playwright show-report
```

---

## 🔑 Global Authentication Setup (`auth.setup.js`)

To optimize test execution speed, a global authentication mechanism is configured in [auth.setup.js](file:///Users/rr/Akshay/school-timetable/tests/e2e/auth.setup.js):
* The setup runs **once** before all other test suites.
* It intercepts the authentication request, mocks a successful Supabase JWT login for `schooladmin@gmail.com`, and logs in.
* The authenticated session state is saved to `playwright/.auth/user.json`.
* Subsequent test suites (Master Data, Constraints, Timetable) automatically load this stored state to start logged in.
* Individual tests in `01-auth.spec.js` explicitly reset this state to verify login pages from a clean state.

---

## 📋 Detailed Test Case Document

Here is the functional breakdown of all the test cases implemented in the project.

### 📂 Suite 1: Authentication (`TS_AUTH`)
* **File Location**: [01-auth.spec.js](file:///Users/rr/Akshay/school-timetable/tests/e2e/01-auth.spec.js)
* **Configuration**: Disables global storage state to test login states from scratch.

#### `TC_AUTH_01: Valid Login`
* **Objective**: Verify that a user can successfully log in using valid credentials and is redirected to the dashboard.
* **Pre-conditions**: None.
* **Steps**:
  1. Intercept `**/auth/v1/token?grant_type=password` and mock a successful response containing a mock JWT for `schooladmin@gmail.com`.
  2. Navigate to root path `/`.
  3. Fill the email input with `schooladmin@gmail.com`.
  4. Fill the password input with `password123`.
  5. Click the **Log In** button.
* **Verification**:
  * The page URL matches `/.*\/dashboard/`.
  * The sidebar navigation is visible.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_AUTH_01"
  ```

#### `TC_AUTH_02: Invalid Login`
* **Objective**: Verify that logging in with incorrect credentials fails and displays an inline alert error.
* **Steps**:
  1. Intercept `**/auth/v1/token?grant_type=password` and mock a `400 Bad Request` containing `{ error: "invalid_grant", error_description: "Invalid login credentials" }`.
  2. Navigate to root path `/`.
  3. Fill email input with `invalid@example.com` and password with `wrongpassword`.
  4. Click the **Log In** button.
* **Verification**:
  * The page URL remains on the login page `/` (matches `/.*\//`).
  * The inline alert (`[role="alert"]`) is visible and contains "invalid".
* **Run Command**:
  ```bash
  npx playwright test -g "TC_AUTH_02"
  ```

#### `TC_AUTH_03: Protected Route Enforcement`
* **Objective**: Verify that unauthorized users are blocked from accessing protected routes and are redirected to the login page.
* **Steps**:
  1. Navigate directly to `/consolidated-timetable`.
* **Verification**:
  * The page URL is redirected back to `/` (matches `/.*\//`).
  * The **Log In** button is visible on the screen.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_AUTH_03"
  ```

---

### 📂 Suite 2: Master Data Management (`TS_MASTER_DATA`)
* **File Location**: [02-master-data.spec.js](file:///Users/rr/Akshay/school-timetable/tests/e2e/02-master-data.spec.js)
* **Configuration**: Leverages the cached auth session. Redirects to `/dashboard` before each test.

#### `TC_MD_01: Create and Delete Teacher`
* **Objective**: Verify the creation, listing, and deletion of a teacher record.
* **Steps**:
  1. Navigate to `/teachers` page via Sidebar.
  2. *Cleanup check*: If "John Doe Automation" already exists, delete it first.
  3. Click **Add Teacher**.
  4. Fill in: Name: `John Doe Automation`, Short Name: `JDA`, Mobile: `1234567890`, Email: `jda@example.com`.
  5. Click **Add Teacher** in the form.
  6. Locate the added teacher's row in the table, click the **Delete** button, and confirm in the dialog.
* **Verification**:
  * A success message is displayed on creation.
  * The table contains the text "John Doe Automation".
  * A success message is displayed on deletion.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_MD_01"
  ```

#### `TC_MD_02: Create, Edit and Delete Class`
* **Objective**: Verify the full CRUD cycle (Create, Read, Update, Delete) of a Class.
* **Steps**:
  1. Navigate to `/classes` page via Sidebar.
  2. *Cleanup check*: Delete "Temp Class E2E" and "Temp Class E2E Edited" if they exist.
  3. Click **Add Class**, enter Class Name: `Temp Class E2E`, and click **Add Class**.
  4. Locate the newly created class row, click **Edit**, modify name to `Temp Class E2E Edited`, and click **Update Class**.
  5. Locate the edited class row, click **Delete**, and confirm in the dialog.
* **Verification**:
  * Success toast confirms creation.
  * Table lists "Temp Class E2E".
  * Success toast confirms edit, and the table lists the updated class name.
  * Success toast confirms deletion.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_MD_02"
  ```

#### `TC_MD_03: Create and Delete Subject`
* **Objective**: Verify creating and deleting a Subject.
* **Steps**:
  1. Navigate to `/subjects` page via Sidebar.
  2. *Cleanup check*: Delete "Temp Subject E2E" if it exists.
  3. Click **Add Subject**, fill in Name: `Temp Subject E2E`, Short Name: `TSE`, and click **Add Subject**.
  4. Locate the subject row, click **Delete**, and confirm in the dialog.
* **Verification**:
  * Success toast confirms subject creation.
  * Subject table contains "Temp Subject E2E".
  * Success toast confirms deletion.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_MD_03"
  ```

---

### 📂 Suite 3: Constraints & Rules (`TS_CONSTRAINTS`)
* **File Location**: [03-constraints.spec.js](file:///Users/rr/Akshay/school-timetable/tests/e2e/03-constraints.spec.js)
* **Configuration**: Leverages the cached auth session. Redirects to `/dashboard` before each test.

#### `TC_CONS_01: Create Teacher-Subject-Class Mapping`
* **Objective**: Verify mapping a teacher and subject to a class with a specific number of weekly periods.
* **Steps**:
  1. Navigate to `/mapping` page via Sidebar.
  2. Click **Add Mapping**.
  3. Select the first available teacher in the dropdown.
  4. Select the first available subject in the dropdown.
  5. Check the checkbox for the first class in the classes list.
  6. Fill the weekly periods input with `3`.
  7. Click **Save All**.
* **Verification**:
  * The toast status contains success message or "already exists" notification.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_CONS_01"
  ```

#### `TC_CONS_02: Add Fixed Slot`
* **Objective**: Verify reserving a fixed period slot (e.g. assembly/break) across all classes.
* **Steps**:
  1. Navigate to `/fixed-slots` page via Sidebar.
  2. Click **Reserve Period**.
  3. Select Day: `Monday`.
  4. Select Period: `Period 1`.
  5. Select Type: `Assembly`.
  6. Check **Select All Classes**.
  7. Click **Save**.
* **Verification**:
  * Toast status confirms successful creation.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_CONS_02"
  ```

---

### 📂 Suite 4: Timetable Generation (`TS_TIMETABLE`)
* **File Location**: [04-timetable.spec.js](file:///Users/rr/Akshay/school-timetable/tests/e2e/04-timetable.spec.js)
* **Configuration**: Leverages the cached auth session. Redirects to `/dashboard` before each test.

#### `TC_TT_01: Mark Teacher as Unavailable`
* **Objective**: Verify marking a teacher as on leave (unavailable) for a specific date.
* **Steps**:
  1. Navigate to `/teachers` page via Sidebar.
  2. Fill date input with `2027-01-01`.
  3. Click **Leave** button on the first teacher in the table.
* **Verification**:
  * Success toast displays updated/success message.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_TT_01"
  ```

#### `TC_TT_02: Generate Timetable Successfully`
* **Objective**: Verify that the timetable generation engine schedules all classes successfully for a given date.
* **Steps**:
  1. Navigate to `/consolidated-timetable` page via Sidebar.
  2. Fill date input with `2027-01-01`.
  3. Click **Generate Day** button.
  4. Wait for the generation overlay and loading text to disappear (timeout: 15s).
* **Verification**:
  * The Master Grid timetable table is visible.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_TT_02"
  ```

#### `TC_TT_03: Switch Timetable Views`
* **Objective**: Verify switching between Master Grid, Class Schedules, and Teacher Schedules views.
* **Steps**:
  1. Navigate to `/consolidated-timetable` page.
  2. Fill date input with `2027-01-01`.
  3. If table is not visible, click **Generate Day**.
  4. Verify the default view contains the **Period** header column.
  5. Click **Class Schedules** button and verify the table header changes to contain **Class Name**.
  6. Click **Teacher Schedules** button and verify the table header changes to contain **Teacher Name**.
  7. Click **Master Grid** button and verify the view changes back to show the **Period** column.
* **Verification**:
  * The columns dynamically update to match the selected layout view.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_TT_03"
  ```

#### `TC_TT_04: Export Timetable to PDF`
* **Objective**: Verify exporting the generated consolidated timetable to a PDF.
* **Steps**:
  1. Navigate to `/consolidated-timetable` page.
  2. Fill date input with `2027-01-01`.
  3. Ensure timetable is generated.
  4. Set up an asynchronous listener for the browser download event.
  5. Click **Export PDF**.
* **Verification**:
  * The browser triggers a download.
  * The downloaded filename matches `.pdf` extension.
* **Run Command**:
  ```bash
  npx playwright test -g "TC_TT_04"
  ```

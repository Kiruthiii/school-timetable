<div align="center">

# 🏫 School Timetable Generator & Scheduler

[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x%2F8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed_on-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Playwright](https://img.shields.io/badge/Testing-Playwright_E2E-45BA4B?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

An automated, constraint-driven timetable generation and schedule management system built for educational institutions. Designed with multi-tenant workspace security, date-wise substitute management, fixed slot scheduling, and export features.

[Features](#-highlights--key-capabilities) • [Quick Start](#-quick-start) • [Database Setup](#-database-setup--migrations) • [Algorithm](#-timetable-generation-engine) • [Cloudflare Deployment](#-cloudflare-pages-deployment)

</div>

---

## ⚡ Highlights & Key Capabilities

- 🔒 **Multi-Tenant Workspace Security**: Enterprise-grade tenant isolation powered by PostgreSQL Row-Level Security (RLS) policies in Supabase.
- 🔐 **Authentication & RBAC**: Secure User Login, Signup, and Password Reset workflows via Supabase Auth with protected route guards.
- 👩‍🏫 **Teacher Availability & Substitute Planning**: Manage teacher profiles, subject competencies, and date-specific availability to accommodate substitute teaching.
- 🏫 **Class & Subject Management**: Flexible grade, section, and subject setup supporting core academic subjects, electives, and physical education.
- 🔗 **Class-Subject-Teacher Mapping Matrix**: Map weekly period quotas per subject and assign responsible teachers per class.
- 📌 **Fixed Slot Locking**: Configure recurring, non-overlapping slots (e.g., Morning Assembly, Lunch Breaks, Recess, Special Events) locked into specific period grids.
- ⚡ **Constraint-Driven Scheduling Engine**: Algorithmic engine in [timetableService.js](file:///home/kiruthi/projects/school-timetable/src/services/timetableService.js) that generates conflict-free schedules while preventing teacher double-booking and class overlaps.
- 📊 **Consolidated View & Master Grid**: Filterable master timetable view by Class, Teacher, or Master School-Wide Grid.
- 📑 **PDF & Excel Exports**: Direct export to publication-ready PDF reports via [pdfExporter.js](file:///home/kiruthi/projects/school-timetable/src/utils/pdfExporter.js) and Excel spreadsheets via [timetableExporter.js](file:///home/kiruthi/projects/school-timetable/src/utils/timetableExporter.js).
- 🧪 **E2E Test Suite**: Comprehensive Playwright test suite covering critical UI and business logic paths.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, Vite 8, React Router v7 | Fast Single Page Application (SPA) architecture |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, React Hot Toast | Modern responsive UI design system |
| **Backend & DB** | Supabase (PostgreSQL + RLS + Auth) | Multi-tenant cloud database & user authentication |
| **Deployment** | Cloudflare Pages | Edge deployment using SPA asset routing ([wrangler.json](file:///home/kiruthi/projects/school-timetable/wrangler.json)) |
| **Export Utilities** | jsPDF, AutoTable, SheetJS (XLSX) | Client-side document and spreadsheet generation |
| **Testing** | Playwright E2E | Browser automation & integration testing ([playwright.config.js](file:///home/kiruthi/projects/school-timetable/playwright.config.js)) |

---

## 📁 Repository Structure

```text
school-timetable/
├── wrangler.json                      # Cloudflare Pages deployment configuration
├── TEST_CASES.md                      # Comprehensive Playwright E2E test documentation
├── playwright.config.js               # Playwright E2E test configuration
├── supabase_workspace_migration.sql   # Production database schema & RLS policies
├── package.json                       # Project metadata, scripts, and dependencies
├── vite.config.js                     # Vite build configuration
│
└── src/
    ├── App.jsx                        # React Router configuration & route guards
    ├── main.jsx                       # React root entry point
    ├── index.css                      # Global Tailwind CSS import & base styles
    │
    ├── components/                    # Modular React Components
    │   ├── Navbar.jsx                 # Top header navigation
    │   ├── Sidebar.jsx                # Collapsible sidebar menu
    │   ├── ProtectedRoute.jsx         # Authentication route guard component
    │   ├── FixedSlots/                # Fixed slot configuration controls
    │   ├── Subjects/                 # Subject management UI components
    │   ├── classes/                   # Class & section UI components
    │   ├── mapping/                   # Class-subject-teacher mapping controls
    │   ├── teachers/                  # Teacher & availability management UI
    │   └── timetable/                 # Timetable grid renderer & filters
    │
    ├── context/
    │   └── AuthContext.jsx            # Supabase authentication state provider
    │
    ├── pages/                         # Application Views
    │   ├── Login.jsx                  # Login view
    │   ├── SignUp.jsx                 # Registration view
    │   ├── ForgotPassword.jsx         # Password recovery view
    │   ├── ResetPassword.jsx          # Password reset view
    │   ├── Dashboard.jsx              # System statistics & overview
    │   ├── Teachers.jsx               # Teacher database & date availability page
    │   ├── Classes.jsx                # Class & section setup page
    │   ├── Subjects.jsx               # Subject catalog management page
    │   ├── Mapping.jsx                # Subject workload assignment page
    │   ├── FixedSlots.jsx             # Locked slots & break management page
    │   └── ConsolidatedTimetable.jsx  # Timetable generator, master viewer & exporter
    │
    ├── services/                      # API & Data Access Services
    │   ├── supabase.js                # Supabase client instantiation
    │   ├── workspaceService.js        # Multi-tenant workspace handling
    │   ├── classService.js            # Class CRUD operations
    │   ├── teacherService.js          # Teacher CRUD operations
    │   ├── teacherAvailabilityService.js # Date-wise availability tracking operations
    │   ├── subjectService.js          # Subject CRUD operations
    │   ├── mappingService.js          # Class-subject-teacher mapping operations
    │   ├── fixedSlotService.js        # Fixed slot operations
    │   └── timetableService.js        # Schedule generation engine & persistence
    │
    └── utils/                         # Helper Utilities
        ├── pdfExporter.js             # Vector PDF document compiler
        └── timetableExporter.js       # Excel workbook spreadsheet exporter
```

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js**: `v22.12.0` or higher
- **npm**: `v10.0.0` or higher
- **Supabase Project**: A valid Supabase instance (URL and Anon key)

### 2. Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/Kiruthiii/school-timetable.git
cd school-timetable
npm install
```

### 3. Environment Setup

Copy [.env.example](file:///home/kiruthi/projects/school-timetable/.env.example) to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> [!IMPORTANT]
> Ensure all client environment variables retain the `VITE_` prefix. Never commit private secret keys to version control.

### 4. Running the Development Server

Start the Vite dev server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## 🗄️ Database Setup & Migrations

The database structure relies on PostgreSQL inside Supabase, enforcing tenant isolation using Row Level Security.

1. Go to **Supabase Dashboard > SQL Editor**.
2. Open [supabase_workspace_migration.sql](file:///home/kiruthi/projects/school-timetable/supabase_workspace_migration.sql) and copy its contents into the SQL Editor.
3. Execute the script to create tables (`workspaces`, `teachers`, `classes`, `subjects`, `class_subject_teacher`, `fixed_slots`, `timetable`, `teacher_availability`), set up foreign keys, and configure security policies.

---

## ⚙️ Timetable Generation Engine

The core scheduling logic in [timetableService.js](file:///home/kiruthi/projects/school-timetable/src/services/timetableService.js) uses constraint satisfaction to generate valid schedules:

1. **Pre-Allocation**: Locks user-defined fixed slots (Lunch, Recess, Assembly) across days and periods.
2. **Conflict Guard**: Guarantees zero double-booking for teachers across all classes during the same period.
3. **Availability Filter**: Checks teacher attendance/date availability via [teacherAvailabilityService.js](file:///home/kiruthi/projects/school-timetable/src/services/teacherAvailabilityService.js).
4. **Special Subject Handling**: Applies optimized slot rules for Physical Education (PT) to distribute activity periods evenly.
5. **Load Distribution**: Balances weekly subject quotas smoothly across all working days.

---

## 🧪 Testing with Playwright

Run end-to-end tests to verify authentication, mapping, and scheduling functionality:

```bash
# First-time Playwright browser installation
npx playwright install

# Run tests in headless mode
npm run test:e2e

# Run tests with the interactive UI Runner
npm run test:e2e:ui
```

For full details, see [TEST_CASES.md](file:///home/kiruthi/projects/school-timetable/TEST_CASES.md).

---

## ☁️ Cloudflare Pages Deployment

This project is specifically configured for deployment on **Cloudflare Pages** via [wrangler.json](file:///home/kiruthi/projects/school-timetable/wrangler.json).

### Option A: Automatic Deployment via Cloudflare Dashboard (Recommended)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select the `school-timetable` repository.
4. Configure Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Add Environment Variables under **Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-public-key`
6. Click **Save and Deploy**.

### Option B: Manual CLI Deployment via Wrangler

You can also deploy directly from your local terminal using Wrangler:

```bash
# Build the production assets
npm run build

# Deploy to Cloudflare Pages using Wrangler
npx wrangler pages deploy ./dist --project-name=school-timetable
```

---

## 📜 Available Scripts Summary

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Builds optimized production bundle in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs ESLint syntax and code quality checks |
| `npm run test:e2e` | Executes Playwright end-to-end tests |
| `npm run test:e2e:ui` | Opens Playwright interactive UI runner |

---

<div align="center">

Made with ❤️ for modern school timetable administration & scheduling.

</div>

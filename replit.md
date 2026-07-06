# MedCore — Hospital Management System

## Project Overview
A full-featured hospital management system built with React + Vite + Tailwind CSS v4 on the frontend, and a custom Express.js + MongoDB + JWT backend. Light teal-themed UI.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Backend**: Express.js (`server/`), MongoDB via Mongoose, JWT auth in httpOnly cookies + CSRF double-submit token
- **Charts**: Recharts (AreaChart, BarChart, PieChart)
- **Icons**: Lucide React
- **State**: Custom store (`src/store/useStore.js`) — fetches all collections from the Express API on login, refetches the affected collection after each mutation

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `src/api/client.js` | Fetch wrapper — cookie-based auth, CSRF header, JSON in/out |
| `src/store/useStore.js` | Global state + fetch-on-login for 18 collections + CRUD + current-user tracking |
| `src/App.jsx` | Auth flow (calls `/api/auth/me` on load), routing, user profile fetch, mobile sidebar state |
| `server/src/app.js` | Express app assembly — CORS, cookies, auth/CSRF gate, route mounting |
| `server/src/models/*.js` | Mongoose schemas — one per collection, `strict:false` for page-form flexibility |
| `server/src/routes/*.js` + `controllers`/`utils/crudFactory.js` | REST routes per collection, shared CRUD+audit-log factory |
| `server/src/utils/seed.js` | Demo data seeder (`npm run seed`), replaces the old client-side `seedData.js` |
| `src/components/layout/Sidebar.jsx` | Role-based navigation (12 nav items, mobile drawer) |
| `src/components/layout/Topbar.jsx` | Global search dropdown, notifications panel, mobile menu |
| `src/components/PatientDrawer.jsx` | Slide-in patient profile (4 tabs) |
| `src/components/DoctorDrawer.jsx` | Slide-in doctor profile (3 tabs) |
| `src/components/ui/Drawer.jsx` | Reusable slide-in panel with tabs |
| `src/components/ui/Skeleton.jsx` | Shimmer loading skeletons |
| `src/utils/exportCSV.js` | CSV export utility |

### Pages
| Page | Route Key | Roles |
|------|-----------|-------|
| Dashboard | `dashboard` | All |
| Appointments | `appointments` | All |
| Patients | `patients` | All |
| Doctors | `doctors` | Admin, Receptionist |
| Departments | `departments` | Admin, Receptionist |
| Calendar | `calendar` | All |
| Shifts | `shifts` | All |
| Inventory | `inventory` | Admin only |
| Billing | `billing` | Admin, Receptionist |
| Messages | `messages` | All |
| User Management | `users` | Admin only |
| Reports & Analytics | `reports` | Admin only |
| Audit Log | `auditlog` | Admin only |

### Pages (Updated)
| Page | Route Key | Roles |
|------|-----------|-------|
| Waiting Room Queue | `queue` | Admin, Receptionist |
| Prescriptions | `prescriptions` | All staff |
| Expense Tracking | `expenses` | Admin only |
| Patient Portal | — | Patient role (separate layout) |

### Features Added (Latest Session)
1. **Waiting Room Queue** — Real-time patient flow board with wait time tracking, status advances (Checked In → In Progress → Completed), and per-doctor filtering for doctors.
2. **Prescription Management** — Full CRUD for prescriptions with multi-medication table, datalist autocomplete, status tracking (Active/Completed/Cancelled), print-to-prescription feature, and CSV export.
3. **Expense Tracking** — Expense CRUD with 11 categories, analytics chart (Revenue vs Expenses, by Category), P&L calculation, month filtering, and CSV export.
4. **Dark Mode** — CSS variables approach via `data-theme="dark"` on `<html>`. Toggle button in Topbar (Moon/Sun icon). Persists in `localStorage`. Covers sidebar, topbar, cards, inputs, buttons, tables.
5. **Patient Portal** — Separate layout for `Patient` role users. Shows personalized Overview, Appointments, Prescriptions, Lab Results, and Bills — filtered by their name. Assign via User Management.
6. **Print / PDF Export** — Print button in Topbar triggers `window.print()`. `@media print` CSS hides navigation/sidebar. Prescriptions page has per-Rx print button generating a formatted prescription slip. Dark mode auto-reverts for print.
7. **formatCurrency utility** — Added to `src/utils/helpers.js`. Badge statuses extended: Paid, Overdue, Inactive.

### MongoDB Collections (17 fetched on login + settings singleton + audit log)

- `patients` — patient records (with department, email, blood type fields)
- `doctors` — doctor profiles (`uid` links to a `users` document once promoted to the Doctor role)
- `appointments` — appointment scheduling
- `departments` — hospital departments (with capacity for bed management)
- `inventory` — medical supplies and equipment (`quantity` field, deducted on prescription fill)
- `messages` — staff chat (fetched on login, refetched after sending)
- `users` — registered user profiles with roles (password hash never sent to the client)
- `medicalRecords` — patient medical history (linked by `patientId`)
- `billing` — invoices and payment records (linked by `patientId`)
- `shifts` — weekly doctor shift schedule (linked by `weekStart` ISO date)
- `auditLog` — action log (fetched on-demand via `/api/audit-log`, admin only)

### Role-Based Access
- **Admin**: Full access to all 12 pages
- **Doctor**: Dashboard, Appointments, Patients, Calendar, Shifts, Messages
- **Receptionist**: Dashboard, Appointments, Patients, Doctors, Departments, Calendar, Shifts, Billing, Messages

### Key Features
- **Patient Profile Drawer** — click patient name → slide-in panel with Overview / Appointments / Medical Records / Billing tabs
- **Doctor Profile Drawer** — click "View Profile" → slide-in panel with Overview / Appointments / Schedule tabs
- **Medical Records** — add/view records per patient (diagnosis, treatment, prescription, follow-up)
- **Global Search** — debounced dropdown in Topbar showing Patients / Doctors / Appointments results
- **Notifications Panel** — bell dropdown: upcoming appointments, low stock alerts, recent messages
- **CSV Export** — export buttons on Patients, Doctors, Appointments, Inventory pages
- **Billing & Invoicing** — create invoices, track status, print formatted invoice
- **Shift Schedule** — weekly grid (Mon–Sun × Morning/Afternoon/Night), assign doctors per shift
- **Bed Management** — occupancy progress bar per department card (uses patient.department field)
- **Audit Log** — admin-only log of all Add/Update/Delete actions with user, timestamp, entity
- **Mobile Sidebar** — hamburger menu in Topbar, overlay drawer on mobile
- **Skeleton Loading** — shimmer placeholders while the initial API fetch is in flight

## Environment Variables
Frontend (`.env`, optional): `VITE_API_URL` (defaults to `/api`, proxied to the Express server in dev).

Backend (`server/.env`, see `server/.env.example`):

- `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CLIENT_ORIGIN`, `CSRF_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `APP_URL` (password-reset email delivery)

## Important Configuration
- **Tailwind v4**: No `tailwind.config.js`, no `postcss.config.js` — uses `@tailwindcss/vite` plugin
- **No React Router**: Navigation via `activePage` state in `App.jsx`, `navigate()` passed as `onNavigate`
- **HMR disabled**: `hmr: false` in `vite.config.js` to prevent Replit proxy WebSocket loops
- **Auth**: JWT in an httpOnly cookie (`mc_token`) set by `server/src/controllers/auth.controller.js`; a separate non-httpOnly `mc_csrf` cookie is echoed back as the `X-CSRF-Token` header on mutating requests (double-submit CSRF pattern, see `server/src/middleware/csrf.middleware.js`)
- **Audit logging**: `logAudit(req, action, entity, entityName)` (`server/src/utils/audit.js`) called from route controllers per the same add/update/delete pattern the old Firestore store used
- **Dev servers**: `npm run dev` runs Vite (port 5000) and Express (port 5001) together via `concurrently`; Vite proxies `/api` to Express

## Custom CSS Classes (src/index.css)
`.sidebar-link`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.card`, `.input-field`, `.label`, `.badge`, `.table-th`, `.table-td`, `.table-row`

## Avatar Sizes
`xs` (20px), `sm` (28px), `md` (36px), `lg` (48px), `xl` (64px)

## User Preferences
- Light theme, white cards, teal `#0d9488` accent, `#f1f5f9` body background
- All CRUD pages follow: SearchBar + filter dropdowns + table/card grid + Modal

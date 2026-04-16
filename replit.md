# MedCore — Hospital Management System

## Project Overview
A full-featured hospital management system built with React + Vite + Tailwind CSS v4 + Firebase (Auth + Firestore). Light teal-themed UI.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Database & Auth**: Firebase v11 — Firestore (real-time) + Auth (email/password)
- **Charts**: Recharts (AreaChart, BarChart, PieChart)
- **Icons**: Lucide React
- **State**: Custom store with Zustand-like pattern + Firestore `onSnapshot` subscriptions

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `src/firebase.js` | Firebase config & initialization |
| `src/store/useStore.js` | Global state + 10 Firestore subscriptions + CRUD + audit logging |
| `src/App.jsx` | Auth flow, routing, user profile fetch, mobile sidebar state |
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

### Firestore Collections (14 real-time subscriptions)
- `patients` — patient records (with department, email, blood type fields)
- `doctors` — doctor profiles (with department matching)
- `appointments` — appointment scheduling
- `departments` — hospital departments (with capacity for bed management)
- `inventory` — medical supplies and equipment
- `messages` — real-time staff chat
- `users` — registered user profiles with roles
- `medicalRecords` — patient medical history (linked by patientId)
- `billing` — invoices and payment records (linked by patientId)
- `shifts` — weekly doctor shift schedule (linked by weekStart ISO date)
- `auditLog` — action log (fetched on-demand, not subscribed)

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
- **Skeleton Loading** — shimmer placeholders while Firestore data loads

## Environment Variables
All stored as `VITE_FIREBASE_*` secrets in Replit:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Firebase Project ID: `hospital-management-4e0a3`

## Important Configuration
- **Tailwind v4**: No `tailwind.config.js`, no `postcss.config.js` — uses `@tailwindcss/vite` plugin
- **No React Router**: Navigation via `activePage` state in `App.jsx`, `navigate()` passed as `onNavigate`
- **HMR disabled**: `hmr: false` in `vite.config.js` to prevent Replit proxy WebSocket loops
- **Firestore rules**: Production mode — `allow read, write: if request.auth != null`
- **Audit logging**: `logAudit(action, entity, entityName)` called in all CRUD store methods
- **Store loading**: `checkAll()` counter waits for all 10 subscriptions before setting `loading: false`

## Custom CSS Classes (src/index.css)
`.sidebar-link`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.card`, `.input-field`, `.label`, `.badge`, `.table-th`, `.table-td`, `.table-row`

## Avatar Sizes
`xs` (20px), `sm` (28px), `md` (36px), `lg` (48px), `xl` (64px)

## User Preferences
- Light theme, white cards, teal `#0d9488` accent, `#f1f5f9` body background
- All CRUD pages follow: SearchBar + filter dropdowns + table/card grid + Modal

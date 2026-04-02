# MedCore — Hospital Management System

## Project Overview
A full-featured hospital management system built with React + Vite + Tailwind CSS v4 + Firebase (Auth + Firestore). Light teal-themed UI inspired by Medlink design.

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
| `src/store/useStore.js` | Global state + Firestore subscriptions + CRUD methods |
| `src/App.jsx` | Auth flow, routing, user profile fetch |
| `src/components/layout/Sidebar.jsx` | Role-based navigation |
| `src/components/layout/Topbar.jsx` | Top header with search |

### Pages
| Page | Route Key | Roles |
|------|-----------|-------|
| Dashboard | `dashboard` | All |
| Appointments | `appointments` | All |
| Patients | `patients` | All |
| Doctors | `doctors` | Admin, Receptionist |
| Departments | `departments` | Admin, Receptionist |
| Calendar | `calendar` | All |
| Inventory | `inventory` | Admin only |
| Messages | `messages` | All |
| User Management | `users` | Admin only |

### Firestore Collections
- `patients` — patient records
- `doctors` — doctor profiles
- `appointments` — appointment scheduling
- `departments` — hospital departments
- `inventory` — medical supplies and equipment
- `messages` — real-time staff chat (ordered by createdAt asc)
- `users` — registered user profiles with roles

### Role-Based Access
- **Admin**: Full access to all pages and CRUD operations
- **Doctor**: Dashboard, Appointments, Patients, Calendar, Messages
- **Receptionist**: Dashboard, Appointments, Patients, Doctors, Departments, Calendar, Messages

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
- **No React Router**: Navigation via `activePage` state in `App.jsx`
- **HMR disabled**: `hmr: false` in `vite.config.js` to prevent Replit proxy WebSocket loops
- **Firestore rules**: Production mode — `allow read, write: if request.auth != null`

## Custom CSS Classes (src/index.css)
`.sidebar-link`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.card`, `.input-field`, `.label`, `.badge`, `.table-th`, `.table-td`, `.table-row`

## Auth Flow
1. `onAuthStateChanged` detects user
2. `ensureUserProfile()` checks/creates Firestore user doc (default role: Admin)
3. `initSubscriptions()` starts 7 real-time listeners
4. Role fetched and passed to all components as `currentUser.role`

## User Preferences
- Light theme, white cards, teal `#0d9488` accent, `#f1f5f9` body
- All CRUD pages follow the same pattern: SearchBar + filter + table/card grid + Modal

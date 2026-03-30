# MedCore — Hospital Management System

## Overview
A professional hospital management system built with React + Vite, Tailwind CSS, Lucide React icons, and localStorage for data persistence. Light theme inspired by the Medlink design template.

## Tech Stack
- **React** (with Vite for dev server)
- **Tailwind CSS** (utility-first styling)
- **Lucide React** (icons)
- **JavaScript** (no TypeScript)
- **localStorage** (data persistence)

## Features
### Fully Functional Pages
- **Login / Register** — split-screen auth UI, stores user in localStorage
- **Dashboard** — stat cards with count-up animation, recent patients, upcoming appointments
- **Patients** — full table with filters, CRUD modal, search, status badges
- **Doctors** — card grid with specialty filter tabs, CRUD modal, availability badges
- **Appointments** — table with filters, CRUD modal, clickable status cycling

### Coming Soon Pages
- **Departments**, **Calendar**, **Inventory**, **Messages** — placeholder pages

## Project Structure
```
src/
  App.jsx                    ← Root, auth gate, page routing
  main.jsx
  index.css                  ← Tailwind directives + custom classes
  context/
    ToastContext.jsx          ← Global toast notifications
  store/
    useStore.js               ← Global state + localStorage persistence
  utils/
    helpers.js                ← Badge styles, date formatting, status cycling
  components/
    layout/
      Sidebar.jsx
      Topbar.jsx
    ui/
      Badge.jsx
      Avatar.jsx
      Modal.jsx
      ConfirmModal.jsx
      SearchBar.jsx
  pages/
    Login.jsx
    Register.jsx
    Dashboard.jsx
    Patients.jsx
    Doctors.jsx
    Appointments.jsx
    ComingSoon.jsx
```

## Running
```
npm run dev
```
Runs on port 5000.

## Data Storage
- `hms_patients` — patient records
- `hms_doctors` — doctor records
- `hms_appointments` — appointment records
- `hms_user` — logged-in user session

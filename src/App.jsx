import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { initSubscriptions, ensureUserProfile, setCurrentUser, store, useStore, refetchCollection } from './store/useStore'
import { connectRealtime, disconnectRealtime } from './realtime'
import { api } from './api/client'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import BottomNav from './components/layout/BottomNav'
import Login from './pages/Login'
import Register from './pages/Register'
import { HeartPulse } from 'lucide-react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Nurses = lazy(() => import('./pages/Nurses'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Departments = lazy(() => import('./pages/Departments'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Messages = lazy(() => import('./pages/Messages'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const Billing = lazy(() => import('./pages/Billing'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const Shifts = lazy(() => import('./pages/Shifts'))
const Reports = lazy(() => import('./pages/Reports'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const Rooms = lazy(() => import('./pages/Rooms'))
const LabResults = lazy(() => import('./pages/LabResults'))
const Queue = lazy(() => import('./pages/Queue'))
const Prescriptions = lazy(() => import('./pages/Prescriptions'))
const Expenses = lazy(() => import('./pages/Expenses'))
const PatientPortal = lazy(() => import('./pages/PatientPortal'))
const Documents = lazy(() => import('./pages/Documents'))
const PendingReviews = lazy(() => import('./pages/PendingReviews'))
const Insurance = lazy(() => import('./pages/Insurance'))
const StaffPerformance = lazy(() => import('./pages/StaffPerformance'))
const Pharmacy = lazy(() => import('./pages/Pharmacy'))
const Settings = lazy(() => import('./pages/Settings'))

const ACTIVE_PAGE_KEY = 'mc_active_page'
const SIDEBAR_COLLAPSED_KEY = 'mc_sidebar_collapsed'

function HeartbeatLoader({ label = 'Loading' }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 flex items-center justify-center">
        <HeartPulse size={28} className="animate-heart-pulse text-teal-600" />
      </div>
      <div className="flex items-center gap-2" aria-hidden="true">
        <HeartPulse size={13} className="animate-heart-pulse text-teal-500" />
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-600">{label}</p>
      </div>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <HeartbeatLoader label="Loading page" />
    </div>
  )
}

// Shown when an Admin-onboarded account's temp password hasn't been changed
// yet — blocks the rest of the app until a real password is set, so the temp
// password never quietly becomes the account's permanent one.
function ForcePasswordChange() {
  const [tempPassword, setTempPassword]       = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!tempPassword || !newPassword) { setError('Both fields are required.'); return }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setSaving(true)
    try {
      await api.put('/auth/password', { currentPassword: tempPassword, newPassword })
      const user = await ensureUserProfile()
      setCurrentUser(user)
      // The `users` collection was already snapshotted (with the old
      // mustChangePassword: true) back at login — without this, App's gate
      // check keeps reading that stale flag from `users` and never unlocks.
      await refetchCollection('users')
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-800 p-5">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mb-2">Set Your Password</h1>
        <p className="text-sm text-slate-500 mb-6">Your account was created with a temporary password. Set a new one to continue.</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="label">Temporary Password</label>
            <input type="password" className="input-field" autoComplete="current-password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" autoComplete="new-password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary justify-center py-2.5 mt-1">
            {saving ? <span className="w-4 h-4 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" /> : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AppContent() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authPage, setAuthPage]       = useState('login')
  const [activePage, setActivePage]   = useState(() => localStorage.getItem(ACTIVE_PAGE_KEY) || 'dashboard')

  // <main> has no fixed height (its ancestor only sets min-h-screen), so it
  // grows with its content and the actual scrolling happens on the window —
  // which otherwise keeps whatever position the previous page left it at.
  // Reset to the top on every navigation so a page never opens mid-scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activePage])
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const { users, currentUser: authUser, settings } = useStore()
  const authCheckStartedRef = useRef(false)

  // Lock background scroll while the mobile sidebar drawer is open, so
  // content behind it can't be scrolled (matches the notification panel's
  // scroll-lock behavior).
  useEffect(() => {
    if (!mobileOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [mobileOpen])

  useEffect(() => {
    document.title = settings?.hospitalName || 'MedCore'
  }, [settings?.hospitalName])

  useEffect(() => {
    if (authCheckStartedRef.current) return
    authCheckStartedRef.current = true
    const startedAt = Date.now()
    // The auth check usually resolves in well under 100ms, which makes the
    // heartbeat loader flash by too fast to register as an animation at all —
    // hold it visible for at least this long so it reads as intentional.
    const MIN_SPLASH_MS = 700
    ;(async () => {
      try {
        const user = await ensureUserProfile()
        setCurrentUser(user)
        initSubscriptions()
      } catch (_) {
        // not logged in
      } finally {
        const remaining = MIN_SPLASH_MS - (Date.now() - startedAt)
        if (remaining > 0) await new Promise(r => setTimeout(r, remaining))
        setAuthChecked(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!authUser) return
    store.updateLastSeen(authUser.uid)
    const interval = setInterval(() => store.updateLastSeen(authUser.uid), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authUser])

  // Live updates: connects once per login session, disconnects on logout.
  // Driven by authUser (not tied to which code path called
  // initSubscriptions) so it fires correctly whether we arrived here via a
  // fresh login/register or an existing session found on page load.
  useEffect(() => {
    if (!authUser) return
    connectRealtime()
    return () => disconnectRealtime()
  }, [authUser])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-800">
        <HeartbeatLoader label="Loading MedCore" />
      </div>
    )
  }

  if (!authUser) {
    return authPage === 'login'
      ? <Login onSwitch={() => setAuthPage('register')} />
      : <Register onSwitch={() => setAuthPage('login')} />
  }

  const userProfile = users.find(u => u.uid === authUser.uid)
  const currentUser = {
    uid:      authUser.uid,
    name:     userProfile?.name || authUser.name || authUser.email?.split('@')[0] || 'User',
    email:    userProfile?.email || authUser.email,
    role:     userProfile?.role || authUser.role || 'Receptionist',
    phone:    userProfile?.phone || '',
    bio:      userProfile?.bio || '',
    avatar:   userProfile?.avatar || authUser.avatar || '',
    lastSeen: userProfile?.lastSeen || '',
    mustChangePassword: userProfile?.mustChangePassword ?? authUser.mustChangePassword ?? false,
  }

  if (currentUser.mustChangePassword) {
    return <ForcePasswordChange />
  }

  if (currentUser.role === 'Patient') {
    return (
      <Suspense fallback={<PageLoader />}>
        <PatientPortal currentUser={currentUser} />
      </Suspense>
    )
  }

  function navigate(page) {
    setActivePage(page)
    localStorage.setItem(ACTIVE_PAGE_KEY, page)
    setMobileOpen(false)
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed(v => {
      const next = !v
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }

  const adminOnly = (Component, props = {}) =>
    currentUser.role === 'Admin'
      ? <Component {...props} currentUser={currentUser} />
      : <Dashboard onNavigate={navigate} currentUser={currentUser} />

  const reviewStaffOnly = (Component, props = {}) =>
    ['Admin', 'Receptionist'].includes(currentUser.role)
      ? <Component {...props} currentUser={currentUser} />
      : <Dashboard onNavigate={navigate} currentUser={currentUser} />

  function renderPage() {
    switch (activePage) {
      case 'dashboard':         return <Dashboard onNavigate={navigate} currentUser={currentUser} />
      case 'patients':          return <Patients currentUser={currentUser} onNavigate={navigate} />
      case 'doctors':           return <Doctors currentUser={currentUser} />
      case 'nurses':            return <Nurses currentUser={currentUser} />
      case 'appointments':      return <Appointments currentUser={currentUser} />
      case 'departments':       return <Departments currentUser={currentUser} />
      case 'calendar':          return <CalendarPage onNavigate={navigate} />
      case 'inventory':         return adminOnly(Inventory)
      case 'messages':          return <Messages currentUser={currentUser} />
      case 'billing':           return <Billing currentUser={currentUser} />
      case 'shifts':            return <Shifts currentUser={currentUser} />
      case 'my-profile':        return <MyProfile currentUser={currentUser} />
      case 'rooms':             return <Rooms currentUser={currentUser} />
      case 'lab-results':       return <LabResults currentUser={currentUser} />
      case 'queue':             return <Queue currentUser={currentUser} />
      case 'prescriptions':     return <Prescriptions currentUser={currentUser} />
      case 'expenses':          return adminOnly(Expenses, {})
      case 'reports':           return adminOnly(Reports, {})
      case 'auditlog':          return adminOnly(AuditLog, {})
      case 'users':             return adminOnly(UsersPage)
      case 'documents':         return <Documents currentUser={currentUser} />
      case 'reviews':           return reviewStaffOnly(PendingReviews)
      case 'insurance':         return <Insurance currentUser={currentUser} />
      case 'staff-performance': return adminOnly(StaffPerformance, {})
      case 'pharmacy':          return <Pharmacy currentUser={currentUser} />
      case 'settings':          return adminOnly(Settings, {})
      default:                  return <Dashboard onNavigate={navigate} currentUser={currentUser} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-[55] md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        currentUser={currentUser}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-[margin-left] duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-60'}`}>
        <Topbar
          activePage={activePage}
          currentUser={currentUser}
          onNavigate={navigate}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 pt-16 pb-16 md:pb-0 px-4 md:px-6 py-6 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </main>
        <footer className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xs text-slate-400 dark:text-slate-600 no-print hidden md:block">
          Copyright © 2025 MedCore. All rights reserved. ·{' '}
          <span className="text-teal-500 cursor-pointer hover:underline">Privacy Policy</span> ·{' '}
          <span className="text-teal-500 cursor-pointer hover:underline">Terms and conditions</span>
        </footer>
      </div>
      <BottomNav
        currentPage={activePage}
        onNavigate={navigate}
        onMenuOpen={() => setMobileOpen(v => !v)}
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  )
}

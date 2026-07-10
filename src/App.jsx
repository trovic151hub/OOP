import React, { useState, useEffect } from 'react'
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
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Nurses from './pages/Nurses'
import Appointments from './pages/Appointments'
import Departments from './pages/Departments'
import CalendarPage from './pages/CalendarPage'
import Inventory from './pages/Inventory'
import Messages from './pages/Messages'
import UsersPage from './pages/UsersPage'
import Billing from './pages/Billing'
import AuditLog from './pages/AuditLog'
import Shifts from './pages/Shifts'
import Reports from './pages/Reports'
import MyProfile from './pages/MyProfile'
import Rooms from './pages/Rooms'
import LabResults from './pages/LabResults'
import Queue from './pages/Queue'
import Prescriptions from './pages/Prescriptions'
import Expenses from './pages/Expenses'
import PatientPortal from './pages/PatientPortal'
import Documents from './pages/Documents'
import Insurance from './pages/Insurance'
import StaffPerformance from './pages/StaffPerformance'
import Pharmacy from './pages/Pharmacy'
import Settings from './pages/Settings'

const ACTIVE_PAGE_KEY = 'mc_active_page'
const SIDEBAR_COLLAPSED_KEY = 'mc_sidebar_collapsed'

// Same pulse shape as the brand mark (favicon/sidebar), tiled edge-to-edge —
// the path's start and end points both sit on the vertical midline, so
// repeated copies connect into one continuous strip with no visible seam.
const HEARTBEAT_PATH = 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2'

function HeartbeatStrip() {
  return (
    <svg width="288" height="48" viewBox="0 0 144 24" fill="none">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <path
          key={i}
          d={HEARTBEAT_PATH}
          transform={`translate(${i * 24}, 0)`}
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

// Fades the trace to transparent at the left/right edges of the visible
// window (rather than each tile fading independently), so it reads as a
// smooth continuous sweep regardless of how many pulses are tiled.
const EDGE_FADE_MASK = 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)'

function HeartbeatLoader({ label = 'Loading' }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="flex flex-col items-center gap-3">
      <div
        className="w-72 h-12 overflow-hidden"
        style={{ WebkitMaskImage: EDGE_FADE_MASK, maskImage: EDGE_FADE_MASK }}
      >
        <div className="flex w-[576px] animate-heartbeat-scroll drop-shadow-[0_0_5px_rgba(13,148,136,0.45)]">
          <HeartbeatStrip />
          <HeartbeatStrip />
        </div>
      </div>
      <div className="flex items-center gap-2" aria-hidden="true">
        <svg width="12" height="12" viewBox="-18 -8 36 40" className="animate-heart-pulse text-teal-500" fill="currentColor">
          <path d="M0,4 C-6,-6 -18,-2 -18,8 C-18,18 -4,26 0,30 C4,26 18,18 18,8 C18,-2 6,-6 0,4 Z" />
        </svg>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 dark:text-slate-600">{label}</p>
      </div>
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
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const { users, currentUser: authUser, settings } = useStore()

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
    return <PatientPortal currentUser={currentUser} />
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
          {renderPage()}
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

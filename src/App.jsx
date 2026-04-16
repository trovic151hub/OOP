import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { initSubscriptions, clearSubscriptions, ensureUserProfile, store, useStore } from './store/useStore'
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

function AppContent() {
  const [authUser, setAuthUser]     = useState(undefined)
  const [authPage, setAuthPage]     = useState('login')
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { users } = useStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setAuthUser(user)
      if (user) {
        initSubscriptions()
        await ensureUserProfile(user)
      } else {
        clearSubscriptions()
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!authUser) return
    store.updateLastSeen(authUser.uid)
    const interval = setInterval(() => store.updateLastSeen(authUser.uid), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authUser])

  if (authUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading MedCore…</p>
        </div>
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
    name:     userProfile?.name || authUser.displayName || authUser.email?.split('@')[0] || 'User',
    email:    userProfile?.email || authUser.email,
    role:     userProfile?.role || 'Receptionist',
    phone:    userProfile?.phone || '',
    bio:      userProfile?.bio || '',
    lastSeen: userProfile?.lastSeen || '',
  }

  if (currentUser.role === 'Patient') {
    return <PatientPortal currentUser={currentUser} />
  }

  function navigate(page) {
    setActivePage(page)
    setMobileOpen(false)
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
    <div className="flex min-h-screen bg-slate-100">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        currentUser={currentUser}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <Topbar
          activePage={activePage}
          currentUser={currentUser}
          onNavigate={navigate}
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
        />
        <main className="flex-1 pt-16 pb-16 md:pb-0 px-4 md:px-6 py-6 overflow-y-auto">
          {renderPage()}
        </main>
        <footer className="px-6 py-3 border-t border-slate-200 bg-white text-center text-xs text-slate-400 no-print hidden md:block">
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

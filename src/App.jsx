import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { initSubscriptions, clearSubscriptions, ensureUserProfile } from './store/useStore'
import { ToastProvider } from './context/ToastContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
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

function AppContent() {
  const [authUser, setAuthUser]       = useState(undefined)
  const [userProfile, setUserProfile] = useState(null)
  const [authPage, setAuthPage]       = useState('login')
  const [activePage, setActivePage]   = useState('dashboard')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setAuthUser(user)
      if (user) {
        initSubscriptions()
        const profile = await ensureUserProfile(user)
        setUserProfile(profile)
      } else {
        clearSubscriptions()
        setUserProfile(null)
      }
    })
    return unsub
  }, [])

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

  const currentUser = {
    uid:   authUser.uid,
    name:  userProfile?.name || authUser.displayName || authUser.email?.split('@')[0] || 'User',
    email: authUser.email,
    role:  userProfile?.role || 'Admin',
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNavigate={setActivePage} currentUser={currentUser} />
      case 'patients':     return <Patients currentUser={currentUser} />
      case 'doctors':      return <Doctors currentUser={currentUser} />
      case 'appointments': return <Appointments currentUser={currentUser} />
      case 'departments':  return <Departments currentUser={currentUser} />
      case 'calendar':     return <CalendarPage onNavigate={setActivePage} />
      case 'inventory':    return <Inventory currentUser={currentUser} />
      case 'messages':     return <Messages currentUser={currentUser} />
      case 'users':        return currentUser.role === 'Admin' ? <UsersPage currentUser={currentUser} /> : <Dashboard onNavigate={setActivePage} currentUser={currentUser} />
      default:             return <Dashboard onNavigate={setActivePage} currentUser={currentUser} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar activePage={activePage} onNavigate={setActivePage} currentUser={currentUser} />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Topbar activePage={activePage} currentUser={currentUser} />
        <main className="flex-1 pt-16 px-6 py-6 overflow-y-auto">
          {renderPage()}
        </main>
        <footer className="px-6 py-3 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
          Copyright © 2025 MedCore. All rights reserved. ·{' '}
          <span className="text-teal-500 cursor-pointer hover:underline">Privacy Policy</span> ·{' '}
          <span className="text-teal-500 cursor-pointer hover:underline">Terms and conditions</span>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

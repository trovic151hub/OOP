import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { initSubscriptions, clearSubscriptions } from './store/useStore'
import { ToastProvider } from './context/ToastContext'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Appointments from './pages/Appointments'
import ComingSoon from './pages/ComingSoon'

const COMING_SOON = ['departments', 'calendar', 'inventory', 'messages']

function AppContent() {
  const [authUser, setAuthUser]   = useState(undefined)
  const [authPage, setAuthPage]   = useState('login')
  const [activePage, setActivePage] = useState('dashboard')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setAuthUser(user)
      if (user) {
        initSubscriptions()
      } else {
        clearSubscriptions()
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
    name:  authUser.displayName || authUser.email?.split('@')[0] || 'User',
    email: authUser.email,
    role:  'Admin',
  }

  function renderPage() {
    if (COMING_SOON.includes(activePage)) return <ComingSoon page={activePage} onNavigate={setActivePage} />
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNavigate={setActivePage} />
      case 'patients':     return <Patients />
      case 'doctors':      return <Doctors />
      case 'appointments': return <Appointments />
      default:             return <Dashboard onNavigate={setActivePage} />
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

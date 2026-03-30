import React, { useState } from 'react'
import { Search, Bell, Settings } from 'lucide-react'

const PAGE_LABELS = {
  dashboard:    'Dashboard',
  appointments: 'Appointments',
  patients:     'Patients',
  doctors:      'Doctors',
  departments:  'Departments',
  calendar:     'Calendar',
  inventory:    'Inventory',
  messages:     'Messages',
}

export default function Topbar({ activePage, currentUser }) {
  const [search, setSearch] = useState('')

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
      <h1 className="text-lg font-bold text-slate-800">{PAGE_LABELS[activePage] || 'Dashboard'}</h1>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search anything…"
            className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-52 transition-all"
          />
        </div>

        {/* Bell */}
        <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
        </button>

        {/* Settings */}
        <button className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <Settings size={16} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
            {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{currentUser?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400">{currentUser?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

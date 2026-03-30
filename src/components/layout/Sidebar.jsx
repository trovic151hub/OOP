import React from 'react'
import {
  LayoutDashboard, Calendar, Users, Stethoscope, Building2,
  CalendarDays, Package, MessageSquare, LogOut, Activity
} from 'lucide-react'
import { store } from '../../store/useStore'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, full: true },
  { id: 'appointments', label: 'Appointments', icon: Calendar,        full: true },
  { id: 'patients',     label: 'Patients',     icon: Users,           full: true },
  { id: 'doctors',      label: 'Doctors',      icon: Stethoscope,     full: true },
  { id: 'departments',  label: 'Departments',  icon: Building2,       full: false },
  { id: 'calendar',     label: 'Calendar',     icon: CalendarDays,    full: false },
  { id: 'inventory',    label: 'Inventory',    icon: Package,         full: false },
  { id: 'messages',     label: 'Messages',     icon: MessageSquare,   full: false },
]

export default function Sidebar({ activePage, onNavigate, currentUser }) {
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">MedCore</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Hospital System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`sidebar-link ${activePage === id ? 'active' : ''}`}
          >
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        {currentUser && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {currentUser.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.role || 'Admin'}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => store.logout()}
          className="sidebar-link text-red-400 hover:bg-red-50 hover:text-red-600 w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

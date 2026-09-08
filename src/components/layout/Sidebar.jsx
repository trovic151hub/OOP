import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard, Calendar, Users, Stethoscope, Building2,
  CalendarDays, Package, MessageSquare, LogOut, Activity,
  UserCog, ClipboardList, Clock, X, BarChart2, ChevronLeft,
  UserCircle, BedDouble, FlaskConical, UserCheck, Pill, TrendingDown,
  FileText, Shield, BarChart, FlaskRound, Settings, HeartPulse,
  BadgeDollarSign
} from 'lucide-react'
import Avatar from '../ui/Avatar'
import { store, useStore } from '../../store/useStore'

const ALL_NAV = [
  { id: 'dashboard',        label: 'Dashboard',         icon: LayoutDashboard, roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'my-profile',       label: 'My Profile',        icon: UserCircle,      roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'queue',            label: 'Waiting Room',      icon: UserCheck,       roles: ['Admin','Receptionist'] },
  { id: 'appointments',     label: 'Appointments',      icon: Calendar,        roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'reviews',          label: 'Pending Reviews',   icon: ClipboardList,   roles: ['Admin','Receptionist'] },
  { id: 'patients',         label: 'Patients',          icon: Users,           roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'prescriptions',    label: 'Prescriptions',     icon: Pill,            roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'pharmacy',         label: 'Pharmacy',          icon: FlaskRound,      roles: ['Admin','Receptionist'] },
  { id: 'documents',        label: 'Documents',         icon: FileText,        roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'doctors',          label: 'Doctors',           icon: Stethoscope,     roles: ['Admin','Receptionist'] },
  { id: 'nurses',           label: 'Nurses',            icon: HeartPulse,      roles: ['Admin','Receptionist'] },
  { id: 'departments',      label: 'Departments',       icon: Building2,       roles: ['Admin','Receptionist'] },
  { id: 'rooms',            label: 'Rooms & Beds',      icon: BedDouble,       roles: ['Admin','Receptionist'] },
  { id: 'lab-results',      label: 'Lab Results',       icon: FlaskConical,    roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'calendar',         label: 'Calendar',          icon: CalendarDays,    roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'shifts',           label: 'Shifts',            icon: Clock,           roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'inventory',        label: 'Inventory',         icon: Package,         roles: ['Admin'] },
  { id: 'billing',          label: 'Billing',           icon: BadgeDollarSign,       roles: ['Admin','Receptionist'] },
  { id: 'insurance',        label: 'Insurance & Claims',icon: Shield,          roles: ['Admin','Receptionist'] },
  { id: 'expenses',         label: 'Expenses',          icon: TrendingDown,    roles: ['Admin'] },
  { id: 'messages',         label: 'Messages',          icon: MessageSquare,   roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { id: 'staff-performance',label: 'Staff Performance', icon: BarChart,        roles: ['Admin'] },
  { id: 'users',            label: 'User Management',   icon: UserCog,         roles: ['Admin'] },
  { id: 'reports',          label: 'Reports',           icon: BarChart2,       roles: ['Admin'] },
  { id: 'auditlog',         label: 'Audit Log',         icon: ClipboardList,   roles: ['Admin'] },
  { id: 'settings',         label: 'Settings',          icon: Settings,        roles: ['Admin'] },
]

const ROLE_BADGE = {
  Admin:        'bg-teal-100 dark:bg-teal-500/18 text-teal-700',
  Doctor:       'bg-purple-100 dark:bg-purple-500/18 text-purple-700',
  Nurse:        'bg-rose-100 dark:bg-rose-500/18 text-rose-700',
  Receptionist: 'bg-blue-100 dark:bg-blue-500/18 text-blue-700',
}

export default function Sidebar({ activePage, onNavigate, currentUser, mobileOpen, onMobileClose, collapsed, onToggleCollapse }) {
  const { settings } = useStore()
  const role = currentUser?.role || 'Admin'
  const navItems = ALL_NAV.filter(item => item.roles.includes(role))
  const hospitalName = settings?.hospitalName || 'MedCore'
  // `md:hidden`/`md:` variants (rather than a plain `hidden`) so the collapsed
  // state only visually applies at desktop widths — the mobile drawer is
  // always shown at full width regardless of the collapse toggle.
  const textCls = collapsed ? 'md:hidden' : ''

  // Measure the actual rendered bottom nav (0/absent on desktop, where it's
  // display:none) instead of guessing a fixed height — a static guess is
  // always either too little (clips behind it) or too much (looks like a
  // dead gap), and this also auto-adapts to env(safe-area-inset-bottom).
  const [bottomPad, setBottomPad] = useState(16)
  useEffect(() => {
    function measure() {
      const nav = document.querySelector('nav.safe-bottom')
      const visible = nav && getComputedStyle(nav).display !== 'none'
      setBottomPad(visible ? nav.getBoundingClientRect().height + 4 : 16)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-full w-60 ${collapsed ? 'md:w-[72px]' : 'md:w-60'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-[56]
        transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {settings?.logo ? (
              <img src={settings.logo} alt="" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" onError={e => e.target.style.display = 'none'} />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
                <Activity size={16} className="text-white" />
              </div>
            )}
            <div className={`min-w-0 ${textCls}`}>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{hospitalName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wide">Hospital System</p>
            </div>
          </div>
          <button onClick={onMobileClose} className="md:hidden p-1 rounded text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain flex flex-col gap-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              className={`sidebar-link ${collapsed ? 'md:justify-center' : ''} ${activePage === id ? 'active' : ''}`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className={textCls}>{label}</span>
            </button>
          ))}
        </nav>

        <div style={{ paddingBottom: bottomPad }} className="px-3 border-t border-slate-100 dark:border-slate-800 pt-3 flex-shrink-0">
          {currentUser && (
            <div className={`flex items-center gap-2.5 px-2 py-2 mb-2 ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
              <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
              <div className={`min-w-0 ${textCls}`}>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{currentUser.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_BADGE[role] || 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                  {role}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => store.logout()}
            title={collapsed ? 'Sign Out' : undefined}
            className={`sidebar-link text-red-400 hover:bg-red-50 hover:text-red-600 w-full ${collapsed ? 'md:justify-center' : ''}`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className={textCls}>Sign Out</span>
          </button>
        </div>
      </aside>

      <button
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`hidden md:flex fixed top-[68px] z-[57] w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-400 dark:text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all duration-300 ease-in-out ${collapsed ? 'left-[60px]' : 'left-[228px]'}`}
      >
        <ChevronLeft size={13} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </>
  )
}



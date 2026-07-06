import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, Bell, Menu, X, AlertTriangle, Calendar, MessageSquare, ChevronRight, UserCheck, FlaskConical, Moon, Sun, Printer } from 'lucide-react'
import { useStore, setPendingChatTarget } from '../../store/useStore'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../ui/Avatar'
import { withDrPrefix } from '../../utils/helpers'

const PAGE_LABELS = {
  dashboard:          'Dashboard',
  appointments:       'Appointments',
  patients:           'Patients',
  doctors:            'Doctors',
  departments:        'Departments',
  calendar:           'Calendar',
  inventory:          'Inventory',
  messages:           'Messages',
  billing:            'Billing',
  shifts:             'Shifts',
  'my-profile':       'My Profile',
  rooms:              'Rooms & Beds',
  'lab-results':      'Lab Results',
  reports:            'Reports & Analytics',
  auditlog:           'Audit Log',
  users:              'User Management',
  queue:              'Waiting Room Queue',
  prescriptions:      'Prescriptions',
  expenses:           'Expense Tracking',
  documents:          'Patient Documents',
  insurance:          'Insurance & Claims',
  'staff-performance':'Staff Performance',
  pharmacy:           'Pharmacy',
  settings:           'Hospital Settings',
}

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function SearchDropdown({ results, hasResults, search, onNavigate, setSearch, setSearchOpen }) {
  if (!hasResults && search.length < 2) return null
  return (
    <>
      {hasResults && (
        <div className="absolute top-full mt-2 left-0 w-[min(320px,calc(100vw-2rem))] bg-white border border-slate-200 rounded-xl shadow-xl z-[60] overscroll-contain max-h-[calc(100vh-8rem)] overflow-y-auto">
          {results.patients.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100">Patients</div>
              {results.patients.map(p => (
                <button key={p.id} onClick={() => { onNavigate('patients'); setSearch(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left">
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.age} yrs · {p.status}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {results.doctors.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100">Doctors</div>
              {results.doctors.map(d => (
                <button key={d.id} onClick={() => { onNavigate('doctors'); setSearch(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left">
                  <Avatar name={d.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.specialty}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {results.appointments.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100">Appointments</div>
              {results.appointments.map(a => (
                <button key={a.id} onClick={() => { onNavigate('appointments'); setSearch(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={13} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-400">{a.doctorName} · {a.date}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!hasResults && search.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 w-[min(288px,calc(100vw-2rem))] bg-white border border-slate-200 rounded-xl shadow-xl z-[60] px-4 py-6 text-center text-sm text-slate-400">
          No results for "<strong>{search}</strong>"
        </div>
      )}
    </>
  )
}

export default function Topbar({ activePage, currentUser, onNavigate, onMobileMenuToggle, sidebarCollapsed }) {
  const { patients, doctors, appointments, inventory, messages, labResults } = useStore()
  const { dark, toggle: toggleDark } = useTheme()
  const [search, setSearch]               = useState('')
  const [searchOpen, setSearchOpen]       = useState(false)
  const [mobileSearch, setMobileSearch]   = useState(false)
  const [notifOpen, setNotifOpen]         = useState(false)
  const [notifRead, setNotifRead]         = useState(() => localStorage.getItem('notifReadAt') || '')
  const [notifPos, setNotifPos]           = useState(null)
  const searchRef     = useRef(null)
  const mSearchRef    = useRef(null)
  const notifRef      = useRef(null)
  const notifPanelRef  = useRef(null)
  const mobileInputRef = useRef(null)
  const debounced     = useDebounce(search)

  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (mSearchRef.current && !mSearchRef.current.contains(e.target)) setSearchOpen(false)
      const insideBell  = notifRef.current?.contains(e.target)
      const insidePanel = notifPanelRef.current?.contains(e.target)
      if (!insideBell && !insidePanel) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // The panel's own overscroll-contain stops scroll-chaining once you hit its
  // internal scroll limits, but doesn't stop the page underneath from moving
  // on the very first touch/scroll — so lock body scroll entirely while open.
  useEffect(() => {
    if (!notifOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [notifOpen])

  useEffect(() => {
    if (mobileSearch && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [mobileSearch])

  const today    = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const upcomingToday  = appointments.filter(a =>
    (a.date === today || a.date === tomorrow) && ['Scheduled', 'Checked In', 'In Progress'].includes(a.status)
  )
  function getStockStatus(qty, reorder) {
    const q = parseInt(qty) || 0; const r = parseInt(reorder) || 0
    if (q === 0) return 'Out of Stock'
    if (q <= r)  return 'Low Stock'
    return 'In Stock'
  }
  const lowStockItems  = inventory.filter(i => getStockStatus(i.quantity, i.reorderLevel) !== 'In Stock')
  const checkedInPats  = appointments.filter(a => a.status === 'Checked In' && a.date === today)
  const abnormalLabs   = labResults.filter(l => l.status === 'Abnormal')
  const recentMessages = messages.slice(-3).reverse()
  const unreadMessages  = messages.filter(m => m.senderId !== currentUser?.uid && (!notifRead || m.createdAt > notifRead))
  // These four are ongoing conditions, not discrete events — they have no
  // "read" state and stay visible until whatever they describe changes (an
  // appointment passes, stock is restocked, etc). Only messages are truly
  // dismissible, so only they drive the bell's badge count.
  const taskCount      = upcomingToday.length + lowStockItems.length + checkedInPats.length + abnormalLabs.length
  const unreadCount    = unreadMessages.length

  function markRead() {
    const now = new Date().toISOString()
    localStorage.setItem('notifReadAt', now)
    setNotifRead(now)
    setNotifOpen(v => {
      const next = !v
      // Portaled to document.body (see below) to escape the header's own
      // stacking context, so position has to be computed in viewport
      // coordinates instead of relying on `absolute` positioning.
      if (next && notifRef.current) {
        const rect = notifRef.current.getBoundingClientRect()
        const top = rect.bottom + 8
        // Measure the actual rendered bottom nav (0 on desktop, where it's
        // display:none) instead of guessing a fixed height — this also
        // automatically accounts for env(safe-area-inset-bottom) on devices
        // with a home indicator, since that's baked into its rendered size.
        const bottomNav = document.querySelector('nav.safe-bottom')
        const bottomNavHeight = bottomNav && getComputedStyle(bottomNav).display !== 'none'
          ? bottomNav.getBoundingClientRect().height
          : 0
        setNotifPos({
          top,
          right: window.innerWidth - rect.right,
          maxHeight: window.innerHeight - top - bottomNavHeight - 12,
        })
      }
      return next
    })
  }

  const searchResults = debounced.length >= 2 ? {
    patients:     patients.filter(p => p.name?.toLowerCase().includes(debounced.toLowerCase())).slice(0, 4),
    doctors:      doctors.filter(d => d.name?.toLowerCase().includes(debounced.toLowerCase()) || d.specialty?.toLowerCase().includes(debounced.toLowerCase())).slice(0, 3),
    appointments: appointments.filter(a => a.patientName?.toLowerCase().includes(debounced.toLowerCase()) || a.doctorName?.toLowerCase().includes(debounced.toLowerCase())).slice(0, 3),
  } : null

  const hasResults = searchResults && (searchResults.patients.length + searchResults.doctors.length + searchResults.appointments.length) > 0

  function closeMobileSearch() {
    setMobileSearch(false)
    setSearch('')
    setSearchOpen(false)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center z-10 px-4 md:px-6 transition-[left] duration-300 ease-in-out ${sidebarCollapsed ? 'md:left-[72px]' : 'md:left-60'}`}>

      {mobileSearch ? (
        <div ref={mSearchRef} className="flex-1 flex items-center gap-2 sm:hidden">
          <button onClick={closeMobileSearch} className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50">
            <X size={18} />
          </button>
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
            <input
              ref={mobileInputRef}
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
              placeholder="Search patients, doctors…"
              className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
            <SearchDropdown
              results={searchResults || { patients: [], doctors: [], appointments: [] }}
              hasResults={hasResults}
              search={search}
              onNavigate={id => { onNavigate(id); closeMobileSearch() }}
              setSearch={setSearch}
              setSearchOpen={setSearchOpen}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-w-0 sm:flex-none">
          <button onClick={onMobileMenuToggle} className="md:hidden w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0">
            <Menu size={18} />
          </button>
          <h1 className="text-base md:text-lg font-bold text-slate-800 truncate">{PAGE_LABELS[activePage] || 'Dashboard'}</h1>
        </div>
      )}

      <div className={`flex items-center gap-1.5 md:gap-3 ml-auto ${mobileSearch ? 'sm:flex hidden' : ''}`}>
        <div ref={searchRef} className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search anything…"
            className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-44 md:w-56 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSearchOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
          <SearchDropdown
            results={searchResults || { patients: [], doctors: [], appointments: [] }}
            hasResults={hasResults}
            search={search}
            onNavigate={onNavigate}
            setSearch={setSearch}
            setSearchOpen={setSearchOpen}
          />
        </div>

        <button
          onClick={() => setMobileSearch(true)}
          className="sm:hidden w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          title="Search"
        >
          <Search size={16} />
        </button>

        <button
          onClick={() => window.print()}
          title="Print current page"
          className="hidden sm:flex w-9 h-9 rounded-lg border border-slate-200 items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors no-print"
        >
          <Printer size={16} />
        </button>

        <button
          onClick={toggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors no-print"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={markRead}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && notifPos && createPortal(
            <div
              ref={notifPanelRef}
              style={{ top: notifPos.top, right: notifPos.right, maxHeight: notifPos.maxHeight }}
              className="fixed w-[min(320px,calc(100vw-1rem))] bg-white border border-slate-200 rounded-xl shadow-xl z-[60] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <p className="text-sm font-bold text-slate-700">Notifications</p>
                <span className="text-xs text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : taskCount > 0 ? `${taskCount} to review` : 'All caught up'}
                </span>
              </div>
              <div className="overflow-y-auto overscroll-contain">
                {upcomingToday.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50">Upcoming Appointments</div>
                    {upcomingToday.slice(0, 4).map(a => (
                      <div key={a.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => { onNavigate('calendar'); setNotifOpen(false) }}>
                        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Calendar size={13} className="text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{a.patientName}</p>
                          <p className="text-xs text-slate-400 truncate">{withDrPrefix(a.doctorName)} · {a.date === today ? 'Today' : 'Tomorrow'} {a.timeStart ? `at ${a.timeStart}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {checkedInPats.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[10px] font-bold text-violet-400 uppercase tracking-wide bg-violet-50">Patients Checked In — Waiting</div>
                    {checkedInPats.slice(0, 4).map(a => (
                      <div key={a.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => { onNavigate('queue'); setNotifOpen(false) }}>
                        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <UserCheck size={13} className="text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{a.patientName}</p>
                          <p className="text-xs text-violet-600">Checked in · Waiting for {a.doctorName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {abnormalLabs.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[10px] font-bold text-red-400 uppercase tracking-wide bg-red-50">Abnormal Lab Results</div>
                    {abnormalLabs.slice(0, 3).map(l => (
                      <div key={l.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => { onNavigate('lab-results'); setNotifOpen(false) }}>
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FlaskConical size={13} className="text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{l.patientName}</p>
                          <p className="text-xs text-red-500">{l.testName} — Abnormal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {lowStockItems.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50">Inventory Alerts</div>
                    {lowStockItems.slice(0, 3).map(i => (
                      <div key={i.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => { onNavigate('inventory'); setNotifOpen(false) }}>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle size={13} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{i.name}</p>
                          <p className="text-xs text-amber-600">{parseInt(i.quantity) === 0 ? 'Out of stock' : `Only ${i.quantity} ${i.unit} left`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {recentMessages.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50">Recent Messages</div>
                    {recentMessages.map(m => {
                      const chatPartner = m.recipientId ? (m.senderId === currentUser?.uid ? m.recipientId : m.senderId) : null
                      return (
                        <div key={m.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => { setPendingChatTarget(chatPartner); onNavigate('messages'); setNotifOpen(false) }}>
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MessageSquare size={13} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700">{m.senderName}{chatPartner ? ' (private)' : ''}</p>
                            <p className="text-xs text-slate-400 truncate">{m.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {taskCount === 0 && recentMessages.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    <Bell size={24} className="text-slate-200 mx-auto mb-2" />
                    All caught up!
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>

        <div className="flex items-center gap-2 ml-1">
          <Avatar name={currentUser?.name} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{currentUser?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400">{currentUser?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, Menu, X, Calendar, ChevronRight, Moon, Sun, Printer, RefreshCw } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { getReadMap, isMessageUnread, onMessageRead } from '../../utils/messageReadState'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../ui/Avatar'

const PAGE_LABELS = {
  dashboard:          'Dashboard',
  appointments:       'Appointments',
  reviews:            'Pending Reviews',
  patients:           'Patients',
  doctors:            'Doctors',
  departments:        'Departments',
  calendar:           'Calendar',
  inventory:          'Inventory',
  messages:           'Messages',
  notifications:      'Notifications',
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
        <div className="absolute top-full mt-2 left-0 w-[min(320px,calc(100vw-2rem))] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[60] overscroll-contain max-h-[calc(100vh-8rem)] overflow-y-auto">
          {results.patients.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wide bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">Patients</div>
              {results.patients.map(p => (
                <button key={p.id} onClick={() => { onNavigate('patients'); setSearch(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{p.age} yrs · {p.status}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {results.doctors.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wide bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">Doctors</div>
              {results.doctors.map(d => (
                <button key={d.id} onClick={() => { onNavigate('doctors'); setSearch(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <Avatar name={d.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{d.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{d.specialty}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {results.appointments.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wide bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">Appointments</div>
              {results.appointments.map(a => (
                <button key={a.id} onClick={() => { onNavigate('appointments'); setSearch(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center flex-shrink-0">
                    <Calendar size={13} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{a.doctorName} · {a.date}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!hasResults && search.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 w-[min(288px,calc(100vw-2rem))] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[60] px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-600">
          No results for "<strong>{search}</strong>"
        </div>
      )}
    </>
  )
}

export default function Topbar({ activePage, currentUser, onNavigate, onMobileMenuToggle, sidebarCollapsed }) {
  const { patients, doctors, appointments, messages, notifications, syncing } = useStore()
  const { dark, toggle: toggleDark } = useTheme()
  const [search, setSearch]               = useState('')
  const [searchOpen, setSearchOpen]       = useState(false)
  const [mobileSearch, setMobileSearch]   = useState(false)
  const [readMap, setReadMap]             = useState(() => getReadMap())
  const searchRef     = useRef(null)
  const mSearchRef    = useRef(null)
  const mobileInputRef = useRef(null)
  const debounced     = useDebounce(search)

  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (mSearchRef.current && !mSearchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // The panel's own overscroll-contain stops scroll-chaining once you hit its
  // internal scroll limits, but doesn't stop the page underneath from moving
  // on the very first touch/scroll — so lock body scroll entirely while open.
  useEffect(() => {
    if (mobileSearch && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [mobileSearch])

  // Read state is tracked per-conversation (see utils/messageReadState) and
  // written by the Messages page as the user selects each chat. Re-sync our
  // own copy whenever we navigate to/from Messages or open the bell (belt
  // and suspenders), and — the part that makes the badge update live while
  // the user is clicking between chats on the Messages page — whenever a
  // read-state change happens anywhere, via a small custom event, since this
  // is a plain localStorage read/write, not a shared reactive store.
  useEffect(() => {
    setReadMap(getReadMap())
  }, [activePage])

  useEffect(() => onMessageRead(() => setReadMap(getReadMap())), [])

  const unreadMessages  = messages.filter(m => isMessageUnread(m, currentUser?.uid, readMap))
  const unreadNotificationCount = notifications.filter(n => !n.read).length
  const unreadCount    = unreadNotificationCount || unreadMessages.length


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
    <header className={`fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center z-10 px-4 md:px-6 transition-[left] duration-300 ease-in-out ${sidebarCollapsed ? 'md:left-[72px]' : 'md:left-60'}`}>

      {mobileSearch ? (
        <div ref={mSearchRef} className="flex-1 flex items-center gap-2 sm:hidden">
          <button onClick={closeMobileSearch} className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none z-10" />
            <input
              ref={mobileInputRef}
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
              placeholder="Search patients, doctors…"
              className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
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
          <button onClick={onMobileMenuToggle} className="md:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0">
            <Menu size={18} />
          </button>
          <h1 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 truncate">{PAGE_LABELS[activePage] || 'Dashboard'}</h1>
        </div>
      )}

      <div className={`flex items-center gap-1.5 md:gap-3 ml-auto ${mobileSearch ? 'sm:flex hidden' : ''}`}>
        {syncing && (
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-teal-100 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/12 px-3 py-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-400">
            <RefreshCw size={12} className="animate-spin" />
            Syncing
          </div>
        )}

        <div ref={searchRef} className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search anything…"
            className="pl-8 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-44 md:w-56 transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSearchOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
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
          className="sm:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Search"
        >
          <Search size={16} />
        </button>

        <button
          onClick={() => window.print()}
          title="Print current page"
          className="hidden sm:flex w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors no-print"
        >
          <Printer size={16} />
        </button>

        <button
          onClick={toggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors no-print"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          title="Notifications"
          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors relative ${
            activePage === 'notifications'
              ? 'border-teal-200 dark:border-teal-500/40 bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 ml-1">
          <Avatar name={currentUser?.name} src={currentUser?.avatar} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">{currentUser?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400 dark:text-slate-600">{currentUser?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

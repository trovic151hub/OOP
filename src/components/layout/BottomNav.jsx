import React from 'react'
import { LayoutDashboard, Calendar, Users, MessageSquare, MoreHorizontal, Menu } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard',    label: 'Home',     icon: LayoutDashboard },
  { key: 'appointments', label: 'Appts',    icon: Calendar },
  { key: 'patients',     label: 'Patients', icon: Users },
  { key: 'messages',     label: 'Chat',     icon: MessageSquare },
]

export default function BottomNav({ currentPage, onNavigate, onMenuOpen }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-center md:hidden safe-bottom">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const active = currentPage === key
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors min-h-[56px] touch-manipulation
              ${active ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className={`text-[10px] font-semibold ${active ? 'text-teal-600' : ''}`}>{label}</span>
            {active && <span className="absolute bottom-0 w-8 h-0.5 bg-teal-500 rounded-full" />}
          </button>
        )
      })}
      <button
        onClick={onMenuOpen}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-slate-400 hover:text-slate-600 min-h-[56px] touch-manipulation">
        <Menu size={20} strokeWidth={1.8} />
        <span className="text-[10px] font-semibold">Menu</span>
      </button>
    </nav>
  )
}

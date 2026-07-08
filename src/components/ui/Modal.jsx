import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, icon: Icon, accentColor = 'teal', children, maxWidth = 'max-w-lg', fullScreenOnMobile = true }) {
  useEffect(() => {
    if (!open) return
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const accent = {
    teal:   'from-teal-500 to-teal-600',
    purple: 'from-purple-500 to-purple-600',
    blue:   'from-blue-500 to-blue-600',
    red:    'from-red-500 to-red-600',
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/40 ${fullScreenOnMobile ? 'md:backdrop-blur-sm p-0 md:p-4' : 'backdrop-blur-sm p-4'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Full-screen takeover on mobile (matches the doctor-profile Drawer's
          mobile behavior) — bottom nav sits underneath, hidden by this opaque
          panel, so there's no clearance math needed like the old bottom-sheet
          version required. Desktop reverts to a capped, centered dialog since
          the bottom nav is md:hidden anyway. Small/quick dialogs (delete
          confirmations) opt out via fullScreenOnMobile=false and just stay a
          compact centered popup at every size. */}
      <div className={`
        bg-white dark:bg-slate-800 overflow-hidden shadow-2xl flex flex-col
        ${fullScreenOnMobile
          ? `w-full h-full md:h-auto md:max-h-[90vh] md:w-auto md:${maxWidth} md:rounded-2xl`
          : `w-full ${maxWidth} max-h-[90vh] rounded-2xl`}
      `}>
        <div className={`h-1 bg-gradient-to-r ${accent[accentColor] || accent.teal} flex-shrink-0`} />
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center text-teal-600 flex-shrink-0">
                <Icon size={18} />
              </div>
            )}
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 -mr-1">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

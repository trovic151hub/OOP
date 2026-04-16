import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, icon: Icon, accentColor = 'teal', children, maxWidth = 'max-w-lg' }) {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`
        bg-white w-full sm:${maxWidth} overflow-hidden
        rounded-t-2xl sm:rounded-2xl shadow-2xl
        max-h-[92dvh] sm:max-h-[90vh] flex flex-col
      `}>
        <div className={`h-1 bg-gradient-to-r ${accent[accentColor] || accent.teal} flex-shrink-0`} />
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                <Icon size={18} />
              </div>
            )}
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100 -mr-1">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-3xl', footer }) {
  useEffect(() => {
    if (!open) return
    const esc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full ${width} w-full bg-white shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600 flex-shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}

export function DrawerTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0 border-b border-slate-200 px-6 bg-white flex-shrink-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
            ${active === tab.id
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${active === tab.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

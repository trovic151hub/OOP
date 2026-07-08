import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Compact "chip" dropdown for toolbar filters — turns teal when a non-default
// value is active, so it doubles as a visible "this filter is applied" indicator.
export default function FilterDropdown({ icon: Icon, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)
  const isDefault = value === options[0]?.value

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-lg border transition-colors ${
          open ? 'border-teal-400 ring-2 ring-teal-100' : isDefault ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300' : 'bg-teal-50 dark:bg-teal-500/12 border-teal-300 text-teal-700'
        }`}
      >
        <Icon size={13} className={isDefault ? 'text-slate-400 dark:text-slate-600' : 'text-teal-500'} />
        {current?.label}
        <ChevronDown size={13} className={`text-slate-400 dark:text-slate-600 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-[100] overflow-hidden min-w-40 py-1">
            {options.map(o => (
              <button
                type="button"
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors ${
                  value === o.value ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

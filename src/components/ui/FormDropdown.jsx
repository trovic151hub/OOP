import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Full-width custom dropdown for form fields — same floating-panel pattern as
// the page-level FilterDropdown, but styled to match .input-field instead of
// a compact filter chip.
export default function FormDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)
  // Real data sometimes carries a value that isn't in the fixed options list
  // (e.g. legacy or seeded values) — show it as-is instead of silently
  // blanking it out, and surface it in the list so it stays visible.
  const allOptions = current ? options : value ? [{ value, label: value }, ...options] : options

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`input-field w-full flex items-center justify-between text-left cursor-pointer transition-colors ${open ? 'border-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.15)]' : ''}`}
      >
        <span className="text-slate-700">{current?.label || value}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-150 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden py-1 max-h-56 overflow-y-auto">
            {allOptions.map(o => (
              <button
                type="button"
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${value === o.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
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

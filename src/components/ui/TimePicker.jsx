import { useState } from 'react'
import { Clock } from 'lucide-react'

function formatTimeLabel(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function TimePicker({ value, onChange, min, max, placeholder = 'Select time' }) {
  const [open, setOpen] = useState(false)
  const [sh, sm] = (min || '00:00').split(':').map(Number)
  const [eh, em] = (max || '23:45').split(':').map(Number)
  const slots = []
  for (let mins = sh * 60 + sm; mins <= eh * 60 + em; mins += 15) {
    slots.push(`${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`)
  }

  return (
    <div className="relative">
      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none z-10" />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{ paddingLeft: '2rem' }}
        className={`input-field w-full flex items-center text-left cursor-pointer transition-colors ${open ? 'border-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.15)]' : ''}`}
      >
        <span className={value ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}>{value ? formatTimeLabel(value) : placeholder}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-[100] overflow-y-auto max-h-56 py-1">
            {slots.map(s => (
              <button
                type="button"
                key={s}
                onClick={() => { onChange(s); setOpen(false) }}
                className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${value === s ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {formatTimeLabel(s)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

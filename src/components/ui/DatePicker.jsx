import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DatePicker({ value, onChange, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => value ? new Date(`${value}T00:00:00`) : new Date())
  const todayStr = new Date().toISOString().slice(0, 10)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(startWeekday).fill(null), ...Array(daysInMonth).keys()].map((d, i) => (d === null ? null : d + 1))

  function selectDay(d) {
    onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    setOpen(false)
  }

  function fmtLabel(v) {
    return new Date(`${v}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="relative">
      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none z-10" />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{ paddingLeft: '2rem' }}
        className={`input-field w-full flex items-center text-left cursor-pointer transition-colors ${open ? 'border-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.15)]' : ''}`}
      >
        <span className={value ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}>{value ? fmtLabel(value) : placeholder}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-[100] p-3 w-72">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (d === null) return <div key={i} />
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                const isToday = dateStr === todayStr
                const isSelected = dateStr === value
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => selectDay(d)}
                    className={`text-xs font-semibold rounded-lg py-1.5 transition-colors ${
                      isSelected ? 'bg-teal-600 text-white' : isToday ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const STATUS_DOT = {
  Scheduled: 'bg-teal-500',
  Ongoing:   'bg-blue-500',
  Completed: 'bg-emerald-500',
  Cancelled: 'bg-red-400',
}

export default function CalendarPage({ onNavigate }) {
  const { appointments } = useStore()
  const [current, setCurrent]   = useState(new Date())
  const [selected, setSelected] = useState(null)

  const year  = current.getFullYear()
  const month = current.getMonth()

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, month: month - 1, year: month === 0 ? year - 1 : year, current: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, month, year, current: true })
  }
  const remain = 42 - cells.length
  for (let i = 1; i <= remain; i++) {
    cells.push({ day: i, month: month + 1, year: month === 11 ? year + 1 : year, current: false })
  }

  function dateStr(cell) {
    const m = ((cell.month % 12) + 12) % 12
    const y = cell.year + Math.floor(cell.month / 12)
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
  }

  const byDate = {}
  appointments.forEach(a => {
    if (a.date) {
      if (!byDate[a.date]) byDate[a.date] = []
      byDate[a.date].push(a)
    }
  })

  const todayStr = new Date().toISOString().slice(0, 10)

  const selectedStr  = selected ? dateStr(selected) : null
  const selectedAppts = selectedStr ? (byDate[selectedStr] || []) : []

  const selLabel = selected
    ? `${selected.day} ${MONTHS[((selected.month % 12) + 12) % 12]} ${selected.year + Math.floor(selected.month / 12)}`
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
          <p className="text-sm text-slate-400">Visual overview of appointment schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="btn-ghost p-2">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-slate-700 w-36 text-center">{MONTHS[month]} {year}</span>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="btn-ghost p-2">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCurrent(new Date())} className="btn-ghost text-xs px-3 py-1.5">Today</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-4">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const ds      = dateStr(cell)
              const dayAppts = byDate[ds] || []
              const isToday  = ds === todayStr
              const isSel    = selected && dateStr(selected) === ds
              return (
                <button
                  key={i}
                  onClick={() => setSelected(cell)}
                  className={`min-h-16 p-1.5 rounded-xl flex flex-col gap-1 text-left transition-all
                    ${!cell.current ? 'opacity-30' : ''}
                    ${isToday ? 'bg-teal-600 text-white' : isSel ? 'bg-teal-50 border-2 border-teal-400' : 'hover:bg-slate-50 border border-transparent'}
                  `}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-white' : isSel ? 'text-teal-700' : 'text-slate-600'}`}>
                    {cell.day}
                  </span>
                  {dayAppts.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {dayAppts.slice(0, 3).map((a, j) => (
                        <span key={j} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white/80' : STATUS_DOT[a.status] || 'bg-slate-300'}`} />
                      ))}
                      {dayAppts.length > 3 && (
                        <span className={`text-[9px] font-bold ${isToday ? 'text-white/80' : 'text-slate-400'}`}>+{dayAppts.length - 3}</span>
                      )}
                    </div>
                  )}
                  {dayAppts.length > 0 && (
                    <span className={`text-[9px] font-semibold leading-tight ${isToday ? 'text-white/80' : 'text-teal-600'}`}>
                      {dayAppts.length} appt{dayAppts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
            {Object.entries(STATUS_DOT).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${cls}`} />
                {status}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
              <CalendarDays size={36} className="text-slate-200 mb-3" />
              <p className="text-sm font-medium">Select a day</p>
              <p className="text-xs mt-1">Click any date to see its appointments</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{selLabel}</h3>
                  <p className="text-xs text-slate-400">{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => onNavigate('appointments')} className="btn-primary text-xs py-1.5 px-3">
                  <Plus size={13} /> Schedule
                </button>
              </div>

              {selectedAppts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CalendarDays size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No appointments this day</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedAppts.map(a => (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Avatar name={a.patientName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{a.patientName}</p>
                        <p className="text-xs text-slate-500 truncate">{a.doctorName}</p>
                        <p className="text-xs text-slate-400">
                          {a.type} {a.timeStart ? `· ${a.timeStart}${a.timeEnd ? ` – ${a.timeEnd}` : ''}` : ''}
                        </p>
                      </div>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {[
          { label: 'This Month', value: appointments.filter(a => a.date?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length, color: 'text-teal-600' },
          { label: 'Scheduled',  value: appointments.filter(a => a.status === 'Scheduled').length,  color: 'text-teal-600'   },
          { label: 'Completed',  value: appointments.filter(a => a.status === 'Completed').length,  color: 'text-emerald-600'},
          { label: 'Cancelled',  value: appointments.filter(a => a.status === 'Cancelled').length,  color: 'text-red-500'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

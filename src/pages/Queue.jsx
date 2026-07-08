import React, { useState, useEffect } from 'react'
import { Clock, UserCheck, PlayCircle, CheckCheck, RefreshCw, Stethoscope } from 'lucide-react'
import { useStore, store, refetchCollection } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'

function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}

function waitLabel(checkedInAt, now) {
  if (!checkedInAt) return '—'
  const mins = Math.floor((now - new Date(checkedInAt).getTime()) / 60000)
  if (mins < 1) return 'Just arrived'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function waitColor(checkedInAt, now) {
  if (!checkedInAt) return 'text-slate-400 dark:text-slate-600'
  const mins = Math.floor((now - new Date(checkedInAt).getTime()) / 60000)
  if (mins < 15) return 'text-emerald-600'
  if (mins < 30) return 'text-amber-600'
  return 'text-red-600'
}

const STATUS_META = {
  'Checked In':  { label: 'Start Consultation', icon: PlayCircle, next: 'In Progress', color: 'bg-blue-50 dark:bg-blue-500/12 text-blue-600 hover:bg-blue-100 border-blue-200 dark:border-blue-500/30' },
  'In Progress': { label: 'Complete',            icon: CheckCheck, next: 'Completed',   color: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-600 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-500/30' },
}

export default function Queue({ currentUser }) {
  const { appointments, doctors } = useStore()
  const showToast = useToast()
  const now = useNow()

  useEffect(() => {
    const id = setInterval(() => refetchCollection('appointments'), 15000)
    return () => clearInterval(id)
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const isDoctor = currentUser?.role === 'Doctor'
  const linkedDoc = isDoctor ? doctors.find(d => d.uid === currentUser?.uid) : null

  const queue = appointments
    .filter(a => {
      const matchDate = a.date === today
      const matchStatus = a.status === 'Checked In' || a.status === 'In Progress'
      const matchDoctor = !isDoctor || !linkedDoc || a.doctorName === linkedDoc.name
      return matchDate && matchStatus && matchDoctor
    })
    .sort((a, b) => {
      if (a.status === 'In Progress' && b.status !== 'In Progress') return -1
      if (b.status === 'In Progress' && a.status !== 'In Progress') return 1
      const tA = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0
      const tB = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0
      return tA - tB
    })

  const scheduled = appointments.filter(a => a.date === today && a.status === 'Scheduled')
  const completed = appointments.filter(a => a.date === today && a.status === 'Completed').length

  function advance(a) {
    const meta = STATUS_META[a.status]
    if (!meta) return
    const extra = meta.next === 'In Progress' ? { startedAt: new Date().toISOString() } : {}
    store.updateAppointment(a.id, { status: meta.next, ...extra })
    showToast(`${a.patientName} → ${meta.next}`, 'info')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Waiting Room Queue</h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Real-time patient flow for today</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-slate-400 dark:text-slate-600 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-xs text-slate-400 dark:text-slate-600">Live updates</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Waiting',     value: queue.filter(a => a.status === 'Checked In').length,  text: 'text-violet-600',  border: 'border-violet-200 dark:border-violet-500/30' },
          { label: 'In Progress', value: queue.filter(a => a.status === 'In Progress').length, text: 'text-blue-600',    border: 'border-blue-200 dark:border-blue-500/30' },
          { label: 'Scheduled',   value: scheduled.length,                                      text: 'text-teal-600',   border: 'border-teal-200 dark:border-teal-500/30' },
          { label: 'Completed',   value: completed,                                             text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-500/30' },
        ].map(({ label, value, text, border }) => (
            <div key={label} className={`card p-4 border ${border}`}>
              <p className="text-xs text-slate-400 dark:text-slate-600 font-semibold mb-1">{label}</p>
              <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
            </div>
        ))}
      </div>

      {queue.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
          <UserCheck size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-semibold">Queue is empty</p>
          <p className="text-xs mt-1 text-slate-300 dark:text-slate-700">No patients checked in right now</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((a, idx) => {
            const meta = STATUS_META[a.status]
            const ActionIcon = meta?.icon
            const wait = waitLabel(a.checkedInAt, now)
            const wColor = waitColor(a.checkedInAt, now)
            const isInProgress = a.status === 'In Progress'
            return (
              <div key={a.id}
                className={`card p-4 sm:p-5 transition-all ${isInProgress ? 'border-blue-300 shadow-blue-50 shadow-md' : ''}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-extrabold text-slate-500">
                    {idx + 1}
                  </div>
                  <Avatar name={a.patientName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate">{a.patientName}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-slate-400 dark:text-slate-600 flex items-center gap-1">
                        <Stethoscope size={11} /> {a.doctorName}
                      </span>
                      <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-600">{a.type}</span>
                      {a.timeStart && <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-600">Appt: {a.timeStart}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:block text-center flex-shrink-0">
                    <p className={`text-sm font-extrabold ${wColor}`}>{wait}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600">Waiting</p>
                  </div>
                  <Badge status={a.status} />
                  {meta && (
                    <button
                      onClick={() => advance(a)}
                      className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors flex-shrink-0 ${meta.color}`}
                    >
                      <ActionIcon size={13} /> {meta.label}
                    </button>
                  )}
                </div>
                {meta && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 sm:hidden">
                    <span className={`text-xs font-bold ${wColor}`}>{wait} waiting</span>
                    <button
                      onClick={() => advance(a)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${meta.color}`}
                    >
                      <ActionIcon size={13} /> {meta.label}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {scheduled.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wide mb-3">Upcoming Today (Not Yet Checked In)</p>
          <div className="flex flex-col gap-2">
            {scheduled.slice(0, 6).map(a => (
              <div key={a.id} className="card px-4 py-3 flex items-center gap-3 opacity-70">
                <Avatar name={a.patientName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{a.patientName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600">{a.doctorName} · {a.timeStart || 'No time set'}</p>
                </div>
                <Badge status="Scheduled" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

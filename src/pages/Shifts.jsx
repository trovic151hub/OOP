import React, { useState } from 'react'
import { Plus, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHIFT_TYPES = ['Morning', 'Afternoon', 'Night']

const SHIFT_COLORS = {
  Morning:   { bg: 'bg-amber-50 border border-amber-200',  text: 'text-amber-800',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400', label: '06:00 – 14:00' },
  Afternoon: { bg: 'bg-blue-50 border border-blue-200',    text: 'text-blue-800',   badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400',  label: '14:00 – 22:00' },
  Night:     { bg: 'bg-purple-50 border border-purple-200',text: 'text-purple-800', badge: 'bg-purple-100 text-purple-700',dot: 'bg-purple-400',label: '22:00 – 06:00' },
}

function getWeekStart(offset = 0) {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  return new Date(d.setDate(diff))
}

export default function Shifts({ currentUser }) {
  const { shifts, doctors, loading } = useStore()
  const showToast = useToast()
  const [weekOffset, setWeekOffset] = useState(0)
  const [addMode, setAddMode]       = useState(null) // { day, shiftType }
  const [selectedDoctor, setSelectedDoctor] = useState('')

  const isAdmin = currentUser?.role === 'Admin'

  const weekStart = getWeekStart(weekOffset)
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const weekKey = weekDates[0].toISOString().slice(0, 10)
  const weekShifts = shifts.filter(s => s.weekStart === weekKey)

  function getShiftDoctors(day, shiftType) {
    return weekShifts.filter(s => s.day === day && s.shiftType === shiftType)
  }

  async function addShift() {
    if (!addMode || !selectedDoctor) { showToast('Select a doctor.', 'error'); return }
    const doc = doctors.find(d => d.name === selectedDoctor)
    const existing = weekShifts.find(s => s.day === addMode.day && s.shiftType === addMode.shiftType && s.doctorName === selectedDoctor)
    if (existing) { showToast('Doctor already assigned to this shift.', 'error'); return }
    await store.addShift({
      day:        addMode.day,
      shiftType:  addMode.shiftType,
      doctorId:   doc?.id || '',
      doctorName: selectedDoctor,
      weekStart:  weekKey,
    })
    showToast('Shift assigned.')
    setAddMode(null)
    setSelectedDoctor('')
  }

  const totalShifts = weekShifts.length
  const shiftedDoctors = [...new Set(weekShifts.map(s => s.doctorName))].length

  if (loading) return <SkeletonTable rows={4} cols={5} />

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Shift Schedule</h2>
          <p className="text-sm text-slate-400 mt-0.5">{totalShifts} shifts · {shiftedDoctors} doctors scheduled this week</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(v => v - 1)} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
          <span className="text-sm font-bold text-slate-700 min-w-44 text-center">{weekLabel}</span>
          <button onClick={() => setWeekOffset(v => v + 1)} className="btn-ghost p-2"><ChevronRight size={16} /></button>
          <button onClick={() => setWeekOffset(0)} className="btn-ghost text-xs px-3 py-1.5">This Week</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Morning Shifts',   value: weekShifts.filter(s => s.shiftType === 'Morning').length,   color: 'text-amber-600' },
          { label: 'Afternoon Shifts', value: weekShifts.filter(s => s.shiftType === 'Afternoon').length, color: 'text-blue-600'  },
          { label: 'Night Shifts',     value: weekShifts.filter(s => s.shiftType === 'Night').length,     color: 'text-purple-600'},
          { label: 'Doctors Assigned', value: shiftedDoctors, color: 'text-teal-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4">
        {SHIFT_TYPES.map(type => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${SHIFT_COLORS[type].dot}`} />
            <span className="font-semibold">{type}</span>
            <span className="text-slate-400">{SHIFT_COLORS[type].label}</span>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th w-28">Shift</th>
                {DAYS.map((day, i) => (
                  <th key={day} className="table-th text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400">{day.slice(0, 3).toUpperCase()}</span>
                      <span className={`text-sm font-bold mt-0.5 ${weekDates[i].toDateString() === new Date().toDateString() ? 'text-teal-600' : 'text-slate-700'}`}>
                        {weekDates[i].getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFT_TYPES.map(shiftType => {
                const c = SHIFT_COLORS[shiftType]
                return (
                  <tr key={shiftType} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{shiftType}</p>
                          <p className="text-[10px] text-slate-400">{c.label}</p>
                        </div>
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const cellShifts = getShiftDoctors(day, shiftType)
                      const isSelected = addMode?.day === day && addMode?.shiftType === shiftType
                      return (
                        <td key={day} className="px-2 py-2 align-top border-l border-slate-100">
                          <div className={`min-h-16 rounded-xl p-1.5 flex flex-col gap-1 ${cellShifts.length > 0 ? c.bg : 'bg-transparent'}`}>
                            {cellShifts.map(s => (
                              <div key={s.id} className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Avatar name={s.doctorName} size="xs" />
                                  <span className={`text-[10px] font-semibold truncate ${c.text}`}>{s.doctorName?.split(' ').pop()}</span>
                                </div>
                                {isAdmin && (
                                  <button onClick={() => { store.deleteShift(s.id); showToast('Shift removed.', 'info') }} className="p-0.5 rounded text-slate-300 hover:text-red-400 flex-shrink-0">
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {isAdmin && (
                              isSelected ? (
                                <div className="flex flex-col gap-1 mt-1">
                                  <select className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-700 w-full" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                                    <option value="">Select doctor…</option>
                                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                  </select>
                                  <div className="flex gap-1">
                                    <button onClick={addShift} className="flex-1 text-[10px] bg-teal-600 text-white rounded px-1 py-0.5 font-bold">Add</button>
                                    <button onClick={() => { setAddMode(null); setSelectedDoctor('') }} className="flex-1 text-[10px] bg-slate-100 text-slate-500 rounded px-1 py-0.5">×</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => { setAddMode({ day, shiftType }); setSelectedDoctor('') }}
                                  className="text-[10px] text-slate-400 hover:text-teal-600 flex items-center gap-0.5 mt-1 transition-colors">
                                  <Plus size={10} /> Add
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

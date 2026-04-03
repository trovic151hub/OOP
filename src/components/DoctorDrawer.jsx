import React, { useState } from 'react'
import { Phone, Mail, Building2, Award, Clock, Calendar, Pencil, Stethoscope } from 'lucide-react'
import Drawer, { DrawerTabs } from './ui/Drawer'
import Badge from './ui/Badge'
import Avatar from './ui/Avatar'
import { useStore } from '../store/useStore'
import { formatDate } from '../utils/helpers'

export default function DoctorDrawer({ doctor, onClose, currentUser, onEdit }) {
  const { appointments, shifts } = useStore()
  const [tab, setTab] = useState('overview')

  if (!doctor) return null

  const docAppts  = appointments.filter(a => a.doctorName === doctor.name)
  const docShifts = shifts.filter(s => s.doctorId === doctor.id || s.doctorName === doctor.name)
  const upcoming  = docAppts.filter(a => a.status === 'Scheduled' || a.status === 'Ongoing')
  const completed = docAppts.filter(a => a.status === 'Completed').length

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const SHIFT_TYPES = ['Morning', 'Afternoon', 'Night']

  const SHIFT_COLORS = {
    Morning:   'bg-amber-50 text-amber-700 border border-amber-200',
    Afternoon: 'bg-blue-50 text-blue-700 border border-blue-200',
    Night:     'bg-purple-50 text-purple-700 border border-purple-200',
  }

  const tabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'appointments', label: 'Appointments', count: docAppts.length },
    { id: 'schedule',     label: 'Schedule', count: docShifts.length },
  ]

  return (
    <Drawer
      open={!!doctor}
      onClose={onClose}
      title={doctor.name}
      subtitle={`${doctor.specialty}${doctor.department ? ' · ' + doctor.department : ''}`}
    >
      <div className="flex flex-col h-full">
        <DrawerTabs tabs={tabs} active={tab} onChange={setTab} />

        <div className="flex-1 overflow-y-auto">
          {tab === 'overview' && (
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start gap-5">
                <Avatar name={doctor.name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{doctor.name}</h3>
                      <p className="text-sm text-teal-600 font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={doctor.availability || 'Available'} />
                      {currentUser?.role === 'Admin' && (
                        <button onClick={() => onEdit(doctor)} className="btn-ghost text-xs py-1 px-2">
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {[
                      { icon: Building2, label: 'Department', val: doctor.department || '—' },
                      { icon: Award, label: 'Experience', val: doctor.experience || '—' },
                      { icon: Phone, label: 'Phone', val: doctor.phone || '—' },
                      { icon: Mail, label: 'Email', val: doctor.email || '—' },
                      { icon: Clock, label: 'Schedule', val: doctor.schedule || '—' },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <Icon size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-400 text-xs">{label}:</span>
                        <span className="text-slate-700 font-medium text-xs truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {doctor.about && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">About</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{doctor.about}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Appts', value: docAppts.length, color: 'text-teal-600' },
                  { label: 'Upcoming', value: upcoming.length, color: 'text-blue-600' },
                  { label: 'Completed', value: completed, color: 'text-emerald-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'appointments' && (
            <div className="p-6 flex flex-col gap-3">
              {docAppts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No appointments yet</p>
                </div>
              ) : docAppts.map(a => (
                <div key={a.id} className="card p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={15} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 text-sm">{a.patientName}</p>
                      <Badge status={a.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{a.type || 'Consultation'}</p>
                    <p className="text-xs text-slate-400">{formatDate(a.date)} {a.timeStart ? `· ${a.timeStart}` : ''}</p>
                    {a.notes && <p className="text-xs text-slate-400 mt-1 italic">"{a.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'schedule' && (
            <div className="p-6">
              {docShifts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No shifts assigned yet</p>
                  <p className="text-xs mt-1">Go to Shifts page to manage schedules</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Assigned Shifts</p>
                  {DAYS.map(day => {
                    const dayShifts = docShifts.filter(s => s.day === day)
                    if (dayShifts.length === 0) return null
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0">{day}</span>
                        <div className="flex gap-1 flex-wrap">
                          {dayShifts.map(s => (
                            <span key={s.id} className={`text-xs font-semibold px-2 py-1 rounded-lg ${SHIFT_COLORS[s.shiftType] || 'bg-slate-100 text-slate-600'}`}>
                              {s.shiftType} {s.startTime && s.endTime ? `(${s.startTime} – ${s.endTime})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}

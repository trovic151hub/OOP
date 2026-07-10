import React, { useState } from 'react'
import { Phone, Mail, Building2, Award, Clock, Pencil } from 'lucide-react'
import Drawer, { DrawerTabs } from './ui/Drawer'
import Badge from './ui/Badge'
import PassportPhoto from './ui/PassportPhoto'
import { useStore } from '../store/useStore'

export default function NurseDrawer({ nurse, onClose, currentUser, onEdit }) {
  const { users, shifts } = useStore()
  const [tab, setTab] = useState('overview')

  if (!nurse) return null

  const linkedUser = nurse.uid ? users.find(u => u.uid === nurse.uid) : null
  const nurseShifts = shifts.filter(s => s.nurseId === nurse.id || s.nurseName === nurse.name)

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const SHIFT_COLORS = {
    Morning:   'bg-amber-50 dark:bg-amber-500/12 text-amber-700 border border-amber-200 dark:border-amber-500/30',
    Afternoon: 'bg-blue-50 dark:bg-blue-500/12 text-blue-700 border border-blue-200 dark:border-blue-500/30',
    Night:     'bg-purple-50 dark:bg-purple-500/12 text-purple-700 border border-purple-200',
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'schedule', label: 'Schedule', count: nurseShifts.length },
  ]

  return (
    <Drawer
      open={!!nurse}
      onClose={onClose}
      title={nurse.name}
      subtitle={`${nurse.specialty}${nurse.department ? ' · ' + nurse.department : ''}`}
    >
      <div className="flex flex-col h-full">
        <DrawerTabs tabs={tabs} active={tab} onChange={setTab} />

        <div className="flex-1 overflow-y-auto">
          {tab === 'overview' && (
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start gap-5">
                <PassportPhoto src={nurse.photo || linkedUser?.avatar} name={nurse.name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{nurse.name}</h3>
                      <p className="text-sm text-teal-600 font-medium">{nurse.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={nurse.availability || 'Available'} />
                      {currentUser?.role === 'Admin' && (
                        <button onClick={() => onEdit(nurse)} className="btn-ghost text-xs py-1 px-2">
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {[
                      { icon: Building2, label: 'Department', val: nurse.department || '—' },
                      { icon: Award, label: 'Experience', val: nurse.experience || '—' },
                      { icon: Phone, label: 'Phone', val: nurse.phone || '—' },
                      { icon: Mail, label: 'Email', val: nurse.email || '—' },
                      { icon: Clock, label: 'Schedule', val: nurse.schedule || '—' },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <Icon size={14} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />
                        <span className="text-slate-400 dark:text-slate-600 text-xs">{label}:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-xs truncate">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {nurse.about && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">About</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{nurse.about}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'schedule' && (
            <div className="p-6">
              {nurseShifts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                  <Clock size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No shifts assigned yet</p>
                  <p className="text-xs mt-1">Go to Shifts page to manage schedules</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Assigned Shifts</p>
                  {DAYS.map(day => {
                    const dayShifts = nurseShifts.filter(s => s.day === day)
                    if (dayShifts.length === 0) return null
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0">{day}</span>
                        <div className="flex gap-1 flex-wrap">
                          {dayShifts.map(s => (
                            <span key={s.id} className={`text-xs font-semibold px-2 py-1 rounded-lg ${SHIFT_COLORS[s.shiftType] || 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
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

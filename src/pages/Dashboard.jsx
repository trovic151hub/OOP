import React, { useEffect, useRef } from 'react'
import { Users, Stethoscope, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { formatDate } from '../utils/helpers'

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let start = 0; const end = value; const dur = 800
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  const colors = {
    teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   border: 'border-teal-100' },
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  }
  const c = colors[color] || colors.teal

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
        <p ref={ref} className="text-3xl font-extrabold text-slate-800 mb-1">0</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.label}
          </div>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={c.icon} />
      </div>
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const { patients, doctors, appointments } = useStore()

  const todayAppts = appointments.filter(a => a.date === new Date().toISOString().slice(0, 10))
  const completedToday = todayAppts.filter(a => a.status === 'Completed').length
  const recentPatients = [...patients].slice(0, 5)
  const upcomingAppts = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Ongoing').slice(0, 5)

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Hello, welcome back!</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Patients" value={patients.length} sub="Registered in system" icon={Users} color="blue" trend={{ up: true, label: '+12% vs. yesterday' }} />
        <StatCard label="Total Doctors" value={doctors.length} sub="On staff" icon={Stethoscope} color="purple" trend={{ up: true, label: '+1.5% vs. last week' }} />
        <StatCard label="Appointments" value={appointments.length} sub="Total scheduled" icon={Calendar} color="teal" trend={{ up: true, label: '+8% vs. yesterday' }} />
      </div>

      {/* Today's stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's", value: todayAppts.length, icon: Calendar, color: 'bg-teal-50 text-teal-600' },
          { label: 'Completed', value: completedToday, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Ongoing', value: todayAppts.filter(a => a.status === 'Ongoing').length, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Cancelled', value: todayAppts.filter(a => a.status === 'Cancelled').length, icon: TrendingDown, color: 'bg-red-50 text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} className={color.split(' ')[1]} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-lg font-extrabold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Patients */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700">Recent Patients</p>
            <button onClick={() => onNavigate('patients')} className="text-xs text-teal-600 font-semibold hover:underline">View all</button>
          </div>
          {recentPatients.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No patients yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPatients.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.gender} · {p.age} yrs · {p.blood || '—'}</p>
                    </div>
                  </div>
                  <Badge status={p.status || 'Active'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700">Upcoming Appointments</p>
            <button onClick={() => onNavigate('appointments')} className="text-xs text-teal-600 font-semibold hover:underline">View all</button>
          </div>
          {upcomingAppts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No upcoming appointments.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingAppts.map(a => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.patientName} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{a.patientName}</p>
                      <p className="text-xs text-slate-400">
                        {a.doctorName} · {a.date ? formatDate(a.date) : 'No date'}
                        {a.timeStart ? ` · ${a.timeStart}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

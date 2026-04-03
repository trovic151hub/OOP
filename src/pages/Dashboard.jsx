import React, { useEffect, useRef } from 'react'
import { Users, Stethoscope, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, Building2, Package } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
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
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
    emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-600',border: 'border-emerald-100' },
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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard({ onNavigate, currentUser }) {
  const { patients, doctors, appointments, departments, inventory } = useStore()

  const today = new Date().toISOString().slice(0, 10)
  const todayAppts = appointments.filter(a => a.date === today)
  const recentPatients = [...patients].slice(0, 5)
  const upcomingAppts = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Ongoing').slice(0, 5)
  const lowStock = inventory.filter(i => parseInt(i.quantity) <= parseInt(i.reorderLevel || 0))

  const apptStatusData = [
    { name: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length,  fill: '#0d9488' },
    { name: 'Ongoing',   value: appointments.filter(a => a.status === 'Ongoing').length,    fill: '#3b82f6' },
    { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length,  fill: '#10b981' },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length,  fill: '#ef4444' },
  ]

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    return {
      month: label,
      Patients:     patients.filter(p => p.createdAt?.startsWith(key)).length,
      Appointments: appointments.filter(a => a.createdAt?.startsWith(key)).length,
    }
  })

  const patientStatusData = [
    { name: 'Active',       value: patients.filter(p => p.status === 'Active').length,       fill: '#10b981' },
    { name: 'Admitted',     value: patients.filter(p => p.status === 'Admitted').length,     fill: '#0d9488' },
    { name: 'In Treatment', value: patients.filter(p => p.status === 'In Treatment').length, fill: '#3b82f6' },
    { name: 'Discharged',   value: patients.filter(p => p.status === 'Discharged').length,   fill: '#94a3b8' },
    { name: 'Critical',     value: patients.filter(p => p.status === 'Critical').length,      fill: '#ef4444' },
  ].filter(d => d.value > 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">{greeting()}, {currentUser?.name?.split(' ')[0] || 'there'}! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Patients"    value={patients.length}     sub="Registered" icon={Users}       color="blue"    trend={{ up: true, label: '+12%' }} />
        <StatCard label="Doctors"     value={doctors.length}      sub="On staff"   icon={Stethoscope} color="purple"  trend={{ up: true, label: '+1.5%' }} />
        <StatCard label="Appointments" value={appointments.length} sub="Total"     icon={Calendar}    color="teal"    trend={{ up: true, label: '+8%' }} />
        <StatCard label="Departments" value={departments.length}   sub="Active"    icon={Building2}   color="amber" />
        <StatCard label="Inventory"   value={inventory.length}     sub={`${lowStock.length} low stock`} icon={Package} color="emerald" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's Appts", value: todayAppts.length,                                        icon: Calendar,    color: 'bg-teal-50 text-teal-600' },
          { label: 'Completed',     value: todayAppts.filter(a => a.status === 'Completed').length,  icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Ongoing',       value: todayAppts.filter(a => a.status === 'Ongoing').length,    icon: Clock,       color: 'bg-blue-50 text-blue-600' },
          { label: 'Cancelled',     value: todayAppts.filter(a => a.status === 'Cancelled').length,  icon: TrendingDown,color: 'bg-red-50 text-red-500' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-bold text-slate-700 mb-4">Activity — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last6Months} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Patients"     stroke="#3b82f6" strokeWidth={2} fill="url(#gP)" dot={{ r: 3, fill: '#3b82f6' }} />
              <Area type="monotone" dataKey="Appointments" stroke="#0d9488" strokeWidth={2} fill="url(#gA)" dot={{ r: 3, fill: '#0d9488' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm font-bold text-slate-700 mb-4">Appointments by Status</p>
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={apptStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {apptStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-bold text-slate-700 mb-4">Appointment Status Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={apptStatusData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {apptStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {patientStatusData.length > 0 ? (
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-700 mb-4">Patient Status</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={patientStatusData} cx="50%" cy="50%" outerRadius={65} paddingAngle={2} dataKey="value">
                  {patientStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card p-5 flex items-center justify-center text-slate-300 text-sm">No patient data</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

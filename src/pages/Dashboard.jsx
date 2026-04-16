import React, { useEffect, useRef } from 'react'
import {
  Users, Stethoscope, Calendar, TrendingUp, TrendingDown, Clock,
  CheckCircle, Building2, Package, AlertTriangle,
  BedDouble, FlaskConical, UserCheck, Bell
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useStore } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import NairaIcon from '../components/ui/NairaIcon'
import { formatDate } from '../utils/helpers'

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  const ref = useRef(null)
  const isNumber = typeof value === 'number'
  useEffect(() => {
    if (!isNumber) return
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
  }, [value, isNumber])

  const colors = {
    teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   border: 'border-teal-100' },
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
    emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-600',border: 'border-emerald-100' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-100' },
  }
  const c = colors[color] || colors.teal

  return (
    <div className="card p-3 sm:p-5 flex items-start justify-between min-w-0">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 sm:mb-2 truncate">{label}</p>
        {isNumber
          ? <p ref={ref} className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-0.5 sm:mb-1">0</p>
          : <p className="text-lg sm:text-2xl font-extrabold text-slate-800 mb-0.5 sm:mb-1 truncate">{value}</p>
        }
        {sub && <p className="text-[10px] sm:text-xs text-slate-400 truncate">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold mt-1 sm:mt-2 ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.label}
          </div>
        )}
      </div>
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex-shrink-0 ${c.bg} border ${c.border} flex items-center justify-center`}>
        <Icon size={17} className={c.icon} />
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

function fmt(n) { return n >= 1000000 ? `₦${(n/1000000).toFixed(1)}m` : n >= 1000 ? `₦${(n/1000).toFixed(0)}k` : `₦${n}` }

export default function Dashboard({ onNavigate, currentUser }) {
  const { patients, doctors, appointments, departments, inventory, billing, rooms, labResults } = useStore()

  const today     = new Date().toISOString().slice(0, 10)
  const isDoctor  = currentUser?.role === 'Doctor'
  const linkedDoc = isDoctor ? doctors.find(d => d.uid === currentUser?.uid) : null

  const myAppointments = linkedDoc
    ? appointments.filter(a => a.doctorName === linkedDoc.name)
    : appointments

  const todayAppts = myAppointments.filter(a => a.date === today)
  const myPatientNames = [...new Set(myAppointments.map(a => a.patientName))]
  const myPatients = isDoctor ? patients.filter(p => myPatientNames.includes(p.name)) : patients

  const recentPatients = [...myPatients].slice(0, 5)
  const upcomingAppts  = myAppointments.filter(a => a.status === 'Scheduled' || a.status === 'Checked In' || a.status === 'In Progress').slice(0, 5)

  const next7Days = new Date(); next7Days.setDate(next7Days.getDate() + 7)
  const next7Str  = next7Days.toISOString().slice(0, 10)

  const followUps = appointments.filter(a => a.requiresFollowUp && a.followUpDate)
  const overdueFollowUps = followUps.filter(a => a.followUpDate < today)
  const todayFollowUps   = followUps.filter(a => a.followUpDate === today)
  const upcomingFollowUps = followUps.filter(a => a.followUpDate > today && a.followUpDate <= next7Str)

  const lowStock     = inventory.filter(i => parseInt(i.quantity) <= parseInt(i.reorderLevel || 0))
  const checkedIn    = appointments.filter(a => a.status === 'Checked In').length
  const inProgress   = appointments.filter(a => a.status === 'In Progress').length

  const totalRevenue = billing.reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const paidRevenue  = billing.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const unpaid       = billing.filter(b => b.status !== 'Paid').length

  const vacantRooms  = rooms.filter(r => r.status === 'Vacant').length
  const occupiedRooms= rooms.filter(r => r.status === 'Occupied').length
  const pendingLabs  = labResults.filter(l => l.status === 'Pending').length
  const abnormalLabs = labResults.filter(l => l.status === 'Abnormal').length

  const apptStatusData = [
    { name: 'Scheduled',   value: appointments.filter(a => a.status === 'Scheduled').length,    fill: '#0d9488' },
    { name: 'Checked In',  value: appointments.filter(a => a.status === 'Checked In').length,   fill: '#8b5cf6' },
    { name: 'In Progress', value: appointments.filter(a => a.status === 'In Progress').length,  fill: '#3b82f6' },
    { name: 'Completed',   value: appointments.filter(a => a.status === 'Completed').length,    fill: '#10b981' },
    { name: 'Cancelled',   value: appointments.filter(a => a.status === 'Cancelled').length,    fill: '#ef4444' },
  ]

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const rev   = billing.filter(b => b.createdAt?.startsWith(key)).reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
    return {
      month: label,
      Patients:     patients.filter(p => p.createdAt?.startsWith(key)).length,
      Appointments: appointments.filter(a => a.createdAt?.startsWith(key)).length,
      Revenue:      Math.round(rev),
    }
  })

  const patientStatusData = [
    { name: 'Active',       value: patients.filter(p => p.status === 'Active').length,       fill: '#10b981' },
    { name: 'Admitted',     value: patients.filter(p => p.status === 'Admitted').length,     fill: '#0d9488' },
    { name: 'In Treatment', value: patients.filter(p => p.status === 'In Treatment').length, fill: '#3b82f6' },
    { name: 'Discharged',   value: patients.filter(p => p.status === 'Discharged').length,   fill: '#94a3b8' },
    { name: 'Critical',     value: patients.filter(p => p.status === 'Critical').length,     fill: '#ef4444' },
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
        <p className="text-sm text-slate-400 mt-0.5">
          {greeting()}, {currentUser?.name?.split(' ')[0] || 'there'}!{' '}
          {isDoctor ? `Here's your schedule for today.` : `Here's what's happening today.`}
        </p>
      </div>

      {isDoctor ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="My Patients"      value={myPatients.length}  sub="All time"      icon={Users}     color="blue" />
          <StatCard label="My Appointments"  value={myAppointments.length} sub="All time"   icon={Calendar}  color="teal" />
          <StatCard label="Today's Schedule" value={todayAppts.length}  sub="Today"         icon={Clock}     color="purple" />
          <StatCard label="Lab Results"      value={labResults.filter(l => l.orderedBy === linkedDoc?.name).length} sub={`${labResults.filter(l => l.status === 'Pending' && l.orderedBy === linkedDoc?.name).length} pending`} icon={FlaskConical} color="amber" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Patients"    value={patients.length}     sub="Registered"   icon={Users}       color="blue"    trend={{ up: true, label: '+12%' }} />
          <StatCard label="Doctors"     value={doctors.length}      sub="On staff"     icon={Stethoscope} color="purple"  trend={{ up: true, label: '+1.5%' }} />
          <StatCard label="Appointments" value={appointments.length} sub="Total"       icon={Calendar}    color="teal"    trend={{ up: true, label: '+8%' }} />
          <StatCard label="Revenue"     value={fmt(paidRevenue)} sub={`${fmt(totalRevenue)} total · ${unpaid} unpaid`} icon={NairaIcon} color="emerald" />
          <StatCard label="Rooms"       value={rooms.length}        sub={`${vacantRooms} vacant · ${occupiedRooms} occupied`} icon={BedDouble}  color="amber" />
          <StatCard label="Lab Results" value={labResults.length}   sub={`${pendingLabs} pending · ${abnormalLabs} abnormal`} icon={FlaskConical} color="red" />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's Appts", value: todayAppts.length,                                                color: 'bg-teal-50 text-teal-600',     icon: Calendar },
          { label: 'Checked In',   value: isDoctor ? todayAppts.filter(a=>a.status==='Checked In').length : checkedIn,   color: 'bg-violet-50 text-violet-600', icon: UserCheck },
          { label: 'In Progress',  value: isDoctor ? todayAppts.filter(a=>a.status==='In Progress').length : inProgress,  color: 'bg-blue-50 text-blue-600',    icon: Clock },
          { label: 'Completed',    value: todayAppts.filter(a => a.status === 'Completed').length,          color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
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

      {(overdueFollowUps.length > 0 || todayFollowUps.length > 0 || upcomingFollowUps.length > 0) && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <Bell size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-violet-700">Follow-up Reminders</p>
              {overdueFollowUps.length > 0 && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">{overdueFollowUps.length} overdue</span>}
              {todayFollowUps.length > 0 && <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-1.5 py-0.5 rounded-full">{todayFollowUps.length} today</span>}
              {upcomingFollowUps.length > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">{upcomingFollowUps.length} this week</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {[...overdueFollowUps, ...todayFollowUps, ...upcomingFollowUps].slice(0, 6).map(a => (
                <span key={a.id} className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${a.followUpDate < today ? 'bg-red-50 border-red-200 text-red-700' : a.followUpDate === today ? 'bg-violet-100 border-violet-300 text-violet-800' : 'bg-white border-violet-200 text-violet-700'}`}>
                  {a.patientName} ({a.followUpDate})
                </span>
              ))}
              {(overdueFollowUps.length + todayFollowUps.length + upcomingFollowUps.length) > 6 && (
                <span className="text-xs text-violet-400">+{(overdueFollowUps.length + todayFollowUps.length + upcomingFollowUps.length) - 6} more</span>
              )}
            </div>
          </div>
          <button onClick={() => onNavigate('appointments')} className="text-xs text-violet-600 font-bold hover:underline flex-shrink-0">View →</button>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-700 mb-1">{lowStock.length} Low Stock Alert{lowStock.length !== 1 ? 's' : ''}</p>
            <div className="flex flex-wrap gap-2">
              {lowStock.slice(0, 6).map(i => (
                <span key={i.id} className="text-xs bg-white border border-amber-200 text-amber-700 font-semibold px-2 py-0.5 rounded-lg">
                  {i.name} ({i.quantity} {i.unit})
                </span>
              ))}
              {lowStock.length > 6 && <span className="text-xs text-amber-500">+{lowStock.length - 6} more</span>}
            </div>
          </div>
          <button onClick={() => onNavigate('inventory')} className="text-xs text-amber-600 font-bold hover:underline flex-shrink-0">View →</button>
        </div>
      )}

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
                <Pie data={apptStatusData.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {apptStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {!isDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="card p-5 lg:col-span-2">
            <p className="text-sm font-bold text-slate-700 mb-4">Revenue — Last 6 Months</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last6Months} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} formatter={(v) => [`₦${Number(v).toLocaleString('en-NG')}`, 'Revenue']} />
                <Bar dataKey="Revenue" name="Revenue" fill="#0d9488" radius={[4,4,0,0]} />
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700">{isDoctor ? 'My Patients' : 'Recent Patients'}</p>
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
            <p className="text-sm font-bold text-slate-700">{isDoctor ? 'My Schedule' : 'Upcoming Appointments'}</p>
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
                        {isDoctor ? '' : `${a.doctorName} · `}{a.date ? formatDate(a.date) : 'No date'}
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

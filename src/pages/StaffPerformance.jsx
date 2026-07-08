import React, { useMemo, useState } from 'react'
import { TrendingUp, Star, Users, Calendar, CheckCircle, Award, BarChart2 } from 'lucide-react'
import NairaIcon from '../components/ui/NairaIcon'
import { useStore } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { formatCurrency, formatCompactCurrency } from '../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function MetricCard({ label, value, icon: Icon, color = 'teal', sub }) {
  const cols = {
    teal:    'bg-teal-50 dark:bg-teal-500/12 text-teal-600 border-teal-200 dark:border-teal-500/30',
    blue:    'bg-blue-50 dark:bg-blue-500/12 text-blue-600 border-blue-200 dark:border-blue-500/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
    amber:   'bg-amber-50 dark:bg-amber-500/12 text-amber-600 border-amber-200 dark:border-amber-500/30',
    violet:  'bg-violet-50 dark:bg-violet-500/12 text-violet-600 border-violet-200 dark:border-violet-500/30',
  }
  return (
    <div className={`rounded-xl border p-4 ${cols[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} />
        <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
    </div>
  )
}

function DoctorCard({ doctor, appointments, billing, labResults, rank, currency }) {
  const myAppts     = appointments.filter(a => a.doctorName === doctor.name)
  const completed   = myAppts.filter(a => a.status === 'Completed').length
  const rate        = myAppts.length > 0 ? Math.round((completed / myAppts.length) * 100) : 0
  const revenue     = billing.filter(b => b.doctorName === doctor.name && b.status === 'Paid').reduce((s, b) => s + Number(b.total || b.totalAmount || 0), 0)
  const myLabs      = labResults.filter(l => l.orderedBy === doctor.name || l.doctorName === doctor.name).length
  const patientNames = [...new Set(myAppts.map(a => a.patientName))]
  const thisMonth   = new Date().getMonth()
  const thisYear    = new Date().getFullYear()
  const monthAppts  = myAppts.filter(a => a.date && new Date(a.date).getMonth() === thisMonth && new Date(a.date).getFullYear() === thisYear).length

  const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`

  const [expanded, setExpanded] = useState(false)

  const monthly = MONTHS.map((m, i) => ({
    name: m,
    Appointments: myAppts.filter(a => a.date && new Date(a.date).getMonth() === i && new Date(a.date).getFullYear() === thisYear).length,
  }))

  return (
    <div className="card overflow-hidden">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar name={doctor.name} size="lg" />
            <span className="absolute -top-1 -right-1 text-base">{rankBadge}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-slate-200">{doctor.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-600">{doctor.specialty || 'General'} · {doctor.department || '—'}</p>
            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
              </div>
              <span className="text-[11px] font-bold text-teal-600 ml-1 flex-shrink-0">{rate}%</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Completion rate</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Patients',   value: patientNames.length, text: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-500/12' },
            { label: 'Appts',      value: myAppts.length,      text: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-500/12' },
            { label: 'This Month', value: monthAppts,          text: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/12' },
            { label: 'Labs',       value: myLabs,              text: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-500/12' },
          ].map(({ label, value, text, bg }) => (
            <div key={label} className={`rounded-xl p-2.5 text-center ${bg}`}>
              <p className={`text-lg font-extrabold ${text}`}>{value}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {revenue > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/12 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-3 py-2">
            <NairaIcon size={13} className="text-emerald-600" />
            <p className="text-xs font-bold text-emerald-700">Revenue generated: {formatCurrency(revenue, currency)}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-600 hover:text-teal-600 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        {expanded ? 'Hide chart ▲' : 'Show monthly chart ▼'}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={monthly} margin={{ top: 8, right: 4, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Appointments" fill="#0d9488" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default function StaffPerformance() {
  const { doctors, appointments, billing, labResults, users, settings } = useStore()
  const [sortBy, setSortBy] = useState('appointments')

  const today     = new Date().toISOString().slice(0, 10)
  const thisMonth = new Date().getMonth()
  const thisYear  = new Date().getFullYear()

  const docStats = useMemo(() => doctors.map(d => {
    const myAppts   = appointments.filter(a => a.doctorName === d.name)
    const completed = myAppts.filter(a => a.status === 'Completed').length
    const revenue   = billing.filter(b => b.doctorName === d.name && b.status === 'Paid').reduce((s, b) => s + Number(b.total || b.totalAmount || 0), 0)
    const rate      = myAppts.length > 0 ? Math.round((completed / myAppts.length) * 100) : 0
    const patients  = [...new Set(myAppts.map(a => a.patientName))].length
    return { ...d, totalAppts: myAppts.length, completed, rate, revenue, patients }
  }), [doctors, appointments, billing])

  const sorted = [...docStats].sort((a, b) => {
    if (sortBy === 'appointments') return b.totalAppts - a.totalAppts
    if (sortBy === 'revenue')      return b.revenue - a.revenue
    if (sortBy === 'completion')   return b.rate - a.rate
    if (sortBy === 'patients')     return b.patients - a.patients
    return 0
  })

  const totalAppts      = appointments.length
  const todayAppts      = appointments.filter(a => a.date === today).length
  const completedAll    = appointments.filter(a => a.status === 'Completed').length
  const overallRate     = totalAppts > 0 ? Math.round((completedAll / totalAppts) * 100) : 0
  const monthAppts      = appointments.filter(a => a.date && new Date(a.date).getMonth() === thisMonth && new Date(a.date).getFullYear() === thisYear).length
  const topDoc          = sorted[0]

  const overviewData = sorted.slice(0, 8).map(d => ({
    name:  d.name.split(' ').slice(-1)[0],
    Appts: d.totalAppts, Revenue: Math.round(d.revenue / 100) * 100, Rate: d.rate,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Staff Performance</h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">{doctors.length} doctors · {overallRate}% overall completion rate</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          {[
            { key: 'appointments', label: 'Appointments' },
            { key: 'patients',     label: 'Patients' },
            { key: 'revenue',      label: 'Revenue' },
            { key: 'completion',   label: 'Completion' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${sortBy === key ? 'bg-teal-50 dark:bg-teal-500/12 border-teal-300 text-teal-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total Doctors"      value={doctors.length}  icon={Users}     color="blue" />
        <MetricCard label="Appts This Month"   value={monthAppts}      icon={Calendar}  color="teal" />
        <MetricCard label="Completion Rate"    value={`${overallRate}%`} icon={CheckCircle} color="emerald" />
        <MetricCard label="Today's Appts"      value={todayAppts}      icon={TrendingUp} color="violet" />
      </div>

      {topDoc && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl p-5 mb-5 flex items-center gap-4">
          <Award size={32} className="opacity-80 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-0.5">Top Performer — {MONTHS[thisMonth]}</p>
            <p className="text-xl font-extrabold">{topDoc.name}</p>
            <p className="text-sm opacity-80">{topDoc.totalAppts} appointments · {topDoc.rate}% completion · {topDoc.patients} patients</p>
          </div>
          {topDoc.revenue > 0 && (
            <div className="ml-auto text-right flex-shrink-0 hidden sm:block">
              <p className="text-xs opacity-60">Revenue</p>
              <p className="text-lg font-extrabold">{formatCurrency(topDoc.revenue, settings?.currency)}</p>
            </div>
          )}
        </div>
      )}

      {overviewData.length > 0 && (
        <div className="card p-5 mb-5">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Appointments &amp; Revenue by Doctor ({new Date().getFullYear()})</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overviewData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis
                yAxisId="right" orientation="right" tick={{ fontSize: 11 }}
                tickFormatter={v => formatCompactCurrency(v, settings?.currency)}
              />
              <Tooltip formatter={(v, name) => name === 'Revenue' ? [formatCurrency(v, settings?.currency), name] : [v, name]} />
              <Legend />
              <Bar yAxisId="left" dataKey="Appts" name="Appointments" fill="#0d9488" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="Revenue" name="Revenue" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
          <BarChart2 size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-semibold">No doctors yet</p>
          <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">Add doctors to see performance metrics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((d, idx) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              appointments={appointments}
              billing={billing}
              labResults={labResults}
              rank={idx + 1}
              currency={settings?.currency}
            />
          ))}
        </div>
      )}
    </div>
  )
}

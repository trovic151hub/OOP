import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { useStore } from '../store/useStore'
import { TrendingUp, Users, Calendar, Package, Download, BarChart2, BadgeDollarSign } from 'lucide-react'
import { formatCurrency, formatCompactCurrency, getCurrencySymbol } from '../utils/helpers'

const COLORS = ['#0d9488', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {typeof p.value === 'number' && (p.name?.toLowerCase().includes('revenue') || p.name?.toLowerCase() === 'paid') ? formatCurrency(p.value, currency) : p.value}</p>
      ))}
    </div>
  )
}

function SummaryCard({ label, value, sub, icon: Icon, color }) {
  const colors = {
    teal:   { bg: 'bg-teal-50 dark:bg-teal-500/12',   icon: 'text-teal-600',   border: 'border-teal-100 dark:border-teal-500/20' },
    blue:   { bg: 'bg-blue-50 dark:bg-blue-500/12',   icon: 'text-blue-600',   border: 'border-blue-100 dark:border-blue-500/20' },
    emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-500/12',icon: 'text-emerald-600',border: 'border-emerald-100 dark:border-emerald-500/20' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-500/12',  icon: 'text-amber-600',  border: 'border-amber-100 dark:border-amber-500/20' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/12', icon: 'text-purple-600', border: 'border-purple-100 dark:border-purple-500/20' },
  }
  const c = colors[color] || colors.teal
  return (
    <div className="card p-4 sm:p-5 flex items-start justify-between gap-3 min-w-0 overflow-hidden">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wide mb-2 leading-tight">{label}</p>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-1 leading-tight break-words">{value}</p>
        {sub && <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-600 leading-tight">{sub}</p>}
      </div>
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={c.icon} />
      </div>
    </div>
  )
}

export default function Reports() {
  const { patients, doctors, appointments, billing, inventory, settings } = useStore()
  const [range, setRange] = useState(6)

  const last = Array.from({ length: range }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (range - 1 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: range > 6 ? '2-digit' : undefined })
    const monthBilling = billing.filter(b => b.createdAt?.startsWith(key))
    return {
      month: label,
      Patients:     patients.filter(p => p.createdAt?.startsWith(key)).length,
      Appointments: appointments.filter(a => a.createdAt?.startsWith(key)).length,
      Revenue:      monthBilling.reduce((s, b) => s + (parseFloat(b.total) || 0), 0),
      Paid:         monthBilling.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.total) || 0), 0),
    }
  })

  const totalRevenue = billing.reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const totalPaid    = billing.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const totalPending = billing.filter(b => b.status === 'Pending').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const collectionRate = totalRevenue > 0 ? ((totalPaid / totalRevenue) * 100).toFixed(1) : '0.0'

  const apptStatusData = [
    { name: 'Scheduled',   value: appointments.filter(a => a.status === 'Scheduled').length,   fill: '#0d9488' },
    { name: 'Checked In',  value: appointments.filter(a => a.status === 'Checked In').length,   fill: '#8b5cf6' },
    { name: 'In Progress', value: appointments.filter(a => a.status === 'In Progress').length,  fill: '#3b82f6' },
    { name: 'Completed',   value: appointments.filter(a => a.status === 'Completed').length,    fill: '#10b981' },
    { name: 'Cancelled',   value: appointments.filter(a => a.status === 'Cancelled').length,    fill: '#ef4444' },
  ].filter(d => d.value > 0)

  const billingStatusData = [
    { name: 'Paid',    value: billing.filter(b => b.status === 'Paid').length,    fill: '#10b981' },
    { name: 'Pending', value: billing.filter(b => b.status === 'Pending').length, fill: '#f59e0b' },
    { name: 'Overdue', value: billing.filter(b => b.status === 'Overdue').length, fill: '#ef4444' },
  ].filter(d => d.value > 0)

  const patientTypeData = [...new Set(patients.map(p => p.patientType).filter(Boolean))].map(t => ({
    name: t,
    value: patients.filter(p => p.patientType === t).length,
  }))

  const lowStockItems = inventory.filter(i => (parseInt(i.stock) || parseInt(i.quantity) || 0) <= (parseInt(i.reorderLevel) || 0))

  const topDoctors = [...doctors]
    .map(d => ({
      name: d.name,
      appointments: appointments.filter(a => a.doctorName === d.name).length,
    }))
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 5)

  function exportCSV() {
    const rows = [
      ['Month', 'New Patients', 'Appointments', 'Revenue', 'Paid'],
      ...last.map(r => [r.month, r.Patients, r.Appointments, r.Revenue.toFixed(2), r.Paid.toFixed(2)])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'medcore-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex items-start justify-between flex-col sm:flex-row gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Reports & Analytics</h1>
          <p className="text-sm text-slate-400 dark:text-slate-600">Overview of hospital performance and financial data</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex-1 sm:flex-none">
            {[3, 6, 12].map(m => (
              <button key={m} onClick={() => setRange(m)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${range === m ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {m}M
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 flex-shrink-0">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Total Revenue" value={formatCurrency(totalRevenue, settings?.currency)} sub={`${collectionRate}% collected`} icon={BadgeDollarSign} color="emerald" />
        <SummaryCard label="Outstanding" value={formatCurrency(totalPending, settings?.currency)} sub="Pending invoices" icon={TrendingUp} color="amber" />
        <SummaryCard label="Total Patients" value={patients.length} sub={`${patients.filter(p => p.status === 'Active').length} active`} icon={Users} color="teal" />
        <SummaryCard label="Total Appointments" value={appointments.length} sub={`${appointments.filter(a => a.status === 'Completed').length} completed`} icon={Calendar} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Monthly Revenue</p>
            <BarChart2 size={16} className="text-slate-300 dark:text-slate-700" />
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={last}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCompactCurrency(v, settings?.currency)} />
              <Tooltip content={<ChartTooltip currency={settings?.currency} />} />
              <Area type="monotone" dataKey="Revenue" name="Revenue" stroke="#0d9488" strokeWidth={2} fill="url(#revenueGrad)" />
              <Area type="monotone" dataKey="Paid" name="Paid" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Patient & Appointment Activity</p>
            <BarChart2 size={16} className="text-slate-300 dark:text-slate-700" />
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={last} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Patients" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 sm:p-5 overflow-hidden">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Appointment Status</p>
          {apptStatusData.length === 0 ? (
            <div className="text-center py-10 text-slate-300 dark:text-slate-700 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={apptStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                  {apptStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4 sm:p-5 overflow-hidden">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Billing Status</p>
          {billingStatusData.length === 0 ? (
            <div className="text-center py-10 text-slate-300 dark:text-slate-700 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={billingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                  {billingStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4 sm:p-5 overflow-hidden">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Patient Types</p>
          {patientTypeData.length === 0 ? (
            <div className="text-center py-10 text-slate-300 dark:text-slate-700 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={patientTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                  {patientTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Top Doctors by Appointments</p>
          </div>
          {topDoctors.length === 0 ? (
            <div className="text-center py-10 text-slate-300 dark:text-slate-700 text-sm">No data</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {topDoctors.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-500/12 text-teal-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full w-16 sm:w-24 overflow-hidden">
                      <div className="h-2 bg-teal-500 rounded-full" style={{ width: `${topDoctors[0].appointments > 0 ? (d.appointments / topDoctors[0].appointments) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-6 text-right">{d.appointments}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Low Stock Alerts</p>
            <Package size={15} className="text-slate-300 dark:text-slate-700" />
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-10 text-emerald-400 text-sm font-medium">All inventory levels are healthy</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {lowStockItems.slice(0, 6).map(item => {
                const stock = parseInt(item.stock) || parseInt(item.quantity) || 0
                const reorder = parseInt(item.reorderLevel) || 0
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">{item.category || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stock === 0 ? 'bg-red-100 dark:bg-red-500/18 text-red-600' : 'bg-amber-100 dark:bg-amber-500/18 text-amber-600'}`}>
                        {stock === 0 ? 'Out of Stock' : `${stock} left`}
                      </span>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Reorder at {reorder}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



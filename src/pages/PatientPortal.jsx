import React, { useState } from 'react'
import {
  Calendar, FlaskConical, Pill, FileText, User, LogOut,
  CheckCircle, Clock, AlertCircle, Activity, ChevronRight,
  Stethoscope, Home, Menu, X
} from 'lucide-react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useStore } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { formatDate, formatCurrency } from '../utils/helpers'

const NAV = [
  { id: 'overview',      label: 'Overview',         icon: Home },
  { id: 'appointments',  label: 'My Appointments',   icon: Calendar },
  { id: 'prescriptions', label: 'My Prescriptions',  icon: Pill },
  { id: 'lab',           label: 'Lab Results',       icon: FlaskConical },
  { id: 'billing',       label: 'My Bills',          icon: FileText },
]

function StatCard({ icon: Icon, label, value, sub, color = 'teal' }) {
  const cols = {
    teal:    'bg-teal-50    text-teal-700    border-teal-200',
    blue:    'bg-blue-50    text-blue-700    border-blue-200',
    violet:  'bg-violet-50  text-violet-700  border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:   'bg-amber-50   text-amber-700   border-amber-200',
    red:     'bg-red-50     text-red-700     border-red-200',
  }
  return (
    <div className={`rounded-2xl border p-4 ${cols[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} />
        <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

export default function PatientPortal({ currentUser }) {
  const { appointments, prescriptions = [], labResults = [], invoices = [] } = useStore()
  const [page, setPage]         = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const name = currentUser?.name || currentUser?.email || ''

  const myAppts  = appointments.filter(a => a.patientName === name || a.patientEmail === currentUser?.email)
  const myRx     = prescriptions.filter(r => r.patientName === name)
  const myLabs   = labResults.filter(l => l.patientName === name)
  const myBills  = invoices.filter(i => i.patientName === name)

  const upcoming     = myAppts.filter(a => !['Completed','Cancelled'].includes(a.status))
  const nextAppt     = myAppts.filter(a => a.date >= new Date().toISOString().slice(0,10) && a.status !== 'Cancelled')
    .sort((a,b) => a.date.localeCompare(b.date))[0]
  const abnormalLabs = myLabs.filter(l => l.status === 'Abnormal')
  const activeRx     = myRx.filter(r => r.status === 'Active')
  const pendingBills = myBills.filter(i => i.status !== 'Paid')
  const pendingTotal = pendingBills.reduce((s, i) => s + Number(i.totalAmount || 0), 0)

  function handleSignOut() { signOut(auth) }

  function navigate(id) { setPage(id); setMobileNavOpen(false) }

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-teal-700 text-base tracking-tight">MedCore</span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar name={name} size="md" />
          <div>
            <p className="font-bold text-slate-800 text-sm truncate max-w-32">{name}</p>
            <p className="text-[11px] text-teal-600 font-medium">Patient Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => navigate(id)}
            className={`sidebar-link ${page === id ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
            {id === 'lab' && abnormalLabs.length > 0 && (
              <span className="ml-auto text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                {abnormalLabs.length}
              </span>
            )}
            {id === 'billing' && pendingBills.length > 0 && (
              <span className="ml-auto text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                {pendingBills.length}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <button onClick={handleSignOut}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 to-slate-100 overflow-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-56 lg:w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0">
        {Sidebar}
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X size={18} />
            </button>
            {Sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="font-bold text-teal-700 text-sm">MedCore Patient</span>
          </div>
          <button onClick={handleSignOut} className="p-2 rounded-lg text-red-400 hover:bg-red-50">
            <LogOut size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

            {page === 'overview' && (
              <>
                <div className="mb-5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Welcome back, {name.split(' ')[0]}!</h1>
                  <p className="text-sm text-slate-400 mt-1">Your health summary at a glance</p>
                </div>

                {abnormalLabs.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700">Abnormal Lab Result{abnormalLabs.length > 1 ? 's' : ''}</p>
                      <p className="text-xs text-red-500">You have {abnormalLabs.length} lab result{abnormalLabs.length > 1 ? 's' : ''} requiring attention. Please contact your doctor.</p>
                    </div>
                  </div>
                )}

                {nextAppt && (
                  <div className="bg-teal-600 text-white rounded-2xl px-4 sm:px-5 py-4 mb-5 flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold opacity-70 uppercase tracking-wide">Next Appointment</p>
                      <p className="font-bold text-base sm:text-lg">{formatDate(nextAppt.date)}</p>
                      <p className="text-xs sm:text-sm opacity-80 truncate">Dr. {nextAppt.doctorName} · {nextAppt.type}</p>
                    </div>
                    <Badge status={nextAppt.status} />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <StatCard icon={Calendar}    label="Upcoming"         value={upcoming.length}    color="blue" />
                  <StatCard icon={Pill}        label="Active Rx"        value={activeRx.length}    color="teal" />
                  <StatCard icon={FlaskConical} label="Lab Tests"       value={myLabs.length}      color="violet" />
                  <StatCard icon={FileText}    label="Pending Bills"    value={pendingBills.length} color={pendingBills.length > 0 ? 'amber' : 'emerald'} />
                  <StatCard icon={CheckCircle} label="Completed Visits" value={myAppts.filter(a => a.status === 'Completed').length} color="emerald" />
                  <StatCard icon={AlertCircle} label="Abnormal Labs"    value={abnormalLabs.length} color={abnormalLabs.length > 0 ? 'red' : 'emerald'} />
                </div>

                {activeRx.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-slate-700">Current Medications</p>
                      <button onClick={() => navigate('prescriptions')} className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-0.5">
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {activeRx.slice(0, 3).map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Pill size={14} className="text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{(r.medications||[])[0]?.name || r.medications || 'Prescription'}</p>
                            <p className="text-xs text-slate-400">{(r.medications||[])[0]?.frequency} · {(r.medications||[])[0]?.duration}</p>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-20 flex-shrink-0">Dr. {r.doctorName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {page === 'appointments' && (
              <>
                <h2 className="text-xl font-bold text-slate-800 mb-5">My Appointments</h2>
                {myAppts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 text-slate-400">
                    <Calendar size={36} className="text-slate-200 mb-3" />
                    <p className="text-sm font-medium">No appointments found</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myAppts.sort((a,b) => b.date.localeCompare(a.date)).map(a => (
                      <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Stethoscope size={16} className="text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm sm:text-base">{a.type}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">Dr. {a.doctorName} · {a.date ? formatDate(a.date) : '—'}{a.timeStart ? ` at ${a.timeStart}` : ''}</p>
                          {a.notes && <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">{a.notes}</p>}
                        </div>
                        <Badge status={a.status} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {page === 'prescriptions' && (
              <>
                <h2 className="text-xl font-bold text-slate-800 mb-5">My Prescriptions</h2>
                {myRx.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 text-slate-400">
                    <Pill size={36} className="text-slate-200 mb-3" />
                    <p className="text-sm font-medium">No prescriptions found</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {myRx.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(r => (
                      <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-bold text-slate-800">Prescription</p>
                            <p className="text-xs text-slate-400">Dr. {r.doctorName} · {r.date ? formatDate(r.date) : '—'}</p>
                          </div>
                          <Badge status={r.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(r.medications||[]).map((m, i) => (
                            <div key={i} className="bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 text-xs">
                              <p className="font-bold text-teal-700">{m.name} <span className="font-normal text-slate-600">{m.dosage}</span></p>
                              <p className="text-slate-400">{m.frequency} · {m.duration}</p>
                            </div>
                          ))}
                          {(!r.medications || r.medications.length === 0) && (
                            <p className="text-xs text-slate-500">{typeof r.medications === 'string' ? r.medications : 'No medication details'}</p>
                          )}
                        </div>
                        {r.notes && <p className="mt-3 text-xs text-slate-500 italic pt-2 border-t border-slate-50">📝 {r.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {page === 'lab' && (
              <>
                <h2 className="text-xl font-bold text-slate-800 mb-5">Lab Results</h2>
                {myLabs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 text-slate-400">
                    <FlaskConical size={36} className="text-slate-200 mb-3" />
                    <p className="text-sm font-medium">No lab results found</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myLabs.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(l => (
                      <div key={l.id} className={`bg-white rounded-2xl border p-4 sm:p-5 ${l.status === 'Abnormal' ? 'border-red-200' : 'border-slate-200'}`}>
                        {l.status === 'Abnormal' && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mb-2">
                            <AlertCircle size={13} /> Abnormal Result — Please consult your doctor
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-800">{l.testName}</p>
                            <p className="text-xs text-slate-400">{l.category} · {l.date ? formatDate(l.date) : '—'}</p>
                          </div>
                          <Badge status={l.status} />
                        </div>
                        {(l.result || l.normalRange) && (
                          <div className="mt-3 grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3">
                            {l.result && <div><p className="text-[10px] font-bold text-slate-400 uppercase">Result</p><p className="text-sm font-bold text-slate-700">{l.result}</p></div>}
                            {l.normalRange && <div><p className="text-[10px] font-bold text-slate-400 uppercase">Normal Range</p><p className="text-sm text-slate-600">{l.normalRange}</p></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {page === 'billing' && (
              <>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-slate-800">My Bills</h2>
                  {pendingTotal > 0 && (
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                      Outstanding: {formatCurrency(pendingTotal)}
                    </span>
                  )}
                </div>
                {myBills.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-20 text-slate-400">
                    <FileText size={36} className="text-slate-200 mb-3" />
                    <p className="text-sm font-medium">No bills found</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myBills.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(i => (
                      <div key={i.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${i.status === 'Paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                          <FileText size={16} className={i.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm sm:text-base">Invoice #{i.invoiceNumber || i.id?.slice(0,8)}</p>
                          <p className="text-xs text-slate-400">{i.date ? formatDate(i.date) : '—'}</p>
                          {i.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{i.description}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-extrabold text-slate-800 text-base sm:text-lg">{formatCurrency(i.totalAmount || i.total || 0)}</p>
                          <Badge status={i.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden flex items-center bg-white border-t border-slate-200 safe-bottom">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            const hasAlert = (id === 'lab' && abnormalLabs.length > 0) || (id === 'billing' && pendingBills.length > 0)
            return (
              <button key={id} onClick={() => navigate(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors relative min-h-[56px] touch-manipulation
                  ${active ? 'text-teal-600' : 'text-slate-400'}`}>
                {hasAlert && <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full bg-red-500" />}
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[9px] font-semibold leading-none mt-0.5">{label.split(' ')[0]}</span>
                {active && <span className="absolute bottom-0 w-6 h-0.5 bg-teal-500 rounded-full" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

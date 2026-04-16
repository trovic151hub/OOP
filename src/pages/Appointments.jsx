import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Calendar, Filter, Download, UserCheck, PlayCircle, CheckCheck, X as XIcon, Stethoscope } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { formatDate, APPOINTMENT_STATUSES, cycleStatus } from '../utils/helpers'
import { exportAppointments } from '../utils/exportCSV'

const EMPTY_FORM = { patientName: '', doctorName: '', date: '', timeStart: '', timeEnd: '', type: 'Consultation', notes: '', status: 'Scheduled', requiresFollowUp: false, followUpDate: '', followUpNotes: '' }
const APPT_TYPES = ['Consultation','Follow-up','Surgery','Telemedicine','Check-up']

const STATUS_ACTIONS = {
  'Scheduled':   { label: 'Check In',    icon: UserCheck,  next: 'Checked In',  color: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-200' },
  'Checked In':  { label: 'Start',       icon: PlayCircle, next: 'In Progress',  color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200' },
  'In Progress': { label: 'Complete',    icon: CheckCheck, next: 'Completed',    color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200' },
  'Completed':   null,
  'Cancelled':   null,
}

function AppointmentForm({ form, setForm, patients, doctors }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <label className="label">Patient Name <span className="text-red-400">*</span></label>
        <input className="input-field" placeholder="e.g. John Smith" value={form.patientName} onChange={set('patientName')} list="patient-suggestions" />
        <datalist id="patient-suggestions">{patients.map(p => <option key={p.id} value={p.name} />)}</datalist>
      </div>
      <div>
        <label className="label">Doctor Name <span className="text-red-400">*</span></label>
        <input className="input-field" placeholder="e.g. Dr. Sarah Lee" value={form.doctorName} onChange={set('doctorName')} list="doctor-suggestions" />
        <datalist id="doctor-suggestions">{doctors.map(d => <option key={d.id} value={d.name} />)}</datalist>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 sm:col-span-1">
          <label className="label">Date <span className="text-red-400">*</span></label>
          <input className="input-field" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">Start Time</label>
          <input className="input-field" type="time" value={form.timeStart} onChange={set('timeStart')} />
        </div>
        <div>
          <label className="label">End Time</label>
          <input className="input-field" type="time" value={form.timeEnd} onChange={set('timeEnd')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Appointment Type</label>
          <select className="input-field" value={form.type} onChange={set('type')}>
            {APPT_TYPES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {APPOINTMENT_STATUSES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notes / Reason</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Reason for visit, symptoms…" value={form.notes} onChange={set('notes')} />
      </div>
      <div className="border border-dashed border-teal-200 rounded-xl p-4 bg-teal-50/40">
        <label className="flex items-center gap-2.5 cursor-pointer mb-3">
          <input
            type="checkbox"
            className="w-4 h-4 accent-teal-600 cursor-pointer"
            checked={!!form.requiresFollowUp}
            onChange={e => setForm(f => ({ ...f, requiresFollowUp: e.target.checked, followUpDate: e.target.checked ? f.followUpDate : '' }))}
          />
          <span className="text-sm font-semibold text-slate-700">Requires Follow-up</span>
        </label>
        {form.requiresFollowUp && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Follow-up Date</label>
              <input className="input-field" type="date" value={form.followUpDate} onChange={set('followUpDate')} />
            </div>
            <div>
              <label className="label">Follow-up Instructions</label>
              <textarea className="input-field resize-none" rows={2} placeholder="What should happen at the follow-up…" value={form.followUpNotes} onChange={set('followUpNotes')} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Appointments({ currentUser }) {
  const { appointments, patients, doctors, loading } = useStore()
  const showToast = useToast()

  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType]     = useState('All')
  const [myOnly, setMyOnly]             = useState(currentUser?.role === 'Doctor')
  const [modal, setModal]               = useState(false)
  const [editId, setEditId]             = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]       = useState(null)
  const [confirmLabel, setConfirmLabel] = useState('')

  const isDoctor = currentUser?.role === 'Doctor'
  const linkedDoctor = isDoctor ? doctors.find(d => d.uid === currentUser?.uid) : null
  const myDoctorName = linkedDoctor?.name || ''

  const visibleAppts = myOnly && myDoctorName
    ? appointments.filter(a => a.doctorName === myDoctorName)
    : appointments

  const filtered = visibleAppts.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.patientName?.toLowerCase().includes(q) || a.doctorName?.toLowerCase().includes(q) || a.notes?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    const matchType   = filterType === 'All' || a.type === filterType
    return matchSearch && matchStatus && matchType
  })

  function openAdd() {
    setForm({ ...EMPTY_FORM, doctorName: isDoctor ? myDoctorName : '' })
    setEditId(null)
    setModal(true)
  }
  function openEdit(a) { setForm({ ...EMPTY_FORM, ...a }); setEditId(a.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim() || !form.doctorName.trim()) { showToast('Patient and doctor names are required.', 'error'); return }
    if (!form.date) { showToast('Please select a date.', 'error'); return }
    if (editId) { store.updateAppointment(editId, form); showToast('Appointment updated.') }
    else { store.addAppointment(form); showToast('Appointment scheduled.') }
    setModal(false)
  }

  function advanceStatus(a) {
    const next = cycleStatus(a.status)
    if (next === a.status) return
    store.updateAppointment(a.id, { status: next })
    showToast(`${a.patientName} → ${next}`, 'info')
  }

  function cancelAppt(a) {
    store.updateAppointment(a.id, { status: 'Cancelled' })
    showToast(`Appointment cancelled.`, 'info')
  }

  if (loading) return <SkeletonTable rows={6} cols={7} />

  const statusCounts = APPOINTMENT_STATUSES.reduce((acc, s) => {
    acc[s] = appointments.filter(a => a.status === s).length
    return acc
  }, {})

  const STATUS_COLORS = {
    'Scheduled':   'text-teal-600 bg-teal-50',
    'Checked In':  'text-violet-600 bg-violet-50',
    'In Progress': 'text-blue-600 bg-blue-50',
    'Completed':   'text-emerald-600 bg-emerald-50',
    'Cancelled':   'text-red-500 bg-red-50',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Appointments</h2>
          <p className="text-sm text-slate-400 mt-0.5">{appointments.length} total appointments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => exportAppointments(appointments)} className="btn-ghost text-xs">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Schedule Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {APPOINTMENT_STATUSES.map(s => {
          const [tc, bc] = (STATUS_COLORS[s] || 'text-slate-600 bg-slate-50').split(' ')
          return (
            <div key={s} className="card p-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">{s}</p>
              <p className={`text-2xl font-extrabold ${tc}`}>{statusCounts[s]}</p>
            </div>
          )
        })}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by patient or doctor…" className="flex-1 min-w-48" />
        <div className="flex items-center gap-2 flex-wrap">
          {isDoctor && (
            <button
              onClick={() => setMyOnly(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${myOnly ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Stethoscope size={12} />
              {myOnly ? 'My Appointments' : 'All Appointments'}
            </button>
          )}
          <Filter size={14} className="text-slate-400" />
          <select className="input-field w-auto text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {APPOINTMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input-field w-auto text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            {APPT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Patient</th>
                <th className="table-th">Doctor</th>
                <th className="table-th">Type</th>
                <th className="table-th">Date &amp; Time</th>
                <th className="table-th">Status</th>
                <th className="table-th">Quick Action</th>
                <th className="table-th text-right">Edit / Del</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Calendar size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No appointments yet'}</p>
                      {!search && <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={13} /> Schedule First</button>}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(a => {
                const pat = patients.find(p => p.name === a.patientName)
                const doc = doctors.find(d => d.name === a.doctorName)
                const action = STATUS_ACTIONS[a.status]
                const ActionIcon = action?.icon
                return (
                  <tr key={a.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.patientName} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{a.patientName}</p>
                          <p className="text-xs text-slate-400">{pat?.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <p className="text-sm font-medium text-slate-700">{a.doctorName}</p>
                      <p className="text-xs text-slate-400">{doc?.specialty || '—'}</p>
                    </td>
                    <td className="table-td text-slate-500 text-sm">{a.type || '—'}</td>
                    <td className="table-td text-slate-600 text-xs whitespace-nowrap">
                      {a.date ? formatDate(a.date) : '—'}
                      {a.timeStart && <><br /><span className="text-slate-400">{a.timeStart}{a.timeEnd ? ` – ${a.timeEnd}` : ''}</span></>}
                    </td>
                    <td className="table-td">
                      <Badge status={a.status} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {action ? (
                          <button
                            onClick={() => advanceStatus(a)}
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${action.color}`}
                          >
                            <ActionIcon size={11} /> {action.label}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                        {(a.status === 'Scheduled' || a.status === 'Checked In') && (
                          <button
                            onClick={() => cancelAppt(a)}
                            title="Cancel appointment"
                            className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
                          >
                            <XIcon size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setConfirmId(a.id); setConfirmLabel(`${a.patientName} w/ ${a.doctorName}`) }} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {visibleAppts.length} appointments · Use Quick Action to advance status
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Appointment' : 'Schedule Appointment'} icon={Calendar} accentColor="teal">
        <AppointmentForm form={form} setForm={setForm} patients={patients} doctors={doctors} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Schedule'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteAppointment(confirmId, confirmLabel); showToast('Appointment deleted.', 'info') }}
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  )
}

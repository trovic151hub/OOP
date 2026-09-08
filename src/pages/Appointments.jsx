import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Calendar, ArrowRight, Filter, Tag, Search, Download, UserCheck, PlayCircle, CheckCheck, X as XIcon, Stethoscope } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Combobox from '../components/ui/Combobox'
import FormDropdown from '../components/ui/FormDropdown'
import FilterDropdown from '../components/ui/FilterDropdown'
import DatePicker from '../components/ui/DatePicker'
import TimePicker from '../components/ui/TimePicker'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { formatDate, APPOINTMENT_STATUSES, cycleStatus } from '../utils/helpers'
import { exportAppointments } from '../utils/exportCSV'

const EMPTY_FORM = { patientName: '', patientId: '', patientEmail: '', doctorName: '', date: '', timeStart: '', timeEnd: '', type: 'Consultation', notes: '', status: 'Scheduled', requiresFollowUp: false, followUpDate: '', followUpNotes: '' }
const APPT_TYPES = ['Consultation','Follow-up','Surgery','Telemedicine','Check-up']

const STATUS_ACTIONS = {
  'Requested':   { label: 'Confirm',    icon: CheckCheck,  next: 'Scheduled',   color: 'bg-amber-50 dark:bg-amber-500/12 text-amber-600 hover:bg-amber-100 border-amber-200 dark:border-amber-500/30' },
  'Reschedule Requested': { label: 'Review', icon: CheckCheck, next: 'Scheduled', color: 'bg-amber-50 dark:bg-amber-500/12 text-amber-600 hover:bg-amber-100 border-amber-200 dark:border-amber-500/30' },
  'Cancel Requested': { label: 'Review', icon: CheckCheck, next: 'Cancelled', color: 'bg-red-50 dark:bg-red-500/12 text-red-500 hover:bg-red-100 border-red-200 dark:border-red-500/30' },
  'Scheduled':   { label: 'Check In',    icon: UserCheck,  next: 'Checked In',  color: 'bg-violet-50 dark:bg-violet-500/12 text-violet-600 hover:bg-violet-100 border-violet-200 dark:border-violet-500/30' },
  'Checked In':  { label: 'Start',       icon: PlayCircle, next: 'In Progress',  color: 'bg-blue-50 dark:bg-blue-500/12 text-blue-600 hover:bg-blue-100 border-blue-200 dark:border-blue-500/30' },
  'In Progress': { label: 'Complete',    icon: CheckCheck, next: 'Completed',    color: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-600 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-500/30' },
  'Completed':   null,
  'Cancelled':   null,
}

function addMinutesToTime(time, minutes) {
  if (!time || !minutes) return ''
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + Number(minutes)
  const hh = Math.floor((total % (24 * 60)) / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function AppointmentForm({ form, setForm, patients, doctors, settings }) {
  const set = k => e => setForm(f => {
    const updated = { ...f, [k]: e.target.value }
    if (k === 'timeStart' && settings?.appointmentDuration) {
      updated.timeEnd = addMinutesToTime(e.target.value, settings.appointmentDuration)
    }
    return updated
  })
  const setDirect = k => v => setForm(f => ({ ...f, [k]: v }))
  const setTimeStart = v => setForm(f => {
    const updated = { ...f, timeStart: v }
    if (settings?.appointmentDuration) updated.timeEnd = addMinutesToTime(v, settings.appointmentDuration)
    return updated
  })
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <label className="label">Patient Name <span className="text-red-400">*</span></label>
        <Combobox
          value={form.patientName}
          onChange={v => {
            const pat = patients.find(p => p.name === v)
            setForm(f => ({ ...f, patientName: v, patientId: pat?.id || '', patientEmail: pat?.email || '' }))
          }}
          options={patients}
          getLabel={p => p.name}
          getSub={p => p.phone}
          placeholder="e.g. John Smith"
        />
      </div>
      <div>
        <label className="label">Doctor Name <span className="text-red-400">*</span></label>
        <Combobox
          value={form.doctorName}
          onChange={setDirect('doctorName')}
          options={doctors}
          getLabel={d => d.name}
          getSub={d => d.specialty}
          placeholder="e.g. Dr. Sarah Lee"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <DatePicker value={form.date} onChange={setDirect('date')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Time{settings?.workingHoursStart && settings?.workingHoursEnd ? ` (${settings.workingHoursStart}–${settings.workingHoursEnd})` : ''}</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <TimePicker value={form.timeStart} onChange={setTimeStart} min={settings?.workingHoursStart} max={settings?.workingHoursEnd} />
            </div>
            <ArrowRight size={14} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <TimePicker value={form.timeEnd} onChange={setDirect('timeEnd')} min={settings?.workingHoursStart} max={settings?.workingHoursEnd} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Appointment Type</label>
          <FormDropdown
            value={form.type}
            onChange={setDirect('type')}
            options={APPT_TYPES.map(v => ({ value: v, label: v }))}
          />
        </div>
        <div>
          <label className="label">Status</label>
          <FormDropdown
            value={form.status}
            onChange={setDirect('status')}
            options={APPOINTMENT_STATUSES.map(v => ({ value: v, label: v }))}
          />
        </div>
      </div>
      <div>
        <label className="label">Notes / Reason</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Reason for visit, symptoms…" value={form.notes} onChange={set('notes')} />
      </div>
      <div className="border border-dashed border-teal-200 dark:border-teal-500/30 rounded-xl p-4 bg-teal-50/40 dark:bg-teal-500/10">
        <label className="flex items-center gap-2.5 cursor-pointer mb-3">
          <input
            type="checkbox"
            className="w-4 h-4 accent-teal-600 cursor-pointer"
            checked={!!form.requiresFollowUp}
            onChange={e => setForm(f => ({ ...f, requiresFollowUp: e.target.checked, followUpDate: e.target.checked ? f.followUpDate : '' }))}
          />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Requires Follow-up</span>
        </label>
        {form.requiresFollowUp && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label">Follow-up Date</label>
              <DatePicker value={form.followUpDate} onChange={setDirect('followUpDate')} />
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
  const { appointments, patients, doctors, loading, settings } = useStore()
  const showToast = useToast()

  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType]     = useState('All')
  const [myOnly, setMyOnly]             = useState(currentUser?.role === 'Doctor')
  const [modal, setModal]               = useState(false)
  const [editId, setEditId]             = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [decisionAppointment, setDecisionAppointment] = useState(null)
  const [decisionStatus, setDecisionStatus] = useState('')
  const [decisionKind, setDecisionKind] = useState('approve')
  const [decisionNote, setDecisionNote] = useState('')
  const [decisionSaving, setDecisionSaving] = useState(false)
  const [confirmId, setConfirmId]       = useState(null)
  const [confirmLabel, setConfirmLabel] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const isDoctor = currentUser?.role === 'Doctor'
  const canReviewRequests = ['Admin', 'Receptionist'].includes(currentUser?.role)
  const linkedDoctor = isDoctor ? doctors.find(d => d.uid === currentUser?.uid) : null
  const myDoctorName = linkedDoctor?.name || ''
  const appointmentRequests = appointments.filter(a => ['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(a.status))

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
    const pat = patients.find(p => p.id === form.patientId || p.name === form.patientName)
    const payload = { ...form, patientId: pat?.id || form.patientId || '', patientEmail: pat?.email || form.patientEmail || '' }
    if (editId) { store.updateAppointment(editId, payload); showToast('Appointment updated.') }
    else { store.addAppointment(payload); showToast('Appointment scheduled.') }
    setModal(false)
  }

  function advanceStatus(a) {
    if (['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(a.status)) {
      openDecision(a, getApprovalStatus(a), 'approve')
      return
    }
    const next = cycleStatus(a.status)
    if (next === a.status) return
    const extra = next === 'Checked In'  ? { checkedInAt: new Date().toISOString() }
                : next === 'In Progress' ? { startedAt: new Date().toISOString() }
                : {}
    store.updateAppointment(a.id, { status: next, ...extra })
    showToast(`${a.patientName} → ${next}`, 'info')
  }

  function cancelAppt(a) {
    store.updateAppointment(a.id, { status: 'Cancelled' })
    showToast(`Appointment cancelled.`, 'info')
  }

  function getApprovalStatus(a) {
    if (a.status === 'Cancel Requested') return 'Cancelled'
    return 'Scheduled'
  }

  function getDeclineStatus(a) {
    if (['Reschedule Requested', 'Cancel Requested'].includes(a.status)) return a.previousStatus || 'Scheduled'
    return 'Cancelled'
  }

  function openDecision(a, status, kind = 'approve') {
    setDecisionAppointment(a)
    setDecisionStatus(status)
    setDecisionKind(kind)
    setDecisionNote(a.staffNote || '')
  }

  function closeDecision() {
    if (decisionSaving) return
    setDecisionAppointment(null)
    setDecisionStatus('')
    setDecisionKind('approve')
    setDecisionNote('')
  }

  async function submitDecision() {
    if (!decisionAppointment) return
    const note = decisionNote.trim()
    if (decisionKind === 'decline' && !note) {
      showToast('Please add a reason before declining.', 'error')
      return
    }
    setDecisionSaving(true)
    try {
      await store.updateAppointment(decisionAppointment.id, {
        status: decisionStatus,
        date: decisionStatus === 'Scheduled' && decisionAppointment.requestedDate ? decisionAppointment.requestedDate : decisionAppointment.date,
        timeStart: decisionStatus === 'Scheduled' && decisionAppointment.requestedTimeStart ? decisionAppointment.requestedTimeStart : decisionAppointment.timeStart,
        timeEnd: decisionStatus === 'Scheduled' && decisionAppointment.requestedTimeEnd ? decisionAppointment.requestedTimeEnd : decisionAppointment.timeEnd,
        staffNote: note,
        decisionKind,
        previousStatus: '',
        requestedDate: '',
        requestedTimeStart: '',
        requestedTimeEnd: '',
        patientRequestNote: '',
        reviewedBy: currentUser?.name || currentUser?.email || currentUser?.role,
        reviewedAt: new Date().toISOString(),
      })
      showToast(`${decisionAppointment.patientName} request ${decisionKind === 'approve' ? 'approved' : 'declined'}.`, decisionKind === 'approve' ? 'success' : 'info')
      closeDecision()
    } catch (err) {
      showToast(err.message || 'Failed to update request.', 'error')
    } finally {
      setDecisionSaving(false)
    }
  }

  if (loading) return <SkeletonTable rows={6} cols={7} />

  const statusCounts = APPOINTMENT_STATUSES.reduce((acc, s) => {
    acc[s] = appointments.filter(a => a.status === s).length
    return acc
  }, {})

  const STATUS_COLORS = {
    'Requested':   'text-amber-600 bg-amber-50 dark:bg-amber-500/12',
    'Reschedule Requested': 'text-amber-600 bg-amber-50 dark:bg-amber-500/12',
    'Cancel Requested': 'text-red-500 bg-red-50 dark:bg-red-500/12',
    'Scheduled':   'text-teal-600 bg-teal-50 dark:bg-teal-500/12',
    'Checked In':  'text-violet-600 bg-violet-50 dark:bg-violet-500/12',
    'In Progress': 'text-blue-600 bg-blue-50 dark:bg-blue-500/12',
    'Completed':   'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/12',
    'Cancelled':   'text-red-500 bg-red-50 dark:bg-red-500/12',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Appointments</h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">{appointments.length} total appointments</p>
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
          const [tc, bc] = (STATUS_COLORS[s] || 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800').split(' ')
          return (
            <div key={s} className="card p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 mb-1">{s}</p>
              <p className={`text-2xl font-extrabold ${tc}`}>{statusCounts[s]}</p>
            </div>
          )
        })}
      </div>

      {canReviewRequests && appointmentRequests.length > 0 && (
        <div className="card overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Appointment Requests</h3>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{appointmentRequests.length} waiting for review</p>
            </div>
            <button
              onClick={() => setFilterStatus('Requested')}
              className="btn-ghost text-xs"
            >
              <Filter size={13} /> View All
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {appointmentRequests.slice(0, 5).map(a => {
              const doc = doctors.find(d => d.name === a.doctorName)
              const requestedAt = a.requestedAt ? formatDate(a.requestedAt) : null
              return (
                <div key={a.id} className="p-4 flex flex-col xl:flex-row xl:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar name={a.patientName} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.patientName || 'Unnamed Patient'}</p>
                        <Badge status={a.status} />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                        {a.type || 'Consultation'} with {a.doctorName || 'Any Available Doctor'}{doc?.specialty ? ` · ${doc.specialty}` : ''}
                      </p>
                      {a.status === 'Reschedule Requested' && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          Requested: {a.requestedDate ? formatDate(a.requestedDate) : 'date pending'}{a.requestedTimeStart ? ` at ${a.requestedTimeStart}` : ''}
                        </p>
                      )}
                      {a.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 max-w-3xl line-clamp-2">{a.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:justify-end">
                    <div className="text-xs text-slate-500 dark:text-slate-500 min-w-36">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{a.date ? formatDate(a.date) : 'Date not selected'}</p>
                      <p>{a.timeStart || 'Time pending'}{a.timeEnd ? ` - ${a.timeEnd}` : ''}{requestedAt ? ` · Requested ${requestedAt}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openDecision(a, getApprovalStatus(a), 'approve')}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border bg-emerald-50 dark:bg-emerald-500/12 text-emerald-600 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-500/30 transition-colors"
                      >
                        <CheckCheck size={12} /> Approve
                      </button>
                      <button
                        onClick={() => openEdit(a)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => openDecision(a, getDeclineStatus(a), 'decline')}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border bg-red-50 dark:bg-red-500/12 text-red-500 hover:bg-red-100 border-red-200 dark:border-red-500/30 transition-colors"
                      >
                        <XIcon size={12} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or doctor…"
            style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
            className="input-field border-slate-200 dark:border-slate-700 focus:shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDoctor && (
            <button
              onClick={() => setMyOnly(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${myOnly ? 'bg-teal-50 dark:bg-teal-500/12 border-teal-300 text-teal-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Stethoscope size={12} />
              {myOnly ? 'My Appointments' : 'All Appointments'}
            </button>
          )}
          <FilterDropdown
            icon={Filter}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[{ value: 'All', label: 'All Status' }, ...APPOINTMENT_STATUSES.map(s => ({ value: s, label: s }))]}
          />
          <FilterDropdown
            icon={Tag}
            value={filterType}
            onChange={setFilterType}
            options={[{ value: 'All', label: 'All Types' }, ...APPT_TYPES.map(t => ({ value: t, label: t }))]}
          />
          {(search || filterStatus !== 'All' || filterType !== 'All') && (
            <button
              onClick={() => { setSearch(''); setFilterStatus('All'); setFilterType('All') }}
              className="text-xs font-semibold text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
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
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
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
                const canAdvance = action && (a.status !== 'Scheduled' || !a.date || a.date <= today)
                return (
                  <tr key={a.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.patientName} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.patientName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-600">{pat?.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{a.doctorName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">{doc?.specialty || '—'}</p>
                    </td>
                    <td className="table-td text-slate-500 text-sm">{a.type || '—'}</td>
                    <td className="table-td text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                      {a.date ? formatDate(a.date) : '—'}
                      {a.timeStart && <><br /><span className="text-slate-400 dark:text-slate-600">{a.timeStart}{a.timeEnd ? ` – ${a.timeEnd}` : ''}</span></>}
                    </td>
                    <td className="table-td">
                      <Badge status={a.status} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {canAdvance ? (
                          <button
                            onClick={() => advanceStatus(a)}
                            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${action.color}`}
                          >
                            <ActionIcon size={11} /> {action.label}
                          </button>
                        ) : action ? (
                          <span className="text-xs text-slate-300 dark:text-slate-700" title="Check-in becomes available on the scheduled date">Not yet</span>
                        ) : (
                          <span className="text-xs text-slate-300 dark:text-slate-700">—</span>
                        )}
                        {(a.status === 'Scheduled' || a.status === 'Checked In') && (
                          <button
                            onClick={() => cancelAppt(a)}
                            title="Cancel appointment"
                            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:bg-red-50 hover:text-red-400 transition-colors"
                          >
                            <XIcon size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setConfirmId(a.id); setConfirmLabel(`${a.patientName} w/ ${a.doctorName}`) }} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors">
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
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
            Showing {filtered.length} of {visibleAppts.length} appointments · Use Quick Action to advance status
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Appointment' : 'Schedule Appointment'} icon={Calendar} accentColor="teal">
        <AppointmentForm form={form} setForm={setForm} patients={patients} doctors={doctors} settings={settings} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Schedule'}
          </button>
        </div>
      </Modal>

      <Modal
        open={!!decisionAppointment}
        onClose={closeDecision}
        title={decisionKind === 'approve' ? 'Approve Request' : 'Decline Request'}
        icon={decisionKind === 'approve' ? CheckCheck : XIcon}
        accentColor={decisionKind === 'approve' ? 'teal' : 'red'}
      >
        {decisionAppointment && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{decisionAppointment.patientName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {decisionAppointment.type || 'Appointment'} with {decisionAppointment.doctorName || 'Any Available Doctor'}
                {decisionAppointment.date ? ` on ${formatDate(decisionAppointment.date)}` : ''}
                {decisionAppointment.timeStart ? ` at ${decisionAppointment.timeStart}` : ''}
              </p>
              {decisionAppointment.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-3 italic">{decisionAppointment.notes}</p>
              )}
            </div>
            <div>
              <label className="label">
                Staff Note {decisionKind === 'decline' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={decisionNote}
                onChange={e => setDecisionNote(e.target.value)}
                placeholder={decisionKind === 'approve' ? 'Optional instructions for the patient' : 'Reason for declining this request'}
              />
            </div>
            <div className="flex gap-3">
              <button disabled={decisionSaving} onClick={closeDecision} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button
                disabled={decisionSaving}
                onClick={submitDecision}
                className={`flex-1 justify-center ${decisionKind === 'approve' ? 'btn-primary' : 'bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2.5 font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'}`}
              >
                {decisionSaving ? 'Saving...' : decisionKind === 'approve' ? 'Approve Request' : 'Decline Request'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteAppointment(confirmId, confirmLabel); showToast('Appointment deleted.', 'info') }}
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  )
}

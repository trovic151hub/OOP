import React, { useState } from 'react'
import { Phone, Mail, MapPin, Droplets, User, Pencil, Plus, Trash2, FileText, Calendar } from 'lucide-react'
import NairaIcon from './ui/NairaIcon'
import Drawer, { DrawerTabs } from './ui/Drawer'
import Badge from './ui/Badge'
import Avatar from './ui/Avatar'
import FormDropdown from './ui/FormDropdown'
import Combobox from './ui/Combobox'
import DatePicker from './ui/DatePicker'
import { useStore, store } from '../store/useStore'
import { formatDate, getBadgeStyle, withDrPrefix, formatCurrency } from '../utils/helpers'
import { useToast } from '../context/ToastContext'

const RECORD_TYPES = ['Consultation', 'Check-up', 'Follow-up', 'Emergency', 'Surgery', 'Lab Results', 'Imaging', 'Other']
const EMPTY_REC = { date: '', type: 'Consultation', doctorName: '', diagnosis: '', treatment: '', prescription: '', notes: '', followUpDate: '' }

function MedRecordForm({ form, setForm, doctors }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
        </div>
        <div>
          <label className="label">Type</label>
          <FormDropdown value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={RECORD_TYPES.map(t => ({ value: t, label: t }))} />
        </div>
        <div className="col-span-2">
          <label className="label">Doctor</label>
          <Combobox value={form.doctorName} onChange={v => setForm(f => ({ ...f, doctorName: v }))} options={doctors} getLabel={d => d.name} getSub={d => d.specialty} placeholder="Dr. name" />
        </div>
        <div className="col-span-2">
          <label className="label">Diagnosis</label>
          <input className="input-field" placeholder="e.g. Hypertension Stage 2" value={form.diagnosis} onChange={set('diagnosis')} />
        </div>
        <div className="col-span-2">
          <label className="label">Treatment</label>
          <input className="input-field" placeholder="e.g. Lifestyle modification, medication" value={form.treatment} onChange={set('treatment')} />
        </div>
        <div className="col-span-2">
          <label className="label">Prescription</label>
          <input className="input-field" placeholder="e.g. Amlodipine 5mg daily" value={form.prescription} onChange={set('prescription')} />
        </div>
        <div>
          <label className="label">Follow-up Date</label>
          <DatePicker value={form.followUpDate} onChange={v => setForm(f => ({ ...f, followUpDate: v }))} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Additional notes…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}

export default function PatientDrawer({ patient, onClose, currentUser, onEdit }) {
  const { appointments, medicalRecords, billing, doctors, settings } = useStore()
  const showToast = useToast()
  const [tab, setTab]       = useState('overview')
  const [recForm, setRecForm] = useState(EMPTY_REC)
  const [addRec, setAddRec] = useState(false)

  if (!patient) return null

  const patAppts = appointments.filter(a => a.patientName === patient.name)
  // Match by patientId when present, falling back to name — demo/legacy records
  // (e.g. seeded medical records, billing entries created before a patientId
  // was captured) only carry the name, not a real patient id.
  const patRecords = medicalRecords.filter(r => r.patientId === patient.id || r.patientName === patient.name)
  const patBilling = billing.filter(b => b.patientId === patient.id || b.patientName === patient.name)

  const totalBilled = patBilling.reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const totalPaid   = patBilling.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)

  async function saveRecord() {
    if (!recForm.date) { showToast('Date is required.', 'error'); return }
    await store.addMedicalRecord({ ...recForm, patientId: patient.id, patientName: patient.name })
    if (recForm.prescription) {
      const deducted = await store.deductInventoryForPrescription(recForm.prescription)
      if (deducted.length > 0) {
        showToast(`Record added. Inventory updated: ${deducted.join(', ')}.`, 'success')
      } else {
        showToast('Record added.', 'success')
      }
    } else {
      showToast('Record added.', 'success')
    }
    setRecForm(EMPTY_REC)
    setAddRec(false)
  }

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'appointments', label: 'Appointments', count: patAppts.length },
    { id: 'records',   label: 'Medical Records', count: patRecords.length },
    { id: 'billing',   label: 'Billing', count: patBilling.length },
  ]

  return (
    <Drawer
      open={!!patient}
      onClose={onClose}
      title={patient.name}
      subtitle={`#${patient.id?.slice(-6).toUpperCase()} · ${patient.patientType || 'Patient'}`}
    >
      <div className="flex flex-col h-full">
        <DrawerTabs tabs={tabs} active={tab} onChange={setTab} />

        <div className="flex-1 overflow-y-auto">
          {tab === 'overview' && (
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start gap-5">
                <Avatar name={patient.name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{patient.name}</h3>
                      <p className="text-sm text-slate-400 dark:text-slate-600">{patient.gender} · {patient.age} years old</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={patient.status || 'Active'} />
                      <button onClick={() => onEdit(patient)} className="btn-ghost text-xs py-1 px-2">
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      { icon: Droplets, label: 'Blood Type', val: patient.blood || '—' },
                      { icon: User, label: 'Type', val: patient.patientType || '—' },
                      { icon: Phone, label: 'Phone', val: patient.phone || '—' },
                      { icon: Mail, label: 'Email', val: patient.email || '—' },
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

              {(patient.condition || patient.notes) && (
                <div className="grid grid-cols-1 gap-3">
                  {patient.condition && (
                    <div className="bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">Current Condition</p>
                      <p className="text-sm text-teal-800 font-medium">{patient.condition}</p>
                    </div>
                  )}
                  {patient.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <MapPin size={14} className="text-slate-400 dark:text-slate-600" />
                      <span className="font-medium">{patient.location}</span>
                    </div>
                  )}
                  {patient.notes && (
                    <div className="bg-amber-50 dark:bg-amber-500/12 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-amber-800">{patient.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Appointments', value: patAppts.length, color: 'text-teal-600' },
                  { label: 'Medical Records', value: patRecords.length, color: 'text-blue-600' },
                  { label: 'Total Billed', value: formatCurrency(totalBilled, settings?.currency), color: 'text-emerald-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {patRecords.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Latest Record</p>
                    <button onClick={() => setTab('records')} className="text-xs text-teal-600 hover:underline">View all</button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/12 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{patRecords[0].diagnosis || patRecords[0].type}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600">{formatDate(patRecords[0].date)} · {patRecords[0].doctorName}</p>
                        {patRecords[0].prescription && <p className="text-xs text-teal-600 mt-1">Rx: {patRecords[0].prescription}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'appointments' && (
            <div className="p-6 flex flex-col gap-3">
              {patAppts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                  <Calendar size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No appointments yet</p>
                </div>
              ) : patAppts.map(a => (
                <div key={a.id} className="card p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center flex-shrink-0">
                    <Calendar size={15} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.type || 'Consultation'}</p>
                      <Badge status={a.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{withDrPrefix(a.doctorName)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{formatDate(a.date)} {a.timeStart ? `· ${a.timeStart}` : ''}</p>
                    {a.notes && <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 italic">"{a.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'records' && (
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Medical Records</p>
                <button onClick={() => setAddRec(v => !v)} className="btn-primary text-xs py-1.5 px-3">
                  <Plus size={13} /> {addRec ? 'Cancel' : 'Add Record'}
                </button>
              </div>

              {addRec && (
                <div className="card p-4 border-2 border-teal-100 dark:border-teal-500/20">
                  <p className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wide">New Medical Record</p>
                  <MedRecordForm form={recForm} setForm={setRecForm} doctors={doctors} />
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setAddRec(false)} className="btn-ghost flex-1 justify-center text-sm">Cancel</button>
                    <button onClick={saveRecord} className="btn-primary flex-1 justify-center text-sm">Save Record</button>
                  </div>
                </div>
              )}

              {patRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                  <FileText size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No medical records yet</p>
                </div>
              ) : patRecords.map(r => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-blue-100 dark:bg-blue-500/18 text-blue-700 px-2 py-0.5 rounded-full">{r.type}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-600">{formatDate(r.date)}</span>
                    </div>
                    <button onClick={() => store.deleteMedicalRecord(r.id)} className="p-1 rounded text-slate-300 dark:text-slate-700 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {r.doctorName && <p className="text-xs text-teal-600 font-medium mb-2">{withDrPrefix(r.doctorName)}</p>}
                  {r.diagnosis && <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{r.diagnosis}</p>}
                  {r.treatment && <p className="text-xs text-slate-500 mb-1"><strong>Treatment:</strong> {r.treatment}</p>}
                  {r.prescription && <p className="text-xs text-slate-500 mb-1"><strong>Rx:</strong> {r.prescription}</p>}
                  {r.notes && <p className="text-xs text-slate-400 dark:text-slate-600 italic mt-1">{r.notes}</p>}
                  {r.followUpDate && (
                    <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-500/12 text-amber-700 rounded-lg px-2 py-1">
                      Follow-up: {formatDate(r.followUpDate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'billing' && (
            <div className="p-6 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div className="card p-4 text-center">
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{formatCurrency(totalBilled, settings?.currency)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Total Billed</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(totalPaid, settings?.currency)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">Total Paid</p>
                </div>
              </div>

              {patBilling.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                  <NairaIcon size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No billing records yet</p>
                </div>
              ) : patBilling.map(b => (
                <div key={b.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{b.description || 'Medical Service'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{formatDate(b.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(b.total, settings?.currency)}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-500/18 text-emerald-700' :
                      b.status === 'Overdue' ? 'bg-red-100 dark:bg-red-500/18 text-red-600' :
                      'bg-amber-100 dark:bg-amber-500/18 text-amber-700'
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}

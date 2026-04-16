import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Pill, Search, Filter, Download, Printer } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'

const RX_STATUSES = ['Active', 'Completed', 'Cancelled']
const FREQUENCIES  = ['Once daily', 'Twice daily', '3x daily', '4x daily', 'Every 6h', 'Every 8h', 'Every 12h', 'As needed', 'Before meals', 'After meals']
const DURATIONS    = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '1 month', '3 months', 'Ongoing']

const EMPTY_FORM = {
  patientName: '', doctorName: '', date: '', status: 'Active', notes: '',
  medications: [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }],
}

function MedRow({ med, idx, onChange, onRemove, canRemove }) {
  const set = k => e => onChange(idx, { ...med, [k]: e.target.value })
  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-start">
      <div className="col-span-2 sm:col-span-4">
        <input className="input-field" placeholder="Medication name" value={med.name} onChange={set('name')} />
      </div>
      <div className="col-span-1 sm:col-span-2">
        <input className="input-field" placeholder="Dosage e.g. 500mg" value={med.dosage} onChange={set('dosage')} />
      </div>
      <div className="col-span-1 sm:col-span-3">
        <select className="input-field" value={med.frequency} onChange={set('frequency')}>
          {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div className="col-span-1 sm:col-span-2">
        <select className="input-field" value={med.duration} onChange={set('duration')}>
          {DURATIONS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="col-span-1 sm:col-span-1 flex items-center justify-center pt-2.5">
        {canRemove && (
          <button type="button" onClick={() => onRemove(idx)} className="text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function PrescriptionForm({ form, setForm, patients, doctors }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  function updateMed(idx, med) { setForm(f => { const m = [...f.medications]; m[idx] = med; return { ...f, medications: m } }) }
  function removeMed(idx) { setForm(f => ({ ...f, medications: f.medications.filter((_, i) => i !== idx) })) }
  function addMed() { setForm(f => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }] })) }
  return (
    <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Patient <span className="text-red-400">*</span></label>
          <input className="input-field" list="rx-patients" placeholder="Patient name…" value={form.patientName} onChange={set('patientName')} />
          <datalist id="rx-patients">{patients.map(p => <option key={p.id} value={p.name} />)}</datalist>
        </div>
        <div>
          <label className="label">Doctor <span className="text-red-400">*</span></label>
          <input className="input-field" list="rx-doctors" placeholder="Doctor name…" value={form.doctorName} onChange={set('doctorName')} />
          <datalist id="rx-doctors">{doctors.map(d => <option key={d.id} value={d.name} />)}</datalist>
        </div>
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <input className="input-field" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {RX_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label" style={{ marginBottom: 0 }}>Medications <span className="text-red-400">*</span></label>
          <button type="button" onClick={addMed} className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            <Plus size={11} /> Add Medication
          </button>
        </div>
        <div className="hidden sm:grid grid-cols-12 gap-2 mb-1 px-0.5">
          {['Name', 'Dosage', 'Frequency', 'Duration', ''].map((h, i) => (
            <div key={i} className={`text-[9px] font-bold text-slate-400 uppercase tracking-wide ${i === 0 ? 'col-span-4' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-3' : i === 3 ? 'col-span-2' : 'col-span-1'}`}>{h}</div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {form.medications.map((med, idx) => (
            <MedRow key={idx} med={med} idx={idx} onChange={updateMed} onRemove={removeMed} canRemove={form.medications.length > 1} />
          ))}
        </div>
      </div>

      <div>
        <label className="label">Notes / Instructions</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Additional instructions…" value={form.notes} onChange={set('notes')} />
      </div>
    </div>
  )
}

function PrintPreview({ rx }) {
  return (
    <div id="rx-print" className="font-sans text-slate-800 p-6">
      <div className="border-b-2 border-teal-600 pb-4 mb-4">
        <h1 className="text-2xl font-extrabold text-teal-700">MedCore</h1>
        <p className="text-xs text-slate-500">Medical Practice Management System</p>
      </div>
      <div className="flex justify-between mb-4 text-sm">
        <div>
          <p className="font-bold text-slate-500 text-xs uppercase">Patient</p>
          <p className="font-extrabold text-lg">{rx.patientName}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-500 text-xs uppercase">Doctor</p>
          <p className="font-semibold">{rx.doctorName}</p>
          <p className="text-xs text-slate-400">{rx.date ? formatDate(rx.date) : '—'}</p>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Medications</p>
      <table className="w-full text-sm mb-4">
        <thead><tr className="border-b border-slate-200">
          {['Medication','Dosage','Frequency','Duration'].map(h => <th key={h} className="text-left py-1 text-xs font-bold text-slate-500">{h}</th>)}
        </tr></thead>
        <tbody>{(rx.medications || []).map((m, i) => (
          <tr key={i} className="border-b border-slate-50">
            <td className="py-2 font-semibold">{m.name}</td>
            <td className="py-2">{m.dosage}</td>
            <td className="py-2">{m.frequency}</td>
            <td className="py-2">{m.duration}</td>
          </tr>
        ))}</tbody>
      </table>
      {rx.notes && <div className="bg-slate-50 rounded-lg p-3 text-sm"><span className="font-bold">Notes: </span>{rx.notes}</div>}
      <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-400 flex justify-between">
        <span>Rx ID: {rx.id}</span>
        <span>Printed: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}

export default function Prescriptions({ currentUser }) {
  const { prescriptions = [], patients, doctors } = useStore()
  const showToast = useToast()

  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]             = useState(false)
  const [editId, setEditId]           = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]     = useState(null)
  const [printRx, setPrintRx]         = useState(null)

  const isDoctor = currentUser?.role === 'Doctor'
  const linkedDoc = isDoctor ? doctors.find(d => d.uid === currentUser?.uid) : null

  const visible = isDoctor && linkedDoc
    ? prescriptions.filter(r => r.doctorName === linkedDoc.name)
    : prescriptions

  const filtered = visible.filter(r => {
    const q = search.toLowerCase()
    return (
      (r.patientName?.toLowerCase().includes(q) || r.doctorName?.toLowerCase().includes(q)) &&
      (filterStatus === 'All' || r.status === filterStatus)
    )
  })

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10), doctorName: isDoctor ? linkedDoc?.name || '' : '' })
    setEditId(null); setModal(true)
  }
  function openEdit(r) { setForm({ ...EMPTY_FORM, ...r, medications: r.medications || [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }] }); setEditId(r.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim() || !form.doctorName.trim()) { showToast('Patient and doctor are required.', 'error'); return }
    if (!form.date) { showToast('Date is required.', 'error'); return }
    if (form.medications.some(m => !m.name.trim())) { showToast('All medication names are required.', 'error'); return }
    if (editId) { store.updatePrescription(editId, form); showToast('Prescription updated.') }
    else { store.addPrescription(form); showToast('Prescription saved.') }
    setModal(false)
  }

  function printPrescription(rx) {
    setPrintRx(rx)
    setTimeout(() => { window.print(); setPrintRx(null) }, 200)
  }

  function exportCSV() {
    const rows = [
      ['Patient','Doctor','Date','Status','Medications','Notes'],
      ...filtered.map(r => [r.patientName, r.doctorName, r.date, r.status,
        (r.medications||[]).map(m=>`${m.name} ${m.dosage} ${m.frequency} x ${m.duration}`).join('; '),
        r.notes
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'prescriptions.csv'; a.click()
  }

  const counts = { All: visible.length, Active: visible.filter(r=>r.status==='Active').length, Completed: visible.filter(r=>r.status==='Completed').length, Cancelled: visible.filter(r=>r.status==='Cancelled').length }

  return (
    <div>
      {printRx && (
        <div className="fixed inset-0 bg-white z-[999] print-only">
          <PrintPreview rx={printRx} />
        </div>
      )}

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Prescriptions</h2>
          <p className="text-sm text-slate-400 mt-0.5">{visible.length} total · {counts.Active} active</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs"><Download size={13} /> Export</button>
          <button onClick={openAdd} className="btn-primary"><Plus size={15} /> New Prescription</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',     value: counts.All,       color: 'text-slate-700',   border: 'border-slate-200' },
          { label: 'Active',    value: counts.Active,    color: 'text-teal-700',    border: 'border-teal-200' },
          { label: 'Completed', value: counts.Completed, color: 'text-emerald-700', border: 'border-emerald-200' },
          { label: 'Cancelled', value: counts.Cancelled, color: 'text-red-600',     border: 'border-red-200' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`card p-4 border ${border}`}>
            <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search by patient or doctor…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Filter size={14} className="text-slate-400" />
        {['All','Active','Completed','Cancelled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${filterStatus === s ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {s} ({counts[s] ?? ''})
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
            <Pill size={36} className="text-slate-200 mb-3" />
            <p className="text-sm font-medium">{search ? 'No results' : 'No prescriptions yet'}</p>
            {!search && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First</button>}
          </div>
        ) : filtered.map(r => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar name={r.patientName} size="md" />
                <div>
                  <p className="font-bold text-slate-800">{r.patientName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dr. {r.doctorName} · {r.date ? formatDate(r.date) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={r.status} />
                <button onClick={() => printPrescription(r)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" title="Print prescription">
                  <Printer size={14} />
                </button>
                <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setConfirmId(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(r.medications || []).map((m, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs">
                  <p className="font-bold text-slate-700">{m.name} <span className="font-normal text-teal-600">{m.dosage}</span></p>
                  <p className="text-slate-400">{m.frequency} · {m.duration}</p>
                </div>
              ))}
            </div>

            {r.notes && <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-50 pt-2">📝 {r.notes}</p>}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Prescription' : 'New Prescription'} icon={Pill} accentColor="teal">
        <PrescriptionForm form={form} setForm={setForm} patients={patients} doctors={doctors} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Save Prescription'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deletePrescription(confirmId); showToast('Deleted.', 'info') }}
        message="Delete this prescription? This cannot be undone."
      />
    </div>
  )
}

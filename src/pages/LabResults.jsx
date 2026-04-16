import React, { useState } from 'react'
import { Plus, Pencil, Trash2, FlaskConical, Search, Filter, Download } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'

const RESULT_STATUSES = ['Pending', 'Normal', 'Abnormal']
const TEST_CATEGORIES = [
  'All','Blood Work','Urinalysis','Imaging','Microbiology','Pathology',
  'Cardiology','Biochemistry','Serology','Toxicology','Genetic','Other'
]
const COMMON_TESTS = [
  'Complete Blood Count (CBC)','Blood Glucose','Liver Function Test (LFT)',
  'Kidney Function Test (KFT)','Lipid Profile','Thyroid Function Test (TFT)',
  'Urinalysis','Chest X-Ray','ECG','Ultrasound','MRI','CT Scan',
  'Blood Culture','HbA1c','COVID-19 PCR','Hepatitis B/C','HIV Test',
]

const EMPTY_FORM = {
  patientName: '', testName: '', category: 'Blood Work', result: '', unit: '',
  normalRange: '', status: 'Pending', date: '', orderedBy: '', notes: '',
}

function LabForm({ form, setForm, patients, doctors }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Patient <span className="text-red-400">*</span></label>
          <input className="input-field" list="lab-patients" placeholder="Search patient…" value={form.patientName} onChange={set('patientName')} />
          <datalist id="lab-patients">{patients.map(p => <option key={p.id} value={p.name} />)}</datalist>
        </div>
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <input className="input-field" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">Test Name <span className="text-red-400">*</span></label>
          <input className="input-field" list="lab-tests" placeholder="e.g. CBC" value={form.testName} onChange={set('testName')} />
          <datalist id="lab-tests">{COMMON_TESTS.map(t => <option key={t} value={t} />)}</datalist>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={form.category} onChange={set('category')}>
            {TEST_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ordered By</label>
          <input className="input-field" list="lab-doctors" placeholder="Doctor name…" value={form.orderedBy} onChange={set('orderedBy')} />
          <datalist id="lab-doctors">{doctors.map(d => <option key={d.id} value={d.name} />)}</datalist>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {RESULT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Result Value</label>
          <input className="input-field" placeholder="e.g. 120" value={form.result} onChange={set('result')} />
        </div>
        <div>
          <label className="label">Unit</label>
          <input className="input-field" placeholder="e.g. mg/dL" value={form.unit} onChange={set('unit')} />
        </div>
        <div className="col-span-2">
          <label className="label">Normal Range</label>
          <input className="input-field" placeholder="e.g. 70–100 mg/dL" value={form.normalRange} onChange={set('normalRange')} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes / Interpretation</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Clinical notes…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}

export default function LabResults({ currentUser }) {
  const { labResults, patients, doctors } = useStore()
  const showToast = useToast()

  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]             = useState(false)
  const [editId, setEditId]           = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]     = useState(null)

  const isDoctor = currentUser?.role === 'Doctor'
  const linkedDoctor = isDoctor ? doctors.find(d => d.uid === currentUser?.uid) : null

  const visibleResults = isDoctor && linkedDoctor
    ? labResults.filter(l => l.orderedBy === linkedDoctor.name)
    : labResults

  const filtered = visibleResults.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = l.patientName?.toLowerCase().includes(q) || l.testName?.toLowerCase().includes(q) || l.orderedBy?.toLowerCase().includes(q)
    const matchCat    = filterCat === 'All' || l.category === filterCat
    const matchStatus = filterStatus === 'All' || l.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  const counts = {
    total:    visibleResults.length,
    pending:  visibleResults.filter(l => l.status === 'Pending').length,
    normal:   visibleResults.filter(l => l.status === 'Normal').length,
    abnormal: visibleResults.filter(l => l.status === 'Abnormal').length,
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10), orderedBy: isDoctor ? (linkedDoctor?.name || '') : '' })
    setEditId(null)
    setModal(true)
  }
  function openEdit(l) { setForm({ ...EMPTY_FORM, ...l }); setEditId(l.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim() || !form.testName.trim()) { showToast('Patient and test name are required.', 'error'); return }
    if (!form.date) { showToast('Please select a date.', 'error'); return }
    if (editId) { store.updateLabResult(editId, form); showToast('Lab result updated.') }
    else { store.addLabResult(form); showToast('Lab result added.') }
    setModal(false)
  }

  function exportCSV() {
    const rows = [
      ['Patient','Test','Category','Date','Result','Unit','Normal Range','Status','Ordered By','Notes'],
      ...filtered.map(l => [l.patientName,l.testName,l.category,l.date,l.result,l.unit,l.normalRange,l.status,l.orderedBy,l.notes]),
    ]
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'lab-results.csv'; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lab Results</h2>
          <p className="text-sm text-slate-400 mt-0.5">{counts.total} results · {counts.pending} pending</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs"><Download size={13} /> Export CSV</button>
          <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Result</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-700', bg: 'border-slate-200' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600', bg: 'border-amber-200' },
          { label: 'Normal', value: counts.normal, color: 'text-emerald-600', bg: 'border-emerald-200' },
          { label: 'Abnormal', value: counts.abnormal, color: 'text-red-600', bg: 'border-red-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card p-4 border ${bg}`}>
            <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search patient, test, doctor…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Filter size={14} className="text-slate-400" />
        <select className="input-field w-auto text-xs" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          {TEST_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input-field w-auto text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          {RESULT_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Patient</th>
                <th className="table-th">Test</th>
                <th className="table-th">Date</th>
                <th className="table-th">Result</th>
                <th className="table-th">Normal Range</th>
                <th className="table-th">Status</th>
                <th className="table-th">Ordered By</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FlaskConical size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No lab results yet'}</p>
                      {!search && <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={13} /> Add First Result</button>}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <Avatar name={l.patientName} size="sm" />
                      <p className="text-sm font-semibold text-slate-800">{l.patientName}</p>
                    </div>
                  </td>
                  <td className="table-td">
                    <p className="text-sm font-medium text-slate-700">{l.testName}</p>
                    <p className="text-xs text-slate-400">{l.category}</p>
                  </td>
                  <td className="table-td text-slate-500 text-xs">{l.date ? formatDate(l.date) : '—'}</td>
                  <td className="table-td">
                    {l.result ? (
                      <span className={`text-sm font-bold ${l.status === 'Abnormal' ? 'text-red-600' : l.status === 'Normal' ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {l.result} {l.unit}
                      </span>
                    ) : <span className="text-slate-300 text-xs">Pending</span>}
                  </td>
                  <td className="table-td text-slate-400 text-xs">{l.normalRange || '—'}</td>
                  <td className="table-td"><Badge status={l.status} /></td>
                  <td className="table-td text-slate-500 text-sm">{l.orderedBy || '—'}</td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmId(l.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {visibleResults.length} results
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Lab Result' : 'Add Lab Result'} icon={FlaskConical} accentColor="teal">
        <LabForm form={form} setForm={setForm} patients={patients} doctors={doctors} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Result'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteLabResult(confirmId); showToast('Lab result deleted.', 'info') }}
        message="Delete this lab result? This cannot be undone."
      />
    </div>
  )
}

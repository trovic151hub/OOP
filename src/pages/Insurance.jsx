import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Shield, Search, Filter, Download, X as XIcon } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import FormDropdown from '../components/ui/FormDropdown'
import Combobox from '../components/ui/Combobox'
import DatePicker from '../components/ui/DatePicker'
import { useToast } from '../context/ToastContext'
import { formatDate, formatCurrency, getCurrencySymbol } from '../utils/helpers'

const CLAIM_STATUSES = ['Submitted', 'Processing', 'Approved', 'Rejected', 'Paid']
const PROVIDERS = ['NHIS', 'AIICO Insurance', 'Reliance HMO', 'Axamansard', 'Leadway Health', 'Hygeia HMO', 'AXA Mansard Health', 'Avon HMO', 'Private Insurance', 'Other']
const COVERAGE_TYPES = ['Full Coverage', 'Partial Coverage', 'Outpatient Only', 'Inpatient Only', 'Emergency Only', 'Dental', 'Vision', 'Other']

const EMPTY_FORM = {
  patientName: '', insuranceProvider: 'NHIS', policyNumber: '',
  groupNumber: '', coverageType: 'Full Coverage', claimAmount: '',
  approvedAmount: '', invoiceNumber: '', submittedDate: '', status: 'Submitted', notes: '',
}

function ClaimForm({ form, setForm, patients, billing, settings }) {
  const symbol = getCurrencySymbol(settings?.currency)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <label className="label">Patient <span className="text-red-400">*</span></label>
        <Combobox value={form.patientName} onChange={v => setForm(f => ({ ...f, patientName: v }))} options={patients} getLabel={p => p.name} getSub={p => p.phone} placeholder="Patient name…" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Insurance Provider <span className="text-red-400">*</span></label>
          <Combobox value={form.insuranceProvider} onChange={v => setForm(f => ({ ...f, insuranceProvider: v }))} options={PROVIDERS} getLabel={p => p} placeholder="Select or type provider…" />
        </div>
        <div>
          <label className="label">Coverage Type</label>
          <FormDropdown value={form.coverageType} onChange={v => setForm(f => ({ ...f, coverageType: v }))} options={COVERAGE_TYPES.map(c => ({ value: c, label: c }))} />
        </div>
        <div>
          <label className="label">Policy Number</label>
          <input className="input-field" placeholder="POL-000-0000" value={form.policyNumber} onChange={set('policyNumber')} />
        </div>
        <div>
          <label className="label">Group Number</label>
          <input className="input-field" placeholder="GRP-000" value={form.groupNumber} onChange={set('groupNumber')} />
        </div>
        <div>
          <label className="label">Claim Amount ({symbol}) <span className="text-red-400">*</span></label>
          <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={form.claimAmount} onChange={set('claimAmount')} />
        </div>
        <div>
          <label className="label">Approved Amount ({symbol})</label>
          <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={form.approvedAmount} onChange={set('approvedAmount')} />
        </div>
        <div>
          <label className="label">Invoice Reference</label>
          <Combobox
            value={form.invoiceNumber}
            onChange={v => setForm(f => ({ ...f, invoiceNumber: v }))}
            options={billing}
            getLabel={b => b.invoiceNumber || b.id.slice(0, 8)}
            placeholder="Invoice number…"
          />
        </div>
        <div>
          <label className="label">Submitted Date <span className="text-red-400">*</span></label>
          <DatePicker value={form.submittedDate} onChange={v => setForm(f => ({ ...f, submittedDate: v }))} />
        </div>
        <div>
          <label className="label">Status</label>
          <FormDropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={CLAIM_STATUSES.map(s => ({ value: s, label: s }))} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Additional notes…" value={form.notes} onChange={set('notes')} />
      </div>
    </div>
  )
}

export default function Insurance() {
  const { claims = [], patients, billing = [], settings } = useStore()
  const fmt = (n) => formatCurrency(n, settings?.currency)
  const showToast = useToast()

  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]             = useState(false)
  const [editId, setEditId]           = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]     = useState(null)

  const filtered = claims.filter(c => {
    const q = search.toLowerCase()
    const matchQ = c.patientName?.toLowerCase().includes(q) || c.insuranceProvider?.toLowerCase().includes(q) || c.policyNumber?.toLowerCase().includes(q)
    const matchS = filterStatus === 'All' || c.status === filterStatus
    return matchQ && matchS
  })

  const totalClaimed  = claims.reduce((s, c) => s + Number(c.claimAmount || 0), 0)
  const totalApproved = claims.filter(c => ['Approved','Paid'].includes(c.status)).reduce((s, c) => s + Number(c.approvedAmount || c.claimAmount || 0), 0)
  const totalPaid     = claims.filter(c => c.status === 'Paid').reduce((s, c) => s + Number(c.approvedAmount || c.claimAmount || 0), 0)
  const counts = CLAIM_STATUSES.reduce((acc, s) => { acc[s] = claims.filter(c => c.status === s).length; return acc }, {})

  function openAdd()   { setForm({ ...EMPTY_FORM, submittedDate: new Date().toISOString().slice(0,10) }); setEditId(null); setModal(true) }
  function openEdit(c) { setForm({ ...EMPTY_FORM, ...c }); setEditId(c.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim())       { showToast('Patient is required.', 'error'); return }
    if (!form.insuranceProvider.trim()) { showToast('Provider is required.', 'error'); return }
    if (!form.claimAmount || Number(form.claimAmount) <= 0) { showToast('Enter valid claim amount.', 'error'); return }
    if (!form.submittedDate) { showToast('Submission date is required.', 'error'); return }
    if (editId) { store.updateClaim(editId, { ...form, claimAmount: Number(form.claimAmount), approvedAmount: Number(form.approvedAmount || 0) }); showToast('Claim updated.') }
    else        { store.addClaim({ ...form, claimAmount: Number(form.claimAmount), approvedAmount: Number(form.approvedAmount || 0) }); showToast('Claim submitted.') }
    setModal(false)
  }

  function exportCSV() {
    const rows = [
      ['Patient','Provider','Policy No.','Coverage','Claim Amount','Approved Amount','Invoice','Submitted','Status'],
      ...filtered.map(c => [c.patientName, c.insuranceProvider, c.policyNumber, c.coverageType, c.claimAmount, c.approvedAmount, c.invoiceNumber, c.submittedDate, c.status]),
    ]
    const csv = rows.map(r => r.map(x => `"${x||''}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'insurance_claims.csv'; a.click()
  }

  const STATUS_BADGE = {
    Submitted:  'bg-blue-50 text-blue-700 border border-blue-200',
    Processing: 'bg-amber-50 text-amber-700 border border-amber-200',
    Approved:   'bg-teal-50 text-teal-700 border border-teal-200',
    Rejected:   'bg-red-50 text-red-700 border border-red-200',
    Paid:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Insurance &amp; Claims</h2>
          <p className="text-sm text-slate-400 mt-0.5">{claims.length} claims · {fmt(totalClaimed)} total claimed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs"><Download size={13} /> Export</button>
          <button onClick={openAdd}   className="btn-primary"><Plus size={15} /> New Claim</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Claimed',   value: fmt(totalClaimed),  color: 'text-slate-700',   border: 'border-slate-200' },
          { label: 'Approved',        value: fmt(totalApproved), color: 'text-teal-700',    border: 'border-teal-200' },
          { label: 'Paid Out',        value: fmt(totalPaid),     color: 'text-emerald-700', border: 'border-emerald-200' },
          { label: 'Pending Review',  value: (counts.Submitted || 0) + (counts.Processing || 0), color: 'text-amber-700', border: 'border-amber-200' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`card p-4 border ${border}`}>
            <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or provider…"
            style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
            className="input-field border-slate-200 focus:shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
        <Filter size={14} className="text-slate-400" />
        {['All', ...CLAIM_STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${filterStatus === s ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {s}{s !== 'All' ? ` (${counts[s] || 0})` : ''}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Patient','Provider / Policy','Coverage','Claim Amount','Approved','Invoice','Submitted','Status',''].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-slate-400">
                  <Shield size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">{search || filterStatus !== 'All' ? 'No results' : 'No claims yet'}</p>
                  {!search && filterStatus === 'All' && <button onClick={openAdd} className="btn-primary text-xs mt-3"><Plus size={13} /> New Claim</button>}
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.patientName} size="sm" />
                      <p className="font-semibold text-slate-800 text-sm">{c.patientName}</p>
                    </div>
                  </td>
                  <td className="table-td">
                    <p className="text-sm font-medium text-slate-700">{c.insuranceProvider}</p>
                    <p className="text-xs text-slate-400">{c.policyNumber || '—'}{c.groupNumber ? ` · ${c.groupNumber}` : ''}</p>
                  </td>
                  <td className="table-td text-xs text-slate-500">{c.coverageType || '—'}</td>
                  <td className="table-td font-bold text-slate-800">{fmt(c.claimAmount || 0)}</td>
                  <td className="table-td text-emerald-700 font-semibold">{c.approvedAmount ? fmt(c.approvedAmount) : '—'}</td>
                  <td className="table-td text-xs text-slate-500">{c.invoiceNumber || '—'}</td>
                  <td className="table-td text-xs text-slate-400 whitespace-nowrap">{c.submittedDate ? formatDate(c.submittedDate) : '—'}</td>
                  <td className="table-td">
                    <span className={`badge text-[10px] font-bold ${STATUS_BADGE[c.status] || ''}`}>{c.status}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil size={13} /></button>
                      <button onClick={() => setConfirmId(c.id)} className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Claim' : 'New Insurance Claim'} icon={Shield} accentColor="teal">
        <ClaimForm form={form} setForm={setForm} patients={patients} billing={billing} settings={settings} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Submit Claim'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteClaim(confirmId); showToast('Deleted.', 'info') }}
        message="Delete this insurance claim? This cannot be undone."
      />
    </div>
  )
}

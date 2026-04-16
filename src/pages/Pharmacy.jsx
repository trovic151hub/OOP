import React, { useState } from 'react'
import { Plus, Pencil, Trash2, FlaskConical, Search, Filter, Download, PackageCheck, Clock, CheckCheck, XCircle } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'

const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Dispensed', 'Cancelled']

const STATUS_STYLE = {
  Pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  Preparing:  'bg-blue-50 text-blue-700 border border-blue-200',
  Ready:      'bg-violet-50 text-violet-700 border border-violet-200',
  Dispensed:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelled:  'bg-red-50 text-red-600 border border-red-200',
}

const NEXT_STATUS = {
  Pending:   'Preparing',
  Preparing: 'Ready',
  Ready:     'Dispensed',
}

const ACTION_ICON = {
  Pending:   Clock,
  Preparing: FlaskConical,
  Ready:     PackageCheck,
}

const EMPTY_FORM = {
  patientName: '', doctorName: '', medications: '', instructions: '', status: 'Pending',
  prescriptionId: '', pharmacistName: '', dispensedAt: '', notes: '',
}

function PharmacyForm({ form, setForm, patients, doctors, prescriptions }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function loadPrescription(id) {
    const rx = prescriptions.find(p => p.id === id)
    if (!rx) return
    setForm(f => ({
      ...f,
      prescriptionId: id,
      patientName:  rx.patientName  || f.patientName,
      doctorName:   rx.doctorName   || f.doctorName,
      medications:  rx.medications  || f.medications,
      instructions: rx.instructions || f.instructions,
    }))
  }

  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <label className="label">Load from Prescription</label>
        <select className="input-field text-sm" value={form.prescriptionId} onChange={e => { set('prescriptionId')(e); loadPrescription(e.target.value) }}>
          <option value="">— Select prescription —</option>
          {prescriptions.filter(p => p.status === 'Active').map(p => (
            <option key={p.id} value={p.id}>{p.patientName} – {(p.medications || '').slice(0, 40)}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Patient <span className="text-red-400">*</span></label>
          <input className="input-field" list="ph-patients" placeholder="Patient name…" value={form.patientName} onChange={set('patientName')} />
          <datalist id="ph-patients">{patients.map(p => <option key={p.id} value={p.name} />)}</datalist>
        </div>
        <div>
          <label className="label">Doctor</label>
          <input className="input-field" list="ph-doctors" placeholder="Doctor name…" value={form.doctorName} onChange={set('doctorName')} />
          <datalist id="ph-doctors">{doctors.map(d => <option key={d.id} value={d.name} />)}</datalist>
        </div>
      </div>
      <div>
        <label className="label">Medications / Items <span className="text-red-400">*</span></label>
        <textarea className="input-field resize-none" rows={3} placeholder="e.g. Amoxicillin 500mg x 21 tabs, Ibuprofen 400mg x 10 tabs…" value={form.medications} onChange={set('medications')} />
      </div>
      <div>
        <label className="label">Instructions</label>
        <textarea className="input-field resize-none" rows={2} placeholder="e.g. Take with food, twice daily…" value={form.instructions} onChange={set('instructions')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Pharmacist Name</label>
          <input className="input-field" placeholder="Pharmacist name…" value={form.pharmacistName} onChange={set('pharmacistName')} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Internal notes…" value={form.notes} onChange={set('notes')} />
      </div>
    </div>
  )
}

export default function Pharmacy({ currentUser }) {
  const { pharmacyOrders = [], patients, doctors, prescriptions = [], inventory } = useStore()
  const showToast = useToast()

  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]             = useState(false)
  const [editId, setEditId]           = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]     = useState(null)

  const filtered = pharmacyOrders.filter(o => {
    const q = search.toLowerCase()
    const matchQ = o.patientName?.toLowerCase().includes(q) || o.medications?.toLowerCase().includes(q) || o.doctorName?.toLowerCase().includes(q)
    const matchS = filterStatus === 'All' || o.status === filterStatus
    return matchQ && matchS
  })

  const counts = ORDER_STATUSES.reduce((acc, s) => { acc[s] = pharmacyOrders.filter(o => o.status === s).length; return acc }, {})

  function openAdd()   { setForm({ ...EMPTY_FORM }); setEditId(null); setModal(true) }
  function openEdit(o) { setForm({ ...EMPTY_FORM, ...o }); setEditId(o.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim())  { showToast('Patient is required.', 'error'); return }
    if (!form.medications.trim())  { showToast('Medications are required.', 'error'); return }
    if (editId) { store.updatePharmacyOrder(editId, form); showToast('Order updated.') }
    else        { store.addPharmacyOrder(form); showToast('Pharmacy order created.') }
    setModal(false)
  }

  function advanceOrder(order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    const update = { status: next }
    if (next === 'Dispensed') {
      update.dispensedAt = new Date().toISOString().slice(0,10)
      update.dispensedBy = currentUser?.name || ''
    }
    store.updatePharmacyOrder(order.id, update)
    showToast(`${order.patientName} → ${next}`, 'info')
  }

  function cancelOrder(id) {
    store.updatePharmacyOrder(id, { status: 'Cancelled' })
    showToast('Order cancelled.', 'info')
  }

  function exportCSV() {
    const rows = [
      ['Patient','Doctor','Medications','Status','Pharmacist','Dispensed At','Created'],
      ...filtered.map(o => [o.patientName, o.doctorName, o.medications, o.status, o.pharmacistName, o.dispensedAt, o.createdAt?.slice(0,10)]),
    ]
    const csv = rows.map(r => r.map(x => `"${x||''}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'pharmacy_orders.csv'; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pharmacy</h2>
          <p className="text-sm text-slate-400 mt-0.5">{pharmacyOrders.length} orders · {counts.Pending || 0} pending · {counts.Ready || 0} ready for pickup</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs"><Download size={13} /> Export</button>
          <button onClick={openAdd}   className="btn-primary"><Plus size={15} /> New Order</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {ORDER_STATUSES.map(s => {
          const styles = {
            Pending:   'text-amber-600',
            Preparing: 'text-blue-600',
            Ready:     'text-violet-600',
            Dispensed: 'text-emerald-600',
            Cancelled: 'text-red-500',
          }
          return (
            <div key={s} className="card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus(s === filterStatus ? 'All' : s)}>
              <p className="text-xs font-semibold text-slate-400 mb-1">{s}</p>
              <p className={`text-2xl font-extrabold ${styles[s]}`}>{counts[s] || 0}</p>
            </div>
          )
        })}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search by patient or medications…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Filter size={14} className="text-slate-400" />
        {['All', ...ORDER_STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${filterStatus === s ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Patient','Doctor','Medications','Status','Advance','Pharmacist','Dispensed',''].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FlaskConical size={32} className="text-slate-200" />
                    <p className="text-sm">{search || filterStatus !== 'All' ? 'No results' : 'No pharmacy orders yet'}</p>
                    {!search && filterStatus === 'All' && <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={13} /> Create First</button>}
                  </div>
                </td></tr>
              ) : filtered.map(o => {
                const ActionIcon = ACTION_ICON[o.status]
                const nextStatus = NEXT_STATUS[o.status]
                return (
                  <tr key={o.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Avatar name={o.patientName} size="sm" />
                        <p className="font-semibold text-sm text-slate-800">{o.patientName}</p>
                      </div>
                    </td>
                    <td className="table-td text-sm text-slate-500">{o.doctorName || '—'}</td>
                    <td className="table-td max-w-xs">
                      <p className="text-xs text-slate-700 font-medium line-clamp-2">{o.medications}</p>
                      {o.instructions && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{o.instructions}</p>}
                    </td>
                    <td className="table-td">
                      <span className={`badge text-[10px] font-bold ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="table-td">
                      {nextStatus ? (
                        <button onClick={() => advanceOrder(o)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors">
                          {ActionIcon && <ActionIcon size={11} />} → {nextStatus}
                        </button>
                      ) : o.status === 'Pending' || o.status === 'Preparing' ? (
                        <button onClick={() => cancelOrder(o.id)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                          <XCircle size={11} /> Cancel
                        </button>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="table-td text-xs text-slate-500">{o.pharmacistName || '—'}</td>
                    <td className="table-td text-xs text-slate-400">{o.dispensedAt ? formatDate(o.dispensedAt) : '—'}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil size={13} /></button>
                        <button onClick={() => setConfirmId(o.id)} className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Order' : 'New Pharmacy Order'} icon={FlaskConical} accentColor="teal">
        <PharmacyForm form={form} setForm={setForm} patients={patients} doctors={doctors} prescriptions={prescriptions} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Create Order'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deletePharmacyOrder(confirmId); showToast('Deleted.', 'info') }}
        message="Delete this pharmacy order? This cannot be undone."
      />
    </div>
  )
}

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Filter } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'

const EMPTY_FORM = { name: '', age: '', gender: 'Not specified', blood: 'Unknown', condition: '', status: 'Active', phone: '', email: '', patientType: 'Outpatient', location: '', notes: '' }
const STATUSES = ['Active', 'Admitted', 'In Treatment', 'Discharged', 'Critical']

function PatientForm({ form, setForm }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full Name <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. John Smith" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Age <span className="text-red-400">*</span></label>
          <input className="input-field" type="number" placeholder="e.g. 34" min="0" max="150" value={form.age} onChange={set('age')} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input-field" value={form.gender} onChange={set('gender')}>
            {['Not specified','Male','Female','Other'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Blood Type</label>
          <select className="input-field" value={form.blood} onChange={set('blood')}>
            {['Unknown','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {STATUSES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input-field" placeholder="+1 555 000 1234" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Patient Type</label>
          <select className="input-field" value={form.patientType} onChange={set('patientType')}>
            {['Outpatient','Inpatient'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Condition / Diagnosis</label>
          <input className="input-field" placeholder="e.g. Hypertension" value={form.condition} onChange={set('condition')} />
        </div>
        <div className="col-span-2">
          <label className="label">Location (Room)</label>
          <input className="input-field" placeholder="e.g. Room 402B – 4th Floor" value={form.location} onChange={set('location')} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Allergies, medications…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}

export default function Patients() {
  const { patients } = useStore()
  const showToast = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = p.name?.toLowerCase().includes(q) || p.condition?.toLowerCase().includes(q) || p.blood?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'All' || p.status === filterStatus
    const matchType = filterType === 'All' || p.patientType === filterType
    return matchSearch && matchStatus && matchType
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(p) { setForm({ ...EMPTY_FORM, ...p }); setEditId(p.id); setModal(true) }

  function handleSubmit() {
    if (!form.name.trim() || !form.age) { showToast('Name and age are required.', 'error'); return }
    if (editId) { store.updatePatient(editId, form); showToast('Patient updated.') }
    else { store.addPatient(form); showToast('Patient added.') }
    setModal(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patients</h2>
          <p className="text-sm text-slate-400 mt-0.5">{patients.length} total patients registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={15} /> Add New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, condition…" className="flex-1 min-w-48" />
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select className="input-field w-auto text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input-field w-auto text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            <option>Outpatient</option>
            <option>Inpatient</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Gender / Age</th>
                <th className="table-th">Condition</th>
                <th className="table-th">Blood</th>
                <th className="table-th">Patient Type</th>
                <th className="table-th">Location</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No patients yet'}</p>
                      {!search && <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={13} /> Add First Patient</button>}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400">#{p.id?.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{p.gender?.charAt(0) || '—'} / {p.age}</td>
                  <td className="table-td">
                    {p.condition ? <span className="text-teal-600 font-medium text-sm">{p.condition}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="table-td text-slate-600">{p.blood || '—'}</td>
                  <td className="table-td text-slate-500">{p.patientType || '—'}</td>
                  <td className="table-td text-slate-500 text-xs">{p.location || '—'}</td>
                  <td className="table-td"><Badge status={p.status || 'Active'} /></td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmId(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
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
            Showing {filtered.length} of {patients.length} patients
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Patient' : 'Add New Patient'} icon={Users}>
        <PatientForm form={form} setForm={setForm} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Patient'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deletePatient(confirmId); showToast('Patient deleted.', 'info') }}
        message="Are you sure you want to delete this patient record? This action cannot be undone."
      />
    </div>
  )
}

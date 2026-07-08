import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Filter, Tag, Search, X as XIcon, Download, Eye } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import FormDropdown from '../components/ui/FormDropdown'
import FilterDropdown from '../components/ui/FilterDropdown'
import { SkeletonTable } from '../components/ui/Skeleton'
import PatientDrawer from '../components/PatientDrawer'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'
import { exportPatients } from '../utils/exportCSV'

const EMPTY_FORM = { name: '', age: '', gender: 'Not specified', blood: 'Unknown', condition: '', status: 'Active', phone: '', email: '', patientType: 'Outpatient', location: '', department: '', notes: '' }
const STATUSES = ['Active', 'Admitted', 'In Treatment', 'Discharged', 'Critical']

function PatientForm({ form, setForm, departments }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <FormDropdown value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))} options={['Not specified','Male','Female','Other'].map(v => ({ value: v, label: v }))} />
        </div>
        <div>
          <label className="label">Blood Type</label>
          <FormDropdown value={form.blood} onChange={v => setForm(f => ({ ...f, blood: v }))} options={['Unknown','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v }))} />
        </div>
        <div>
          <label className="label">Status</label>
          <FormDropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={STATUSES.map(v => ({ value: v, label: v }))} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input-field" placeholder="+1 555 000 1234" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input-field" type="email" placeholder="patient@email.com" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Patient Type</label>
          <FormDropdown value={form.patientType} onChange={v => setForm(f => ({ ...f, patientType: v }))} options={['Outpatient','Inpatient'].map(v => ({ value: v, label: v }))} />
        </div>
        <div>
          <label className="label">Department</label>
          <FormDropdown
            value={form.department}
            onChange={v => setForm(f => ({ ...f, department: v }))}
            options={[{ value: '', label: 'None' }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
          />
        </div>
        <div className="col-span-2">
          <label className="label">Condition / Diagnosis</label>
          <input className="input-field" placeholder="e.g. Hypertension" value={form.condition} onChange={set('condition')} />
        </div>
        <div className="col-span-2">
          <label className="label">Room / Location</label>
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

export default function Patients({ currentUser }) {
  const { patients, departments, loading } = useStore()
  const showToast = useToast()
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [modal, setModal]           = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]   = useState(null)
  const [confirmName, setConfirmName] = useState('')
  const [drawerPatient, setDrawerPatient] = useState(null)

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

  if (loading) return <SkeletonTable rows={6} cols={7} />

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Patients</h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">{patients.length} total patients registered</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportPatients(patients)} className="btn-ghost text-xs">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add New Patient
          </button>
        </div>
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, condition…"
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
          <FilterDropdown
            icon={Filter}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[{ value: 'All', label: 'All Status' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
          />
          <FilterDropdown
            icon={Tag}
            value={filterType}
            onChange={setFilterType}
            options={[{ value: 'All', label: 'All Types' }, { value: 'Outpatient', label: 'Outpatient' }, { value: 'Inpatient', label: 'Inpatient' }]}
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
                <th className="table-th">Name</th>
                <th className="table-th">Gender / Age</th>
                <th className="table-th">Condition</th>
                <th className="table-th">Blood</th>
                <th className="table-th">Type</th>
                <th className="table-th">Location</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
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
                        <button onClick={() => setDrawerPatient(p)} className="font-semibold text-slate-800 dark:text-slate-200 text-sm hover:text-teal-600 transition-colors text-left">
                          {p.name}
                        </button>
                        <p className="text-xs text-slate-400 dark:text-slate-600">#{p.id?.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{p.gender?.charAt(0) || '—'} / {p.age}</td>
                  <td className="table-td">
                    {p.condition ? <span className="text-teal-600 font-medium text-sm">{p.condition}</span> : <span className="text-slate-300 dark:text-slate-700">—</span>}
                  </td>
                  <td className="table-td text-slate-600 dark:text-slate-400">{p.blood || '—'}</td>
                  <td className="table-td text-slate-500">{p.patientType || '—'}</td>
                  <td className="table-td text-slate-500 text-xs">{p.location || '—'}</td>
                  <td className="table-td"><Badge status={p.status || 'Active'} /></td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDrawerPatient(p)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors" title="View Profile">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { setConfirmId(p.id); setConfirmName(p.name) }} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors">
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
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
            Showing {filtered.length} of {patients.length} patients · Click a name to view full profile
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Patient' : 'Add New Patient'} icon={Users}>
        <PatientForm form={form} setForm={setForm} departments={departments} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Patient'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deletePatient(confirmId, confirmName); showToast('Patient deleted.', 'info') }}
        message="Are you sure you want to delete this patient record? This action cannot be undone."
      />

      <PatientDrawer
        patient={drawerPatient}
        onClose={() => setDrawerPatient(null)}
        currentUser={currentUser}
        onEdit={p => { openEdit(p); setDrawerPatient(null) }}
      />
    </div>
  )
}

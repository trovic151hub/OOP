import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Building2, Users, Filter } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { name: '', head: '', floor: '', capacity: '', status: 'Active', description: '', phone: '' }
const STATUSES = ['Active', 'Inactive', 'Under Maintenance']

function DeptForm({ form, setForm }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Department Name <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. Cardiology" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Head of Department</label>
          <input className="input-field" placeholder="e.g. Dr. Sarah Lee" value={form.head} onChange={set('head')} />
        </div>
        <div>
          <label className="label">Phone / Extension</label>
          <input className="input-field" placeholder="e.g. ext. 1040" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Floor / Location</label>
          <input className="input-field" placeholder="e.g. 3rd Floor, Wing B" value={form.floor} onChange={set('floor')} />
        </div>
        <div>
          <label className="label">Capacity (beds/rooms)</label>
          <input className="input-field" type="number" placeholder="e.g. 20" min="0" value={form.capacity} onChange={set('capacity')} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {STATUSES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Brief description of the department…" value={form.description} onChange={set('description')} />
        </div>
      </div>
    </div>
  )
}

export default function Departments({ currentUser }) {
  const { departments, doctors, patients } = useStore()
  const showToast = useToast()
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]       = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)

  const isAdmin = currentUser?.role === 'Admin'

  const filtered = departments.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.name?.toLowerCase().includes(q) || d.head?.toLowerCase().includes(q) || d.floor?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'All' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(d) { setForm({ ...EMPTY_FORM, ...d }); setEditId(d.id); setModal(true) }

  function handleSubmit() {
    if (!form.name.trim()) { showToast('Department name is required.', 'error'); return }
    if (editId) { store.updateDepartment(editId, form); showToast('Department updated.') }
    else { store.addDepartment(form); showToast('Department added.') }
    setModal(false)
  }

  const statusColor = {
    Active:             'bg-emerald-50 text-emerald-700',
    Inactive:           'bg-slate-100 text-slate-600',
    'Under Maintenance':'bg-amber-50 text-amber-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-400 mt-0.5">{departments.length} departments · {doctors.length} doctors on staff</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Department
          </button>
        )}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, head, or floor…" className="flex-1 min-w-48" />
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select className="input-field w-auto text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <Building2 size={36} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium">{search ? 'No results found' : 'No departments yet'}</p>
          {!search && isAdmin && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First Department</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(dept => {
            const deptDoctors  = doctors.filter(d => d.department?.toLowerCase() === dept.name?.toLowerCase())
            const admittedPats = patients.filter(p => (p.status === 'Admitted' || p.status === 'In Treatment') && p.department?.toLowerCase() === dept.name?.toLowerCase())
            const totalBeds    = parseInt(dept.capacity) || 0
            const occupancy    = totalBeds > 0 ? Math.round((admittedPats.length / totalBeds) * 100) : 0
            return (
              <div key={dept.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <Building2 size={18} className="text-teal-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[dept.status] || 'bg-slate-100 text-slate-600'}`}>
                      {dept.status || 'Active'}
                    </span>
                    {isAdmin && (
                      <>
                        <button onClick={() => openEdit(dept)} className="p-1 rounded text-slate-300 hover:text-slate-600 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmId(dept.id)} className="p-1 rounded text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{dept.name}</h3>
                  {dept.head && <p className="text-xs text-teal-600 font-medium mt-0.5">{dept.head}</p>}
                  {dept.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{dept.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  {dept.floor && <div className="flex items-center gap-1.5"><span className="text-slate-300">📍</span>{dept.floor}</div>}
                  {dept.phone && <div className="flex items-center gap-1.5"><span className="text-slate-300">📞</span>{dept.phone}</div>}
                </div>

                {totalBeds > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-600">Bed Occupancy</span>
                      <span className={`font-bold ${occupancy >= 90 ? 'text-red-500' : occupancy >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {admittedPats.length}/{totalBeds} ({occupancy}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{admittedPats.length} occupied</span>
                      <span>{Math.max(0, totalBeds - admittedPats.length)} available</span>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <Users size={12} className="text-slate-300" />
                  <span>{deptDoctors.length} doctor{deptDoctors.length !== 1 ? 's' : ''} assigned</span>
                  {deptDoctors.slice(0, 3).map(d => (
                    <span key={d.id} className="bg-slate-100 text-slate-600 rounded px-1 py-0.5 text-[10px] font-medium truncate max-w-20">{d.name?.split(' ').pop()}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Department' : 'Add Department'} icon={Building2} accentColor="teal">
        <DeptForm form={form} setForm={setForm} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Department'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteDepartment(confirmId); showToast('Department deleted.', 'info') }}
        message="Are you sure you want to delete this department?"
      />
    </div>
  )
}

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Building2, Users, Filter, Search, X as XIcon } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import FormDropdown from '../components/ui/FormDropdown'
import FilterDropdown from '../components/ui/FilterDropdown'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { name: '', head: '', floor: '', capacity: '', status: 'Active', description: '', phone: '', color: 'teal' }
const STATUSES = ['Active', 'Inactive', 'Under Maintenance']

// Tailwind needs each class name to appear literally in the source to generate
// it — building it as `bg-${color}-50` at runtime wouldn't work, so each
// department color is a static lookup instead of a string template.
const DEPT_COLORS = ['teal', 'red', 'rose', 'purple', 'blue', 'amber', 'green', 'orange', 'pink', 'indigo']
const DEPT_COLOR_STYLES = {
  teal:   { bg: 'bg-teal-50 dark:bg-teal-500/12',   border: 'border-teal-100 dark:border-teal-500/20',   icon: 'text-teal-600' },
  red:    { bg: 'bg-red-50 dark:bg-red-500/12',    border: 'border-red-100 dark:border-red-500/20',    icon: 'text-red-600' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-100',   icon: 'text-rose-600' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/12', border: 'border-purple-100 dark:border-purple-500/20', icon: 'text-purple-600' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/12',   border: 'border-blue-100 dark:border-blue-500/20',   icon: 'text-blue-600' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-500/12',  border: 'border-amber-100 dark:border-amber-500/20',  icon: 'text-amber-600' },
  green:  { bg: 'bg-green-50 dark:bg-green-500/12',  border: 'border-green-100',  icon: 'text-green-600' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/12', border: 'border-orange-100', icon: 'text-orange-600' },
  pink:   { bg: 'bg-pink-50 dark:bg-pink-500/12',   border: 'border-pink-100',   icon: 'text-pink-600' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/12', border: 'border-indigo-100', icon: 'text-indigo-600' },
}
const DEPT_COLOR_SWATCH = {
  teal: 'bg-teal-500', red: 'bg-red-500', rose: 'bg-rose-500', purple: 'bg-purple-500',
  blue: 'bg-blue-500', amber: 'bg-amber-500', green: 'bg-green-500', orange: 'bg-orange-500',
  pink: 'bg-pink-500', indigo: 'bg-indigo-500',
}

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
          <FormDropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={STATUSES.map(v => ({ value: v, label: v }))} />
        </div>
        <div className="col-span-2">
          <label className="label">Card Color</label>
          <div className="flex flex-wrap gap-2">
            {DEPT_COLORS.map(c => (
              <button
                key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                title={c}
                className={`w-7 h-7 rounded-full ${DEPT_COLOR_SWATCH[c]} flex items-center justify-center transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
              />
            ))}
          </div>
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

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Departments</h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">{departments.length} departments · {doctors.length} doctors on staff</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Department
          </button>
        )}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, head, or floor…"
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
          {(search || filterStatus !== 'All') && (
            <button
              onClick={() => { setSearch(''); setFilterStatus('All') }}
              className="text-xs font-semibold text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
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
            const colorStyle = DEPT_COLOR_STYLES[dept.color] || DEPT_COLOR_STYLES.teal
            return (
              <div key={dept.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${colorStyle.bg} border ${colorStyle.border} flex items-center justify-center`}>
                    <Building2 size={18} className={colorStyle.icon} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge status={dept.status || 'Active'} />
                    {isAdmin && (
                      <>
                        <button onClick={() => openEdit(dept)} className="p-1 rounded text-slate-300 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmId(dept.id)} className="p-1 rounded text-slate-300 dark:text-slate-700 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{dept.name}</h3>
                  {dept.head && <p className="text-xs text-teal-600 font-medium mt-0.5">{dept.head}</p>}
                  {dept.description && <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 line-clamp-2">{dept.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  {dept.floor && <div className="flex items-center gap-1.5"><span className="text-slate-300 dark:text-slate-700">📍</span>{dept.floor}</div>}
                  {dept.phone && <div className="flex items-center gap-1.5"><span className="text-slate-300 dark:text-slate-700">📞</span>{dept.phone}</div>}
                </div>

                {totalBeds > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Bed Occupancy</span>
                      <span className={`font-bold ${occupancy >= 90 ? 'text-red-500' : occupancy >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {admittedPats.length}/{totalBeds} ({occupancy}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-600 mt-1">
                      <span>{admittedPats.length} occupied</span>
                      <span>{Math.max(0, totalBeds - admittedPats.length)} available</span>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                  <Users size={12} className="text-slate-300 dark:text-slate-700" />
                  <span>{deptDoctors.length} doctor{deptDoctors.length !== 1 ? 's' : ''} assigned</span>
                  {deptDoctors.slice(0, 3).map(d => (
                    <span key={d.id} className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded px-1 py-0.5 text-[10px] font-medium truncate max-w-20">{d.name?.split(' ').pop()}</span>
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

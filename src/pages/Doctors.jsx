import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Stethoscope, MessageSquare, Phone, MoreHorizontal } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { name: '', specialty: '', department: '', phone: '', email: '', availability: 'Available', schedule: '', about: '', experience: '' }
const SPECIALTIES = ['All','General Medicine','Pediatrics','Cardiology','Orthopedics','Dermatology','Neurology','Pulmonology','Radiology','Oncology']
const AVAILABILITIES = ['Available','Unavailable','Busy','On Leave']

function DoctorForm({ form, setForm }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full Name <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. Dr. Sarah Lee" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Specialty <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. Cardiology" value={form.specialty} onChange={set('specialty')} />
        </div>
        <div>
          <label className="label">Department</label>
          <input className="input-field" placeholder="e.g. Heart Center" value={form.department} onChange={set('department')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input-field" placeholder="+1 555 000 1234" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input-field" type="email" placeholder="doctor@hospital.com" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Availability</label>
          <select className="input-field" value={form.availability} onChange={set('availability')}>
            {AVAILABILITIES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Experience</label>
          <input className="input-field" placeholder="e.g. 10+ years" value={form.experience} onChange={set('experience')} />
        </div>
        <div className="col-span-2">
          <label className="label">Schedule</label>
          <input className="input-field" placeholder="e.g. Monday - Friday (08:00 - 17:00)" value={form.schedule} onChange={set('schedule')} />
        </div>
        <div className="col-span-2">
          <label className="label">About</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Brief bio / specialization…" value={form.about} onChange={set('about')} />
        </div>
      </div>
    </div>
  )
}

export default function Doctors() {
  const { doctors } = useStore()
  const showToast = useToast()
  const [search, setSearch] = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState('All')
  const [filterAvail, setFilterAvail] = useState('All Status')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)
    const matchSpec = activeSpecialty === 'All' || d.specialty === activeSpecialty
    const matchAvail = filterAvail === 'All Status' || d.availability === filterAvail
    return matchSearch && matchSpec && matchAvail
  })

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(d) { setForm({ ...EMPTY_FORM, ...d }); setEditId(d.id); setModal(true) }

  function handleSubmit() {
    if (!form.name.trim() || !form.specialty.trim()) { showToast('Name and specialty are required.', 'error'); return }
    if (editId) { store.updateDoctor(editId, form); showToast('Doctor updated.') }
    else { store.addDoctor(form); showToast('Doctor added.') }
    setModal(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Doctors</h2>
          <p className="text-sm text-slate-400 mt-0.5">{doctors.length} doctors on staff</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input-field w-auto text-sm" value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
            <option>All Status</option>
            {AVAILABILITIES.map(v => <option key={v}>{v}</option>)}
          </select>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add New Doctor
          </button>
        </div>
      </div>

      {/* Specialty tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {SPECIALTIES.map(s => (
          <button
            key={s}
            onClick={() => setActiveSpecialty(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
              activeSpecialty === s
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or specialty…" />
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <Stethoscope size={36} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium">{search ? 'No results found' : 'No doctors yet'}</p>
          {!search && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First Doctor</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(d => (
            <div key={d.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <Badge status={d.availability || 'Available'} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1 rounded text-slate-300 hover:text-slate-600 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmId(d.id)} className="p-1 rounded text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Avatar name={d.name} size="lg" />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{d.specialty}</p>
                </div>
              </div>
              {d.schedule && (
                <p className="text-xs text-slate-400 text-center bg-slate-50 rounded-lg px-2 py-1.5">{d.schedule}</p>
              )}
              <div className="flex gap-2 mt-auto pt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors">
                  <MessageSquare size={12} />
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors">
                  <Phone size={12} />
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 hover:bg-teal-100 text-xs font-semibold transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Doctor' : 'Add New Doctor'} icon={Stethoscope} accentColor="purple">
        <DoctorForm form={form} setForm={setForm} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Doctor'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteDoctor(confirmId); showToast('Doctor deleted.', 'info') }}
        message="Are you sure you want to delete this doctor profile? This action cannot be undone."
      />
    </div>
  )
}

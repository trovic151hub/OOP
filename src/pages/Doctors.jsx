import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Stethoscope, MessageSquare, Phone, Download, Link2, CheckCircle2, Unlink } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { SkeletonCard } from '../components/ui/Skeleton'
import DoctorDrawer from '../components/DoctorDrawer'
import { useToast } from '../context/ToastContext'
import { exportDoctors } from '../utils/exportCSV'

const EMPTY_FORM   = { name: '', specialty: '', department: '', phone: '', email: '', availability: 'Available', schedule: '', about: '', experience: '' }
const SPECIALTIES  = ['All','General Medicine','Pediatrics','Cardiology','Orthopedics','Dermatology','Neurology','Pulmonology','Radiology','Oncology']
const AVAILABILITIES = ['Available','Unavailable','Busy','On Leave']

function DoctorForm({ form, setForm, departments }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <select className="input-field" value={form.department} onChange={set('department')}>
            <option value="">None</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
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
          <input className="input-field" placeholder="e.g. Mon - Fri (08:00 - 17:00)" value={form.schedule} onChange={set('schedule')} />
        </div>
        <div className="col-span-2">
          <label className="label">About</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Brief bio / specialization…" value={form.about} onChange={set('about')} />
        </div>
      </div>
    </div>
  )
}

function LinkAccountModal({ open, onClose, doctor, users, doctors }) {
  const showToast  = useToast()
  const [saving, setSaving] = useState(false)

  const alreadyLinkedUids = doctors.filter(d => d.uid && d.id !== doctor?.id).map(d => d.uid)
  const doctorUsers = users.filter(u => u.role === 'Doctor' && !alreadyLinkedUids.includes(u.uid))

  const [selected, setSelected] = useState('')

  async function link() {
    if (!selected) { showToast('Please select a user account.', 'error'); return }
    setSaving(true)
    try {
      await store.linkDoctorToUser(doctor.id, selected)
      showToast('Doctor profile linked to user account.', 'success')
      onClose()
      setSelected('')
    } catch {
      showToast('Failed to link. Try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() { setSelected(''); onClose() }

  if (!open || !doctor) return null
  return (
    <Modal open={open} onClose={handleClose} title="Link to User Account" icon={Link2} accentColor="teal">
      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
          <Avatar name={doctor?.name} size="sm" />
          <div>
            <p className="text-sm font-bold text-slate-800">{doctor?.name}</p>
            <p className="text-xs text-slate-400">{doctor?.specialty}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Select the staff account that belongs to this doctor. This lets them manage their own profile and see doctor-specific features after logging in.
        </p>

        {doctorUsers.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
            No available Doctor accounts found. Go to <strong>User Management</strong> and assign the Doctor role to the user first, then come back to link.
          </div>
        ) : (
          <div>
            <label className="label">Doctor User Account</label>
            <select className="input-field" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">— Select a user —</option>
              {doctorUsers.map(u => (
                <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={handleClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={link} disabled={saving || !selected} className="btn-primary flex-1 justify-center">
            {saving ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Link2 size={13} /> Link Account</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Doctors({ currentUser }) {
  const { doctors, departments, users, loading } = useStore()
  const showToast = useToast()
  const [search, setSearch]                   = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState('All')
  const [filterAvail, setFilterAvail]         = useState('All Status')
  const [modal, setModal]                     = useState(false)
  const [editId, setEditId]                   = useState(null)
  const [form, setForm]                       = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]             = useState(null)
  const [confirmName, setConfirmName]         = useState('')
  const [drawerDoctor, setDrawerDoctor]       = useState(null)
  const [linkDoctor, setLinkDoctor]           = useState(null)

  const isAdmin = currentUser?.role === 'Admin'

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)
    const matchSpec   = activeSpecialty === 'All' || d.specialty === activeSpecialty
    const matchAvail  = filterAvail === 'All Status' || d.availability === filterAvail
    return matchSearch && matchSpec && matchAvail
  })

  function openAdd()  { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(d){ setForm({ ...EMPTY_FORM, ...d }); setEditId(d.id); setModal(true) }

  function handleSubmit() {
    if (!form.name.trim() || !form.specialty.trim()) { showToast('Name and specialty are required.', 'error'); return }
    if (editId) { store.updateDoctor(editId, form); showToast('Doctor updated.') }
    else        { store.addDoctor(form); showToast('Doctor added.') }
    setModal(false)
  }

  async function unlinkAccount(d) {
    try {
      await store.linkDoctorToUser(d.id, null)
      showToast('Account unlinked.', 'info')
    } catch {
      showToast('Failed to unlink.', 'error')
    }
  }

  const linkedCount   = doctors.filter(d => d.uid).length
  const unlinkedCount = doctors.filter(d => !d.uid).length

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Doctors</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-slate-400">{doctors.length} doctors on staff</p>
            {linkedCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 size={12} /> {linkedCount} linked
              </span>
            )}
            {unlinkedCount > 0 && isAdmin && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <Link2 size={12} /> {unlinkedCount} unlinked
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => exportDoctors(doctors)} className="btn-ghost text-xs">
            <Download size={13} /> Export CSV
          </button>
          <select className="input-field w-auto text-sm" value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
            <option>All Status</option>
            {AVAILABILITIES.map(v => <option key={v}>{v}</option>)}
          </select>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={15} /> Add New Doctor
            </button>
          )}
        </div>
      </div>

      {isAdmin && unlinkedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <Link2 size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <strong>{unlinkedCount} doctor profile{unlinkedCount !== 1 ? 's are' : ' is'} not linked</strong> to a login account. Click <strong>"Link Account"</strong> on a card to connect it — this lets doctors log in and manage their own profile. Alternatively, go to <strong>User Management</strong> and change a staff member's role to Doctor; the system will auto-link by matching email.
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {SPECIALTIES.map(s => (
          <button key={s} onClick={() => setActiveSpecialty(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0
              ${activeSpecialty === s ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or specialty…" />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <Stethoscope size={36} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium">{search ? 'No results found' : 'No doctors yet'}</p>
          {!search && isAdmin && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First Doctor</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(d => {
            const linkedUser = d.uid ? users.find(u => u.uid === d.uid) : null
            return (
              <div key={d.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <Badge status={d.availability || 'Available'} />
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="p-1 rounded text-slate-300 hover:text-slate-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => { setConfirmId(d.id); setConfirmName(d.name) }} className="p-1 rounded text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Avatar name={d.name} size="lg" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.specialty}</p>
                    {d.department && <p className="text-xs text-teal-500 mt-0.5">{d.department}</p>}
                  </div>
                </div>
                {d.schedule && (
                  <p className="text-xs text-slate-400 text-center bg-slate-50 rounded-lg px-2 py-1.5">{d.schedule}</p>
                )}

                {isAdmin && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {linkedUser ? (
                      <div className="flex items-center gap-1.5 group">
                        <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-emerald-600 font-semibold truncate max-w-28" title={linkedUser.name}>{linkedUser.name}</span>
                        <button onClick={() => unlinkAccount(d)} title="Unlink account" className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-red-400 transition-all">
                          <Unlink size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setLinkDoctor(d)}
                        className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Link2 size={11} /> Link Account
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-1">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors" title={d.email || 'No email'}>
                    <MessageSquare size={12} />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors" title={d.phone || 'No phone'}>
                    <Phone size={12} />
                  </button>
                  <button
                    onClick={() => setDrawerDoctor(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 hover:bg-teal-100 text-xs font-semibold transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isAdmin && (
        <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Doctor' : 'Add New Doctor'} icon={Stethoscope} accentColor="purple">
          <DoctorForm form={form} setForm={setForm} departments={departments} />
          <div className="flex gap-3 mt-5">
            <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
              {editId ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>
        </Modal>
      )}

      <LinkAccountModal
        open={!!linkDoctor}
        onClose={() => setLinkDoctor(null)}
        doctor={linkDoctor}
        users={users}
        doctors={doctors}
      />

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteDoctor(confirmId, confirmName); showToast('Doctor deleted.', 'info') }}
        message="Are you sure you want to delete this doctor profile? This action cannot be undone."
      />

      <DoctorDrawer
        doctor={drawerDoctor}
        onClose={() => setDrawerDoctor(null)}
        currentUser={currentUser}
        onEdit={d => { openEdit(d); setDrawerDoctor(null) }}
      />
    </div>
  )
}

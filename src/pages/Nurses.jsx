import React, { useState } from 'react'
import { Plus, Pencil, Trash2, HeartPulse, MessageSquare, Phone, Download, Link2, CheckCircle2, Unlink, Filter, Search, X as XIcon, Camera } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import PassportPhoto from '../components/ui/PassportPhoto'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import FormDropdown from '../components/ui/FormDropdown'
import FilterDropdown from '../components/ui/FilterDropdown'
import { SkeletonCard } from '../components/ui/Skeleton'
import NurseDrawer from '../components/NurseDrawer'
import { useToast } from '../context/ToastContext'
import { exportNurses } from '../utils/exportCSV'

const EMPTY_FORM   = { name: '', specialty: '', department: '', phone: '', email: '', availability: 'Available', schedule: '', about: '', experience: '', photo: '' }
const AVAILABILITIES = ['Available','Unavailable','Busy','On Leave']

function NurseForm({ form, setForm, departments }) {
  const showToast = useToast()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.', 'error'); return }
    if (file.size > 1.5 * 1024 * 1024) { showToast('Image must be smaller than 1.5MB.', 'error'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="flex justify-center">
        <div className="relative group">
          <PassportPhoto src={form.photo} name={form.name} size="md" />
          <label className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors">
            <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {form.photo && (
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, photo: '' }))}
              title="Remove photo"
              className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-red-500 hover:border-red-200"
            >
              <XIcon size={11} />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full Name <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. Nurse Jane Doe" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Specialty <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. ICU Nursing" value={form.specialty} onChange={set('specialty')} />
        </div>
        <div>
          <label className="label">Department</label>
          <FormDropdown
            value={form.department}
            onChange={v => setForm(f => ({ ...f, department: v }))}
            options={[{ value: '', label: 'None' }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input-field" placeholder="+1 555 000 1234" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Email <span className="text-red-400">*</span></label>
          <input className="input-field" type="email" placeholder="nurse@hospital.com" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Availability</label>
          <FormDropdown value={form.availability} onChange={v => setForm(f => ({ ...f, availability: v }))} options={AVAILABILITIES.map(v => ({ value: v, label: v }))} />
        </div>
        <div>
          <label className="label">Experience</label>
          <input className="input-field" placeholder="e.g. 5+ years" value={form.experience} onChange={set('experience')} />
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

function LinkAccountModal({ open, onClose, nurse, users, nurses }) {
  const showToast  = useToast()
  const [saving, setSaving] = useState(false)

  const alreadyLinkedUids = nurses.filter(n => n.uid && n.id !== nurse?.id).map(n => n.uid)
  const nurseUsers = users.filter(u => u.role === 'Nurse' && !alreadyLinkedUids.includes(u.uid))

  const [selected, setSelected] = useState('')

  async function link() {
    if (!selected) { showToast('Please select a user account.', 'error'); return }
    setSaving(true)
    try {
      await store.linkNurseToUser(nurse.id, selected)
      showToast('Nurse profile linked to user account.', 'success')
      onClose()
      setSelected('')
    } catch {
      showToast('Failed to link. Try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() { setSelected(''); onClose() }

  if (!open || !nurse) return null
  return (
    <Modal open={open} onClose={handleClose} title="Link to User Account" icon={Link2} accentColor="teal">
      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3">
          <Avatar name={nurse?.name} size="sm" />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{nurse?.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-600">{nurse?.specialty}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select the staff account that belongs to this nurse. This lets them manage their own profile and see nurse-specific features after logging in.
        </p>

        {nurseUsers.length === 0 ? (
          <div className="bg-amber-50 dark:bg-amber-500/12 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 text-xs text-amber-700">
            No available Nurse accounts found. Go to <strong>User Management</strong> and assign the Nurse role to the user first, then come back to link.
          </div>
        ) : (
          <div>
            <label className="label">Nurse User Account</label>
            <FormDropdown
              value={selected}
              onChange={setSelected}
              options={[{ value: '', label: '— Select a user —' }, ...nurseUsers.map(u => ({ value: u.uid, label: `${u.name} (${u.email})` }))]}
            />
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={handleClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={link} disabled={saving || !selected} className="btn-primary flex-1 justify-center">
            {saving ? <span className="w-3 h-3 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" /> : <><Link2 size={13} /> Link Account</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Nurses({ currentUser }) {
  const { nurses, departments, users, loading } = useStore()
  const showToast = useToast()
  const [search, setSearch]                   = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState('All')
  const [filterAvail, setFilterAvail]         = useState('All Status')
  const [modal, setModal]                     = useState(false)
  const [editId, setEditId]                   = useState(null)
  const [form, setForm]                       = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]             = useState(null)
  const [confirmName, setConfirmName]         = useState('')
  const [drawerNurse, setDrawerNurse]         = useState(null)
  const [linkNurse, setLinkNurse]             = useState(null)
  const [onboardResult, setOnboardResult]     = useState(null)
  const [saving, setSaving]                   = useState(false)

  const isAdmin = currentUser?.role === 'Admin'

  // Built from real department names (not a hardcoded list) so the tabs never
  // drift out of sync with what nurses are actually assigned to.
  const specialtyTabs = ['All', ...departments.map(d => d.name)]

  const filtered = nurses.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = n.name?.toLowerCase().includes(q) || n.specialty?.toLowerCase().includes(q)
    const matchSpec   = activeSpecialty === 'All' || n.department === activeSpecialty
    const matchAvail  = filterAvail === 'All Status' || n.availability === filterAvail
    return matchSearch && matchSpec && matchAvail
  })

  function openAdd()  { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(n){ setForm({ ...EMPTY_FORM, ...n }); setEditId(n.id); setModal(true) }

  async function handleSubmit() {
    if (!form.name.trim() || !form.specialty.trim()) { showToast('Name and specialty are required.', 'error'); return }
    if (editId) {
      setSaving(true)
      try {
        await store.updateNurse(editId, form)
        if (form.uid) await store.updateUserProfile(form.uid, { avatar: form.photo || '' })
        showToast('Nurse updated.')
        setModal(false)
      } catch (err) {
        showToast(err.message || 'Failed to update nurse.', 'error')
      } finally {
        setSaving(false)
      }
      return
    }
    if (!form.email.trim()) { showToast('Email is required to create the nurse\'s login account.', 'error'); return }
    setSaving(true)
    try {
      const result = await store.onboardNurse(form)
      setModal(false)
      setOnboardResult(result)
    } catch (err) {
      showToast(err.message || 'Failed to onboard nurse.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function unlinkAccount(n) {
    try {
      await store.linkNurseToUser(n.id, null)
      showToast('Account unlinked.', 'info')
    } catch {
      showToast('Failed to unlink.', 'error')
    }
  }

  const linkedCount   = nurses.filter(n => n.uid).length
  const unlinkedCount = nurses.filter(n => !n.uid).length

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Nurses</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-slate-400 dark:text-slate-600">{nurses.length} nurses on staff</p>
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
          <button onClick={() => exportNurses(nurses)} className="btn-ghost text-xs">
            <Download size={13} /> Export CSV
          </button>
          <FilterDropdown
            icon={Filter}
            value={filterAvail}
            onChange={setFilterAvail}
            options={[{ value: 'All Status', label: 'All Status' }, ...AVAILABILITIES.map(v => ({ value: v, label: v }))]}
          />
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={15} /> Onboard Nurse
            </button>
          )}
        </div>
      </div>

      {isAdmin && unlinkedCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/12 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <Link2 size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <strong>{unlinkedCount} nurse profile{unlinkedCount !== 1 ? 's are' : ' is'} not linked</strong> to a login account. Click <strong>"Link Account"</strong> on a card to connect it — this lets nurses log in and manage their own profile. Alternatively, go to <strong>User Management</strong> and change a staff member's role to Nurse; the system will auto-link by matching email.
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {specialtyTabs.map(s => (
          <button key={s} onClick={() => setActiveSpecialty(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0
              ${activeSpecialty === s ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialty…"
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

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
          <HeartPulse size={36} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium">{search ? 'No results found' : 'No nurses yet'}</p>
          {!search && isAdmin && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First Nurse</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(n => {
            const linkedUser = n.uid ? users.find(u => u.uid === n.uid) : null
            return (
              <div key={n.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <Badge status={n.availability || 'Available'} />
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(n)} className="p-1 rounded text-slate-300 dark:text-slate-700 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => { setConfirmId(n.id); setConfirmName(n.name) }} className="p-1 rounded text-slate-300 dark:text-slate-700 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <PassportPhoto src={n.photo || linkedUser?.avatar} name={n.name} size="sm" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{n.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{n.specialty}</p>
                    {n.department && <p className="text-xs text-teal-500 mt-0.5">{n.department}</p>}
                  </div>
                </div>
                {n.schedule && (
                  <p className="text-xs text-slate-400 dark:text-slate-600 text-center bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1.5">{n.schedule}</p>
                )}

                {isAdmin && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {linkedUser ? (
                      <div className="flex items-center gap-1.5 group">
                        <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-emerald-600 font-semibold truncate max-w-28" title={linkedUser.name}>{linkedUser.name}</span>
                        <button onClick={() => unlinkAccount(n)} title="Unlink account" className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 dark:text-slate-700 hover:text-red-400 transition-all">
                          <Unlink size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setLinkNurse(n)}
                        className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-500/12 hover:bg-amber-100 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Link2 size={11} /> Link Account
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-1">
                  {n.email ? (
                    <a href={`mailto:${n.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 text-xs transition-colors" title={n.email}>
                      <MessageSquare size={12} />
                    </a>
                  ) : (
                    <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-200 text-xs cursor-not-allowed" title="No email">
                      <MessageSquare size={12} />
                    </button>
                  )}
                  {n.phone ? (
                    <a href={`tel:${n.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 text-xs transition-colors" title={n.phone}>
                      <Phone size={12} />
                    </a>
                  ) : (
                    <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-200 text-xs cursor-not-allowed" title="No phone">
                      <Phone size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setDrawerNurse(n)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 text-teal-600 hover:bg-teal-100 text-xs font-semibold transition-colors"
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
        <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Nurse' : 'Onboard Nurse'} icon={HeartPulse} accentColor="purple">
          <NurseForm form={form} setForm={setForm} departments={departments} />
          {!editId && (
            <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-3">
              This creates a login account for this nurse (role: Nurse) along with their profile, already linked. You'll get a one-time temporary password to share with them.
            </p>
          )}
          <div className="flex gap-3 mt-5">
            <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving
                ? <span className="w-4 h-4 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" />
                : editId ? 'Save Changes' : 'Onboard Nurse'}
            </button>
          </div>
        </Modal>
      )}

      <Modal open={!!onboardResult} onClose={() => setOnboardResult(null)} title="Nurse Onboarded" icon={CheckCircle2} accentColor="teal">
        {onboardResult && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>{onboardResult.nurse?.name}</strong>'s account and profile were created and linked. Share this one-time temporary password with them — it won't be shown again.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-600 mb-1">Email</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{onboardResult.nurse?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-600 mb-1">Temporary Password</p>
                <p className="text-sm font-mono font-bold text-teal-700">{onboardResult.tempPassword}</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/12 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-700">
              They'll be required to set a new password the first time they log in.
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`Email: ${onboardResult.nurse?.email}\nTemporary password: ${onboardResult.tempPassword}`)
                showToast('Copied to clipboard.', 'success')
              }}
              className="btn-ghost justify-center"
            >
              Copy Credentials
            </button>
            <button onClick={() => setOnboardResult(null)} className="btn-primary justify-center">Done</button>
          </div>
        )}
      </Modal>

      <LinkAccountModal
        open={!!linkNurse}
        onClose={() => setLinkNurse(null)}
        nurse={linkNurse}
        users={users}
        nurses={nurses}
      />

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteNurse(confirmId, confirmName); showToast('Nurse deleted.', 'info') }}
        message="Are you sure you want to delete this nurse profile? This action cannot be undone."
      />

      <NurseDrawer
        nurse={drawerNurse}
        onClose={() => setDrawerNurse(null)}
        currentUser={currentUser}
        onEdit={n => { openEdit(n); setDrawerNurse(null) }}
      />
    </div>
  )
}

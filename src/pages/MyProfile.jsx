import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Stethoscope, Building2, Award, Clock, Save, Pencil, X, BadgeCheck } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../context/ToastContext'

const AVAILABILITIES = ['Available', 'Unavailable', 'Busy', 'On Leave']
const SPECIALTIES    = ['General Medicine','Pediatrics','Cardiology','Orthopedics','Dermatology','Neurology','Pulmonology','Radiology','Oncology','Other']

const ROLE_BADGE = {
  Admin:        'bg-teal-100 text-teal-700',
  Doctor:       'bg-purple-100 text-purple-700',
  Receptionist: 'bg-blue-100 text-blue-700',
}

export default function MyProfile({ currentUser }) {
  const { doctors, departments } = useStore()
  const showToast = useToast()

  const linkedDoctor = doctors.find(d => d.uid === currentUser?.uid)

  const [editingBasic, setEditingBasic]   = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(false)
  const [savingBasic, setSavingBasic]     = useState(false)
  const [savingDoctor, setSavingDoctor]   = useState(false)

  const [basicForm, setBasicForm] = useState({
    name:  currentUser?.name  || '',
    phone: currentUser?.phone || '',
    bio:   currentUser?.bio   || '',
  })

  const [doctorForm, setDoctorForm] = useState({
    specialty:    linkedDoctor?.specialty    || '',
    department:   linkedDoctor?.department   || '',
    experience:   linkedDoctor?.experience   || '',
    schedule:     linkedDoctor?.schedule     || '',
    availability: linkedDoctor?.availability || 'Available',
    about:        linkedDoctor?.about        || '',
  })

  useEffect(() => {
    setBasicForm({
      name:  currentUser?.name  || '',
      phone: currentUser?.phone || '',
      bio:   currentUser?.bio   || '',
    })
  }, [currentUser?.name, currentUser?.phone, currentUser?.bio])

  useEffect(() => {
    if (linkedDoctor) {
      setDoctorForm({
        specialty:    linkedDoctor.specialty    || '',
        department:   linkedDoctor.department   || '',
        experience:   linkedDoctor.experience   || '',
        schedule:     linkedDoctor.schedule     || '',
        availability: linkedDoctor.availability || 'Available',
        about:        linkedDoctor.about        || '',
      })
    }
  }, [linkedDoctor?.id])

  function setBasic(k) { return e => setBasicForm(f => ({ ...f, [k]: e.target.value })) }
  function setDoc(k)   { return e => setDoctorForm(f => ({ ...f, [k]: e.target.value })) }

  async function saveBasic() {
    if (!basicForm.name.trim()) { showToast('Name is required.', 'error'); return }
    setSavingBasic(true)
    try {
      await store.updateUserProfile(currentUser.uid, {
        name:  basicForm.name.trim(),
        phone: basicForm.phone.trim(),
        bio:   basicForm.bio.trim(),
      })
      showToast('Profile updated.', 'success')
      setEditingBasic(false)
    } catch {
      showToast('Failed to save profile.', 'error')
    } finally {
      setSavingBasic(false)
    }
  }

  async function saveDoctorProfile() {
    if (!linkedDoctor) { showToast('No linked doctor profile found.', 'error'); return }
    setSavingDoctor(true)
    try {
      await store.updateDoctor(linkedDoctor.id, {
        ...linkedDoctor,
        ...doctorForm,
        name:  currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || linkedDoctor.phone,
      })
      showToast('Doctor profile updated.', 'success')
      setEditingDoctor(false)
    } catch {
      showToast('Failed to save doctor profile.', 'error')
    } finally {
      setSavingDoctor(false)
    }
  }

  const isDoctor = currentUser?.role === 'Doctor'

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-400">Manage your personal information and account details</p>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-8 flex items-center gap-5 border-b border-slate-100">
          <Avatar name={currentUser?.name} size="xl" />
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">{currentUser?.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{currentUser?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[currentUser?.role] || 'bg-slate-100 text-slate-600'}`}>
                {currentUser?.role}
              </span>
              {isDoctor && linkedDoctor && (
                <span className="flex items-center gap-1 text-xs text-teal-600 font-semibold">
                  <BadgeCheck size={13} /> Profile linked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">Personal Information</p>
            {!editingBasic ? (
              <button onClick={() => setEditingBasic(true)} className="btn-ghost text-xs py-1.5 px-3">
                <Pencil size={12} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditingBasic(false); setBasicForm({ name: currentUser?.name || '', phone: currentUser?.phone || '', bio: currentUser?.bio || '' }) }} className="btn-ghost text-xs py-1.5 px-3">
                  <X size={12} /> Cancel
                </button>
                <button onClick={saveBasic} disabled={savingBasic} className="btn-primary text-xs py-1.5 px-3">
                  {savingBasic ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={12} /> Save</>}
                </button>
              </div>
            )}
          </div>

          {editingBasic ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Full Name <span className="text-red-400">*</span></label>
                <input className="input-field" value={basicForm.name} onChange={setBasic('name')} placeholder="Your full name" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input-field" value={basicForm.phone} onChange={setBasic('phone')} placeholder="+1 555 000 1234" />
              </div>
              <div>
                <label className="label">Bio / About Me</label>
                <textarea className="input-field resize-none" rows={3} value={basicForm.bio} onChange={setBasic('bio')} placeholder="A short bio about yourself…" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { icon: User,  label: 'Name',  val: currentUser?.name  || '—' },
                { icon: Mail,  label: 'Email', val: currentUser?.email || '—' },
                { icon: Phone, label: 'Phone', val: currentUser?.phone || '—' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-700">{val}</p>
                  </div>
                </div>
              ))}
              {currentUser?.bio && (
                <div className="bg-slate-50 rounded-xl p-3 mt-1">
                  <p className="text-xs text-slate-400 mb-1">Bio</p>
                  <p className="text-sm text-slate-600">{currentUser.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isDoctor && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-purple-500" />
              <p className="text-sm font-bold text-slate-700">Doctor Profile</p>
            </div>
            {linkedDoctor ? (
              !editingDoctor ? (
                <button onClick={() => setEditingDoctor(true)} className="btn-ghost text-xs py-1.5 px-3">
                  <Pencil size={12} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingDoctor(false)} className="btn-ghost text-xs py-1.5 px-3">
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={saveDoctorProfile} disabled={savingDoctor} className="btn-primary text-xs py-1.5 px-3">
                    {savingDoctor ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={12} /> Save</>}
                  </button>
                </div>
              )
            ) : (
              <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-semibold">Profile not linked yet</span>
            )}
          </div>

          {!linkedDoctor ? (
            <div className="p-6 text-center text-slate-400">
              <Stethoscope size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium">Your doctor profile hasn't been set up yet.</p>
              <p className="text-xs mt-1 text-slate-400">Ask the Admin to assign your Doctor role from User Management — this will automatically create your profile.</p>
            </div>
          ) : editingDoctor ? (
            <div className="p-6 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Specialty</label>
                  <input className="input-field" list="spec-list" value={doctorForm.specialty} onChange={setDoc('specialty')} placeholder="e.g. Cardiology" />
                  <datalist id="spec-list">{SPECIALTIES.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select className="input-field" value={doctorForm.department} onChange={setDoc('department')}>
                    <option value="">None</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Experience</label>
                  <input className="input-field" value={doctorForm.experience} onChange={setDoc('experience')} placeholder="e.g. 10+ years" />
                </div>
                <div>
                  <label className="label">Availability</label>
                  <select className="input-field" value={doctorForm.availability} onChange={setDoc('availability')}>
                    {AVAILABILITIES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Schedule</label>
                  <input className="input-field" value={doctorForm.schedule} onChange={setDoc('schedule')} placeholder="e.g. Mon – Fri (08:00 – 17:00)" />
                </div>
                <div className="col-span-2">
                  <label className="label">About / Specialization</label>
                  <textarea className="input-field resize-none" rows={3} value={doctorForm.about} onChange={setDoc('about')} placeholder="Describe your specialization and experience…" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-3">
              {[
                { icon: Stethoscope, label: 'Specialty',    val: linkedDoctor.specialty    || '—' },
                { icon: Building2,   label: 'Department',   val: linkedDoctor.department   || '—' },
                { icon: Award,       label: 'Experience',   val: linkedDoctor.experience   || '—' },
                { icon: Clock,       label: 'Schedule',     val: linkedDoctor.schedule     || '—' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-700">{val}</p>
                  </div>
                </div>
              ))}
              {linkedDoctor.about && (
                <div className="bg-purple-50 rounded-xl p-3 mt-1">
                  <p className="text-xs text-purple-400 mb-1 font-bold uppercase tracking-wide">About</p>
                  <p className="text-sm text-slate-600">{linkedDoctor.about}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card p-5">
        <p className="text-sm font-bold text-slate-700 mb-3">Account Info</p>
        <div className="flex flex-col gap-2 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Account Role</span>
            <span className={`font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[currentUser?.role] || ''}`}>{currentUser?.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span className="font-semibold text-slate-700">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-xs">Role changes can only be made by an Admin from the User Management page.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

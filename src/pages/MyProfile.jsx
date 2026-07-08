import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Stethoscope, Building2, Award, Clock, Save, Pencil, X, BadgeCheck, Lock, Camera } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import { api } from '../api/client'
import Avatar from '../components/ui/Avatar'
import FormDropdown from '../components/ui/FormDropdown'
import Combobox from '../components/ui/Combobox'
import { useToast } from '../context/ToastContext'

const AVAILABILITIES = ['Available', 'Unavailable', 'Busy', 'On Leave']
const SPECIALTIES    = ['General Medicine','Pediatrics','Cardiology','Orthopedics','Dermatology','Neurology','Pulmonology','Radiology','Oncology','Other']

const ROLE_BADGE = {
  Admin:        'bg-teal-100 dark:bg-teal-500/18 text-teal-700',
  Doctor:       'bg-purple-100 dark:bg-purple-500/18 text-purple-700',
  Receptionist: 'bg-blue-100 dark:bg-blue-500/18 text-blue-700',
}

export default function MyProfile({ currentUser }) {
  const { doctors, departments } = useStore()
  const showToast = useToast()

  const linkedDoctor = doctors.find(d => d.uid === currentUser?.uid)

  const [editingBasic, setEditingBasic]     = useState(false)
  const [editingDoctor, setEditingDoctor]   = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [savingBasic, setSavingBasic]       = useState(false)
  const [savingDoctor, setSavingDoctor]     = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

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

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.', 'error'); return }
    if (file.size > 1.5 * 1024 * 1024) { showToast('Image must be smaller than 1.5MB.', 'error'); return }

    setUploadingAvatar(true)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      await store.updateUserProfile(currentUser.uid, { avatar: dataUrl })
      if (linkedDoctor) await store.updateDoctor(linkedDoctor.id, { photo: dataUrl })
      showToast('Profile photo updated.', 'success')
    } catch {
      showToast('Failed to upload photo.', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function removeAvatar() {
    setUploadingAvatar(true)
    try {
      await store.updateUserProfile(currentUser.uid, { avatar: '' })
      if (linkedDoctor) await store.updateDoctor(linkedDoctor.id, { photo: '' })
      showToast('Profile photo removed.', 'success')
    } catch {
      showToast('Failed to remove photo.', 'error')
    } finally {
      setUploadingAvatar(false)
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

  async function savePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) { showToast('Both password fields are required.', 'error'); return }
    if (passwordForm.newPassword.length < 6) { showToast('New password must be at least 6 characters.', 'error'); return }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showToast('New passwords do not match.', 'error'); return }
    setSavingPassword(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      showToast('Password updated.', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setEditingPassword(false)
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const isDoctor = currentUser?.role === 'Doctor'

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">My Profile</h1>
        <p className="text-sm text-slate-400 dark:text-slate-600">Manage your personal information and account details</p>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:bg-[radial-gradient(circle_at_100%_100%,_#e2e8f0_0%,_#0f766e_35%,_#042f2e_65%)] px-6 py-8 flex items-center gap-5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-shrink-0 group">
            <Avatar name={currentUser?.name} src={currentUser?.avatar} size="xl" />
            <label className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors">
              {uploadingAvatar
                ? <span className="w-4 h-4 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" />
                : <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
            </label>
            {currentUser?.avatar && !uploadingAvatar && (
              <button
                onClick={removeAvatar}
                title="Remove photo"
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-red-500 hover:border-red-200"
              >
                <X size={11} />
              </button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{currentUser?.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{currentUser?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[currentUser?.role] || 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
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
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Personal Information</p>
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
                  {savingBasic ? <span className="w-3 h-3 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" /> : <><Save size={12} /> Save</>}
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
                <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{label}</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{val}</p>
                  </div>
                </div>
              ))}
              {currentUser?.bio && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mt-1">
                  <p className="text-xs text-slate-400 dark:text-slate-600 mb-1">Bio</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{currentUser.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-slate-400 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Change Password</p>
          </div>
          {!editingPassword ? (
            <button onClick={() => setEditingPassword(true)} className="btn-ghost text-xs py-1.5 px-3">
              <Pencil size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                <X size={12} /> Cancel
              </button>
              <button onClick={savePassword} disabled={savingPassword} className="btn-primary text-xs py-1.5 px-3">
                {savingPassword ? <span className="w-3 h-3 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" /> : <><Save size={12} /> Save</>}
              </button>
            </div>
          )}
        </div>

        {editingPassword && (
          <div className="p-6 flex flex-col gap-3">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password" className="input-field" autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">New Password</label>
                <input
                  type="password" className="input-field" autoComplete="new-password" placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password" className="input-field" autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isDoctor && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-purple-500" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Doctor Profile</p>
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
                    {savingDoctor ? <span className="w-3 h-3 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" /> : <><Save size={12} /> Save</>}
                  </button>
                </div>
              )
            ) : (
              <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/12 px-2.5 py-1 rounded-full font-semibold">Profile not linked yet</span>
            )}
          </div>

          {!linkedDoctor ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-600">
              <Stethoscope size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium">Your doctor profile hasn't been set up yet.</p>
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-600">Ask the Admin to assign your Doctor role from User Management — this will automatically create your profile.</p>
            </div>
          ) : editingDoctor ? (
            <div className="p-6 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Specialty</label>
                  <Combobox value={doctorForm.specialty} onChange={v => setDoctorForm(f => ({ ...f, specialty: v }))} options={SPECIALTIES} getLabel={s => s} placeholder="e.g. Cardiology" />
                </div>
                <div>
                  <label className="label">Department</label>
                  <FormDropdown
                    value={doctorForm.department}
                    onChange={v => setDoctorForm(f => ({ ...f, department: v }))}
                    options={[{ value: '', label: 'None' }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
                  />
                </div>
                <div>
                  <label className="label">Experience</label>
                  <input className="input-field" value={doctorForm.experience} onChange={setDoc('experience')} placeholder="e.g. 10+ years" />
                </div>
                <div>
                  <label className="label">Availability</label>
                  <FormDropdown value={doctorForm.availability} onChange={v => setDoctorForm(f => ({ ...f, availability: v }))} options={AVAILABILITIES.map(v => ({ value: v, label: v }))} />
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
                <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/12 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-600">{label}</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{val}</p>
                  </div>
                </div>
              ))}
              {linkedDoctor.about && (
                <div className="bg-purple-50 dark:bg-purple-500/12 rounded-xl p-3 mt-1">
                  <p className="text-xs text-purple-400 mb-1 font-bold uppercase tracking-wide">About</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{linkedDoctor.about}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card p-5">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Account Info</p>
        <div className="flex flex-col gap-2 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Account Role</span>
            <span className={`font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[currentUser?.role] || ''}`}>{currentUser?.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-600 text-xs">Role changes can only be made by an Admin from the User Management page.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

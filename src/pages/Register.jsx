import React, { useState } from 'react'
import { Eye, EyeOff, Activity, UserPlus, Info, FileText, ArrowLeft } from 'lucide-react'
import { api } from '../api/client'
import { setCurrentUser, initSubscriptions } from '../store/useStore'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'

function getPasswordStrength(password) {
  if (!password) return null
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Weak',   bar: 'bg-red-500',     text: 'text-red-600' }
  if (score === 2) return { level: 2, label: 'Fair',   bar: 'bg-amber-500',   text: 'text-amber-600' }
  if (score <= 4)  return { level: 3, label: 'Good',   bar: 'bg-blue-500',    text: 'text-blue-600' }
  return              { level: 4, label: 'Strong', bar: 'bg-emerald-500', text: 'text-emerald-600' }
}

export default function Register({ onSwitch, onHome }) {
  const [form, setForm]             = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [showTerms, setShowTerms]   = useState(false)
  const showToast = useToast()
  const strength = getPasswordStrength(form.password)

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleRegister(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { showToast('All fields are required.', 'error'); return }
    if (form.password !== form.confirm) { showToast('Passwords do not match.', 'error'); return }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return }
    if (!agreed) { showToast('Please agree to the Terms & Conditions.', 'error'); return }
    setLoading(true)
    try {
      const { user } = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password })
      setCurrentUser(user)
      initSubscriptions()
      showToast(user.role === 'Admin' ? 'Admin account created!' : 'Patient account created!', 'success')
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-slate-800 dark:to-slate-900 p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
            <Activity size={18} className="text-teal-600" />
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">MedCore</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 mb-3">Your Care,<br />Clearly Organized</h2>
          <p className="text-slate-500 text-sm leading-relaxed">Create a patient account to view appointments, prescriptions, lab results, documents, and bills securely.</p>
        </div>
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white dark:border-slate-700 shadow-lg p-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-500/18 flex-shrink-0" />
              <div className="flex-1">
                <div className="w-24 h-2 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
                <div className="w-16 h-1.5 rounded bg-slate-100 dark:bg-slate-900" />
              </div>
              <div className="w-12 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/18" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600">Copyright © 2025 MedCore. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white dark:bg-slate-800 overflow-y-auto">
        <div className="w-full max-w-md">
          {onHome && (
            <button type="button" onClick={onHome} className="btn-ghost mb-6">
              <ArrowLeft size={15} /> Back to Home
            </button>
          )}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-2">Create Patient Account</h1>
            <p className="text-sm text-slate-500">Register for the patient portal. Staff accounts are created or assigned by an Admin.</p>
          </div>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Input your name" className="input-field" autoComplete="name" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="Input your email" className="input-field" autoComplete="email" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 6 characters" className="input-field pr-9" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.level ? strength.bar : 'bg-slate-100 dark:bg-slate-800'}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Confirm" className="input-field pr-9" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded" />
              I agree to the{' '}
              <button type="button" onClick={() => setShowTerms(true)} className="text-teal-600 font-semibold hover:underline">
                Terms &amp; Conditions
              </button>
            </label>
            <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-500/12 border border-blue-100 dark:border-blue-500/20 rounded-xl px-3.5 py-3 text-xs text-blue-700">
              <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
              <span>
                <strong>Patients</strong> can sign up here. Hospital staff should use an Admin-created account or ask an Admin to assign their staff role.
              </span>
            </div>
            <button type="submit" disabled={loading || !agreed} className="btn-primary justify-center py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <span className="w-4 h-4 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin" />
                : <><UserPlus size={16} /> Create Account</>
              }
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={onSwitch} className="text-teal-600 font-semibold hover:underline">Login</button>
            </p>
          </form>
        </div>
      </div>

      <Modal open={showTerms} onClose={() => setShowTerms(false)} title="Terms & Conditions" icon={FileText} accentColor="teal">
        <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400 max-h-[60vh] overflow-y-auto pr-1">
          <p>
            By creating a MedCore account, you agree to use this system only for legitimate hospital
            operations you're authorised to perform, and to keep your login credentials confidential.
          </p>
          <p>
            Patient records, medical history, and other clinical data accessible through MedCore are
            confidential. You agree to access only the information required for your role, and not to
            share, export, or disclose it outside of authorised hospital workflows.
          </p>
          <p>
            Patient accounts can access only their own portal records. Staff roles such as Admin,
            Doctor, Nurse, and Receptionist are assigned only by an Administrator.
          </p>
          <p>
            MedCore logs key actions (record changes, role updates, deletions) for audit purposes. This
            activity may be reviewed by hospital administrators.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            This is placeholder text for demonstration purposes and does not constitute a binding legal agreement.
          </p>
        </div>
        <button onClick={() => setShowTerms(false)} className="btn-primary justify-center mt-5 w-full">
          Close
        </button>
      </Modal>
    </div>
  )
}

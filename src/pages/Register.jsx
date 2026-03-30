import React, { useState } from 'react'
import { Eye, EyeOff, Activity, UserPlus } from 'lucide-react'
import { store } from '../store/useStore'
import { useToast } from '../context/ToastContext'

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const showToast = useToast()

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  function handleRegister(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { showToast('All fields are required.', 'error'); return }
    if (form.password !== form.confirm) { showToast('Passwords do not match.', 'error'); return }
    if (!agreed) { showToast('Please agree to the Terms & Conditions.', 'error'); return }
    store.login({ name: form.name, email: form.email, role: 'Admin' })
    showToast('Account created successfully!', 'success')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: visual */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-gradient-to-br from-teal-50 to-emerald-100 p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Activity size={18} className="text-teal-600" />
          </div>
          <span className="text-lg font-bold text-slate-800">MedCore</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Stay on Top of<br />Every Detail</h2>
          <p className="text-slate-500 text-sm leading-relaxed">From appointments to inventory, MedCore gives you a clear view of daily hospital operations.</p>
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-lg p-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex-shrink-0" />
              <div className="flex-1">
                <div className="w-24 h-2 rounded bg-slate-200 mb-1" />
                <div className="w-16 h-1.5 rounded bg-slate-100" />
              </div>
              <div className="w-12 h-4 rounded-full bg-emerald-100" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">Copyright © 2025 MedCore. All rights reserved.</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Create Your MedCore Account</h1>
            <p className="text-sm text-slate-500">Register to access hospital dashboards, manage clinical workflows, and collaborate securely.</p>
          </div>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Input your name" className="input-field" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="Input your email" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Password" className="input-field pr-9" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Confirm" className="input-field" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded" />
              I agree to the <span className="text-teal-600 font-semibold">Terms &amp; Conditions</span>
            </label>
            <button type="submit" className="btn-primary justify-center py-2.5 text-base">
              <UserPlus size={16} /> Create Account
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button type="button" onClick={onSwitch} className="text-teal-600 font-semibold hover:underline">Login</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

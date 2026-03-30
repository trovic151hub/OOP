import React, { useState } from 'react'
import { Eye, EyeOff, Activity, LogIn } from 'lucide-react'
import { store } from '../store/useStore'
import { useToast } from '../context/ToastContext'

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const showToast = useToast()

  function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { showToast('Please fill in all fields.', 'error'); return }
    store.login({ name: 'James Cartis', email, role: 'Admin' })
    showToast('Welcome back!', 'success')
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
        {/* Mock UI preview */}
        <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-teal-100" />
            <div className="w-24 h-2 rounded bg-slate-200" />
          </div>
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
            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Welcome Back to MedCore</h1>
            <p className="text-sm text-slate-500">Sign in to continue managing patients, appointments, and hospital operations.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label">Email or Username</label>
              <input
                type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Input your email or username"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Input your password"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded" />
                Remember Me
              </label>
              <button type="button" className="text-teal-600 font-semibold hover:underline">Forgot Password?</button>
            </div>
            <button type="submit" className="btn-primary justify-center py-2.5 text-base mt-1">
              <LogIn size={16} /> Login
            </button>
            <p className="text-center text-sm text-slate-500">
              New to MedCore?{' '}
              <button type="button" onClick={onSwitch} className="text-teal-600 font-semibold hover:underline">Create an account</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

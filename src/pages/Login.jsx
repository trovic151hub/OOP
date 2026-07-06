import React, { useState } from 'react'
import { Eye, EyeOff, Activity, LogIn, ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { api } from '../api/client'
import { setCurrentUser, initSubscriptions } from '../store/useStore'
import { useToast } from '../context/ToastContext'

const urlResetToken = new URLSearchParams(window.location.search).get('resetToken')

export default function Login({ onSwitch }) {
  const [mode, setMode]           = useState(urlResetToken ? 'reset' : 'login') // 'login' | 'forgot' | 'reset'
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [remember, setRemember]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const showToast = useToast()

  async function handleResetPassword(e) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match.', 'error'); return }
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${urlResetToken}`, { password: newPassword })
      showToast('Password updated. You can now log in.', 'success')
      window.history.replaceState({}, '', window.location.pathname)
      setMode('login')
    } catch (err) {
      showToast(err.message || 'This reset link is invalid or has expired.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { showToast('Please fill in all fields.', 'error'); return }
    setLoading(true)
    try {
      const { user } = await api.post('/auth/login', { email, password })
      setCurrentUser(user)
      initSubscriptions()
      showToast('Welcome back!', 'success')
    } catch (err) {
      showToast(err.message || 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    if (!resetEmail) { showToast('Please enter your email.', 'error'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: resetEmail })
      showToast('If an account exists for that email, a reset link has been sent.', 'success')
      setMode('login')
      setResetEmail('')
    } catch (err) {
      showToast(err.message || 'Failed to send reset email. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const LeftPanel = (
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
  )

  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex">
        {LeftPanel}
        <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <KeyRound size={26} className="text-teal-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Choose a New Password</h1>
              <p className="text-sm text-slate-500">Enter and confirm your new password below.</p>
            </div>
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label className="label">New Password</label>
                <input
                  type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input-field" autoComplete="new-password"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="input-field" autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary justify-center py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><KeyRound size={16} /> Update Password</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex">
        {LeftPanel}
        <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <Mail size={26} className="text-teal-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Reset Your Password</h1>
              <p className="text-sm text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
            </div>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="input-field" autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary justify-center py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Mail size={16} /> Send Reset Link</>
                }
              </button>
              <button type="button" onClick={() => setMode('login')} className="btn-ghost justify-center">
                <ArrowLeft size={15} /> Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {LeftPanel}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Welcome Back to MedCore</h1>
            <p className="text-sm text-slate-500">Sign in to continue managing patients, appointments, and hospital operations.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label">Email or Username</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Input your email"
                className="input-field" autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Input your password"
                  className="input-field pr-10" autoComplete="current-password"
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
              <button type="button" onClick={() => setMode('forgot')} className="text-teal-600 font-semibold hover:underline">Forgot Password?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary justify-center py-2.5 text-base mt-1 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><LogIn size={16} /> Login</>
              }
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

import React, { useState } from 'react'
import { UserCog, Shield, Search, ChevronDown, Wifi, Clock } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../context/ToastContext'

const ROLES = ['Admin', 'Doctor', 'Receptionist', 'Patient']
const TABS  = ['All', 'Admin', 'Doctor', 'Receptionist', 'Patient']

const ROLE_BADGE = {
  Admin:        'bg-teal-100 text-teal-700 border border-teal-200',
  Doctor:       'bg-purple-100 text-purple-700 border border-purple-200',
  Receptionist: 'bg-blue-100 text-blue-700 border border-blue-200',
  Patient:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
}

function getLastSeen(lastSeen) {
  if (!lastSeen) return { label: 'Never', online: false }
  const diff = Date.now() - new Date(lastSeen).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 5)   return { label: 'Online now', online: true }
  if (mins < 60)  return { label: `${mins}m ago`, online: false }
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return { label: `${hrs}h ago`, online: false }
  const days = Math.floor(hrs / 24)
  return { label: `${days}d ago`, online: false }
}

function RoleSelector({ userId, currentRole, disabled, onRoleChange }) {
  const [open, setOpen] = useState(false)
  const showToast = useToast()

  async function changeRole(role) {
    setOpen(false)
    if (role === currentRole) return
    try {
      await store.updateUserRole(userId, role)
      onRoleChange()
      showToast(`Role updated to ${role}.${role === 'Doctor' ? ' Doctor profile auto-created.' : ''}`)
    } catch {
      showToast('Failed to update role.', 'error')
    }
  }

  if (disabled) {
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[currentRole] || 'bg-slate-100 text-slate-600'}`}>
        {currentRole}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer ${ROLE_BADGE[currentRole] || 'bg-slate-100 text-slate-600'}`}
      >
        {currentRole}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-36">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => changeRole(role)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2
                  ${role === currentRole ? 'text-teal-600' : 'text-slate-700'}`}
              >
                {role === currentRole && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                {role}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function UsersPage({ currentUser }) {
  const { users } = useStore()
  const [search, setSearch]   = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [, forceUpdate] = useState(0)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
    const matchTab = activeTab === 'All' || u.role === activeTab
    return matchSearch && matchTab
  })

  const counts = {
    All:         users.length,
    Admin:        users.filter(u => u.role === 'Admin').length,
    Doctor:       users.filter(u => u.role === 'Doctor').length,
    Receptionist: users.filter(u => u.role === 'Receptionist').length,
  }

  const onlineCount = users.filter(u => {
    if (!u.lastSeen) return false
    return Date.now() - new Date(u.lastSeen).getTime() < 5 * 60 * 1000
  }).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-slate-400">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
            {onlineCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount} online
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries({ Admin: counts.Admin, Doctor: counts.Doctor, Receptionist: counts.Receptionist }).map(([role, count]) => (
            <span key={role} className={`font-bold px-2.5 py-1 rounded-full text-xs ${ROLE_BADGE[role]}`}>
              {count} {role}{count !== 1 ? 's' : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <strong>How roles work:</strong> The first person to register becomes Admin (you). All other staff sign up and land as Receptionist by default. Click any role badge below to assign the correct role — Doctor or Receptionist — before they start using the system. Assigning a Doctor role automatically creates their doctor profile.
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab} {counts[tab] !== undefined ? `(${counts[tab]})` : ''}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">
                  <div className="flex items-center gap-1">
                    <Wifi size={12} /> Status
                  </div>
                </th>
                <th className="table-th">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <UserCog size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No users yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(u => {
                const { label: seenLabel, online } = getLastSeen(u.lastSeen)
                return (
                  <tr key={u.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar name={u.name} size="sm" />
                          {online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          {u.uid === currentUser?.uid && (
                            <span className="text-[10px] font-bold text-teal-600">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-500 text-sm">{u.email}</td>
                    <td className="table-td">
                      <RoleSelector
                        userId={u.id}
                        currentRole={u.role || 'Receptionist'}
                        disabled={u.uid === currentUser?.uid}
                        onRoleChange={() => forceUpdate(n => n + 1)}
                      />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        {online
                          ? <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          : <Clock size={11} className="text-slate-300 flex-shrink-0" />
                        }
                        <span className={`text-xs font-semibold ${online ? 'text-emerald-600' : 'text-slate-400'}`}>{seenLabel}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  )
}

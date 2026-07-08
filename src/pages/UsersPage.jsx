import React, { useState } from 'react'
import { UserCog, Shield, Search, ChevronDown, Wifi, Clock, X as XIcon, Trash2 } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { getLastSeen } from '../utils/helpers'

const ROLES = ['Admin', 'Doctor', 'Receptionist', 'Patient']
const TABS  = ['All', 'Admin', 'Doctor', 'Receptionist', 'Patient']

const ROLE_BADGE = {
  Admin:        'bg-teal-100 dark:bg-teal-500/18 text-teal-700 border border-teal-200 dark:border-teal-500/30',
  Doctor:       'bg-purple-100 dark:bg-purple-500/18 text-purple-700 border border-purple-200',
  Receptionist: 'bg-blue-100 dark:bg-blue-500/18 text-blue-700 border border-blue-200 dark:border-blue-500/30',
  Patient:      'bg-emerald-100 dark:bg-emerald-500/18 text-emerald-700 border border-emerald-200 dark:border-emerald-500/30',
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
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[currentRole] || 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
        {currentRole}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer ${ROLE_BADGE[currentRole] || 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
      >
        {currentRole}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-[100] overflow-hidden min-w-36">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => changeRole(role)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2
                  ${role === currentRole ? 'text-teal-600' : 'text-slate-700 dark:text-slate-300'}`}
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
  const showToast = useToast()
  const [search, setSearch]   = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [, forceUpdate] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleDeleteUser() {
    if (!confirmDelete) return
    try {
      await store.deleteUser(confirmDelete.id)
      showToast('User deleted.', 'info')
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error')
    }
  }

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
    Patient:      users.filter(u => u.role === 'Patient').length,
  }

  const onlineCount = users.filter(u => {
    if (!u.lastSeen) return false
    return Date.now() - new Date(u.lastSeen).getTime() < 5 * 60 * 1000
  }).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">User Management</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-slate-400 dark:text-slate-600">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
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

      <div className="bg-amber-50 dark:bg-amber-500/12 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <strong>How roles work:</strong> The first person to register becomes Admin (you). All other staff sign up and land as Receptionist by default. Click any role badge below to assign the correct role — Doctor or Receptionist — before they start using the system. Assigning a Doctor role automatically creates their doctor profile.
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-sm text-teal-600' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>
                {tab} {counts[tab] !== undefined ? `(${counts[tab]})` : ''}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-40">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
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
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
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
                          <Avatar name={u.name} src={u.avatar} size="sm" />
                          {online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{u.name}</p>
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
                          : <Clock size={11} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                        }
                        <span className={`text-xs font-semibold ${online ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-600'}`}>{seenLabel}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-400 dark:text-slate-600 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="table-td">
                      {u.uid !== currentUser?.uid && (
                        <button
                          onClick={() => setConfirmDelete(u)}
                          title="Delete user"
                          className="p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
            {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={confirmDelete ? `Are you sure you want to delete ${confirmDelete.name}'s account? Their login access will be revoked immediately. If they have a linked doctor profile, it will be unlinked but not deleted. This action cannot be undone.` : ''}
      />
    </div>
  )
}

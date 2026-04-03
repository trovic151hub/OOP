import React, { useState } from 'react'
import { UserCog, Shield, Search, ChevronDown } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../context/ToastContext'

const ROLES = ['Admin', 'Doctor', 'Receptionist']

const ROLE_BADGE = {
  Admin:        'bg-teal-100 text-teal-700 border border-teal-200',
  Doctor:       'bg-purple-100 text-purple-700 border border-purple-200',
  Receptionist: 'bg-blue-100 text-blue-700 border border-blue-200',
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
      showToast(`Role updated to ${role}.`)
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
          <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-32">
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
  const [search, setSearch] = useState('')
  const [, forceUpdate] = useState(0)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
  })

  const counts = {
    Admin:        users.filter(u => u.role === 'Admin').length,
    Doctor:       users.filter(u => u.role === 'Doctor').length,
    Receptionist: users.filter(u => u.role === 'Receptionist').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {Object.entries(counts).map(([role, count]) => (
            <span key={role} className={`font-bold px-2.5 py-1 rounded-full ${ROLE_BADGE[role]}`}>
              {count} {role}{count !== 1 ? 's' : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <strong>Role permissions:</strong> Admins have full access. Doctors can manage patients and appointments. Receptionists can view doctors and manage appointments.
          Click any role badge to change a user's access level.
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
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
                <th className="table-th">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <UserCog size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No users yet'}</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
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
                  <td className="table-td text-slate-400 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
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

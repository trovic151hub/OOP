import React, { useState, useEffect } from 'react'
import { ClipboardList, RefreshCw, Filter, Search } from 'lucide-react'
import { fetchAuditLog } from '../store/useStore'
import { SkeletonTable } from '../components/ui/Skeleton'

const ENTITY_COLORS = {
  Patient:     'bg-blue-100 text-blue-700',
  Doctor:      'bg-purple-100 text-purple-700',
  Appointment: 'bg-teal-100 text-teal-700',
  Department:  'bg-amber-100 text-amber-700',
  Inventory:   'bg-emerald-100 text-emerald-700',
  Invoice:     'bg-rose-100 text-rose-700',
  User:        'bg-slate-100 text-slate-700',
}

const ACTION_COLORS = {
  Added:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Updated:      'bg-blue-50 text-blue-700 border border-blue-200',
  Deleted:      'bg-red-50 text-red-700 border border-red-200',
  'Role Changed': 'bg-purple-50 text-purple-700 border border-purple-200',
}

function formatTimestamp(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function AuditLog() {
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterEntity, setFilterEntity] = useState('All')
  const [filterAction, setFilterAction] = useState('All')

  async function loadLogs() {
    setLoading(true)
    try {
      const data = await fetchAuditLog()
      setLogs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  const entities = ['All', ...new Set(logs.map(l => l.entity).filter(Boolean))]
  const actions  = ['All', ...new Set(logs.map(l => l.action).filter(Boolean))]

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = l.entityName?.toLowerCase().includes(q) || l.userName?.toLowerCase().includes(q) || l.entity?.toLowerCase().includes(q)
    const matchEntity = filterEntity === 'All' || l.entity === filterEntity
    const matchAction = filterAction === 'All' || l.action === filterAction
    return matchSearch && matchEntity && matchAction
  })

  const actionCount = {
    Added:   logs.filter(l => l.action === 'Added').length,
    Updated: logs.filter(l => l.action === 'Updated').length,
    Deleted: logs.filter(l => l.action === 'Deleted').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Audit Log</h2>
          <p className="text-sm text-slate-400 mt-0.5">{logs.length} total activity records</p>
        </div>
        <button onClick={loadLogs} disabled={loading} className="btn-ghost text-xs">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Records Added',   value: actionCount.Added,   color: 'text-emerald-600' },
          { label: 'Records Updated', value: actionCount.Updated, color: 'text-blue-600' },
          { label: 'Records Deleted', value: actionCount.Deleted, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, entity, or user…"
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select className="input-field w-auto text-xs" value={filterEntity} onChange={e => setFilterEntity(e.target.value)}>
            {entities.map(e => <option key={e}>{e}</option>)}
          </select>
          <select className="input-field w-auto text-xs" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            {actions.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Timestamp</th>
                  <th className="table-th">User</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Entity</th>
                  <th className="table-th">Record</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ClipboardList size={32} className="text-slate-200" />
                        <p className="text-sm font-medium">{search ? 'No results found' : 'No audit logs yet'}</p>
                        <p className="text-xs">Actions will appear here as you use the system</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-td text-xs text-slate-400 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                    <td className="table-td">
                      <p className="text-sm font-semibold text-slate-700">{log.userName}</p>
                    </td>
                    <td className="table-td">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ENTITY_COLORS[log.entity] || 'bg-slate-100 text-slate-600'}`}>
                        {log.entity}
                      </span>
                    </td>
                    <td className="table-td text-slate-600 text-sm">{log.entityName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              Showing {filtered.length} of {logs.length} log entries
            </div>
          )}
        </div>
      )}
    </div>
  )
}

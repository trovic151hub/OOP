import React, { useState } from 'react'
import { Plus, Pencil, Trash2, BedDouble, Search, Building2 } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'

const ROOM_TYPES   = ['General Ward', 'Private', 'ICU', 'Emergency', 'Consultation', 'Operating Room', 'Pediatric', 'Maternity']
const ROOM_STATUSES = ['Vacant', 'Occupied', 'Maintenance']
const FLOORS       = ['Ground', '1st', '2nd', '3rd', '4th', '5th']

const EMPTY_FORM = { roomNumber: '', type: 'General Ward', status: 'Vacant', floor: 'Ground', capacity: '1', patientName: '', patientId: '', notes: '' }

const TYPE_ICON_COLOR = {
  'General Ward':    'bg-blue-50 text-blue-600',
  'Private':         'bg-purple-50 text-purple-600',
  'ICU':             'bg-red-50 text-red-600',
  'Emergency':       'bg-rose-50 text-rose-600',
  'Consultation':    'bg-teal-50 text-teal-600',
  'Operating Room':  'bg-amber-50 text-amber-600',
  'Pediatric':       'bg-pink-50 text-pink-600',
  'Maternity':       'bg-fuchsia-50 text-fuchsia-600',
}

function RoomForm({ form, setForm, patients }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Room Number <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. 101, ICU-3" value={form.roomNumber} onChange={set('roomNumber')} />
        </div>
        <div>
          <label className="label">Floor</label>
          <select className="input-field" value={form.floor} onChange={set('floor')}>
            {FLOORS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Room Type <span className="text-red-400">*</span></label>
          <select className="input-field" value={form.type} onChange={set('type')}>
            {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Capacity (beds)</label>
          <input className="input-field" type="number" min="1" value={form.capacity} onChange={set('capacity')} />
        </div>
        <div className="col-span-2">
          <label className="label">Status</label>
          <div className="flex gap-2">
            {ROOM_STATUSES.map(s => (
              <button key={s} type="button"
                onClick={() => setForm(f => ({ ...f, status: s, patientName: s !== 'Occupied' ? '' : f.patientName, patientId: s !== 'Occupied' ? '' : f.patientId }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.status === s ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {form.status === 'Occupied' && (
          <>
            <div className="col-span-2">
              <label className="label">Patient Name</label>
              <input className="input-field" list="room-patient-list" placeholder="Search patient…" value={form.patientName} onChange={set('patientName')} />
              <datalist id="room-patient-list">{patients.map(p => <option key={p.id} value={p.name} />)}</datalist>
            </div>
          </>
        )}
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Any notes about this room…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}

export default function Rooms({ currentUser }) {
  const { rooms, patients } = useStore()
  const showToast = useToast()
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]             = useState(false)
  const [editId, setEditId]           = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]     = useState(null)
  const [confirmLabel, setConfirmLabel] = useState('')

  const isAdmin = currentUser?.role === 'Admin'
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist'

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase()
    const matchSearch  = r.roomNumber?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q) || r.patientName?.toLowerCase().includes(q)
    const matchType    = filterType === 'All' || r.type === filterType
    const matchStatus  = filterStatus === 'All' || r.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const counts = {
    total:       rooms.length,
    vacant:      rooms.filter(r => r.status === 'Vacant').length,
    occupied:    rooms.filter(r => r.status === 'Occupied').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
  }

  function openAdd()  { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(r){ setForm({ ...EMPTY_FORM, ...r }); setEditId(r.id); setModal(true) }

  function handleSubmit() {
    if (!form.roomNumber.trim()) { showToast('Room number is required.', 'error'); return }
    if (editId) { store.updateRoom(editId, form); showToast('Room updated.') }
    else { store.addRoom(form); showToast('Room added.') }
    setModal(false)
  }

  function quickStatus(r, newStatus) {
    store.updateRoom(r.id, { ...r, status: newStatus, patientName: newStatus !== 'Occupied' ? '' : r.patientName })
    showToast(`Room ${r.roomNumber} marked as ${newStatus}.`, 'info')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rooms & Beds</h2>
          <p className="text-sm text-slate-400 mt-0.5">{counts.total} rooms · {counts.occupied} occupied · {counts.vacant} vacant</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Rooms', value: counts.total,       color: 'text-slate-700 bg-slate-50',   border: 'border-slate-200' },
          { label: 'Vacant',      value: counts.vacant,      color: 'text-emerald-700 bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Occupied',    value: counts.occupied,    color: 'text-blue-700 bg-blue-50',     border: 'border-blue-200' },
          { label: 'Maintenance', value: counts.maintenance, color: 'text-amber-700 bg-amber-50',   border: 'border-amber-200' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`card p-4 border ${border}`}>
            <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${color.split(' ')[0]}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search room number, type, patient…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="All">All Types</option>
          {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="input-field w-auto text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          {ROOM_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <BedDouble size={36} className="text-slate-200 mb-3" />
          <p className="text-sm font-medium">{search ? 'No results found' : 'No rooms added yet'}</p>
          {!search && canEdit && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First Room</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(r => {
            const iconColor = TYPE_ICON_COLOR[r.type] || 'bg-slate-50 text-slate-500'
            return (
              <div key={r.id} className={`card p-5 flex flex-col gap-3 border-l-4 transition-shadow hover:shadow-md ${r.status === 'Occupied' ? 'border-l-blue-400' : r.status === 'Maintenance' ? 'border-l-amber-400' : 'border-l-emerald-400'}`}>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center flex-shrink-0`}>
                    <BedDouble size={18} />
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1 rounded text-slate-300 hover:text-slate-600"><Pencil size={13} /></button>
                      <button onClick={() => { setConfirmId(r.id); setConfirmLabel(r.roomNumber) }} className="p-1 rounded text-slate-300 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-800 text-lg">Room {r.roomNumber}</p>
                    <Badge status={r.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{r.type} · {r.floor} Floor · {r.capacity} bed{r.capacity !== '1' ? 's' : ''}</p>
                </div>

                {r.status === 'Occupied' && r.patientName && (
                  <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700 flex-shrink-0">
                      {r.patientName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-blue-500 font-semibold">Current Patient</p>
                      <p className="text-xs font-bold text-blue-800 truncate">{r.patientName}</p>
                    </div>
                  </div>
                )}

                {r.notes && <p className="text-xs text-slate-400 italic truncate">{r.notes}</p>}

                {canEdit && (
                  <div className="flex gap-1.5 mt-auto pt-1">
                    {r.status !== 'Vacant' && (
                      <button onClick={() => quickStatus(r, 'Vacant')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                        Mark Vacant
                      </button>
                    )}
                    {r.status !== 'Occupied' && (
                      <button onClick={() => openEdit({ ...r, status: 'Occupied' })} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors">
                        Admit Patient
                      </button>
                    )}
                    {r.status !== 'Maintenance' && (
                      <button onClick={() => quickStatus(r, 'Maintenance')} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors">
                        Maintenance
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {canEdit && (
        <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Room' : 'Add Room'} icon={BedDouble} accentColor="teal">
          <RoomForm form={form} setForm={setForm} patients={patients} />
          <div className="flex gap-3 mt-5">
            <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
              {editId ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteRoom(confirmId, confirmLabel); showToast('Room deleted.', 'info') }}
        message="Delete this room? This cannot be undone."
      />
    </div>
  )
}

import React, { useState } from 'react'
import { Plus, Pencil, Trash2, FileText, Search, Filter, ExternalLink, Download, FolderOpen } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'

const DOC_TYPES = ['Lab Report', 'Scan / Imaging', 'Consent Form', 'Discharge Summary', 'Prescription', 'Insurance Card', 'Referral Letter', 'Medical History', 'X-Ray', 'Other']

const TYPE_COLORS = {
  'Lab Report':       'bg-blue-50   text-blue-700   border-blue-200',
  'Scan / Imaging':   'bg-violet-50 text-violet-700 border-violet-200',
  'Consent Form':     'bg-amber-50  text-amber-700  border-amber-200',
  'Discharge Summary':'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Prescription':     'bg-teal-50   text-teal-700   border-teal-200',
  'Insurance Card':   'bg-orange-50 text-orange-700 border-orange-200',
  'Referral Letter':  'bg-pink-50   text-pink-700   border-pink-200',
  'X-Ray':            'bg-slate-100 text-slate-700  border-slate-200',
  'Other':            'bg-slate-50  text-slate-600  border-slate-200',
}

const EMPTY_FORM = { patientName: '', title: '', type: 'Lab Report', date: '', description: '', url: '', uploadedBy: '' }

function DocumentForm({ form, setForm, patients }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <label className="label">Patient <span className="text-red-400">*</span></label>
        <input className="input-field" list="doc-patients" placeholder="Patient name…" value={form.patientName} onChange={set('patientName')} />
        <datalist id="doc-patients">{patients.map(p => <option key={p.id} value={p.name} />)}</datalist>
      </div>
      <div>
        <label className="label">Document Title <span className="text-red-400">*</span></label>
        <input className="input-field" placeholder="e.g. CBC Blood Test — Jan 2025" value={form.title} onChange={set('title')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Document Type</label>
          <select className="input-field" value={form.type} onChange={set('type')}>
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <input className="input-field" type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>
      <div>
        <label className="label">Document URL / Link</label>
        <input className="input-field" type="url" placeholder="https://drive.google.com/…" value={form.url} onChange={set('url')} />
        <p className="text-[11px] text-slate-400 mt-1">Paste a link to Google Drive, Dropbox, or your imaging system.</p>
      </div>
      <div>
        <label className="label">Description / Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Brief summary of the document…" value={form.description} onChange={set('description')} />
      </div>
      <div>
        <label className="label">Uploaded By</label>
        <input className="input-field" placeholder="Staff member name…" value={form.uploadedBy} onChange={set('uploadedBy')} />
      </div>
    </div>
  )
}

export default function Documents({ currentUser }) {
  const { documents = [], patients } = useStore()
  const showToast = useToast()

  const [search, setSearch]     = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterPat, setFilterPat]   = useState('')
  const [modal, setModal]       = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)

  const filtered = documents.filter(d => {
    const q = search.toLowerCase()
    const matchQ   = d.title?.toLowerCase().includes(q) || d.patientName?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
    const matchType = filterType === 'All' || d.type === filterType
    const matchPat  = !filterPat || d.patientName === filterPat
    return matchQ && matchType && matchPat
  })

  const uniquePatients = [...new Set(documents.map(d => d.patientName).filter(Boolean))]

  function openAdd()   { setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0,10), uploadedBy: currentUser?.name || '' }); setEditId(null); setModal(true) }
  function openEdit(d) { setForm({ ...EMPTY_FORM, ...d }); setEditId(d.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim()) { showToast('Patient name is required.', 'error'); return }
    if (!form.title.trim())       { showToast('Title is required.', 'error'); return }
    if (!form.date)               { showToast('Date is required.', 'error'); return }
    if (editId) { store.updateDocument(editId, form); showToast('Document updated.') }
    else        { store.addDocument(form); showToast('Document added.') }
    setModal(false)
  }

  function exportCSV() {
    const rows = [
      ['Patient','Title','Type','Date','Uploaded By','URL','Description'],
      ...filtered.map(d => [d.patientName, d.title, d.type, d.date, d.uploadedBy, d.url, d.description]),
    ]
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'documents.csv'; a.click()
  }

  const typeCounts = DOC_TYPES.reduce((acc, t) => { acc[t] = documents.filter(d => d.type === t).length; return acc }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patient Documents</h2>
          <p className="text-sm text-slate-400 mt-0.5">{documents.length} total documents across {uniquePatients.length} patients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}  className="btn-ghost text-xs"><Download size={13} /> Export</button>
          <button onClick={openAdd}    className="btn-primary"><Plus size={15} /> Add Document</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5 overflow-x-auto pb-1">
        {['All', ...DOC_TYPES].map(t => (
          <button key={t}
            onClick={() => setFilterType(t)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${filterType === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600'}`}>
            {t}{t !== 'All' && typeCounts[t] > 0 ? ` (${typeCounts[t]})` : ''}
          </button>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Filter size={14} className="text-slate-400" />
        <select className="input-field !w-auto text-xs" value={filterPat} onChange={e => setFilterPat(e.target.value)}>
          <option value="">All Patients</option>
          {uniquePatients.sort().map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <FolderOpen size={40} className="text-slate-200 mb-3" />
          <p className="text-sm font-semibold">{search || filterType !== 'All' ? 'No results' : 'No documents yet'}</p>
          {!search && filterType === 'All' && <button onClick={openAdd} className="btn-primary text-xs mt-4"><Plus size={13} /> Add First</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => {
            const typeStyle = TYPE_COLORS[d.type] || TYPE_COLORS['Other']
            return (
              <div key={d.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${typeStyle}`}>{d.type}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors" title="Open document">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirmId(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-sm leading-snug">{d.title}</p>
                  {d.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <Avatar name={d.patientName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{d.patientName}</p>
                    <p className="text-[10px] text-slate-400">{d.date ? formatDate(d.date) : '—'}{d.uploadedBy ? ` · ${d.uploadedBy}` : ''}</p>
                  </div>
                  {d.url && (
                    <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" title="Has link" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Document' : 'Add Document'} icon={FileText} accentColor="teal">
        <DocumentForm form={form} setForm={setForm} patients={patients} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Document'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteDocument(confirmId); showToast('Deleted.', 'info') }}
        message="Delete this document record? This cannot be undone."
      />
    </div>
  )
}

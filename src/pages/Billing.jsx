import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Printer, Download, Filter, Search, X as XIcon, BadgeDollarSign } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import FormDropdown from '../components/ui/FormDropdown'
import FilterDropdown from '../components/ui/FilterDropdown'
import Combobox from '../components/ui/Combobox'
import DatePicker from '../components/ui/DatePicker'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { formatDate, formatCurrency, getCurrencySymbol } from '../utils/helpers'
import { exportCSV } from '../utils/exportCSV'

const EMPTY_FORM = { patientName: '', patientId: '', patientEmail: '', description: '', date: '', services: '', subtotal: '', discount: '0', total: '', status: 'Pending', notes: '' }
const STATUSES = ['Pending', 'Paid', 'Overdue', 'Waived']

const STATUS_STYLE = {
  Paid:    'bg-emerald-100 dark:bg-emerald-500/18 text-emerald-700',
  Pending: 'bg-amber-100 dark:bg-amber-500/18 text-amber-700',
  Overdue: 'bg-red-100 dark:bg-red-500/18 text-red-600',
  Waived:  'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400',
}

function InvoiceForm({ form, setForm, patients, settings }) {
  const symbol = getCurrencySymbol(settings?.currency)
  const taxRate = parseFloat(settings?.taxRate) || 0
  const set = k => e => setForm(f => {
    const updated = { ...f, [k]: e.target.value }
    if (k === 'subtotal' || k === 'discount') {
      const sub = parseFloat(k === 'subtotal' ? e.target.value : updated.subtotal) || 0
      const dis = parseFloat(k === 'discount'  ? e.target.value : updated.discount) || 0
      const taxed = Math.max(0, sub - dis) * (1 + taxRate / 100)
      updated.total = taxed.toFixed(2)
    }
    return updated
  })
  return (
    <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Patient <span className="text-red-400">*</span></label>
          <Combobox
            value={form.patientName}
            onChange={v => {
              const pat = patients.find(p => p.name === v)
              setForm(f => ({ ...f, patientName: v, patientId: pat?.id || '', patientEmail: pat?.email || '' }))
            }}
            options={patients}
            getLabel={p => p.name}
            getSub={p => p.phone}
            placeholder="Patient name"
          />
        </div>
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
        </div>
        <div>
          <label className="label">Status</label>
          <FormDropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={STATUSES.map(s => ({ value: s, label: s }))} />
        </div>
        <div className="col-span-2">
          <label className="label">Description / Service</label>
          <input className="input-field" placeholder="e.g. Cardiology Consultation, Lab Tests" value={form.description} onChange={set('description')} />
        </div>
        <div className="col-span-2">
          <label className="label">Services / Line Items</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Itemize services, one per line…" value={form.services} onChange={set('services')} />
        </div>
        <div>
          <label className="label">Subtotal ({symbol})</label>
          <input type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.subtotal} onChange={set('subtotal')} />
        </div>
        <div>
          <label className="label">Discount ({symbol})</label>
          <input type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.discount} onChange={set('discount')} />
        </div>
        <div className="col-span-2">
          <label className="label">Total ({symbol}){taxRate > 0 ? ` — incl. ${taxRate}% tax` : ''}</label>
          <input type="number" className="input-field bg-slate-50 dark:bg-slate-800" placeholder="0.00" value={form.total} onChange={set('total')} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Payment instructions, insurance info…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}

function invoiceNumber(invoicePrefix, id) {
  const prefix = invoicePrefix || 'INV-'
  const separator = /[-\s/]$/.test(prefix) ? '' : '-'
  return `${prefix}${separator}${id?.slice(-6).toUpperCase()}`
}

function printInvoice(invoice, settings) {
  const hospitalName = settings?.hospitalName || 'MedCore'
  const symbol = getCurrencySymbol(settings?.currency)
  const invoiceNo = invoiceNumber(settings?.invoicePrefix, invoice.id)
  const subtotal = parseFloat(invoice.subtotal || 0)
  const discount = parseFloat(invoice.discount || 0)
  const total = parseFloat(invoice.total || 0)
  const taxAmount = total - (subtotal - discount)
  const w = window.open('', '_blank')
  w.document.write(`
    <html><head><title>Invoice ${invoiceNo}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 40px; max-width: 680px; margin: 0 auto; color: #1e293b; }
      h1 { color: #0d9488; margin: 0; }
      .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .meta-item { background: #f8fafc; border-radius: 8px; padding: 12px; }
      .meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px; }
      .meta-value { font-size: 14px; font-weight: 600; }
      .services { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
      .total-line { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e2e8f0; }
      .total-amount { font-size: 22px; font-weight: 800; color: #0d9488; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;
        background: ${invoice.status === 'Paid' ? '#d1fae5' : invoice.status === 'Overdue' ? '#fee2e2' : '#fef3c7'};
        color: ${invoice.status === 'Paid' ? '#065f46' : invoice.status === 'Overdue' ? '#991b1b' : '#92400e'}; }
      @media print { button { display: none; } }
    </style></head>
    <body>
      <div class="header">
        <div><h1>${hospitalName}</h1><p style="color:#94a3b8;margin:4px 0 0">Hospital Management System</p></div>
        <div style="text-align:right">
          <p style="font-size:22px;font-weight:800;margin:0">Invoice</p>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0">${invoiceNo}</p>
          <span class="status-badge">${invoice.status}</span>
        </div>
      </div>
      <div class="meta">
        <div class="meta-item"><div class="meta-label">Patient</div><div class="meta-value">${invoice.patientName}</div></div>
        <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">${invoice.date || 'N/A'}</div></div>
        ${settings?.paymentTerms ? `<div class="meta-item"><div class="meta-label">Payment Terms</div><div class="meta-value">${settings.paymentTerms}</div></div>` : ''}
      </div>
      <div class="services">
        <div class="meta-label" style="margin-bottom:12px">Services</div>
        <p style="font-weight:600;margin:0 0 8px">${invoice.description || '—'}</p>
        ${invoice.services ? `<pre style="font-size:13px;color:#64748b;margin:0;white-space:pre-wrap">${invoice.services}</pre>` : ''}
      </div>
      <div>
        ${discount > 0 ? `<div class="total-line"><span>Subtotal</span><span>${symbol}${subtotal.toLocaleString('en-US')}</span></div>
        <div class="total-line"><span>Discount</span><span>-${symbol}${discount.toLocaleString('en-US')}</span></div>` : ''}
        ${taxAmount > 0.01 ? `<div class="total-line"><span>Tax${settings?.taxRate ? ` (${settings.taxRate}%)` : ''}</span><span>${symbol}${taxAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span></div>` : ''}
        <div class="total-line" style="border-top:2px solid #0d9488;padding-top:12px">
          <span style="font-weight:800;font-size:16px">Total Due</span>
          <span class="total-amount">${symbol}${total.toLocaleString('en-US')}</span>
        </div>
      </div>
      ${invoice.notes ? `<div style="margin-top:24px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#64748b"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
      ${settings?.invoiceNotes ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#64748b">${settings.invoiceNotes}</div>` : ''}
      <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8">Generated by ${hospitalName} · ${new Date().toLocaleDateString()}</div>
    </body></html>`)
  w.document.close()
  w.print()
}

export default function Billing({ currentUser }) {
  const { billing, patients, loading, settings } = useStore()
  const showToast = useToast()
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [modal, setModal]           = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]   = useState(null)

  const isAdmin = ['Admin','Receptionist'].includes(currentUser?.role)

  const filtered = billing.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = b.patientName?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'All' || b.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalRevenue = billing.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const totalPending = billing.filter(b => b.status === 'Pending').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)
  const totalOverdue = billing.filter(b => b.status === 'Overdue').reduce((s, b) => s + (parseFloat(b.total) || 0), 0)

  function openAdd() { setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) }); setEditId(null); setModal(true) }
  function openEdit(b) { setForm({ ...EMPTY_FORM, ...b }); setEditId(b.id); setModal(true) }

  function handleSubmit() {
    if (!form.patientName.trim()) { showToast('Patient name is required.', 'error'); return }
    if (!form.date) { showToast('Date is required.', 'error'); return }
    const pat = patients.find(p => p.id === form.patientId || p.name === form.patientName)
    const payload = { ...form, patientId: pat?.id || form.patientId || '', patientEmail: pat?.email || form.patientEmail || '' }
    if (editId) { store.updateInvoice(editId, payload); showToast('Invoice updated.') }
    else { store.addInvoice(payload); showToast('Invoice created.') }
    setModal(false)
  }

  if (loading) return <SkeletonTable rows={5} cols={6} />

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Billing & Invoicing</h2>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">{billing.length} invoices</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => exportCSV(
            ['Patient','Description','Date','Subtotal','Discount','Total','Status'],
            billing.map(b => [b.patientName, b.description, b.date, b.subtotal, b.discount, b.total, b.status]),
            `billing_${new Date().toISOString().slice(0,10)}.csv`
          )} className="btn-ghost text-xs">
            <Download size={13} /> Export CSV
          </button>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={15} /> New Invoice
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Invoices', value: billing.length,                              color: 'text-slate-700 dark:text-slate-300' },
          { label: 'Revenue',        value: formatCurrency(totalRevenue, settings?.currency),  color: 'text-emerald-600' },
          { label: 'Pending',        value: formatCurrency(totalPending, settings?.currency),  color: 'text-amber-600' },
          { label: 'Overdue',        value: formatCurrency(totalOverdue, settings?.currency),  color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 mb-1">{label}</p>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or description…"
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
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            icon={Filter}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[{ value: 'All', label: 'All Status' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
          />
          {(search || filterStatus !== 'All') && (
            <button
              onClick={() => { setSearch(''); setFilterStatus('All') }}
              className="text-xs font-semibold text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="table-th">Invoice</th>
                <th className="table-th">Patient</th>
                <th className="table-th">Description</th>
                <th className="table-th">Date</th>
                <th className="table-th">Total</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                      <BadgeDollarSign size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No invoices yet'}</p>
                      {!search && isAdmin && <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={13} /> Create First Invoice</button>}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="table-td text-xs font-mono text-slate-400 dark:text-slate-600">{invoiceNumber(settings?.invoicePrefix, b.id)}</td>
                  <td className="table-td font-semibold text-slate-800 dark:text-slate-200 text-sm">{b.patientName}</td>
                  <td className="table-td text-slate-500 text-xs max-w-40 truncate">{b.description || '—'}</td>
                  <td className="table-td text-slate-500 text-xs">{b.date ? formatDate(b.date) : '—'}</td>
                  <td className="table-td font-bold text-slate-800 dark:text-slate-200">{formatCurrency(b.total, settings?.currency)}</td>
                  <td className="table-td">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status] || 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => printInvoice(b, settings)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-colors" title="Print Invoice">
                        <Printer size={14} />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirmId(b.id)} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
            Showing {filtered.length} of {billing.length} invoices
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Invoice' : 'New Invoice'} icon={BadgeDollarSign} maxWidth="max-w-xl">
        <InvoiceForm form={form} setForm={setForm} patients={patients} settings={settings} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteInvoice(confirmId); showToast('Invoice deleted.', 'info') }}
        message="Are you sure you want to delete this invoice?"
      />
    </div>
  )
}


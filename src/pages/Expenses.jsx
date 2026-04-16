import React, { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, TrendingDown, Search, Filter, Download, BarChart2, DollarSign } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Badge from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'
import { formatDate, formatCurrency } from '../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CATEGORIES = ['Salaries', 'Medical Supplies', 'Equipment', 'Utilities', 'Maintenance', 'Rent', 'Insurance', 'Marketing', 'IT & Software', 'Training', 'Other']
const STATUSES   = ['Paid', 'Pending', 'Overdue']
const METHODS    = ['Bank Transfer', 'Cash', 'Cheque', 'Card', 'Online Payment']
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const EMPTY_FORM = { description: '', category: 'Medical Supplies', amount: '', date: '', status: 'Paid', paymentMethod: 'Bank Transfer', vendor: '', notes: '', recurring: false }

function ExpenseForm({ form, setForm }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <label className="label">Description <span className="text-red-400">*</span></label>
        <input className="input-field" placeholder="e.g., Monthly nurse salaries" value={form.description} onChange={set('description')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Amount ($) <span className="text-red-400">*</span></label>
          <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} />
        </div>
        <div>
          <label className="label">Date <span className="text-red-400">*</span></label>
          <input className="input-field" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select className="input-field" value={form.paymentMethod} onChange={set('paymentMethod')}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Vendor / Supplier</label>
          <input className="input-field" placeholder="e.g., PharmaCorp" value={form.vendor} onChange={set('vendor')} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Additional notes…" value={form.notes} onChange={set('notes')} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.recurring} onChange={set('recurring')} className="w-4 h-4 accent-teal-600" />
        <span className="text-sm text-slate-600 font-medium">Recurring expense</span>
      </label>
    </div>
  )
}

export default function Expenses() {
  const { expenses = [], invoices = [] } = useStore()
  const showToast = useToast()

  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterMonth, setFilterMonth] = useState('All')
  const [modal, setModal]       = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)
  const [view, setView]         = useState('list')

  const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.totalAmount || 0), 0), [invoices])

  const currentYear  = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase()
    const matchQ    = e.description?.toLowerCase().includes(q) || e.vendor?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q)
    const matchCat  = filterCat === 'All' || e.category === filterCat
    const matchMonth = filterMonth === 'All' || (e.date && new Date(e.date).getMonth() === MONTHS.indexOf(filterMonth) && new Date(e.date).getFullYear() === currentYear)
    return matchQ && matchCat && matchMonth
  })

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const thisMonthExp  = expenses.filter(e => e.date && new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).reduce((s, e) => s + Number(e.amount || 0), 0)
  const pendingExp    = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + Number(e.amount || 0), 0)
  const netProfit     = totalRevenue - totalExpenses

  const byCat = CATEGORIES.map(c => ({ name: c.length > 10 ? c.slice(0, 10) + '…' : c, amount: expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount || 0), 0) })).filter(c => c.amount > 0)

  const byMonth = MONTHS.map((m, i) => ({
    name: m,
    Expenses: expenses.filter(e => e.date && new Date(e.date).getMonth() === i && new Date(e.date).getFullYear() === currentYear).reduce((s, e) => s + Number(e.amount || 0), 0),
    Revenue:  invoices.filter(inv => inv.status === 'Paid' && inv.date && new Date(inv.date).getMonth() === i && new Date(inv.date).getFullYear() === currentYear).reduce((s, inv) => s + Number(inv.totalAmount || 0), 0),
  }))

  function openAdd()  { setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) }); setEditId(null); setModal(true) }
  function openEdit(e){ setForm({ ...EMPTY_FORM, ...e }); setEditId(e.id); setModal(true) }

  function handleSubmit() {
    if (!form.description.trim()) { showToast('Description is required.', 'error'); return }
    if (!form.amount || Number(form.amount) <= 0) { showToast('Enter a valid amount.', 'error'); return }
    if (!form.date) { showToast('Date is required.', 'error'); return }
    const data = { ...form, amount: Number(form.amount) }
    if (editId) { store.updateExpense(editId, data); showToast('Expense updated.') }
    else { store.addExpense(data); showToast('Expense added.') }
    setModal(false)
  }

  function exportCSV() {
    const rows = [
      ['Description','Category','Amount','Date','Status','Vendor','Method','Recurring'],
      ...filtered.map(e => [e.description, e.category, e.amount, e.date, e.status, e.vendor, e.paymentMethod, e.recurring ? 'Yes' : 'No']),
    ]
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'expenses.csv'; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Expense Tracking</h2>
          <p className="text-sm text-slate-400 mt-0.5">{expenses.length} expenses · Net P&amp;L: <span className={netProfit >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{formatCurrency(netProfit)}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(v => v === 'list' ? 'chart' : 'list')} className="btn-ghost text-xs"><BarChart2 size={13} /> {view === 'list' ? 'Analytics' : 'List'}</button>
          <button onClick={exportCSV} className="btn-ghost text-xs"><Download size={13} /> Export</button>
          <button onClick={openAdd}   className="btn-primary"><Plus size={15} /> Add Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Expenses',    value: formatCurrency(totalExpenses), color: 'text-red-600',     border: 'border-red-200' },
          { label: 'This Month',        value: formatCurrency(thisMonthExp),  color: 'text-amber-600',   border: 'border-amber-200' },
          { label: 'Total Revenue',     value: formatCurrency(totalRevenue),  color: 'text-teal-600',    border: 'border-teal-200' },
          { label: 'Net Profit / Loss', value: formatCurrency(netProfit),     color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', border: netProfit >= 0 ? 'border-emerald-200' : 'border-red-200' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`card p-4 border ${border}`}>
            <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {pendingExp > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-amber-700">
          <DollarSign size={15} /> <strong>{formatCurrency(pendingExp)}</strong> in pending expenses awaiting payment
        </div>
      )}

      {view === 'chart' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-600 mb-4">Revenue vs Expenses ({currentYear})</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Revenue"  fill="#14b8a6" radius={[4,4,0,0]} />
                <Bar dataKey="Expenses" fill="#f87171" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-600 mb-4">Expenses by Category</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCat} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#f472b6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search expenses…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Filter size={14} className="text-slate-400" />
        <select className="input-field !w-auto text-xs" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input-field !w-auto text-xs" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option>All</option>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr>
            {['Description','Category','Amount','Date','Status','Vendor',''].map(h => <th key={h} className="table-th">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                <TrendingDown size={30} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm">{search ? 'No results' : 'No expenses yet'}</p>
                {!search && <button onClick={openAdd} className="btn-primary text-xs mt-3"><Plus size={13} /> Add First</button>}
              </td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="table-row">
                <td className="table-td">
                  <p className="font-semibold text-slate-800">{e.description}</p>
                  {e.recurring && <span className="text-[10px] bg-violet-50 text-violet-600 font-bold px-1.5 py-0.5 rounded">Recurring</span>}
                </td>
                <td className="table-td">
                  <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">{e.category}</span>
                </td>
                <td className="table-td font-bold text-red-600">{formatCurrency(e.amount || 0)}</td>
                <td className="table-td text-slate-400 text-xs">{e.date ? formatDate(e.date) : '—'}</td>
                <td className="table-td"><Badge status={e.status} /></td>
                <td className="table-td text-xs text-slate-500">{e.vendor || '—'}</td>
                <td className="table-td">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil size={13} /></button>
                    <button onClick={() => setConfirmId(e.id)} className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Expense' : 'Add Expense'} icon={TrendingDown} accentColor="teal">
        <ExpenseForm form={form} setForm={setForm} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteExpense(confirmId); showToast('Deleted.', 'info') }}
        message="Delete this expense record? This cannot be undone."
      />
    </div>
  )
}

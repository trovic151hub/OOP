import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Package, AlertTriangle, Filter, Download } from 'lucide-react'
import { useStore, store } from '../store/useStore'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { exportInventory } from '../utils/exportCSV'

const EMPTY_FORM = { name: '', category: 'Medication', quantity: '', unit: 'pieces', reorderLevel: '', supplier: '', location: '', notes: '' }
const CATEGORIES = ['Medication', 'Equipment', 'Supplies', 'PPE', 'Laboratory', 'Surgical', 'Radiology', 'Other']
const UNITS = ['pieces', 'boxes', 'vials', 'bottles', 'sets', 'pairs', 'kg', 'liters', 'tablets']

function getStockStatus(qty, reorder) {
  const q = parseInt(qty) || 0
  const r = parseInt(reorder) || 0
  if (q === 0) return { label: 'Out of Stock', cls: 'bg-red-50 text-red-700' }
  if (q <= r)  return { label: 'Low Stock',    cls: 'bg-amber-50 text-amber-700' }
  return { label: 'In Stock', cls: 'bg-emerald-50 text-emerald-700' }
}

function ItemForm({ form, setForm }) {
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Item Name <span className="text-red-400">*</span></label>
          <input className="input-field" placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Unit</label>
          <select className="input-field" value={form.unit} onChange={set('unit')}>
            {UNITS.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Quantity <span className="text-red-400">*</span></label>
          <input className="input-field" type="number" placeholder="0" min="0" value={form.quantity} onChange={set('quantity')} />
        </div>
        <div>
          <label className="label">Reorder Level</label>
          <input className="input-field" type="number" placeholder="e.g. 10" min="0" value={form.reorderLevel} onChange={set('reorderLevel')} />
        </div>
        <div>
          <label className="label">Supplier</label>
          <input className="input-field" placeholder="e.g. MedSupply Co." value={form.supplier} onChange={set('supplier')} />
        </div>
        <div>
          <label className="label">Storage Location</label>
          <input className="input-field" placeholder="e.g. Pharmacy Shelf A2" value={form.location} onChange={set('location')} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Expiry dates, handling instructions…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}

export default function Inventory({ currentUser }) {
  const { inventory } = useStore()
  const showToast = useToast()
  const [search, setSearch]         = useState('')
  const [filterCat, setFilterCat]   = useState('All')
  const [filterStock, setFilterStock] = useState('All')
  const [modal, setModal]           = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [confirmId, setConfirmId]   = useState(null)

  const isAdmin = currentUser?.role === 'Admin'

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase()
    const matchSearch = item.name?.toLowerCase().includes(q) || item.supplier?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q)
    const matchCat = filterCat === 'All' || item.category === filterCat
    const { label } = getStockStatus(item.quantity, item.reorderLevel)
    const matchStock = filterStock === 'All' || label === filterStock
    return matchSearch && matchCat && matchStock
  })

  const lowStockCount = inventory.filter(i => getStockStatus(i.quantity, i.reorderLevel).label !== 'In Stock').length

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  function openEdit(item) { setForm({ ...EMPTY_FORM, ...item }); setEditId(item.id); setModal(true) }

  function handleSubmit() {
    if (!form.name.trim()) { showToast('Item name is required.', 'error'); return }
    if (form.quantity === '') { showToast('Quantity is required.', 'error'); return }
    if (editId) { store.updateInventoryItem(editId, form); showToast('Item updated.') }
    else { store.addInventoryItem(form); showToast('Item added.') }
    setModal(false)
  }

  const summaryCards = [
    { label: 'Total Items',   value: inventory.length,                                                                         color: 'teal' },
    { label: 'In Stock',      value: inventory.filter(i => getStockStatus(i.quantity, i.reorderLevel).label === 'In Stock').length,    color: 'emerald' },
    { label: 'Low Stock',     value: inventory.filter(i => getStockStatus(i.quantity, i.reorderLevel).label === 'Low Stock').length,    color: 'amber' },
    { label: 'Out of Stock',  value: inventory.filter(i => getStockStatus(i.quantity, i.reorderLevel).label === 'Out of Stock').length, color: 'red' },
  ]

  const bgMap = { teal: 'bg-teal-50 text-teal-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600' }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inventory</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {inventory.length} items · {lowStockCount > 0 && <span className="text-amber-500 font-semibold">{lowStockCount} need attention</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportInventory(inventory)} className="btn-ghost text-xs">
            <Download size={13} /> Export CSV
          </button>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={15} /> Add Item
            </button>
          )}
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700 font-semibold">
          <AlertTriangle size={16} className="flex-shrink-0" />
          {lowStockCount} item{lowStockCount > 1 ? 's are' : ' is'} low or out of stock and may need restocking.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${bgMap[color].split(' ')[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, category, supplier…" className="flex-1 min-w-48" />
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select className="input-field w-auto text-xs" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input-field w-auto text-xs" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
            <option value="All">All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Item</th>
                <th className="table-th">Category</th>
                <th className="table-th">Quantity</th>
                <th className="table-th">Reorder At</th>
                <th className="table-th">Status</th>
                <th className="table-th">Supplier</th>
                <th className="table-th">Location</th>
                {isAdmin && <th className="table-th text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package size={32} className="text-slate-200" />
                      <p className="text-sm font-medium">{search ? 'No results found' : 'No items yet'}</p>
                      {!search && isAdmin && <button onClick={openAdd} className="btn-primary text-xs mt-2"><Plus size={13} /> Add First Item</button>}
                    </div>
                  </td>
                </tr>
              ) : filtered.map(item => {
                const stock = getStockStatus(item.quantity, item.reorderLevel)
                return (
                  <tr key={item.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                          {item.notes && <p className="text-xs text-slate-400 truncate max-w-32">{item.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-500 text-xs">{item.category}</td>
                    <td className="table-td font-semibold text-slate-700">{item.quantity} <span className="text-slate-400 font-normal text-xs">{item.unit}</span></td>
                    <td className="table-td text-slate-400 text-xs">{item.reorderLevel || '—'}</td>
                    <td className="table-td">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stock.cls}`}>{stock.label}</span>
                    </td>
                    <td className="table-td text-slate-500 text-xs">{item.supplier || '—'}</td>
                    <td className="table-td text-slate-400 text-xs">{item.location || '—'}</td>
                    {isAdmin && (
                      <td className="table-td text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirmId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {inventory.length} items
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Item' : 'Add Inventory Item'} icon={Package}>
        <ItemForm form={form} setForm={setForm} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
            {editId ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { store.deleteInventoryItem(confirmId); showToast('Item deleted.', 'info') }}
        message="Are you sure you want to delete this inventory item?"
      />
    </div>
  )
}

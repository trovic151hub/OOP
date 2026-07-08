export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Doctor names are sometimes stored with a "Dr." prefix already (e.g. seeded
// data) and sometimes without (free-text entry) — normalize so it never doubles up.
export function withDrPrefix(name) {
  if (!name) return name
  return name.replace(/^dr\.?\s+/i, '').replace(/^/, 'Dr. ')
}

// `medications` is stored as a free-text string in some places (Pharmacy orders'
// own form) and as a structured array of {name, dosage/qty, ...} objects in others
// (seeded pharmacy orders, and every Prescription) — normalize to a display string
// so it's always safe to render directly, regardless of which shape it came from.
export function formatMedications(meds) {
  if (!meds) return ''
  if (typeof meds === 'string') return meds
  if (Array.isArray(meds)) {
    return meds.map(m => {
      if (typeof m === 'string') return m
      const qty = m.qty ? ` x${m.qty}` : m.dosage ? ` ${m.dosage}` : ''
      return `${m.name || ''}${qty}`
    }).filter(Boolean).join(', ')
  }
  return String(meds)
}

export function formatDate(dateStr, timeZone) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone })
}

export function formatDateTime(dateStr, timeZone) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone })
}

export const APPOINTMENT_STATUSES = ['Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled']

export function cycleStatus(current, list = APPOINTMENT_STATUSES) {
  const forwardList = list.filter(s => s !== 'Cancelled')
  const idx = forwardList.indexOf(current)
  if (idx === -1 || idx === forwardList.length - 1) return current
  return forwardList[idx + 1]
}

export function getBadgeStyle(status) {
  const map = {
    Active:        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border dark:border-emerald-500/30',
    Discharged:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-700',
    Critical:      'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-400 dark:border dark:border-red-500/30',
    'In Treatment':'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400 dark:border dark:border-blue-500/30',
    Admitted:      'bg-teal-50 text-teal-700 dark:bg-teal-500/12 dark:text-teal-400 dark:border dark:border-teal-500/30',
    Available:     'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border dark:border-emerald-500/30',
    Unavailable:   'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-400 dark:border dark:border-red-500/30',
    Busy:          'bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-400 dark:border dark:border-amber-500/30',
    'On Leave':    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-700',
    Scheduled:     'bg-teal-50 text-teal-700 dark:bg-teal-500/12 dark:text-teal-400 dark:border dark:border-teal-500/30',
    'Checked In':  'bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-400 dark:border dark:border-violet-500/30',
    'In Progress': 'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400 dark:border dark:border-blue-500/30',
    Ongoing:       'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400 dark:border dark:border-blue-500/30',
    Completed:     'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border dark:border-emerald-500/30',
    Cancelled:     'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-400 dark:border dark:border-red-500/30',
    Pending:       'bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-400 dark:border dark:border-amber-500/30',
    Confirmed:     'bg-teal-50 text-teal-700 dark:bg-teal-500/12 dark:text-teal-400 dark:border dark:border-teal-500/30',
    Normal:        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border dark:border-emerald-500/30',
    Abnormal:      'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-400 dark:border dark:border-red-500/30',
    Maintenance:   'bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-400 dark:border dark:border-amber-500/30',
    'Under Maintenance': 'bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-400 dark:border dark:border-amber-500/30',
    Occupied:      'bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400 dark:border dark:border-blue-500/30',
    Vacant:        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border dark:border-emerald-500/30',
    Paid:          'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400 dark:border dark:border-emerald-500/30',
    Overdue:       'bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-400 dark:border dark:border-red-500/30',
    Inactive:      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 dark:border dark:border-slate-700',
  }
  return map[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-700'
}

export const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
]

export function getAvatarColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// A user counts as "online" if their last heartbeat (App.jsx pings every 5
// minutes while logged in) landed within the last 5 minutes.
export function getLastSeen(lastSeen) {
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

export const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', INR: '₹', NGN: '₦',
  KES: 'KSh', GHS: '₵', ZAR: 'R', CAD: 'CA$', AUD: 'A$', SGD: 'S$', JPY: '¥',
}

export function getCurrencySymbol(currency = 'NGN') {
  return CURRENCY_SYMBOLS[currency] || currency
}

export function formatCurrency(amount, currency = 'NGN') {
  const n = Number(amount) || 0
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// Compact form for stat cards / axis labels (e.g. ₦1.2M, $45.3K).
export function formatCompactCurrency(amount, currency = 'NGN') {
  const n = Number(amount) || 0
  const symbol = getCurrencySymbol(currency)
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${symbol}${(n / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${symbol}${(n / 1e3).toFixed(1)}K`
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

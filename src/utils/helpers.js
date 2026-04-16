export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
    Active:        'bg-emerald-50 text-emerald-700',
    Discharged:    'bg-slate-100 text-slate-600',
    Critical:      'bg-red-50 text-red-700',
    'In Treatment':'bg-blue-50 text-blue-700',
    Admitted:      'bg-teal-50 text-teal-700',
    Available:     'bg-emerald-50 text-emerald-700',
    Unavailable:   'bg-red-50 text-red-700',
    Busy:          'bg-amber-50 text-amber-700',
    'On Leave':    'bg-slate-100 text-slate-600',
    Scheduled:     'bg-teal-50 text-teal-700',
    'Checked In':  'bg-violet-50 text-violet-700',
    'In Progress': 'bg-blue-50 text-blue-700',
    Ongoing:       'bg-blue-50 text-blue-700',
    Completed:     'bg-emerald-50 text-emerald-700',
    Cancelled:     'bg-red-50 text-red-700',
    Pending:       'bg-amber-50 text-amber-700',
    Confirmed:     'bg-teal-50 text-teal-700',
    Normal:        'bg-emerald-50 text-emerald-700',
    Abnormal:      'bg-red-50 text-red-700',
    Maintenance:   'bg-amber-50 text-amber-700',
    Occupied:      'bg-blue-50 text-blue-700',
    Vacant:        'bg-emerald-50 text-emerald-700',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
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

import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Bell, Calendar, CheckCircle, ChevronRight, Clock,
  FlaskConical, Inbox, ListFilter, MessageSquare, Package, UserCheck
} from 'lucide-react'
import { useStore, store, setPendingChatTarget } from '../store/useStore'
import {
  conversationKey, getReadMap, isMessageUnread, markConversationRead, onMessageRead
} from '../utils/messageReadState'
import { withDrPrefix } from '../utils/helpers'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'clinical', label: 'Clinical' },
  { id: 'operations', label: 'Operations' },
  { id: 'messages', label: 'Messages' },
]

function getStockStatus(qty, reorder) {
  const q = parseInt(qty) || 0
  const r = parseInt(reorder) || 0
  if (q === 0) return 'Out of Stock'
  if (q <= r) return 'Low Stock'
  return 'In Stock'
}

function SummaryPill({ icon: Icon, label, value, tone = 'teal' }) {
  const tones = {
    teal: 'bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-500/30',
    blue: 'bg-blue-50 dark:bg-blue-500/12 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/30',
    amber: 'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/30',
    red: 'bg-red-50 dark:bg-red-500/12 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/30',
  }
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 flex items-center gap-2.5 min-w-[148px]">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${tones[tone] || tones.teal}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-600 truncate">{label}</p>
        <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{value}</p>
      </div>
    </div>
  )
}

function FeedItem({ item }) {
  const tones = {
    teal: 'bg-teal-50 dark:bg-teal-500/12 text-teal-600 border-teal-100 dark:border-teal-500/30',
    blue: 'bg-blue-50 dark:bg-blue-500/12 text-blue-600 border-blue-100 dark:border-blue-500/30',
    violet: 'bg-violet-50 dark:bg-violet-500/12 text-violet-600 border-violet-100 dark:border-violet-500/30',
    amber: 'bg-amber-50 dark:bg-amber-500/12 text-amber-600 border-amber-100 dark:border-amber-500/30',
    red: 'bg-red-50 dark:bg-red-500/12 text-red-600 border-red-100 dark:border-red-500/30',
  }
  const Icon = item.icon
  return (
    <button onClick={item.onClick} className={`w-full flex items-start gap-3 px-3.5 sm:px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${item.unread ? 'bg-teal-50/60 dark:bg-teal-500/10' : ''}`}>
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${tones[item.tone] || tones.teal}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-sm sm:text-[15px] truncate ${item.unread ? 'font-extrabold text-slate-900 dark:text-slate-100' : 'font-bold text-slate-800 dark:text-slate-200'}`}>{item.title}</p>
          {item.priority === 'High' && <span className="rounded-full bg-red-50 dark:bg-red-500/12 px-2 py-0.5 text-[10px] font-bold text-red-600">High</span>}
          {item.unread && <span className="rounded-full bg-teal-100 dark:bg-teal-500/18 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">Unread</span>}
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-500 line-clamp-2">{item.detail}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-600">
          <span className="rounded-full bg-slate-100 dark:bg-slate-900 px-2 py-0.5">{item.groupLabel}</span>
          {item.meta && <span>{item.meta}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 mt-3 flex-shrink-0" />
    </button>
  )
}

function PriorityRail({ title, items, icon: Icon, empty, tone = 'amber' }) {
  const tones = {
    amber: 'bg-amber-50 dark:bg-amber-500/12 text-amber-600',
    red: 'bg-red-50 dark:bg-red-500/12 text-red-600',
    violet: 'bg-violet-50 dark:bg-violet-500/12 text-violet-600',
  }
  return (
    <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 overflow-hidden">
      <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones[tone] || tones.amber}`}>
          <Icon size={14} />
        </div>
        <div>
          <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{title}</h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-600">{items.length} item{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="px-3.5 py-5 text-xs text-slate-400 dark:text-slate-600">{empty}</div>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {items.slice(0, 5).map(item => (
            <button key={item.id} onClick={item.onClick} className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 truncate">{item.detail}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Notifications({ currentUser, onNavigate }) {
  const { appointments, inventory, labResults, messages, notifications } = useStore()
  const [readMap, setReadMap] = useState(() => getReadMap())
  const [filter, setFilter] = useState('all')

  useEffect(() => onMessageRead(() => setReadMap(getReadMap())), [])

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const upcoming = appointments.filter(a =>
    (a.date === today || a.date === tomorrow) && ['Scheduled', 'Checked In', 'In Progress'].includes(a.status)
  )
  const checkedIn = appointments.filter(a => a.status === 'Checked In' && a.date === today)
  const abnormalLabs = labResults.filter(l => l.status === 'Abnormal')
  const lowStock = inventory.filter(i => getStockStatus(i.quantity, i.reorderLevel) !== 'In Stock')
  const recentMessages = messages.slice(-12).reverse()
  const unreadMessages = messages.filter(m => isMessageUnread(m, currentUser?.uid, readMap))

  function openMessage(message) {
    const chatPartner = message.recipientId
      ? (message.senderId === currentUser?.uid ? message.recipientId : message.senderId)
      : null
    setPendingChatTarget(chatPartner)
    setReadMap(markConversationRead(chatPartner ?? 'general'))
    onNavigate('messages')
  }

  function markMessagesRead() {
    unreadMessages.forEach(message => markConversationRead(conversationKey(message, currentUser?.uid)))
    setReadMap(getReadMap())
  }

  async function openBackendNotification(notification) {
    if (!notification.read) await store.markNotificationRead(notification.id)
    if (notification.target === 'messages') {
      const message = messages.find(m => m.id === notification.targetEntityId)
      const key = notification.conversationKey || (message ? conversationKey(message, currentUser?.uid) : '')
      if (key) {
        setPendingChatTarget(key === 'general' ? null : key)
        setReadMap(markConversationRead(key))
      }
      onNavigate('messages')
      return
    }
    if (notification.target) onNavigate(notification.target)
  }

  async function markAllRead() {
    await store.markAllNotificationsRead()
    unreadMessages.forEach(message => markConversationRead(conversationKey(message, currentUser?.uid)))
    setReadMap(getReadMap())
  }

  const feedItems = useMemo(() => {
    const backendItems = notifications.map(n => {
      const type = n.type || n.target || 'notifications'
      const typeConfig = {
        appointments: { icon: Calendar, tone: 'teal', group: 'operations', groupLabel: 'Appointment' },
        'lab-results': { icon: FlaskConical, tone: 'red', group: 'clinical', groupLabel: 'Lab result' },
        inventory: { icon: AlertTriangle, tone: 'amber', group: 'operations', groupLabel: 'Inventory' },
        messages: { icon: MessageSquare, tone: 'blue', group: 'messages', groupLabel: 'Message' },
      }[type] || { icon: Bell, tone: 'teal', group: 'operations', groupLabel: 'Notification' }
      return {
        id: `backend-${n.id}`,
        title: n.title || 'Notification',
        detail: n.message || '',
        meta: n.createdAt || '',
        unread: !n.read,
        priority: n.priority || 'Normal',
        onClick: () => openBackendNotification(n),
        ...typeConfig,
      }
    })
    const appointmentItems = upcoming.map(a => ({
      id: `appt-${a.id}`,
      group: 'operations',
      groupLabel: 'Appointment',
      title: a.patientName || 'Patient appointment',
      detail: `${withDrPrefix(a.doctorName)} - ${a.date === today ? 'Today' : 'Tomorrow'}${a.timeStart ? ` at ${a.timeStart}` : ''}`,
      meta: a.status,
      icon: Calendar,
      tone: 'teal',
      priority: a.status === 'In Progress' ? 'High' : 'Normal',
      onClick: () => onNavigate('calendar'),
    }))
    const queueItems = checkedIn.map(a => ({
      id: `queue-${a.id}`,
      group: 'operations',
      groupLabel: 'Queue',
      title: a.patientName || 'Checked-in patient',
      detail: `Waiting for ${withDrPrefix(a.doctorName)}`,
      meta: a.timeStart ? `Appointment ${a.timeStart}` : 'Checked in today',
      icon: UserCheck,
      tone: 'violet',
      priority: 'High',
      onClick: () => onNavigate('queue'),
    }))
    const labItems = abnormalLabs.map(l => ({
      id: `lab-${l.id}`,
      group: 'clinical',
      groupLabel: 'Lab result',
      title: l.patientName || 'Lab result',
      detail: `${l.testName || 'Lab test'} - Abnormal`,
      meta: l.date || l.createdAt || 'Needs review',
      icon: FlaskConical,
      tone: 'red',
      priority: 'High',
      onClick: () => onNavigate('lab-results'),
    }))
    const stockItems = lowStock.map(item => ({
      id: `stock-${item.id}`,
      group: 'operations',
      groupLabel: 'Inventory',
      title: item.name || 'Inventory item',
      detail: parseInt(item.quantity) === 0 ? 'Out of stock' : `Only ${item.quantity} ${item.unit || ''} left`,
      meta: `Reorder at ${item.reorderLevel || 0}`,
      icon: AlertTriangle,
      tone: 'amber',
      priority: parseInt(item.quantity) === 0 ? 'High' : 'Normal',
      onClick: () => onNavigate('inventory'),
    }))
    const messageItems = recentMessages.map(m => {
      const unread = isMessageUnread(m, currentUser?.uid, readMap)
      return {
        id: `msg-${m.id}`,
        group: 'messages',
        groupLabel: m.recipientId ? 'Private message' : 'General message',
        title: m.senderName || 'Message',
        detail: m.text || 'New message',
        meta: m.createdAt || '',
        icon: MessageSquare,
        tone: 'blue',
        unread,
        priority: unread ? 'High' : 'Normal',
        onClick: () => openMessage(m),
      }
    })
    return [...backendItems, ...labItems, ...queueItems, ...appointmentItems, ...stockItems, ...messageItems]
  }, [notifications, upcoming, checkedIn, abnormalLabs, lowStock, recentMessages, today, currentUser?.uid, readMap])

  const filteredFeed = feedItems.filter(item => {
    if (filter === 'all') return true
    if (filter === 'unread') return item.unread || item.priority === 'High'
    return item.group === filter
  })
  const highPriority = feedItems.filter(item => item.priority === 'High')
  const actionCount = upcoming.length + checkedIn.length + abnormalLabs.length + lowStock.length
  const backendUnread = notifications.filter(n => !n.read).length

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Notifications</h1>
          <p className="text-sm text-slate-400 dark:text-slate-600">A staff inbox for clinical alerts, operations updates, stock warnings, and messages.</p>
        </div>
        <div className="flex items-center gap-2">
          {(backendUnread > 0 || unreadMessages.length > 0) && (
            <button onClick={markAllRead} className="btn-ghost text-xs justify-center">
              <CheckCircle size={14} /> Mark all read
            </button>
          )}
          <button onClick={() => onNavigate('dashboard')} className="btn-ghost text-xs justify-center">
            Dashboard <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5">
        <SummaryPill icon={Bell} label="To Review" value={actionCount} tone={actionCount ? 'amber' : 'teal'} />
        <SummaryPill icon={MessageSquare} label="Unread" value={backendUnread || unreadMessages.length} tone={(backendUnread || unreadMessages.length) ? 'blue' : 'teal'} />
        <SummaryPill icon={FlaskConical} label="Abnormal Labs" value={abnormalLabs.length} tone={abnormalLabs.length ? 'red' : 'teal'} />
        <SummaryPill icon={Package} label="Stock Alerts" value={lowStock.length} tone={lowStock.length ? 'amber' : 'teal'} />
      </div>

      <div className="card p-2 flex items-center gap-1.5 overflow-x-auto">
        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 items-center justify-center flex-shrink-0">
          <ListFilter size={15} />
        </div>
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              filter === id
                ? 'bg-teal-600 text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {actionCount === 0 && backendUnread === 0 && unreadMessages.length === 0 && (
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/12 px-4 py-3 flex items-start gap-3">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">All caught up</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">No urgent hospital updates need attention right now.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 sm:gap-5 items-start">
        <section className="card overflow-hidden shadow-sm">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/12 text-teal-600 flex items-center justify-center">
                <Inbox size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Notification Inbox</h2>
                <p className="text-xs text-slate-400 dark:text-slate-600">{filteredFeed.length} visible update{filteredFeed.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-600">
              <Clock size={13} /> Latest first
            </div>
          </div>

          {filteredFeed.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 flex items-center justify-center">
                <Inbox size={24} />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">No matching notifications</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">Try another filter or come back when new activity arrives.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredFeed.map(item => <FeedItem key={item.id} item={item} />)}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-3">
          <PriorityRail title="High Priority" items={highPriority} icon={AlertTriangle} tone="red" empty="No urgent items right now." />
          <PriorityRail title="Patient Flow" items={feedItems.filter(item => ['Appointment', 'Queue'].includes(item.groupLabel))} icon={UserCheck} tone="violet" empty="No active patient-flow updates." />
        </div>
      </div>
    </div>
  )
}

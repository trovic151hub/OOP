import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, Hash, ChevronLeft } from 'lucide-react'
import { useStore, store, consumePendingChatTarget } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { getLastSeen } from '../utils/helpers'
import { getReadMap, markConversationRead, isMessageUnread, conversationKey } from '../utils/messageReadState'

function formatTime(iso, timeZone) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone })
}

function groupByDate(messages, timeZone) {
  const groups = []
  let lastDate = null
  for (const msg of messages) {
    const d = new Date(msg.createdAt)
    const dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone })
    if (dateLabel !== lastDate) {
      groups.push({ type: 'date', label: dateLabel })
      lastDate = dateLabel
    }
    groups.push({ type: 'msg', ...msg })
  }
  return groups
}

const ROLE_BADGE = {
  Admin:        'bg-teal-100 dark:bg-teal-500/18 text-teal-700',
  Doctor:       'bg-purple-100 dark:bg-purple-500/18 text-purple-700',
  Receptionist: 'bg-blue-100 dark:bg-blue-500/18 text-blue-700',
}

export default function Messages({ currentUser }) {
  const { messages, users, settings } = useStore()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [activeChat, setActiveChat] = useState(null) // null = General channel, else a user's uid
  // Mobile drills down list -> conversation; jumps straight to the
  // conversation if we arrived via a notification's pending chat target.
  const [mobileView, setMobileView] = useState('list')
  const [readMap, setReadMap] = useState(() => getReadMap())
  const consumedPendingRef = useRef(false)
  const bottomRef = useRef(null)
  // activeChat defaults to null (General) purely as the fallback content the
  // conversation pane shows before anything is picked — that default must
  // NOT count as "the user opened General", or it'd be silently marked read
  // on every visit to this page without an actual click, same as every other
  // conversation requires. Only flips true from an explicit selectChat call.
  const hasSelectedRef = useRef(false)

  function selectChat(key) {
    hasSelectedRef.current = true
    setActiveChat(key)
    setMobileView('chat')
    setReadMap(markConversationRead(key === null ? 'general' : key))
  }

  // consumePendingChatTarget() clears its value as a side effect on read, so
  // it can't safely live in a useState lazy initializer — React (Strict Mode
  // in particular) can invoke that initializer twice, and the second call
  // would just see it already cleared. A ref-guarded effect runs the
  // consuming read exactly once for real, regardless of double-invocation.
  useEffect(() => {
    if (consumedPendingRef.current) return
    consumedPendingRef.current = true
    const t = consumePendingChatTarget()
    // undefined = no notification click happened; null is itself a valid
    // target (General), so it must still trigger the drill-into-chat jump.
    if (t !== undefined) selectChat(t)
  }, [])

  // Broadcast messages have no recipientId; a DM only belongs to this
  // conversation if it's between the current user and the active partner.
  const visibleMessages = messages.filter(m =>
    activeChat === null
      ? !m.recipientId
      : (m.senderId === currentUser?.uid && m.recipientId === activeChat) ||
        (m.senderId === activeChat && m.recipientId === currentUser?.uid)
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleMessages.length, activeChat])

  // Stay caught up while already viewing a conversation — a message that
  // arrives for the chat you have open shouldn't sit there flagged unread
  // just because you hadn't re-selected it. Gated on hasSelectedRef so this
  // doesn't fire from the default activeChat=null before any real selection.
  useEffect(() => {
    if (!hasSelectedRef.current) return
    setReadMap(markConversationRead(activeChat === null ? 'general' : activeChat))
  }, [activeChat, visibleMessages.length])

  function hasUnread(key) {
    return messages.some(m => conversationKey(m, currentUser?.uid) === key && isMessageUnread(m, currentUser?.uid, readMap))
  }
  const generalUnread = hasUnread('general')

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await store.sendMessage(text, currentUser.name, currentUser.role, activeChat)
      setText('')
    } finally {
      setSending(false)
    }
  }

  const grouped = groupByDate(visibleMessages, settings?.timezone)
  const staffList = users
    .filter(u => u.uid !== currentUser?.uid)
    .map(u => ({ ...u, ...getLastSeen(u.lastSeen), unread: hasUnread(u.uid) }))
    .sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1
      return new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0)
    })

  const activeChatUser = activeChat ? staffList.find(u => u.uid === activeChat) : null

  return (
    <div className="flex gap-5 h-[calc(100vh-10rem)]">
      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col card overflow-hidden`}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <button
            onClick={() => setMobileView('list')}
            className="lg:hidden -ml-1 p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          {activeChatUser ? (
            <>
              <div className="relative flex-shrink-0">
                <Avatar name={activeChatUser.name} src={activeChatUser.avatar} size="md" />
                {activeChatUser.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-700" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeChatUser.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600">{activeChatUser.online ? 'Online now' : activeChatUser.label} · Private message</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">General · Staff Channel</p>
                <p className="text-xs text-slate-400 dark:text-slate-600">{users.length} member{users.length !== 1 ? 's' : ''} · All staff can see this channel</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
          {visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 text-center">
              <MessageSquare size={40} className="text-slate-200 mb-3" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">
                {activeChatUser ? `Say hello to ${activeChatUser.name.split(' ')[0]}!` : 'Be the first to say something!'}
              </p>
            </div>
          ) : (
            grouped.map((item, i) => {
              if (item.type === 'date') {
                return (
                  <div key={i} className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-900" />
                    <span className="text-xs text-slate-400 dark:text-slate-600 font-medium px-2">{item.label}</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-900" />
                  </div>
                )
              }
              const isMe = item.senderId === currentUser?.uid
              return (
                <div key={item.id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} mb-2`}>
                  {!isMe && <Avatar name={item.senderName} src={users.find(u => u.uid === item.senderId)?.avatar} size="sm" className="flex-shrink-0 mt-1" />}
                  <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    {!isMe && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.senderName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_BADGE[item.senderRole] || 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                          {item.senderRole}
                        </span>
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    }`}>
                      {item.text}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 px-1">{formatTime(item.createdAt, settings?.timezone)}</span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Avatar name={currentUser?.name} src={currentUser?.avatar} size="sm" />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={activeChatUser ? `Message ${activeChatUser.name.split(' ')[0]}…` : 'Type a message…'}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex w-full lg:w-56 flex-shrink-0 flex-col gap-4`}>
        <div className="card p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Channels</p>
          <button
            onClick={() => selectChat(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${activeChat === null ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <Hash size={13} className="flex-shrink-0" />
            <span className={`text-xs truncate flex-1 ${generalUnread ? 'font-bold' : 'font-semibold'}`}>General</span>
            {generalUnread && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />}
          </button>
        </div>

        <div className="card p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Staff Members</p>
          <div className="flex flex-col gap-1">
            {staffList.map(u => (
              <button
                key={u.id}
                onClick={() => selectChat(u.uid)}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors ${activeChat === u.uid ? 'bg-teal-50 dark:bg-teal-500/12' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar name={u.name} src={u.avatar} size="sm" />
                  {u.online && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-slate-700" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs truncate ${u.unread ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>{u.name}</p>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${ROLE_BADGE[u.role] || 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                      {u.role}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 truncate">{u.label}</span>
                  </div>
                </div>
                {u.unread && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />}
              </button>
            ))}
            {staffList.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-600">No other staff yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

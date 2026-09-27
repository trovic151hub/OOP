import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCheck, ChevronLeft, Circle, Hash, MessageSquare, Search, Send, UsersRound } from 'lucide-react'
import { useStore, store, consumePendingChatTarget, refetchCollection } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import { getLastSeen } from '../utils/helpers'
import { getReadMap, markConversationRead, isMessageUnread, conversationKey } from '../utils/messageReadState'
import { emitTyping, onTyping } from '../realtime'

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

function minutesBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60000
}

const ROLE_BADGE = {
  Admin:        'bg-teal-100 dark:bg-teal-500/18 text-teal-700',
  Doctor:       'bg-purple-100 dark:bg-purple-500/18 text-purple-700',
  Nurse:        'bg-rose-100 dark:bg-rose-500/18 text-rose-700',
  Receptionist: 'bg-blue-100 dark:bg-blue-500/18 text-blue-700',
}

const LAST_CHAT_KEY_PREFIX = 'mc_last_chat_'

export default function Messages({ currentUser }) {
  const { messages, users, settings, notifications } = useStore()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [staffSearch, setStaffSearch] = useState('')
  const [typingMap, setTypingMap] = useState({})
  const [activeChat, setActiveChat] = useState(undefined)
  const [mobileView, setMobileView] = useState('list')
  const [readMap, setReadMap] = useState(() => getReadMap())
  const consumedPendingRef = useRef(false)
  const bottomRef = useRef(null)
  const hasSelectedRef = useRef(false)

  function lastChatStorageKey() {
    return `${LAST_CHAT_KEY_PREFIX}${currentUser?.uid || 'guest'}`
  }

  function encodeChatKey(key) {
    if (key === null) return 'general'
    if (key === undefined) return ''
    return `user:${key}`
  }

  function decodeChatKey(value) {
    if (value === 'general') return null
    if (value?.startsWith('user:')) return value.slice(5)
    return undefined
  }

  function rememberChat(key) {
    if (key === undefined) {
      localStorage.removeItem(lastChatStorageKey())
      return
    }
    localStorage.setItem(lastChatStorageKey(), encodeChatKey(key))
  }

  function notificationConversationKey(notification) {
    if (notification.conversationKey) return notification.conversationKey
    const message = messages.find(m => m.id === notification.targetEntityId)
    return message ? conversationKey(message, currentUser?.uid) : ''
  }

  function markMatchingMessageNotificationsRead(key) {
    notifications
      .filter(n => !n.read && n.target === 'messages' && notificationConversationKey(n) === key)
      .forEach(n => store.markNotificationRead(n.id).catch(() => {}))
  }

  function markConversationReadEverywhere(key) {
    setReadMap(markConversationRead(key))
    markMatchingMessageNotificationsRead(key)
    store.markMessageConversationRead(key).catch(() => {})
  }

  function selectChat(key) {
    hasSelectedRef.current = true
    setActiveChat(key)
    setMobileView('chat')
    rememberChat(key)
    const readKey = key === null ? 'general' : key
    markConversationReadEverywhere(readKey)
  }

  function exitChat() {
    setText('')
    setActiveChat(undefined)
    setMobileView('list')
    rememberChat(undefined)
  }

  useEffect(() => {
    if (consumedPendingRef.current) return
    consumedPendingRef.current = true
    const target = consumePendingChatTarget()
    if (target !== undefined) {
      selectChat(target)
      return
    }

    const savedChat = decodeChatKey(localStorage.getItem(lastChatStorageKey()))
    if (savedChat !== undefined) selectChat(savedChat)
  }, [])

  const visibleMessages = messages.filter(m =>
    activeChat === undefined
      ? false
      : activeChat === null
      ? !m.recipientId
      : (m.senderId === currentUser?.uid && m.recipientId === activeChat) ||
        (m.senderId === activeChat && m.recipientId === currentUser?.uid)
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleMessages.length, activeChat])

  useEffect(() => {
    if (!hasSelectedRef.current) return
    if (activeChat === undefined) return
    const readKey = activeChat === null ? 'general' : activeChat
    markConversationReadEverywhere(readKey)
  }, [activeChat, visibleMessages.length])

  useEffect(() => {
    if (activeChat === undefined) return
    const readKey = activeChat === null ? 'general' : activeChat
    markMatchingMessageNotificationsRead(readKey)
  }, [activeChat, notifications])

  function hasUnread(key) {
    return messages.some(m => conversationKey(m, currentUser?.uid) === key && isMessageUnread(m, currentUser?.uid, readMap))
  }

  function unreadCount(key) {
    return messages.filter(m => conversationKey(m, currentUser?.uid) === key && isMessageUnread(m, currentUser?.uid, readMap)).length
  }

  function lastMessageFor(key) {
    return [...messages].reverse().find(m => conversationKey(m, currentUser?.uid) === key)
  }

  function deliveryLabel(message) {
    if (!message.recipientId) return 'Posted'
    const recipientRead = Array.isArray(message.readBy) && message.readBy.some(receipt => receipt.userId === message.recipientId)
    return recipientRead ? 'Read' : 'Sent'
  }

  function currentConversationKey() {
    if (activeChat === undefined) return ''
    return activeChat === null ? 'general' : activeChat
  }

  function handleTextChange(e) {
    const nextText = e.target.value
    setText(nextText)
    if (activeChat === undefined) return
    const payload = {
      conversationKey: currentConversationKey(),
      userId: currentUser?.uid,
      userName: currentUser?.name,
      recipientId: activeChat,
      isTyping: !!nextText.trim(),
    }
    emitTyping(payload)
    store.sendTypingStatus(payload).catch(() => {})
  }

  function applyTypingPayload(payload) {
    if (!payload?.conversationKey || payload.userId === currentUser?.uid) return
    if (payload.recipientId && payload.recipientId !== currentUser?.uid) return
    const key = payload.recipientId ? payload.userId : 'general'
    setTypingMap(prev => {
      const next = { ...prev }
      if (payload.isTyping) {
        next[key] = {
          userId: payload.userId,
          userName: payload.userName || 'Someone',
          until: Date.now() + 2800,
        }
      } else {
        delete next[key]
      }
      return next
    })
  }

  useEffect(() => onTyping(applyTypingPayload), [currentUser?.uid])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now()
      setTypingMap(prev => {
        const next = Object.fromEntries(Object.entries(prev).filter(([, item]) => item.until > now))
        return Object.keys(next).length === Object.keys(prev).length ? prev : next
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let fetching = false
    const interval = window.setInterval(async () => {
      if (fetching) return
      fetching = true
      try {
        await Promise.all([
          refetchCollection('messages'),
          refetchCollection('notifications'),
        ])
      } finally {
        fetching = false
      }
    }, 2500)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeChat === undefined) return
    let fetching = false
    const interval = window.setInterval(async () => {
      if (fetching) return
      fetching = true
      try {
        const active = await store.fetchTypingStatus()
        active.forEach(applyTypingPayload)
      } catch (_) {
        // Socket.IO is the primary path; REST typing polling is best-effort.
      } finally {
        fetching = false
      }
    }, 1200)
    return () => window.clearInterval(interval)
  }, [activeChat, currentUser?.uid])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    if (activeChat === undefined) return
    setSending(true)
    try {
      const stoppedTypingPayload = {
        conversationKey: currentConversationKey(),
        userId: currentUser?.uid,
        userName: currentUser?.name,
        recipientId: activeChat,
        isTyping: false,
      }
      emitTyping(stoppedTypingPayload)
      store.sendTypingStatus(stoppedTypingPayload).catch(() => {})
      await store.sendMessage(text, currentUser.name, currentUser.role, activeChat)
      setText('')
    } finally {
      setSending(false)
    }
  }

  const grouped = groupByDate(visibleMessages, settings?.timezone)
  const generalUnreadCount = unreadCount('general')
  const generalLastMessage = lastMessageFor('general')

  const allStaffList = users
    .filter(u => u.uid !== currentUser?.uid)
    .map(u => {
      const lastMessage = lastMessageFor(u.uid)
      return {
        ...u,
        ...getLastSeen(u.lastSeen),
        unread: hasUnread(u.uid),
        unreadCount: unreadCount(u.uid),
        lastMessage,
      }
    })
    .sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1
      if (a.online !== b.online) return a.online ? -1 : 1
      return new Date(b.lastMessage?.createdAt || b.lastSeen || 0) - new Date(a.lastMessage?.createdAt || a.lastSeen || 0)
    })

  const staffList = useMemo(() => {
    const term = staffSearch.trim().toLowerCase()
    if (!term) return allStaffList
    return allStaffList.filter(u =>
      [u.name, u.role, u.email, u.label].some(value => String(value || '').toLowerCase().includes(term))
    )
  }, [allStaffList, staffSearch])

  const hasActiveChat = activeChat !== undefined
  const activeChatUser = activeChat ? allStaffList.find(u => u.uid === activeChat) : null
  const activeUnreadCount = !hasActiveChat ? 0 : activeChat === null ? generalUnreadCount : unreadCount(activeChat)
  const totalUnreadCount = generalUnreadCount + allStaffList.reduce((sum, u) => sum + u.unreadCount, 0)
  const activeTyping = hasActiveChat ? typingMap[currentConversationKey()] : null

  return (
    <div className="flex gap-4 lg:gap-5 h-[calc(100svh-8.5rem)] md:h-[calc(100vh-10rem)] min-h-[28rem] sm:min-h-[32rem]">
      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 flex-col card overflow-hidden`}>
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white/95 dark:bg-slate-800/95">
          <button
            onClick={exitChat}
            className={`${hasActiveChat ? 'flex' : 'hidden'} -ml-1 p-2 rounded-lg text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 flex-shrink-0`}
            aria-label="Back to conversations"
          >
            <ChevronLeft size={18} />
          </button>

          {!hasActiveChat ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Messages</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 truncate">Select a conversation to start chatting</p>
              </div>
            </>
          ) : activeChatUser ? (
            <>
              <div className="relative flex-shrink-0">
                <Avatar name={activeChatUser.name} src={activeChatUser.avatar} size="md" />
                {activeChatUser.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-700" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{activeChatUser.name}</p>
                  <span className={`hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_BADGE[activeChatUser.role] || 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                    {activeChatUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600 truncate">
                  {activeChatUser.online ? 'Online now' : activeChatUser.label} / Private message
                </p>
              </div>
            </>
          ) : activeChat === null ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">General / Staff Channel</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 truncate">
                  {users.length} member{users.length !== 1 ? 's' : ''} / All staff can see this channel
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Private chat</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 truncate">Loading conversation details</p>
              </div>
            </>
          )}

          {hasActiveChat && <div className="ml-auto hidden sm:flex items-center gap-2 flex-shrink-0">
            {activeUnreadCount > 0 ? (
              <span className="px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-500/12 text-[11px] font-bold text-teal-700">
                {activeUnreadCount} unread
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-900 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                <CheckCheck size={12} /> Read
              </span>
            )}
          </div>}
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-3 sm:px-5 py-4 flex flex-col gap-1 bg-slate-50/40 dark:bg-slate-900/20">
          {!hasActiveChat ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm mb-3">
                <UsersRound size={26} className="text-teal-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Choose a conversation</p>
              <p className="text-xs mt-1 max-w-xs">Pick General or a staff member from the list to open the chat.</p>
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm mb-3">
                <MessageSquare size={24} className="text-teal-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No messages yet</p>
              <p className="text-xs mt-1 max-w-xs">
                {activeChatUser ? `Say hello to ${activeChatUser.name.split(' ')[0]}!` : 'Be the first to say something!'}
              </p>
            </div>
          ) : (
            grouped.map((item, i) => {
              if (item.type === 'date') {
                return (
                  <div key={i} className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    <span className="text-xs text-slate-400 dark:text-slate-600 font-medium px-2">{item.label}</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  </div>
                )
              }

              const prevMessage = [...grouped.slice(0, i)].reverse().find(entry => entry.type === 'msg')
              const nextMessage = grouped.slice(i + 1).find(entry => entry.type === 'msg')
              const isMe = item.senderId === currentUser?.uid
              const samePrev = prevMessage?.senderId === item.senderId && minutesBetween(prevMessage.createdAt, item.createdAt) < 6
              const sameNext = nextMessage?.senderId === item.senderId && minutesBetween(nextMessage.createdAt, item.createdAt) < 6
              const showSender = !isMe && !samePrev
              const showAvatar = !isMe && !sameNext
              const isTail = !sameNext

              return (
                <div key={item.id || i} className={`flex gap-2.5 sm:gap-3 ${isMe ? 'flex-row-reverse' : ''} ${sameNext ? 'mb-1' : 'mb-3'}`}>
                  {!isMe && (
                    showAvatar
                      ? <Avatar name={item.senderName} src={users.find(u => u.uid === item.senderId)?.avatar} size="sm" className="mt-auto mb-5" />
                      : <div className="w-7 flex-shrink-0" />
                  )}
                  <div className={`max-w-[84%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {showSender && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.senderName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_BADGE[item.senderRole] || 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                          {item.senderRole}
                        </span>
                      </div>
                    )}
                    <div className={`relative px-3.5 sm:px-4 py-2.5 rounded-[20px] text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? `${samePrev ? 'rounded-tr-lg' : 'rounded-tr-[20px]'} ${isTail ? 'rounded-br-sm' : 'rounded-br-lg'} bg-gradient-to-br from-teal-600 to-teal-700 text-white`
                        : `${samePrev ? 'rounded-tl-lg' : 'rounded-tl-[20px]'} ${isTail ? 'rounded-bl-sm' : 'rounded-bl-lg'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700`
                    }`}>
                      {isTail && (
                        <span className={`absolute bottom-1.5 w-2.5 h-2.5 rotate-45 ${
                          isMe
                            ? '-right-1 bg-teal-700'
                            : '-left-1 bg-white dark:bg-slate-800 border-l border-b border-slate-100 dark:border-slate-700'
                        }`} />
                      )}
                      <span className="relative z-10 whitespace-pre-wrap break-words">{item.text}</span>
                    </div>
                    {isTail && (
                      <span className={`flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-600 px-1 ${isMe ? 'justify-end' : ''}`}>
                        {formatTime(item.createdAt, settings?.timezone)}
                        {isMe && (
                          <>
                            <span>/</span>
                            <CheckCheck size={11} className={deliveryLabel(item) === 'Read' ? 'text-teal-500' : 'text-slate-400'} />
                            <span>{deliveryLabel(item)}</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {hasActiveChat && <div className="px-3 sm:px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
          {activeTyping && (
            <div className="flex items-center gap-2 px-1 pb-2 text-xs text-slate-400 dark:text-slate-600">
              <span className="font-semibold text-slate-500 dark:text-slate-400">{activeTyping.userName}</span>
              <span>is typing</span>
              <span className="inline-flex items-end gap-0.5 h-3">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.1s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
              </span>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Avatar name={currentUser?.name} src={currentUser?.avatar} size="sm" className="hidden sm:flex" />
            <input
              value={text}
              onChange={handleTextChange}
              placeholder={activeChatUser ? `Message ${activeChatUser.name.split(' ')[0]}...` : activeChat === null ? 'Type a message...' : 'Type a private message...'}
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              {sending
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={16} />
              }
            </button>
          </form>
        </div>}
      </div>

      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 flex-shrink-0 flex-col gap-4`}>
        <div className="card p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Conversations</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
                {totalUnreadCount} unread update{totalUnreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/12 text-teal-600 flex items-center justify-center">
              <UsersRound size={16} />
            </div>
          </div>

          <button
            onClick={() => selectChat(null)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${activeChat === null ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              <Hash size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm truncate flex-1 ${generalUnreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>General</span>
                {generalUnreadCount > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{generalUnreadCount}</span>}
              </div>
              <p className="text-[11px] truncate text-slate-400 dark:text-slate-600">
                {generalLastMessage ? generalLastMessage.text : 'Hospital-wide staff room'}
              </p>
            </div>
          </button>
        </div>

        <div className="card p-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Staff Members</p>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600">{allStaffList.length}</span>
          </div>

          <label className="relative block mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={staffSearch}
              onChange={e => setStaffSearch(e.target.value)}
              placeholder="Search staff"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </label>

          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 pr-1 -mr-1">
            {staffList.map(u => (
              <button
                key={u.id}
                onClick={() => selectChat(u.uid)}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors ${activeChat === u.uid ? 'bg-teal-50 dark:bg-teal-500/12' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar name={u.name} src={u.avatar} size="sm" />
                  {u.online && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-slate-700" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs truncate flex-1 ${u.unread ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>{u.name}</p>
                    {u.unreadCount > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{u.unreadCount}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${ROLE_BADGE[u.role] || 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                      {u.role}
                    </span>
                    <Circle size={5} className={u.online ? 'fill-emerald-400 text-emerald-400' : 'fill-slate-300 text-slate-300'} />
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 truncate">{u.lastMessage ? u.lastMessage.text : u.label}</span>
                  </div>
                </div>
              </button>
            ))}
            {staffList.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-600">
                <Search size={20} className="mx-auto mb-2 text-slate-300" />
                No matching staff found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

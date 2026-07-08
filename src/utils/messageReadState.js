// Per-conversation read tracking for chat messages, persisted so unread
// status survives a reload. A "conversation" is either the shared broadcast
// channel ('general') or a specific staff member's uid (for a DM) — each
// gets its own last-read timestamp instead of one blunt global cutoff, so
// reading one person's messages doesn't mark everyone else's as read too.
const STORAGE_KEY = 'mc_message_read_map'
// Messages.jsx and the Topbar notification bell are siblings, not
// parent/child, and only share this state via localStorage — so a plain
// write in one doesn't re-render the other. This event lets the bell (or
// anything else) react to a read-state change immediately instead of only
// re-syncing at the next page-navigation/bell-open boundary.
const READ_EVENT = 'mc:message-read'

function loadMap() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

export function conversationKey(message, currentUserUid) {
  if (!message.recipientId) return 'general'
  return message.senderId === currentUserUid ? message.recipientId : message.senderId
}

export function getReadMap() {
  return loadMap()
}

export function markConversationRead(key) {
  const map = loadMap()
  map[key] = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  window.dispatchEvent(new Event(READ_EVENT))
  return map
}

// Subscribe to read-state changes made anywhere (e.g. Messages.jsx marking a
// chat read) — returns an unsubscribe function for use in a useEffect cleanup.
export function onMessageRead(callback) {
  window.addEventListener(READ_EVENT, callback)
  return () => window.removeEventListener(READ_EVENT, callback)
}

export function isMessageUnread(message, currentUserUid, readMap) {
  if (message.senderId === currentUserUid) return false
  const key = conversationKey(message, currentUserUid)
  const readAt = readMap[key]
  return !readAt || message.createdAt > readAt
}

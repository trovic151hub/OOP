import { io } from 'socket.io-client'
import { refetchCollection, refetchSettings } from './store/useStore'

// Connects directly to the backend origin (not through the Vercel /api
// proxy) for lightweight realtime signals: collection refresh nudges and
// ephemeral typing presence. VITE_API_URL already points at the Render
// backend; strip the trailing /api since Socket.IO connects to the origin,
// not a REST path.
const DEV_API_ORIGIN = `${window.location.protocol}//${window.location.hostname}:5001/api`
const SOCKET_ORIGIN = (import.meta.env.VITE_API_URL || DEV_API_ORIGIN).replace(/\/api\/?$/, '')

let socket = null

export function connectRealtime() {
  if (socket) return
  socket = io(SOCKET_ORIGIN, { withCredentials: false })
  socket.on('changed', ({ collection }) => {
    if (collection === 'settings') refetchSettings()
    else refetchCollection(collection)
  })
}

export function emitTyping(payload) {
  if (!socket) connectRealtime()
  socket?.emit('typing', payload)
}

export function onTyping(callback) {
  if (!socket) connectRealtime()
  socket?.on('typing', callback)
  return () => socket?.off('typing', callback)
}

export function disconnectRealtime() {
  socket?.disconnect()
  socket = null
}

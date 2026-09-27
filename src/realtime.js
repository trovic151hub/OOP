import { io } from 'socket.io-client'
import { refetchCollection, refetchSettings } from './store/useStore'

// Connects directly to the backend origin (not through the Vercel /api
// proxy) for lightweight realtime signals: collection refresh nudges and
// ephemeral typing presence. In production, Vercel rewrites REST calls but
// does not give Socket.IO a real backend port on the Vercel hostname, so the
// socket must target Render directly.
const DEV_API_ORIGIN = `${window.location.protocol}//${window.location.hostname}:5001/api`
const PROD_SOCKET_ORIGIN = 'https://medcore-api-yf60.onrender.com'
const SOCKET_ORIGIN = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_SOCKET_ORIGIN : DEV_API_ORIGIN)
).replace(/\/api\/?$/, '')

let socket = null

export function connectRealtime() {
  if (socket) return
  socket = io(SOCKET_ORIGIN, {
    withCredentials: false,
    transports: ['websocket', 'polling'],
  })
  socket.on('changed', ({ collection }) => {
    if (collection === 'settings') refetchSettings()
    else refetchCollection(collection)
  })
  socket.on('connect_error', err => {
    console.warn('Realtime connection failed:', err.message)
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

import { io } from 'socket.io-client'
import { refetchCollection, refetchSettings } from './store/useStore'

// Connects directly to the backend origin (not through the Vercel /api
// proxy) since these events never carry document data — just "collection X
// changed" signals — so the connection needs no auth/cookie at all, which
// conveniently sidesteps Safari's cross-site cookie blocking entirely for
// this feature. VITE_API_URL already points at the Render backend; strip
// the trailing /api since Socket.IO connects to the origin, not a REST path.
const SOCKET_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')

let socket = null

export function connectRealtime() {
  if (socket) return
  socket = io(SOCKET_ORIGIN, { withCredentials: false })
  socket.on('changed', ({ collection }) => {
    if (collection === 'settings') refetchSettings()
    else refetchCollection(collection)
  })
}

export function disconnectRealtime() {
  socket?.disconnect()
  socket = null
}

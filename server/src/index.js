import { createServer } from 'http'
import { Server } from 'socket.io'
import { createApp } from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

async function main() {
  await connectDB()
  const app = createApp()

  // Socket.IO needs the raw http.Server (app.listen() normally creates one
  // internally and hands it back, but we need a reference to it up front to
  // attach the socket server to the same port).
  const httpServer = createServer(app)

  // Broadcast-only: these events never carry document data, just "collection
  // X changed" signals (see utils/realtime.js), so the socket needs no auth
  // and can safely accept connections from the configured client origin(s).
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  })
  app.set('io', io)

  httpServer.listen(env.port, () => {
    console.log(`MedCore API listening on http://localhost:${env.port}`)
  })
}

main().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

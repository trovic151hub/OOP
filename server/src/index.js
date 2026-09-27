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

  // Realtime signals only: collection refresh nudges plus ephemeral typing
  // presence. Message/document contents still move through authenticated REST.
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: false },
  })
  io.on('connection', socket => {
    socket.on('typing', payload => {
      socket.broadcast.emit('typing', payload)
    })
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

import { Server as SocketIOServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import type { ServerToClientEvents, ClientToServerEvents } from '@pizzaria/shared'

type IO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>

let _io: IO | null = null

export function initSocket(httpServer: HttpServer): IO {
  _io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
      credentials: true,
    },
  })

  _io.on('connection', (socket) => {
    console.log(`[WS] conectado: ${socket.id}`)

    socket.on('join-admin', () => {
      socket.join('admin')
    })

    socket.on('join-order', (orderId) => {
      socket.join(`order:${orderId}`)
    })

    socket.on('leave-order', (orderId) => {
      socket.leave(`order:${orderId}`)
    })

    socket.on('disconnect', () => {
      console.log(`[WS] desconectado: ${socket.id}`)
    })
  })

  return _io
}

export function getIO(): IO {
  if (!_io) throw new Error('Socket.IO não inicializado')
  return _io
}

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@pizzaria/shared'
import { useAuth } from './AuthContext'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface SocketContextValue {
  socket: AppSocket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false })

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3001'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const socketRef = useRef<AppSocket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    const socket = io(WS_URL, { auth: { token }, reconnectionDelay: 1000 }) as AppSocket
    socket.on('connect', () => { setConnected(true); socket.emit('join-admin') })
    socket.on('disconnect', () => setConnected(false))
    socketRef.current = socket

    return () => { socket.disconnect(); socketRef.current = null; setConnected(false) }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() { return useContext(SocketContext) }

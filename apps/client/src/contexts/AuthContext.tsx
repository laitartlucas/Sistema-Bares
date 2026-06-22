import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@pizzaria/shared'
import { authApi } from '../api/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem('token'))
  const [isLoading, setLoading] = useState(true)

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authApi.me()
      setUser(freshUser)
    } catch {
      logout()
    }
  }, [logout])

  useEffect(() => {
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false))
  }, [token, logout])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

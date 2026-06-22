import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@pizzaria/shared'
import { authApi } from '../api/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null)
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem('admin_token'))
  const [isLoading, setLoading] = useState(true)

  const login = useCallback((t: string, u: User) => {
    localStorage.setItem('admin_token', t)
    setToken(t); setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setToken(null); setUser(null)
  }, [])

  useEffect(() => {
    if (!token) { setLoading(false); return }
    authApi.me()
      .then((u) => {
        if (u.papel !== 'ADMIN') { logout(); return }
        setUser(u)
      })
      .catch(logout)
      .finally(() => setLoading(false))
  }, [token, logout])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from './client'

interface AuthContextValue {
  authenticated: boolean
  loading: boolean
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me().then((res) => setAuthenticated(res.authenticated)).finally(() => setLoading(false))
  }, [])

  const login = async (password: string) => {
    await api.login(password)
    setAuthenticated(true)
  }

  const logout = async () => {
    await api.logout()
    setAuthenticated(false)
  }

  return <AuthContext.Provider value={{ authenticated, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getMe, login as loginRequest, logout as logoutRequest } from './api'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(sessionStorage.getItem('erp_access_token')))
  const clear = () => {
    sessionStorage.removeItem('erp_access_token')
    sessionStorage.removeItem('erp_refresh_token')
    localStorage.removeItem('erp_access_token')
    localStorage.removeItem('erp_refresh_token')
    queryClient.clear()
    setUser(null)
  }
  const refreshUser = async () => { const currentUser = await getMe(); setUser(currentUser); return currentUser }
  useEffect(() => {
    const load = async () => { try { await refreshUser() } catch { clear() } finally { setLoading(false) } }
    localStorage.removeItem('erp_access_token')
    localStorage.removeItem('erp_refresh_token')
    if (sessionStorage.getItem('erp_access_token')) void load()
    const unauthorized = () => { clear(); setLoading(false) }
    window.addEventListener('erp:unauthorized', unauthorized)
    return () => window.removeEventListener('erp:unauthorized', unauthorized)
  }, [])
  const login = async (values) => {
    const data = await loginRequest(values)
    sessionStorage.setItem('erp_access_token', data.access_token); sessionStorage.setItem('erp_refresh_token', data.refresh_token)
    await refreshUser()
  }
  const logout = async () => { const token = sessionStorage.getItem('erp_refresh_token'); try { if (token) await logoutRequest(token) } finally { clear() } }
  return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context }

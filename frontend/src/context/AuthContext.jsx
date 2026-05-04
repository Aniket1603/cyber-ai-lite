import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cybereye_token')
    const userData = localStorage.getItem('cybereye_user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password })
    const { token, username: uname, email, role } = res.data
    const userData = { username: uname, email, role }
    localStorage.setItem('cybereye_token', token)
    localStorage.setItem('cybereye_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return res.data
  }

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password })
    const { token, username: uname, email: em, role } = res.data
    const userData = { username: uname, email: em, role }
    localStorage.setItem('cybereye_token', token)
    localStorage.setItem('cybereye_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('cybereye_token')
    localStorage.removeItem('cybereye_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

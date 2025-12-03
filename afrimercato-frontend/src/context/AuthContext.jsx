import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('afrimercato_token')
    const userData = localStorage.getItem('afrimercato_user')

    if (token) {
      // Token exists, mark as authenticated
      setIsAuthenticated(true)

      // Load user data from localStorage if available
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    }

    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })

      if (response.success) {
        const { token, user } = response.data
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_user', JSON.stringify(user))
        setUser(user)
        setIsAuthenticated(true)
        return { success: true, user }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)

      if (response.success) {
        const { token, user } = response.data
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_user', JSON.stringify(user))
        setUser(user)
        setIsAuthenticated(true)
        return { success: true, user }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('afrimercato_token')
    localStorage.removeItem('afrimercato_user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

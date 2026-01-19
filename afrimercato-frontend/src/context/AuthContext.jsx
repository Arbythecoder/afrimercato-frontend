import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, getUserProfile } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Helper function to decode JWT token (client-side only for UI purposes)
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
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

    if (token) {
      // Decode token to get user role (for UI routing only - backend still validates)
      const decoded = decodeToken(token)

      if (decoded && decoded.id) {
        // Fetch fresh user data from backend
        try {
          // Guard the profile fetch with a timeout so the UI doesn't hang forever
          const profilePromise = getUserProfile()
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 12000))

          const response = await Promise.race([profilePromise, timeoutPromise])

          if (response && response.success) {
            setUser(response.data)
            setIsAuthenticated(true)
          } else {
            // Token invalid or server returned error - clear tokens
            localStorage.removeItem('afrimercato_token')
            localStorage.removeItem('afrimercato_refresh_token')
          }
        } catch (error) {
          // If profile fetch fails, use decoded token data as fallback
          setUser({
            _id: decoded.id,
            email: decoded.email,
            role: decoded.role || decoded.primaryRole,
            name: decoded.name
          })
          setIsAuthenticated(true)
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
        // DO NOT store user data in localStorage - security risk
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
        // DO NOT store user data in localStorage - security risk
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
    localStorage.removeItem('afrimercato_refresh_token')
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

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, getUserProfile, registerVendor as registerVendorAPI } from '../services/api'

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
    if (import.meta.env.DEV) console.error('Error decoding token:', error)
    return null
  }
}

// Normalize user object so both `role` (string) and `roles` (array) are always present
const normalizeUserRoles = (user) => {
  if (!user) return user
  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : user.role ? [user.role] : ['customer']
  const role = user.role || user.primaryRole || roles[0] || 'customer'
  return { ...user, roles, role }
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
            setUser(normalizeUserRoles(response.data))
            setIsAuthenticated(true)
          } else {
            // Token invalid or server returned error - clear tokens
            localStorage.removeItem('afrimercato_token')
            localStorage.removeItem('afrimercato_refresh_token')
          }
        } catch (error) {
          // If profile fetch fails, use decoded token data as fallback
          // IMPORTANT: JWT contains 'roles' array, not 'role' string
          const userRoles = decoded.roles || [];
          setUser({
            _id: decoded.id,
            email: decoded.email,
            roles: userRoles,
            role: userRoles[0] || 'customer'
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

      if (response && response.success) {
        const { token, user } = response.data
        localStorage.setItem('afrimercato_token', token)
        // Normalize: ensure both roles array and role string are present
        const normalizedUser = normalizeUserRoles(user)
        setUser(normalizedUser)
        setIsAuthenticated(true)
        return { success: true, user: normalizedUser }
      } else {
        return {
          success: false,
          message: response?.message || 'Login failed'
        }
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
      let response

      // Use vendor registration endpoint for vendors
      if (userData.role === 'vendor') {
        // Map form fields to vendor registration format
        const vendorData = {
          fullName: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          storeName: `${userData.name}'s Store`, // Default store name
          storeDescription: 'Welcome to my store',
          category: 'general',
          address: ''
        }
        response = await registerVendorAPI(vendorData)
      } else {
        response = await authAPI.register(userData)
      }

      if (response && response.success) {
        const { token, user } = response.data
        localStorage.setItem('afrimercato_token', token)
        const normalizedUser = normalizeUserRoles(user)
        setUser(normalizedUser)
        setIsAuthenticated(true)
        return { success: true, user: normalizedUser }
      } else {
        return {
          success: false,
          message: response?.message || 'Registration failed'
        }
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

  // Used by OAuthCallback to set auth state after social login
  const setAuth = ({ user: userData, token, isAuthenticated: authStatus }) => {
    if (token) {
      localStorage.setItem('afrimercato_token', token)
    }
    setUser(normalizeUserRoles(userData))
    setIsAuthenticated(authStatus)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    setAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

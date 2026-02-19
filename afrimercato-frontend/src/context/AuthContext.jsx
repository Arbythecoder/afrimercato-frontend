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

    // Dev logging
    if (import.meta.env.DEV) {
      console.log('🔐 Auth Check:', {
        hasToken: !!token,
        isAuth: isAuthenticated
      })
    }

    if (token) {
      // Decode token to check expiry
      const decoded = decodeToken(token)

      if (decoded && decoded.id && decoded.exp * 1000 > Date.now()) {
        // Token is valid, validate with backend
        try {
          const response = await authAPI.me() // Use /api/auth/me endpoint
          
          if (response && response.success) {
            const normalizedUser = normalizeUserRoles(response.data)
            setUser(normalizedUser)
            setIsAuthenticated(true)
            
            // Update localStorage with standard keys
            localStorage.setItem('afrimercato_role', normalizedUser.role)
            localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
            
            if (import.meta.env.DEV) {
              console.log('✅ Auth validated:', normalizedUser.role)
            }
          } else {
            // Token invalid - hard logout
            hardLogout()
          }
        } catch (error) {
          // Only invalidate session on definitive auth rejections (expired/invalid token).
          // Network timeouts, 503s, and server errors should NOT log the user out —
          // the token may be perfectly valid but the server is cold-starting.
          if (error.code === 'AUTH_EXPIRED' || error.status === 401) {
            hardLogout()
          } else {
            if (import.meta.env.DEV) {
              console.warn('[AuthContext] Auth check failed (server/network):', error.message)
            }
            // Fall back to cached user so the session survives a brief server hiccup
            const cachedUserJson = localStorage.getItem('afrimercato_user')
            if (cachedUserJson) {
              try {
                const parsed = JSON.parse(cachedUserJson)
                const normalizedUser = normalizeUserRoles(parsed)
                setUser(normalizedUser)
                setIsAuthenticated(true)
              } catch {
                // Corrupted cache — clear and force re-login next visit
                hardLogout()
              }
            }
          }
        }
      } else {
        // Token expired or invalid - hard logout
        hardLogout()
      }
    }

    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })

      if (response && response.success) {
        const { token, user, refreshToken } = response.data
        const normalizedUser = normalizeUserRoles(user)
        
        // Store in localStorage with standard keys
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
        if (refreshToken) {
          localStorage.setItem('afrimercato_refresh_token', refreshToken)
        }
        
        setUser(normalizedUser)
        setIsAuthenticated(true)
        
        if (import.meta.env.DEV) {
          console.log('🔑 Login success:', normalizedUser.role)
        }
        
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
          phone: userData.phone || '+1234567890', // Default phone if not provided
          password: userData.password,
          storeName: `${userData.name}'s Store`, // Default store name
          storeDescription: 'Welcome to my store',
          category: 'groceries', // Default to groceries (valid category)
          address: {
            street: '123 Main Street',
            city: 'Default City',
            state: '',
            postalCode: '',
            country: 'Nigeria'
          }
        }
        response = await registerVendorAPI(vendorData)
      } else {
        response = await authAPI.register(userData)
      }

      if (response && response.success) {
        const { token, user, refreshToken } = response.data
        const normalizedUser = normalizeUserRoles(user)
        
        // Store in localStorage with standard keys
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
        if (refreshToken) {
          localStorage.setItem('afrimercato_refresh_token', refreshToken)
        }
        
        setUser(normalizedUser)
        setIsAuthenticated(true)
        
        if (import.meta.env.DEV) {
          console.log('📝 Register success:', normalizedUser.role)
        }
        
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

  const hardLogout = (roleType = null) => {
    // Clear ALL auth tokens (use standard keys only)
    localStorage.removeItem('afrimercato_token')
    localStorage.removeItem('afrimercato_refresh_token')
    localStorage.removeItem('afrimercato_role')
    localStorage.removeItem('afrimercato_user')
    localStorage.removeItem('afrimercato_cart')
    localStorage.removeItem('afrimercato_last_order_items')
    localStorage.removeItem('repeatPurchaseFrequency')
    localStorage.removeItem('checkout_redirect')
    localStorage.removeItem('vendor_lock')
    
    // Clear legacy vendor tokens if they exist
    localStorage.removeItem('afrimercato_vendor_token')
    localStorage.removeItem('afrimercato_vendor_user')
    localStorage.removeItem('afrimercato_vendor_refresh_token')
    localStorage.removeItem('afrimercato_user_id')
    localStorage.removeItem('afrimercato_user_role')
    
    // Clear any cached vendor data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vendor_')) {
        localStorage.removeItem(key)
      }
    })
    
    sessionStorage.clear()
    
    setUser(null)
    setIsAuthenticated(false)
    
    if (import.meta.env.DEV) {
      console.log('🚪 Logout completed - all storage cleared')
    }
  }

  const logout = (roleType = null) => {
    hardLogout(roleType)
  }

  // Used by OAuthCallback to set auth state after social login
  const setAuth = ({ user: userData, token, refreshToken, isAuthenticated: authStatus }) => {
    if (token && userData) {
      const normalizedUser = normalizeUserRoles(userData)
      
      localStorage.setItem('afrimercato_token', token)
      localStorage.setItem('afrimercato_role', normalizedUser.role)
      localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
      if (refreshToken) {
        localStorage.setItem('afrimercato_refresh_token', refreshToken)
      }
      
      setUser(normalizedUser)
      
      if (import.meta.env.DEV) {
        console.log('🔗 OAuth login:', normalizedUser.role)
      }
    }
    setIsAuthenticated(authStatus)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    hardLogout,
    checkAuth,
    setAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

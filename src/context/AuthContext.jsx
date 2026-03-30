import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, apiCall, registerVendor as registerVendorAPI } from '../services/api'

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

  // Silently refresh access token using httpOnly cookie — no page reload required
  const silentRefresh = async () => {
    try {
      const response = await apiCall('/auth/refresh-token', { method: 'POST' })
      if (response?.success && response.data?.token) {
        localStorage.setItem('afrimercato_token', response.data.token)
        const normalizedUser = normalizeUserRoles(response.data.user)
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
        setUser(normalizedUser)
        setIsAuthenticated(true)
        return true
      }
    } catch (_e) {
      // Refresh cookie expired or missing — user must log in again
    }
    return false
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('afrimercato_token')

    if (!token) {
      // No access token — try silent refresh via httpOnly refresh cookie
      const refreshed = await silentRefresh()
      if (!refreshed) {
        setLoading(false)
        return
      }
      setLoading(false)
      return
    }

    const decoded = decodeToken(token)

    if (!decoded || !decoded.id || decoded.exp * 1000 <= Date.now()) {
      // Access token expired — try silent refresh before logging out
      const refreshed = await silentRefresh()
      if (!refreshed) hardLogout()
      setLoading(false)
      return
    }

    // Token looks valid — confirm with backend
    try {
      const response = await authAPI.me()
      if (response?.success) {
        const normalizedUser = normalizeUserRoles(response.data)
        setUser(normalizedUser)
        setIsAuthenticated(true)
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
      } else {
        hardLogout()
      }
    } catch (error) {
      if (error.code === 'AUTH_EXPIRED' || error.status === 401) {
        const refreshed = await silentRefresh()
        if (!refreshed) hardLogout()
      } else {
        // Server/network error — keep session alive from cache
        const cachedUserJson = localStorage.getItem('afrimercato_user')
        if (cachedUserJson) {
          try {
            setUser(normalizeUserRoles(JSON.parse(cachedUserJson)))
            setIsAuthenticated(true)
          } catch (_e) {
            hardLogout()
          }
        }
      }
    }

    setLoading(false)
  }

  const login = async (email, password, { requiredRole } = {}) => {
    try {
      const response = await authAPI.login({ email, password })

      if (response && response.success) {
        const { token, user } = response.data
        const normalizedUser = normalizeUserRoles(user)

        // Role gate — checked BEFORE committing auth state so the caller keeps
        // the user on the current page and the session is never opened.
        if (requiredRole && normalizedUser.role !== requiredRole) {
          return {
            success: false,
            roleBlocked: true,
            actualRole: normalizedUser.role,
            message: `This account is registered as a ${normalizedUser.role}. Please use a customer account.`
          }
        }

        // Access token in localStorage — refresh token lives in httpOnly cookie (set by server)
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))

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
      } else if (userData.role === 'rider') {
        response = await apiCall('/rider-auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: userData.name, email: userData.email, phone: userData.phone, password: userData.password, location: userData.location })
        })
      } else if (userData.role === 'picker') {
        response = await apiCall('/picker-auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: userData.name, email: userData.email, phone: userData.phone, password: userData.password })
        })
      } else {
        response = await authAPI.register(userData)
      }

      if (response && response.success) {
        const { token, user } = response.data
        const normalizedUser = normalizeUserRoles(user)

        // Access token in localStorage — refresh token lives in httpOnly cookie (set by server)
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))

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

  const hardLogout = () => {
    // Ask server to clear httpOnly refresh cookie
    apiCall('/auth/logout', { method: 'POST' }).catch(() => {})

    // Clear ALL auth tokens (use standard keys only)
    localStorage.removeItem('afrimercato_token')
    localStorage.removeItem('afrimercato_refresh_token')
    localStorage.removeItem('afrimercato_role')
    localStorage.removeItem('afrimercato_user')
    localStorage.removeItem('afrimercato_cart')
    localStorage.removeItem('afrimercato_last_order_items')
    localStorage.removeItem('repeatPurchaseFrequency')
    // NOTE: do NOT clear checkout_redirect here — it must survive OAuth redirects
    // and auth re-checks so OAuthCallback / Login can consume it after sign-in.
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

    // Redirect to home page (not login) after logout
    window.location.replace('/')
  }

  const logout = () => {
    hardLogout()
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

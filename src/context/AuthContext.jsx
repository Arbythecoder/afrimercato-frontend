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
    try {
      // If the 15m token is expired, your apiCall interceptor will silently refresh it before returning!
      const response = await authAPI.me()
      
      if (response?.success && response.data) {
        const normalizedUser = normalizeUserRoles(response.data)
        setUser(normalizedUser)
        setIsAuthenticated(true)
        
        // Save ONLY non-sensitive user data for fast UI rendering
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))
      } else {
        hardLogout()
      }
    } catch (error) {
      hardLogout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, { requiredRole } = {}) => {
    try {
      const response = await authAPI.login({ email, password })

      if (response && response.success) {
        const { user } = response.data
        const normalizedUser = normalizeUserRoles(user)

        // Role gate
        if (requiredRole && normalizedUser.role !== requiredRole) {
          // If role fails, we should immediately ask backend to clear the cookies it just set
          apiCall('/auth/logout', { method: 'POST' }).catch(() => {})
          
          return {
            success: false,
            roleBlocked: true,
            actualRole: normalizedUser.role,
            message: `This account is registered as a ${normalizedUser.role}. Please use a customer account.`
          }
        }

        // Store ONLY the user details. The browser handles the cookies!
        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))

        setUser(normalizedUser)
        setIsAuthenticated(true)

        if (import.meta.env.DEV) {
          console.log('Login success:', normalizedUser.role)
        }

        const redirect = localStorage.getItem('post_login_redirect')
        if (redirect) {
          localStorage.removeItem('post_login_redirect')
          window._loginRedirect = redirect
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
        const vendorData = {
          fullName: userData.name,
          email: userData.email,
          phone: userData.phone || '+1234567890',
          password: userData.password,
          storeName: userData.storeName || `${userData.name}'s Store`,
          storeDescription: 'Welcome to my store',
          category: 'groceries',
          address: {
            street: '123 Main Street',
            city: 'London',
            state: '',
            postalCode: '',
            country: 'United Kingdom'
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
        const { user } = response.data
        const normalizedUser = normalizeUserRoles(user)

        localStorage.setItem('afrimercato_role', normalizedUser.role)
        localStorage.setItem('afrimercato_user', JSON.stringify(normalizedUser))

        // Preserve guest cart
        const guestCart = localStorage.getItem('afrimercato_cart')
        if (guestCart) {
          localStorage.setItem('checkout_cart_backup', guestCart)
        }

        setUser(normalizedUser)
        setIsAuthenticated(true)

        if (import.meta.env.DEV) {
          console.log('Register success:', normalizedUser.role)
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
    // MUST tell the server to destroy the HttpOnly cookies
    apiCall('/auth/logout', { method: 'POST' }).catch(() => {})

    //  Clear ALL legacy auth tokens and user data from localStorage
    localStorage.removeItem('afrimercato_token')
    localStorage.removeItem('afrimercato_refresh_token')
    
    localStorage.removeItem('afrimercato_role')
    localStorage.removeItem('afrimercato_user')
    localStorage.removeItem('afrimercato_cart')
    localStorage.removeItem('afrimercato_last_order_items')
    localStorage.removeItem('repeatPurchaseFrequency')
    localStorage.removeItem('vendor_lock')
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vendor_') || key.startsWith('afrimercato_vendor_')) {
        localStorage.removeItem(key)
      }
    })
    
    sessionStorage.clear()
    
    setUser(null)
    setIsAuthenticated(false)

    if (import.meta.env.DEV) {
      console.log('Logout completed - Cookies destroyed & storage cleared')
    }

    if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
      window.location.replace('/')
    }
  }

  const logout = () => {
    hardLogout()
  }

  // Used by OAuthCallback to establish state after Google/Facebook redirect
  const setAuth = async () => {
    await checkAuth()
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
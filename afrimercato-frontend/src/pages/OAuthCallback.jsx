import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://afrimercato-backend.fly.dev'

/**
 * OAuth Callback Handler
 * Handles Google and Facebook OAuth redirects
 * Extracts tokens from URL and logs user in
 */
function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuth()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        const refreshToken = searchParams.get('refreshToken')
        const provider = searchParams.get('provider')
        const error = searchParams.get('error')

        if (error) {
          navigate(`/login?error=${encodeURIComponent(error)}`)
          return
        }

        if (!token) {
          navigate('/login?error=no_token')
          return
        }

        // Store tokens immediately so auth state persists even if profile fetch fails
        localStorage.setItem('afrimercato_token', token)
        if (refreshToken) {
          localStorage.setItem('afrimercato_refresh_token', refreshToken)
        }

        // Fetch user profile with 8s timeout — OAuth should never block
        let userData = null
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)

          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
          })
          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            userData = data.data || data.user
          }
        } catch (fetchErr) {
          // Profile fetch failed — fall back to JWT decode for routing
          if (import.meta.env.DEV) {
            console.warn('OAuth profile fetch failed, using JWT fallback:', fetchErr.message)
          }
        }

        // Fallback: decode JWT for minimal user info (role routing only)
        if (!userData) {
          try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            const roles = payload.roles || []
            userData = {
              _id: payload.id,
              email: payload.email,
              roles,
              role: roles[0] || 'customer'
            }
          } catch {
            // JWT decode failed — redirect as customer
            userData = { role: 'customer' }
          }
        }

        // Update auth context
        setAuth({
          user: userData,
          token,
          isAuthenticated: true
        })

        if (import.meta.env.DEV) {
          console.log(`Logged in via ${provider}:`, userData.email)
        }

        // Redirect based on role
        const role = userData.role || userData.primaryRole || (userData.roles && userData.roles[0]) || 'customer'

        switch (role) {
          case 'vendor':
            navigate('/dashboard')
            break
          case 'rider':
            navigate('/rider/dashboard')
            break
          case 'picker':
            navigate('/picker/dashboard')
            break
          case 'customer':
          default:
            // Check if user was trying to checkout
            if (localStorage.getItem('checkout_redirect') === 'true') {
              localStorage.removeItem('checkout_redirect')
              navigate('/checkout')
            } else {
              navigate('/')
            }
            break
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('OAuth callback error:', error)
        }
        navigate('/login?error=callback_failed')
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block">
          <svg
            className="animate-spin h-12 w-12 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
        <p className="mt-2 text-gray-600">
          Please wait while we log you in
        </p>
      </div>
    </div>
  )
}

export default OAuthCallback

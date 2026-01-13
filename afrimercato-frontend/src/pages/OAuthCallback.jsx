import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
        // Extract tokens and provider from URL
        const token = searchParams.get('token')
        const refreshToken = searchParams.get('refreshToken')
        const provider = searchParams.get('provider')
        const error = searchParams.get('error')

        // Handle OAuth error
        if (error) {
          console.error('OAuth error:', error)
          navigate(`/login?error=${error}`)
          return
        }

        // Validate tokens
        if (!token || !refreshToken) {
          console.error('No tokens received from OAuth')
          navigate('/login?error=no_token')
          return
        }

        // Store tokens with correct key names to match the rest of the app
        localStorage.setItem('afrimercato_token', token)
        localStorage.setItem('afrimercato_refresh_token', refreshToken)

        // Fetch user data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()

        // Update auth context
        setAuth({
          user: data.user,
          token,
          isAuthenticated: true
        })

        // Show success message
        console.log(`✅ Logged in via ${provider}:`, data.user.email)

        // Redirect based on role
        const role = data.user.role || data.user.primaryRole

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
            navigate('/')
            break
        }

      } catch (error) {
        console.error('OAuth callback error:', error)
        navigate('/login?error=callback_failed')
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="inline-block">
          <svg
            className="animate-spin h-12 w-12 text-afri-green"
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

        {/* Loading Text */}
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

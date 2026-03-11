import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext'
import { apiCall } from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { checkAuth, user, isAuthenticated } = useAuth()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')
  const [resendStatus, setResendStatus] = useState('idle') // idle | sending | sent | error

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')

        // Refresh auth so the user object picks up emailVerified: true
        // then redirect to the right place after a short delay
        setTimeout(async () => {
          if (isAuthenticated) {
            await checkAuth()

            // If they were mid-checkout, send them back there
            const checkoutRedirect = localStorage.getItem('checkout_redirect')
            if (checkoutRedirect === 'true') {
              localStorage.removeItem('checkout_redirect')
              navigate('/checkout')
              return
            }

            const role = user?.role || user?.roles?.[0] || 'customer'
            if (role === 'vendor') navigate('/vendor/dashboard')
            else if (role === 'rider') navigate('/rider/dashboard')
            else if (role === 'picker') navigate('/picker/dashboard')
            else if (role === 'admin') navigate('/admin/dashboard')
            else navigate('/')
          } else {
            navigate('/login')
          }
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    }
  }

  const handleResend = async () => {
    if (!isAuthenticated) {
      // Not logged in — send to login so they get a session first
      navigate('/login?redirect=/verify-email')
      return
    }
    setResendStatus('sending')
    try {
      await apiCall('/auth/resend-verification', { method: 'POST' })
      setResendStatus('sent')
    } catch {
      setResendStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🛒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Afri<span className="text-green-600">Hub</span>
          </h1>
        </div>

        {/* Status */}
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Email...</h2>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                {/* Resend verification email — POST /api/auth/resend-verification */}
                <button
                  onClick={handleResend}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                  className="block w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {resendStatus === 'sending' ? 'Sending...'
                    : resendStatus === 'sent' ? '✓ New link sent — check your inbox'
                    : resendStatus === 'error' ? 'Failed to send — try again'
                    : 'Resend Verification Email'}
                </button>
                <Link
                  to="/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center"
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full bg-white border border-gray-300 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

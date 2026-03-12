import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react'
import OtpInput from '../components/OtpInput'
import { apiCall } from '../services/api'

export default function VerifyPhone() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || ''
  const redirectTo = location.state?.redirectTo || '/'

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [attempts, setAttempts] = useState(0)

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const verify = async () => {
    if (otp.length < 6) {
      setError('Please enter all 6 digits')
      return
    }
    setLoading(true)
    setError('')
    try {
      await apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      })
      setVerified(true)
      setTimeout(() => navigate(redirectTo, { replace: true }), 2200)
    } catch (err) {
      setAttempts((a) => a + 1)
      if (err?.status === 429 || attempts >= 4) {
        setError('Too many attempts. Please request a new code.')
      } else {
        setError(err?.message || 'Incorrect code. Please try again.')
      }
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    setError('')
    try {
      await apiCall('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      })
      setCooldown(60)
      setAttempts(0)
    } catch (err) {
      setError(err?.message || 'Failed to resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  // ── Verified ──────────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-afri-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Phone Verified!</h2>
          <p className="text-gray-500 mt-2">Redirecting you now…</p>
        </motion.div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md"
      >
        {/* Icon */}
        <div className="w-14 h-14 bg-afri-green/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Phone size={26} className="text-afri-green" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          Verify your phone
        </h1>
        <p className="text-gray-500 text-center text-sm mb-7">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-gray-900">{phone || 'your number'}</span>
        </p>

        {/* OTP boxes */}
        <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading} />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-4 font-medium">{error}</p>
        )}

        {/* Verify button */}
        <button
          onClick={verify}
          disabled={loading || otp.replace(/\s/g, '').length < 6}
          className="w-full mt-6 py-3 bg-afri-green text-white font-semibold rounded-xl
            hover:bg-afri-green-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Verifying…' : 'Verify Phone'}
        </button>

        {/* Resend */}
        <div className="text-center mt-4">
          {cooldown > 0 ? (
            <p className="text-gray-400 text-sm">Resend code in {cooldown}s</p>
          ) : (
            <button
              onClick={resendOtp}
              disabled={resending}
              className="text-afri-green text-sm font-semibold flex items-center gap-1.5 mx-auto hover:underline disabled:opacity-50"
            >
              <RefreshCw size={13} />
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 py-2 text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </motion.div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

/**
 * OTP Verification Component
 * Handles phone number verification with SMS OTP
 * Like UberEats, Chowdeck, JustEat verification flow
 */
function OTPVerification({ phoneNumber, onVerified, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [sending, setSending] = useState(false)

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ]

  // Send initial OTP when component mounts
  useEffect(() => {
    sendOTP()
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  /**
   * Send OTP to phone number
   */
  const sendOTP = async () => {
    try {
      setSending(true)
      setError('')

      const response = await api.post('/auth/otp/send', {
        phoneNumber,
        purpose: 'verification'
      })

      if (response.data.success) {
        setResendCooldown(60) // 60 second cooldown

        // In development/mock mode, auto-fill OTP
        if (response.data.otp) {
          const otpArray = response.data.otp.split('')
          setOtp(otpArray)
          inputRefs[0].current?.focus()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code')
    } finally {
      setSending(false)
    }
  }

  /**
   * Handle OTP input change
   */
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all digits entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      verifyOTP(newOtp.join(''))
    }
  }

  /**
   * Handle backspace/delete
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  /**
   * Handle paste
   */
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6)
    setOtp(newOtp)

    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs[focusIndex].current?.focus()

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      verifyOTP(pastedData)
    }
  }

  /**
   * Verify OTP code
   */
  const verifyOTP = async (code) => {
    try {
      setLoading(true)
      setError('')

      const response = await api.post('/auth/otp/verify', {
        phoneNumber,
        otp: code
      })

      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          onVerified(response.data)
        }, 1000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code')
      setOtp(['', '', '', '', '', ''])
      inputRefs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  /**
   * Resend OTP
   */
  const handleResend = async () => {
    if (resendCooldown > 0) return

    setOtp(['', '', '', '', '', ''])
    setError('')
    await sendOTP()
    inputRefs[0].current?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-afri-green rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
        <p className="text-gray-600">
          Enter the 6-digit code sent to<br />
          <span className="font-semibold text-gray-900">{phoneNumber}</span>
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
          >
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 text-sm font-medium">Phone verified successfully!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Input */}
      <div className="flex justify-center space-x-3 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading || success}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all ${
              digit
                ? 'border-afri-green bg-green-50'
                : 'border-gray-300 bg-white'
            } ${
              error
                ? 'border-red-500 bg-red-50'
                : ''
            } focus:border-afri-green focus:ring-2 focus:ring-afri-green/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 text-afri-green">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">Verifying...</span>
          </div>
        </div>
      )}

      {/* Resend Code */}
      <div className="text-center mb-6">
        {resendCooldown > 0 ? (
          <p className="text-gray-500 text-sm">
            Resend code in <span className="font-semibold text-afri-green">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            className="text-afri-green hover:text-afri-green-dark font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sending ? 'Sending...' : 'Resend Code'}
          </button>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={loading || success}
          className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      )}
    </motion.div>
  )
}

export default OTPVerification

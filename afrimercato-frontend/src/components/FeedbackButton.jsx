/**
 * AFRIMERCATO - Floating Feedback Button & Modal
 * Can be placed anywhere in the app for user feedback
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendContactForm } from '../services/api'

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'feedback',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await sendContactForm(formData)

      if (response.success) {
        setSubmitted(true)
        setTimeout(() => {
          setFormData({ name: '', email: '', subject: 'feedback', message: '' })
          setSubmitted(false)
          setIsOpen(false)
        }, 2500)
      } else {
        setError(response.message || 'Failed to send feedback. Please try again.')
      }
    } catch (err) {
      setError('Failed to send feedback. Please try again later.')
      console.error('Feedback error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#00897B] hover:bg-[#00695C] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <span className="text-xl">💬</span>
        <span className="font-semibold hidden sm:inline">Feedback</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="min-h-screen px-4 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {submitted ? (
                    /* Success Message */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                      <p className="text-gray-600">
                        We appreciate your feedback and will get back to you soon.
                      </p>
                    </motion.div>
                  ) : (
                    /* Feedback Form */
                    <>
                      <div className="mb-6">
                        <div className="text-4xl mb-3">💭</div>
                        <h2 className="text-2xl font-bold text-gray-900">Send Feedback</h2>
                        <p className="text-gray-600 mt-1">
                          We'd love to hear your thoughts, suggestions, or concerns!
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B] focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B] focus:border-transparent outline-none transition-all"
                            placeholder="john@example.com"
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Feedback
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B] focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Share your thoughts, suggestions, or report an issue..."
                          />
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#00897B] hover:bg-[#00695C] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <span>Send Feedback</span>
                              <span>✉️</span>
                            </>
                          )}
                        </button>
                      </form>

                      <p className="text-xs text-gray-500 mt-4 text-center">
                        Your feedback helps us improve Afrimercato for everyone
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { submitFeedback } from '../services/api'

const CATEGORIES = [
  { value: 'general',     label: 'General feedback' },
  { value: 'feature',     label: 'Feature suggestion' },
  { value: 'product',     label: 'Product / store quality' },
  { value: 'delivery',    label: 'Delivery experience' },
  { value: 'bug',         label: 'Something is broken' },
  { value: 'other',       label: 'Other' },
]

export default function Feedback() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'general',
    message: '',
  })
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await submitFeedback(form)
      if (res?.success) {
        setStatus('success')
        setForm({ name: '', email: '', category: 'general', message: '' })
      } else {
        setStatus('error')
        setErrorMsg(res?.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err?.message || 'Could not submit feedback. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[#00897B]">Afrimercato</Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-[#00897B]/10 text-[#00897B] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              We're listening
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
              Share your thoughts<br className="hidden sm:block" /> with us
            </h1>
            <p className="text-gray-500 text-base sm:text-lg mb-8 leading-relaxed">
              Afrimercato is being built for you. Whether you have a feature idea, a question,
              or just want to tell us what you think — we read every single submission.
            </p>

            <div className="space-y-5">
              {[
                { icon: '💡', title: 'Shape the product', body: 'Your suggestions directly influence what we build next.' },
                { icon: '🚀', title: 'Early access', body: 'Active contributors get early access when we go live.' },
                { icon: '🙌', title: 'Responses within 48 h', body: 'We personally reply to every piece of feedback.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00897B]/10 flex items-center justify-center flex-shrink-0 text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
                  <p className="text-gray-500 mb-6">Your feedback has been received. We'll be in touch soon.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-[#00897B] font-semibold hover:underline text-sm"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Your opinion matters</h2>
                  <p className="text-sm text-gray-400 mb-2">All fields are required.</p>

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition text-gray-900 bg-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Feedback</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what you think, what you'd like to see, or anything on your mind…"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[#00897B] hover:bg-[#00695C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Submitting…
                      </>
                    ) : 'Send Feedback'}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    We respect your privacy. Your details will never be shared.
                  </p>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

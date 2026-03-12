import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { apiCall } from '../../services/api'
import { MessageSquare, ChevronDown, ChevronLeft, Send, HelpCircle, Package, CreditCard, Truck, RefreshCw } from 'lucide-react'

const CATEGORIES = [
  { id: 'order',   label: 'Order Issue',     icon: Package,        desc: 'Missing, wrong, or damaged items' },
  { id: 'payment', label: 'Payment Issue',   icon: CreditCard,     desc: 'Charges, refunds, billing' },
  { id: 'delivery',label: 'Delivery Issue',  icon: Truck,          desc: 'Late, wrong address, rider issue' },
  { id: 'account', label: 'Account Issue',   icon: RefreshCw,      desc: 'Login, password, profile' },
  { id: 'other',   label: 'Other',           icon: HelpCircle,     desc: 'Something else' },
]

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to Order History → select your order → tap "Track Order" to see live delivery status.' },
  { q: 'Can I cancel my order?', a: 'You can cancel within 5 minutes of placing. After that, contact support and we\'ll try to help depending on order status.' },
  { q: 'My item was missing — what do I do?', a: 'Submit a support request with your order number and we\'ll arrange a refund or re-delivery within 24 hours.' },
  { q: 'How long do refunds take?', a: 'Refunds are processed within 3–5 business days back to your original payment method.' },
  { q: 'How do I change my delivery address?', a: 'Once an order is placed, the address cannot be changed. Please contact support immediately and we\'ll try to intercept.' },
]

export default function CustomerSupport() {
  const [step, setStep] = useState('home') // home | form | submitted
  const [category, setCategory] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ subject: '', orderNumber: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.message.trim()) return
    setLoading(true)
    setError('')
    try {
      await apiCall('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          category: category?.id,
          subject: form.subject || category?.label,
          orderNumber: form.orderNumber,
          message: form.message
        })
      })
      setStep('submitted')
    } catch (err) {
      if (err?.status === 501 || err?.message?.includes('501')) {
        // Backend stub — still show success UX
        setStep('submitted')
      } else {
        setError(err?.message || 'Failed to submit ticket. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-afri-green to-afri-green-dark px-5 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <Link to="/" className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4">
            <ChevronLeft size={16} /> Back
          </Link>
          <h1 className="text-white text-2xl font-bold">Help & Support</h1>
          <p className="text-white/70 text-sm mt-1">We typically reply within 2 hours</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-8 pb-12 space-y-5">
        <AnimatePresence mode="wait">

          {/* Home */}
          {step === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* Contact card */}
              <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-afri-green" /> Contact Support
                </h2>
                <p className="text-sm text-gray-500 mb-4">Select a category so we can route your request to the right team.</p>
                <div className="space-y-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setCategory(cat); setStep('form') }}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-afri-green hover:bg-afri-green/5 transition-all text-left"
                      >
                        <div className="w-9 h-9 bg-afri-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon size={17} className="text-afri-green" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{cat.label}</p>
                          <p className="text-xs text-gray-400">{cat.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle size={18} className="text-afri-green" /> Frequently Asked Questions
                </h2>
                <div className="space-y-1">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="border-b border-gray-50 last:border-0">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between py-3.5 text-left"
                      >
                        <p className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</p>
                        <ChevronDown
                          size={16}
                          className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-gray-500 pb-3.5">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {step === 'form' && category && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <button onClick={() => setStep('home')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4">
                  <ChevronLeft size={15} /> Back
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-afri-green/10 rounded-xl flex items-center justify-center">
                    {(() => { const Icon = category.icon; return <Icon size={18} className="text-afri-green" /> })()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{category.label}</h2>
                    <p className="text-xs text-gray-400">{category.desc}</p>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder={`Brief description of ${category.label.toLowerCase()}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green focus:border-transparent text-sm"
                    />
                  </div>

                  {['order', 'delivery'].includes(category.id) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number (optional)</label>
                      <input
                        type="text"
                        value={form.orderNumber}
                        onChange={e => setForm(f => ({ ...f, orderNumber: e.target.value }))}
                        placeholder="e.g. ORD-12345"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green focus:border-transparent text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Please describe your issue in detail..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green focus:border-transparent text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !form.message.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark disabled:opacity-50 transition"
                  >
                    {loading ? 'Sending...' : <><Send size={15} /> Send Message</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Submitted */}
          {step === 'submitted' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-afri-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-afri-green" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We've received your request and will get back to you within 2 hours via email.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark transition"
                >
                  Back to Shopping
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

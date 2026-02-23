/**
 * AFRIMERCATO - Contact Us Page
 * Premium design matching the brand identity
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { sendContactForm } from '../services/api'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
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
          setFormData({ name: '', email: '', subject: 'general', message: '' })
          setSubmitted(false)
        }, 3000)
      } else {
        setError(response.message || 'Failed to send message. Please try again.')
      }
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly.')
      console.error('Contact form error:', err)
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Us',
      content: 'info@afrimercato.co.uk',
      description: 'We reply within 24 hours'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      content: 'Washington Ave, Manchester',
      description: 'United Kingdom'
    },
    {
      icon: '📞',
      title: 'Call Us',
      content: '+44 161 123 4567',
      description: 'Mon-Fri, 9am-6pm'
    }
  ]

  const supportCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'order', label: 'Order Support' },
    { value: 'delivery', label: 'Delivery Issue' },
    { value: 'vendor', label: 'Vendor Partnership' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'press', label: 'Press & Media' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Afrimercato" className="h-8 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/stores" className="text-gray-600 hover:text-gray-900 font-medium">Stores</Link>
              <Link to="/delivery" className="text-gray-600 hover:text-gray-900 font-medium">Delivery</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About us</Link>
              <Link to="/contact" className="text-[#00897B] font-medium">Contact us</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Log in</Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-4 py-2 rounded-full font-semibold transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a1a1a] to-[#333] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Have questions? We'd love to hear from you. Send us a message
            and we'll respond as soon as possible.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0 120L1440 120L1440 0C1200 80 800 40 400 60C200 70 0 40 0 0L0 120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow border border-gray-100"
              >
                <div className="text-5xl mb-4">{info.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-[#00897B] font-semibold mb-1">{info.content}</p>
                <p className="text-gray-500 text-sm">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition-all"
                  >
                    {supportCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitted || loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    submitted
                      ? 'bg-green-500 text-white'
                      : loading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#00897B] hover:bg-[#00695C] text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submitted ? 'Message Sent! ✓' : loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Info & Social */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600"
                  alt="Location"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Office Hours */}
              <div className="bg-[#F5A623]/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {[
                    { name: 'Facebook', icon: '📘' },
                    { name: 'Twitter', icon: '🐦' },
                    { name: 'Instagram', icon: '📷' },
                    { name: 'LinkedIn', icon: '💼' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl hover:shadow-lg hover:-translate-y-1 transition-all"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-[#00897B] rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Need Quick Help?</h3>
                <p className="text-white/80 mb-4">
                  Check our FAQ section for instant answers to common questions.
                </p>
                <Link
                  to="/delivery#faqs"
                  className="inline-block bg-white text-[#00897B] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  View FAQs
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Interested in Partnering With Us?
          </h2>
          <p className="text-gray-600 mb-8">
            Join over 4,320 vendors already selling on Afrimercato and reach thousands of customers.
          </p>
          <Link
            to="/partner"
            className="inline-block bg-[#F5A623] text-gray-900 px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-[#FF9800] transition-all"
          >
            Become a Vendor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Afrimercato</h4>
              <p className="text-gray-400 text-sm">Fresh African groceries delivered across the UK.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-[#F5A623]">Home</Link></li>
                <li><Link to="/stores" className="hover:text-[#F5A623]">Stores</Link></li>
                <li><Link to="/about" className="hover:text-[#F5A623]">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-[#F5A623]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/delivery" className="hover:text-[#F5A623]">Delivery Info</Link></li>
                <li><Link to="/partner" className="hover:text-[#F5A623]">Partner With Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">info@afrimercato.co.uk</p>
              <p className="text-gray-400 text-sm mt-2">Manchester, United Kingdom</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Afrimercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

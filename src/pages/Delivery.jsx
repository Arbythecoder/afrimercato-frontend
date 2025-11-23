/**
 * AFRIMERCATO - Delivery Information Page
 * Premium design matching the brand identity
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Delivery() {
  const deliveryOptions = [
    {
      title: 'Standard Delivery',
      time: '2-4 hours',
      price: '£5.00',
      description: 'Perfect for planned shopping',
      icon: '📦'
    },
    {
      title: 'Express Delivery',
      time: '30-60 mins',
      price: '£8.00',
      description: 'When you need it fast',
      icon: '🚀'
    },
    {
      title: 'Scheduled Delivery',
      time: 'Pick your slot',
      price: '£4.00',
      description: 'Choose your preferred time',
      icon: '📅'
    }
  ]

  const coverageAreas = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
    'Bristol', 'Leicester', 'Sheffield', 'Nottingham', 'Newcastle',
    'Cardiff', 'Glasgow', 'Edinburgh', 'Belfast', 'Southampton'
  ]

  const faqs = [
    {
      question: 'What are your delivery hours?',
      answer: 'We deliver from 8:00 AM to 10:00 PM, 7 days a week. Specific hours may vary by location and vendor.'
    },
    {
      question: 'Is there a minimum order for delivery?',
      answer: 'The minimum order is £15 for standard delivery. Orders over £50 qualify for free delivery!'
    },
    {
      question: 'Can I track my delivery?',
      answer: 'Yes! Once your order is dispatched, you\'ll receive real-time tracking updates via SMS and our app.'
    },
    {
      question: 'What if I\'m not home?',
      answer: 'You can add delivery instructions for safe places to leave your order, or reschedule for a more convenient time.'
    },
    {
      question: 'Do you deliver to my area?',
      answer: 'We cover most major UK cities. Enter your postcode on our homepage to check availability in your area.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <path d="M8 8L32 32M32 8L8 32" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">Afrimercato</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/stores" className="text-gray-600 hover:text-gray-900 font-medium">Stores</Link>
              <Link to="/delivery" className="text-[#00897B] font-medium">Delivery</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About us</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact us</Link>
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
      <section className="relative bg-gradient-to-br from-[#00897B] to-[#00695C] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Fast, Reliable Delivery Across the UK
              </h1>
              <p className="text-xl text-white/90 mb-8">
                From our trusted vendors to your doorstep. Fresh groceries delivered
                when you need them, where you need them.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/stores"
                  className="bg-white text-[#00897B] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Start Shopping
                </Link>
                <a
                  href="#coverage"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#00897B] transition-all"
                >
                  Check Coverage
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600"
                alt="Delivery"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0 120L1440 120L1440 0C1200 80 800 40 400 60C200 70 0 40 0 0L0 120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Delivery Options
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose the delivery option that works best for you
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {deliveryOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border-2 border-gray-100 p-8 rounded-2xl hover:border-[#00897B] hover:shadow-xl transition-all text-center"
              >
                <div className="text-5xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-[#00897B] text-2xl font-bold mb-2">{option.time}</p>
                <p className="text-gray-600 mb-4">{option.description}</p>
                <p className="text-gray-900 font-semibold">{option.price}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center bg-[#F5A623]/10 rounded-2xl p-8">
            <p className="text-2xl font-bold text-gray-900 mb-2">Free Delivery</p>
            <p className="text-gray-600">On all orders over £50!</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            How Delivery Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Browse & Order', description: 'Find your favorite products from local vendors', icon: '🛒' },
              { step: 2, title: 'Vendor Prepares', description: 'Fresh products are carefully packed', icon: '📦' },
              { step: 3, title: 'On The Way', description: 'Track your delivery in real-time', icon: '🚚' },
              { step: 4, title: 'Delivered!', description: 'Enjoy your fresh groceries at home', icon: '🏠' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="w-10 h-10 bg-[#00897B] text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-[#00897B]/30 -translate-x-1/2"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section id="coverage" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Delivery Coverage
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We're rapidly expanding! Currently serving these major cities and surrounding areas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {coverageAreas.map((area) => (
              <motion.div
                key={area}
                whileHover={{ scale: 1.05 }}
                className="bg-white border border-gray-200 px-6 py-3 rounded-full shadow-sm hover:shadow-md hover:border-[#00897B] transition-all cursor-pointer"
              >
                <span className="text-gray-900 font-medium">{area}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8 text-gray-600">
            Don't see your area? <Link to="/contact" className="text-[#00897B] font-semibold hover:underline">Contact us</Link> - we're expanding!
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
              >
                <summary className="p-6 cursor-pointer font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50">
                  {faq.question}
                  <span className="text-[#00897B] group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#F5A623]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Order?
          </h2>
          <p className="text-gray-800 text-lg mb-8">
            Experience the convenience of fresh African groceries delivered to your door.
          </p>
          <Link
            to="/stores"
            className="inline-block bg-[#00897B] text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-[#00695C] transition-all"
          >
            Browse Stores Near You
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

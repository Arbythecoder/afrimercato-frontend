import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBagIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function PartnerWithUs() {
  const benefits = [
    {
      icon: ShoppingBagIcon,
      title: 'Reach Thousands of Customers',
      description: 'Get your products in front of 4,320+ active shoppers looking for African groceries.'
    },
    {
      icon: ChartBarIcon,
      title: 'Grow Your Business Online',
      description: 'Track sales, manage inventory, and grow your revenue with our easy-to-use vendor dashboard.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Easy Store Management',
      description: 'Manage your store from anywhere with our mobile-friendly vendor dashboard.'
    },
    {
      icon: TruckIcon,
      title: 'We Handle Delivery',
      description: 'Focus on preparing quality products. Our riders handle pickup and delivery to customers.'
    },
    {
      icon: UserGroupIcon,
      title: 'Dedicated Support',
      description: '24/7 support to help you succeed. We\'re here to answer questions and solve problems.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Verified & Trusted',
      description: 'Join a trusted marketplace where quality vendors are verified and customer trust is high.'
    }
  ]

  const steps = [
    {
      number: 1,
      title: 'Submit Application',
      description: 'Fill out the vendor application form with your business details and documents.',
      color: 'from-green-500 to-green-600'
    },
    {
      number: 2,
      title: 'Verification Process',
      description: 'Our team reviews your application and verifies your business credentials (1-3 business days).',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      number: 3,
      title: 'Set Up Your Store',
      description: 'Once approved, set up your store profile, add products, and configure delivery settings.',
      color: 'from-green-600 to-green-700'
    },
    {
      number: 4,
      title: 'Start Selling',
      description: 'Go live and start receiving orders from customers in your area!',
      color: 'from-yellow-600 to-yellow-700'
    }
  ]

  const requirements = [
    'Valid business registration or tax ID',
    'Proof of address (business location)',
    'Food safety/handling certification (for food vendors)',
    'Bank account for receiving payments',
    'High-quality photos of your products',
    'Commitment to quality and customer service'
  ]

  const faqs = [
    {
      q: 'How much does it cost to join?',
      a: 'Joining AfriMercato is free! We charge a small commission (12-15%) on each sale to cover platform costs, payment processing, and support.'
    },
    {
      q: 'How long does verification take?',
      a: 'Verification typically takes 1-3 business days. We\'ll review your documents and get back to you via email.'
    },
    {
      q: 'What products can I sell?',
      a: 'You can sell fresh produce, meats, dairy, African foods, spices, grains, and packaged goods. All products must meet UK food safety standards.'
    },
    {
      q: 'How do I receive payments?',
      a: 'Payments are processed through Paystack and deposited directly to your bank account weekly.'
    },
    {
      q: 'Can I manage multiple stores?',
      a: 'Yes! You can manage multiple store locations from a single vendor account.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛒</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Afri<span className="text-green-600">Hub</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Vendor Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-yellow-500 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Grow Your Food Business with AfriMercato
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/95 mb-8 max-w-3xl mx-auto"
          >
            Join 4,320+ vendors already selling African groceries and reaching thousands of customers across the UK.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register?role=vendor"
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl inline-flex items-center justify-center gap-2"
            >
              Apply Now →
            </Link>
            <a
              href="#how-it-works"
              className="bg-white/10 backdrop-blur text-white hover:bg-white/20 px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/30 inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            {[
              { value: '4,320+', label: 'Active Vendors' },
              { value: '£2.5M+', label: 'Monthly Sales' },
              { value: '98%', label: 'Satisfaction Rate' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Sell on AfriMercato?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a successful online grocery business
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Get Started
            </h2>
            <p className="text-lg text-gray-600">
              Simple 4-step process to start selling
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-3xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What You'll Need
            </h2>
            <p className="text-lg text-gray-600">
              Requirements for vendor verification
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ul className="space-y-4">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-yellow-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-white/95 mb-8">
            Join thousands of vendors growing their business on AfriMercato
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=vendor"
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl inline-flex items-center justify-center gap-2"
            >
              Apply as Vendor →
            </Link>
            <Link
              to="/login"
              className="bg-white text-green-700 hover:bg-gray-100 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl inline-flex items-center justify-center"
            >
              Already a Vendor? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">AfriMercato</h4>
              <p className="text-sm">African groceries delivered to your door across the UK.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-yellow-400">Browse Stores</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-yellow-400">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Partners</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/partner" className="hover:text-yellow-400">Become a Vendor</Link></li>
                <li><Link to="/register?role=rider" className="hover:text-yellow-400">Become a Rider</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400">About</a></li>
                <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 AfriMercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

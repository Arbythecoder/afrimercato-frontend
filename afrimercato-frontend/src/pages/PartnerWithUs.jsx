import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBagIcon,
  ChartBarIcon,
  TruckIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { isFeatureEnabled } from '../config/features'

export default function PartnerWithUs() {
  const [activeTab, setActiveTab] = useState('all')

  // MVP feature checks
  const riderEnabled = isFeatureEnabled('RIDER_REGISTRATION')
  const pickerEnabled = isFeatureEnabled('PICKER_REGISTRATION')

  // Partner types with their unique benefits
  const partnerTypes = [
    {
      id: 'vendor',
      title: 'Become a Vendor',
      subtitle: 'Sell your products to thousands',
      description: 'Open your store on Afrimercato and reach customers across the UK. We handle delivery, you focus on quality.',
      icon: ShoppingBagIcon,
      gradient: 'from-[#00897B] to-[#00695C]',
      lightBg: 'bg-teal-50',
      textColor: 'text-[#00897B]',
      stats: [
        { value: '4,320+', label: 'Active Vendors' },
        { value: '£2.5M+', label: 'Monthly Sales' },
        { value: '15%', label: 'Commission Only' }
      ],
      benefits: [
        { icon: ChartBarIcon, text: 'Real-time sales analytics & insights' },
        { icon: UserGroupIcon, text: 'Access to 50,000+ customers' },
        { icon: TruckIcon, text: 'We handle all deliveries' },
        { icon: DevicePhoneMobileIcon, text: 'Easy mobile store management' },
        { icon: ShieldCheckIcon, text: 'Secure payment processing' },
        { icon: SparklesIcon, text: 'Marketing & promotion support' }
      ],
      cta: 'Start Selling Today',
      ctaLink: '/register?role=vendor',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
      enabled: true
    },
    {
      id: 'rider',
      title: 'Become a Rider',
      subtitle: 'Deliver and earn flexibly',
      description: 'Join our delivery fleet and earn competitive rates. Work when you want, where you want.',
      icon: TruckIcon,
      gradient: 'from-[#F5A623] to-[#FF8A00]',
      lightBg: 'bg-amber-50',
      textColor: 'text-[#F5A623]',
      stats: [
        { value: '£15-25', label: 'Per Hour Average' },
        { value: '100%', label: 'Flexible Hours' },
        { value: 'Weekly', label: 'Payouts' }
      ],
      benefits: [
        { icon: ClockIcon, text: 'Work your own schedule' },
        { icon: BanknotesIcon, text: 'Competitive pay per delivery' },
        { icon: MapPinIcon, text: 'Deliver in your local area' },
        { icon: CalendarDaysIcon, text: 'Weekly guaranteed payouts' },
        { icon: ShieldCheckIcon, text: 'Insurance coverage included' },
        { icon: DevicePhoneMobileIcon, text: 'Easy-to-use rider app' }
      ],
      cta: riderEnabled ? 'Start Delivering' : 'Coming Q2 2026',
      ctaLink: '/register?role=rider',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      enabled: riderEnabled,
      comingSoon: !riderEnabled
    },
    {
      id: 'picker',
      title: 'Become a Picker',
      subtitle: 'Pick orders, earn money',
      description: 'Help prepare customer orders at partner stores. Perfect part-time opportunity with flexible shifts.',
      icon: CheckCircleIcon,
      gradient: 'from-[#6366F1] to-[#4F46E5]',
      lightBg: 'bg-indigo-50',
      textColor: 'text-[#6366F1]',
      stats: [
        { value: '£12-18', label: 'Per Hour' },
        { value: 'Flexible', label: 'Shift Times' },
        { value: 'Quick', label: 'Training' }
      ],
      benefits: [
        { icon: ClockIcon, text: 'Flexible shift scheduling' },
        { icon: MapPinIcon, text: 'Work at stores near you' },
        { icon: BanknotesIcon, text: 'Competitive hourly pay' },
        { icon: HeartIcon, text: 'Supportive team environment' },
        { icon: SparklesIcon, text: 'Performance bonuses' },
        { icon: ShieldCheckIcon, text: 'Full training provided' }
      ],
      cta: pickerEnabled ? 'Start Picking' : 'Coming Q2 2026',
      ctaLink: '/register?role=picker',
      image: 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=600&q=80',
      enabled: pickerEnabled,
      comingSoon: !pickerEnabled
    }
  ]

  // Steps to get started
  const commonSteps = [
    { number: 1, title: 'Sign Up Online', description: 'Complete our simple registration form with your details' },
    { number: 2, title: 'Get Verified', description: 'We review your application (usually within 24-48 hours)' },
    { number: 3, title: 'Complete Training', description: 'Access our quick onboarding materials and resources' },
    { number: 4, title: 'Start Earning', description: 'Begin working and earning money on your terms!' }
  ]

  const filteredPartners = activeTab === 'all'
    ? partnerTypes
    : partnerTypes.filter(p => p.id === activeTab)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <path d="M8 8L32 32M32 8L8 32" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <span className="text-xl font-bold text-gray-900">Afrimercato</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-[#00897B] transition-colors">Home</Link>
              <Link to="/stores" className="hidden sm:block text-gray-600 hover:text-[#00897B] transition-colors">Stores</Link>
              <Link to="/login" className="bg-[#00897B] hover:bg-[#00695C] text-white px-5 py-2 rounded-full font-medium transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F5A623] via-[#FFB84D] to-[#F5A623] py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00897B]/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
          >
            <SparklesIcon className="w-5 h-5 text-gray-900" />
            <span className="text-gray-900 font-medium">Join the Afrimercato Family</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Partner With Us &{' '}
            <span className="relative inline-block">
              <span className="text-[#00897B]">Start Earning</span>
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 200 12"
              >
                <motion.path
                  d="M2 10C50 2 150 2 198 10"
                  stroke="#00897B"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-800 mb-10 max-w-3xl mx-auto"
          >
            Whether you're a vendor, rider, or picker — there's a place for you at Afrimercato.
            Join our growing community and build your income on your terms.
          </motion.p>

          {/* Partner Type Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1 p-1.5 bg-white/30 backdrop-blur-sm rounded-full mb-8"
          >
            {[
              { id: 'all', label: 'All Partners' },
              { id: 'vendor', label: 'Vendors' },
              { id: 'rider', label: 'Riders' },
              { id: 'picker', label: 'Pickers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 sm:px-6 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#00897B] text-white shadow-lg'
                    : 'text-gray-800 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '5,000+', label: 'Active Partners' },
              { value: '£3M+', label: 'Paid to Partners' },
              { value: '50+', label: 'UK Cities' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-700">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partner Cards Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-16">
            {filteredPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl overflow-hidden ${index % 2 === 0 ? 'bg-white' : partner.lightBg} shadow-xl`}
              >
                <div className="grid lg:grid-cols-2">
                  {/* Content Side */}
                  <div className={`p-8 sm:p-10 lg:p-12 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className={`inline-flex items-center gap-2 ${partner.lightBg} px-4 py-2 rounded-full mb-4`}>
                      <partner.icon className={`w-5 h-5 ${partner.textColor}`} />
                      <span className={`font-semibold ${partner.textColor}`}>{partner.subtitle}</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{partner.title}</h2>
                    <p className="text-lg text-gray-600 mb-6">{partner.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {partner.stats.map((stat, i) => (
                        <div key={i} className={`${partner.lightBg} rounded-xl p-4 text-center`}>
                          <div className={`text-xl sm:text-2xl font-bold ${partner.textColor}`}>{stat.value}</div>
                          <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                      {partner.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${partner.lightBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <benefit.icon className={`w-4 h-4 ${partner.textColor}`} />
                          </div>
                          <span className="text-gray-700 text-sm">{benefit.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button - Disabled for coming soon features */}
                    {partner.comingSoon ? (
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-8 py-4 rounded-xl font-bold text-lg cursor-not-allowed">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {partner.cta}
                        </div>
                        <p className="text-sm text-gray-500">
                          🚀 Registration opening soon! Sign up as a customer to get notified.
                        </p>
                      </div>
                    ) : (
                      <Link
                        to={partner.ctaLink}
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${partner.gradient} text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105`}
                      >
                        {partner.cta}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>

                  {/* Image Side */}
                  <div className={`relative h-64 lg:h-auto min-h-[300px] ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${partner.gradient} opacity-90`}></div>
                    <img
                      src={partner.image}
                      alt={partner.title}
                      className="w-full h-full object-cover mix-blend-overlay"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white p-8">
                        <partner.icon className="w-20 h-20 mx-auto mb-4 opacity-80" />
                        <p className="text-2xl sm:text-3xl font-bold">{partner.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Getting Started is Easy
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Four simple steps to become an Afrimercato partner
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {commonSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                {i < commonSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#00897B] to-[#F5A623]"></div>
                )}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#00897B] to-[#00695C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl font-bold text-white">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Apply Cards */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F5A623] via-[#FFB84D] to-[#F5A623]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-800 max-w-2xl mx-auto"
            >
              Choose your path and start your journey with Afrimercato today
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {partnerTypes.map((partner, i) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 shadow-xl text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${partner.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <partner.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{partner.subtitle}</p>
                <Link
                  to={partner.ctaLink}
                  className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${partner.gradient} text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg`}
                >
                  Apply Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How much does it cost to join as a partner?',
                a: "Joining Afrimercato is completely free! For vendors, we charge a small commission (12-15%) on each sale. Riders and pickers earn money — they don't pay anything."
              },
              {
                q: 'How quickly can I start earning?',
                a: 'After completing registration and verification (usually 24-48 hours), you can start immediately. Vendors can list products right away, riders can accept deliveries, and pickers can start taking shifts.'
              },
              {
                q: 'What areas do you cover?',
                a: "We currently operate across 50+ cities in the UK including London, Birmingham, Manchester, Bristol, Leeds, and many more. We're expanding rapidly!"
              },
              {
                q: 'How and when do I get paid?',
                a: 'Vendors receive weekly payouts via bank transfer. Riders are paid weekly with performance bonuses. Pickers receive hourly pay processed weekly.'
              },
              {
                q: 'Do I need any special equipment?',
                a: 'Vendors just need a smartphone to manage their store. Riders need their own vehicle (car, bike, or motorcycle). Pickers just need to be ready to work — we provide all necessary tools!'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <path d="M8 8L32 32M32 8L8 32" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <span className="text-xl font-bold">Afrimercato</span>
              </Link>
              <p className="text-gray-400 text-sm">African groceries delivered to your door across the UK.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/stores" className="hover:text-[#F5A623] transition-colors">Browse Stores</Link></li>
                <li><Link to="/delivery" className="hover:text-[#F5A623] transition-colors">Delivery Info</Link></li>
                <li><Link to="/about" className="hover:text-[#F5A623] transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Partners</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/register?role=vendor" className="hover:text-[#F5A623] transition-colors">Become a Vendor</Link></li>
                <li><Link to="/register?role=rider" className="hover:text-[#F5A623] transition-colors">Become a Rider</Link></li>
                <li><Link to="/register?role=picker" className="hover:text-[#F5A623] transition-colors">Become a Picker</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-[#F5A623] transition-colors">Contact Us</Link></li>
                <li><a href="mailto:info@afrimercato.co.uk" className="hover:text-[#F5A623] transition-colors">info@afrimercato.co.uk</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 Afrimercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

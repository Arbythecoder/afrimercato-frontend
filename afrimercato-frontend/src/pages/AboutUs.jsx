/**
 * AFRIMERCATO - About Us Page
 * Premium design matching the brand identity
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AboutUs() {
  const teamMembers = [
    {
      name: 'Efezino',
      role: 'Founder & CEO',
      initials: 'EF',
      bio: 'Visionary leader building Afrimercato into the UK\'s leading African grocery marketplace.'
    },
    {
      name: 'Abigeal',
      role: 'Lead Software Engineer',
      initials: 'AB',
      bio: 'Building the technology that powers Afrimercato — from backend APIs to the customer experience.'
    },
    {
      name: 'Coming Soon',
      role: 'Co-Founder',
      initials: '+',
      bio: 'This seat is reserved for our next Co-Founder.',
      placeholder: true
    },
    {
      name: 'Coming Soon',
      role: 'Role TBD',
      initials: '+',
      bio: 'We\'re growing the team — this role is being defined.',
      placeholder: true
    },
    {
      name: 'Coming Soon',
      role: 'Role TBD',
      initials: '+',
      bio: 'We\'re growing the team — this role is being defined.',
      placeholder: true
    }
  ]

  const milestones = [
    { year: '2022', title: 'Founded', description: 'Afrimercato launched in Manchester' },
    { year: '2023', title: 'Expansion', description: 'Extended to 15+ UK cities' },
    { year: '2024', title: '4,320+ Vendors', description: 'Trusted by thousands of vendors' },
    { year: '2025', title: 'Growing', description: 'Serving communities nationwide' }
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
              <Link to="/about" className="text-[#00897B] font-medium">About us</Link>
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
      <section className="relative bg-gradient-to-br from-[#F5A623] to-[#FF9800] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            About Afrimercato
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-800 max-w-3xl mx-auto"
          >
            We're on a mission to bring authentic African products and groceries
            to every doorstep across the United Kingdom.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0 120L1440 120L1440 0C1200 80 800 40 400 60C200 70 0 40 0 0L0 120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Our Story — Full Brand Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                Afrimercato was born from a simple but powerful observation.
              </p>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                A Nigerian living abroad noticed how difficult it was for people outside Africa — and
                even within Africa — to reliably access authentic African goods. Local stores struggled
                with visibility. Customers struggled with trust and convenience. Delivery systems were
                fragmented, expensive, or unfair.
              </p>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                Yet the demand was clear. And the businesses were ready — they just lacked the right
                digital bridge.
              </p>
              <p className="text-[#00897B] mb-4 text-xl font-semibold leading-relaxed">
                Afrimercato is that bridge.
              </p>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                Afrimercato is not just another delivery app. It is a fair, flexible, multi-sided
                marketplace designed to respect how African businesses already operate — while giving
                them modern tools to grow.
              </p>
              <p className="text-gray-500 text-base italic leading-relaxed">
                We are currently in a guided testing phase to ensure speed, reliability, and strong
                foundations before scaling to new regions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600"
                alt="African marketplace"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#00897B] text-white p-6 rounded-xl shadow-xl">
                <p className="text-3xl font-bold">4,320+</p>
                <p className="text-sm opacity-90">Trusted Vendors</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gradient-to-br from-[#00897B] to-[#00695C] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Vision & Mission</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Our Vision</h3>
              <p className="text-xl leading-relaxed">
                To be the digital home where African and local businesses thrive — connecting stores,
                customers, and communities worldwide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Our Mission</h3>
              <p className="text-xl leading-relaxed">
                Afrimercato empowers local and international merchants to sell, fulfil, and grow
                through a fair, flexible, and trusted marketplace.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">Who It's For</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Afrimercato serves every side of the marketplace — from the stores that sell, to the people who deliver, to the customers who enjoy.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏪',
                title: 'Stores',
                description: 'You control your business, your delivery, your costs.'
              },
              {
                icon: '🚴',
                title: 'Riders & Pickers',
                description: 'Work independently. Choose your stores. Pay only when you earn.'
              },
              {
                icon: '📈',
                title: 'Investors',
                description: 'Asset-light, multi-sided marketplace with global expansion potential.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤝',
                title: 'Fairness',
                description: 'We build systems where every participant — store, rider, picker, and customer — is treated with respect and transparency.'
              },
              {
                icon: '🌍',
                title: 'Community First',
                description: 'We believe in supporting local businesses and connecting communities through authentic African commerce.'
              },
              {
                icon: '🔧',
                title: 'Flexibility',
                description: 'Our platform respects how African businesses already operate — and gives them modern tools to grow on their own terms.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2"
          >
            Our <span className="text-[#F5A623]">Journey</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-center mb-12"
          >
            From idea to marketplace — every milestone matters.
          </motion.p>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#00897B] via-[#F5A623] to-[#00897B]" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Year bubble */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00897B] to-[#00695C] flex flex-col items-center justify-center text-white z-10 shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300 ring-4 ring-white">
                    <span className="text-xs font-medium opacity-80">year</span>
                    <span className="text-2xl font-extrabold leading-none">{milestone.year.slice(2)}</span>
                  </div>
                  {/* Card */}
                  <div className="bg-white rounded-2xl shadow-md p-5 w-full group-hover:shadow-xl transition-shadow border border-gray-100">
                    <p className="text-[#F5A623] font-bold text-base mb-1">{milestone.year}</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gradient-to-br from-[#00897B]/5 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-2"
          >
            Meet the <span className="text-[#00897B]">Founders</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-center mb-12 max-w-2xl mx-auto"
          >
            The people building Afrimercato — and the seats still to be filled.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={`${member.name}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  member.placeholder
                    ? 'border-2 border-dashed border-gray-300 bg-white hover:border-[#F5A623] hover:shadow-md'
                    : 'bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1'
                }`}
              >
                {/* Avatar panel */}
                <div className={`relative w-full h-44 flex items-center justify-center overflow-hidden ${
                  member.placeholder
                    ? 'bg-gray-50'
                    : index === 0
                      ? 'bg-gradient-to-br from-[#00897B] via-[#00695C] to-[#004D40]'
                      : 'bg-gradient-to-br from-[#F5A623] via-[#e09520] to-[#c27a10]'
                }`}>
                  {!member.placeholder && (
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-4 text-6xl">✦</div>
                      <div className="absolute bottom-2 left-4 text-4xl">✦</div>
                    </div>
                  )}
                  <span className={`text-7xl font-extrabold z-10 select-none ${
                    member.placeholder ? 'text-gray-300' : 'text-white drop-shadow-md'
                  }`}>
                    {member.initials}
                  </span>
                </div>

                <div className="p-6">
                  {member.placeholder ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Open Seat
                      </div>
                      <h3 className="text-lg font-bold text-gray-400 mb-1">{member.role}</h3>
                      <p className="text-gray-400 text-sm">{member.bio}</p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Founder
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-0.5">{member.name}</h3>
                      <p className="text-[#00897B] font-semibold text-sm mb-3">{member.role}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00897B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of happy customers who trust Afrimercato for their grocery needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/stores"
              className="bg-white text-[#00897B] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Browse Stores
            </Link>
            <Link
              to="/partner"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#00897B] transition-all"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Afrimercato</h4>
              <p className="text-gray-400 text-sm">Fresh African groceries delivered across the UK.</p>
              <p className="text-gray-400 text-sm mt-2">A fair, flexible marketplace for African commerce.</p>
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
              <p className="text-gray-400 text-sm">+44 7778 285855</p>
              <p className="text-gray-400 text-sm mt-2">info@afrimercato.co.uk</p>
              <p className="text-gray-400 text-sm mt-2">Manchester, United Kingdom</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 Afrimercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

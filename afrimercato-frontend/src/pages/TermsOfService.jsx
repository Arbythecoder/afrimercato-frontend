import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Terms of Service Page
 * Legal terms for using Afrimercato platform
 */
function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90"
          >
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Afrimercato's website and services, you accept and agree to be bound by the
              terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Afrimercato provides an online marketplace connecting:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Customers seeking to purchase African groceries and products</li>
              <li>Vendors offering products for sale</li>
              <li>Delivery riders providing fulfillment services</li>
              <li>Pickers assisting with order preparation</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>3.1 Registration:</strong> You must provide accurate and complete information when creating an account.</p>
              <p><strong>3.2 Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
              <p><strong>3.3 Age Requirement:</strong> You must be at least 18 years old to use our services.</p>
              <p><strong>3.4 Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </div>
          </section>

          {/* For Customers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Customer Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>4.1 Orders:</strong> All orders are subject to availability and acceptance by vendors.</p>
              <p><strong>4.2 Pricing:</strong> Prices are set by vendors and may change without notice.</p>
              <p><strong>4.3 Payment:</strong> Payment is required at the time of order placement.</p>
              <p><strong>4.4 Delivery:</strong> Delivery times are estimates and not guaranteed.</p>
              <p><strong>4.5 Cancellations:</strong> Orders may be cancelled before vendor acceptance.</p>
              <p><strong>4.6 Returns:</strong> Return policy is determined by individual vendors.</p>
            </div>
          </section>

          {/* For Vendors */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Vendor Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>5.1 Registration:</strong> Vendors must provide valid business registration details.</p>
              <p><strong>5.2 Product Listings:</strong> Vendors are responsible for accurate product descriptions and pricing.</p>
              <p><strong>5.3 Order Fulfillment:</strong> Vendors must fulfill accepted orders in a timely manner.</p>
              <p><strong>5.4 Quality Standards:</strong> All products must meet UK food safety standards.</p>
              <p><strong>5.5 Commission:</strong> Afrimercato charges a commission on each sale as per vendor agreement.</p>
              <p><strong>5.6 Payments:</strong> Vendor payments are processed according to payment schedule.</p>
            </div>
          </section>

          {/* For Riders */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Rider & Picker Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p><strong>6.1 Independent Contractor:</strong> Riders and pickers are independent contractors, not employees.</p>
              <p><strong>6.2 Requirements:</strong> Must have valid vehicle documentation and insurance.</p>
              <p><strong>6.3 Background Check:</strong> May be subject to background verification.</p>
              <p><strong>6.4 Service Quality:</strong> Must maintain professional service standards.</p>
              <p><strong>6.5 Earnings:</strong> Compensation is based on completed deliveries.</p>
            </div>
          </section>

          {/* Prohibited Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Use the platform for any illegal purpose</li>
              <li>Post false, inaccurate or misleading information</li>
              <li>Interfere with the proper functioning of the platform</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Harass, abuse or harm other users</li>
              <li>Engage in fraudulent activity</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on Afrimercato, including text, graphics, logos, images, and software, is the property of
              Afrimercato or its content suppliers and protected by UK and international copyright laws. You may not
              reproduce, distribute, or create derivative works without express written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Afrimercato acts as a marketplace platform connecting users. We are not responsible for the quality,
              safety, or legality of products listed, the accuracy of listings, the ability of vendors to sell items,
              or the ability of customers to pay. To the fullest extent permitted by law, Afrimercato shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless Afrimercato and its affiliates from any claims, losses,
              damages, liabilities, and expenses arising out of your use of the service, violation of these terms,
              or violation of any rights of another.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these terms or use of Afrimercato shall be resolved through good faith
              negotiation. If negotiation fails, disputes shall be subject to the exclusive jurisdiction of the
              courts of England and Wales.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of material changes via
              email or platform notification. Continued use of the service after changes constitutes acceptance of
              the modified terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> legal@afrimercato.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Afrimercato Ltd, United Kingdom</p>
            </div>
          </section>

          {/* Back Link */}
          <div className="pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center text-afri-green hover:text-afri-green-dark font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TermsOfService;

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Privacy Policy Page
 * GDPR-compliant privacy policy for Afrimercato
 */
function PrivacyPolicy() {
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
            Privacy Policy
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
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Afrimercato. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit our
              website or use our services, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect, use, store and transfer different kinds of personal data about you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Identity Data:</strong> Name, username, date of birth</li>
              <li><strong>Contact Data:</strong> Email address, telephone numbers, billing and delivery addresses</li>
              <li><strong>Financial Data:</strong> Payment card details (processed securely by our payment providers)</li>
              <li><strong>Transaction Data:</strong> Details about payments and products/services purchased</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Profile Data:</strong> Username, purchases, preferences, feedback</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
              <li><strong>Marketing Data:</strong> Your preferences in receiving marketing from us</li>
              <li><strong>Location Data:</strong> For delivery services and finding nearby stores</li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Data</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We will only use your personal data when the law allows us to. Most commonly, we use your data to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Process and deliver your orders</li>
              <li>Manage payments, fees, and charges</li>
              <li>Collect and recover money owed to us</li>
              <li>Send you service, support and administrative messages</li>
              <li>Respond to your comments, questions and requests</li>
              <li>Improve our website, products and services</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may share your personal data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Vendors:</strong> To fulfill your orders</li>
              <li><strong>Delivery Partners:</strong> To deliver your orders</li>
              <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
              <li><strong>Service Providers:</strong> For analytics, email services, and customer support</li>
              <li><strong>Legal Authorities:</strong> When required by law</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We never sell your personal data to third parties.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally
              lost, used or accessed in an unauthorized way, altered or disclosed. All payment information is encrypted
              using SSL technology. We limit access to your personal data to those employees, agents, contractors and
              other third parties who have a business need to know.
            </p>
          </section>

          {/* Your Rights (GDPR) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights Under GDPR</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Under UK GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@afrimercato.com" className="text-afri-green hover:underline">
                privacy@afrimercato.com
              </a>
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for,
              including for the purposes of satisfying any legal, accounting, or reporting requirements. Account data is
              retained for 7 years after account closure for legal and accounting purposes. Order data is retained for 6
              years to comply with UK tax law.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website uses cookies to distinguish you from other users. This helps us provide you with a good
              experience when you browse our website and also allows us to improve our site. You can manage your cookie
              preferences at any time through your browser settings or our cookie consent tool.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@afrimercato.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Afrimercato Ltd, United Kingdom</p>
              <p className="text-gray-700"><strong>Data Protection Officer:</strong> dpo@afrimercato.com</p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the
              new privacy policy on this page and updating the "Last updated" date.
            </p>
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

export default PrivacyPolicy;

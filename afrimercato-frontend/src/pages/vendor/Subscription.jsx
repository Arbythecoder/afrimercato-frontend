import { useState, useEffect } from 'react'
import { subscriptionAPI } from '../../services/api'

function Subscription() {
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getMySubscription(),
      ])

      if (plansResponse.success) {
        setPlans(plansResponse.data.plans)
      }
      if (subscriptionResponse.success) {
        setCurrentSubscription(subscriptionResponse.data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId) => {
    try {
      setProcessing(true)
      const response = await subscriptionAPI.subscribe({ planId })
      if (response.success) {
        alert('Subscription activated successfully!')
        fetchSubscriptionData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to subscribe')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      setProcessing(true)
      const response = await subscriptionAPI.cancel()
      if (response.success) {
        alert('Subscription cancelled successfully')
        fetchSubscriptionData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel subscription')
    } finally {
      setProcessing(false)
    }
  }

  const getPlanFeatures = (planName) => {
    const features = {
      Free: [
        'Up to 50 products',
        'Basic analytics',
        'Email support',
        '5% transaction fee',
        'Standard listing',
      ],
      Starter: [
        'Up to 200 products',
        'Advanced analytics',
        'Priority email support',
        '3% transaction fee',
        'Featured listing',
        'Promotional tools',
      ],
      Professional: [
        'Unlimited products',
        'Advanced analytics & reports',
        '24/7 priority support',
        '2% transaction fee',
        'Premium listing',
        'Marketing tools',
        'Custom branding',
        'API access',
      ],
      Enterprise: [
        'Everything in Professional',
        'Dedicated account manager',
        '1% transaction fee',
        'White-label solution',
        'Custom integrations',
        'Advanced security',
        'SLA guarantee',
      ],
    }
    return features[planName] || []
  }

  const getPlanColor = (planName) => {
    const colors = {
      Free: 'from-gray-400 to-gray-500',
      Starter: 'from-blue-500 to-blue-600',
      Professional: 'from-afri-green to-afri-green-dark',
      Enterprise: 'from-purple-600 to-purple-700',
    }
    return colors[planName] || 'from-gray-400 to-gray-500'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-afri-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-afri-green to-afri-green-dark bg-clip-text text-transparent">
          Subscription Plans
        </h1>
        <p className="text-afri-gray-600 mt-2">Choose the perfect plan for your business</p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-afri-green to-afri-green-dark rounded-xl shadow-2xl p-6 text-white animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Current Plan: {currentSubscription.plan?.name}</h3>
              <p className="opacity-90">
                {currentSubscription.status === 'active' ? (
                  <>
                    {currentSubscription.plan?.interval === 'monthly' ? 'Renews' : 'Renews'} on{' '}
                    {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </>
                ) : (
                  `Status: ${currentSubscription.status}`
                )}
              </p>
            </div>
            {currentSubscription.status === 'active' && currentSubscription.plan?.name !== 'Free' && (
              <button
                onClick={handleCancelSubscription}
                disabled={processing}
                className="px-6 py-3 bg-white text-afri-green rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <div
            key={plan._id}
            className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn ${
              currentSubscription?.plan?._id === plan._id ? 'ring-4 ring-afri-green' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Popular Badge */}
            {plan.name === 'Professional' && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-afri-yellow to-afri-yellow-dark text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                POPULAR
              </div>
            )}

            {/* Header */}
            <div className={`bg-gradient-to-r ${getPlanColor(plan.name)} text-white p-6`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">£{plan.price}</span>
                <span className="ml-2 opacity-90">/{plan.interval}</span>
              </div>
            </div>

            {/* Features */}
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {getPlanFeatures(plan.name).map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-afri-green mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-afri-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {currentSubscription?.plan?._id === plan._id ? (
                <div className="bg-afri-green text-white text-center py-3 rounded-lg font-semibold">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan._id)}
                  disabled={processing || plan.price === 0}
                  className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    plan.name === 'Professional'
                      ? 'bg-gradient-to-r from-afri-green to-afri-green-dark text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-afri-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {processing ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mt-12">
        <h2 className="text-3xl font-bold text-center text-afri-gray-900 mb-8">
          Why Upgrade to Premium?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
              📈
            </div>
            <h3 className="text-xl font-bold text-center text-afri-gray-900 mb-2">Grow Your Sales</h3>
            <p className="text-center text-afri-gray-600">
              Get featured listings and access to promotional tools to boost your visibility and sales.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-afri-green to-afri-green-dark rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
              📊
            </div>
            <h3 className="text-xl font-bold text-center text-afri-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-center text-afri-gray-600">
              Make data-driven decisions with comprehensive reports and insights about your business.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
              🎨
            </div>
            <h3 className="text-xl font-bold text-center text-afri-gray-900 mb-2">Custom Branding</h3>
            <p className="text-center text-afri-gray-600">
              Stand out with custom branding options and create a unique shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-afri-gray-900 mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 max-w-3xl mx-auto">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-afri-gray-900">Can I change my plan anytime?</span>
              <svg
                className="w-5 h-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="p-4 text-afri-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-afri-gray-900">What payment methods do you accept?</span>
              <svg
                className="w-5 h-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="p-4 text-afri-gray-600">
              We accept all major credit cards, debit cards, and bank transfers. All payments are processed securely through our payment gateway.
            </p>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-afri-gray-900">Is there a contract or commitment?</span>
              <svg
                className="w-5 h-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="p-4 text-afri-gray-600">
              No long-term contracts! All plans are month-to-month and you can cancel at any time without penalty.
            </p>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-afri-gray-900">What happens if I cancel?</span>
              <svg
                className="w-5 h-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="p-4 text-afri-gray-600">
              Your subscription will remain active until the end of your current billing period. After that, you'll be automatically moved to the Free plan.
            </p>
          </details>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Subscription

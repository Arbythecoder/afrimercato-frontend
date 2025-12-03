import { useState, useEffect } from 'react'
import { subscriptionAPI } from '../services/api'

function Subscription() {
  const [plans, setPlans] = useState([])
  const [mySubscription, setMySubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getMySubscription().catch(() => ({ data: { data: null } }))
      ])

      if (plansRes.data.success) {
        setPlans(plansRes.data.data.plans || [])
      }

      if (subRes.data?.data) {
        setMySubscription(subRes.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId) => {
    try {
      await subscriptionAPI.subscribe({ planId })
      fetchData()
      alert('Subscription upgraded successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to subscribe')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  const currentPlanId = mySubscription?.plan

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mt-3 text-lg">Unlock premium features for your Afrimercato marketplace</p>
      </div>

      {/* Current Plan Badge */}
      {mySubscription && (
        <div className="bg-gradient-to-r from-afri-green to-afri-green-dark rounded-xl p-6 text-white text-center">
          <p className="text-sm font-medium mb-1">CURRENT PLAN</p>
          <p className="text-3xl font-bold capitalize">{mySubscription.plan} Plan</p>
          {mySubscription.endDate && (
            <p className="text-sm mt-2 opacity-90">
              Valid until {new Date(mySubscription.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId
          const isUpgrade = !isCurrentPlan && !isFree(currentPlanId, plan.id)

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${
                plan.id === 'premium' ? 'border-4 border-afri-yellow scale-105' : 'border border-gray-200'
              }`}
            >
              {/* Recommended Badge */}
              {plan.id === 'premium' && (
                <div className="absolute top-0 right-0 bg-afri-yellow text-gray-900 px-4 py-1 text-xs font-bold rounded-bl-lg">
                  RECOMMENDED
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-afri-green text-white px-4 py-1 text-xs font-bold rounded-br-lg">
                  CURRENT PLAN
                </div>
              )}

              <div className="p-6">
                {/* Plan Icon */}
                <div className="text-4xl mb-4">
                  {plan.id === 'free' && '🌱'}
                  {plan.id === 'standard' && '🚀'}
                  {plan.id === 'premium' && '⭐'}
                  {plan.id === 'enterprise' && '👑'}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-4xl font-bold text-afri-green">
                        £{plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {/* Products */}
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-600">
                      {plan.features.maxProducts === 'unlimited' ? 'Unlimited' : plan.features.maxProducts} products
                    </span>
                  </div>

                  {/* Orders */}
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-600">
                      {plan.features.maxMonthlyOrders === 'unlimited' ? 'Unlimited' : plan.features.maxMonthlyOrders} orders/month
                    </span>
                  </div>

                  {/* Marketplace Features */}
                  {plan.features.jumiaIntegration?.enabled ? (
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm text-gray-600">
                        Marketplace {plan.features.jumiaIntegration.tier === 'premium' ? 'Premium' : 'Standard'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-2">✗</span>
                      <span className="text-sm text-gray-400">No marketplace features</span>
                    </div>
                  )}

                  {/* Advanced Features */}
                  {plan.features.kongaIntegration?.enabled ? (
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm text-gray-600">
                        Advanced {plan.features.kongaIntegration.tier === 'premium' ? 'Premium' : 'Standard'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-2">✗</span>
                      <span className="text-sm text-gray-400">No advanced features</span>
                    </div>
                  )}

                  {/* Commission */}
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-600">
                      {plan.features.commissionRate}% commission
                    </span>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-600">
                      {plan.features.analytics} analytics
                    </span>
                  </div>

                  {/* Support */}
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-600">
                      {plan.features.customerSupport} support
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      plan.id === 'premium'
                        ? 'bg-gradient-to-r from-afri-yellow to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-afri-yellow'
                        : 'bg-afri-green text-white hover:bg-afri-green-dark'
                    }`}
                  >
                    {isUpgrade ? 'Upgrade Now' : 'Get Started'}
                  </button>
                )}
              </div>

              {/* Premium Features for Premium Plan */}
              {plan.id === 'premium' && (
                <div className="bg-gradient-to-r from-afri-yellow to-yellow-500 p-4">
                  <p className="text-xs font-bold text-gray-900 mb-2">PREMIUM FEATURES:</p>
                  <ul className="text-xs text-gray-900 space-y-1">
                    <li>• 5 promotional spots/month on Afrimercato</li>
                    <li>• 10 featured products simultaneously</li>
                    <li>• Flash sale access</li>
                    <li>• Dedicated account manager</li>
                    <li>• Priority 24/7 support</li>
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Marketplace Comparison */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Marketplace Integration Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900">Standard</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-900 bg-afri-yellow bg-opacity-10">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Product Listing</td>
                <td className="py-3 px-4 text-center text-green-600">✓</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Inventory Sync</td>
                <td className="py-3 px-4 text-center text-green-600">✓</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Order Management</td>
                <td className="py-3 px-4 text-center text-green-600">✓</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Promotional Spots</td>
                <td className="py-3 px-4 text-center text-gray-400">✗</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">5/month</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Featured Products</td>
                <td className="py-3 px-4 text-center text-gray-400">✗</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">10 items</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Flash Sales</td>
                <td className="py-3 px-4 text-center text-gray-400">✗</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Category Placement</td>
                <td className="py-3 px-4 text-center text-gray-600">Standard</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">Premium</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Commission Rate</td>
                <td className="py-3 px-4 text-center text-gray-600">8%</td>
                <td className="py-3 px-4 text-center text-green-600 font-semibold bg-afri-yellow bg-opacity-5">6%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-gray-700">Account Manager</td>
                <td className="py-3 px-4 text-center text-gray-400">✗</td>
                <td className="py-3 px-4 text-center text-green-600 bg-afri-yellow bg-opacity-5">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 py-3 border-b border-gray-200">
              Can I upgrade or downgrade my plan anytime?
            </summary>
            <p className="text-gray-600 text-sm mt-3">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 py-3 border-b border-gray-200">
              What payment methods do you accept?
            </summary>
            <p className="text-gray-600 text-sm mt-3">
              We accept all major payment methods including cards, bank transfers, and mobile money.
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-semibold text-gray-900 py-3 border-b border-gray-200">
              How does the marketplace integration work?
            </summary>
            <p className="text-gray-600 text-sm mt-3">
              Once subscribed, your products are automatically listed on the Afrimercato marketplace with enhanced visibility. All orders are managed directly in your vendor dashboard with real-time sync.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}

function isFree(currentPlan, targetPlan) {
  if (!currentPlan) return true
  const hierarchy = ['free', 'standard', 'premium', 'enterprise']
  return hierarchy.indexOf(currentPlan) >= hierarchy.indexOf(targetPlan)
}

export default Subscription

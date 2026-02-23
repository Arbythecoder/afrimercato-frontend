import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'

function Earnings() {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await vendorAPI.getEarnings()
      if (response.success) {
        setEarnings(response.data)
      } else {
        setError('Failed to load earnings data')
      }
    } catch (err) {
      console.error('Earnings fetch error:', err)
      setError(err.response?.data?.message || 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Earnings & Payouts</h1>
      </div>

      {/* Payout Notice Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Manual Payouts (Beta)</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              {earnings?.payoutNotice || 'Payouts are processed weekly via bank transfer during beta. Ensure your bank details are updated in Settings.'}
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Your Earnings</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            £{earnings?.totalEarnings?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            From {earnings?.completedOrdersCount || 0} completed orders
          </p>
        </div>

        {/* Pending Earnings */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            £{earnings?.pendingEarnings?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            From {earnings?.pendingOrdersCount || 0} pending orders
          </p>
        </div>

        {/* Platform Commission */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Commission Paid</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            £{earnings?.totalCommission?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {earnings?.commissionRate || 12}% platform fee
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            £{earnings?.totalRevenue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Before commission
          </p>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Breakdown</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Total Order Revenue</span>
            <span className="font-bold text-gray-900">£{earnings?.totalRevenue?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Platform Commission ({earnings?.commissionRate || 12}%)</span>
            <span className="font-bold text-red-600">- £{earnings?.totalCommission?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-4">
            <span className="font-bold text-gray-900">Your Earnings</span>
            <span className="font-bold text-green-600 text-xl">£{earnings?.totalEarnings?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Bank Details Reminder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bank Account for Payouts</h2>
        <p className="text-gray-600 mb-4">
          Ensure your bank details are up to date in Settings to receive weekly payouts.
        </p>
        <a
          href="/vendor/settings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Update Bank Details
        </a>
      </div>

      {/* How Payouts Work */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How Payouts Work</h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Orders are completed and payment is confirmed</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>Platform commission (12%) is automatically calculated</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>Your earnings accumulate in your account</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span>Payouts are processed every <strong>Friday</strong> via bank transfer</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default Earnings

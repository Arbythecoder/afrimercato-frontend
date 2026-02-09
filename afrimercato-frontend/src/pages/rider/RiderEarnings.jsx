import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function RiderEarnings() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('week')
  const [earnings, setEarnings] = useState({
    total: 0,
    deliveries: 0,
    tips: 0,
    bonus: 0
  })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
  }, [period])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockData = {
          week: {
            total: 336.50,
            deliveries: 295.00,
            tips: 31.50,
            bonus: 10.00,
            count: 42
          },
          month: {
            total: 1420.75,
            deliveries: 1250.00,
            tips: 120.75,
            bonus: 50.00,
            count: 178
          },
          year: {
            total: 15890.00,
            deliveries: 14000.00,
            tips: 1390.00,
            bonus: 500.00,
            count: 1987
          }
        }

        const data = mockData[period]
        setEarnings({
          total: data.total,
          deliveries: data.deliveries,
          tips: data.tips,
          bonus: data.bonus,
          count: data.count
        })

        setHistory([
          { date: '2024-01-20', amount: 64.50, deliveries: 8, status: 'paid' },
          { date: '2024-01-19', amount: 52.00, deliveries: 7, status: 'paid' },
          { date: '2024-01-18', amount: 78.25, deliveries: 10, status: 'paid' },
          { date: '2024-01-17', amount: 45.00, deliveries: 5, status: 'paid' },
          { date: '2024-01-16', amount: 58.75, deliveries: 7, status: 'paid' },
          { date: '2024-01-15', amount: 38.00, deliveries: 5, status: 'pending' }
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching earnings:', error)
      setLoading(false)
    }
  }

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/rider/dashboard')} className="text-purple-200 hover:text-white mb-2">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">My Earnings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                period === p.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Total Earnings Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center mb-6">
              <p className="text-green-100 mb-1">Total Earnings</p>
              <p className="text-5xl font-bold">£{earnings.total.toFixed(2)}</p>
              <p className="text-green-100 mt-2">{earnings.count} deliveries completed</p>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <span className="text-2xl">🚚</span>
                <p className="text-2xl font-bold text-gray-900 mt-2">£{earnings.deliveries.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Delivery Fees</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <span className="text-2xl">💝</span>
                <p className="text-2xl font-bold text-gray-900 mt-2">£{earnings.tips.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Tips</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <span className="text-2xl">🎁</span>
                <p className="text-2xl font-bold text-gray-900 mt-2">£{earnings.bonus.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Bonuses</p>
              </div>
            </div>

            {/* Payout Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Next Payout</h2>
                <span className="text-sm text-gray-500">Scheduled for Friday</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">£64.50</p>
                  <p className="text-sm text-gray-500">8 deliveries since last payout</p>
                </div>
                <button 
                  disabled
                  className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  title="Payouts are processed automatically every Friday"
                >
                  Auto-Payout Enabled
                </button>
              </div>
              {/* Manual Payout Notice */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📅 Automatic Weekly Payouts:</strong> Your earnings are paid out automatically every Friday via bank transfer. Ensure your bank details are up to date in Settings.
                </p>
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-900">Payout History</h2>
              </div>
              <div className="divide-y">
                {history.map((item, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(item.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{item.deliveries} deliveries</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">£{item.amount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Account Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🏦</span>
                  <div>
                    <p className="font-semibold">Bank Account</p>
                    <p className="text-sm text-gray-500">****1234 - Barclays</p>
                  </div>
                </div>
                <button className="text-purple-600 hover:underline font-semibold">
                  Update
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RiderEarnings

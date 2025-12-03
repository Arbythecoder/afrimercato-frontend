import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function PickerPerformance() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('week')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformance()
  }, [period])

  const fetchPerformance = async () => {
    try {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockData = {
          week: {
            totalOrders: 156,
            totalItems: 842,
            accuracy: 99.2,
            avgPickTime: 8.5,
            issuesReported: 7,
            onTimeRate: 97,
            ranking: 3,
            totalPickers: 25
          },
          month: {
            totalOrders: 624,
            totalItems: 3368,
            accuracy: 98.8,
            avgPickTime: 9.1,
            issuesReported: 32,
            onTimeRate: 95,
            ranking: 5,
            totalPickers: 25
          }
        }
        setStats(mockData[period])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching performance:', error)
      setLoading(false)
    }
  }

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ]

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 99) return 'text-green-600'
    if (accuracy >= 97) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/picker/dashboard')} className="text-orange-100 hover:text-white mb-2">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">My Performance</h1>
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
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <span className="text-3xl">📦</span>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500">Orders Picked</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <span className="text-3xl">🛒</span>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
            <p className="text-sm text-gray-500">Items Picked</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <span className="text-3xl">🎯</span>
            <p className={`text-3xl font-bold mt-2 ${getAccuracyColor(stats.accuracy)}`}>
              {stats.accuracy}%
            </p>
            <p className="text-sm text-gray-500">Accuracy Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <span className="text-3xl">⏱️</span>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgPickTime}m</p>
            <p className="text-sm text-gray-500">Avg Pick Time</p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Accuracy Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Accuracy Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pick Accuracy</span>
                  <span className="font-semibold">{stats.accuracy}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.accuracy}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>On-Time Rate</span>
                  <span className="font-semibold">{stats.onTimeRate}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.onTimeRate}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-500">Issues Reported</span>
                  <span className="font-semibold text-orange-600">{stats.issuesReported}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Ranking */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Team Ranking</h2>
            <div className="text-center py-6">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-white">#{stats.ranking}</span>
              </div>
              <p className="text-gray-500">out of {stats.totalPickers} pickers</p>
              <p className="text-sm text-gray-400 mt-1">
                {stats.ranking <= 3 ? '🏆 Top Performer!' : 'Keep up the great work!'}
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Items per hour</span>
                <span className="font-semibold">{Math.round(60 / stats.avgPickTime * 5)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-bold mb-4">💡 Tips to Improve</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
              <p>Optimize your route by grouping items from the same aisle</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
              <p>Check expiry dates before picking fresh produce</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
              <p>Report stock issues immediately to help the team</p>
            </div>
          </div>
        </div>

        {/* Daily Performance Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Performance</h2>
          <div className="h-48 flex items-end justify-between gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const height = 40 + Math.random() * 50
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-orange-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">{day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <span className="text-3xl">🏅</span>
              <p className="font-semibold text-sm mt-2">Speed Demon</p>
              <p className="text-xs text-gray-500">Picked 50 items in 1 hour</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <span className="text-3xl">🎯</span>
              <p className="font-semibold text-sm mt-2">Perfect Week</p>
              <p className="text-xs text-gray-500">100% accuracy for 7 days</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <span className="text-3xl">⭐</span>
              <p className="font-semibold text-sm mt-2">Rising Star</p>
              <p className="text-xs text-gray-500">Top 5 for 4 weeks</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg opacity-50">
              <span className="text-3xl">🔒</span>
              <p className="font-semibold text-sm mt-2">Locked</p>
              <p className="text-xs text-gray-500">Keep improving!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PickerPerformance

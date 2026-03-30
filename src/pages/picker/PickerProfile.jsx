import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiCall } from '../../services/api'

export default function PickerProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [stats, setStats] = useState({
    totalPicked: 0,
    completionRate: 0,
    avgPickTime: 0,
    memberSince: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiCall('/picker-auth/profile')
        if (res?.data) {
          const d = res.data
          // Backend returns { data: { user: {...}, stats: {...} } }
          const u = d.user || d
          setProfile(prev => ({
            ...prev,
            name: u.name || prev.name,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
          }))
          const s = d.stats || {}
          setStats({
            totalPicked: s.totalOrders || 0,
            completionRate: parseFloat(s.averageAccuracy) || 0,
            avgPickTime: 0,
            memberSince: u.createdAt || '',
          })
        }
      } catch (_e) {
        // fall back to auth context data silently
      } finally {
        setPageLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiCall('/picker-auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/picker/dashboard')}
            className="text-orange-200 hover:text-white mb-4 text-sm"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl flex-shrink-0">
              📦
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
              {pageLoading ? (
                <div className="flex gap-3 mt-2">
                  <div className="h-4 bg-white/20 rounded w-20 animate-pulse" />
                  <div className="h-4 bg-white/20 rounded w-28 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-2 flex-wrap text-sm">
                  <span>{stats.totalPicked} items picked</span>
                  {stats.completionRate > 0 && (
                    <>
                      <span className="text-orange-200">•</span>
                      <span>{stats.completionRate}% completion</span>
                    </>
                  )}
                  {stats.avgPickTime > 0 && (
                    <>
                      <span className="text-orange-200">•</span>
                      <span>~{stats.avgPickTime}m avg pick</span>
                    </>
                  )}
                </div>
              )}
              {stats.memberSince && (
                <p className="text-orange-200 text-xs mt-1">
                  Member since{' '}
                  {new Date(stats.memberSince).toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>

                {/* Performance summary cards */}
                {!pageLoading && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-orange-600">{stats.totalPicked}</p>
                      <p className="text-xs text-gray-500 mt-1">Items Picked</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-orange-600">
                        {stats.completionRate > 0 ? `${stats.completionRate}%` : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Completion</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-orange-600">
                        {stats.avgPickTime > 0 ? `${stats.avgPickTime}m` : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Avg Pick Time</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Order Notifications</p>
                    <p className="text-sm text-gray-500">Get notified when a new order is assigned</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Sound Alerts</p>
                    <p className="text-sm text-gray-500">Play sound for new assignments</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Performance Tips</p>
                    <p className="text-sm text-gray-500">Weekly improvement suggestions</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={logout}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

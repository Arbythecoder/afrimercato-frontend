import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiCall } from '../../services/api'

function RiderProfile() {
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
    vehicleType: 'bicycle',
    licensePlate: ''
  })

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    rating: 0,
    completionRate: 0,
    memberSince: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiCall('/rider-auth/profile')
        if (res?.data) {
          const d = res.data
          setProfile(prev => ({
            ...prev,
            name: d.name || prev.name,
            email: d.email || prev.email,
            phone: d.phone || prev.phone,
            vehicleType: d.vehicleType || prev.vehicleType,
            licensePlate: d.licensePlate || prev.licensePlate
          }))
          const s = d.stats || {}
          setStats({
            totalDeliveries: s.totalDeliveries || 0,
            rating: parseFloat(s.averageRating) || 0,
            completionRate: parseFloat(s.completionRate) || 0,
            memberSince: d.createdAt || ''
          })
        }
      } catch {
        // fail silently — fall back to auth context data
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
      await apiCall('/rider-auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          vehicleType: profile.vehicleType,
          licensePlate: profile.licensePlate
        })
      })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'vehicle', label: 'Vehicle', icon: '🚲' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  const vehicleTypes = [
    { id: 'bicycle', label: 'Bicycle', icon: '🚲' },
    { id: 'motorbike', label: 'Motorbike', icon: '🏍️' },
    { id: 'car', label: 'Car', icon: '🚗' },
    { id: 'van', label: 'Van', icon: '🚐' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/rider/dashboard')} className="text-afri-green-light hover:text-white mb-4">
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              {pageLoading ? (
                <div className="flex gap-3 mt-2">
                  <div className="h-4 bg-white/20 rounded w-20 animate-pulse" />
                  <div className="h-4 bg-white/20 rounded w-28 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  {stats.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span>{stats.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {stats.rating > 0 && <span className="text-afri-green-light">•</span>}
                  <span>{stats.totalDeliveries} deliveries</span>
                  {stats.completionRate > 0 && (
                    <><span className="text-afri-green-light">•</span><span>{stats.completionRate}% completion</span></>
                  )}
                </div>
              )}
              {stats.memberSince && (
                <p className="text-afri-green-light text-sm mt-1">
                  Member since {new Date(stats.memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-afri-green border-b-2 border-afri-green bg-afri-green-pale'
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
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Vehicle Tab */}
            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicleTypes.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setProfile({ ...profile, vehicleType: v.id })}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          profile.vehicleType === v.id
                            ? 'border-afri-green bg-afri-green-pale'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-3xl">{v.icon}</span>
                        <p className="font-medium mt-2">{v.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {['motorbike', 'car', 'van'].includes(profile.vehicleType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                    <input
                      type="text"
                      value={profile.licensePlate}
                      onChange={(e) => setProfile({ ...profile, licensePlate: e.target.value.toUpperCase() })}
                      placeholder="AB12 CDE"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                    />
                  </div>
                )}

                <button className="px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark">
                  Update Vehicle
                </button>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🪪</span>
                    <div>
                      <p className="font-semibold">ID Verification</p>
                      <p className="text-sm text-green-600">Verified</p>
                    </div>
                  </div>
                  <span className="text-green-600">✓</span>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-semibold">Right to Work</p>
                      <p className="text-sm text-green-600">Verified</p>
                    </div>
                  </div>
                  <span className="text-green-600">✓</span>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="font-semibold">Driver's License</p>
                      <p className="text-sm text-gray-500">Not required for bicycle</p>
                    </div>
                  </div>
                  <span className="text-gray-400">—</span>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <p className="font-semibold">Insurance</p>
                      <p className="text-sm text-yellow-600">Expires in 30 days</p>
                    </div>
                  </div>
                  <button className="text-afri-green hover:underline">Update</button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get notified of new orders</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-afri-green rounded" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Sound Alerts</p>
                    <p className="text-sm text-gray-500">Play sound for new orders</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-afri-green rounded" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Auto-Accept Orders</p>
                    <p className="text-sm text-gray-500">Automatically accept nearby orders</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-afri-green rounded" />
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={logout}
                    className="w-full py-3 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200"
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

export default RiderProfile

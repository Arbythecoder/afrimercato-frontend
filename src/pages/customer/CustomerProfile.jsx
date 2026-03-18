import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI, orderAPI } from '../../services/api'

function CustomerProfile() {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const [addresses, setAddresses] = useState([])
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const res = await orderAPI.getUserOrders()
      const orders = res?.data || res?.orders || []
      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 3) : [])
    } catch (_e) {
      setRecentOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      if (response.success) {
        setProfile({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || ''
        })
        setAddresses(response.data.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await userAPI.updateProfile(profile)
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        if (updateUser) updateUser(response.data)
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await userAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      })
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleteLoading(true)
    try {
      await userAPI.deleteAccount?.()
      logout()
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account. Please contact support.' })
      setDeleteLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-afri-green-light mt-1">Manage your account settings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-afri-green border-b-2 border-afri-green bg-gray-50'
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
              <>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
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

              {/* Recent Orders Summary */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recent Orders</h3>
                  <Link to="/orders" className="text-sm text-afri-green font-semibold hover:underline">
                    View all →
                  </Link>
                </div>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 text-sm">No orders yet</p>
                    <Link to="/stores" className="mt-2 inline-block text-afri-green text-sm font-semibold hover:underline">
                      Browse stores →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const statusColors = {
                        delivered:  'bg-green-100 text-green-700',
                        pending:    'bg-yellow-100 text-yellow-700',
                        processing: 'bg-blue-100 text-blue-700',
                        cancelled:  'bg-red-100 text-red-700',
                      }
                      const status = order.status || 'pending'
                      return (
                        <Link
                          key={order._id}
                          to={`/order/${order._id}`}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              Order #{(order._id || '').slice(-6).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                              {status}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              £{(order.pricing?.total || order.total || 0).toFixed(2)}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
              </>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No saved addresses</p>
                ) : (
                  addresses.map((addr, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{addr.label || 'Address'}</p>
                          <p className="text-gray-600">{addr.street}</p>
                          <p className="text-gray-600">{addr.city}, {addr.postcode}</p>
                        </div>
                        {addr.isDefault && (
                          <span className="text-xs bg-afri-green text-white px-2 py-1 rounded h-fit">Default</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-afri-green hover:text-afri-green">
                  + Add New Address
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>

              {/* Danger Zone — GDPR */}
              <div className="mt-8 border border-red-200 rounded-xl p-5 bg-red-50">
                <h3 className="font-bold text-red-700 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>
              </div>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive order updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-afri-green rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Receive delivery updates via SMS</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-afri-green rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Promotional Emails</p>
                    <p className="text-sm text-gray-500">Receive deals and offers</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-afri-green rounded" />
                </div>

                <div className="pt-4 border-t">
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

export default CustomerProfile

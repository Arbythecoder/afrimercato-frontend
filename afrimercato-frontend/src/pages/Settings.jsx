import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { vendorAPI } from '../services/api'

function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [vendorProfile, setVendorProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'profile', name: 'Vendor Profile', icon: '🏪' },
    { id: 'account', name: 'Account Settings', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
  ]

  useEffect(() => {
    fetchVendorProfile()
  }, [])

  const fetchVendorProfile = async () => {
    try {
      const response = await vendorAPI.getProfile()
      if (response.data.success) {
        setVendorProfile(response.data.data.vendor)
      }
    } catch (err) {
      // Vendor profile doesn't exist yet
      console.log('No vendor profile found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-afri-green text-afri-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-afri-green"></div>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && <VendorProfileTab vendorProfile={vendorProfile} onUpdate={fetchVendorProfile} />}
              {activeTab === 'account' && <AccountSettingsTab user={user} />}
              {activeTab === 'notifications' && <NotificationsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Vendor Profile Tab
function VendorProfileTab({ vendorProfile, onUpdate }) {
  const [formData, setFormData] = useState({
    storeName: vendorProfile?.storeName || '',
    description: vendorProfile?.description || '',
    category: vendorProfile?.category || 'fresh-produce',
    phone: vendorProfile?.phone || '',
    address: {
      street: vendorProfile?.address?.street || '',
      city: vendorProfile?.address?.city || '',
      state: vendorProfile?.address?.state || '',
      country: vendorProfile?.address?.country || 'United Kingdom',
    },
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (vendorProfile) {
        await vendorAPI.updateProfile(formData)
      } else {
        await vendorAPI.createProfile(formData)
      }
      setSuccess(true)
      onUpdate()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
          <input
            type="text"
            name="storeName"
            required
            value={formData.storeName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            placeholder="My Fresh Store"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            placeholder="Tell customers about your store..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
          >
            <option value="fresh-produce">Fresh Produce</option>
            <option value="groceries">Groceries</option>
            <option value="meat-fish">Meat & Fish</option>
            <option value="bakery">Bakery</option>
            <option value="dairy">Dairy</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            placeholder="+234-800-555-0000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            name="address.street"
            required
            value={formData.address.street}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            placeholder="123 Market Street"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            name="address.city"
            required
            value={formData.address.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            placeholder="Lagos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            name="address.state"
            required
            value={formData.address.state}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            placeholder="Lagos"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// Account Settings Tab
function AccountSettingsTab({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-4">
            To change your password, please contact support or use the "Forgot Password" option on the login page.
          </p>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

// Notifications Tab
function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailOrders: true,
    emailPromotions: false,
    smsOrders: true,
    pushNotifications: true,
  })

  const handleToggle = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Order Notifications (Email)</p>
              <p className="text-sm text-gray-600">Receive email updates about new orders</p>
            </div>
            <button
              onClick={() => handleToggle('emailOrders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.emailOrders ? 'bg-afri-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.emailOrders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Promotional Emails</p>
              <p className="text-sm text-gray-600">Receive offers and promotions</p>
            </div>
            <button
              onClick={() => handleToggle('emailPromotions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.emailPromotions ? 'bg-afri-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.emailPromotions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive SMS for important updates</p>
            </div>
            <button
              onClick={() => handleToggle('smsOrders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.smsOrders ? 'bg-afri-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.smsOrders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications on your device</p>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.pushNotifications ? 'bg-afri-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium">
          Save Preferences
        </button>
      </div>
    </div>
  )
}

export default Settings

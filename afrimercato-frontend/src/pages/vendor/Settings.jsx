import { useState, useEffect } from 'react'
import { vendorAPI, userAPI } from '../../services/api'
import Toast from '../../components/Notification/Toast'
import { useToast } from '../../hooks/useToast'

const categories = [
  'fresh-produce',
  'groceries',
  'meat-fish',
  'bakery',
  'beverages',
  'household',
  'beauty-health',
  'other',
]

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const countries = [
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'BE', name: 'Belgium', region: 'Europe' },
  { code: 'IE', name: 'Ireland', region: 'Europe' },
]

function Settings() {
  const { toasts, success, error, warning, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [postcodeLoading, setPostcodeLoading] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)

  const [vendorProfile, setVendorProfile] = useState({
    storeName: '',
    description: '',
    category: 'fresh-produce',
    phone: '',
    alternativePhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'United Kingdom',
      postalCode: '',
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '18:00', isOpen: true },
      sunday: { open: '09:00', close: '18:00', isOpen: false },
    },
  })

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const [vendorResponse, userResponse] = await Promise.all([
        vendorAPI.getProfile(),
        userAPI.getProfile(),
      ])

      if (vendorResponse.success) {
        setVendorProfile(vendorResponse.data.vendor)
      }
      if (userResponse.success) {
        setUserProfile(userResponse.data.user)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVendorChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setVendorProfile((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }))
    } else {
      setVendorProfile((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleBusinessHoursChange = (day, field, value) => {
    setVendorProfile((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }))
  }

  const handleUserChange = (field, value) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const lookupPostcode = async () => {
    const postcode = vendorProfile.address?.postalCode?.trim()

    if (!postcode) {
      warning('Please enter a postcode first')
      return
    }

    try {
      setPostcodeLoading(true)
      // Using free UK postcode lookup API
      const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`)
      const data = await response.json()

      if (data.status === 200 && data.result) {
        const result = data.result
        // Auto-fill city and county
        setVendorProfile((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            city: result.admin_district || result.postcode_area || '',
            state: result.admin_county || result.region || '',
          },
        }))
        success('Address details filled! Please enter your street address.')
      } else {
        warning('Postcode not found. Please check and try again.')
      }
    } catch (err) {
      console.error('Postcode lookup error:', err)
      error('Failed to lookup postcode. You can still enter address manually.')
    } finally {
      setPostcodeLoading(false)
    }
  }

  const saveVendorProfile = async () => {
    try {
      setSaving(true)
      const response = await vendorAPI.updateProfile(vendorProfile)
      if (response.success) {
        success('Vendor profile updated successfully!')
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update vendor profile')
    } finally {
      setSaving(false)
    }
  }

  const saveUserProfile = async () => {
    try {
      setSaving(true)
      const response = await userAPI.updateProfile(userProfile)
      if (response.success) {
        success('Account updated successfully!')
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      warning('Passwords do not match!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      warning('Password must be at least 6 characters!')
      return
    }

    try {
      setSaving(true)
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      if (response.success) {
        success('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Store Profile', icon: '🏪' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'hours', name: 'Business Hours', icon: '🕐' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ]

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
    <div className="space-y-6">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-afri-green to-afri-green-dark bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-afri-gray-600 mt-2">Manage your store and account settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-afri-green text-afri-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Store Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Store Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Store Name</label>
                <input
                  type="text"
                  value={vendorProfile.storeName}
                  onChange={(e) => handleVendorChange('storeName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Category</label>
                <select
                  value={vendorProfile.category}
                  onChange={(e) => handleVendorChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Description</label>
                <textarea
                  value={vendorProfile.description}
                  onChange={(e) => handleVendorChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Primary Phone</label>
                <input
                  type="tel"
                  value={vendorProfile.phone}
                  onChange={(e) => handleVendorChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Alternative Phone</label>
                <input
                  type="tel"
                  value={vendorProfile.alternativePhone || ''}
                  onChange={(e) => handleVendorChange('alternativePhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-afri-gray-900 mb-4">Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Street Address</label>
                <input
                  type="text"
                  value={vendorProfile.address?.street || ''}
                  onChange={(e) => handleVendorChange('address.street', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">City</label>
                <input
                  type="text"
                  value={vendorProfile.address?.city || ''}
                  onChange={(e) => handleVendorChange('address.city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
                  {vendorProfile.address?.country === 'United Kingdom' ? 'County' : 'State/County'}
                </label>
                <input
                  type="text"
                  value={vendorProfile.address?.state || ''}
                  onChange={(e) => handleVendorChange('address.state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder={vendorProfile.address?.country === 'United Kingdom' ? 'e.g., Greater London' : 'State or County'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
                  {vendorProfile.address?.country === 'United Kingdom' ? 'Postcode' : 'Postal/Zip Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vendorProfile.address?.postalCode || ''}
                    onChange={(e) => handleVendorChange('address.postalCode', e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                    placeholder={vendorProfile.address?.country === 'United Kingdom' ? 'e.g., SW1A 1AA' : 'Postal Code'}
                  />
                  {vendorProfile.address?.country === 'United Kingdom' && (
                    <button
                      type="button"
                      onClick={lookupPostcode}
                      disabled={postcodeLoading || !vendorProfile.address?.postalCode}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
                    >
                      {postcodeLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Looking up...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Find Address
                        </>
                      )}
                    </button>
                  )}
                </div>
                {vendorProfile.address?.country === 'United Kingdom' && (
                  <p className="mt-1 text-xs text-gray-500">Enter your postcode and click "Find Address" to auto-fill city and county</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Country</label>
                <select
                  value={vendorProfile.address?.country || 'United Kingdom'}
                  onChange={(e) => handleVendorChange('address.country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={saveVendorProfile}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => handleUserChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleUserChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={userProfile.phone || ''}
                  onChange={(e) => handleUserChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={saveUserProfile}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Business Hours</h2>

            <div className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-32">
                    <span className="font-semibold text-afri-gray-900 capitalize">{day}</span>
                  </div>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vendorProfile.businessHours?.[day]?.isOpen}
                      onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                      className="h-5 w-5 text-afri-green focus:ring-afri-green border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-afri-gray-700">Open</span>
                  </label>

                  {vendorProfile.businessHours?.[day]?.isOpen ? (
                    <>
                      <input
                        type="time"
                        value={vendorProfile.businessHours?.[day]?.open || '09:00'}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={vendorProfile.businessHours?.[day]?.close || '18:00'}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                      />
                    </>
                  ) : (
                    <span className="text-gray-400 italic ml-4">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={saveVendorProfile}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Change Password</h2>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={savePassword}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Settings

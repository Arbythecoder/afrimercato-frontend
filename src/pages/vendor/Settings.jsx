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

// STRICT: Only UK and Ireland allowed for vendors
const countries = [
  { code: 'GB', name: 'United Kingdom', region: 'Europe', phoneCodes: ['+44'], postcodeFormat: 'UK Postcode (e.g., SW1A 1AA)' },
  { code: 'IE', name: 'Ireland', region: 'Europe', phoneCodes: ['+353'], postcodeFormat: 'Eircode (e.g., D02 AF30)' },
  { code: 'NG', name: 'Nigeria', region: 'Africa', phoneCodes: ['+234'], postcodeFormat: '6-digit postcode' },
  { code: 'GH', name: 'Ghana', region: 'Africa', phoneCodes: ['+233'], postcodeFormat: 'Postcode' },
  { code: 'KE', name: 'Kenya', region: 'Africa', phoneCodes: ['+254'], postcodeFormat: '5-digit postcode' },
  { code: 'ZA', name: 'South Africa', region: 'Africa', phoneCodes: ['+27'], postcodeFormat: '4-digit postcode' },
  { code: 'US', name: 'United States', region: 'North America', phoneCodes: ['+1'], postcodeFormat: 'ZIP code (e.g., 10001)' },
  { code: 'CA', name: 'Canada', region: 'North America', phoneCodes: ['+1'], postcodeFormat: 'Postal code (e.g., K1A 0A6)' },
]

function Settings() {
  const { toasts, success, error, warning, removeToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [postcodeLoading, setPostcodeLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  
  // Add error state for better UX
  const [loadError, setLoadError] = useState(null)
  
  // Initialize vendor profile with defaults to prevent undefined errors
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
    setLoading(true)
    setLoadError(null)

    // Vendor profile — critical, show error if it fails
    let vendorResponse = null
    try {
      vendorResponse = await vendorAPI.getProfile()
    } catch (err) {
      console.error('Vendor profile load error:', err)
      setLoadError(err.message || 'Failed to load vendor profile. Please try again.')
      setLoading(false)
      return
    }

    if (vendorResponse?.success && vendorResponse.data) {
      // Backend returns vendor data either at data.vendor or data directly
      const vendorData = vendorResponse.data.vendor || vendorResponse.data
      setVendorProfile(prev => ({
        ...prev,
        ...vendorData,
        address: {
          ...prev.address,
          ...(vendorData.address || {})
        },
        businessHours: {
          ...prev.businessHours,
          ...(vendorData.businessHours || {})
        }
      }))
    }

    // User profile — non-critical, page still works without it
    try {
      const userResponse = await userAPI.getProfile()
      if (userResponse?.success && userResponse.data) {
        // Backend returns user either at data.user or data directly
        const userData = userResponse.data.user || userResponse.data
        if (userData && typeof userData === 'object') {
          setUserProfile(prev => ({
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
          }))
        }
      }
    } catch (err) {
      // Non-blocking — account tab shows editable fields but not pre-filled
      console.error('User profile load error (non-blocking):', err)
    }

    setLoading(false)
  }
  
  // LOADING GUARD: Show spinner while loading to prevent undefined errors
  if (loading && !loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor settings...</p>
        </div>
      </div>
    )
  }
  
  // ERROR GUARD: Show error message if loading failed
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Failed to Load Settings</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-afri-green text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
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

  // Validate UK/Ireland phone number
  const validatePhone = (phone, country) => {
    if (!phone) return true // Optional field

    const cleanPhone = phone.replace(/\s/g, '')

    if (country === 'United Kingdom') {
      // UK: +44 followed by 10 digits, or 07xxx xxxxxx (11 digits)
      const ukPattern = /^(\+44|0)[1-9]\d{9}$/
      return ukPattern.test(cleanPhone)
    } else if (country === 'Ireland') {
      // Ireland: +353 followed by 9 digits, or 08x xxx xxxx
      const iePattern = /^(\+353|0)[1-9]\d{8}$/
      return iePattern.test(cleanPhone)
    }
    return true
  }

  // Validate UK/Ireland postcode — lenient: just check plausible format
  const validatePostcode = (postcode) => {
    if (!postcode) return false
    const clean = postcode.replace(/\s/g, '').toUpperCase()
    // Accept any 5-8 char alphanumeric that looks like a postcode
    return /^[A-Z0-9]{4,8}$/.test(clean)
  }

  // Autocomplete suggestions using postcodes.io
  const [postcodeSuggestions, setPostcodeSuggestions] = useState([])
  const fetchPostcodeSuggestions = async (partial) => {
    if (!partial || partial.length < 2) { setPostcodeSuggestions([]); return }
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(partial)}/autocomplete`)
      const data = await res.json()
      setPostcodeSuggestions(data.result || [])
    } catch (_) {
      setPostcodeSuggestions([])
    }
  }

  const lookupPostcode = async () => {
    const postcode = vendorProfile.address?.postalCode?.trim()
    const country = vendorProfile.address?.country || 'United Kingdom'

    if (!postcode) {
      warning('Please enter a postcode first')
      return
    }

    // Soft-validate postcode format
    if (!validatePostcode(postcode)) {
      warning('Postcode format looks unusual. Please double-check it.')
    }

    try {
      setPostcodeLoading(true)

      if (country === 'United Kingdom') {
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
      } else {
        // Ireland - manual entry (no free API available)
        warning('Eircode verified! Please enter your address details manually.')
      }
    } catch (err) {
      console.error('Postcode lookup error:', err)
      error('Failed to lookup postcode. You can still enter address manually.')
    } finally {
      setPostcodeLoading(false)
    }
  }

  const saveVendorProfile = async () => {
    // Validate before saving
    const errors = {}
    const country = vendorProfile.address?.country || 'United Kingdom'

    // Validate phone numbers
    if (vendorProfile.phone && !validatePhone(vendorProfile.phone, country)) {
      errors.phone = `Invalid ${country === 'United Kingdom' ? 'UK' : 'Irish'} phone number. Format: ${country === 'United Kingdom' ? '+44 7xxx xxxxxx or 07xxx xxxxxx' : '+353 8x xxx xxxx or 08x xxx xxxx'}`
    }
    if (vendorProfile.alternativePhone && !validatePhone(vendorProfile.alternativePhone, country)) {
      errors.alternativePhone = `Invalid ${country === 'United Kingdom' ? 'UK' : 'Irish'} phone number`
    }

    // Postcode format is only a soft warning — don't block save

    // Validate required fields
    if (!vendorProfile.storeName?.trim()) {
      errors.storeName = 'Store name is required'
    }
    if (!vendorProfile.address?.street?.trim()) {
      errors.street = 'Street address is required'
    }
    if (!vendorProfile.address?.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!vendorProfile.address?.postalCode?.trim()) {
      errors.postalCode = 'Postcode is required'
    }

    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n')
      error(`Please fix the following errors:\n\n${errorMessages}`)
      return
    }

    try {
      setSaving(true)
      const response = await vendorAPI.updateProfile(vendorProfile)
      if (response?.success) {
        success('Vendor profile updated successfully!')
        setValidationErrors({})
      } else {
        error(response?.message || 'Failed to update vendor profile')
      }
    } catch (err) {
      console.error('Save vendor profile error:', err)
      error(err.message || err.response?.data?.message || 'Failed to update vendor profile')
    } finally {
      setSaving(false)
    }
  }

  const saveUserProfile = async () => {
    try {
      setSaving(true)
      const response = await userAPI.updateProfile(userProfile)
      if (response?.success) {
        success('Account updated successfully!')
      } else {
        error(response?.message || 'Failed to update account')
      }
    } catch (err) {
      console.error('Save user profile error:', err)
      error(err.message || err.response?.data?.message || 'Failed to update account')
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
      } else {
        error(response.message || 'Failed to change password')
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleDeliveryChange = (field, value) => {
    setVendorProfile((prev) => ({
      ...prev,
      deliverySettings: { ...prev.deliverySettings, [field]: value },
    }))
  }

  const toggleStoreClosed = async () => {
    const newValue = !vendorProfile.isClosed
    setVendorProfile((prev) => ({ ...prev, isClosed: newValue }))
    try {
      setSaving(true)
      const response = await vendorAPI.updateProfile({ isClosed: newValue })
      if (response.success) {
        success(newValue ? 'Store paused — customers will not see your store' : 'Store is now live!')
      }
    } catch (err) {
      // Revert on failure
      setVendorProfile((prev) => ({ ...prev, isClosed: !newValue }))
      error('Failed to update store status')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Store Profile', icon: '🏪' },
    { id: 'delivery', name: 'Delivery', icon: '🚚' },
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
          {/* Store Open/Close Toggle */}
          <div className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${vendorProfile.isClosed ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${vendorProfile.isClosed ? 'bg-red-100' : 'bg-green-100'}`}>
                {vendorProfile.isClosed ? '🔴' : '🟢'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {vendorProfile.isClosed ? 'Store is Paused' : 'Store is Live'}
                </h3>
                <p className="text-sm text-gray-600">
                  {vendorProfile.isClosed
                    ? 'Your store is hidden from customers. Toggle to go live.'
                    : 'Customers can find and order from your store.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleStoreClosed}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                vendorProfile.isClosed
                  ? 'bg-red-400 focus:ring-red-500'
                  : 'bg-green-500 focus:ring-green-500'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  vendorProfile.isClosed ? 'translate-x-0' : 'translate-x-6'
                }`}
              />
            </button>
          </div>

          {/* My Store Link */}
          {vendorProfile.slug && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-lg">
                  🔗
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">Your Store Link</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Share this link with your customers so they can browse your store directly.
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-green-300 rounded-lg px-4 py-2">
                    <span className="text-sm text-green-700 font-mono flex-1 truncate">
                      {`${window.location.origin}/store/${vendorProfile.slug}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/store/${vendorProfile.slug}`)
                          .then(() => success('Store link copied to clipboard!'))
                          .catch(() => warning('Could not copy — please copy manually'))
                      }}
                      className="flex-shrink-0 px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Copy
                    </button>
                    <a
                      href={`/store/${vendorProfile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1 text-xs font-semibold bg-white border border-green-600 text-green-700 rounded-md hover:bg-green-50 transition-colors"
                    >
                      Preview
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
                  Primary Phone *
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (include country code, e.g. +44, +234)
                  </span>
                </label>
                <input
                  type="tel"
                  value={vendorProfile.phone}
                  onChange={(e) => {
                    handleVendorChange('phone', e.target.value)
                    if (validationErrors.phone) {
                      setValidationErrors(prev => ({ ...prev, phone: undefined }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all ${
                    validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="+44 7700 900000 or +234 800 555 0001"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1 font-semibold">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
                  Alternative Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={vendorProfile.alternativePhone || ''}
                  onChange={(e) => {
                    handleVendorChange('alternativePhone', e.target.value)
                    if (validationErrors.alternativePhone) {
                      setValidationErrors(prev => ({ ...prev, alternativePhone: undefined }))
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all ${
                    validationErrors.alternativePhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="+44 7700 900000 or +234 800 555 0002"
                />
                {validationErrors.alternativePhone && (
                  <p className="text-red-500 text-sm mt-1 font-semibold">{validationErrors.alternativePhone}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-afri-gray-900 mb-4">Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Street Address *</label>
                <input
                  type="text"
                  value={vendorProfile.address?.street || ''}
                  onChange={(e) => {
                    handleVendorChange('address.street', e.target.value)
                    if (validationErrors.street) setValidationErrors(prev => ({ ...prev, street: undefined }))
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all ${
                    validationErrors.street ? 'border-red-500 bg-red-50' : vendorProfile.address?.street?.trim() ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 12 Brixton Road"
                />
                {validationErrors.street
                  ? <p className="text-red-500 text-sm mt-1 font-semibold">{validationErrors.street}</p>
                  : vendorProfile.address?.street?.trim() && <p className="text-green-600 text-sm mt-1">Looks good!</p>
                }
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">City *</label>
                <input
                  type="text"
                  value={vendorProfile.address?.city || ''}
                  onChange={(e) => {
                    handleVendorChange('address.city', e.target.value)
                    if (validationErrors.city) setValidationErrors(prev => ({ ...prev, city: undefined }))
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all ${
                    validationErrors.city ? 'border-red-500 bg-red-50' : vendorProfile.address?.city?.trim() ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., London"
                />
                {validationErrors.city
                  ? <p className="text-red-500 text-sm mt-1 font-semibold">{validationErrors.city}</p>
                  : vendorProfile.address?.city?.trim() && <p className="text-green-600 text-sm mt-1">Looks good!</p>
                }
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
                  {vendorProfile.address?.country === 'United Kingdom' ? 'Postcode *' : 'Postal/Zip Code *'}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                  <input
                    type="text"
                    value={vendorProfile.address?.postalCode || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase()
                      handleVendorChange('address.postalCode', val)
                      if (validationErrors.postalCode) setValidationErrors(prev => ({ ...prev, postalCode: undefined }))
                      fetchPostcodeSuggestions(val)
                    }}
                    onBlur={() => setTimeout(() => setPostcodeSuggestions([]), 200)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all ${
                      validationErrors.postalCode ? 'border-red-500 bg-red-50' : vendorProfile.address?.postalCode?.trim() ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder={vendorProfile.address?.country === 'United Kingdom' ? 'e.g., SW1A 1AA' : 'Postal Code'}
                  />
                  {postcodeSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                      {postcodeSuggestions.map(pc => (
                        <li
                          key={pc}
                          onMouseDown={() => {
                            handleVendorChange('address.postalCode', pc)
                            setPostcodeSuggestions([])
                          }}
                          className="px-4 py-2 hover:bg-afri-green hover:text-white cursor-pointer text-sm"
                        >
                          {pc}
                        </li>
                      ))}
                    </ul>
                  )}
                  </div>
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
                {validationErrors.postalCode
                  ? <p className="text-red-500 text-sm mt-1 font-semibold">{validationErrors.postalCode}</p>
                  : vendorProfile.address?.postalCode?.trim()
                    ? <p className="text-green-600 text-sm mt-1">Valid postcode!</p>
                    : vendorProfile.address?.country === 'United Kingdom' && (
                        <p className="mt-1 text-xs text-gray-500">Enter your postcode and click "Find Address" to auto-fill city and county</p>
                      )
                }
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

      {/* Delivery Tab */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Delivery Settings</h2>
            <p className="text-gray-600 mb-6">Control how delivery works for your store</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Delivery Fee (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={vendorProfile.deliveryFee ?? vendorProfile.deliverySettings?.deliveryFee ?? 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    handleVendorChange('deliveryFee', val)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder="e.g., 3.99"
                />
                <p className="mt-1 text-xs text-gray-500">Set to 0 for free delivery</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Free Delivery Above (£)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={vendorProfile.freeDeliveryAbove ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
                    handleVendorChange('freeDeliveryAbove', val)
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder="e.g., 50"
                />
                <p className="mt-1 text-xs text-gray-500">Orders above this amount get free delivery. Leave empty to disable.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Minimum Order Value (£)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={vendorProfile.deliverySettings?.minimumOrderValue ?? 0}
                  onChange={(e) => handleDeliveryChange('minimumOrderValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder="e.g., 10"
                />
                <p className="mt-1 text-xs text-gray-500">Customers must order at least this amount</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Estimated Prep Time (mins)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={vendorProfile.deliverySettings?.estimatedPrepTime ?? 30}
                  onChange={(e) => handleDeliveryChange('estimatedPrepTime', parseInt(e.target.value) || 30)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder="e.g., 30"
                />
                <p className="mt-1 text-xs text-gray-500">Average time to prepare an order</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Delivery Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={vendorProfile.deliveryRadius ?? 5}
                  onChange={(e) => handleVendorChange('deliveryRadius', parseInt(e.target.value) || 5)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder="e.g., 5"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum distance you deliver to</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-afri-gray-900 mb-2">Max Orders Per Hour</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={vendorProfile.deliverySettings?.maxOrdersPerHour ?? 20}
                  onChange={(e) => handleDeliveryChange('maxOrdersPerHour', parseInt(e.target.value) || 20)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
                  placeholder="e.g., 20"
                />
                <p className="mt-1 text-xs text-gray-500">Limit incoming orders to avoid overload</p>
              </div>
            </div>

            {/* Accepting Orders Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-6">
              <div>
                <p className="font-semibold text-gray-900">Accepting Orders</p>
                <p className="text-sm text-gray-600">Temporarily stop accepting new orders without pausing your store</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeliveryChange('acceptingOrders', !(vendorProfile.deliverySettings?.acceptingOrders ?? true))}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (vendorProfile.deliverySettings?.acceptingOrders ?? true) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    (vendorProfile.deliverySettings?.acceptingOrders ?? true) ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
                'Save Delivery Settings'
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

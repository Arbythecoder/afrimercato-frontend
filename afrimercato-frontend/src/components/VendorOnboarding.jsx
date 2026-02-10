import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ColorThief from 'colorthief'
import { useAuth } from '../context/AuthContext'
import { createVendorProfile } from '../services/api'

const VendorOnboarding = ({ onComplete }) => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const logoInputRef = useRef(null)
  const colorThief = useRef(new ColorThief())

  // Check authentication on mount
  useEffect(() => {
    // If not authenticated, redirect to login with vendor intent
    if (!isAuthenticated) {
      navigate('/login?role=vendor&redirect=/vendor/onboarding')
      return
    }

    // If already a vendor with a profile, redirect to dashboard
    if (user?.role === 'vendor') {
      // Check if they already have a store profile (will be handled in component)
      // For now, just show the onboarding - they might not have completed it
    }

    // If user is not a vendor role, show error
    if (user && user.role !== 'vendor') {
      setError('Only users with vendor accounts can access vendor onboarding. Please sign up as a vendor.')
    }
  }, [isAuthenticated, user, navigate])

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    storeName: '',
    description: '',
    category: '',

    // Step 2: Contact Info
    phone: '',
    alternativePhone: '',

    // Step 3: Address
    address: {
      street: '',
      city: '',
      state: '',
      country: 'United Kingdom',
      postalCode: ''
    },

    // Step 4: Business Hours
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    },

    // Step 5: Branding
    logo: null,
    logoPreview: null,
    brandColors: {
      primary: '#059669',
      secondary: '#FFC107'
    }
  })

  const categorySuggestions = [
    'Fresh Produce',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Bakery',
    'Pantry Staples',
    'Beverages',
    'Snacks',
    'Specialty Items',
    'Groceries',
    'Beauty & Health',
    'Household'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = async (event) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        try {
          // Extract dominant color
          const palette = colorThief.current.getPalette(img, 5)
          const dominantColor = palette[0]
          const rgbToHex = (r, g, b) => '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')

          const primaryColor = rgbToHex(...dominantColor)
          const secondaryColor = palette[1] ? rgbToHex(...palette[1]) : '#FFC107'

          setFormData(prev => ({
            ...prev,
            logo: file,
            logoPreview: event.target.result,
            brandColors: {
              primary: primaryColor,
              secondary: secondaryColor
            }
          }))
        } catch (err) {
          console.error('Color extraction error:', err)
          setFormData(prev => ({
            ...prev,
            logo: file,
            logoPreview: event.target.result
          }))
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.storeName.trim()) {
          setError('Store name is required')
          return false
        }
        if (!formData.description.trim()) {
          setError('Store description is required')
          return false
        }
        break
      case 2:
        if (!formData.phone.trim()) {
          setError('Phone number is required')
          return false
        }
        break
      case 3:
        if (!formData.address.street.trim() || !formData.address.city.trim()) {
          setError('Please fill in street and city')
          return false
        }
        break
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Prepare data for API
      const profileData = {
        storeName: formData.storeName,
        description: formData.description,
        category: formData.category,
        phone: formData.phone,
        alternativePhone: formData.alternativePhone || undefined,
        address: formData.address,
        businessHours: formData.businessHours,
        brandColors: formData.brandColors
      }

      console.log('Sending profile data:', JSON.stringify(profileData, null, 2))

      const response = await createVendorProfile(profileData)

      if (response.success) {
        // If logo was uploaded, upload it separately
        if (formData.logo) {
          // TODO: Upload logo to server
          console.log('Logo upload will be implemented')
        }

        if (onComplete) {
          onComplete()
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(response.message || 'Failed to create vendor profile')
      }
    } catch (err) {
      console.error('Onboarding error:', err)

      // Display detailed validation errors if available
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => `• ${e.field}: ${e.message}`).join('\n')
        setError(`Validation errors:\n${errorMessages}`)
        console.error('Validation errors:', err.response.data.errors)
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create vendor profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Store Info', icon: '🏪' },
    { number: 2, title: 'Contact', icon: '📞' },
    { number: 3, title: 'Location', icon: '📍' },
    { number: 4, title: 'Hours', icon: '🕐' },
    { number: 5, title: 'Branding', icon: '🎨' }
  ]

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Afrimercato! 🎉</h1>
          <p className="text-lg text-gray-600">Let's set up your store in just 5 easy steps</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-4 transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-afri-green border-afri-green text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={{ scale: currentStep === step.number ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className={`mt-2 text-xs font-medium ${
                    currentStep >= step.number ? 'text-afri-green' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step.number ? 'bg-afri-green' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={currentStep}>
            {/* Step 1: Store Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your store</h3>
                  <p className="text-gray-600">This information will help customers find and learn about your business</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                    placeholder="e.g., Fresh Valley Farms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                    placeholder="Describe what makes your store special..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    list="category-suggestions"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                    placeholder="e.g., Fresh Produce, Bakery, Meat & Seafood..."
                  />
                  <datalist id="category-suggestions">
                    {categorySuggestions.map((suggestion, index) => (
                      <option key={index} value={suggestion} />
                    ))}
                  </datalist>
                  <p className="mt-1 text-sm text-gray-500">
                    Type your business category or select from suggestions
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={2}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
                  <p className="text-gray-600">How can customers reach you?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                    placeholder="+234-800-555-0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternative Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="alternativePhone"
                    value={formData.alternativePhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                    placeholder="+234-800-555-0002"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={3}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Where are you located?</h3>
                  <p className="text-gray-600">Your business address</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                      placeholder="London"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County (Optional)
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                      placeholder="e.g., Greater London, Essex, Kent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                      placeholder="100001"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Business Hours */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={4}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">When are you open?</h3>
                  <p className="text-gray-600">Set your business hours for each day</p>
                </div>

                <div className="space-y-4">
                  {Object.keys(formData.businessHours).map((day) => (
                    <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-28">
                        <span className="font-medium text-gray-700 capitalize">{day}</span>
                      </div>

                      <input
                        type="checkbox"
                        checked={!formData.businessHours[day].closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                        className="h-5 w-5 text-afri-green focus:ring-afri-green border-gray-300 rounded"
                      />

                      {!formData.businessHours[day].closed ? (
                        <>
                          <input
                            type="time"
                            value={formData.businessHours[day].open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={formData.businessHours[day].close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                          />
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Branding */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                custom={5}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Make it yours!</h3>
                  <p className="text-gray-600">Upload your logo and we'll extract your brand colors automatically</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Store Logo
                  </label>

                  <div className="flex items-center gap-6">
                    {formData.logoPreview ? (
                      <motion.div
                        className="relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <img
                          src={formData.logoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 rounded-lg object-cover border-4 border-gray-200"
                        />
                        <motion.button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo: null, logoPreview: null }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-afri-green hover:bg-afri-green/5 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs text-gray-500">Upload Logo</span>
                      </motion.button>
                    )}

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {formData.logoPreview && (
                      <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <p className="text-sm font-medium text-gray-700 mb-3">Extracted Brand Colors:</p>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div
                              className="h-16 rounded-lg shadow-md mb-2 border-2 border-white"
                              style={{ backgroundColor: formData.brandColors.primary }}
                            />
                            <p className="text-xs text-gray-600 text-center font-mono">{formData.brandColors.primary}</p>
                            <p className="text-xs text-gray-500 text-center">Primary</p>
                          </div>
                          <div className="flex-1">
                            <div
                              className="h-16 rounded-lg shadow-md mb-2 border-2 border-white"
                              style={{ backgroundColor: formData.brandColors.secondary }}
                            />
                            <p className="text-xs text-gray-600 text-center font-mono">{formData.brandColors.secondary}</p>
                            <p className="text-xs text-gray-500 text-center">Secondary</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    Upload a square image (recommended: 500x500px, max 5MB)
                  </p>
                </div>

                <motion.div
                  className="bg-gradient-to-r from-afri-green/10 to-afri-yellow/10 p-6 rounded-lg border border-afri-green/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="font-bold text-gray-900 mb-2">You're all set! 🎉</h4>
                  <p className="text-gray-600 text-sm">
                    Click "Complete Setup" to create your vendor profile and start selling on Afrimercato!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              whileHover={currentStep !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentStep !== 1 ? { scale: 0.95 } : {}}
            >
              ← Previous
            </motion.button>

            {currentStep < 5 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold hover:from-afri-green-dark hover:to-afri-green transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next →
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold hover:from-afri-green-dark hover:to-afri-green transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup ✨
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-6 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Need help? Contact our support team at support@afrimercato.com
        </motion.p>
      </div>
    </div>
  )
}

export default VendorOnboarding

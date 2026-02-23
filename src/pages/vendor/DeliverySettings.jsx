import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/Notification/Toast'

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function DeliverySettings() {
  const { toasts, success, error, warning, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState({
    estimatedPrepTime: 30,
    minimumOrderValue: 0,
    acceptingOrders: true,
    autoAcceptOrders: false,
    maxOrdersPerHour: 20,
    deliveryRadius: 10,
    deliveryFee: 0,
    freeDeliveryAbove: null,
    deliverySlots: {
      enabled: false,
      slots: []
    },
    peakHours: []
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await vendorAPI.getDeliverySettings()
      if (response.success) {
        setSettings({
          ...response.data.deliverySettings,
          deliveryRadius: response.data.deliveryRadius,
          deliveryFee: response.data.deliveryFee,
          freeDeliveryAbove: response.data.freeDeliveryAbove
        })
      }
    } catch (err) {
      console.error('Error fetching delivery settings:', err)
      error('Failed to load delivery settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await vendorAPI.updateDeliverySettings(settings)
      if (response.success) {
        success('Delivery settings updated successfully!')
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update delivery settings')
    } finally {
      setSaving(false)
    }
  }

  const addPeakHour = () => {
    setSettings(prev => ({
      ...prev,
      peakHours: [
        ...prev.peakHours,
        { day: 'monday', startTime: '12:00', endTime: '14:00', surcharge: 10 }
      ]
    }))
  }

  const removePeakHour = (index) => {
    setSettings(prev => ({
      ...prev,
      peakHours: prev.peakHours.filter((_, i) => i !== index)
    }))
  }

  const updatePeakHour = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      peakHours: prev.peakHours.map((hour, i) =>
        i === index ? { ...hour, [field]: value } : hour
      )
    }))
  }

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
          Delivery Settings
        </h1>
        <p className="text-afri-gray-600 mt-2">Manage your delivery preferences and timelines</p>
      </div>

      {/* Order Acceptance */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Order Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accepting Orders */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-afri-gray-900">Currently Accepting Orders</h3>
              <p className="text-sm text-gray-600">Toggle to pause new orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.acceptingOrders}
                onChange={(e) => handleChange('acceptingOrders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-afri-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-afri-green"></div>
            </label>
          </div>

          {/* Auto Accept */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-afri-gray-900">Auto-Accept Orders</h3>
              <p className="text-sm text-gray-600">Automatically accept new orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAcceptOrders}
                onChange={(e) => handleChange('autoAcceptOrders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-afri-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-afri-green"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Prep Time */}
          <div>
            <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
              Estimated Prep Time (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={settings.estimatedPrepTime}
              onChange={(e) => handleChange('estimatedPrepTime', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Average time to prepare orders (5-180 min)</p>
          </div>

          {/* Min Order */}
          <div>
            <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
              Minimum Order Value (£)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.minimumOrderValue}
              onChange={(e) => handleChange('minimumOrderValue', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum order value required</p>
          </div>

          {/* Max Orders */}
          <div>
            <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
              Max Orders Per Hour
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxOrdersPerHour}
              onChange={(e) => handleChange('maxOrdersPerHour', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Limit orders to manage capacity</p>
          </div>
        </div>
      </div>

      {/* Delivery Fees */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-afri-gray-900 mb-4">Delivery Fees</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Radius */}
          <div>
            <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
              Delivery Radius (km)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.deliveryRadius}
              onChange={(e) => handleChange('deliveryRadius', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum delivery distance</p>
          </div>

          {/* Delivery Fee */}
          <div>
            <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
              Delivery Fee (£)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.deliveryFee}
              onChange={(e) => handleChange('deliveryFee', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Standard delivery charge</p>
          </div>

          {/* Free Delivery Above */}
          <div>
            <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
              Free Delivery Above (£)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.freeDeliveryAbove || ''}
              onChange={(e) => handleChange('freeDeliveryAbove', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Leave empty for no free delivery"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Order value for free delivery</p>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-afri-gray-900">Peak Hours Surcharge</h2>
            <p className="text-sm text-gray-600 mt-1">Add extra charges during busy times</p>
          </div>
          <button
            onClick={addPeakHour}
            className="px-4 py-2 bg-afri-green text-white rounded-lg font-medium hover:bg-afri-green-dark transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Peak Hour
          </button>
        </div>

        {settings.peakHours.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No peak hours configured. Add peak hours to charge extra during busy times.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.peakHours.map((peak, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={peak.day}
                    onChange={(e) => updatePeakHour(index, 'day', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={peak.startTime}
                    onChange={(e) => updatePeakHour(index, 'startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={peak.endTime}
                    onChange={(e) => updatePeakHour(index, 'endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Surcharge (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={peak.surcharge}
                    onChange={(e) => updatePeakHour(index, 'surcharge', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                  />
                </div>
                <button
                  onClick={() => removePeakHour(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}

export default DeliverySettings

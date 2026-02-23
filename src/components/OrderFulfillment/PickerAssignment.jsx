import { useState, useEffect } from 'react'

function PickerAssignment({ order, onPickerAssigned }) {
  const [pickers, setPickers] = useState([])
  const [selectedPicker, setSelectedPicker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    // Fetch available pickers
    fetchPickers()
  }, [])

  const fetchPickers = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockPickers = [
        {
          id: 'picker-1',
          name: 'John Smith',
          status: 'available',
          activeOrders: 0,
          rating: 4.8,
          completedOrders: 156,
          avatar: null,
        },
        {
          id: 'picker-2',
          name: 'Sarah Johnson',
          status: 'available',
          activeOrders: 1,
          rating: 4.9,
          completedOrders: 203,
          avatar: null,
        },
        {
          id: 'picker-3',
          name: 'Michael Brown',
          status: 'busy',
          activeOrders: 3,
          rating: 4.7,
          completedOrders: 189,
          avatar: null,
        },
        {
          id: 'picker-4',
          name: 'Emily Davis',
          status: 'available',
          activeOrders: 0,
          rating: 5.0,
          completedOrders: 98,
          avatar: null,
        },
      ]

      setTimeout(() => {
        setPickers(mockPickers)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching pickers:', error)
      setLoading(false)
    }
  }

  const handleAssignPicker = async () => {
    if (!selectedPicker) {
      alert('Please select a picker')
      return
    }

    setAssigning(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (onPickerAssigned) {
        await onPickerAssigned(selectedPicker.id)
      }

      alert(`Order assigned to ${selectedPicker.name}`)
    } catch (error) {
      console.error('Error assigning picker:', error)
      alert('Failed to assign picker. Please try again.')
    } finally {
      setAssigning(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'busy':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'offline':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusDot = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'busy':
        return 'bg-orange-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB300] mb-4"></div>
        <p className="text-gray-600">Loading available pickers...</p>
      </div>
    )
  }

  const availablePickers = pickers.filter(p => p.status === 'available')
  const busyPickers = pickers.filter(p => p.status === 'busy')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFB300] to-[#FFA726] rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2">Assign Order Picker</h3>
        <p className="text-gray-900">
          Select a picker to handle this order • {availablePickers.length} available
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="font-semibold text-gray-900">{order.items?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Value</p>
            <p className="font-semibold text-[#00897B]">£{order.pricing?.total?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold text-gray-900">{order.deliveryAddress?.fullName || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Available Pickers */}
      {availablePickers.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Available Pickers ({availablePickers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePickers.map((picker) => (
              <div
                key={picker.id}
                onClick={() => setSelectedPicker(picker)}
                className={`
                  bg-white rounded-xl p-5 shadow-md cursor-pointer transition-all duration-200
                  border-2 ${
                    selectedPicker?.id === picker.id
                      ? 'border-[#FFB300] shadow-lg scale-105'
                      : 'border-gray-200 hover:border-[#FFB300] hover:shadow-lg'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {picker.avatar ? (
                      <img
                        src={picker.avatar}
                        alt={picker.name}
                        className="w-16 h-16 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB300] to-[#FFA726] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {picker.name.charAt(0)}
                      </div>
                    )}
                    {/* Status Indicator */}
                    <div className={`w-4 h-4 rounded-full ${getStatusDot(picker.status)} border-2 border-white shadow-sm -mt-3 ml-12`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-bold text-gray-900 text-lg">{picker.name}</h5>
                      {selectedPicker?.id === picker.id && (
                        <svg className="w-6 h-6 text-[#FFB300] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-900">{picker.rating}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-900">{picker.completedOrders}</div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-900">{picker.activeOrders}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(picker.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(picker.status)} mr-2`}></span>
                      {picker.status.charAt(0).toUpperCase() + picker.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Busy Pickers */}
      {busyPickers.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
            Busy Pickers ({busyPickers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {busyPickers.map((picker) => (
              <div
                key={picker.id}
                className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 opacity-60"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {picker.avatar ? (
                      <img
                        src={picker.avatar}
                        alt={picker.name}
                        className="w-16 h-16 rounded-full object-cover shadow-md grayscale"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {picker.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-700 text-lg mb-1">{picker.name}</h5>
                    <p className="text-sm text-gray-500 mb-2">Currently handling {picker.activeOrders} orders</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(picker.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(picker.status)} mr-2`}></span>
                      Busy
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Pickers Available */}
      {pickers.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pickers Available</h3>
          <p className="text-gray-600">All pickers are currently busy. Please check back in a few minutes.</p>
        </div>
      )}

      {/* Assign Button */}
      {selectedPicker && (
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 -mx-6 -mb-6 rounded-b-xl shadow-lg">
          <button
            onClick={handleAssignPicker}
            disabled={assigning}
            className="w-full py-4 bg-gradient-to-r from-[#00897B] to-[#26A69A] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {assigning ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assigning...
              </>
            ) : (
              <>
                ✓ Assign to {selectedPicker.name}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default PickerAssignment

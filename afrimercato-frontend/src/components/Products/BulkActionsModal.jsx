import { useState } from 'react'
import { vendorAPI } from '../../services/api'

function BulkActionsModal({ selectedProducts, onClose, onComplete }) {
  const [action, setAction] = useState('delete')
  const [actionData, setActionData] = useState({
    isActive: true,
    priceType: 'percentage',
    priceValue: '',
    stockType: 'adjust',
    stockValue: '',
  })
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      let response

      switch (action) {
        case 'delete':
          if (!confirm(`Delete ${selectedProducts.length} products? This cannot be undone.`)) {
            setProcessing(false)
            return
          }
          response = await vendorAPI.bulkDeleteProducts({ productIds: selectedProducts })
          break

        case 'status':
          response = await vendorAPI.bulkUpdateStatus({
            productIds: selectedProducts,
            isActive: actionData.isActive,
          })
          break

        case 'price':
          if (!actionData.priceValue || actionData.priceValue === '0') {
            alert('Please enter a valid price value')
            setProcessing(false)
            return
          }
          response = await vendorAPI.bulkUpdatePrices({
            productIds: selectedProducts,
            type: actionData.priceType,
            value: parseFloat(actionData.priceValue),
          })
          break

        case 'stock':
          if (!actionData.stockValue || actionData.stockValue === '0') {
            alert('Please enter a valid stock value')
            setProcessing(false)
            return
          }
          response = await vendorAPI.bulkUpdateStock({
            productIds: selectedProducts,
            type: actionData.stockType,
            value: parseInt(actionData.stockValue),
          })
          break

        default:
          throw new Error('Invalid action')
      }

      if (response.success) {
        alert(`Successfully updated ${selectedProducts.length} products!`)
        onComplete()
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      alert(error.response?.data?.message || 'Failed to perform bulk action')
    } finally {
      setProcessing(false)
    }
  }

  const renderActionForm = () => {
    switch (action) {
      case 'delete':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">Warning: Permanent Deletion</h4>
                <p className="text-sm text-red-700">
                  You are about to delete <span className="font-bold">{selectedProducts.length} products</span>. This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )

      case 'status':
        return (
          <div className="space-y-4">
            <p className="text-sm text-afri-gray-600">
              Change status for <span className="font-semibold">{selectedProducts.length} products</span>
            </p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={actionData.isActive === true}
                  onChange={() => setActionData({ ...actionData, isActive: true })}
                  className="w-5 h-5 text-afri-green border-gray-300 focus:ring-afri-green cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium text-afri-gray-900">Activate</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={actionData.isActive === false}
                  onChange={() => setActionData({ ...actionData, isActive: false })}
                  className="w-5 h-5 text-afri-green border-gray-300 focus:ring-afri-green cursor-pointer"
                />
                <span className="ml-2 text-sm font-medium text-afri-gray-900">Deactivate</span>
              </label>
            </div>
          </div>
        )

      case 'price':
        return (
          <div className="space-y-4">
            <p className="text-sm text-afri-gray-600">
              Update prices for <span className="font-semibold">{selectedProducts.length} products</span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-afri-gray-700 mb-2">Update Type</label>
                <select
                  value={actionData.priceType}
                  onChange={(e) => setActionData({ ...actionData, priceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-afri-gray-700 mb-2">
                  {actionData.priceType === 'percentage' ? 'Percentage' : 'Amount (£)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actionData.priceValue}
                  onChange={(e) => setActionData({ ...actionData, priceValue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                {actionData.priceType === 'percentage' ? (
                  <>
                    {actionData.priceValue > 0 ? 'Increase' : 'Decrease'} prices by{' '}
                    <span className="font-bold">{Math.abs(actionData.priceValue)}%</span>
                  </>
                ) : (
                  <>
                    {actionData.priceValue > 0 ? 'Add' : 'Subtract'}{' '}
                    <span className="font-bold">£{Math.abs(actionData.priceValue)}</span> to/from prices
                  </>
                )}
              </p>
            </div>
          </div>
        )

      case 'stock':
        return (
          <div className="space-y-4">
            <p className="text-sm text-afri-gray-600">
              Update stock for <span className="font-semibold">{selectedProducts.length} products</span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-afri-gray-700 mb-2">Update Type</label>
                <select
                  value={actionData.stockType}
                  onChange={(e) => setActionData({ ...actionData, stockType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                >
                  <option value="adjust">Adjust (+/-)</option>
                  <option value="set">Set to Value</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-afri-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={actionData.stockValue}
                  onChange={(e) => setActionData({ ...actionData, stockValue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                {actionData.stockType === 'adjust' ? (
                  <>
                    {actionData.stockValue > 0 ? 'Add' : 'Remove'}{' '}
                    <span className="font-bold">{Math.abs(actionData.stockValue)}</span> units
                  </>
                ) : (
                  <>
                    Set stock to <span className="font-bold">{actionData.stockValue}</span> units
                  </>
                )}
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Bulk Actions</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-afri-yellow transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm opacity-90 mt-1">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-semibold text-afri-gray-900 mb-3">Select Action</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAction('delete')}
                  className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    action === 'delete'
                      ? 'border-red-500 bg-red-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🗑️</div>
                  <div className="font-semibold text-afri-gray-900">Delete</div>
                  <div className="text-xs text-afri-gray-500 mt-1">Remove products</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('status')}
                  className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    action === 'status'
                      ? 'border-afri-green bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="font-semibold text-afri-gray-900">Status</div>
                  <div className="text-xs text-afri-gray-500 mt-1">Activate/Deactivate</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('price')}
                  className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    action === 'price'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-semibold text-afri-gray-900">Price</div>
                  <div className="text-xs text-afri-gray-500 mt-1">Update prices</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('stock')}
                  className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    action === 'stock'
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">📦</div>
                  <div className="font-semibold text-afri-gray-900">Stock</div>
                  <div className="text-xs text-afri-gray-500 mt-1">Adjust inventory</div>
                </button>
              </div>
            </div>

            {/* Action Form */}
            <div className="border-t pt-6">{renderActionForm()}</div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className={`px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center ${
                  action === 'delete'
                    ? 'bg-gradient-to-r from-red-600 to-red-700'
                    : 'bg-gradient-to-r from-afri-green to-afri-green-dark'
                }`}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Apply to ${selectedProducts.length} Product${selectedProducts.length > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default BulkActionsModal

import { useState } from 'react'
import { vendorAPI } from '../../services/api'

export default function BulkActionMenu({ selectedProducts, onActionComplete }) {
  const [processing, setProcessing] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [priceChange, setPriceChange] = useState({
    type: 'fixed', // or 'percentage'
    value: ''
  })
  const [stockChange, setStockChange] = useState({
    type: 'set', // or 'adjust'
    value: ''
  })

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return
    }

    try {
      setProcessing(true)
      await Promise.all(
        selectedProducts.map(productId =>
          vendorAPI.deleteProduct(productId)
        )
      )
      onActionComplete('delete')
    } catch (error) {
      console.error('Failed to delete products:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkStatus = async (isActive) => {
    try {
      setProcessing(true)
      await Promise.all(
        selectedProducts.map(productId =>
          vendorAPI.updateProduct(productId, { isActive })
        )
      )
      onActionComplete('status')
    } catch (error) {
      console.error('Failed to update product status:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkPriceUpdate = async () => {
    try {
      setProcessing(true)
      await Promise.all(
        selectedProducts.map(async productId => {
          const product = await vendorAPI.getProduct(productId)
          const currentPrice = product.data.product.price
          const newPrice = priceChange.type === 'percentage'
            ? currentPrice * (1 + parseFloat(priceChange.value) / 100)
            : parseFloat(priceChange.value)

          return vendorAPI.updateProduct(productId, { price: newPrice })
        })
      )
      onActionComplete('price')
      setShowPriceModal(false)
    } catch (error) {
      console.error('Failed to update prices:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkStockUpdate = async () => {
    try {
      setProcessing(true)
      await Promise.all(
        selectedProducts.map(async productId => {
          const product = await vendorAPI.getProduct(productId)
          const currentStock = product.data.product.stock
          const newStock = stockChange.type === 'adjust'
            ? currentStock + parseInt(stockChange.value)
            : parseInt(stockChange.value)

          return vendorAPI.updateProduct(productId, { stock: Math.max(0, newStock) })
        })
      )
      onActionComplete('stock')
      setShowStockModal(false)
    } catch (error) {
      console.error('Failed to update stock:', error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="relative">
      {/* Main Menu */}
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">
          {selectedProducts.length} products selected
        </h3>
        
        <div className="space-y-2">
          <button
            onClick={() => setShowPriceModal(true)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg"
            disabled={processing}
          >
            Update Prices
          </button>
          
          <button
            onClick={() => setShowStockModal(true)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg"
            disabled={processing}
          >
            Update Stock
          </button>
          
          <button
            onClick={() => handleBulkStatus(true)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg"
            disabled={processing}
          >
            Activate Products
          </button>
          
          <button
            onClick={() => handleBulkStatus(false)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg"
            disabled={processing}
          >
            Deactivate Products
          </button>
          
          <button
            onClick={handleBulkDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
            disabled={processing}
          >
            Delete Products
          </button>
        </div>
      </div>

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Update Prices</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Update Type
                </label>
                <select
                  value={priceChange.type}
                  onChange={(e) => setPriceChange(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-afri-green focus:ring-afri-green"
                >
                  <option value="fixed">Set Fixed Price</option>
                  <option value="percentage">Adjust by Percentage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {priceChange.type === 'fixed' ? 'New Price' : 'Percentage Change'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {priceChange.type === 'fixed' ? '£' : '%'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={priceChange.value}
                    onChange={(e) => setPriceChange(prev => ({ ...prev, value: e.target.value }))}
                    className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-afri-green focus:border-afri-green"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPriceUpdate}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-white bg-afri-green hover:bg-afri-green-dark rounded-md"
              >
                {processing ? 'Updating...' : 'Update Prices'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Update Stock</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Update Type
                </label>
                <select
                  value={stockChange.type}
                  onChange={(e) => setStockChange(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-afri-green focus:ring-afri-green"
                >
                  <option value="set">Set Fixed Stock</option>
                  <option value="adjust">Adjust Stock (+/-)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {stockChange.type === 'set' ? 'New Stock Level' : 'Stock Adjustment'}
                </label>
                <input
                  type="number"
                  value={stockChange.value}
                  onChange={(e) => setStockChange(prev => ({ ...prev, value: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-afri-green focus:border-afri-green"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStockUpdate}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-white bg-afri-green hover:bg-afri-green-dark rounded-md"
              >
                {processing ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
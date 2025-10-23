import { useState, useEffect } from 'react'
import { productAPI } from '../services/api'
import BulkUploadModal from '../components/BulkUploadModal'
import ProductModal from '../components/ProductModal'
import BulkActionMenu from '../components/Products/BulkActionMenu'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'meat-fish', label: 'Meat & Fish' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'grains', label: 'Grains' },
    { value: 'beverages', label: 'Beverages' },
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll()
      if (response.data.success) {
        setProducts(response.data.data.products || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await productAPI.delete(id)
      setProducts(products.filter((p) => p._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id))
    }
  }

  const handleBulkActionComplete = (action) => {
    fetchProducts()
    setSelectedProducts([])
    setShowBulkMenu(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <span className="mr-2">�</span>
            Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium"
          >
            <span className="mr-2">+</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            {selectedProducts.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mt-7"
                >
                  Bulk Actions ({selectedProducts.length})
                </button>
                {showBulkMenu && (
                  <div className="absolute right-0 mt-2 z-50">
                    <BulkActionMenu
                      selectedProducts={selectedProducts}
                      onActionComplete={handleBulkActionComplete}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">Start adding products to your inventory</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-6 py-3 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          {/* Bulk Selection Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-afri-green focus:ring-afri-green h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-700">
                {selectedProducts.length === 0
                  ? 'Select all products'
                  : `Selected ${selectedProducts.length} products`}
              </span>
            </label>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition ${
                  selectedProducts.includes(product._id) ? 'ring-2 ring-afri-green' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleProductSelect(product._id)}
                    className="rounded border-gray-300 text-afri-green focus:ring-afri-green h-4 w-4"
                  />
                </div>

                {/* Product Image */}
                <div className="h-48 bg-gray-200 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Inactive
                      </span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= (product.lowStockThreshold || 10) && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Low Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-afri-green">
                      £{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock} {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <ProductModal
          product={selectedProduct}
          isEdit={showEditModal}
          onClose={() => {
            setShowAddModal(false)
            setShowEditModal(false)
            setSelectedProduct(null)
          }}
          onSuccess={fetchProducts}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  )
}



export default Products

import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'
import ProductModal from '../../components/Products/ProductModal'
import BulkActionsModal from '../../components/Products/BulkActionsModal'

const categories = [
  'fruits', 'vegetables', 'grains', 'dairy', 'meat', 'fish',
  'poultry', 'bakery', 'beverages', 'spices', 'snacks', 'household', 'beauty', 'other'
]

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 20,
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await vendorAPI.getProducts(filters)
      if (response.success) {
        setProducts(response.data.products)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    console.log('✅ Opening product creation modal...')
    setEditingProduct(null)
    setShowProductModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await vendorAPI.deleteProduct(productId)
      if (response.success) {
        fetchProducts()
        alert('Product deleted successfully!')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleToggleSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p._id))
    }
  }

  const handleBulkAction = () => {
    if (selectedProducts.length === 0) {
      alert('Please select products first')
      return
    }
    setShowBulkModal(true)
  }

  const getStockBadge = (product) => {
    if (!product.inStock) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
    }
    if (product.stock <= product.lowStockThreshold) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-afri-green to-afri-green-dark bg-clip-text text-transparent">
            {products.length === 0 ? 'Your Products' : `Managing ${products.length} Product${products.length !== 1 ? 's' : ''}`}
          </h1>
          <p className="text-afri-gray-600 mt-2">
            {products.length === 0
              ? 'Create your first product to start selling'
              : 'Manage your inventory and product listings'}
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl flex items-center justify-center group animate-pulse hover:animate-none"
        >
          <svg
            className="w-6 h-6 mr-3 transform group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {products.length === 0 ? 'Create Your First Product' : 'Create New Product'}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition-all"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 flex items-center justify-between animate-slideDown">
            <div className="flex items-center">
              <span className="font-semibold text-blue-900">{selectedProducts.length} products selected</span>
            </div>
            <button
              onClick={handleBulkAction}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
            >
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-afri-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl p-12 text-center border border-green-100">
          {/* Store Icon */}
          <div className="text-8xl mb-6 animate-bounce">🏪</div>

          <h3 className="text-3xl font-bold text-afri-gray-900 mb-4">No Products Yet</h3>

          {filters.search || filters.category || filters.status ? (
            <p className="text-afri-gray-600 mb-8 text-lg">Try adjusting your filters to see products</p>
          ) : (
            <div className="max-w-2xl mx-auto">
              <p className="text-afri-gray-700 mb-6 text-lg leading-relaxed">
                Get started by creating your first product. You can add:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <span className="text-2xl mb-2 block">📝</span>
                  <p className="font-semibold text-afri-gray-900">Product name</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <span className="text-2xl mb-2 block">📸</span>
                  <p className="font-semibold text-afri-gray-900">Images</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <span className="text-2xl mb-2 block">📄</span>
                  <p className="font-semibold text-afri-gray-900">Description</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <span className="text-2xl mb-2 block">💰</span>
                  <p className="font-semibold text-afri-gray-900">Price</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <span className="text-2xl mb-2 block">🏷️</span>
                  <p className="font-semibold text-afri-gray-900">Category</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <span className="text-2xl mb-2 block">📦</span>
                  <p className="font-semibold text-afri-gray-900">Stock</p>
                </div>
              </div>

              <p className="text-afri-gray-600 mb-8">
                ...all customized by you!
              </p>
            </div>
          )}

          <button
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white px-12 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 inline-flex items-center group mb-8"
          >
            <svg
              className="w-7 h-7 mr-3 transform group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {filters.search || filters.category || filters.status ? 'Clear Filters & Add Product' : 'CREATE YOUR FIRST PRODUCT'}
            <svg
              className="w-6 h-6 ml-3 transform group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          {/* Help Section */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💡</span>
              <div className="text-left">
                <h4 className="font-bold text-blue-900 mb-2">New to selling?</h4>
                <p className="text-blue-800 text-sm mb-2">Creating a product is easy! Click above to:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Upload product images</li>
                  <li>• Enter product name & description</li>
                  <li>• Set your own price</li>
                  <li>• Choose category & stock quantity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-afri-gray-50 to-afri-gray-100">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-afri-green border-gray-300 rounded focus:ring-afri-green cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-afri-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-afri-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-afri-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-afri-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-afri-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-afri-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gradient-to-r hover:from-afri-gray-50 hover:to-white transition-all duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleToggleSelect(product._id)}
                        className="w-4 h-4 text-afri-green border-gray-300 rounded focus:ring-afri-green cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-afri-gray-100 shadow-sm">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover transform hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-afri-gray-400">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-afri-gray-900">{product.name}</div>
                          <div className="text-sm text-afri-gray-500">{product.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-afri-green">£{product.price.toFixed(2)}</div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-xs text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-afri-gray-900 font-semibold">{product.stock}</div>
                      {product.lowStockThreshold && (
                        <div className="text-xs text-gray-500">Min: {product.lowStockThreshold}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStockBadge(product)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg group"
                          title="Edit"
                        >
                          <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg group"
                          title="Delete"
                        >
                          <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 bg-gradient-to-r from-afri-gray-50 to-white border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-afri-gray-700">
                  Showing <span className="font-semibold">{(pagination.currentPage - 1) * filters.limit + 1}</span> to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.currentPage * filters.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.total}</span> products
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                        pagination.currentPage === i + 1
                          ? 'z-10 bg-gradient-to-r from-afri-green to-afri-green-dark text-white border-afri-green'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={pagination.currentPage === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false)
            setEditingProduct(null)
          }}
          onSave={() => {
            console.log('✅ Product saved successfully!')
            fetchProducts()
            setShowProductModal(false)
            setEditingProduct(null)
          }}
        />
      )}

      {showBulkModal && (
        <BulkActionsModal
          selectedProducts={selectedProducts}
          onClose={() => setShowBulkModal(false)}
          onComplete={() => {
            fetchProducts()
            setSelectedProducts([])
            setShowBulkModal(false)
          }}
        />
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Products

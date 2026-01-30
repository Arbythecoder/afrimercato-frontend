import { useState } from 'react'
import { productAPI } from '../../services/api'

// API base URL - use environment variable or production default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://afrimercato-backend.fly.dev/api'

function ProductModal({ product, isEdit, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'vegetables',
    price: product?.price || '',
    unit: product?.unit || 'kg',
    stock: product?.stock || '',
    imageUrl: product?.images?.[0] || '', // images is now string[], not object[]
    imageUploadMethod: 'url', // 'file' or 'url'
    imageFiles: [],
    lowStockThreshold: product?.lowStockThreshold || 10,
    isActive: product?.isActive !== false,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let imageUrls = [] // Will store string URLs only

      // Handle file upload
      if (formData.imageUploadMethod === 'file' && formData.imageFiles && formData.imageFiles.length > 0) {
        setUploading(true)

        const uploadFormData = new FormData()
        formData.imageFiles.forEach(file => {
          uploadFormData.append('productImages', file)
        })

        // Upload images to server (use production URL, not localhost)
        const uploadResponse = await fetch(`${API_BASE_URL}/vendor/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('afrimercato_token')}`
          },
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()
        setUploading(false)

        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Image upload failed')
        }

        // Extract URLs only - backend expects string[]
        imageUrls = uploadResult.data.images
          .map(img => img?.url)
          .filter(url => typeof url === 'string' && url.length > 0)

        // Block if upload didn't return valid URLs
        if (imageUrls.length === 0) {
          throw new Error('Image upload completed but no valid URLs returned. Please try again.')
        }
      }
      // Handle URL input
      else if (formData.imageUploadMethod === 'url' && formData.imageUrl && formData.imageUrl.trim() !== '') {
        const url = formData.imageUrl.trim()
        // Validate it's a proper URL string
        if (typeof url === 'string' && url.startsWith('http')) {
          imageUrls = [url]
        }
      }

      // Prepare product data
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        unit: formData.unit,
        stock: formData.stock,
        lowStockThreshold: formData.lowStockThreshold,
        isActive: formData.isActive
      }

      // STRICT SANITIZATION: Ensure images is always string[] with valid URLs only
      const cleanImages = imageUrls
        .map(url => (typeof url === 'string' ? url : url?.url))
        .filter(url => typeof url === 'string' && url.length > 0 && url.startsWith('http'))

      if (cleanImages.length > 0) {
        submitData.images = cleanImages
      }

      // Save product
      if (isEdit) {
        await productAPI.update(product._id, submitData)
      } else {
        await productAPI.create(submitData)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Product save error:', err)
      setError(err.message || err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="Fresh Tomatoes"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="Fresh organic tomatoes..."
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
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="meat-fish">Meat & Fish</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="piece">piece</option>
                <option value="bunch">bunch</option>
                <option value="pack">pack</option>
                <option value="liter">liter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (£)</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
                <span className="text-xs text-gray-500 ml-2">(Upload files or paste URL)</span>
              </label>

              {/* Tab Selection */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, imageUploadMethod: 'file'})}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    formData.imageUploadMethod === 'file'
                      ? 'bg-afri-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📁 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, imageUploadMethod: 'url'})}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    formData.imageUploadMethod === 'url'
                      ? 'bg-afri-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔗 Image URL
                </button>
              </div>

              {/* File Upload */}
              {formData.imageUploadMethod === 'file' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFormData({...formData, imageFiles: Array.from(e.target.files)})}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green hover:border-afri-green cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 5 images (JPG, PNG, max 5MB each)
                  </p>
                  {formData.imageFiles && formData.imageFiles.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ {formData.imageFiles.length} file(s) selected
                    </div>
                  )}
                </div>
              )}

              {/* URL Input */}
              {formData.imageUploadMethod === 'url' && (
                <div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Go to <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-afri-green hover:underline">Unsplash.com</a>,
                    find a food image, right-click and copy image address
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-afri-green focus:ring-afri-green border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Product is active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-4 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium disabled:opacity-50"
            >
              {uploading ? 'Uploading images...' : loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal
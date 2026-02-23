import { useState } from 'react'
import { productAPI } from '../services/api'

function BulkUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadResults, setUploadResults] = useState(null)

  const handleDownloadTemplate = () => {
    // Create CSV template content
    const headers = [
      'name',
      'description',
      'category',
      'price',
      'unit',
      'stock',
      'sku',
      'lowStockThreshold',
      'imageUrl'
    ].join(',')

    const sampleRow = [
      'Fresh Tomatoes',
      'Organic fresh tomatoes (1kg pack)',
      'vegetables',
      '2.50',
      'kg',
      '100',
      'TOM-001',
      '10',
      'https://example.com/tomato-image.jpg'
    ].join(',')

    const csvContent = `${headers}\n${sampleRow}`

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError('')
    } else {
      setFile(null)
      setError('Please select a valid CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setUploadResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await productAPI.bulkUpload(formData)

      if (response.data.success) {
        setUploadResults({
          success: response.data.data.success || [],
          errors: response.data.data.errors || []
        })
        
        if (response.data.data.success?.length > 0) {
          // Only call onSuccess if there were any successful uploads
          onSuccess()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Upload Products</h2>
            <p className="text-sm text-gray-500 mt-1">Upload multiple products using a CSV file</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📥 Get Started</h3>
            <p className="text-sm text-blue-700 mb-3">
              Download our CSV template to ensure your data is formatted correctly.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
            >
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-afri-green transition cursor-pointer">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-afri-green hover:text-afri-green-dark">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-3">
              {uploadResults.success.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">
                    ✅ Successfully uploaded {uploadResults.success.length} products
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {uploadResults.success.map((product, index) => (
                      <p key={index} className="text-sm text-green-600">
                        {product.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {uploadResults.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">
                    ❌ Failed to upload {uploadResults.errors.length} products
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {uploadResults.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 px-4 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Products'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkUploadModal
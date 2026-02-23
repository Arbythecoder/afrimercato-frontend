import { useState } from 'react'
import { productAPI } from '../../services/api'

function BulkUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState([])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/csv') {
      setFile(file)
      // Read and preview CSV
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const rows = text.split('\n').slice(0, 6) // Preview first 5 rows
        setPreview(rows)
      }
      reader.readAsText(file)
    } else {
      setError('Please upload a valid CSV file')
    }
  }

  const downloadTemplate = () => {
    const template = [
      'name,description,category,price,stock,unit,imageUrl,lowStockThreshold,isActive',
      'Fresh Tomatoes,Organic farm-fresh tomatoes,vegetables,2.99,100,kg,https://example.com/tomatoes.jpg,10,true',
      'Premium Rice,High quality basmati rice,grains,15.99,50,kg,https://example.com/rice.jpg,20,true',
      'Farm Eggs,Free-range chicken eggs,dairy,3.50,200,piece,https://example.com/eggs.jpg,50,true',
      'Beef (Premium),High-quality beef cuts,meat-fish,12.99,30,kg,https://example.com/beef.jpg,5,true',
      'Orange Juice,Fresh squeezed orange juice,beverages,4.99,40,liter,https://example.com/juice.jpg,15,true'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_upload_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await productAPI.bulkUpload(formData)
      if (response.data.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bulk Upload Products</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Upload your products using a CSV file. 
              <button 
                onClick={downloadTemplate}
                className="text-afri-green hover:text-afri-green-dark ml-1"
              >
                Download template
              </button>
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-afri-green font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">CSV files only</div>
            </label>
          </div>

          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900 mb-2">File Preview:</p>
              <div className="text-sm text-gray-600 space-y-1">
                {preview.map((row, index) => (
                  <p key={index} className="font-mono">{row}</p>
                ))}
                {preview.length > 5 && <p className="text-gray-500">...</p>}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={handleSubmit}
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
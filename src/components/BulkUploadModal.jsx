import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { IoCameraOutline } from "react-icons/io5";
import {
  Upload, FileSpreadsheet, Plus, Trash2, CheckCircle2,
  AlertCircle, RefreshCw, Download, Layers, X, Image as ImageIcon,
  Check, ArrowRight, UploadCloud, AlertTriangle
} from 'lucide-react'
import { vendorAPI } from '../services/api'

// Predefined Category Suggestions
const CATEGORIES = [
  'African Foods',
  'Fresh Produce',
  'Bakery & Bread',
  'Beverages & Drinks',
  'Canned & Jarred Foods',
  'Cooking Oils & Fats',
  'Dairy & Eggs',
  'Dried Fish & Seafood',
  'Meat & Poultry',
  'Grains & Flours',
  'Seasonings & Spices',
  'Snacks & Confectionery',
  'Specialty & Traditional Items'
]

// Common product units
const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'l', label: 'Litre (l)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'pack', label: 'Pack' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'tray', label: 'Tray' }
]

// Helper for client-side image compression before upload
const compressImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file || file.size < 400 * 1024) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

function BulkUploadModal({ onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('batch') // 'batch' | 'csv'

  // Tab 1: Multi-Product Batch Table State
  const [batchRows, setBatchRows] = useState([
    { id: 1, name: '', category: 'Fresh Produce', price: '', unit: 'kg', stock: '50', description: '', localImageFiles: [], imagePreviews: [] },
    { id: 2, name: '', category: 'African Foods', price: '', unit: 'pack', stock: '20', description: '', localImageFiles: [], imagePreviews: [] }
  ])

  // Tab 2: CSV Import State
  const fileInputRef = useRef(null)
  const csvImagesInputRef = useRef(null)
  const [csvFile, setCsvFile] = useState(null)
  const [parsedCsvItems, setParsedCsvItems] = useState([])
  const [csvDeviceImages, setCsvDeviceImages] = useState([]) // File[] from device

  // General Status & Progress
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [uploadResults, setUploadResults] = useState(null) // { createdCount, failedCount, created, errors }
  const [error, setError] = useState('')

  // Add new row to Batch Table
  const addBatchRow = () => {
    const newId = Date.now() + Math.random()
    setBatchRows(prev => [
      ...prev,
      { id: newId, name: '', category: 'Fresh Produce', price: '', unit: 'kg', stock: '50', description: '', localImageFiles: [], imagePreviews: [] }
    ])
  }

  // Remove row from Batch Table
  const removeBatchRow = (id) => {
    if (batchRows.length <= 1) return
    setBatchRows(prev => {
      const rowToRemove = prev.find(r => r.id === id)
      if (rowToRemove) {
        rowToRemove.imagePreviews?.forEach(url => URL.revokeObjectURL(url))
      }
      return prev.filter(r => r.id !== id)
    })
  }

  // Update text/select field in Batch row
  const updateBatchRow = (id, field, value) => {
    setBatchRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  // Handle local device image selection for a specific Batch row
  const handleBatchImageUpload = (rowId, e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setBatchRows(prev => prev.map(r => {
      if (r.id !== rowId) return r

      const newFiles = [...r.localImageFiles, ...files].slice(0, 5) // max 5 per product
      const newPreviews = newFiles.map(f => URL.createObjectURL(f))

      // Clean up previous blob URLs to prevent memory leaks
      r.imagePreviews?.forEach(url => URL.revokeObjectURL(url))

      return {
        ...r,
        localImageFiles: newFiles,
        imagePreviews: newPreviews
      }
    }))

    // Reset file input value
    e.target.value = ''
  }

  // Remove individual device image preview from a Batch row
  const removeBatchRowImage = (rowId, imgIndex) => {
    setBatchRows(prev => prev.map(r => {
      if (r.id !== rowId) return r

      const newFiles = r.localImageFiles.filter((_, idx) => idx !== imgIndex)
      if (r.imagePreviews[imgIndex]) {
        URL.revokeObjectURL(r.imagePreviews[imgIndex])
      }
      const newPreviews = r.imagePreviews.filter((_, idx) => idx !== imgIndex)

      return {
        ...r,
        localImageFiles: newFiles,
        imagePreviews: newPreviews
      }
    }))
  }

  // CSV Template Download
  const downloadCsvTemplate = () => {
    const headers = 'name,category,price,unit,stock,description,image_filename\n'
    const sampleRows = [
      'Fresh Tomatoes,Fresh Produce,2.50,kg,100,Organic fresh tomatoes pack,tomatoes.jpg',
      'Egusi Seeds,African Foods,8.99,pack,40,Hand-picked ground egusi,egusi.png',
      'Plantain Chips,Snacks & Confectionery,1.80,piece,60,Crispy ripe plantain chips,chips.jpg'
    ].join('\n')

    const csvContent = `${headers}${sampleRows}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bulk_products_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // CSV File Select
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please select a valid .csv file')
      return
    }
    setCsvFile(file)
    setError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      parseCsvData(text)
    }
    reader.readAsText(file)
  }

  // Parse CSV string into product objects
  const parseCsvData = (text) => {
    try {
      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0)
      if (lines.length <= 1) {
        setError('CSV file appears empty or only contains header')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
      const rows = []

      for (let i = 1; i < lines.length; i++) {
        // Handle basic comma separation (ignoring quotes for simple CSV parsing)
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        if (values.length === 0 || !values[0]) continue

        const rowObj = {
          id: i,
          name: values[headers.indexOf('name')] || values[0] || '',
          category: values[headers.indexOf('category')] || values[1] || 'Fresh Produce',
          price: values[headers.indexOf('price')] || values[2] || '',
          unit: values[headers.indexOf('unit')] || values[3] || 'kg',
          stock: values[headers.indexOf('stock')] || values[4] || '50',
          description: values[headers.indexOf('description')] || values[5] || '',
          image_filename: values[headers.indexOf('image_filename')] || values[headers.indexOf('imageurl')] || values[6] || '',
          localImageFiles: [],
          imagePreviews: []
        }
        rows.push(rowObj)
      }

      setParsedCsvItems(rows)
      autoMatchCsvImages(rows, csvDeviceImages)
    } catch (err) {
      console.error('Error parsing CSV:', err)
      setError('Failed to parse CSV file format')
    }
  }

  // Handle uploading device image files for CSV rows
  const handleCsvDeviceImagesUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setCsvDeviceImages(prev => [...prev, ...files])
    autoMatchCsvImages(parsedCsvItems, [...csvDeviceImages, ...files])
  }

  // Automatically match uploaded device image files to CSV rows based on image_filename or row order
  const autoMatchCsvImages = (items, deviceFiles) => {
    if (deviceFiles.length === 0 || items.length === 0) return

    const updated = items.map((item, idx) => {
      // Find file by matching filename first
      let matchedFile = null
      if (item.image_filename) {
        const cleanTargetName = item.image_filename.toLowerCase()
        matchedFile = deviceFiles.find(f => f.name.toLowerCase() === cleanTargetName)
      }

      // Fallback: match by index if no filename match found
      if (!matchedFile && deviceFiles[idx]) {
        matchedFile = deviceFiles[idx]
      }

      if (matchedFile) {
        const previewUrl = URL.createObjectURL(matchedFile)
        return {
          ...item,
          localImageFiles: [matchedFile],
          imagePreviews: [previewUrl]
        }
      }
      return item
    })

    setParsedCsvItems(updated)
  }

  // Handle per-row local image file upload in CSV preview table
  const handleCsvRowImageSelect = (rowId, e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setParsedCsvItems(prev => prev.map(r => {
      if (r.id !== rowId) return r
      const newPreviews = files.map(f => URL.createObjectURL(f))
      return {
        ...r,
        localImageFiles: files,
        imagePreviews: newPreviews
      }
    }))
  }

  // Submitting Products
  const handleSubmit = async () => {
    setError('')
    setUploadResults(null)

    const productsToProcess = activeTab === 'batch' ? batchRows : parsedCsvItems

    // Validate rows
    const validRows = productsToProcess.filter(r => r.name.trim() && r.price && !isNaN(parseFloat(r.price)))

    if (validRows.length === 0) {
      setError('Please fill in at least one product with a valid Name and Price.')
      return
    }

    setSubmitting(true)
    setStatusMessage('Compressing and uploading product images from device...')

    try {
      const finalProductsArray = []

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i]
        setStatusMessage(`Processing product ${i + 1} of ${validRows.length}: "${row.name}"...`)

        let uploadedImageUrls = []

        // If local image files exist, upload them to backend
        if (row.localImageFiles && row.localImageFiles.length > 0) {
          try {
            // Compress image files first
            const compressedFiles = await Promise.all(
              row.localImageFiles.map(f => compressImageFile(f))
            )

            const uploadRes = await vendorAPI.uploadProductImages(compressedFiles)
            if (uploadRes?.success && uploadRes?.data?.images) {
              uploadedImageUrls = uploadRes.data.images
            } else if (uploadRes?.images) {
              uploadedImageUrls = uploadRes.images
            }
          } catch (imgErr) {
            console.warn(`Failed to upload image for ${row.name}:`, imgErr)
          }
        }

        finalProductsArray.push({
          name: row.name.trim(),
          category: row.category || 'General',
          price: parseFloat(row.price),
          unit: row.unit || 'kg',
          stock: parseInt(row.stock || 50, 10),
          description: row.description.trim() || row.name.trim(),
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined
        })
      }

      setStatusMessage('Creating bulk product listings in database...')
      const res = await vendorAPI.bulkCreateProducts(finalProductsArray)

      if (res?.success) {
        setUploadResults({
          createdCount: res.data?.createdCount || finalProductsArray.length,
          failedCount: res.data?.errorCount || 0,
          created: res.data?.created || [],
          errors: res.data?.errors || []
        })

        if (onSuccess) onSuccess()
      } else {
        throw new Error(res?.message || 'Failed to bulk upload products')
      }
    } catch (err) {
      console.error('Bulk Upload Error:', err)
      setError(err.message || 'An error occurred during bulk product upload.')
    } finally {
      setSubmitting(false)
      setStatusMessage('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Bulk Upload Products</h2>
              <p className="text-xs text-white/80">Add multiple products with image uploads directly from your device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 pt-3 space-x-2">
          <button
            onClick={() => { setActiveTab('batch'); setError(''); setUploadResults(null); }}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'batch'
              ? 'bg-white text-afri-green border-t-2 border-afri-green shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            <Layers className="w-4 h-4" />
            Multi-Product Batch Builder
          </button>
          <button
            onClick={() => { setActiveTab('csv'); setError(''); setUploadResults(null); }}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'csv'
              ? 'bg-white text-afri-green border-t-2 border-afri-green shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV File + Device Images Import
          </button>
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">Upload Warning</h4>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Results Summary Modal/Banner */}
          {uploadResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900">Bulk Upload Completed!</h3>
                  <p className="text-xs text-green-700">
                    Successfully created {uploadResults.createdCount} product(s).
                    {uploadResults.failedCount > 0 && ` (${uploadResults.failedCount} failed validation)`}
                  </p>
                </div>
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 max-h-40 overflow-y-auto space-y-1 text-xs text-red-700">
                  <span className="font-bold block text-red-900 mb-1">Failed Items:</span>
                  {uploadResults.errors.map((err, i) => (
                    <p key={i}>• Row {err.row || err.index}: {err.name} — {err.message}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-afri-green text-white font-bold rounded-xl hover:bg-afri-green-dark transition shadow-md"
                >
                  Done & View Inventory
                </button>
              </div>
            </motion.div>
          )}

          {/* Submitting Progress Spinner */}
          {submitting && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 border-4 border-afri-green border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Uploading Bulk Products...</h4>
                <p className="text-sm text-afri-green font-medium mt-1">{statusMessage}</p>
              </div>
            </div>
          )}

          {/* TAB 1: BATCH TABLE BUILDER */}
          {!submitting && !uploadResults && activeTab === 'batch' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50/70 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl"><IoCameraOutline /></span>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Device Image Upload Supported</h4>
                    <p className="text-xs text-blue-700">
                      Enter product details below and select image files directly from your phone or computer for each product.
                    </p>
                  </div>
                </div>
                <button
                  onClick={addBatchRow}
                  className="px-4 py-2 bg-afri-green text-white font-semibold rounded-lg text-xs hover:bg-afri-green-dark transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>

              {/* Rows List */}
              <div className="space-y-4">
                {batchRows.map((row, index) => (
                  <motion.div
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-afri-green/50 transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-700">
                        Product #{index + 1}
                      </span>
                      {batchRows.length > 1 && (
                        <button
                          onClick={() => removeBatchRow(row.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Product
                        </button>
                      )}
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Name */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-700">Product Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Fresh Yam (5kg)"
                          value={row.name}
                          onChange={(e) => updateBatchRow(row.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Category *</label>
                        <select
                          value={row.category}
                          onChange={(e) => updateBatchRow(row.id, 'category', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price & Unit */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={row.price}
                            onChange={(e) => updateBatchRow(row.id, 'price', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Unit</label>
                          <select
                            value={row.unit}
                            onChange={(e) => updateBatchRow(row.id, 'unit', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                          >
                            {UNITS.map((u) => (
                              <option key={u.value} value={u.value}>{u.value}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Second Row: Stock & Description & Device Image Picker */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Stock Qty</label>
                        <input
                          type="number"
                          placeholder="50"
                          value={row.stock}
                          onChange={(e) => updateBatchRow(row.id, 'stock', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-1">
                        <label className="text-xs font-bold text-gray-700">Description</label>
                        <input
                          type="text"
                          placeholder="Brief item description..."
                          value={row.description}
                          onChange={(e) => updateBatchRow(row.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
                        />
                      </div>

                      {/* Device Image Uploader for this Row */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                          <span>Product Images (From Device)</span>
                          <span className="text-[10px] text-gray-500">{row.imagePreviews.length}/5 selected</span>
                        </label>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Image Previews */}
                          {row.imagePreviews.map((previewUrl, imgIdx) => (
                            <div key={imgIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-300 group shadow-sm">
                              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeBatchRowImage(row.id, imgIdx)}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {/* Device Image Select Input */}
                          {row.imagePreviews.length < 5 && (
                            <label className="w-14 h-14 rounded-lg border-2 border-dashed border-afri-green/50 hover:border-afri-green bg-green-50/50 hover:bg-green-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-afri-green">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-[9px] font-bold mt-0.5">+ Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleBatchImageUpload(row.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Row & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={addBatchRow}
                  className="px-4 py-2 border-2 border-dashed border-afri-green text-afri-green font-bold rounded-xl text-sm hover:bg-green-50 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Product Row
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-gradient-to-r from-afri-green to-afri-green-dark text-white font-bold rounded-xl text-sm hover:shadow-lg transition flex items-center gap-2"
                  >
                    Upload & Save All Products ({batchRows.filter(r => r.name.trim()).length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CSV + DEVICE IMAGES */}
          {!submitting && !uploadResults && activeTab === 'csv' && (
            <div className="space-y-6">
              {/* Template Download Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-900">Step 1: Download CSV Template</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Use our formatted template with columns for Name, Category, Price, Unit, Stock, and image filenames.
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadCsvTemplate}
                  className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. CSV Dropzone */}
                <div className="border-2 border-dashed border-gray-300 hover:border-afri-green rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-green-50/30 transition cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center space-y-2"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-afri-green" />
                    <div className="text-sm font-bold text-gray-800">
                      {csvFile ? csvFile.name : 'Select CSV File'}
                    </div>
                    <p className="text-xs text-gray-500">Click to browse or drop your CSV spreadsheet</p>
                  </div>
                </div>

                {/* 2. Device Product Images Dropzone */}
                <div className="border-2 border-dashed border-gray-300 hover:border-afri-green rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-green-50/30 transition cursor-pointer">
                  <input
                    ref={csvImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCsvDeviceImagesUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => csvImagesInputRef.current?.click()}
                    className="flex flex-col items-center space-y-2"
                  >
                    <ImageIcon className="w-10 h-10 text-afri-green" />
                    <div className="text-sm font-bold text-gray-800">
                      {csvDeviceImages.length > 0
                        ? `${csvDeviceImages.length} Image File(s) Selected`
                        : 'Select Device Image Files'}
                    </div>
                    <p className="text-xs text-gray-500">Select multiple product photos from your device</p>
                  </div>
                </div>
              </div>

              {/* Parsed CSV Preview Table */}
              {parsedCsvItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800">
                      Parsed Products Preview ({parsedCsvItems.length} Items)
                    </h4>
                    <span className="text-xs text-afri-green font-semibold">
                      ✓ Device photos matched: {parsedCsvItems.filter(i => i.imagePreviews.length > 0).length} / {parsedCsvItems.length}
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-64">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Device Image</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedCsvItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition">
                            <td className="p-3 font-semibold text-gray-500">{idx + 1}</td>
                            <td className="p-3 font-bold text-gray-900">{item.name}</td>
                            <td className="p-3 text-gray-600">{item.category}</td>
                            <td className="p-3 font-bold text-afri-green">{item.price}</td>
                            <td className="p-3 text-gray-600">{item.stock} ({item.unit})</td>
                            <td className="p-3">
                              {item.imagePreviews.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <img src={item.imagePreviews[0]} alt="preview" className="w-8 h-8 rounded object-cover border border-gray-200" />
                                  <span className="text-[10px] text-green-700 font-bold">Attached</span>
                                </div>
                              ) : (
                                <label className="text-[10px] text-afri-green font-bold hover:underline cursor-pointer">
                                  + Select Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleCsvRowImageSelect(item.id, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CSV Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={parsedCsvItems.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-afri-green to-afri-green-dark text-white font-bold rounded-xl text-sm hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  Import {parsedCsvItems.length} Products
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  )
}

export default BulkUploadModal
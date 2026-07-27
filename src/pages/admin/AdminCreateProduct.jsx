import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PackagePlus, Store, ChevronLeft, Search, Upload,
  FileSpreadsheet, Plus, Trash2, Edit3, CheckCircle2,
  AlertCircle, RefreshCw, Download, Layers, ShoppingBag,
  Filter, Check, AlertTriangle, ArrowRight, X, Eye
} from 'lucide-react'
import useAdminStore from '../../stores/useAdminStore'
import ProductCreationForm from '../../components/Products/ProductCreationForm'
import {
  bulkCreateProductsForVendor,
  deleteProductForVendor,
  getProductsByVendor
} from '../../services/api'

// Available units matching backend validation
const PRODUCT_UNITS = [
  'piece', 'pack', 'kg', 'g', 'lb', 'oz',
  'l', 'ml', 'pint', 'bunch', 'bag', 'box', 'tray'
]

// Sample Categories for quick select
const COMMON_CATEGORIES = [
  'Fresh Produce', 'Meat & Poultry', 'Seafood', 'Pantry & Grains',
  'Spices & Seasoning', 'Beverages', 'Frozen Foods', 'Snacks', 'Bakery', 'Dairy & Eggs'
]

export default function AdminCreateProduct() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlVendorId = searchParams.get('vendorId')

  const { vendors, loading: { vendors: loadingVendors }, fetchVendors } = useAdminStore()

  // Selection & Mode State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [activeTab, setActiveTab] = useState('batch') // 'single' | 'batch' | 'csv' | 'catalog'
  
  // Single Product Modal
  const [showSingleModal, setShowSingleModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Catalog State
  const [vendorProducts, setVendorProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  // Batch Table State (Multi-row form)
  const [batchRows, setBatchRows] = useState([
    { id: 1, name: '', category: 'Fresh Produce', price: '', unit: 'piece', stock: '50', description: '', images: '' },
    { id: 2, name: '', category: 'Pantry & Grains', price: '', unit: 'kg', stock: '20', description: '', images: '' }
  ])
  const [submittingBatch, setSubmittingBatch] = useState(false)
  const [batchFeedback, setBatchFeedback] = useState(null)

  // CSV Import State
  const fileInputRef = useRef(null)
  const [csvFile, setCsvFile] = useState(null)
  const [parsedCsvItems, setParsedCsvItems] = useState([])
  const [submittingCsv, setSubmittingCsv] = useState(false)
  const [csvFeedback, setCsvFeedback] = useState(null)

  // Delete product confirmation
  const [productToDelete, setProductToDelete] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(false)

  // Fetch Vendors on mount
  useEffect(() => {
    fetchVendors({ status: 'approved' })
  }, [])

  // Auto-select vendor if URL vendorId changes or vendors finish loading
  useEffect(() => {
    if (urlVendorId && vendors.length > 0) {
      const match = vendors.find(v => v._id === urlVendorId)
      if (match) {
        setSelectedVendor(match)
      }
    }
  }, [urlVendorId, vendors])

  // Fetch Vendor Products when vendor changes
  useEffect(() => {
    if (selectedVendor) {
      loadVendorProducts(selectedVendor._id)
    } else {
      setVendorProducts([])
    }
  }, [selectedVendor])

  const loadVendorProducts = async (vendorId) => {
    setLoadingProducts(true)
    try {
      const res = await getProductsByVendor(vendorId)
      if (res?.success) {
        setVendorProducts(res.data?.products || res.data || [])
      } else if (Array.isArray(res)) {
        setVendorProducts(res)
      }
    } catch (e) {
      console.warn('Failed to load vendor products:', e.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Filter vendors list
  const filteredVendors = vendors.filter(v => {
    const term = searchQuery.toLowerCase()
    const name = (v.storeName || v.businessName || '').toLowerCase()
    const email = (v.user?.email || '').toLowerCase()
    const category = (v.category || '').toLowerCase()
    return name.includes(term) || email.includes(term) || category.includes(term)
  })

  // Select Vendor
  const handleSelectVendor = (vendor) => {
    setSelectedVendor(vendor)
    setSearchParams({ vendorId: vendor._id })
  }

  // Clear Selected Vendor
  const handleClearVendor = () => {
    setSelectedVendor(null)
    setSearchParams({})
  }

  // Add row to Batch Table
  const addBatchRow = () => {
    const newId = Date.now()
    setBatchRows(prev => [
      ...prev,
      { id: newId, name: '', category: 'Fresh Produce', price: '', unit: 'piece', stock: '50', description: '', images: '' }
    ])
  }

  // Remove row from Batch Table
  const removeBatchRow = (id) => {
    if (batchRows.length <= 1) return
    setBatchRows(prev => prev.filter(r => r.id !== id))
  }

  // Update row field
  const updateBatchRow = (id, field, value) => {
    setBatchRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  // Submit Batch Rows
  const handleSubmitBatch = async () => {
    if (!selectedVendor) return

    // Filter valid rows
    const validProducts = batchRows
      .filter(r => r.name.trim() && r.price && !isNaN(parseFloat(r.price)))
      .map(r => ({
        name: r.name.trim(),
        category: r.category || 'General',
        price: parseFloat(r.price),
        unit: r.unit || 'piece',
        stock: parseInt(r.stock || 50, 10),
        description: r.description.trim() || r.name.trim(),
        images: r.images.trim() ? [r.images.trim()] : undefined
      }))

    if (validProducts.length === 0) {
      setBatchFeedback({ type: 'error', message: 'Please complete at least one row with a valid Name and Price.' })
      return
    }

    setSubmittingBatch(true)
    setBatchFeedback(null)

    try {
      const res = await bulkCreateProductsForVendor(selectedVendor._id, validProducts)
      if (res?.success) {
        setBatchFeedback({
          type: 'success',
          message: `Successfully uploaded ${res.data?.createdCount || validProducts.length} product(s) for ${selectedVendor.storeName || selectedVendor.businessName}!`
        })
        // Reset rows to fresh empty template
        setBatchRows([
          { id: 1, name: '', category: 'Fresh Produce', price: '', unit: 'piece', stock: '50', description: '', images: '' },
          { id: 2, name: '', category: 'Pantry & Grains', price: '', unit: 'kg', stock: '20', description: '', images: '' }
        ])
        loadVendorProducts(selectedVendor._id)
      } else {
        setBatchFeedback({ type: 'error', message: res?.message || 'Failed to bulk upload products.' })
      }
    } catch (err) {
      setBatchFeedback({ type: 'error', message: err.message || 'An error occurred during upload.' })
    } finally {
      setSubmittingBatch(false)
    }
  }

  // Download CSV Template
  const downloadCsvTemplate = () => {
    const headers = 'name,category,price,unit,stock,description,images\n'
    const example1 = 'Plantain (Ripe),Fresh Produce,3.50,kg,100,Sweet ripe plantains sourced directly,https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500\n'
    const example2 = 'Egusi Seeds (Ground),Pantry & Grains,5.99,pack,40,Premium ground egusi melon seeds,\n'
    
    const blob = new Blob([headers + example1 + example2], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'afrimercato_products_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse CSV File
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setCsvFile(file)
    setCsvFeedback(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '')
      if (lines.length <= 1) {
        setCsvFeedback({ type: 'error', message: 'CSV file appears empty or has no data rows.' })
        return
      }

      // Simple CSV line splitter handling quoted text
      const parseCsvLine = (line) => {
        const result = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      }

      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
      const rows = []

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i])
        if (values.length < 2) continue

        const rowObj = {}
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || ''
        })

        const name = rowObj.name || values[0] || ''
        const category = rowObj.category || values[1] || 'General'
        const price = parseFloat(rowObj.price || values[2] || 0)
        const unit = rowObj.unit || values[3] || 'piece'
        const stock = parseInt(rowObj.stock || values[4] || 50, 10)
        const description = rowObj.description || values[5] || name
        const imagesStr = rowObj.images || values[6] || ''

        if (name && !isNaN(price)) {
          rows.push({
            name,
            category: category || 'General',
            price,
            unit: PRODUCT_UNITS.includes(unit.toLowerCase()) ? unit.toLowerCase() : 'piece',
            stock: isNaN(stock) ? 50 : stock,
            description,
            images: imagesStr ? [imagesStr] : undefined,
            isValid: true
          })
        }
      }

      if (rows.length === 0) {
        setCsvFeedback({ type: 'error', message: 'No valid product rows could be extracted from this CSV file.' })
      } else {
        setParsedCsvItems(rows)
        setCsvFeedback({ type: 'success', message: `Parsed ${rows.length} valid product rows ready for import!` })
      }
    }
    reader.readAsText(file)
  }

  // Upload Parsed CSV Items
  const handleImportCsv = async () => {
    if (!selectedVendor || parsedCsvItems.length === 0) return

    setSubmittingCsv(true)
    setCsvFeedback(null)

    try {
      const res = await bulkCreateProductsForVendor(selectedVendor._id, parsedCsvItems)
      if (res?.success) {
        setCsvFeedback({
          type: 'success',
          message: `Bulk import completed! ${res.data?.createdCount || parsedCsvItems.length} products created successfully.`
        })
        setParsedCsvItems([])
        setCsvFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        loadVendorProducts(selectedVendor._id)
      } else {
        setCsvFeedback({ type: 'error', message: res?.message || 'CSV Import failed.' })
      }
    } catch (err) {
      setCsvFeedback({ type: 'error', message: err.message || 'An error occurred during import.' })
    } finally {
      setSubmittingCsv(false)
    }
  }

  // Delete product action
  const handleDeleteProduct = async () => {
    if (!productToDelete || !selectedVendor) return
    setDeletingProduct(true)
    try {
      const res = await deleteProductForVendor(selectedVendor._id, productToDelete._id)
      if (res?.success) {
        setVendorProducts(prev => prev.filter(p => p._id !== productToDelete._id))
        setProductToDelete(null)
      }
    } catch (err) {
      alert(err.message || 'Failed to delete product')
    } finally {
      setDeletingProduct(false)
    }
  }

  // Filter Catalog Products
  const filteredCatalog = vendorProducts.filter(p => {
    const term = catalogSearch.toLowerCase()
    return (p.name || '').toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term)
  })

  return (
    <div className="min-h-screen bg-afri-gray-50 p-4 md:p-8 text-afri-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-afri-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/admin/dashboard" className="text-xs text-gray-500 hover:text-afri-green flex items-center gap-1 mb-2 font-medium">
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-afri-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-afri-green to-afri-green-dark flex items-center justify-center text-white shadow-md">
                <PackagePlus className="w-5 h-5" />
              </div>
              Vendor Product Upload Assist
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Select a vendor to upload single products, batch insert inventory, or import bulk CSV catalogs.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 bg-afri-gray-50 p-3 rounded-xl border border-afri-gray-100 flex-shrink-0">
            <div className="text-center px-3 border-r border-afri-gray-200">
              <p className="text-xs text-gray-400 font-semibold uppercase">Approved Vendors</p>
              <p className="text-xl font-black text-afri-green">{vendors.length}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-gray-400 font-semibold uppercase">Active Store</p>
              <p className="text-sm font-bold text-afri-gray-900 truncate max-w-[140px]">
                {selectedVendor ? (selectedVendor.storeName || selectedVendor.businessName) : 'None Selected'}
              </p>
            </div>
          </div>
        </div>

        {/* STEP 1: VENDOR SELECTION SECTION */}
        {!selectedVendor ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-afri-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-afri-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-afri-green" /> Step 1: Select Approved Vendor
                </h2>
                <p className="text-xs text-gray-500">Choose the store you want to create or manage products for.</p>
              </div>

              {/* Search Vendor Input */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search store name, email, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-afri-gray-50 border border-afri-gray-200 rounded-xl focus:ring-2 focus:ring-afri-green focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {loadingVendors ? (
              <div className="text-center py-16">
                <RefreshCw className="w-8 h-8 text-afri-green animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading approved vendors...</p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="bg-afri-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-200">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 text-base mb-1">No matching approved vendors found</h3>
                <p className="text-xs text-gray-500">Ensure the vendor has been approved in Vendor Management first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.map((v, i) => (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectVendor(v)}
                    className="bg-white rounded-2xl p-4 border border-afri-gray-100 shadow-sm hover:shadow-md hover:border-afri-green/40 hover:ring-2 hover:ring-afri-green/10 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-afri-green-pale flex items-center justify-center text-afri-green flex-shrink-0 group-hover:scale-105 transition-transform font-black text-lg">
                        {(v.storeName || v.businessName)?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-afri-gray-900 text-sm truncate group-hover:text-afri-green transition-colors">
                          {v.storeName || v.businessName}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">{v.user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold bg-afri-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                            {v.category || 'Grocery'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {v.address?.city ? `${v.address.city}, UK` : 'UK Store'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-afri-gray-50 flex items-center justify-between text-xs text-afri-green font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Select Vendor</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (

          /* STEP 2: VENDOR SELECTED WORKSPACE */
          <div className="space-y-6">

            {/* Vendor Banner Bar */}
            <div className="bg-gradient-to-r from-afri-gray-900 to-[#1A2621] text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-afri-green text-white flex items-center justify-center font-black text-xl shadow-md">
                  {(selectedVendor.storeName || selectedVendor.businessName)?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">
                      {selectedVendor.storeName || selectedVendor.businessName}
                    </h2>
                    <span className="bg-afri-green/20 text-afri-green border border-afri-green/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Approved Vendor
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-0.5 flex items-center gap-3">
                    <span>Email: {selectedVendor.user?.email}</span>
                    <span>•</span>
                    <span>Category: {selectedVendor.category || 'General'}</span>
                    <span>•</span>
                    <span>Products in Store: <strong>{vendorProducts.length}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSingleModal(true)}
                  className="bg-afri-green hover:bg-afri-green-dark text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Single Product Wizard
                </button>
                <button
                  onClick={handleClearVendor}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Switch Vendor
                </button>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-afri-gray-100 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'batch'
                    ? 'bg-afri-green text-white shadow-sm'
                    : 'text-gray-600 hover:bg-afri-gray-50'
                }`}
              >
                <Layers className="w-4 h-4" /> Quick Multi-Item Form
              </button>
              <button
                onClick={() => setActiveTab('csv')}
                className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'csv'
                    ? 'bg-afri-green text-white shadow-sm'
                    : 'text-gray-600 hover:bg-afri-gray-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV / File Bulk Import
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'catalog'
                    ? 'bg-afri-green text-white shadow-sm'
                    : 'text-gray-600 hover:bg-afri-gray-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Store Products ({vendorProducts.length})
              </button>
            </div>

            {/* TAB CONTENT 1: QUICK MULTI-ITEM BATCH ENTRY FORM */}
            {activeTab === 'batch' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-afri-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-afri-gray-100">
                  <div>
                    <h3 className="font-bold text-afri-gray-900 text-base flex items-center gap-2">
                      <Layers className="w-5 h-5 text-afri-green" /> Quick Multi-Product Batch Entry
                    </h3>
                    <p className="text-xs text-gray-500">Fill in multiple items in this interactive table to quickly upload products for this vendor.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addBatchRow}
                      className="bg-afri-green-pale text-afri-green hover:bg-afri-green/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Row
                    </button>
                  </div>
                </div>

                {batchFeedback && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                    batchFeedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {batchFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    <span>{batchFeedback.message}</span>
                  </div>
                )}

                {/* Batch Table */}
                <div className="overflow-x-auto border border-afri-gray-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-afri-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-afri-gray-100">
                        <th className="py-3 px-3 w-8">#</th>
                        <th className="py-3 px-3 min-w-[180px]">Product Name *</th>
                        <th className="py-3 px-3 min-w-[140px]">Category</th>
                        <th className="py-3 px-3 min-w-[100px]">Price (£) *</th>
                        <th className="py-3 px-3 min-w-[100px]">Unit</th>
                        <th className="py-3 px-3 min-w-[90px]">Stock</th>
                        <th className="py-3 px-3 min-w-[200px]">Description</th>
                        <th className="py-3 px-3 min-w-[160px]">Image URL (Optional)</th>
                        <th className="py-3 px-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-afri-gray-100">
                      {batchRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-afri-gray-50/50 transition-colors">
                          <td className="py-3 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="e.g. Fresh Yam"
                              value={row.name}
                              onChange={(e) => updateBatchRow(row.id, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.category}
                              onChange={(e) => updateBatchRow(row.id, 'category', e.target.value)}
                              className="w-full px-2 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none"
                            >
                              {COMMON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={row.price}
                              onChange={(e) => updateBatchRow(row.id, 'price', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none font-bold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.unit}
                              onChange={(e) => updateBatchRow(row.id, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none capitalize"
                            >
                              {PRODUCT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              value={row.stock}
                              onChange={(e) => updateBatchRow(row.id, 'stock', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="Short description..."
                              value={row.description}
                              onChange={(e) => updateBatchRow(row.id, 'description', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="https://..."
                              value={row.images}
                              onChange={(e) => updateBatchRow(row.id, 'images', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-afri-gray-50 border border-afri-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-afri-green focus:bg-white outline-none"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeBatchRow(row.id)}
                              disabled={batchRows.length <= 1}
                              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={addBatchRow}
                    className="text-afri-green hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add another row
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmitBatch}
                    disabled={submittingBatch}
                    className="bg-afri-green hover:bg-afri-green-dark text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingBatch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Uploading Batch...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> Batch Upload All Products
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: CSV BULK FILE IMPORT */}
            {activeTab === 'csv' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-afri-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-afri-gray-100">
                  <div>
                    <h3 className="font-bold text-afri-gray-900 text-base flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-afri-green" /> CSV / File Bulk Import
                    </h3>
                    <p className="text-xs text-gray-500">Upload a CSV spreadsheet with product details to import inventory in bulk.</p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCsvTemplate}
                    className="bg-afri-gray-50 hover:bg-afri-gray-100 text-afri-gray-900 border border-afri-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-afri-green" /> Download CSV Template
                  </button>
                </div>

                {csvFeedback && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                    csvFeedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {csvFeedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    <span>{csvFeedback.message}</span>
                  </div>
                )}

                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-afri-gray-200 hover:border-afri-green bg-afri-gray-50/50 hover:bg-afri-green-pale/20 rounded-2xl p-8 text-center cursor-pointer transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileChange}
                    className="hidden"
                  />
                  <FileSpreadsheet className="w-12 h-12 text-afri-green mx-auto mb-3" />
                  <h4 className="font-bold text-afri-gray-900 text-sm mb-1">
                    {csvFile ? csvFile.name : 'Click to select CSV File or drag here'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Supports .csv format. Column headers required: name, category, price, unit, stock, description, images
                  </p>
                </div>

                {/* Parsed Items Preview */}
                {parsedCsvItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-afri-gray-900 uppercase tracking-wider">
                        Extracted Products Preview ({parsedCsvItems.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleImportCsv}
                        disabled={submittingCsv}
                        className="bg-afri-green hover:bg-afri-green-dark text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {submittingCsv ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Import {parsedCsvItems.length} Products Now
                          </>
                        )}
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-afri-gray-100 rounded-xl text-xs">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-afri-gray-50 text-gray-500 font-bold border-b border-afri-gray-100">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Price</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3">Stock</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-afri-gray-100 bg-white">
                          {parsedCsvItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-afri-gray-50">
                              <td className="py-2 px-3 text-gray-400 font-semibold">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-afri-gray-900">{item.name}</td>
                              <td className="py-2 px-3 text-gray-600">{item.category}</td>
                              <td className="py-2 px-3 font-bold text-afri-green">£{item.price.toFixed(2)}</td>
                              <td className="py-2 px-3 text-gray-500 capitalize">{item.unit}</td>
                              <td className="py-2 px-3 text-gray-600">{item.stock}</td>
                              <td className="py-2 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Valid
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: VENDOR STORE PRODUCTS CATALOG */}
            {activeTab === 'catalog' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-afri-gray-100 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-afri-gray-100">
                  <div>
                    <h3 className="font-bold text-afri-gray-900 text-base flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-afri-green" /> Vendor Products ({vendorProducts.length})
                    </h3>
                    <p className="text-xs text-gray-500">Live products belonging to {selectedVendor.storeName || selectedVendor.businessName}</p>
                  </div>

                  {/* Catalog Search */}
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-afri-gray-50 border border-afri-gray-200 rounded-xl focus:ring-1 focus:ring-afri-green focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-6 h-6 text-afri-green animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading catalog...</p>
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="bg-afri-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-600">No products found in vendor catalog</p>
                    <p className="text-xs text-gray-400 mt-1">Use the Multi-Item Form or Single Product Wizard to add products.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-afri-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-afri-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-afri-gray-100">
                          <th className="py-3 px-3">Product</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3">Unit</th>
                          <th className="py-3 px-3">Stock Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-afri-gray-100">
                        {filteredCatalog.map(p => {
                          const img = p.images?.[0]?.url || p.images?.[0] || 'https://via.placeholder.com/60'
                          return (
                            <tr key={p._id} className="hover:bg-afri-gray-50/50 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={img}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/60' }}
                                  />
                                  <div>
                                    <p className="font-bold text-afri-gray-900">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 line-clamp-1">{p.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-gray-600">
                                {p.category}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-afri-green">
                                £{Number(p.price || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-gray-500 capitalize">
                                {p.unit || 'piece'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  p.stock > 10 ? 'bg-green-100 text-green-800' :
                                  p.stock > 0 ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p)
                                      setShowSingleModal(true)
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-afri-green bg-afri-gray-50 rounded-lg transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(p)}
                                    className="p-1.5 text-gray-500 hover:text-red-500 bg-afri-gray-50 rounded-lg transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* SINGLE PRODUCT CREATION / EDIT FORM MODAL */}
      {showSingleModal && selectedVendor && (
        <ProductCreationForm
          vendorId={selectedVendor._id}
          vendorName={selectedVendor.storeName || selectedVendor.businessName}
          product={editingProduct}
          onClose={() => {
            setShowSingleModal(false)
            setEditingProduct(null)
          }}
          onSave={() => {
            setShowSingleModal(false)
            setEditingProduct(null)
            if (selectedVendor) loadVendorProducts(selectedVendor._id)
          }}
        />
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-afri-gray-900 text-base">Remove Product?</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Are you sure you want to remove <strong>"{productToDelete.name}"</strong> from {selectedVendor?.storeName || 'this vendor'}'s catalogue?
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDeleteProduct}
                    disabled={deletingProduct}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {deletingProduct ? 'Removing...' : 'Confirm Remove'}
                  </button>
                  <button
                    onClick={() => setProductToDelete(null)}
                    disabled={deletingProduct}
                    className="flex-1 bg-afri-gray-100 hover:bg-afri-gray-200 text-afri-gray-900 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

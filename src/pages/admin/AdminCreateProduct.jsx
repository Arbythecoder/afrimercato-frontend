import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PackagePlus, Store, ChevronLeft, Search } from 'lucide-react'
import useAdminStore from '../../stores/useAdminStore'
import ProductCreationForm from '../../components/Products/ProductCreationForm'

function AdminCreateProduct() {
  const { vendors, loading: { vendors: loading }, fetchVendors } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchVendors({ status: 'approved' })
  }, [])

  const filteredVendors = vendors.filter(v =>
    (v.storeName || v.businessName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectVendor = (vendor) => {
    setSelectedVendor(vendor)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <PackagePlus className="w-8 h-8 mr-3 text-afri-green" />
            Create Product for Vendor
          </h1>
          <p className="text-gray-600">Select a vendor below, then fill in the product details on their behalf</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search approved vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Vendor List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vendors...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No approved vendors found</h3>
            <p className="text-gray-500">Only approved vendors can have products created on their behalf</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredVendors.map((vendor, index) => (
              <motion.button
                key={vendor._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSelectVendor(vendor)}
                className="bg-white rounded-xl shadow-lg p-5 text-left hover:shadow-xl hover:ring-2 hover:ring-afri-green transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-afri-green-pale flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-afri-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{vendor.storeName || vendor.businessName}</p>
                    <p className="text-sm text-gray-500 truncate">{vendor.user?.email}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {showForm && selectedVendor && (
        <ProductCreationForm
          vendorId={selectedVendor._id}
          vendorName={selectedVendor.storeName || selectedVendor.businessName}
          onClose={() => {
            setShowForm(false)
            setSelectedVendor(null)
          }}
          onSave={(response) => {
            if (response && response.success) {
              setShowForm(false)
              setSelectedVendor(null)
            }
          }}
        />
      )}
    </div>
  )
}

export default AdminCreateProduct

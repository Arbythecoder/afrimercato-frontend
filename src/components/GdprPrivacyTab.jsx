/**
 * GDPR Privacy & Data Rights Component
 * 
 * Provides UK GDPR Data Rights to all user roles (Customers, Vendors, Riders, Pickers):
 * 1. Data Portability / Export: Download full JSON payload of all stored personal & role data.
 * 2. Privacy Complaint Submission: Submit a formal data protection complaint.
 * 3. Right to be Forgotten / Account Anonymization: Anonymize personal fields while keeping order & accounting audit logs intact.
 */

import { useState } from 'react'
import { exportMyData, requestAccountDeletion, submitPrivacyComplaint } from '../services/api'
import { FiDownload, FiAlertTriangle, FiSend, FiCheckCircle } from 'react-icons/fi'
import * as XLSX from 'xlsx'

export default function GdprPrivacyTab({ roleTitle = 'account' }) {
  const [exportLoading, setExportLoading] = useState(false)
  const [complaintMessage, setComplaintMessage] = useState('')
  const [complaintLoading, setComplaintLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  const handleExportData = async () => {
    setExportLoading(true)
    setStatusMessage({ type: '', text: '' })
    try {
      const data = await exportMyData()
      
      const wb = XLSX.utils.book_new()

      const flattenObject = (obj, prefix = '') => {
        const result = {}
        for (const [key, val] of Object.entries(obj || {})) {
          if (val === null || val === undefined) continue
          if (typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
            Object.assign(result, flattenObject(val, `${prefix}${key}.`))
          } else if (Array.isArray(val)) {
            result[`${prefix}${key}`] = JSON.stringify(val)
          } else {
            result[`${prefix}${key}`] = val
          }
        }
        return result
      }

      // 1. User Profile Sheet
      if (data.user) {
        const userFlat = flattenObject(data.user)
        const userRows = Object.entries(userFlat).map(([Field, Value]) => ({ Field, Value: String(Value) }))
        const userSheet = XLSX.utils.json_to_sheet(userRows)
        XLSX.utils.book_append_sheet(wb, userSheet, 'User Profile')
      }

      // 2. Orders Sheet
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        const orderRows = data.orders.map(order => ({
          'Order ID': order._id || order.id || '',
          'Date': order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
          'Status': order.status || '',
          'Total (£)': order.pricing?.total ?? order.total ?? 0,
          'Payment Method': order.paymentMethod || '',
          'Items': Array.isArray(order.items)
            ? order.items.map(i => `${i.name || i.productName || 'Item'} (x${i.quantity || 1})`).join('; ')
            : '',
          'Delivery Address': typeof order.deliveryAddress === 'object'
            ? `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''} ${order.deliveryAddress?.postcode || ''}`.trim()
            : String(order.deliveryAddress || '')
        }))
        const ordersSheet = XLSX.utils.json_to_sheet(orderRows)
        XLSX.utils.book_append_sheet(wb, ordersSheet, 'Orders')
      } else {
        const emptyOrdersSheet = XLSX.utils.json_to_sheet([{ Message: 'No order history available' }])
        XLSX.utils.book_append_sheet(wb, emptyOrdersSheet, 'Orders')
      }

      // 3. Reviews Sheet
      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        const reviewRows = data.reviews.map(r => ({
          'Review ID': r._id || r.id || '',
          'Rating': r.rating || 0,
          'Comment': r.comment || '',
          'Date': r.createdAt ? new Date(r.createdAt).toLocaleString() : ''
        }))
        const reviewsSheet = XLSX.utils.json_to_sheet(reviewRows)
        XLSX.utils.book_append_sheet(wb, reviewsSheet, 'Reviews')
      }

      // 4. Vendor Profile Sheet (if vendor)
      if (data.vendorProfile) {
        const vendorFlat = flattenObject(data.vendorProfile)
        const vendorRows = Object.entries(vendorFlat).map(([Field, Value]) => ({ Field, Value: String(Value) }))
        const vendorSheet = XLSX.utils.json_to_sheet(vendorRows)
        XLSX.utils.book_append_sheet(wb, vendorSheet, 'Vendor Profile')
      }

      // 5. Rider Profile Sheet (if rider/picker)
      if (data.riderProfile) {
        const riderFlat = flattenObject(data.riderProfile)
        const riderRows = Object.entries(riderFlat).map(([Field, Value]) => ({ Field, Value: String(Value) }))
        const riderSheet = XLSX.utils.json_to_sheet(riderRows)
        XLSX.utils.book_append_sheet(wb, riderSheet, 'Rider Profile')
      }

      const fileName = `afrimercato-${roleTitle.toLowerCase()}-privacy-data.xlsx`
      XLSX.writeFile(wb, fileName)

      setStatusMessage({ type: 'success', text: 'Privacy data downloaded successfully in Excel (.xlsx) format!' })
    } catch (error) {
      console.error('Data export error:', error)
      setStatusMessage({ type: 'error', text: error.message || 'Failed to export data' })
    } finally {
      setExportLoading(false)
    }
  }

  const handleSubmitComplaint = async (e) => {
    e.preventDefault()
    if (!complaintMessage.trim()) return
    setComplaintLoading(true)
    setStatusMessage({ type: '', text: '' })
    try {
      await submitPrivacyComplaint(complaintMessage.trim())
      setStatusMessage({ type: 'success', text: 'Complaint submitted. Our Data Protection Officer will respond within 30 days.' })
      setComplaintMessage('')
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message || 'Failed to submit complaint' })
    } finally {
      setComplaintLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    if (!window.confirm(`Are you sure you want to permanently anonymize your ${roleTitle} account? This action CANNOT be undone.`)) {
      return
    }
    setDeleteLoading(true)
    setStatusMessage({ type: '', text: '' })
    try {
      await requestAccountDeletion()
      setStatusMessage({ type: 'success', text: 'Your account data has been anonymized. You will now be logged out.' })
      setTimeout(() => {
        window.location.href = '/'
      }, 2500)
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message || 'Account deletion request failed' })
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Alert Status Banner */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl font-medium flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? <FiCheckCircle className="flex-shrink-0" /> : <FiAlertTriangle className="flex-shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Request / Download My Data */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Download My Data (Portability)</h3>
        <p className="text-sm text-gray-600 mb-5">
          Under UK GDPR, you have the right to request a complete copy of your personal data, profile history, and activity records in Excel (.xlsx) format.
        </p>
        <button
          type="button"
          onClick={handleExportData}
          disabled={exportLoading}
          className="flex items-center gap-2 px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark transition-all disabled:opacity-50"
        >
          <FiDownload />
          {exportLoading ? 'Preparing Excel File...' : 'Download My Data (Excel)'}
        </button>
      </div>

      {/* 2. Submit a Privacy Complaint */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Submit a Data Protection Complaint</h3>
        <p className="text-sm text-gray-600 mb-5">
          Have questions or concerns about how Afrimercato processes your data? Submit your inquiry directly to our Data Protection team. We will acknowledge and respond within 30 days.
        </p>
        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          <textarea
            value={complaintMessage}
            onChange={(e) => setComplaintMessage(e.target.value)}
            rows={4}
            placeholder="Describe your privacy concern or complaint in detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
          />
          <button
            type="submit"
            disabled={complaintLoading || !complaintMessage.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark transition-all disabled:opacity-50"
          >
            <FiSend />
            {complaintLoading ? 'Submitting...' : 'Submit Privacy Complaint'}
          </button>
        </form>
      </div>

      {/* 3. Right to be Forgotten / Delete Account */}
      <div className="border border-red-200 rounded-xl p-6 bg-red-50/50 shadow-sm">
        <h3 className="text-lg font-bold text-red-800 mb-1">Delete & Anonymize My Account</h3>
        <p className="text-sm text-red-700 mb-5">
          Exercising your Right to be Forgotten will permanently anonymize your name, email, contact details, and document records. Historical transaction logs will be retained anonymously for UK tax and accounting compliance.
        </p>
        <div className="max-w-md space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Type <span className="font-mono font-bold text-red-700">DELETE</span> to confirm account anonymization
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 bg-white"
          />
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'DELETE' || deleteLoading}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {deleteLoading ? 'Anonymizing Account...' : 'Permanently Delete & Anonymize Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { vendorAPI } from '../services/api'

// Get business/vendor info
const getVendorInfo = async () => {
  try {
    const response = await vendorAPI.getProfile()
    if (response.data.success) {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error('Error fetching vendor info:', error)
    return null
  }
}

// Format currency
const formatCurrency = (amount) => {
  return `£${amount?.toLocaleString() || '0'}`
}

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order details
 * @returns {jsPDF} PDF document object
 */
export const generateInvoicePDF = async (order) => {
  const vendorInfo = await getVendorInfo()
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: `Invoice - ${order.orderNumber}`,
    subject: 'Order Invoice',
    author: vendorInfo?.businessName || 'Afrimercato Vendor',
    keywords: 'invoice, order, afrimercato',
    creator: 'Afrimercato Vendor Dashboard'
  })

  // Add logo if available
  if (vendorInfo?.logo) {
    try {
      doc.addImage(vendorInfo.logo, 'PNG', 15, 15, 50, 30)
    } catch (error) {
      console.warn('Could not add vendor logo:', error)
    }
  }

  // Header - Business Info
  doc.setFontSize(20)
  doc.setTextColor(74, 124, 44) // afri-green color
  doc.text('INVOICE', 150, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  const businessInfo = [
    vendorInfo?.businessName || 'Business Name',
    vendorInfo?.address?.street || '',
    `${vendorInfo?.address?.city || ''}, ${vendorInfo?.address?.state || ''}`,
    `${vendorInfo?.address?.country || ''} ${vendorInfo?.address?.postcode || ''}`,
    `Tel: ${vendorInfo?.phone || 'N/A'}`,
    `Email: ${vendorInfo?.email || 'N/A'}`
  ]
  
  businessInfo.forEach((line, index) => {
    doc.text(line, 15, 50 + (index * 5))
  })

  // Invoice Details
  doc.setFontSize(10)
  const invoiceDetails = [
    ['Invoice No:', order.orderNumber],
    ['Date:', formatDate(order.createdAt)],
    ['Due Date:', formatDate(order.createdAt)], // Same as order date for COD
    ['Status:', order.status.replace('_', ' ').toUpperCase()]
  ]
  
  invoiceDetails.forEach((line, index) => {
    doc.text(line[0], 120, 50 + (index * 5))
    doc.text(line[1], 150, 50 + (index * 5))
  })

  // Customer Information
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Bill To:', 15, 85)
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  const customerInfo = [
    order.customer?.name || 'Customer Name',
    order.deliveryAddress?.street || '',
    `${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''}`,
    order.deliveryAddress?.country || '',
    `Phone: ${order.deliveryAddress?.phone || 'N/A'}`
  ]
  
  customerInfo.forEach((line, index) => {
    doc.text(line, 15, 92 + (index * 5))
  })

  // Order Items Table
  doc.autoTable({
    startY: 120,
    head: [['Item', 'Quantity', 'Unit Price', 'Total']],
    body: order.items?.map(item => [
      item.product?.name || 'Unknown Product',
      item.quantity,
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity)
    ]) || [],
    styles: {
      cellPadding: 2,
      fontSize: 9,
      lineColor: [74, 124, 44],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [74, 124, 44],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  })

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10
  
  const totalsStyle = {
    fontSize: 10,
    rightAlign: true
  }

  doc.setFontSize(totalsStyle.fontSize)
  
  // Subtotal
  doc.text('Subtotal:', 140, finalY)
  doc.text(formatCurrency(order.pricing?.subtotal), 190, finalY, { align: 'right' })
  
  // Delivery Fee
  doc.text('Delivery Fee:', 140, finalY + 7)
  doc.text(formatCurrency(order.pricing?.deliveryFee), 190, finalY + 7, { align: 'right' })
  
  // Platform Fee
  doc.text('Platform Fee:', 140, finalY + 14)
  doc.text(`-${formatCurrency(order.pricing?.platformFee)}`, 190, finalY + 14, { align: 'right' })

  // Total
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.text('Total:', 140, finalY + 25)
  doc.text(formatCurrency(order.pricing?.total), 190, finalY + 25, { align: 'right' })

  // Footer
  const footerY = doc.internal.pageSize.height - 20
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, footerY - 5, { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, footerY, { align: 'center' })

  return doc
}

/**
 * Generate shipping label PDF
 * @param {Object} order - Order details
 * @returns {jsPDF} PDF document object
 */
export const generateShippingLabel = async (order) => {
  const vendorInfo = await getVendorInfo()
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [100, 150] // Standard shipping label size
  })

  // Add logo if available
  if (vendorInfo?.logo) {
    try {
      doc.addImage(vendorInfo.logo, 'PNG', 5, 5, 20, 12)
    } catch (error) {
      console.warn('Could not add vendor logo:', error)
    }
  }

  // Shipping Label Header
  doc.setFontSize(16)
  doc.setTextColor(74, 124, 44)
  doc.text('SHIPPING LABEL', 75, 10, { align: 'center' })

  // Order Details
  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text(`Order: ${order.orderNumber}`, 75, 20, { align: 'center' })
  doc.text(`Date: ${formatDate(order.createdAt)}`, 75, 27, { align: 'center' })

  // From Address (Vendor)
  doc.setFontSize(10)
  doc.text('From:', 10, 40)
  doc.setFontSize(9)
  const fromAddress = [
    vendorInfo?.businessName || 'Business Name',
    vendorInfo?.address?.street || '',
    `${vendorInfo?.address?.city || ''}, ${vendorInfo?.address?.state || ''}`,
    vendorInfo?.address?.country || '',
    `Tel: ${vendorInfo?.phone || 'N/A'}`
  ]
  
  fromAddress.forEach((line, index) => {
    doc.text(line, 10, 45 + (index * 4))
  })

  // To Address (Customer)
  doc.setFontSize(10)
  doc.text('To:', 80, 40)
  doc.setFontSize(9)
  const toAddress = [
    order.customer?.name || 'Customer Name',
    order.deliveryAddress?.street || '',
    `${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''}`,
    order.deliveryAddress?.country || '',
    `Phone: ${order.deliveryAddress?.phone || 'N/A'}`
  ]
  
  toAddress.forEach((line, index) => {
    doc.text(line, 80, 45 + (index * 4))
  })

  // Package Info
  doc.setFontSize(10)
  doc.text('Package Info:', 10, 70)
  doc.setFontSize(9)
  doc.text(`Total Items: ${order.items?.length || 0}`, 10, 75)
  doc.text(`Weight: N/A`, 10, 80)
  doc.text(`Special Instructions: ${order.deliveryNotes || 'None'}`, 10, 85)

  return doc
}

/**
 * Generate packing slip PDF
 * @param {Object} order - Order details
 * @returns {jsPDF} PDF document object
 */
export const generatePackingSlip = async (order) => {
  const vendorInfo = await getVendorInfo()
  const doc = new jsPDF()

  // Add logo if available
  if (vendorInfo?.logo) {
    try {
      doc.addImage(vendorInfo.logo, 'PNG', 15, 15, 40, 24)
    } catch (error) {
      console.warn('Could not add vendor logo:', error)
    }
  }

  // Header
  doc.setFontSize(20)
  doc.setTextColor(74, 124, 44)
  doc.text('PACKING SLIP', 150, 20)

  // Order Details
  doc.setFontSize(11)
  doc.setTextColor(0)
  const orderDetails = [
    ['Order Number:', order.orderNumber],
    ['Order Date:', formatDate(order.createdAt)],
    ['Shipping Method:', 'Standard Delivery']
  ]
  
  orderDetails.forEach((line, index) => {
    doc.text(line[0], 120, 50 + (index * 6))
    doc.text(line[1], 160, 50 + (index * 6))
  })

  // Shipping Address
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Ship To:', 15, 85)
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  const shippingAddress = [
    order.customer?.name || 'Customer Name',
    order.deliveryAddress?.street || '',
    `${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''}`,
    order.deliveryAddress?.country || '',
    `Phone: ${order.deliveryAddress?.phone || 'N/A'}`
  ]
  
  shippingAddress.forEach((line, index) => {
    doc.text(line, 15, 92 + (index * 5))
  })

  // Order Items Table
  doc.autoTable({
    startY: 120,
    head: [['Item', 'SKU', 'Quantity', 'Notes']],
    body: order.items?.map(item => [
      item.product?.name || 'Unknown Product',
      item.product?.sku || 'N/A',
      item.quantity,
      ''  // Space for manual notes
    ]) || [],
    styles: {
      cellPadding: 2,
      fontSize: 9,
      lineColor: [74, 124, 44],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [74, 124, 44],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 40 }
    }
  })

  // Special Instructions
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Special Instructions:', 15, finalY)
  doc.setFont(undefined, 'normal')
  doc.text(order.deliveryNotes || 'None', 15, finalY + 7)

  // Footer
  const footerY = doc.internal.pageSize.height - 20
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text('This is not an invoice. Please include this slip when packing the order.', doc.internal.pageSize.width / 2, footerY, { align: 'center' })

  return doc
}
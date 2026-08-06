import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  FiTrendingUp,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiXCircle,
  FiLayers,
  FiArrowUpRight
} from 'react-icons/fi'

const reportTypes = [
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Revenue, orders, and sales performance metrics',
    icon: '📊',
    color: 'afri-green',
    bg: 'bg-green-50 border-green-200 text-green-800'
  },
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Stock levels, low stock alerts, and inventory value',
    icon: '📦',
    color: 'blue-600',
    bg: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  {
    id: 'orders',
    name: 'Order Report',
    description: 'Order volume, status breakdown, and customer breakdown',
    icon: '📋',
    color: 'purple-600',
    bg: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Financial overview, daily breakdown, and fee summaries',
    icon: '💰',
    color: 'amber-600',
    bg: 'bg-amber-50 border-amber-200 text-amber-800'
  },
]

const dateRangePresets = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Custom Range', value: 'custom' },
]

function Reports() {
  const [selectedReport, setSelectedReport] = useState('sales')
  const [dateRange, setDateRange] = useState('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const getDateRange = () => {
    const now = new Date()
    let startDate, endDate

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date()
        break
      case 'yesterday':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        endDate = new Date()
        break
      case 'month':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        endDate = new Date()
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date()
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(now.setDate(now.getDate() - 7))
        endDate = customEndDate ? new Date(customEndDate) : new Date()
        break
      default:
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        endDate = new Date()
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      formattedStart: startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      formattedEnd: endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  const fetchReport = async () => {
    if (!selectedReport) return
    setLoading(true)
    setErrorMsg('')
    try {
      const { startDate, endDate } = getDateRange()
      let response

      switch (selectedReport) {
        case 'sales':
          response = await vendorAPI.getSalesReport({ startDate, endDate })
          break
        case 'inventory':
          response = await vendorAPI.getInventoryReport()
          break
        case 'orders':
          response = await vendorAPI.getOrdersReport({ startDate, endDate })
          break
        case 'revenue':
          response = await vendorAPI.getRevenueReport({ startDate, endDate })
          break
        default:
          throw new Error('Invalid report type selected')
      }

      if (response && response.success) {
        setReportData(response.data)
      } else {
        setErrorMsg((response && response.message) || 'Failed to fetch report data')
      }
    } catch (err) {
      console.error('Report fetch error:', err)
      setErrorMsg(err.message || 'Error connecting to server for reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [selectedReport, dateRange, customStartDate, customEndDate])

  // Normalization Helpers
  const getSalesMetrics = () => {
    const summary = reportData?.summary || {}
    return {
      totalRevenue: summary.totalRevenue ?? reportData?.totalRevenue ?? 0,
      totalOrders: summary.totalOrders ?? reportData?.totalOrders ?? 0,
      avgOrderValue: summary.averageOrderValue ?? summary.avgOrderValue ?? reportData?.avgOrderValue ?? 0,
      totalItemsSold: summary.totalItems ?? reportData?.totalItemsSold ?? 0,
      statusBreakdown: reportData?.statusBreakdown || [],
      topProducts: reportData?.topProducts || []
    }
  }

  const getInventoryMetrics = () => {
    const summary = reportData?.summary || {}
    const products = reportData?.products || []
    return {
      totalProducts: summary.totalProducts ?? products.length ?? 0,
      inStock: summary.inStockProducts ?? products.filter(p => p.inStock).length ?? 0,
      outOfStock: summary.outOfStockProducts ?? products.filter(p => !p.inStock).length ?? 0,
      lowStock: summary.lowStockProducts ?? products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.inStock).length ?? 0,
      totalValue: summary.totalValue ?? products.reduce((sum, p) => sum + (p.stock * p.price), 0) ?? 0,
      lowStockItems: reportData?.lowStockItems || products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.inStock) || [],
      outOfStockItems: reportData?.outOfStockItems || products.filter(p => !p.inStock) || [],
      allProducts: products
    }
  }

  const getOrdersMetrics = () => {
    const orders = reportData?.orders || []
    const statusCounts = reportData?.statusCounts || []
    return {
      totalOrders: reportData?.totalOrders ?? orders.length ?? 0,
      completed: statusCounts.find(s => ['delivered', 'completed'].includes(s._id))?.count || orders.filter(o => ['delivered', 'completed'].includes(o.status)).length || 0,
      pending: statusCounts.find(s => ['pending', 'confirmed', 'processing', 'ready_for_pickup'].includes(s._id))?.count || orders.filter(o => ['pending', 'confirmed', 'processing', 'ready_for_pickup'].includes(o.status)).length || 0,
      cancelled: statusCounts.find(s => s._id === 'cancelled')?.count || orders.filter(o => o.status === 'cancelled').length || 0,
      orders,
      statusCounts
    }
  }

  const getRevenueMetrics = () => {
    const summary = reportData?.summary || {}
    return {
      totalRevenue: summary.totalRevenue ?? reportData?.totalRevenue ?? 0,
      totalOrders: summary.totalOrders ?? reportData?.totalOrders ?? 0,
      avgOrderValue: summary.averageOrderValue ?? summary.avgOrderValue ?? 0,
      deliveryFees: summary.deliveryFees ?? 0,
      taxes: summary.taxes ?? 0,
      dailyRevenue: reportData?.dailyRevenue || []
    }
  }

  // Export PDF Handler
  const exportToPDF = () => {
    if (!reportData) return
    const doc = new jsPDF()
    const reportTypeObj = reportTypes.find(r => r.id === selectedReport)
    const { formattedStart, formattedEnd } = getDateRange()

    // Header Branding Banner
    doc.setFillColor(27, 77, 62) // Afri Green
    doc.rect(0, 0, 210, 28, 'F')

    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('AFRIMERCATO', 14, 18)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Vendor Business Performance Report', 120, 18)

    // Report Title & Meta
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(reportTypeObj.name, 14, 38)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}  |  Reporting Period: ${selectedReport === 'inventory' ? 'Current Inventory Snapshot' : `${formattedStart} to ${formattedEnd}`}`, 14, 45)

    let startY = 52

    if (selectedReport === 'sales') {
      const sales = getSalesMetrics()
      const summaryRows = [
        ['Total Revenue', `£${sales.totalRevenue.toFixed(2)}`],
        ['Total Orders Processed', `${sales.totalOrders}`],
        ['Average Order Value', `£${sales.avgOrderValue.toFixed(2)}`],
        ['Total Items Sold', `${sales.totalItemsSold}`]
      ]

      autoTable(doc, {
        startY,
        head: [['Executive Summary Metric', 'Value']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [27, 77, 62], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 }
      })

      startY = doc.lastAutoTable.finalY + 12

      if (sales.statusBreakdown.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text('Order Status Breakdown', 14, startY)
        startY += 5

        const breakdownRows = sales.statusBreakdown.map(b => [
          String(b._id || 'Standard').toUpperCase(),
          String(b.count || 0),
          `£${(b.revenue || 0).toFixed(2)}`
        ])

        autoTable(doc, {
          startY,
          head: [['Status', 'Count', 'Revenue (£)']],
          body: breakdownRows,
          theme: 'striped',
          headStyles: { fillColor: [51, 65, 85] }
        })

        startY = doc.lastAutoTable.finalY + 12
      }

      if (sales.topProducts.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Top Selling Products', 14, startY)
        startY += 5

        const productRows = sales.topProducts.map((p, idx) => [
          `${idx + 1}`,
          p.name || 'Product',
          `${p.soldQuantity || 0}`,
          `£${(p.revenue || 0).toFixed(2)}`
        ])

        autoTable(doc, {
          startY,
          head: [['Rank', 'Product Name', 'Units Sold', 'Total Revenue (£)']],
          body: productRows,
          theme: 'striped',
          headStyles: { fillColor: [27, 77, 62] }
        })
      }
    } else if (selectedReport === 'inventory') {
      const inv = getInventoryMetrics()
      const summaryRows = [
        ['Total Products Cataloged', `${inv.totalProducts}`],
        ['In-Stock Items', `${inv.inStock}`],
        ['Out of Stock Items', `${inv.outOfStock}`],
        ['Low Stock Warnings', `${inv.lowStock}`],
        ['Total Valuation', `£${inv.totalValue.toFixed(2)}`]
      ]

      autoTable(doc, {
        startY,
        head: [['Inventory Overview Metric', 'Value']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [27, 77, 62] }
      })

      startY = doc.lastAutoTable.finalY + 12

      if (inv.lowStockItems.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(194, 65, 12)
        doc.text('Low Stock Alert List', 14, startY)
        startY += 5

        const lowRows = inv.lowStockItems.map(p => [
          p.name,
          p.category || 'General',
          `${p.stock}`,
          `${p.lowStockThreshold || 10}`,
          `£${(p.price || 0).toFixed(2)}`
        ])

        autoTable(doc, {
          startY,
          head: [['Product Name', 'Category', 'Current Stock', 'Reorder Threshold', 'Price (£)']],
          body: lowRows,
          theme: 'striped',
          headStyles: { fillColor: [217, 119, 6] }
        })

        startY = doc.lastAutoTable.finalY + 12
      }

      if (inv.allProducts.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text('Full Product Inventory Catalog', 14, startY)
        startY += 5

        const prodRows = inv.allProducts.map(p => [
          p.name,
          p.category || 'General',
          `£${(p.price || 0).toFixed(2)}`,
          `${p.stock}`,
          p.inStock ? 'In Stock' : 'Out of Stock'
        ])

        autoTable(doc, {
          startY,
          head: [['Product', 'Category', 'Price (£)', 'Stock Quantity', 'Status']],
          body: prodRows,
          theme: 'striped',
          headStyles: { fillColor: [51, 65, 85] }
        })
      }
    } else if (selectedReport === 'orders') {
      const ord = getOrdersMetrics()
      const summaryRows = [
        ['Total Orders Received', `${ord.totalOrders}`],
        ['Completed & Delivered', `${ord.completed}`],
        ['Pending / In Progress', `${ord.pending}`],
        ['Cancelled Orders', `${ord.cancelled}`]
      ]

      autoTable(doc, {
        startY,
        head: [['Order Metric', 'Value']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [27, 77, 62] }
      })

      startY = doc.lastAutoTable.finalY + 12

      if (ord.orders.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Order History List', 14, startY)
        startY += 5

        const orderRows = ord.orders.map(o => [
          o.orderNumber || (o._id || '').slice(-6).toUpperCase(),
          o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '—',
          o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || o.customer.email || 'Customer' : 'Customer',
          String(o.status || 'Pending').toUpperCase(),
          `£${(o.pricing?.total ?? o.total ?? 0).toFixed(2)}`
        ])

        autoTable(doc, {
          startY,
          head: [['Order #', 'Date', 'Customer', 'Status', 'Total (£)']],
          body: orderRows,
          theme: 'striped',
          headStyles: { fillColor: [51, 65, 85] }
        })
      }
    } else if (selectedReport === 'revenue') {
      const rev = getRevenueMetrics()
      const summaryRows = [
        ['Total Gross Revenue', `£${rev.totalRevenue.toFixed(2)}`],
        ['Completed Paid Orders', `${rev.totalOrders}`],
        ['Average Order Value', `£${rev.avgOrderValue.toFixed(2)}`],
        ['Delivery Fees Collected', `£${rev.deliveryFees.toFixed(2)}`]
      ]

      autoTable(doc, {
        startY,
        head: [['Revenue Summary Metric', 'Amount (£)']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [27, 77, 62] }
      })

      startY = doc.lastAutoTable.finalY + 12

      if (rev.dailyRevenue.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Daily Revenue Breakdown', 14, startY)
        startY += 5

        const dailyRows = rev.dailyRevenue.map(d => [
          d._id || d.date || 'Date',
          `${d.orders || 0}`,
          `£${(d.revenue || 0).toFixed(2)}`
        ])

        autoTable(doc, {
          startY,
          head: [['Date', 'Orders', 'Daily Revenue (£)']],
          body: dailyRows,
          theme: 'striped',
          headStyles: { fillColor: [51, 65, 85] }
        })
      }
    }

    // Page Numbers Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(140)
      doc.text(`Afrimercato Vendor Platform  |  ${reportTypeObj.name}  |  Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10)
    }

    doc.save(`Afrimercato-${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Export Excel Handler
  const exportToExcel = () => {
    if (!reportData) return
    const reportTypeObj = reportTypes.find(r => r.id === selectedReport)
    const wb = XLSX.utils.book_new()

    if (selectedReport === 'sales') {
      const sales = getSalesMetrics()
      const summaryRows = [
        ['Metric', 'Value'],
        ['Total Revenue (£)', sales.totalRevenue.toFixed(2)],
        ['Total Orders Processed', sales.totalOrders],
        ['Average Order Value (£)', sales.avgOrderValue.toFixed(2)],
        ['Total Items Sold', sales.totalItemsSold]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Sales Summary')

      if (sales.topProducts.length > 0) {
        const topRows = [
          ['Rank', 'Product Name', 'Units Sold', 'Revenue (£)'],
          ...sales.topProducts.map((p, i) => [i + 1, p.name, p.soldQuantity, p.revenue.toFixed(2)])
        ]
        const topSheet = XLSX.utils.aoa_to_sheet(topRows)
        XLSX.utils.book_append_sheet(wb, topSheet, 'Top Selling Products')
      }
    } else if (selectedReport === 'inventory') {
      const inv = getInventoryMetrics()
      const overviewRows = [
        ['Category', 'Count / Value'],
        ['Total Products Cataloged', inv.totalProducts],
        ['In-Stock Items', inv.inStock],
        ['Out of Stock Items', inv.outOfStock],
        ['Low Stock Warnings', inv.lowStock],
        ['Total Stock Valuation (£)', inv.totalValue.toFixed(2)]
      ]
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewRows)
      XLSX.utils.book_append_sheet(wb, overviewSheet, 'Inventory Overview')

      if (inv.allProducts.length > 0) {
        const prodRows = [
          ['Product Name', 'Category', 'Price (£)', 'Stock', 'Status'],
          ...inv.allProducts.map(p => [p.name, p.category || 'General', p.price, p.stock, p.inStock ? 'In Stock' : 'Out of Stock'])
        ]
        const prodSheet = XLSX.utils.aoa_to_sheet(prodRows)
        XLSX.utils.book_append_sheet(wb, prodSheet, 'All Products')
      }
    } else if (selectedReport === 'orders') {
      const ord = getOrdersMetrics()
      const summaryRows = [
        ['Metric', 'Count'],
        ['Total Orders', ord.totalOrders],
        ['Completed & Delivered', ord.completed],
        ['Pending / In Progress', ord.pending],
        ['Cancelled', ord.cancelled]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Order Metrics')

      if (ord.orders.length > 0) {
        const orderRows = [
          ['Order #', 'Date', 'Customer', 'Status', 'Total (£)'],
          ...ord.orders.map(o => [
            o.orderNumber || (o._id || '').slice(-6).toUpperCase(),
            o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '—',
            o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || o.customer.email || 'Customer' : 'Customer',
            o.status,
            o.pricing?.total ?? o.total ?? 0
          ])
        ]
        const orderSheet = XLSX.utils.aoa_to_sheet(orderRows)
        XLSX.utils.book_append_sheet(wb, orderSheet, 'Order Details')
      }
    } else if (selectedReport === 'revenue') {
      const rev = getRevenueMetrics()
      const summaryRows = [
        ['Category', 'Amount (£)'],
        ['Total Gross Revenue', rev.totalRevenue.toFixed(2)],
        ['Completed Orders Count', rev.totalOrders],
        ['Average Order Value', rev.avgOrderValue.toFixed(2)],
        ['Delivery Fees', rev.deliveryFees.toFixed(2)]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Revenue Summary')

      if (rev.dailyRevenue.length > 0) {
        const dailyRows = [
          ['Date', 'Orders', 'Revenue (£)'],
          ...rev.dailyRevenue.map(d => [d._id || d.date, d.orders, d.revenue.toFixed(2)])
        ]
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyRows)
        XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Breakdown')
      }
    }

    XLSX.writeFile(wb, `Afrimercato-${reportTypeObj.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const selectedReportObj = reportTypes.find(r => r.id === selectedReport)
  const salesMetrics = reportData && selectedReport === 'sales' ? getSalesMetrics() : null
  const inventoryMetrics = reportData && selectedReport === 'inventory' ? getInventoryMetrics() : null
  const ordersMetrics = reportData && selectedReport === 'orders' ? getOrdersMetrics() : null
  const revenueMetrics = reportData && selectedReport === 'revenue' ? getRevenueMetrics() : null

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-afri-green to-afri-green-dark bg-clip-text text-transparent">
            Business Reports
          </h1>
          <p className="text-afri-gray-600 mt-1">
            Generate and export real-time business performance PDF reports
          </p>
        </div>
        {reportData && (
          <div className="flex items-center gap-3">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-md hover:shadow-lg"
            >
              <FiDownload className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-2.5 bg-afri-green text-white font-semibold rounded-xl hover:bg-afri-green-dark transition shadow-md hover:shadow-lg"
            >
              <FiFileText className="w-4 h-4" /> Export Excel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiLayers className="text-afri-green" /> Select Report Type
            </h2>
            <div className="space-y-3">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedReport === report.id
                      ? 'border-afri-green bg-green-50/70 shadow-md ring-2 ring-afri-green/20'
                      : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                      {report.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base">{report.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-snug">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Configuration */}
          {selectedReport !== 'inventory' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiCalendar className="text-afri-green" /> Reporting Period
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {dateRangePresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDateRange(preset.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${dateRange === preset.value
                        ? 'bg-afri-green text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {dateRange === 'custom' && (
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-afri-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-afri-green"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Report Visual Display & Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
              <div className="w-16 h-16 border-4 border-afri-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-semibold text-lg">Generating {selectedReportObj?.name}...</p>
              <p className="text-gray-400 text-sm mt-1">Fetching live performance data from server</p>
            </div>
          ) : reportData ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden space-y-6 p-6 md:p-8">
              {/* Report Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-green-100 text-afri-green rounded-full">
                    {selectedReportObj?.name}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">
                    {selectedReportObj?.name} Overview
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Period: {selectedReport === 'inventory' ? 'Live Inventory' : `${getDateRange().formattedStart} — ${getDateRange().formattedEnd}`}
                  </p>
                </div>
                {/* <div className="flex items-center gap-2">
                  <button
                    onClick={exportToPDF}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <FiDownload /> Export PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-afri-green hover:bg-afri-green-dark text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <FiFileText /> Export Excel
                  </button>
                </div> */}
              </div>

              {/* 1. SALES REPORT VIEW */}
              {selectedReport === 'sales' && salesMetrics && (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4 rounded-xl">
                      <p className="text-xs text-green-700 font-bold uppercase">Total Revenue</p>
                      <p className="text-2xl font-extrabold text-green-900 mt-1">£{salesMetrics.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-xs text-blue-700 font-bold uppercase">Total Orders</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">{salesMetrics.totalOrders}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 p-4 rounded-xl">
                      <p className="text-xs text-purple-700 font-bold uppercase">Avg Order Value</p>
                      <p className="text-2xl font-extrabold text-purple-900 mt-1">£{salesMetrics.avgOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4 rounded-xl">
                      <p className="text-xs text-amber-700 font-bold uppercase">Items Sold</p>
                      <p className="text-2xl font-extrabold text-amber-900 mt-1">{salesMetrics.totalItemsSold}</p>
                    </div>
                  </div>

                  {/* Status Breakdown Table */}
                  {salesMetrics.statusBreakdown.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm">
                        Order Status Breakdown
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Orders Count</th>
                            <th className="px-5 py-3 text-right">Revenue (£)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salesMetrics.statusBreakdown.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-semibold capitalize">{item._id || 'Standard'}</td>
                              <td className="px-5 py-3">{item.count}</td>
                              <td className="px-5 py-3 text-right font-bold text-afri-green">£{(item.revenue || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Top Products Table */}
                  {salesMetrics.topProducts.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm">
                        Top Selling Products
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Rank</th>
                            <th className="px-5 py-3">Product Name</th>
                            <th className="px-5 py-3">Units Sold</th>
                            <th className="px-5 py-3 text-right">Revenue (£)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salesMetrics.topProducts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-bold text-gray-400">#{idx + 1}</td>
                              <td className="px-5 py-3 font-semibold text-gray-900">{p.name || 'Product'}</td>
                              <td className="px-5 py-3 font-semibold">{p.soldQuantity || 0}</td>
                              <td className="px-5 py-3 text-right font-bold text-afri-green">£{(p.revenue || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 2. INVENTORY REPORT VIEW */}
              {selectedReport === 'inventory' && inventoryMetrics && (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Catalog Size</p>
                      <p className="text-xl font-black text-gray-900 mt-1">{inventoryMetrics.totalProducts}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
                      <p className="text-xs text-green-700 font-bold uppercase">In Stock</p>
                      <p className="text-xl font-black text-green-900 mt-1">{inventoryMetrics.inStock}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                      <p className="text-xs text-red-700 font-bold uppercase">Out of Stock</p>
                      <p className="text-xl font-black text-red-900 mt-1">{inventoryMetrics.outOfStock}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <p className="text-xs text-amber-700 font-bold uppercase">Low Stock</p>
                      <p className="text-xl font-black text-amber-900 mt-1">{inventoryMetrics.lowStock}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl col-span-2 sm:col-span-1">
                      <p className="text-xs text-blue-700 font-bold uppercase">Stock Value</p>
                      <p className="text-xl font-black text-blue-900 mt-1">£{inventoryMetrics.totalValue.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Low Stock Warnings */}
                  {inventoryMetrics.lowStockItems.length > 0 && (
                    <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/30">
                      <div className="px-5 py-3 bg-amber-100 border-b border-amber-200 font-bold text-amber-900 text-sm flex items-center gap-2">
                        <FiAlertTriangle className="text-amber-600" /> Low Stock Alerts
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-amber-50 text-amber-800 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Product</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Current Stock</th>
                            <th className="px-5 py-3 text-right">Price (£)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-200/60">
                          {inventoryMetrics.lowStockItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-amber-100/40">
                              <td className="px-5 py-3 font-semibold text-gray-900">{item.name}</td>
                              <td className="px-5 py-3 text-xs text-gray-500">{item.category || 'General'}</td>
                              <td className="px-5 py-3 font-bold text-amber-700">{item.stock} left</td>
                              <td className="px-5 py-3 text-right font-bold">£{(item.price || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Full Inventory Catalog Table */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm">
                      Product Inventory Catalog
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                          <th className="px-5 py-3">Product Name</th>
                          <th className="px-5 py-3">Category</th>
                          <th className="px-5 py-3">Stock Quantity</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Price (£)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryMetrics.allProducts.map((p, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                            <td className="px-5 py-3 text-xs text-gray-500">{p.category || 'General'}</td>
                            <td className="px-5 py-3 font-semibold">{p.stock}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {p.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right font-bold">£{(p.price || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. ORDERS REPORT VIEW */}
              {selectedReport === 'orders' && ordersMetrics && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Total Orders</p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">{ordersMetrics.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                      <p className="text-xs text-green-700 font-bold uppercase">Completed</p>
                      <p className="text-2xl font-extrabold text-green-900 mt-1">{ordersMetrics.completed}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <p className="text-xs text-amber-700 font-bold uppercase">Pending</p>
                      <p className="text-2xl font-extrabold text-amber-900 mt-1">{ordersMetrics.pending}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                      <p className="text-xs text-red-700 font-bold uppercase">Cancelled</p>
                      <p className="text-2xl font-extrabold text-red-900 mt-1">{ordersMetrics.cancelled}</p>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm">
                      Order Log
                    </div>
                    {ordersMetrics.orders.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">No orders recorded in this date range</div>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Order #</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Customer</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3 text-right">Total (£)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ordersMetrics.orders.map((o, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-bold text-gray-900">
                                #{o.orderNumber || (o._id || '').slice(-6).toUpperCase()}
                              </td>
                              <td className="px-5 py-3 text-xs text-gray-500">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '—'}
                              </td>
                              <td className="px-5 py-3 text-gray-700">
                                {o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || o.customer.email || 'Customer' : 'Customer'}
                              </td>
                              <td className="px-5 py-3">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 capitalize">
                                  {o.status || 'Pending'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right font-bold text-afri-green">
                                £{(o.pricing?.total ?? o.total ?? 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* 4. REVENUE REPORT VIEW */}
              {selectedReport === 'revenue' && revenueMetrics && (
                <div className="space-y-6">
                  {/* Revenue Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl">
                      <p className="text-xs text-green-700 font-bold uppercase">Net Revenue</p>
                      <p className="text-2xl font-extrabold text-green-900 mt-1">£{revenueMetrics.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-bold uppercase">Completed Orders</p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">{revenueMetrics.totalOrders}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                      <p className="text-xs text-purple-700 font-bold uppercase">Avg Order Value</p>
                      <p className="text-2xl font-extrabold text-purple-900 mt-1">£{revenueMetrics.avgOrderValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <p className="text-xs text-amber-700 font-bold uppercase">Delivery Fees</p>
                      <p className="text-2xl font-extrabold text-amber-900 mt-1">£{revenueMetrics.deliveryFees.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Daily Breakdown Table */}
                  {revenueMetrics.dailyRevenue.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-800 text-sm">
                        Daily Revenue Breakdown
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Orders Count</th>
                            <th className="px-5 py-3 text-right">Daily Revenue (£)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {revenueMetrics.dailyRevenue.map((day, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-5 py-3 font-semibold text-gray-900">{day._id || day.date}</td>
                              <td className="px-5 py-3">{day.orders}</td>
                              <td className="px-5 py-3 text-right font-bold text-afri-green">£{(day.revenue || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Reports

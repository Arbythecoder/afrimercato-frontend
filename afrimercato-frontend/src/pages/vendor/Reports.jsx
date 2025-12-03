import { useState } from 'react'
import { vendorAPI } from '../../services/api'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

const reportTypes = [
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Revenue, orders, and sales performance',
    icon: '📊',
    color: 'afri-green',
  },
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Stock levels, low stock items, and product performance',
    icon: '📦',
    color: 'blue-600',
  },
  {
    id: 'orders',
    name: 'Order Report',
    description: 'Order history, status breakdown, and delivery metrics',
    icon: '📋',
    color: 'purple-600',
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Earnings breakdown, payment status, and financial summary',
    icon: '💰',
    color: 'afri-yellow-dark',
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
  const [selectedReport, setSelectedReport] = useState(null)
  const [dateRange, setDateRange] = useState('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const generateReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type')
      return
    }

    setLoading(true)
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
          throw new Error('Invalid report type')
      }

      if (response.success) {
        setReportData(response.data)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert(error.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    let startDate, endDate

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1))
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        endDate = new Date()
        break
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30))
        endDate = new Date()
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date()
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'custom':
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate)
        break
      default:
        startDate = new Date(now.setDate(now.getDate() - 7))
        endDate = new Date()
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
  }

  const exportToPDF = () => {
    if (!reportData) return

    const doc = new jsPDF()
    const reportType = reportTypes.find(r => r.id === selectedReport)

    // Title
    doc.setFontSize(20)
    doc.setTextColor(0, 178, 7) // Afri-green
    doc.text(reportType.name, 14, 20)

    // Date range
    doc.setFontSize(10)
    doc.setTextColor(100)
    const { startDate, endDate } = getDateRange()
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      14,
      28
    )

    // Content based on report type
    let yPosition = 40

    if (selectedReport === 'sales') {
      // Summary stats
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Summary', 14, yPosition)
      yPosition += 10

      const summaryData = [
        ['Total Revenue', `£${reportData.totalRevenue?.toFixed(2) || '0.00'}`],
        ['Total Orders', reportData.totalOrders || 0],
        ['Average Order Value', `£${reportData.avgOrderValue?.toFixed(2) || '0.00'}`],
        ['Total Items Sold', reportData.totalItemsSold || 0],
      ]

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 178, 7] },
      })

      // Top products
      if (reportData.topProducts && reportData.topProducts.length > 0) {
        yPosition = doc.lastAutoTable.finalY + 15
        doc.setFontSize(14)
        doc.text('Top Products', 14, yPosition)
        yPosition += 5

        const productsData = reportData.topProducts.map((p, i) => [
          i + 1,
          p.name,
          p.soldQuantity,
          `£${p.revenue?.toFixed(2) || '0.00'}`,
        ])

        doc.autoTable({
          startY: yPosition + 5,
          head: [['#', 'Product', 'Qty Sold', 'Revenue']],
          body: productsData,
          theme: 'striped',
          headStyles: { fillColor: [0, 178, 7] },
        })
      }
    } else if (selectedReport === 'inventory') {
      // Stock overview
      doc.setFontSize(14)
      doc.text('Stock Overview', 14, yPosition)
      yPosition += 10

      const summaryData = [
        ['Total Products', reportData.totalProducts || 0],
        ['In Stock', reportData.inStock || 0],
        ['Out of Stock', reportData.outOfStock || 0],
        ['Low Stock', reportData.lowStock || 0],
      ]

      doc.autoTable({
        startY: yPosition,
        head: [['Category', 'Count']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 178, 7] },
      })

      // Low stock items
      if (reportData.lowStockItems && reportData.lowStockItems.length > 0) {
        yPosition = doc.lastAutoTable.finalY + 15
        doc.setFontSize(14)
        doc.text('Low Stock Items', 14, yPosition)
        yPosition += 5

        const lowStockData = reportData.lowStockItems.map(item => [
          item.name,
          item.currentStock,
          item.lowStockThreshold,
          item.status,
        ])

        doc.autoTable({
          startY: yPosition + 5,
          head: [['Product', 'Current Stock', 'Threshold', 'Status']],
          body: lowStockData,
          theme: 'striped',
          headStyles: { fillColor: [255, 138, 0] }, // Orange for alerts
        })
      }
    } else if (selectedReport === 'orders') {
      // Orders summary
      doc.setFontSize(14)
      doc.text('Orders Summary', 14, yPosition)
      yPosition += 10

      const summaryData = [
        ['Total Orders', reportData.totalOrders || 0],
        ['Completed', reportData.completed || 0],
        ['Pending', reportData.pending || 0],
        ['Cancelled', reportData.cancelled || 0],
      ]

      doc.autoTable({
        startY: yPosition,
        head: [['Status', 'Count']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 178, 7] },
      })

      // Order list
      if (reportData.orders && reportData.orders.length > 0) {
        yPosition = doc.lastAutoTable.finalY + 15
        doc.setFontSize(14)
        doc.text('Order Details', 14, yPosition)
        yPosition += 5

        const ordersData = reportData.orders.map(order => [
          order.orderNumber,
          new Date(order.createdAt).toLocaleDateString(),
          order.status,
          `£${order.total?.toFixed(2) || '0.00'}`,
        ])

        doc.autoTable({
          startY: yPosition + 5,
          head: [['Order #', 'Date', 'Status', 'Total']],
          body: ordersData,
          theme: 'striped',
          headStyles: { fillColor: [0, 178, 7] },
        })
      }
    } else if (selectedReport === 'revenue') {
      // Revenue summary
      doc.setFontSize(14)
      doc.text('Revenue Summary', 14, yPosition)
      yPosition += 10

      const summaryData = [
        ['Total Revenue', `£${reportData.totalRevenue?.toFixed(2) || '0.00'}`],
        ['Paid', `£${reportData.paidRevenue?.toFixed(2) || '0.00'}`],
        ['Pending', `£${reportData.pendingRevenue?.toFixed(2) || '0.00'}`],
        ['Refunded', `£${reportData.refundedRevenue?.toFixed(2) || '0.00'}`],
      ]

      doc.autoTable({
        startY: yPosition,
        head: [['Category', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 178, 7] },
      })

      // Daily breakdown
      if (reportData.dailyRevenue && reportData.dailyRevenue.length > 0) {
        yPosition = doc.lastAutoTable.finalY + 15
        doc.setFontSize(14)
        doc.text('Daily Revenue Breakdown', 14, yPosition)
        yPosition += 5

        const dailyData = reportData.dailyRevenue.map(day => [
          new Date(day.date).toLocaleDateString(),
          day.orders,
          `£${day.revenue?.toFixed(2) || '0.00'}`,
        ])

        doc.autoTable({
          startY: yPosition + 5,
          head: [['Date', 'Orders', 'Revenue']],
          body: dailyData,
          theme: 'striped',
          headStyles: { fillColor: [0, 178, 7] },
        })
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Afrimercato - ${reportType.name} | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      )
    }

    // Save
    doc.save(`${selectedReport}-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportToExcel = () => {
    if (!reportData) return

    const reportType = reportTypes.find(r => r.id === selectedReport)
    const workbook = XLSX.utils.book_new()

    if (selectedReport === 'sales') {
      // Summary sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Revenue', reportData.totalRevenue?.toFixed(2) || '0.00'],
        ['Total Orders', reportData.totalOrders || 0],
        ['Average Order Value', reportData.avgOrderValue?.toFixed(2) || '0.00'],
        ['Total Items Sold', reportData.totalItemsSold || 0],
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // Top products sheet
      if (reportData.topProducts && reportData.topProducts.length > 0) {
        const productsData = [
          ['Rank', 'Product', 'Quantity Sold', 'Revenue'],
          ...reportData.topProducts.map((p, i) => [
            i + 1,
            p.name,
            p.soldQuantity,
            p.revenue?.toFixed(2) || '0.00',
          ]),
        ]
        const productsSheet = XLSX.utils.aoa_to_sheet(productsData)
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products')
      }
    } else if (selectedReport === 'inventory') {
      // Stock overview sheet
      const overviewData = [
        ['Category', 'Count'],
        ['Total Products', reportData.totalProducts || 0],
        ['In Stock', reportData.inStock || 0],
        ['Out of Stock', reportData.outOfStock || 0],
        ['Low Stock', reportData.lowStock || 0],
      ]
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview')

      // Low stock items sheet
      if (reportData.lowStockItems && reportData.lowStockItems.length > 0) {
        const lowStockData = [
          ['Product', 'Current Stock', 'Threshold', 'Status'],
          ...reportData.lowStockItems.map(item => [
            item.name,
            item.currentStock,
            item.lowStockThreshold,
            item.status,
          ]),
        ]
        const lowStockSheet = XLSX.utils.aoa_to_sheet(lowStockData)
        XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Low Stock Items')
      }

      // All products sheet
      if (reportData.allProducts && reportData.allProducts.length > 0) {
        const allProductsData = [
          ['Name', 'Category', 'Stock', 'Price', 'Status'],
          ...reportData.allProducts.map(p => [
            p.name,
            p.category,
            p.stock,
            p.price,
            p.inStock ? 'In Stock' : 'Out of Stock',
          ]),
        ]
        const allProductsSheet = XLSX.utils.aoa_to_sheet(allProductsData)
        XLSX.utils.book_append_sheet(workbook, allProductsSheet, 'All Products')
      }
    } else if (selectedReport === 'orders') {
      // Orders summary sheet
      const summaryData = [
        ['Status', 'Count'],
        ['Total Orders', reportData.totalOrders || 0],
        ['Completed', reportData.completed || 0],
        ['Pending', reportData.pending || 0],
        ['Cancelled', reportData.cancelled || 0],
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // Orders list sheet
      if (reportData.orders && reportData.orders.length > 0) {
        const ordersData = [
          ['Order Number', 'Date', 'Customer', 'Status', 'Items', 'Total'],
          ...reportData.orders.map(order => [
            order.orderNumber,
            new Date(order.createdAt).toLocaleDateString(),
            order.customerName || 'N/A',
            order.status,
            order.itemsCount || 0,
            order.total?.toFixed(2) || '0.00',
          ]),
        ]
        const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders')
      }
    } else if (selectedReport === 'revenue') {
      // Revenue summary sheet
      const summaryData = [
        ['Category', 'Amount (£)'],
        ['Total Revenue', reportData.totalRevenue?.toFixed(2) || '0.00'],
        ['Paid', reportData.paidRevenue?.toFixed(2) || '0.00'],
        ['Pending', reportData.pendingRevenue?.toFixed(2) || '0.00'],
        ['Refunded', reportData.refundedRevenue?.toFixed(2) || '0.00'],
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // Daily revenue sheet
      if (reportData.dailyRevenue && reportData.dailyRevenue.length > 0) {
        const dailyData = [
          ['Date', 'Orders', 'Revenue (£)'],
          ...reportData.dailyRevenue.map(day => [
            new Date(day.date).toLocaleDateString(),
            day.orders,
            day.revenue?.toFixed(2) || '0.00',
          ]),
        ]
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Revenue')
      }
    }

    // Export file
    XLSX.writeFile(
      workbook,
      `${reportType.name.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.xlsx`
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-afri-gray-900">Reports</h1>
        <p className="text-afri-gray-600 mt-1">Generate and export business reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-afri-gray-900 mb-4">Select Report Type</h2>
            <div className="space-y-3">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedReport === report.id
                      ? `border-${report.color} bg-${report.color} bg-opacity-10`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{report.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-afri-gray-900">{report.name}</h3>
                      <p className="text-sm text-afri-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-afri-gray-900 mb-4">Report Configuration</h2>

            {!selectedReport ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-afri-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-afri-gray-600">Select a report type to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Date Range Selection */}
                {selectedReport !== 'inventory' && (
                  <div>
                    <label className="block text-sm font-medium text-afri-gray-700 mb-2">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {dateRangePresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setDateRange(preset.value)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            dateRange === preset.value
                              ? 'bg-afri-green text-white'
                              : 'bg-afri-gray-50 text-afri-gray-700 hover:bg-afri-gray-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Date Range */}
                    {dateRange === 'custom' && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-afri-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-afri-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Generate Button */}
                <div className="flex gap-3">
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    className="flex-1 bg-afri-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-afri-green-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Report'
                    )}
                  </button>

                  {reportData && (
                    <>
                      <button
                        onClick={exportToPDF}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        Export PDF
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Export Excel
                      </button>
                    </>
                  )}
                </div>

                {/* Report Preview */}
                {showPreview && reportData && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-afri-gray-900 mb-4">
                      Report Preview
                    </h3>
                    <div className="bg-afri-gray-50 rounded-lg p-6">
                      <pre className="text-sm text-afri-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(reportData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports

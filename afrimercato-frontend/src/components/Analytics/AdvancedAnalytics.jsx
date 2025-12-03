import { useState } from 'react'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#4A7C2C', '#2D5016', '#F97316', '#10B981']

export default function AdvancedAnalytics({ stats, analyticsData }) {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: 'selection'
    }
  ])

  const generatePDFReport = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text('Vendor Analytics Report', 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)

    // Add summary statistics
    doc.setFontSize(16)
    doc.text('Summary Statistics', 20, 45)
    const summaryData = [
      ['Total Revenue', `£${stats.totalRevenue.toLocaleString()}`],
      ['Total Orders', stats.totalOrders],
      ['Average Order Value', `£${(stats.totalRevenue / stats.totalOrders).toFixed(2)}`],
      ['Active Products', stats.activeProducts]
    ]
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData
    })

    // Add revenue chart data
    doc.addPage()
    doc.setFontSize(16)
    doc.text('Revenue Analysis', 20, 20)
    doc.autoTable({
      startY: 25,
      head: [['Date', 'Revenue', 'Orders']],
      body: analyticsData.map(d => [
        d.date,
        `£${d.revenue.toLocaleString()}`,
        d.orders
      ])
    })

    // Save the PDF
    doc.save('vendor-analytics-report.pdf')
  }

  const generateExcelReport = () => {
    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Revenue', `£${stats.totalRevenue.toLocaleString()}`],
      ['Total Orders', stats.totalOrders],
      ['Average Order Value', `£${(stats.totalRevenue / stats.totalOrders).toFixed(2)}`],
      ['Active Products', stats.activeProducts]
    ]
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

    // Daily data sheet
    const dailyData = [
      ['Date', 'Revenue', 'Orders', 'Units Sold'],
      ...analyticsData.map(d => [
        d.date,
        d.revenue,
        d.orders,
        d.units
      ])
    ]
    const dailyWs = XLSX.utils.aoa_to_sheet(dailyData)
    XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Data')

    // Save the file
    XLSX.writeFile(wb, 'vendor-analytics.xlsx')
  }

  const calculateForecast = () => {
    // Simple linear regression for forecasting
    const n = analyticsData.length
    if (n < 2) return null

    const x = Array.from({ length: n }, (_, i) => i)
    const y = analyticsData.map(d => d.revenue)

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0)
    const sumXX = x.reduce((a, b) => a + b * b, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Project next 7 days
    return Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${n + i + 1}`,
      forecast: Math.max(0, intercept + slope * (n + i))
    }))
  }

  const forecast = calculateForecast()

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Date Range</h2>
        <DateRangePicker
          onChange={item => setDateRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
          className="w-full"
        />
      </div>

      {/* Export Options */}
      <div className="flex gap-4">
        <button
          onClick={generatePDFReport}
          className="px-4 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition-colors"
        >
          Export as PDF
        </button>
        <button
          onClick={generateExcelReport}
          className="px-4 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition-colors"
        >
          Export as Excel
        </button>
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A7C2C" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4A7C2C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4A7C2C"
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topProducts}
                  dataKey="totalRevenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Forecast */}
      {forecast && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Forecast (Next 7 Days)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="forecast" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Forecast based on historical data trends. Actual results may vary.
          </p>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Average Order Value',
            value: `£${(stats.totalRevenue / stats.totalOrders).toFixed(2)}`,
            change: '+5.2%',
            trend: 'up'
          },
          {
            label: 'Customer Retention',
            value: '68%',
            change: '+2.1%',
            trend: 'up'
          },
          {
            label: 'Product Return Rate',
            value: '2.3%',
            change: '-0.5%',
            trend: 'down'
          },
          {
            label: 'Inventory Turnover',
            value: '4.2x',
            change: '+0.3x',
            trend: 'up'
          }
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">{metric.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
            <p className={`text-sm mt-2 ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change} vs last period
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
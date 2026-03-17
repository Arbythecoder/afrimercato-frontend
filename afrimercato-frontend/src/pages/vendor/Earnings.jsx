import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'

function Earnings() {
  const [earnings, setEarnings] = useState(null)
  const [payouts, setPayouts] = useState([])
  const [payoutSummary, setPayoutSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requestMsg, setRequestMsg] = useState(null)
  const [form, setForm] = useState({ amount: '', accountName: '', accountNumber: '', sortCode: '' })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [earningsRes, payoutsRes] = await Promise.all([
        vendorAPI.getEarnings(),
        vendorAPI.getPayouts()
      ])
      if (earningsRes.success) setEarnings(earningsRes.data)
      if (payoutsRes.success) {
        setPayouts(payoutsRes.data || [])
        setPayoutSummary(payoutsRes.summary)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async (e) => {
    e.preventDefault()
    setRequesting(true)
    setRequestMsg(null)
    try {
      const res = await vendorAPI.requestPayout({
        amount: parseFloat(form.amount),
        bankDetails: {
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          sortCode: form.sortCode
        }
      })
      if (res.success) {
        setRequestMsg({ type: 'success', text: res.message })
        setShowRequestForm(false)
        setForm({ amount: '', accountName: '', accountNumber: '', sortCode: '' })
        fetchAll()
      } else {
        setRequestMsg({ type: 'error', text: res.message })
      }
    } catch (err) {
      setRequestMsg({ type: 'error', text: err.response?.data?.message || 'Request failed' })
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Earnings &amp; Payouts</h1>
        <button
          onClick={() => { setShowRequestForm(v => !v); setRequestMsg(null) }}
          className="px-5 py-2.5 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark font-medium transition"
        >
          {showRequestForm ? 'Cancel' : 'Request Payout'}
        </button>
      </div>

      {/* Request Payout Form */}
      {showRequestForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h2>
          {requestMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${requestMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {requestMsg.text}
            </div>
          )}
          <form onSubmit={handleRequestPayout} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (£)</label>
              <input
                type="number" min="1" step="0.01" required
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 150.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-afri-green"
              />
              {payoutSummary && (
                <p className="text-xs text-gray-500 mt-1">Available: {payoutSummary.pendingAmount}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input
                type="text" required
                value={form.accountName}
                onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                placeholder="As on bank account"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-afri-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text" required maxLength={8} pattern="\d{8}"
                value={form.accountNumber}
                onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                placeholder="8 digits"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-afri-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
              <input
                type="text" required maxLength={6} pattern="\d{6}"
                value={form.sortCode}
                onChange={e => setForm(f => ({ ...f, sortCode: e.target.value }))}
                placeholder="6 digits (no dashes)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-afri-green"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit" disabled={requesting}
                className="px-6 py-3 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark font-medium transition disabled:opacity-60"
              >
                {requesting ? 'Submitting...' : 'Submit Payout Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {requestMsg && !showRequestForm && (
        <div className={`p-3 rounded-lg text-sm ${requestMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {requestMsg.text}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Your Earnings</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">£{earnings?.totalEarnings?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">From {earnings?.completedOrdersCount || 0} completed orders</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Available to Withdraw</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{payoutSummary?.pendingAmount || '£0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">After 12% commission</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Commission Paid</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">£{earnings?.totalCommission?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">{earnings?.commissionRate || 12}% platform fee</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🏦</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Lifetime Paid Out</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{payoutSummary?.lifetimePayouts || '£0.00'}</p>
          <p className="text-xs text-gray-500 mt-1">{payoutSummary?.payoutsCount || 0} payouts processed</p>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Total Order Revenue</span>
            <span className="font-bold text-gray-900">£{earnings?.totalRevenue?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Platform Commission ({earnings?.commissionRate || 12}%)</span>
            <span className="font-bold text-red-600">- £{earnings?.totalCommission?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-4">
            <span className="font-bold text-gray-900">Your Earnings</span>
            <span className="font-bold text-green-600 text-xl">£{earnings?.totalEarnings?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payout History</h2>
        {payouts.length === 0 ? (
          <p className="text-gray-500 text-sm">No payouts yet. Request your first payout above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-medium">Reference</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Amount</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Requested</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-500">{p.reference}</td>
                    <td className="py-3 font-bold text-gray-900">{p.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{p.requestedDate}</td>
                    <td className="py-3 text-gray-600">{p.completedDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How Payouts Work */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How Payouts Work</h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Orders are completed and payment is confirmed</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>Platform commission (12%) is automatically deducted</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>Click <strong>Request Payout</strong> and enter your UK bank details</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <span>Funds are transferred within <strong>3–5 business days</strong></span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default Earnings

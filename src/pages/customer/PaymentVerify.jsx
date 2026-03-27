import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiCall } from '../../services/api'

function PaymentVerify() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, failed
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const sessionId = searchParams.get('session_id')
    const orderId   = searchParams.get('order_id')
    console.log('[PaymentVerify] Starting verification — session_id:', sessionId, 'order_id:', orderId)

    if (!sessionId) {
      console.error('[PaymentVerify] No session_id in URL params')
      setStatus('failed')
      setError('No payment session found')
      return
    }

    try {
      console.log('[PaymentVerify] Calling /payments/stripe/verify/' + sessionId)
      // FIX: use /payments (plural) + use apiCall for token refresh support
      const data = await apiCall(`/payments/stripe/verify/${sessionId}`, { timeout: 15000 })
      console.log('[PaymentVerify] Verify response:', data?.success, '— paymentStatus:', data?.data?.paymentStatus)

      // FIX: backend returns paymentStatus: 'paid', not status: 'success'
      if (data.success && data.data?.paymentStatus === 'paid') {
        console.log('[PaymentVerify] ✓ Payment confirmed for order:', data.data?.order?.orderNumber)
        setStatus('success')
        setOrderData(data.data)
        localStorage.removeItem('pending_order_id')
      } else {
        console.warn('[PaymentVerify] ✗ Payment not confirmed — response:', data)
        setStatus('failed')
        setError(data.message || 'Payment verification failed')
      }
    } catch (err) {
      console.error('[PaymentVerify] Verification error:', err.message, '— status:', err.status)
      setStatus('failed')
      setError('Failed to verify payment. Please contact support.')
    }
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your order has been confirmed and is being processed.</p>

          {orderData?.order && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">{orderData.order.orderNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">£{Number(orderData.order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/order-confirmation/${orderData?.order?.id || ''}`)}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500 mb-6">Don't worry, no money was deducted from your account.</p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentVerify

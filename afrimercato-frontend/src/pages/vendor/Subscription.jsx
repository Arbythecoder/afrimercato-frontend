import { useState } from 'react'

function Subscription() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl animate-pulse">
              🚀
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-afri-gray-900 mb-2">
              Premium Subscriptions Coming Soon!
            </h2>
            <p className="text-afri-gray-600 text-lg mb-4">
              We're working on premium subscription plans that will give you access to advanced features, 
              analytics, and promotional tools to grow your business on AfriMercato.
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-afri-gray-700">
                <strong className="text-afri-green">Good news:</strong> All vendors currently have 
                full access to all platform features at no additional cost. Keep selling and growing your business!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview of Upcoming Features */}
      <h2 className="text-3xl font-bold text-center text-afri-gray-900 mb-8">
        What's Coming in Premium Plans
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
            📈
          </div>
          <h3 className="text-xl font-bold text-center text-afri-gray-900 mb-2">Advanced Analytics</h3>
          <p className="text-center text-afri-gray-600">
            Deep insights into sales trends, customer behavior, and product performance.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-afri-green to-afri-green-dark rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
            🎯
          </div>
          <h3 className="text-xl font-bold text-center text-afri-gray-900 mb-2">Featured Listings</h3>
          <p className="text-center text-afri-gray-600">
            Boost your visibility with premium placement in search results and category pages.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
            🎨
          </div>
          <h3 className="text-xl font-bold text-center text-afri-gray-900 mb-2">Custom Branding</h3>
          <p className="text-center text-afri-gray-600">
            Personalize your store with custom colors, logos, and branded shopping experiences.
          </p>
        </div>
      </div>

      {/* Current Benefits */}
      <div className="bg-gradient-to-br from-afri-green to-afri-green-dark rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          What You Have Right Now (Free!)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold">Unlimited Products</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold">Order Management</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold">Earnings Dashboard</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold">Customer Support</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold">Real-time Notifications</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold">Secure Payments</span>
          </div>
        </div>
        <p className="text-center text-lg mt-6 opacity-90">
          Keep using all these features while we build premium plans!
        </p>
      </div>
    </div>
  )
}

export default Subscription

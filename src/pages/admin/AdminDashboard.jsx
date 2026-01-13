import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Admin Dashboard - Platform Overview
 * Shows key metrics, vendor approvals, and system health
 */
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('afrimercato_token');
      const { data } = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAdminStats}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Vendors',
      value: stats?.vendors?.approved || 0,
      icon: Store,
      color: 'bg-green-500',
      change: `${stats?.vendors?.pending || 0} pending`,
      changeType: 'neutral'
    },
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Revenue',
      value: `£${(stats?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' :
                    stat.changeType === 'decrease' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Vendor Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Vendor Statistics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2 text-afri-green" />
              Vendor Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-semibold text-gray-900">Approved</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {stats?.vendors?.approved || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-semibold text-gray-900">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {stats?.vendors?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-semibold text-gray-900">Rejected</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {stats?.vendors?.rejected || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Platform Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-afri-green" />
              Platform Health
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-900">Total Products</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {stats?.products || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-semibold text-gray-900">Active Orders</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {stats?.orders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-semibold text-gray-900">Platform Revenue</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  £{(stats?.revenue || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-afri-green" />
              Recent Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber || order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.vendor?.storeName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      £{order.pricing?.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/vendors"
            className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-lg mb-1">Manage Vendors</h3>
              <p className="text-sm text-white/80">Approve, reject, or suspend vendors</p>
            </div>
            <Store className="w-8 h-8 text-white/80" />
          </a>
          <a
            href="/admin/users"
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-lg mb-1">Manage Users</h3>
              <p className="text-sm text-white/80">View and manage platform users</p>
            </div>
            <Users className="w-8 h-8 text-white/80" />
          </a>
          <a
            href="/admin/orders"
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-lg mb-1">View Orders</h3>
              <p className="text-sm text-white/80">Monitor all platform orders</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-white/80" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

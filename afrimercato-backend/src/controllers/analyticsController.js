const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get detailed analytics for a specific date range
 * Includes:
 * - Daily revenue
 * - Order counts
 * - Product performance
 * - Customer metrics
 */
exports.getDetailedAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const vendorId = req.vendor._id;

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Run analytics queries in parallel
  const [revenue, products, customers] = await Promise.all([
    // Revenue Analysis
    Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: { $ne: 'cancelled' },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
          units: { $sum: { $size: '$items' } },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Product Performance
    Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: { $ne: 'cancelled' },
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]),

    // Customer Metrics
    Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: { $ne: 'cancelled' },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$customer',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: '$customer.name',
          email: '$customer.email',
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: { $divide: ['$totalSpent', '$orderCount'] }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ])
  ]);

  // Calculate period comparisons
  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - (end - start) / (1000 * 60 * 60 * 24));
  
  const previousPeriod = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: { $ne: 'cancelled' },
        createdAt: { $gte: previousStart, $lt: start }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }
    }
  ]);

  // Calculate key metrics
  const currentPeriodStats = {
    revenue: revenue.reduce((sum, day) => sum + day.revenue, 0),
    orders: revenue.reduce((sum, day) => sum + day.orders, 0),
    units: revenue.reduce((sum, day) => sum + day.units, 0)
  };

  const previousPeriodStats = previousPeriod[0] || { revenue: 0, orders: 0 };

  const metrics = {
    revenueGrowth: previousPeriodStats.revenue ? 
      ((currentPeriodStats.revenue - previousPeriodStats.revenue) / previousPeriodStats.revenue) * 100 : 0,
    orderGrowth: previousPeriodStats.orders ? 
      ((currentPeriodStats.orders - previousPeriodStats.orders) / previousPeriodStats.orders) * 100 : 0,
    avgOrderValue: currentPeriodStats.orders ? 
      currentPeriodStats.revenue / currentPeriodStats.orders : 0
  };

  // Calculate inventory metrics
  const inventoryMetrics = await Product.aggregate([
    {
      $match: { vendor: vendorId }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        lowStock: {
          $sum: {
            $cond: [
              { $lt: ['$stock', '$lowStockThreshold'] },
              1,
              0
            ]
          }
        },
        outOfStock: {
          $sum: {
            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
          }
        },
        averageStock: { $avg: '$stock' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      dailyStats: revenue,
      topProducts: products,
      topCustomers: customers,
      periodComparison: {
        current: currentPeriodStats,
        previous: previousPeriodStats,
        growth: metrics
      },
      inventory: inventoryMetrics[0] || {
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        averageStock: 0
      }
    }
  });
});

/**
 * Get sales forecast based on historical data
 * Uses simple linear regression for basic forecasting
 */
exports.getSalesForecast = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const vendorId = req.vendor._id;

  // Get last 90 days of data for forecasting
  const historicalData = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: { $ne: 'cancelled' },
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 90))
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Simple linear regression
  const n = historicalData.length;
  if (n < 2) {
    return res.json({
      success: true,
      data: {
        message: 'Not enough historical data for forecasting',
        forecast: []
      }
    });
  }

  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData.map(d => d.revenue);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast
  const forecast = Array.from({ length: parseInt(days) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.max(0, intercept + slope * (n + i)),
      orders: Math.round(Math.max(0, intercept + slope * (n + i)) / (sumY / n * sumX / n))
    };
  });

  res.json({
    success: true,
    data: {
      historicalData,
      forecast,
      confidence: calculateConfidence(historicalData)
    }
  });
});

// Helper function to calculate forecast confidence
function calculateConfidence(data) {
  const variations = data.map((d, i, arr) => {
    if (i === 0) return 0;
    return Math.abs((d.revenue - arr[i-1].revenue) / arr[i-1].revenue);
  }).filter(v => !isNaN(v));

  const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
  
  // Return confidence score (0-100)
  return Math.max(0, Math.min(100, 100 * (1 - avgVariation)));
}
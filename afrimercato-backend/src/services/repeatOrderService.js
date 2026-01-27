// =================================================================
// REPEAT ORDER SERVICE - CRON JOB
// =================================================================
// Automatically creates orders for customers with repeat purchase enabled

const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Calculate next repeat date based on frequency
 */
const calculateNextRepeatDate = (frequency) => {
  const today = new Date();
  const daysToAdd = {
    'weekly': 7,
    'bi-weekly': 14,
    'monthly': 30,
    'quarterly': 90
  };

  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + (daysToAdd[frequency] || 7));
  return nextDate;
};

/**
 * Generate order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Process repeat orders
 * Finds orders with repeat purchase enabled and due date <= now
 * Creates new orders based on the original order
 */
const processRepeatOrders = async () => {
  console.log('[CRON] Starting repeat order processing...');

  try {
    const now = new Date();

    // Find orders that are due for repeat
    const dueOrders = await Order.find({
      'repeatPurchase.enabled': true,
      'repeatPurchase.active': true,
      'repeatPurchase.nextRepeatDate': { $lte: now },
      paymentStatus: 'paid', // Only repeat paid orders
      status: { $in: ['delivered', 'completed'] } // Only completed orders
    }).populate('customer').populate('items.product');

    console.log(`[CRON] Found ${dueOrders.length} orders due for repeat`);

    for (const originalOrder of dueOrders) {
      try {
        // Check if customer still exists
        const customer = await User.findById(originalOrder.customer);
        if (!customer) {
          console.log(`[CRON] Customer not found for order ${originalOrder.orderNumber}, skipping`);
          continue;
        }

        // Check if customer has disabled repeat purchase
        if (!customer.repeatPurchaseSettings?.enabled) {
          console.log(`[CRON] Customer disabled repeat purchase, skipping order ${originalOrder.orderNumber}`);
          // Disable repeat on this order too
          originalOrder.repeatPurchase.active = false;
          await originalOrder.save();
          continue;
        }

        // Validate and prepare items
        const newOrderItems = [];
        let totalAmount = 0;
        let stockIssue = false;

        for (const item of originalOrder.items) {
          const product = await Product.findById(item.product);

          if (!product) {
            console.log(`[CRON] Product ${item.product} not found, skipping item`);
            continue;
          }

          if (product.stock < item.quantity) {
            console.log(`[CRON] Insufficient stock for ${product.name}, skipping order`);
            stockIssue = true;
            break;
          }

          newOrderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            price: product.price, // Use current price
            unit: item.unit || 'piece'
          });

          totalAmount += product.price * item.quantity;
        }

        if (stockIssue || newOrderItems.length === 0) {
          // Update next repeat date anyway to prevent repeated failures
          originalOrder.repeatPurchase.nextRepeatDate = calculateNextRepeatDate(originalOrder.repeatPurchase.frequency);
          await originalOrder.save();
          continue;
        }

        // Deduct stock
        for (const item of newOrderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        }

        // Calculate fees
        const deliveryFee = totalAmount >= 30 ? 0 : 3.99;
        const finalTotal = totalAmount + deliveryFee;

        // Create new order
        const newOrder = await Order.create({
          orderNumber: generateOrderNumber(),
          customer: customer._id,
          vendor: originalOrder.vendor,
          items: newOrderItems,
          totalAmount: finalTotal,
          subtotal: totalAmount,
          deliveryFee,
          status: 'pending',
          paymentStatus: 'pending', // Customer will need to pay
          paymentMethod: originalOrder.paymentMethod,
          deliveryAddress: originalOrder.deliveryAddress,
          deliveryAddressDetails: originalOrder.deliveryAddressDetails,
          repeatPurchase: {
            enabled: true,
            frequency: originalOrder.repeatPurchase.frequency,
            nextRepeatDate: calculateNextRepeatDate(originalOrder.repeatPurchase.frequency),
            active: true
          },
          isRepeatOrder: true,
          originalOrderId: originalOrder._id
        });

        console.log(`[CRON] Created repeat order ${newOrder.orderNumber} for customer ${customer.email}`);

        // Update original order's next repeat date
        originalOrder.repeatPurchase.nextRepeatDate = calculateNextRepeatDate(originalOrder.repeatPurchase.frequency);
        originalOrder.repeatPurchase.lastRepeatOrderId = newOrder._id;
        await originalOrder.save();

        // TODO: Send notification email to customer about the new repeat order

      } catch (orderError) {
        console.error(`[CRON] Error processing order ${originalOrder.orderNumber}:`, orderError.message);
      }
    }

    console.log('[CRON] Repeat order processing completed');

  } catch (error) {
    console.error('[CRON] Error in repeat order processing:', error);
  }
};

/**
 * Send reminder notifications for upcoming repeat orders
 * Runs daily to notify customers 2 days before their repeat order
 */
const sendRepeatOrderReminders = async () => {
  console.log('[CRON] Checking for repeat order reminders...');

  try {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find orders due in 2 days that haven't been notified
    const upcomingOrders = await Order.find({
      'repeatPurchase.enabled': true,
      'repeatPurchase.active': true,
      'repeatPurchase.nextRepeatDate': {
        $gte: today,
        $lte: twoDaysFromNow
      },
      'repeatPurchase.reminderSent': { $ne: true }
    }).populate('customer');

    console.log(`[CRON] Found ${upcomingOrders.length} orders needing reminders`);

    for (const order of upcomingOrders) {
      // TODO: Send reminder email
      // For now, just mark as reminded
      order.repeatPurchase.reminderSent = true;
      await order.save();

      console.log(`[CRON] Reminder sent for order ${order.orderNumber}`);
    }

  } catch (error) {
    console.error('[CRON] Error sending reminders:', error);
  }
};

/**
 * Initialize all cron jobs
 */
const initializeCronJobs = () => {
  console.log('[CRON] Initializing cron jobs...');

  // Process repeat orders every hour at minute 0
  cron.schedule('0 * * * *', () => {
    processRepeatOrders();
  });

  // Send reminders daily at 9 AM
  cron.schedule('0 9 * * *', () => {
    sendRepeatOrderReminders();
  });

  console.log('[CRON] Cron jobs initialized');
  console.log('  - Repeat order processing: Every hour');
  console.log('  - Reminder notifications: Daily at 9 AM');
};

module.exports = {
  initializeCronJobs,
  processRepeatOrders,
  sendRepeatOrderReminders
};

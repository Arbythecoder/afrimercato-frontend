# API Implementation Summary

## New Features Implemented

This document provides an overview of the three major systems implemented: **Payout Tracking**, **Coupon/Discount System**, and **Support Ticket System**.

---

## 1. PAYOUT TRACKING SYSTEM

### Overview
Complete vendor payout management system with commission tracking, payout requests, and admin approval workflow.

### Files Created
- `src/models/Payout.js` - Payout data model
- `src/controllers/payoutController.js` - Payout business logic
- `src/routes/payoutRoutes.js` - API routes

### Features
- ✅ 15% platform commission calculation
- ✅ Vendor payout requests
- ✅ Admin approval workflow
- ✅ Payout status tracking (pending → processing → completed)
- ✅ Bank details integration
- ✅ Payout history and analytics
- ✅ Order-to-payout linking

### API Endpoints

#### Vendor Endpoints
```
GET    /api/vendor/payouts              - Get all payouts for logged-in vendor
GET    /api/vendor/payouts/summary      - Get payout summary (earnings, pending, paid)
GET    /api/vendor/payouts/:id          - Get single payout details
POST   /api/vendor/payouts/request      - Request payout for eligible earnings
```

#### Admin Endpoints
```
GET    /api/admin/payouts               - Get all payouts (filterable)
PATCH  /api/admin/payouts/:id/approve   - Approve payout
PATCH  /api/admin/payouts/:id/complete  - Mark payout as completed
PATCH  /api/admin/payouts/:id/reject    - Reject payout request
```

### Request Examples

**Request Payout (Vendor)**
```bash
POST /api/vendor/payouts/request
Authorization: Bearer <vendor_token>

# No body required - automatically calculates from unpaid orders
```

**Response:**
```json
{
  "success": true,
  "message": "Payout request submitted successfully",
  "data": {
    "payoutNumber": "PO202601000001",
    "vendor": "vendor_id",
    "financials": {
      "totalOrderValue": 5000,
      "totalPlatformFees": 750,
      "totalVendorEarnings": 4250,
      "finalPayoutAmount": 4250
    },
    "status": "pending"
  }
}
```

**Approve Payout (Admin)**
```bash
PATCH /api/admin/payouts/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "transactionId": "TXN123456",
  "notes": "Approved for processing"
}
```

### Payout Model Schema
```javascript
{
  payoutNumber: "PO202601000001",
  vendor: ObjectId,
  period: { startDate, endDate },
  orders: [{
    orderId, orderNumber, orderTotal,
    platformFee, vendorEarning
  }],
  financials: {
    totalOrderValue,
    totalPlatformFees,
    totalVendorEarnings,
    finalPayoutAmount
  },
  status: "pending|processing|completed|failed|cancelled",
  payment: {
    method, bankDetails, transactionId, reference
  }
}
```

---

## 2. COUPON/DISCOUNT SYSTEM

### Overview
Flexible coupon system supporting percentage, fixed, and free shipping discounts with usage limits and vendor/category/product targeting.

### Files Created
- `src/models/Coupon.js` - Coupon data model
- `src/controllers/couponController.js` - Coupon business logic
- `src/routes/couponRoutes.js` - API routes

### Features
- ✅ Multiple discount types (percentage, fixed, free shipping)
- ✅ Usage limits (total and per customer)
- ✅ Minimum purchase requirements
- ✅ Maximum discount caps
- ✅ Validity periods
- ✅ Targeted coupons (vendor-specific, category-specific, product-specific, first order)
- ✅ Usage tracking and analytics
- ✅ Auto-validation

### API Endpoints

#### Admin Endpoints
```
POST   /api/admin/coupons               - Create coupon
GET    /api/admin/coupons               - Get all coupons
GET    /api/admin/coupons/:id           - Get single coupon with usage details
PATCH  /api/admin/coupons/:id           - Update coupon
DELETE /api/admin/coupons/:id           - Deactivate coupon
GET    /api/admin/coupons/:id/usage     - Get usage statistics
```

#### Customer Endpoints
```
POST   /api/customer/coupons/validate   - Validate and apply coupon to cart
DELETE /api/customer/coupons/remove     - Remove coupon from cart
GET    /api/customer/coupons/available  - Get available coupons
```

### Request Examples

**Create Coupon (Admin)**
```bash
POST /api/admin/coupons
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "WELCOME20",
  "name": "Welcome Discount",
  "description": "20% off your first order",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 50,
  "minPurchase": 100,
  "validFrom": "2026-01-01T00:00:00Z",
  "validUntil": "2026-12-31T23:59:59Z",
  "usageLimit": 1000,
  "usagePerCustomer": 1,
  "applicableTo": "first_order"
}
```

**Apply Coupon (Customer)**
```bash
POST /api/customer/coupons/validate
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "code": "WELCOME20"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "coupon": {
      "code": "WELCOME20",
      "name": "Welcome Discount",
      "description": "20% off your first order"
    },
    "discount": 20,
    "newTotal": 80,
    "cart": { ... }
  }
}
```

### Coupon Model Schema
```javascript
{
  code: "WELCOME20",
  name: "Welcome Discount",
  discountType: "percentage|fixed|free_shipping",
  discountValue: 20,
  maxDiscount: 50,
  minPurchase: 100,
  validFrom: Date,
  validUntil: Date,
  usageLimit: 1000,
  usagePerCustomer: 1,
  applicableTo: "all|specific_vendors|specific_categories|specific_products|first_order",
  vendors: [ObjectId],
  categories: [String],
  products: [ObjectId],
  usedCount: 0,
  usedBy: [{
    customer, usedAt, orderNumber, discountApplied
  }],
  isActive: true
}
```

### Coupon Types
1. **Percentage Discount**: 10% off, 20% off, etc.
2. **Fixed Discount**: $10 off, $25 off, etc.
3. **Free Shipping**: Waives delivery fee

### Targeting Options
- **All Orders**: Applies to any order
- **Specific Vendors**: Only works with selected vendors
- **Specific Categories**: Only works for products in selected categories
- **Specific Products**: Only works for selected products
- **First Order**: Only for new customers' first purchase

---

## 3. SUPPORT TICKET SYSTEM

### Overview
Complete customer support ticket system with conversation threading, status tracking, SLA monitoring, and admin dashboard.

### Files Created
- `src/models/Ticket.js` - Ticket data model
- `src/controllers/ticketController.js` - Ticket business logic
- `src/routes/ticketRoutes.js` - API routes

### Features
- ✅ Multi-category ticket support
- ✅ Priority levels (low, normal, high, urgent)
- ✅ Conversation threading
- ✅ File attachments support
- ✅ Ticket assignment to agents
- ✅ Status tracking (open → in_progress → resolved → closed)
- ✅ SLA monitoring (overdue detection)
- ✅ Customer satisfaction feedback
- ✅ Internal notes for admins
- ✅ Order/vendor linking
- ✅ Auto-close after resolution

### API Endpoints

#### User Endpoints (Customer/Vendor/Rider)
```
POST   /api/tickets                     - Create support ticket
GET    /api/tickets                     - Get user's tickets
GET    /api/tickets/:id                 - Get single ticket with messages
POST   /api/tickets/:id/messages        - Add message to ticket
PATCH  /api/tickets/:id/close           - Close ticket
POST   /api/tickets/:id/feedback        - Submit satisfaction feedback
```

#### Admin Endpoints
```
GET    /api/admin/tickets               - Get all tickets (filterable)
GET    /api/admin/tickets/stats/dashboard - Get ticket statistics
GET    /api/admin/tickets/:id           - Get ticket details
PATCH  /api/admin/tickets/:id/assign    - Assign ticket to agent
POST   /api/admin/tickets/:id/messages  - Admin reply to ticket
PATCH  /api/admin/tickets/:id/resolve   - Resolve ticket
PATCH  /api/admin/tickets/:id/status    - Update ticket status
```

### Request Examples

**Create Ticket (User)**
```bash
POST /api/tickets
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "subject": "Order not delivered",
  "description": "I placed an order 3 days ago (Order #AFM2026000123) but haven't received it yet. The tracking shows it's still 'out for delivery'.",
  "category": "delivery_issue",
  "priority": "high",
  "relatedOrder": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "ticketNumber": "TKT2026000001",
    "status": "open",
    "subject": "Order not delivered",
    "category": "delivery_issue",
    "priority": "high",
    "createdAt": "2026-01-13T10:30:00Z"
  }
}
```

**Admin Reply**
```bash
POST /api/admin/tickets/:id/messages
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "Thank you for contacting us. I've checked your order and found that the rider had an emergency. We're reassigning a new rider now. You should receive it within 2 hours.",
  "isInternal": false
}
```

**Resolve Ticket**
```bash
PATCH /api/admin/tickets/:id/resolve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "resolutionNote": "Order delivered successfully. Customer confirmed receipt.",
  "resolutionType": "resolved"
}
```

### Ticket Model Schema
```javascript
{
  ticketNumber: "TKT2026000001",
  reporter: {
    user: ObjectId,
    userType: "customer|vendor|rider",
    name, email, phone
  },
  subject: String,
  description: String,
  category: "order_issue|payment_issue|delivery_issue|product_quality|refund_request|account_issue|technical_issue|feedback|gdpr_request|other",
  priority: "low|normal|high|urgent",
  status: "open|in_progress|waiting_customer|resolved|closed|reopened",
  relatedOrder: ObjectId,
  relatedVendor: ObjectId,
  assignedTo: ObjectId,
  messages: [{
    sender, senderType, message, attachments,
    isInternal, sentAt, readBy: []
  }],
  resolution: {
    resolvedBy, resolvedAt, resolutionNote, resolutionType
  },
  feedback: {
    rating, comment, submittedAt
  },
  statusHistory: [{
    status, timestamp, note, updatedBy
  }]
}
```

### Ticket Categories
- **order_issue**: Problems with orders
- **payment_issue**: Payment/billing problems
- **delivery_issue**: Delivery delays or issues
- **product_quality**: Quality complaints
- **refund_request**: Refund requests
- **account_issue**: Account access problems
- **technical_issue**: App/website bugs
- **feedback**: General feedback
- **gdpr_request**: Data privacy requests
- **other**: Other issues

### SLA Tracking
Automatic overdue detection based on priority:
- **Urgent**: 4 hours
- **High**: 24 hours
- **Normal**: 48 hours
- **Low**: 72 hours

---

## Validation Middleware Added

All new endpoints have comprehensive validation in `src/middleware/validator.js`:

### Coupon Validation
- `validateCoupon` - Full coupon creation validation
- `validateCouponCode` - Code validation for applying coupons

### Ticket Validation
- `validateTicket` - Ticket creation validation
- `validateTicketMessage` - Message validation
- `validateTicketFeedback` - Feedback validation

---

## Database Models Summary

### 3 New Models Created
1. **Payout** - Vendor payout tracking
2. **Coupon** - Discount code management
3. **Ticket** - Support ticket system

### Integration Points
- **Payout** ↔ Order (tracks which orders are paid out)
- **Payout** ↔ Vendor (vendor earnings)
- **Coupon** ↔ Cart (applied discounts)
- **Coupon** ↔ Order (discount tracking)
- **Ticket** ↔ Order (order-related issues)
- **Ticket** ↔ Vendor (vendor-related issues)
- **Ticket** ↔ User (ticket reporter)

---

## Testing the APIs

### Prerequisites
1. Start the server: `npm start`
2. Ensure MongoDB is running
3. Have admin, vendor, and customer tokens ready

### Quick Test Flow

**1. Create a Coupon (Admin)**
```bash
curl -X POST http://localhost:5000/api/admin/coupons \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST20",
    "name": "Test Discount",
    "discountType": "percentage",
    "discountValue": 20,
    "validFrom": "2026-01-01",
    "validUntil": "2026-12-31",
    "applicableTo": "all"
  }'
```

**2. Apply Coupon (Customer)**
```bash
curl -X POST http://localhost:5000/api/customer/coupons/validate \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST20"}'
```

**3. Request Payout (Vendor)**
```bash
curl -X POST http://localhost:5000/api/vendor/payouts/request \
  -H "Authorization: Bearer <vendor_token>"
```

**4. Create Support Ticket (Customer)**
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Issue",
    "description": "This is a test ticket",
    "category": "other",
    "priority": "normal"
  }'
```

---

## Architecture Overview

### Payout Flow
```
1. Vendor completes orders (status: completed, payment: paid)
2. Vendor requests payout → Payout created (status: pending)
3. Admin reviews → Approves (status: processing)
4. Payment processed → Admin marks complete (status: completed)
5. Vendor receives payment to bank account
```

### Coupon Flow
```
1. Admin creates coupon with rules
2. Customer adds coupon code at checkout
3. System validates:
   - Is coupon active and valid?
   - Has customer used it before?
   - Does order meet minimum purchase?
   - Is coupon applicable to cart items?
4. Discount applied to cart
5. Order created with discount tracked
6. Coupon usage recorded
```

### Ticket Flow
```
1. User creates ticket (status: open)
2. Admin assigns to agent (status: in_progress)
3. Conversation happens (messages added)
4. Agent resolves ticket (status: resolved)
5. Auto-close scheduled after 7 days
6. User can provide feedback (rating 1-5)
```

---

## Next Steps (Not Yet Implemented)

### Guest Checkout System
- Guest session management
- Guest cart without authentication
- Email-based order tracking
- Post-purchase account creation

### Analytics Enhancements
- Advanced vendor analytics
- Export functionality (CSV/PDF)
- Custom date range reports
- Cohort analysis

---

## Summary

✅ **3 major systems implemented:**
1. Payout Tracking System (7 endpoints)
2. Coupon/Discount System (9 endpoints)
3. Support Ticket System (13 endpoints)

✅ **Total: 29 new API endpoints**

✅ **All endpoints include:**
- Authentication & authorization
- Input validation
- Error handling
- Comprehensive documentation

✅ **Production-ready features:**
- Database indexes for performance
- Virtual fields for computed data
- Status tracking and audit trails
- Integration with existing systems

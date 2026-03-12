# Afrimercato Feature Completion Plan

## 📊 Overview

**MVP Status:** Customer + Vendor fully functional  
**Partial Implementation:** Rider, Picker, Admin, Payment, Tracking, GDPR  
**Auth Status:** Fixed - roles authoritative from backend JWT/database

---

## 📋 Table of Unfinished Endpoints

### 🚴 RIDER ENDPOINTS (21 total, 1 implemented)

| Route | Method | Status | Fallback Message |
|-------|--------|--------|------------------|
| `/api/rider/auth/login` | POST | 501 | "Rider login" |
| `/api/rider/profile` | GET | 501 | "Get rider profile" |
| `/api/rider/profile` | PUT | 501 | "Update rider profile" |
| `/api/rider/stores/request/:storeId` | POST | 501 | "Request connection with store" |
| `/api/rider/stores/my-stores` | GET | 501 | "Get connected stores" |
| `/api/rider/stores/requests` | GET | 501 | "Get connection requests" |
| `/api/rider/stores/deliveries` | GET | 501 | "Get available deliveries" |
| `/api/rider/stores/deliveries/active` | GET | 501 | "Get active deliveries" |
| `/api/rider/stores/deliveries/:id/accept` | POST | 501 | "Accept delivery" |
| `/api/rider/stores/deliveries/:id/reject` | POST | 501 | "Reject delivery" |
| `/api/rider/stores/deliveries/:id/start` | POST | 501 | "Start delivery" |
| `/api/rider/stores/deliveries/:id/complete` | POST | 501 | "Complete delivery" |
| `/api/rider/stores/location/update` | POST | 501 | "Update current location" |
| `/api/rider/stores/deliveries/:id/track` | GET | 501 | "Get delivery tracking" |
| `/api/rider/stores/earnings` | GET | 501 | "Get earnings" |
| `/api/rider/stores/ratings` | GET | 501 | "Get rider ratings" |
| `/api/rider/stores/store/:id/rate` | POST | 501 | "Rate store" |

### 🛒 PICKER ENDPOINTS (22 total, 0 implemented)

| Route | Method | Status | Fallback Message |
|-------|--------|--------|------------------|
| `/api/picker/auth/register` | POST | 501 | "Picker registration" |
| `/api/picker/auth/login` | POST | 501 | "Picker login" |
| `/api/picker/auth/profile` | GET | 501 | "Get picker profile" |
| `/api/picker/auth/profile` | PUT | 501 | "Update picker profile" |
| `/api/picker/auth/documents/upload` | POST | 501 | "Upload verification documents" |
| `/api/picker/auth/connect-store/:storeId` | POST | 501 | "Connect with store" |
| `/api/picker/auth/connected-stores` | GET | 501 | "Get connected stores" |
| `/api/picker/auth/check-in/:storeId` | POST | 501 | "Check in at store" |
| `/api/picker/auth/check-out/:storeId` | POST | 501 | "Check out from store" |
| `/api/picker/orders/available` | GET | 501 | "Get available orders" |
| `/api/picker/orders/my-orders` | GET | 501 | "Get my orders" |
| `/api/picker/orders/:orderId/claim` | POST | 501 | "Claim order for picking" |
| `/api/picker/orders/:orderId/start` | POST | 501 | "Start picking order" |
| `/api/picker/orders/:orderId/items` | GET | 501 | "Get order items to pick" |
| `/api/picker/orders/:orderId/items/:itemId/pick` | POST | 501 | "Mark item as picked" |
| `/api/picker/orders/:orderId/items/:itemId/issue` | POST | 501 | "Report item issue" |
| `/api/picker/orders/:orderId/substitute` | POST | 501 | "Suggest substitute product" |
| `/api/picker/orders/:orderId/ready-for-packing` | POST | 501 | "Mark all items picked" |
| `/api/picker/orders/:orderId/start-packing` | POST | 501 | "Start packing order" |
| `/api/picker/orders/:orderId/upload-photos` | POST | 501 | "Upload packing photos" |
| `/api/picker/orders/:orderId/complete-packing` | POST | 501 | "Complete packing for rider" |
| `/api/picker/orders/history` | GET | 501 | "Get picking history" |
| `/api/picker/orders/earnings` | GET | 501 | "Get earnings" |
| `/api/picker/orders/stats` | GET | 501 | "Get performance stats" |

### 👨‍💼 ADMIN ENDPOINTS (45+ total, 0 implemented)

| Route | Method | Status | Fallback Message |
|-------|--------|--------|------------------|
| `/api/admin/profile` | GET/PUT | 501 | "Admin profile" |
| `/api/admin/password/change` | POST | 501 | "Change password" |
| `/api/admin/audit-logs` | GET | 501 | "Get audit logs" |
| `/api/admin/login-history` | GET | 501 | "Get login history" |
| `/api/admin/activity-logs` | GET | 501 | "Get system activity logs" |
| `/api/admin/2fa/*` | POST | 501 | "Two-factor authentication" |
| `/api/admin/vendors/*` | ALL | 501 | "Vendor management" |
| `/api/admin/customers/*` | ALL | 501 | "Customer management" |
| `/api/admin/riders/*` | ALL | 501 | "Rider management" |
| `/api/admin/pickers/*` | ALL | 501 | "Picker management" |

### 💳 PAYMENT ENDPOINTS (Partially Implemented)

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/payment/process` | POST | ✅ | Basic implementation |
| `/api/payment/methods` | GET | ✅ | Implemented |
| `/api/payment/methods/add` | POST | ⚠️ | Stubbed |
| `/api/payment/status/:id` | GET | ✅ | Implemented |
| `/api/payment/refund/:orderId` | POST | ⚠️ | Needs gateway integration |
| `/api/payment/webhook` | POST | ⚠️ | Needs Stripe/PayPal |

### 🔍 TRACKING ENDPOINTS (10 total, 0 implemented)

| Route | Method | Status | Fallback Message |
|-------|--------|--------|------------------|
| `/api/tracking/orders/:orderId` | GET | 501 | "Get order tracking" |
| `/api/tracking/orders/:orderId/status` | GET | 501 | "Get order status" |
| `/api/tracking/orders/:orderId/events` | GET | 501 | "Get order events" |
| `/api/tracking/deliveries/:deliveryId` | GET | 501 | "Get delivery tracking" |
| `/api/tracking/deliveries/:deliveryId/location` | GET | 501 | "Get real-time location" |
| `/api/tracking/deliveries/:deliveryId/eta` | GET | 501 | "Get estimated arrival" |
| `/api/tracking/subscribe/:orderId` | POST | 501 | "Subscribe to order updates" |
| `/api/tracking/history` | GET | 501 | "Get tracking history" |

### 🛡️ GDPR ENDPOINTS (12 total, 0 implemented)

| Route | Method | Status | Fallback Message |
|-------|--------|--------|------------------|
| `/api/gdpr/my-data` | GET | 501 | "Get my personal data" |
| `/api/gdpr/my-data/export` | POST | 501 | "Export personal data" |
| `/api/gdpr/request-deletion` | POST | 501 | "Request account deletion" |
| `/api/gdpr/deletion-status` | GET | 501 | "Get deletion request status" |
| `/api/gdpr/cancel-deletion` | POST | 501 | "Cancel deletion request" |
| `/api/gdpr/privacy/settings` | GET/PUT | 501 | "Privacy settings" |
| `/api/gdpr/correct-data` | PUT | 501 | "Correct personal data" |
| `/api/gdpr/consents` | GET | 501 | "Get consents" |
| `/api/gdpr/consents/:id/revoke` | POST | 501 | "Revoke consent" |
| `/api/gdpr/portability/request` | GET | 501 | "Request data portability" |

### 💰 PAYOUT & SUBSCRIPTION ENDPOINTS (20 total, 0 implemented)

| Route | Method | Status | Fallback Message |
|-------|--------|--------|------------------|
| `/api/payouts/*` | ALL | 501 | "Payout management" |
| `/api/subscription/*` | ALL | 501 | "Subscription management" |

---

## ⚠️ MVP Flow Breakage Points

### Critical Guards Needed

1. **Order Status Updates**
   - When order status changes to "ready-for-pickup", picker endpoints are called
   - Guard: Skip picker assignment if picker role not fully implemented

2. **Delivery Assignment**
   - After picking, system assigns rider
   - Guard: Fall back to "vendor-managed delivery" if rider endpoints fail

3. **Payment Webhooks**
   - Stripe/PayPal webhooks may fail silently
   - Guard: Log all webhook attempts, use polling fallback

4. **Real-time Tracking**
   - Customer expects live tracking
   - Guard: Show static "Order in progress" with estimated time

5. **Admin Dashboard Stats**
   - May call unimplemented aggregation endpoints
   - Guard: Return cached/mock data for demo

---

## 📅 Step-by-Step Feature Completion Plan

### Phase 1: Core Stabilization (Week 1-2)
```
Priority: Keep Customer + Vendor flows unblocked
```
- [ ] Add safe 501 fallbacks to ALL unfinished routes (DONE - see routes)
- [ ] Create frontend feature flags for incomplete sections
- [ ] Add "Coming Soon" UI for Rider/Picker/Admin dashboards
- [ ] Implement basic order status tracking (without real-time)

### Phase 2: Rider MVP (Week 3-4)
```
Dependency: Orders must flow to riders after vendor confirmation
```
- [ ] Implement `/rider/auth/register` and `/rider/auth/login`
- [ ] Implement `/rider/profile` CRUD
- [ ] Implement `/rider/deliveries` (available, accept, complete)
- [ ] Basic location tracking (manual update, no GPS)
- [ ] Connect rider to order flow

### Phase 3: Picker MVP (Week 5-6)
```
Dependency: Large orders need pickers before riders
```
- [ ] Implement `/picker/auth/*` routes
- [ ] Implement `/picker/orders/available` and `/picker/orders/claim`
- [ ] Implement item picking workflow
- [ ] Connect picker → rider handoff

### Phase 4: Payment Integration (Week 7-8)
```
Dependency: Must complete before scaling
```
- [ ] Integrate Stripe/PayPal webhooks
- [ ] Implement refund flow
- [ ] Implement vendor payouts
- [ ] Add subscription billing

### Phase 5: Admin Dashboard (Week 9-10)
```
Dependency: Needed for operations management
```
- [ ] Implement vendor approval workflow
- [ ] Implement rider/picker management
- [ ] Implement analytics dashboards
- [ ] Add audit logging

### Phase 6: GDPR & Compliance (Week 11-12)
```
Dependency: Required for EU launch
```
- [ ] Implement data export
- [ ] Implement account deletion
- [ ] Implement consent management
- [ ] Add privacy controls

---

## 🛡️ Safe Coding Patterns

### Backend: Safe 501 Fallback Template

```javascript
// PATTERN: Safe fallback for unimplemented endpoints
const notImplemented = (featureName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `${featureName} is under development`,
    feature: featureName,
    eta: 'Coming soon',
    fallback: true
  });
};

// Usage in routes:
router.get('/deliveries', protect, authorize('rider'), notImplemented('Rider deliveries'));
```

### Frontend: Feature Flag Pattern

```jsx
// PATTERN: Feature flag for incomplete features
const FEATURES = {
  RIDER_DASHBOARD: false,
  PICKER_DASHBOARD: false,
  ADMIN_PANEL: true, // Enable when ready
  REAL_TIME_TRACKING: false,
  PAYMENT_REFUNDS: false,
  GDPR_EXPORT: false
};

// Usage in component:
function RiderDashboard() {
  if (!FEATURES.RIDER_DASHBOARD) {
    return <ComingSoonPage feature="Rider Dashboard" />;
  }
  return <ActualDashboard />;
}
```

### Frontend: API Call with Fallback

```javascript
// PATTERN: API call with 501 handling
export const fetchWithFallback = async (endpoint, fallbackData) => {
  try {
    const response = await apiCall(endpoint);
    if (response.fallback) {
      // Server returned 501 with fallback flag
      return { ...fallbackData, isStub: true };
    }
    return response;
  } catch (error) {
    if (error.status === 501) {
      return { ...fallbackData, isStub: true };
    }
    throw error;
  }
};

// Usage:
const deliveries = await fetchWithFallback('/rider/deliveries', {
  deliveries: [],
  message: 'Feature coming soon'
});
```

### Frontend: Conditional UI Rendering

```jsx
// PATTERN: Show "Coming Soon" for unimplemented features
function FeatureGate({ featureKey, children, fallback }) {
  const isEnabled = useFeatureFlag(featureKey);
  
  if (!isEnabled) {
    return fallback || (
      <div className="p-8 text-center bg-yellow-50 rounded-xl">
        <span className="text-4xl">🚧</span>
        <h3 className="text-xl font-bold mt-4">Coming Soon</h3>
        <p className="text-gray-600 mt-2">
          This feature is under development
        </p>
      </div>
    );
  }
  
  return children;
}

// Usage:
<FeatureGate featureKey="RIDER_EARNINGS">
  <EarningsDashboard />
</FeatureGate>
```

---

## 📁 Files to Create

1. `src/middleware/featureFlags.js` - Server-side feature flags
2. `src/utils/notImplemented.js` - Reusable 501 handler
3. `frontend/src/config/features.js` - Client-side feature flags
4. `frontend/src/components/FeatureGate.jsx` - Conditional rendering component
5. `frontend/src/pages/ComingSoon.jsx` - Generic coming soon page

---

## ✅ Summary

| Category | Total Endpoints | Implemented | Stubbed (501) |
|----------|----------------|-------------|---------------|
| Rider | 21 | 1 | 20 |
| Picker | 24 | 0 | 24 |
| Admin | 45+ | 0 | 45+ |
| Payment | 7 | 4 | 3 |
| Tracking | 10 | 0 | 10 |
| GDPR | 12 | 0 | 12 |
| Payout | 12 | 0 | 12 |
| Subscription | 8 | 0 | 8 |

**Total unfinished endpoints: ~130**  
**All currently return HTTP 501 with JSON fallback**  
**MVP (Customer + Vendor) is NOT blocked**

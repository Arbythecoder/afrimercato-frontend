# Authentication Testing Checklist

Complete test plan for login/signup flows across all roles (Customer, Vendor, Rider, Picker, Admin).

---

## Pre-Testing Setup

### Environment Verification

- [ ] Frontend `.env` file has correct `VITE_API_URL` (NO `/api` suffix)
- [ ] Backend `.env` has `FRONTEND_ORIGINS` configured
- [ ] Backend is running and accessible
- [ ] Frontend dev server is running
- [ ] MongoDB is connected
- [ ] Browser console shows correct API URL: `🔗 API Base URL: https://...../api`

### Test Credentials Preparation

Create test accounts for each role (or use existing):

```
Customer: customer@test.com / test123
Vendor: vendor@test.com / test123
Rider: rider@test.com / test123
Picker: picker@test.com / test123
Admin: admin@test.com / test123
```

---

## Customer Authentication Tests

### Registration Flow

- [ ] Navigate to `/register`
- [ ] Fill in registration form:
  - Full Name: Test Customer
  - Email: customer-new@test.com
  - Phone: +1234567890
  - Password: test123
  - Confirm Password: test123
  - Role: Customer (default)
  - Accept Terms: Checked
- [ ] Click "Sign Up"
- [ ] **Verify: No page refresh** (form stays on same page)
- [ ] **Verify: Success message displays inline**
- [ ] **Verify: Redirect to `/` (homepage)**
- [ ] **Verify: Token in localStorage** (DevTools → Application → Local Storage → `afrimercato_token`)
- [ ] **Verify: User name/avatar shown in header**

### Login Flow

- [ ] Navigate to `/login`
- [ ] Enter email: customer@test.com
- [ ] Enter password: test123
- [ ] Click "Login"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/` (homepage)**
- [ ] **Verify: Token stored in localStorage**
- [ ] **Verify: User is authenticated** (can access profile, cart, checkout)

### Error Handling

- [ ] Try login with wrong password
  - **Verify: Inline error "Invalid credentials"**
  - **Verify: No page refresh**
- [ ] Try login with non-existent email
  - **Verify: Inline error "Invalid credentials"**
- [ ] Try registration with existing email
  - **Verify: Inline error "Email already registered"**
- [ ] Try registration with password < 6 chars
  - **Verify: Inline error "Password must be at least 6 characters"**
- [ ] Try registration with mismatched passwords
  - **Verify: Inline error "Passwords do not match"**

### Logout

- [ ] Click logout button
- [ ] **Verify: Redirect to `/login`**
- [ ] **Verify: Token removed from localStorage**
- [ ] **Verify: Cannot access protected routes** (redirects to login)

---

## Vendor Authentication Tests

### Registration Flow

- [ ] Navigate to `/register?role=vendor`
- [ ] Fill in vendor registration form:
  - Full Name: Test Vendor
  - Email: vendor-new@test.com
  - Phone: +1234567890
  - Password: test123
  - Store Name: Test Store
  - Category: Groceries
  - Store Description: Test description
  - Address: 123 Test St
- [ ] Click "Sign Up"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/dashboard`**
- [ ] **Verify: Token in localStorage**
- [ ] **Verify: "Pending Approval" banner shown**
- [ ] **Verify: Can add products but store hidden to customers**

### Login Flow

- [ ] Navigate to `/login`
- [ ] Enter email: vendor@test.com
- [ ] Enter password: test123
- [ ] Click "Login"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/dashboard`**
- [ ] **Verify: Dashboard shows vendor metrics** (products, orders, revenue)
- [ ] **Verify: Can access vendor routes** (/dashboard, /vendor/products, /orders)

### Vendor-Specific Tests

- [ ] Create a new product while logged in as vendor
  - **Verify: Product saved successfully**
  - **Verify: API request includes Bearer token**
- [ ] Try accessing vendor dashboard as customer
  - **Verify: Redirect to customer homepage**

---

## Rider Authentication Tests

### Registration Flow

- [ ] Navigate to `/register` → Select "Rider" (if shown, or use `/rider-auth/register` endpoint)
- [ ] Fill in rider registration form
- [ ] Click "Sign Up"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/rider/dashboard`**
- [ ] **Verify: Token in localStorage**

### Login Flow

- [ ] Navigate to `/login`
- [ ] Enter email: rider@test.com
- [ ] Enter password: test123
- [ ] Click "Login"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/rider/dashboard`**
- [ ] **Verify: Dashboard shows rider metrics** (deliveries, earnings)

---

## Picker Authentication Tests

### Registration Flow

- [ ] Navigate to `/register` → Select "Picker" (if shown)
- [ ] Fill in picker registration form
- [ ] Click "Sign Up"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/picker/dashboard`**
- [ ] **Verify: Token in localStorage**

### Login Flow

- [ ] Navigate to `/login`
- [ ] Enter email: picker@test.com
- [ ] Enter password: test123
- [ ] Click "Login"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/picker/dashboard`**
- [ ] **Verify: Dashboard shows picker metrics** (orders picked, accuracy)

---

## Admin Authentication Tests

### Login Flow (No Public Registration)

- [ ] Navigate to `/login`
- [ ] Enter email: admin@test.com
- [ ] Enter password: admin123
- [ ] Click "Login"
- [ ] **Verify: No page refresh**
- [ ] **Verify: Redirect to `/admin` or `/admin/dashboard`**
- [ ] **Verify: Token in localStorage**
- [ ] **Verify: Can access admin routes** (/admin/vendors, /admin/users)

### Admin-Specific Tests

- [ ] Access vendor approval page
  - **Verify: Can approve/reject vendors**
- [ ] Try accessing admin routes as non-admin
  - **Verify: Access denied (403)**

---

## CORS & Cookies Tests

### Development Environment (HTTP)

- [ ] Login as any role in development
- [ ] Open DevTools → Application → Cookies
- [ ] **Verify: `token` cookie present**
- [ ] **Verify: `refreshToken` cookie present**
- [ ] **Verify: Cookie settings:**
  - `httpOnly: true`
  - `secure: false` (development)
  - `sameSite: lax`

### Production Environment (HTTPS)

- [ ] Deploy to Vercel preview
- [ ] Login from preview URL
- [ ] Check cookies in DevTools
- [ ] **Verify: Cookie settings:**
  - `httpOnly: true`
  - `secure: true` (production)
  - `sameSite: none` (for cross-origin)

### CORS Allowed Origins

Test from different domains:

- [ ] Request from `http://localhost:3000` (development)
  - **Verify: Request succeeds**
- [ ] Request from `http://localhost:5173` (Vite dev server)
  - **Verify: Request succeeds**
- [ ] Request from Vercel preview URL (e.g., `https://afrimercato-frontend-git-main.vercel.app`)
  - **Verify: Request succeeds**
  - **Verify: No CORS errors in console**
- [ ] Request from production URL (e.g., `https://afrimercato.com`)
  - **Verify: Request succeeds**

### CORS Rejected Origins

- [ ] Try API request from a random domain (e.g., via Postman with custom Origin header)
  - **Verify: Backend logs rejected origin**
  - **Verify: 403 or CORS error**

---

## Token Tests

### Token Storage

- [ ] Login as customer
- [ ] Open DevTools → Application → Local Storage
- [ ] **Verify: `afrimercato_token` present** (JWT string)
- [ ] **Verify: `afrimercato_refresh_token` present** (hex string)
- [ ] **Verify: User data NOT in localStorage** (security check)

### Token in API Requests

- [ ] Login as vendor
- [ ] Create a product
- [ ] Open DevTools → Network tab
- [ ] Find the product creation request
- [ ] **Verify: `Authorization: Bearer <token>` header present**
- [ ] **Verify: Token matches one in localStorage**

### Token Refresh Flow

- [ ] Login and get a token
- [ ] Wait for token to expire (or manually expire it by changing JWT_SECRET temporarily)
- [ ] Make an authenticated request (e.g., view profile)
- [ ] **Verify: Frontend auto-refreshes token** (check Network tab for `/auth/refresh-token` call)
- [ ] **Verify: Original request retries after refresh**
- [ ] **Verify: No manual re-login required**

---

## Cross-Browser Testing

Test on multiple browsers:

### Chrome
- [ ] Customer login/register
- [ ] Vendor login/register
- [ ] **Verify: All flows work**

### Firefox
- [ ] Customer login/register
- [ ] **Verify: Cookies set correctly**

### Safari
- [ ] Customer login/register
- [ ] **Verify: Cross-origin cookies work** (if using different domains)

### Mobile Browsers
- [ ] Chrome Mobile
  - [ ] Customer login
  - [ ] **Verify: Responsive UI**
  - [ ] **Verify: No page refresh**
- [ ] Safari Mobile (iOS)
  - [ ] Customer login
  - [ ] **Verify: Works on iOS**

---

## Backend API Tests (cURL/Postman)

### Customer Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-customer@test.com",
    "password": "test123",
    "firstName": "API",
    "lastName": "Customer",
    "phone": "1234567890"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful...",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "abc123...",
    "user": {
      "id": "...",
      "email": "api-customer@test.com",
      "role": "customer",
      "primaryRole": "customer"
    }
  }
}
```

**Verify:**
- [ ] `success: true`
- [ ] `token` is a valid JWT
- [ ] `refreshToken` is 80-char hex string
- [ ] `Set-Cookie` headers present in response

### Vendor Registration

```bash
curl -X POST http://localhost:5000/api/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-vendor@test.com",
    "password": "test123",
    "fullName": "API Vendor",
    "storeName": "API Store",
    "phone": "1234567890",
    "category": "groceries",
    "address": "123 API St"
  }'
```

**Verify:**
- [ ] `user.role = "vendor"`
- [ ] `vendor` object included in response
- [ ] `vendor.approvalStatus = "pending"`

### Customer Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "test123"
  }'
```

**Verify:**
- [ ] Returns token
- [ ] User data matches expected role

### Rider Login

```bash
curl -X POST http://localhost:5000/api/rider-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@test.com",
    "password": "test123"
  }'
```

**Verify:**
- [ ] `user.role = "rider"`
- [ ] Role validation works (customer can't login via rider endpoint)

---

## Error Scenarios

### Wrong Password
- [ ] Login with correct email, wrong password
- **Verify: HTTP 401, message "Invalid credentials"**

### Non-Existent User
- [ ] Login with unregistered email
- **Verify: HTTP 401, message "Invalid credentials"**

### Duplicate Email
- [ ] Register with existing email
- **Verify: HTTP 400, message "Email already registered"**

### Missing Required Fields
- [ ] Register without email
- **Verify: HTTP 400, validation errors array**

### Expired Token
- [ ] Use an expired token for API request
- **Verify: HTTP 401, message "Token expired"**

### Invalid Token
- [ ] Use malformed token
- **Verify: HTTP 401, message "Invalid token"**

---

## Performance Tests

### Page Load Speed
- [ ] Login page loads < 2 seconds
- [ ] Register page loads < 2 seconds
- [ ] Dashboard loads < 3 seconds after login

### API Response Times
- [ ] Login request completes < 500ms
- [ ] Register request completes < 1000ms
- [ ] Token refresh completes < 300ms

---

## Security Tests

### Password Security
- [ ] Check password is hashed in database (NOT plain text)
- [ ] Password not returned in API responses
- [ ] Password field has `select: false` in User model

### Token Security
- [ ] JWT contains only necessary data (id, roles, email)
- [ ] JWT does NOT contain password
- [ ] Refresh token is random, not predictable

### Cookie Security
- [ ] Cookies have `httpOnly: true` (prevent XSS)
- [ ] Production cookies have `secure: true` (HTTPS only)
- [ ] Production cookies have `sameSite: none` (for cross-origin)

---

## Summary Checklist

By the end of testing, you should have verified:

- [ ] **No page refreshes** on any login/signup form
- [ ] **Tokens stored correctly** (localStorage + cookies)
- [ ] **Role-based redirects work** for all 5 roles
- [ ] **CORS configured** with FRONTEND_ORIGINS
- [ ] **Inline error handling** (no page reload on errors)
- [ ] **Production-ready** (HTTPS, secure cookies, wildcards for Vercel)
- [ ] **All roles tested** (Customer, Vendor, Rider, Picker, Admin)
- [ ] **Cross-browser compatibility** (Chrome, Firefox, Safari)
- [ ] **Mobile responsive** (works on phones/tablets)
- [ ] **Backend refactored** (using centralized authHelpers)
- [ ] **Documentation complete** (ENV_SETUP.md, this file, DEPLOYMENT_CHECKLIST.md)

---

## Stripe Payment Tests

### Environment Verification

- [ ] Backend `.env` has `STRIPE_SECRET_KEY` set
- [ ] Backend `.env` has `STRIPE_WEBHOOK_SECRET` set
- [ ] Server startup shows: `✅ STRIPE READY: Payments and webhooks configured`
- [ ] Frontend `.env` has `VITE_STRIPE_PUBLISHABLE_KEY` (if using Stripe Elements)

### Webhook URL Configuration

**Production Webhook URL:**
```
https://afrimercato-backend.fly.dev/api/payments/webhook
```

Configure this URL in Stripe Dashboard → Developers → Webhooks → Add endpoint

Events to listen for:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Customer Checkout Flow

- [ ] Login as customer
- [ ] Add products to cart
- [ ] Navigate to `/checkout`
- [ ] Fill delivery address
- [ ] Select "Card Payment" (shows "Pay securely with Stripe")
- [ ] Click "Place Order"
- [ ] **Verify: Redirect to Stripe Checkout page**
- [ ] Complete payment with test card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any valid postal code
- [ ] **Verify: Redirect to success page**
- [ ] **Verify: Order status updated to "paid"**

### Webhook Verification

- [ ] After successful payment, check backend logs
- [ ] **Verify: Log shows** `✓ Payment confirmed for order <ORDER_NUMBER>`
- [ ] Check order in database: `paymentStatus: 'paid'`

### Cash on Delivery Flow

- [ ] Login as customer
- [ ] Add products to cart
- [ ] Select "Cash on Delivery"
- [ ] Click "Place Order"
- [ ] **Verify: Order created with** `paymentStatus: 'pending'`
- [ ] **Verify: Redirect to order confirmation** (no Stripe redirect)

### Error Handling

- [ ] Try checkout without Stripe key configured (backend)
  - **Verify: HTTP 503, message "Payment system not configured"**
- [ ] Cancel payment on Stripe page
  - **Verify: Redirect to cancel URL**
  - **Verify: Order status remains "pending"**

---

## Test Automation (Optional)

For CI/CD pipelines, consider these automated tests:

```javascript
// Example: Playwright test
test('customer can register without page refresh', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'test123');
  await page.click('button[type="submit"]');

  // Verify no navigation (URL doesn't reload)
  await expect(page).toHaveURL('/'); // Redirected after success

  // Verify token in localStorage
  const token = await page.evaluate(() => localStorage.getItem('afrimercato_token'));
  expect(token).toBeTruthy();
});
```

---

**Last Updated:** 2026-01-31
**Next Review:** After major auth system changes or new role additions

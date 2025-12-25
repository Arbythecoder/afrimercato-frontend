# 🧪 VENDOR END-TO-END TESTING GUIDE

## Quick Test Scenarios for Production Verification

### ✅ TEST 1: Vendor Registration & Onboarding (5 min)

**Steps:**
1. Go to https://arbythecoder.github.io/afrimercato-frontend/register?role=vendor
2. Fill registration form:
   - Name: "Test Vendor Store"
   - Email: "testvendor@example.com"
   - Password: "Test123456"
   - Role: Vendor
3. Click "Register"

**Expected Result:**
- ✅ Redirected to vendor onboarding wizard
- ✅ See 5-step progress bar

**Step 1 - Store Info:**
4. Fill in:
   - Store Name: "Fresh Valley Farms"
   - Description: "Organic produce from local farms"
   - Select Category: "Fresh Produce"
5. Click "Next"

**Expected:** ✅ Move to Step 2

**Step 2 - Contact Info:**
6. Fill in:
   - Phone: "+44 20 1234 5678"
   - Alternative Phone: (optional)
7. Click "Next"

**Expected:** ✅ Move to Step 3

**Step 3 - Location:**
8. Fill in:
   - Street: "123 High Street"
   - City: "London"
   - State: "Greater London"
   - Postal Code: "SW1A 1AA"
9. Click "Next"

**Expected:** ✅ Move to Step 4

**Step 4 - Business Hours:**
10. Verify default hours are set
11. Optionally adjust or mark Sunday as closed
12. Click "Next"

**Expected:** ✅ Move to Step 5

**Step 5 - Branding:**
13. Optionally upload logo
14. Click "Complete Setup"

**Expected:**
- ✅ Profile created successfully
- ✅ Redirected to vendor dashboard
- ✅ See dashboard with 0 products, 0 orders

---

### ✅ TEST 2: Product Creation (3 min)

**Starting Point:** Logged in as vendor with profile

1. Navigate to "Products" from sidebar
2. Click "Add Product" button

**Expected:** ✅ Product modal opens

3. Fill in product details:
   - Name: "Organic Tomatoes"
   - Description: "Fresh organic tomatoes from local farms"
   - Category: "Vegetables"
   - Unit: "kg"
   - Price: "3.50"
   - Stock: "100"
   - Low Stock Alert: "10"
4. Check "In Stock" and "Active"
5. Click "Create Product"

**Expected:**
- ✅ Success message displayed
- ✅ Modal closes
- ✅ Product appears in products list
- ✅ Shows image placeholder, price £3.50, stock 100

**Test Variations:**
- Create 2-3 more products
- Try uploading images (PNG/JPG)
- Try different categories

---

### ✅ TEST 3: Product Management (2 min)

**Starting Point:** At least 1 product created

1. Click "Edit" on a product
2. Change price from £3.50 to £3.99
3. Change stock from 100 to 150
4. Click "Update Product"

**Expected:**
- ✅ Product updated successfully
- ✅ New price and stock shown

**Bulk Operations:**
5. Select 2 products using checkboxes
6. Click "Bulk Actions"
7. Try "Update Status" → Set to "Inactive"

**Expected:**
- ✅ Selected products marked inactive
- ✅ Badge shows "Inactive"

**Delete Test:**
8. Click delete on a product
9. Confirm deletion

**Expected:**
- ✅ Product removed from list

---

### ✅ TEST 4: Dashboard Verification (1 min)

1. Navigate to "Dashboard"

**Expected to See:**
- ✅ Total products count (matches your products)
- ✅ Revenue: £0.00 (no orders yet)
- ✅ Charts loading without errors
- ✅ "No recent orders" message
- ✅ Low stock alerts (if any product below threshold)

**Test Filters:**
2. Change time range to "30 days"
3. Change to "90 days"

**Expected:**
- ✅ Charts update
- ✅ Stats recalculate

---

### ✅ TEST 5: Order Management (Requires Customer Order)

**Note:** This requires a customer to place an order first. For quick testing:

**Mock Order Test:**
1. Navigate to "Orders"

**Expected (No Orders):**
- ✅ "No orders found" message
- ✅ Filter buttons visible
- ✅ Search box working

**With Orders (After customer purchase):**
2. See order in list
3. Click "View Details" on order

**Expected:**
- ✅ Order modal opens
- ✅ Shows customer info
- ✅ Shows items list
- ✅ Shows total amount
- ✅ Status dropdown available

4. Update status to "Confirmed"

**Expected:**
- ✅ Status updated
- ✅ Timeline shows update
- ✅ List refreshes

---

### ✅ TEST 6: Reports (1 min)

1. Navigate to "Reports"
2. Click "Sales Report"

**Expected:**
- ✅ Report page loads
- ✅ Shows "No sales data" (if no orders)
- ✅ Date filters visible
- ✅ Export button available

3. Try other reports:
   - Inventory Report
   - Orders Report
   - Revenue Report

**Expected:**
- ✅ Each report loads
- ✅ Shows appropriate empty state or data

---

### ✅ TEST 7: Settings (1 min)

1. Navigate to "Settings"
2. View profile information

**Expected:**
- ✅ Shows store name, description
- ✅ Shows contact info
- ✅ Shows business hours

3. Click "Edit" (if available)
4. Update phone number
5. Save changes

**Expected:**
- ✅ Settings updated
- ✅ Changes persist on refresh

---

## 🚨 ERROR SCENARIOS TO TEST

### Test Error Handling

**Invalid Product Creation:**
1. Try creating product with:
   - Empty name → Should show "Name required"
   - Negative price → Should show "Valid price required"
   - Negative stock → Should show "Valid stock required"

**Expected:** ✅ Clear validation errors shown

**Network Error Simulation:**
1. Disconnect internet
2. Try creating product

**Expected:** ✅ "Network error" message shown

**Token Expiration:**
1. Wait for token to expire (7 days) or manually delete token
2. Try any action

**Expected:**
- ✅ Redirected to login
- ✅ "Session expired" message

---

## 🎯 CRITICAL USER FLOWS

### Flow 1: First-Time Vendor (15 min)
```
Register → Onboarding → Dashboard → Create Products → View Products → Dashboard
```

**Success Criteria:**
- ✅ No errors at any step
- ✅ UI is responsive
- ✅ Data persists across navigation
- ✅ Can logout and login again

### Flow 2: Returning Vendor (5 min)
```
Login → Dashboard → Check Orders → Update Order Status → Check Reports
```

**Success Criteria:**
- ✅ Fast login (< 2 seconds)
- ✅ Dashboard loads quickly
- ✅ Order updates work
- ✅ Reports accessible

### Flow 3: Product Management (10 min)
```
Products → Create 5 Products → Edit 2 → Bulk Update 3 → Delete 1
```

**Success Criteria:**
- ✅ All operations successful
- ✅ No UI glitches
- ✅ Stock counts accurate
- ✅ Images upload properly

---

## 📱 MOBILE TESTING

**Test on Mobile Device or Chrome DevTools:**

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Test:
   - ✅ Sidebar collapses to hamburger menu
   - ✅ Tables scroll horizontally
   - ✅ Forms are usable
   - ✅ Buttons are tappable

5. Select "iPad Air"
6. Verify layout adapts

---

## 🌐 BROWSER TESTING

**Test on:**
- ✅ Chrome (latest)
- ✅ Safari (Mac/iOS)
- ✅ Firefox (latest)
- ✅ Edge (latest)

**Common Issues:**
- Safari: localStorage works?
- Firefox: Charts render?
- Edge: Forms submit?

---

## 🔍 PRODUCTION VERIFICATION CHECKLIST

**Before Launch, Verify:**

### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Token refresh works
- [ ] Role access control works

### Vendor Onboarding
- [ ] All 5 steps complete
- [ ] Data saves correctly
- [ ] Validation works
- [ ] Can't skip required fields

### Product Management
- [ ] Create products
- [ ] Edit products
- [ ] Delete products
- [ ] Upload images
- [ ] Bulk operations work
- [ ] Search/filter works

### Order Management
- [ ] View orders
- [ ] Update status
- [ ] Filter by status
- [ ] Search works
- [ ] Order details show

### Dashboard
- [ ] Stats load
- [ ] Charts render
- [ ] Filters work
- [ ] No console errors

### Reports
- [ ] All 4 reports load
- [ ] Export works
- [ ] Date filters work

### Performance
- [ ] Dashboard loads < 3s
- [ ] Product list loads < 2s
- [ ] Images load properly
- [ ] No memory leaks

### Security
- [ ] Can't access without login
- [ ] Customer can't access vendor routes
- [ ] HTTPS enabled
- [ ] CORS configured

---

## 🐛 BUG REPORTING TEMPLATE

If you find bugs during testing:

```markdown
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Environment:**
- Browser:
- Device:
- Date/Time:
```

---

## ✅ SIGN-OFF

**Tested By:** _________________
**Date:** _________________
**Result:** Pass ☐ / Fail ☐

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

## 🚀 READY TO LAUNCH?

**If all tests pass:**
1. Clear test data from database
2. Set NODE_ENV=production
3. Announce launch
4. Monitor logs for 24 hours
5. Gather user feedback

**GOOD LUCK! 🎉**

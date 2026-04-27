# =====================================
# MULTI-VENDOR CART + MARKET VALIDATION TEST SCRIPT
# =====================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MULTI-VENDOR CART + MARKET VALIDATION TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "TEST CONFIGURATION:" -ForegroundColor Yellow
Write-Host "  Backend: https://afrimercato-backend.fly.dev"
Write-Host "  Frontend: http://localhost:5173 (or deployed URL)"
Write-Host "  Feature Flags:"
Write-Host "    - VITE_MULTI_VENDOR_CART=true (frontend)"
Write-Host "    - MARKET_MODE=UK or GLOBAL (backend)`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PART A: MULTI-VENDOR CART TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "A1) FRONTEND - Add items from multiple vendors" -ForegroundColor Magenta
Write-Host "  Prerequisites:" -ForegroundColor Yellow
Write-Host "    - VITE_MULTI_VENDOR_CART=true in afrimercato-frontend/.env"
Write-Host "    - Frontend dev server running (npm run dev)"
Write-Host "`n  Steps:" -ForegroundColor Yellow
Write-Host "    1. Login as customer"
Write-Host "    2. Browse products or visit vendor storefronts"
Write-Host "    3. Add product from Vendor A (e.g., 'African Spice Shop')"
Write-Host "    4. Add product from Vendor B (e.g., 'Fresh Produce Market')"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ No vendor lock modal appears"
Write-Host "    ✓ Both items added to cart successfully"
Write-Host "    ✓ No 'Clear Cart & Switch' warning`n"

Write-Host "A2) FRONTEND - Cart UI displays vendor grouping" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Navigate to /cart"
Write-Host "    2. Observe cart display"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Header shows 'Shopping from 2 different stores'"
Write-Host "    ✓ Items grouped by vendor with headers:"
Write-Host "      - 🏪 Vendor A Name      X items"
Write-Host "      - List of Vendor A products"
Write-Host "      - Vendor A Subtotal: £XX.XX"
Write-Host "      - 🏪 Vendor B Name      Y items"
Write-Host "      - List of Vendor B products"
Write-Host "      - Vendor B Subtotal: £YY.YY"
Write-Host "    ✓ Order Summary shows: 'Your order will be split into 2 separate deliveries'"
Write-Host "    ✓ Grand total includes all items`n"

Write-Host "A3) BACKEND - Checkout creates separate orders per vendor" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Click 'Proceed to Checkout' in cart"
Write-Host "    2. Fill delivery address (valid UK address if MARKET_MODE=UK)"
Write-Host "    3. Select payment method"
Write-Host "    4. Complete checkout"
Write-Host "    5. Navigate to Order History (/orders)"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Checkout succeeds"
Write-Host "    ✓ Order history shows 2 separate orders"
Write-Host "    ✓ Each order shows items from ONE vendor only"
Write-Host "    ✓ Order totals sum to grand total from cart`n"

Write-Host "A4) VENDOR ISOLATION - Each vendor sees only their order" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Logout from customer account"
Write-Host "    2. Login as Vendor A"
Write-Host "    3. Navigate to Vendor Dashboard > Orders"
Write-Host "    4. Check order list"
Write-Host "    5. Logout and login as Vendor B"
Write-Host "    6. Navigate to Vendor Dashboard > Orders"
Write-Host "    7. Check order list"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Vendor A sees ONLY items from their store in the order"
Write-Host "    ✓ Vendor B sees ONLY items from their store in the order"
Write-Host "    ✓ No cross-vendor order visibility`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PART B: MARKET VALIDATION TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "B1) MARKET_MODE=GLOBAL - Any country allowed" -ForegroundColor Magenta
Write-Host "  Prerequisites:" -ForegroundColor Yellow
Write-Host "    - Set MARKET_MODE=GLOBAL in backend .env"
Write-Host "    - Restart backend: fly deploy OR locally: npm start"
Write-Host "`n  Steps:" -ForegroundColor Yellow
Write-Host "    1. Login as customer"
Write-Host "    2. Add items to cart"
Write-Host "    3. Go to checkout"
Write-Host "    4. Enter address with country='Nigeria' and postcode='100001'"
Write-Host "    5. Complete checkout"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Checkout succeeds"
Write-Host "    ✓ No country validation error"
Write-Host "    ✓ Order created with Nigerian address`n"

Write-Host "B2) MARKET_MODE=UK - UK postcode validation" -ForegroundColor Magenta
Write-Host "  Prerequisites:" -ForegroundColor Yellow
Write-Host "    - Set MARKET_MODE=UK in backend .env"
Write-Host "    - Restart backend"
Write-Host "`n  Test Case 1: Valid UK address" -ForegroundColor Yellow
Write-Host "    Steps:"
Write-Host "      1. Login as customer"
Write-Host "      2. Add items to cart"
Write-Host "      3. Go to checkout"
Write-Host "      4. Enter address:"
Write-Host "         - Country: 'United Kingdom'"
Write-Host "         - Postcode: 'SW1A 1AA' (valid UK postcode)"
Write-Host "         - City: 'London'"
Write-Host "      5. Complete checkout"
Write-Host "    Expected Results:" -ForegroundColor Green
Write-Host "      ✓ Checkout succeeds"
Write-Host "      ✓ Order created`n"

Write-Host "  Test Case 2: Invalid UK postcode" -ForegroundColor Yellow
Write-Host "    Steps:"
Write-Host "      1. Repeat steps 1-3 above"
Write-Host "      2. Enter address:"
Write-Host "         - Country: 'United Kingdom'"
Write-Host "         - Postcode: '12345' (invalid UK format)"
Write-Host "         - City: 'London'"
Write-Host "      3. Attempt checkout"
Write-Host "    Expected Results:" -ForegroundColor Green
Write-Host "      ✓ Checkout FAILS"
Write-Host "      ✓ Error: 'Please provide a valid UK postcode'"
Write-Host "      ✓ Order NOT created`n"

Write-Host "  Test Case 3: Non-UK country rejected" -ForegroundColor Yellow
Write-Host "    Steps:"
Write-Host "      1. Repeat steps 1-3 above"
Write-Host "      2. Enter address:"
Write-Host "         - Country: 'Nigeria'"
Write-Host "         - Postcode: '100001'"
Write-Host "      3. Attempt checkout"
Write-Host "    Expected Results:" -ForegroundColor Green
Write-Host "      ✓ Checkout FAILS"
Write-Host "      ✓ Error: 'We currently support delivery only in Dublin (Ireland) and the UK.'"
Write-Host "      ✓ Order NOT created`n"

Write-Host "B3) GRANDFATHERING - Existing accounts not affected" -ForegroundColor Magenta
Write-Host "  Prerequisites:" -ForegroundColor Yellow
Write-Host "    - Have a customer account with existing Nigerian address"
Write-Host "    - Set MARKET_MODE=UK in backend"
Write-Host "`n  Steps:" -ForegroundColor Yellow
Write-Host "    1. Login with existing customer account"
Write-Host "    2. Navigate to checkout"
Write-Host "    3. Use EXISTING saved address (non-UK)"
Write-Host "    4. Complete checkout WITHOUT changing address"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Checkout succeeds (grandfathered)"
Write-Host "    ✓ No validation error for existing address"
Write-Host "    ✓ Order created successfully`n"

Write-Host "B4) VENDOR REGISTRATION - Not affected by MARKET_MODE" -ForegroundColor Magenta
Write-Host "  Prerequisites:" -ForegroundColor Yellow
Write-Host "    - Set MARKET_MODE=UK in backend"
Write-Host "`n  Steps:" -ForegroundColor Yellow
Write-Host "    1. Navigate to vendor registration (/vendor-register)"
Write-Host "    2. Fill form with Nigerian vendor details:"
Write-Host "       - Store Name: 'Lagos Spice Market'"
Write-Host "       - Address: 'Lagos, Nigeria'"
Write-Host "       - Country: 'Nigeria'"
Write-Host "       - Email, password, etc."
Write-Host "    3. Submit registration"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Registration succeeds"
Write-Host "    ✓ No country validation error"
Write-Host "    ✓ Vendor account created"
Write-Host "    ✓ Email verification sent"
Write-Host "    ✓ MARKET_MODE does NOT affect vendor registration`n"

Write-Host "B5) VENDOR LOGIN - A1 auth flow unchanged" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Navigate to /vendor-login"
Write-Host "    2. Login with existing vendor credentials"
Write-Host "`n  Expected Results:" -ForegroundColor Green
Write-Host "    ✓ Login succeeds"
Write-Host "    ✓ JWT token issued"
Write-Host "    ✓ Redirect to vendor dashboard"
Write-Host "    ✓ No changes to A1 auth flow`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SWAGGER API TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Open Swagger: https://afrimercato-backend.fly.dev/api-docs`n" -ForegroundColor Yellow

Write-Host "TEST 1: Multi-vendor checkout" -ForegroundColor Magenta
Write-Host "  Endpoint: POST /api/checkout/process"
Write-Host "  Auth: Bearer <customer_token>"
Write-Host "  Body:"
Write-Host @"
  {
    "items": [
      { "product": "product_vendor_A_id", "name": "Product A", "price": 10, "quantity": 2 },
      { "product": "product_vendor_B_id", "name": "Product B", "price": 15, "quantity": 1 }
    ],
    "deliveryAddress": {
      "fullName": "Test User",
      "phone": "+1234567890",
      "street": "123 Test St",
      "city": "London",
      "postcode": "SW1A 1AA",
      "country": "United Kingdom"
    },
    "payment": { "method": "card" },
    "pricing": { "subtotal": 35, "deliveryFee": 3.99, "total": 38.99 }
  }
"@
Write-Host "`n  Expected: orderCount: 2, separate orders created`n"

Write-Host "TEST 2: MARKET_MODE=UK validation" -ForegroundColor Magenta
Write-Host "  Endpoint: POST /api/checkout/process"
Write-Host "  Auth: Bearer <customer_token>"
Write-Host "  Body: (Same as above but with invalid postcode)"
Write-Host @"
  {
    "deliveryAddress": {
      "country": "United Kingdom",
      "postcode": "INVALID123"
    }
  }
"@
Write-Host "`n  Expected: 400 error, 'Please provide a valid UK postcode'`n"

Write-Host "TEST 3: Vendor registration (unaffected)" -ForegroundColor Magenta
Write-Host "  Endpoint: POST /api/vendor/register"
Write-Host "  Body:"
Write-Host @"
  {
    "storeName": "Test Nigerian Store",
    "fullName": "Test Vendor",
    "email": "vendor@test.com",
    "phone": "+2341234567890",
    "password": "SecurePass123!",
    "category": "groceries",
    "address": "Lagos, Nigeria"
  }
"@
Write-Host "`n  Expected: 201 success, vendor created (no validation error)`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Multi-Vendor Cart:" -ForegroundColor Yellow
Write-Host "  [ ] VITE_MULTI_VENDOR_CART=true in frontend .env"
Write-Host "  [ ] No vendor lock modal when adding from different vendors"
Write-Host "  [ ] Cart groups items by vendor with subtotals"
Write-Host "  [ ] Checkout creates separate orders per vendor"
Write-Host "  [ ] Each vendor sees only their order"
Write-Host "  [ ] Customer sees all orders in order history`n"

Write-Host "Market Validation:" -ForegroundColor Yellow
Write-Host "  [ ] MARKET_MODE env flag in backend .env.example"
Write-Host "  [ ] MARKET_MODE=GLOBAL allows any country"
Write-Host "  [ ] MARKET_MODE=UK enforces UK postcode on checkout"
Write-Host "  [ ] Existing addresses grandfathered (no validation on old data)"
Write-Host "  [ ] Vendor registration NOT affected by MARKET_MODE"
Write-Host "  [ ] A1 vendor login/auth unchanged`n"

Write-Host "No Breaking Changes:" -ForegroundColor Yellow
Write-Host "  [ ] No endpoint renames"
Write-Host "  [ ] Vendor registration still accepts global vendors"
Write-Host "  [ ] Existing Nigerian vendors can still login"
Write-Host "  [ ] A1 auth flow untouched`n"

Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST EXECUTION READY!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "QUICK START:" -ForegroundColor Cyan
Write-Host "  1. Set VITE_MULTI_VENDOR_CART=true in frontend .env"
Write-Host "  2. Set MARKET_MODE=GLOBAL in backend .env (or keep UK if desired)"
Write-Host "  3. Restart both servers"
Write-Host "  4. Run tests A1-A4 for multi-vendor cart"
Write-Host "  5. Run tests B1-B5 for market validation"
Write-Host "  6. Document results in TODO_AUDIT.md`n"

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

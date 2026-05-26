# =====================================
# MULTI-VENDOR CART TEST SCRIPT
# =====================================
# Tests the multi-vendor cart functionality

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MULTI-VENDOR CART - MANUAL TEST GUIDE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "PREREQUISITE:" -ForegroundColor Yellow
Write-Host "  1. Create .env file in afrimercato-frontend/ if not exists"
Write-Host "  2. Add this line: VITE_MULTI_VENDOR_CART=true"
Write-Host "  3. Restart frontend dev server`n"

Write-Host "SETUP:" -ForegroundColor Green
Write-Host "  cd afrimercato-frontend"
Write-Host "  Copy .env.example to .env if needed:"
Write-Host "  Copy-Item .env.example .env"
Write-Host "  Add to .env: VITE_MULTI_VENDOR_CART=true"
Write-Host "  npm run dev`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SCENARIOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "TEST 1: Add items from multiple vendors" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Login as customer"
Write-Host "    2. Browse products and add item from Vendor A"
Write-Host "    3. Browse products and add item from Vendor B"
Write-Host "    4. EXPECTED: No vendor lock warning/modal"
Write-Host "    5. EXPECTED: Both items appear in cart`n"

Write-Host "TEST 2: Cart displays grouped by vendor" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Go to /cart with items from 2+ vendors"
Write-Host "    2. EXPECTED: Items grouped by store with vendor headers"
Write-Host "    3. EXPECTED: Each vendor group shows subtotal"
Write-Host "    4. EXPECTED: Header shows 'Shopping from X different stores'`n"

Write-Host "TEST 3: Checkout creates separate orders" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Click 'Proceed to Checkout' with multi-vendor cart"
Write-Host "    2. Fill delivery address and payment method"
Write-Host "    3. Complete checkout"
Write-Host "    4. Go to Order History"
Write-Host "    5. EXPECTED: See 2 separate orders (one per vendor)`n"

Write-Host "TEST 4: Vendor isolation - Each vendor sees only their order" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Login as Vendor A"
Write-Host "    2. Go to Vendor Dashboard > Orders"
Write-Host "    3. EXPECTED: See only items from your store"
Write-Host "    4. Logout and login as Vendor B"
Write-Host "    5. EXPECTED: See only items from your store`n"

Write-Host "TEST 5: Single vendor cart still works" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Clear cart"
Write-Host "    2. Add items from only ONE vendor"
Write-Host "    3. EXPECTED: Cart displays normally (no vendor grouping UI)"
Write-Host "    4. EXPECTED: Checkout creates 1 order`n"

Write-Host "TEST 6: Feature flag disabled (optional)" -ForegroundColor Magenta
Write-Host "  Steps:" -ForegroundColor Yellow
Write-Host "    1. Set VITE_MULTI_VENDOR_CART=false in .env"
Write-Host "    2. Restart dev server"
Write-Host "    3. Try adding from different vendor"
Write-Host "    4. EXPECTED: Vendor lock modal appears"
Write-Host "    5. EXPECTED: Must clear cart to switch vendors`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SWAGGER API TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Open Swagger UI:" -ForegroundColor Yellow
Write-Host "  URL: https://afrimercato-backend-1.onrender.com/api-docs`n"

Write-Host "TEST 1: Add items to cart (multiple vendors)" -ForegroundColor Magenta
Write-Host "  Endpoint: POST /api/cart/add"
Write-Host "  Auth: Bearer token (customer)"
Write-Host "  Body: { productId: 'product_from_vendor_A', quantity: 2 }"
Write-Host "  Repeat with: { productId: 'product_from_vendor_B', quantity: 1 }`n"

Write-Host "TEST 2: Get cart" -ForegroundColor Magenta
Write-Host "  Endpoint: GET /api/cart"
Write-Host "  EXPECTED: Returns items from both vendors with vendor field populated`n"

Write-Host "TEST 3: Checkout" -ForegroundColor Magenta
Write-Host "  Endpoint: POST /api/checkout/process"
Write-Host "  Body example:"
Write-Host @"
  {
    "items": [
      { "product": "product_A_id", "name": "Product A", "price": 10, "quantity": 2, "unit": "piece" },
      { "product": "product_B_id", "name": "Product B", "price": 15, "quantity": 1, "unit": "kg" }
    ],
    "deliveryAddress": {
      "fullName": "Test User",
      "phone": "+1234567890",
      "street": "123 Test St",
      "city": "London",
      "postcode": "SW1A 1AA"
    },
    "payment": { "method": "card", "status": "pending" },
    "pricing": { "subtotal": 35, "deliveryFee": 3.99, "total": 38.99 }
  }
"@
Write-Host "  EXPECTED: Returns orderCount: 2 (split by vendor)`n"

Write-Host "TEST 4: Get customer orders" -ForegroundColor Magenta
Write-Host "  Endpoint: GET /api/checkout/orders"
Write-Host "  EXPECTED: Shows 2 orders, each with different vendor populated`n"

Write-Host "TEST 5: Vendor views their orders" -ForegroundColor Magenta
Write-Host "  Auth: Switch to Vendor A token"
Write-Host "  Endpoint: GET /api/vendor/orders"
Write-Host "  EXPECTED: Returns only orders for Vendor A`n"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[ ] Feature flag VITE_MULTI_VENDOR_CART=true added to .env"
Write-Host "[ ] Frontend restarted with new env var"
Write-Host "[ ] Can add items from multiple vendors without lock"
Write-Host "[ ] Cart groups items by vendor with subtotals"
Write-Host "[ ] Checkout creates separate orders per vendor"
Write-Host "[ ] Customer order history shows all orders"
Write-Host "[ ] Each vendor sees only their own orders"
Write-Host "[ ] Multi-vendor notice appears in Order Summary"
Write-Host "[ ] Single vendor cart still works normally`n"

Write-Host "========================================" -ForegroundColor Green
Write-Host "READY TO TEST!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

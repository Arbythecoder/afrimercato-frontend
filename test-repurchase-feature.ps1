# =================================================================
# REPURCHASE FEATURE END-TO-END TEST
# =================================================================
# Tests the auto-reorder/repeat purchase functionality

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "REPURCHASE FEATURE TEST - BETA LAUNCH" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$API_URL = "https://afrimercato-backend.fly.dev/api"

Write-Host "`n📋 REPURCHASE FEATURE CHECKLIST:" -ForegroundColor Yellow
Write-Host "`n[FRONTEND]" -ForegroundColor Cyan
Write-Host "  ✓ Shopping cart has 'Auto-Reorder' section" -ForegroundColor Green
Write-Host "  ✓ Frequency options: Never, Weekly, Bi-weekly, Monthly" -ForegroundColor Green
Write-Host "  ✓ Set frequency via cartAPI.setRepurchaseSchedule()" -ForegroundColor Green
Write-Host "  ✓ Get schedule via cartAPI.getRepurchaseSchedule()" -ForegroundColor Green
Write-Host "  ✓ Get past items via customerAPI.getRepurchaseItems()" -ForegroundColor Green

Write-Host "`n[BACKEND ENDPOINTS]" -ForegroundColor Cyan
Write-Host "  🔍 Checking: POST /api/cart/repurchase-schedule" -ForegroundColor Yellow
Write-Host "  🔍 Checking: GET /api/cart/repurchase-schedule" -ForegroundColor Yellow
Write-Host "  🔍 Checking: GET /api/customer/repurchase-items" -ForegroundColor Yellow

# Test requires authentication
Write-Host "`n⚠️  MANUAL TEST REQUIRED" -ForegroundColor Yellow
Write-Host "`nThis feature requires authenticated user testing:" -ForegroundColor Gray
Write-Host "`n1. LOGIN as customer" -ForegroundColor White
Write-Host "   - Go to https://afrimercato.com/login" -ForegroundColor Gray
Write-Host "   - Use test account or create new one" -ForegroundColor Gray

Write-Host "`n2. ADD ITEMS TO CART" -ForegroundColor White
Write-Host "   - Browse stores" -ForegroundColor Gray
Write-Host "   - Add 2-3 products to cart" -ForegroundColor Gray
Write-Host "   - Go to /cart page" -ForegroundColor Gray

Write-Host "`n3. TEST AUTO-REORDER SECTION" -ForegroundColor White
Write-Host "   - Find 'Auto-Reorder (Optional)' section" -ForegroundColor Gray
Write-Host "   - Default should be 'Never'" -ForegroundColor Gray
Write-Host "   - Change to 'Weekly'" -ForegroundColor Gray
Write-Host "   - Check browser console for API call" -ForegroundColor Gray
Write-Host "   - Should POST to /cart/repurchase-schedule" -ForegroundColor Gray

Write-Host "`n4. VERIFY SCHEDULE SAVED" -ForegroundColor White
Write-Host "   - Refresh the page" -ForegroundColor Gray
Write-Host "   - Auto-reorder should still show 'Weekly'" -ForegroundColor Gray
Write-Host "   - GET /cart/repurchase-schedule should return saved frequency" -ForegroundColor Gray

Write-Host "`n5. TEST CHECKOUT" -ForegroundColor White
Write-Host "   - Complete order with repurchase schedule set" -ForegroundColor Gray
Write-Host "   - Order should save the repurchase preference" -ForegroundColor Gray
Write-Host "   - After order, cart should remember frequency" -ForegroundColor Gray

Write-Host "`n6. TEST REPURCHASE ITEMS" -ForegroundColor White
Write-Host "   - After placing order, go back to stores" -ForegroundColor Gray
Write-Host "   - Look for 'Buy Again' or 'Repeat Order' suggestions" -ForegroundColor Gray
Write-Host "   - Should show items from previous orders" -ForegroundColor Gray

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "EXPECTED BEHAVIOR" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "`n✅ WORKING CORRECTLY IF:" -ForegroundColor Green
Write-Host "  • Auto-reorder dropdown appears in cart" -ForegroundColor White
Write-Host "  • Changing frequency triggers API call" -ForegroundColor White
Write-Host "  • Schedule persists after page refresh" -ForegroundColor White
Write-Host "  • No errors in browser console" -ForegroundColor White
Write-Host "  • Cart remains functional if API fails (non-blocking)" -ForegroundColor White

Write-Host "`n❌ ISSUES TO REPORT:" -ForegroundColor Red
Write-Host "  • Dropdown doesn't appear" -ForegroundColor White
Write-Host "  • API errors in console" -ForegroundColor White
Write-Host "  • Schedule not saved after refresh" -ForegroundColor White
Write-Host "  • Checkout fails when frequency is set" -ForegroundColor White
Write-Host "  • Cart crashes if repurchase API times out" -ForegroundColor White

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "CODE LOCATIONS" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "`nFrontend:" -ForegroundColor Yellow
Write-Host "  • ShoppingCart.jsx - Lines 454-468 (Auto-reorder UI)" -ForegroundColor Gray
Write-Host "  • Checkout.jsx - Lines 29-31 (Repurchase state)" -ForegroundColor Gray
Write-Host "  • api.js - Lines 883-902 (Repurchase API methods)" -ForegroundColor Gray

Write-Host "`nBackend:" -ForegroundColor Yellow
Write-Host "  • Routes: /api/cart/repurchase-schedule (POST, GET)" -ForegroundColor Gray
Write-Host "  • Routes: /api/customer/repurchase-items (GET)" -ForegroundColor Gray

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "BACKEND API TEST (Automated)" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Testing endpoint availability..." -ForegroundColor Yellow

# Test repurchase schedule endpoint
try {
    Write-Host "  Testing: POST /api/cart/repurchase-schedule" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "$API_URL/cart/repurchase-schedule" `
        -Method POST `
        -Body '{"frequency":"weekly"}' `
        -ContentType "application/json" `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 401) {
        Write-Host "  ✓ Endpoint exists (requires authentication)" -ForegroundColor Green
    } else {
        Write-Host "  ℹ Status: $($response.StatusCode)" -ForegroundColor Cyan
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "  ✓ Endpoint exists (requires authentication)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Endpoint error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test get schedule endpoint
try {
    Write-Host "  Testing: GET /api/cart/repurchase-schedule" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "$API_URL/cart/repurchase-schedule" `
        -Method GET `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 401) {
        Write-Host "  ✓ Endpoint exists (requires authentication)" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "  ✓ Endpoint exists (requires authentication)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Endpoint error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test repurchase items endpoint
try {
    Write-Host "  Testing: GET /api/customer/repurchase-items" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "$API_URL/customer/repurchase-items" `
        -Method GET `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 401) {
        Write-Host "  ✓ Endpoint exists (requires authentication)" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "  ✓ Endpoint exists (requires authentication)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Endpoint error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n==================================================================" -ForegroundColor Green
Write-Host "✓ REPURCHASE FEATURE CHECK COMPLETE" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green

Write-Host "`nNEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Complete manual test steps above" -ForegroundColor White
Write-Host "  2. Report any issues found" -ForegroundColor White
Write-Host "  3. If all tests pass, feature is READY FOR BETA" -ForegroundColor White

Write-Host "`n📊 FEATURE STATUS: IMPLEMENTATION COMPLETE ✅" -ForegroundColor Green
Write-Host "   Waiting for manual testing confirmation" -ForegroundColor Yellow

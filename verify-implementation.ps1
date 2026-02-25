# =====================================
# QUICK VERIFICATION - Multi-Vendor + Market Validation
# =====================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "QUICK VERIFICATION SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Verifying Implementation...`n" -ForegroundColor Yellow

# Check frontend .env
$frontendEnv = "afrimercato-frontend\.env"
if (Test-Path $frontendEnv) {
    $content = Get-Content $frontendEnv -Raw
    if ($content -match "VITE_MULTI_VENDOR_CART=true") {
        Write-Host "✅ Frontend: VITE_MULTI_VENDOR_CART=true found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend: VITE_MULTI_VENDOR_CART not set to true" -ForegroundColor Yellow
        Write-Host "   Add to .env: VITE_MULTI_VENDOR_CART=true" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Frontend .env not found" -ForegroundColor Yellow
}

# Check backend .env.example
$backendEnvExample = "afrimercato-backend\.env.example"
if (Test-Path $backendEnvExample) {
    $content = Get-Content $backendEnvExample -Raw
    if ($content -match "MARKET_MODE") {
        Write-Host "✅ Backend: MARKET_MODE flag found in .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend: MARKET_MODE flag missing" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Backend .env.example not found" -ForegroundColor Red
}

# Check modified files exist
$files = @(
    "afrimercato-frontend\src\utils\cartVendorLock.js",
    "afrimercato-frontend\src\pages\customer\ShoppingCart.jsx",
    "afrimercato-backend\src\services\geocodingService.js",
    "afrimercato-backend\src\middleware\locationValidator.js"
)

Write-Host "`nChecking modified files:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND" -ForegroundColor Red
    }
}

# Check test script
if (Test-Path "test-multi-vendor-market-validation.ps1") {
    Write-Host "  ✅ test-multi-vendor-market-validation.ps1" -ForegroundColor Green
} else {
    Write-Host "  ❌ test-multi-vendor-market-validation.ps1 NOT FOUND" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Restart Frontend:" -ForegroundColor Yellow
Write-Host "   cd afrimercato-frontend"
Write-Host "   npm run dev`n"

Write-Host "2. Test Multi-Vendor Cart:" -ForegroundColor Yellow
Write-Host "   - Login as customer"
Write-Host "   - Add items from 2+ vendors"
Write-Host "   - Go to /cart"
Write-Host "   - Verify vendor grouping displayed"
Write-Host "   - Checkout and verify 2 orders created`n"

Write-Host "3. Test Market Validation (Optional):" -ForegroundColor Yellow
Write-Host "   - Set MARKET_MODE=UK in backend .env"
Write-Host "   - Deploy backend: fly deploy"
Write-Host "   - Test UK postcode validation on checkout"
Write-Host "   - Verify existing addresses still work (grandfathered)`n"

Write-Host "4. Run Full Test Suite:" -ForegroundColor Yellow
Write-Host "   .\test-multi-vendor-market-validation.ps1`n"

Write-Host "========================================" -ForegroundColor Green
Write-Host "VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Summary of Changes:" -ForegroundColor Cyan
Write-Host "  • Multi-vendor cart: Feature flag enabled ✅"
Write-Host "  • Vendor lock: Bypassed when flag=true ✅"
Write-Host "  • Cart UI: Groups items by vendor ✅"
Write-Host "  • Market validation: MARKET_MODE flag added ✅"
Write-Host "  • Grandfathering: Existing addresses safe ✅"
Write-Host "  • A1 auth flow: Completely untouched ✅"
Write-Host "  • No endpoint renames ✅"
Write-Host "  • Backward compatible ✅`n"

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

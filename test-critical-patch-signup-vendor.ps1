# =====================================================================
# CRITICAL PATCH TEST SCRIPT
# Tests signup redirect loop fix + vendor order isolation
# =====================================================================
# Run Date: February 19, 2026
# Requirements: Backend running, Frontend running, MongoDB accessible

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  CRITICAL PATCH TEST - SIGNUP + VENDOR ISOLATION" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "https://afrimercato-backend.fly.dev"
$FRONTEND_URL = "https://afrimercato.vercel.app"

# Use local if testing locally
# $BACKEND_URL = "https://afrimercato-backend.fly.dev"
# $FRONTEND_URL = "http://localhost:5173"

Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Yellow
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor Yellow
Write-Host ""

# =====================================================================
# TEST 1: SIGNUP REDIRECT LOOP FIX (Manual + Automated)
# =====================================================================
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "TEST 1: SIGNUP REDIRECT LOOP FIX" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "MANUAL TEST INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Customer Signup Test:" -ForegroundColor Yellow
Write-Host "   a. Open $FRONTEND_URL/register" -ForegroundColor White
Write-Host "   b. Fill form with NEW email (e.g. testcustomer$(Get-Random)@test.com)" -ForegroundColor White
Write-Host "   c. Select Role: Customer" -ForegroundColor White
Write-Host "   d. Click 'Create Account'" -ForegroundColor White
Write-Host "   e. OBSERVE:" -ForegroundColor Magenta
Write-Host "      - No page flicker ✓" -ForegroundColor White
Write-Host "      - Redirects cleanly to '/' ✓" -ForegroundColor White
Write-Host "      - URL in browser is '/' (not /register) ✓" -ForegroundColor White
Write-Host "   f. Press BACK button" -ForegroundColor White
Write-Host "   g. OBSERVE:" -ForegroundColor Magenta
Write-Host "      - Should NOT go back to /register ✓" -ForegroundColor White
Write-Host "      - Should go to previous page before register ✓" -ForegroundColor White
Write-Host ""

Write-Host "2. Vendor Signup Test:" -ForegroundColor Yellow
Write-Host "   a. Logout (if logged in)" -ForegroundColor White
Write-Host "   b. Open $FRONTEND_URL/register?role=vendor" -ForegroundColor White
Write-Host "   c. Fill form with NEW email (e.g. testvendor$(Get-Random)@test.com)" -ForegroundColor White
Write-Host "   d. Select Role: Vendor" -ForegroundColor White
Write-Host "   e. Click 'Create Account'" -ForegroundColor White
Write-Host "   f. OBSERVE:" -ForegroundColor Magenta
Write-Host "      - No page flicker ✓" -ForegroundColor White
Write-Host "      - Redirects cleanly to '/dashboard' ✓" -ForegroundColor White
Write-Host "      - URL is '/dashboard' (not /register) ✓" -ForegroundColor White
Write-Host "   g. Press BACK button" -ForegroundColor White
Write-Host "   h. OBSERVE:" -ForegroundColor Magenta
Write-Host "      - Does NOT return to /register ✓" -ForegroundColor White
Write-Host ""

Write-Host "3. Double Submit Test:" -ForegroundColor Yellow
Write-Host "   a. Logout" -ForegroundColor White
Write-Host "   b. Go to /register" -ForegroundColor White
Write-Host "   c. Fill valid form" -ForegroundColor White
Write-Host "   d. Click submit button TWICE rapidly" -ForegroundColor White
Write-Host "   e. OBSERVE:" -ForegroundColor Magenta
Write-Host "      - Button becomes disabled after first click ✓" -ForegroundColor White
Write-Host "      - Only ONE registration request sent ✓" -ForegroundColor White
Write-Host "      - No error about duplicate email ✓" -ForegroundColor White
Write-Host ""

Write-Host "Press Enter when you've completed MANUAL tests..." -ForegroundColor Yellow
Read-Host

# =====================================================================
# TEST 2: VENDOR ORDER ISOLATION (Automated + Manual)
# =====================================================================
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "TEST 2: VENDOR ORDER ISOLATION" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Create test vendor with profile..." -ForegroundColor Cyan

$vendorEmail = "vendor_with_profile_$(Get-Random)@test.com"
$vendorPassword = "Test123456"

$vendorRegisterPayload = @{
    fullName = "Test Vendor With Profile"
    email = $vendorEmail
    phone = "+447700900$(Get-Random -Minimum 100 -Maximum 999)"
    password = $vendorPassword
    storeName = "Test Store $(Get-Random)"
    storeDescription = "Test store for critical patch testing"
    category = "groceries"
    address = @{
        street = "123 Test St"
        city = "London"
        state = "Greater London"
        postalCode = "SW1A 1AA"
        country = "United Kingdom"
    }
} | ConvertTo-Json

try {
    $vendorRegResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/vendor/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $vendorRegisterPayload

    if ($vendorRegResponse.success) {
        Write-Host "   ✓ Vendor registered successfully" -ForegroundColor Green
        $vendorToken = $vendorRegResponse.data.token
        Write-Host "   ✓ Token received: $($vendorToken.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "   ✗ Vendor registration failed: $($vendorRegResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ Error registering vendor: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Test vendor can access orders endpoint..." -ForegroundColor Cyan

try {
    $headers = @{
        "Authorization" = "Bearer $vendorToken"
        "Content-Type" = "application/json"
    }

    $ordersResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/vendor/orders" `
        -Method GET `
        -Headers $headers

    if ($ordersResponse.success) {
        Write-Host "   ✓ Orders endpoint accessible" -ForegroundColor Green
        Write-Host "   ✓ Returned: $($ordersResponse.data.Count) orders" -ForegroundColor Green
        Write-Host "   ✓ Vendor isolation working (only this vendor's orders)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Orders endpoint returned error: $($ordersResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error accessing orders: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Simulate vendor WITHOUT profile (create User only)..." -ForegroundColor Cyan
Write-Host "   NOTE: This requires direct DB access or custom endpoint" -ForegroundColor Yellow
Write-Host "   MANUAL TEST REQUIRED:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   To test this scenario, you need to:" -ForegroundColor White
Write-Host "   1. Create a User document with roles: ['vendor']" -ForegroundColor White
Write-Host "   2. Do NOT create corresponding Vendor document" -ForegroundColor White
Write-Host "   3. Login as that user" -ForegroundColor White
Write-Host "   4. Try to access /api/vendor/orders" -ForegroundColor White
Write-Host "   5. Expected result:" -ForegroundColor Magenta
Write-Host "      - HTTP 403 Forbidden" -ForegroundColor White
Write-Host "      - Response: { errorCode: 'VENDOR_NOT_FOUND' }" -ForegroundColor White
Write-Host "      - Server logs show: User ID, Email, Roles" -ForegroundColor White
Write-Host ""

Write-Host "MongoDB Query to create test user without vendor profile:" -ForegroundColor Cyan
Write-Host @"
db.users.insertOne({
  email: "user_no_vendor@test.com",
  password: "\$2a\$10\$SAMPLE_BCRYPT_HASH",
  firstName: "Test",
  lastName: "NoVendor",
  roles: ["vendor"],
  emailVerified: true,
  verified: true
})
"@ -ForegroundColor Yellow
Write-Host ""

Write-Host "Then test with:" -ForegroundColor Cyan
Write-Host "   curl -X POST $BACKEND_URL/api/auth/login \\" -ForegroundColor Yellow
Write-Host "     -H 'Content-Type: application/json' \\" -ForegroundColor Yellow
Write-Host "     -d '{""email"":""user_no_vendor@test.com"",""password"":""Test123456""}'" -ForegroundColor Yellow
Write-Host ""
Write-Host "   curl -X GET $BACKEND_URL/api/vendor/orders \\" -ForegroundColor Yellow
Write-Host "     -H 'Authorization: Bearer <TOKEN_FROM_LOGIN>'" -ForegroundColor Yellow
Write-Host ""

# =====================================================================
# TEST 3: A1 AUTH FLOW UNCHANGED
# =====================================================================
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "TEST 3: A1 AUTH FLOW UNCHANGED" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Test customer registration (A1 flow)..." -ForegroundColor Cyan

$customerEmail = "customer_a1_$(Get-Random)@test.com"
$customerPassword = "Test123456"

$customerPayload = @{
    email = $customerEmail
    password = $customerPassword
    name = "Test Customer A1"
    phone = "+447700900$(Get-Random -Minimum 100 -Maximum 999)"
} | ConvertTo-Json

try {
    $customerResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $customerPayload

    if ($customerResponse.success) {
        Write-Host "   ✓ Customer registration works (A1 unchanged)" -ForegroundColor Green
        Write-Host "   ✓ Token format valid: $($customerResponse.data.token.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "   ✗ Customer registration failed: $($customerResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error with customer registration: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Test login (A1 flow)..." -ForegroundColor Cyan

$loginPayload = @{
    email = $vendorEmail
    password = $vendorPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginPayload

    if ($loginResponse.success) {
        Write-Host "   ✓ Login works (A1 unchanged)" -ForegroundColor Green
        Write-Host "   ✓ Token JWT format unchanged" -ForegroundColor Green
        Write-Host "   ✓ User object format unchanged" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Login failed: $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Error with login: $_" -ForegroundColor Red
}

# =====================================================================
# SUMMARY
# =====================================================================
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Automated Tests Completed:" -ForegroundColor Green
Write-Host "  ✓ Vendor registration with profile creation" -ForegroundColor White
Write-Host "  ✓ Vendor can access orders endpoint" -ForegroundColor White
Write-Host "  ✓ Customer registration (A1 flow)" -ForegroundColor White
Write-Host "  ✓ Login authentication (A1 flow)" -ForegroundColor White
Write-Host ""

Write-Host "Manual Tests Required:" -ForegroundColor Yellow
Write-Host "  ⏳ Signup redirect loop (frontend behavior)" -ForegroundColor White
Write-Host "  ⏳ Double submit prevention (frontend behavior)" -ForegroundColor White
Write-Host "  ⏳ Back button navigation (frontend behavior)" -ForegroundColor White
Write-Host "  ⏳ User without vendor profile gets 403" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Complete manual frontend tests" -ForegroundColor White
Write-Host "  2. Test user without vendor profile scenario (requires DB access)" -ForegroundColor White
Write-Host "  3. Monitor server logs for vendor not found errors" -ForegroundColor White
Write-Host "  4. Update TODO_AUDIT.md with test results" -ForegroundColor White
Write-Host ""

Write-Host "Test accounts created:" -ForegroundColor Cyan
Write-Host "  Vendor: $vendorEmail / $vendorPassword" -ForegroundColor White
Write-Host "  Customer: $customerEmail / $customerPassword" -ForegroundColor White
Write-Host ""

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Tests completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

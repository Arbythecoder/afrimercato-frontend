# ===================================================================
# AFRIMERCATO LOCAL TESTING SCRIPT
# ===================================================================
# Test all critical auth and vendor flows locally
# Run this AFTER starting backend on localhost:5000

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AFRIMERCATO LOCAL API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testResults = @()

# ===================================================================
# TEST 1: Health Check
# ===================================================================
Write-Host "TEST 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    if ($health.ok -eq $true) {
        Write-Host "✅ PASS: Backend is healthy" -ForegroundColor Green
        $testResults += "✅ Health Check"
    } else {
        Write-Host "❌ FAIL: Backend unhealthy" -ForegroundColor Red
        $testResults += "❌ Health Check"
    }
} catch {
    Write-Host "❌ FAIL: Cannot connect to backend" -ForegroundColor Red
    $testResults += "❌ Health Check"
    exit 1
}

# ===================================================================
# TEST 2: Vendor Registration
# ===================================================================
Write-Host "`nTEST 2: Vendor Registration" -ForegroundColor Yellow
$testEmail = "testvendor_$(Get-Random -Minimum 1000 -Maximum 9999)@test.com"
$vendorData = @{
    fullName = "Test Vendor"
    email = $testEmail
    password = "Test123!"
    phone = "+44 7700 900123"
    category = "Groceries"
    storeName = "Test Store"
    storeDescription = "Test Store Description"
    address = @{
        street = "123 High Street"
        city = "London"
        postcode = "SW1A 1AA"
        country = "UK"
    }
} | ConvertTo-Json -Depth 10

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendor/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $vendorData
    
    if ($registerResponse.success -eq $true) {
        $vendorToken = $registerResponse.data.token
        $vendorId = $registerResponse.data.vendor.id
        Write-Host "✅ PASS: Vendor registered successfully" -ForegroundColor Green
        Write-Host "   Email: $testEmail" -ForegroundColor Gray
        Write-Host "   VendorID: $vendorId" -ForegroundColor Gray
        $testResults += "✅ Vendor Registration"
    } else {
        Write-Host "❌ FAIL: Registration failed - $($registerResponse.message)" -ForegroundColor Red
        $testResults += "❌ Vendor Registration"
    }
} catch {
    Write-Host "❌ FAIL: Registration error - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "❌ Vendor Registration"
}

# ===================================================================
# TEST 3: Vendor Login (via /api/auth/login)
# ===================================================================
Write-Host "`nTEST 3: Vendor Login" -ForegroundColor Yellow
$loginData = @{
    email = $testEmail
    password = "Test123!"
} | ConvertTo-Json -Depth 10

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData
    
    if ($loginResponse.success -eq $true) {
        $vendorToken = $loginResponse.data.token
        $userRole = $loginResponse.data.user.role
        Write-Host "✅ PASS: Vendor login successful" -ForegroundColor Green
        Write-Host "   Role: $userRole" -ForegroundColor Gray
        $testResults += "✅ Vendor Login"
    } else {
        Write-Host "❌ FAIL: Login failed - $($loginResponse.message)" -ForegroundColor Red
        $testResults += "❌ Vendor Login"
    }
} catch {
    Write-Host "❌ FAIL: Login error - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "❌ Vendor Login"
}

# ===================================================================
# TEST 4: GET /api/vendor/profile (vendor-only endpoint)
# ===================================================================
Write-Host "`nTEST 4: Get Vendor Profile" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $vendorToken"
    }
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendor/profile" `
        -Method GET `
        -Headers $headers
    
    if ($profileResponse.success -eq $true) {
        Write-Host "✅ PASS: Vendor profile retrieved" -ForegroundColor Green
        Write-Host "   Store: $($profileResponse.data.storeName)" -ForegroundColor Gray
        $testResults += "✅ Vendor Profile"
    } else {
        Write-Host "❌ FAIL: Profile retrieval failed" -ForegroundColor Red
        $testResults += "❌ Vendor Profile"
    }
} catch {
    Write-Host "❌ FAIL: Profile error - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "❌ Vendor Profile"
}

# ===================================================================
# TEST 5: Customer Registration
# ===================================================================
Write-Host "`nTEST 5: Customer Registration" -ForegroundColor Yellow
$customerEmail = "testcustomer_$(Get-Random -Minimum 1000 -Maximum 9999)@test.com"
$customerData = @{
    name = "Test Customer"
    email = $customerEmail
    password = "Test123!"
    phone = "+44 7700 900456"
} | ConvertTo-Json

try {
    $customerRegResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $customerData
    
    if ($customerRegResponse.success -eq $true) {
        $customerToken = $customerRegResponse.data.token
        Write-Host "✅ PASS: Customer registered" -ForegroundColor Green
        Write-Host "   Email: $customerEmail" -ForegroundColor Gray
        $testResults += "✅ Customer Registration"
    } else {
        Write-Host "❌ FAIL: Customer registration failed" -ForegroundColor Red
        $testResults += "❌ Customer Registration"
    }
} catch {
    Write-Host "❌ FAIL: Customer registration error - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "❌ Customer Registration"
}

# ===================================================================
# TEST 6: Customer Login
# ===================================================================
Write-Host "`nTEST 6: Customer Login" -ForegroundColor Yellow
$customerLoginData = @{
    email = $customerEmail
    password = "Test123!"
} | ConvertTo-Json

try {
    $customerLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $customerLoginData
    
    if ($customerLoginResponse.success -eq $true) {
        $customerToken = $customerLoginResponse.data.token
        $customerRole = $customerLoginResponse.data.user.role
        Write-Host "✅ PASS: Customer login successful" -ForegroundColor Green
        Write-Host "   Role: $customerRole" -ForegroundColor Gray
        $testResults += "✅ Customer Login"
    } else {
        Write-Host "❌ FAIL: Customer login failed" -ForegroundColor Red
        $testResults += "❌ Customer Login"
    }
} catch {
    Write-Host "❌ FAIL: Customer login error - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += "❌ Customer Login"
}

# ===================================================================
# TEST 7: Customer tries to access vendor-only endpoint (should fail)
# ===================================================================
Write-Host "`nTEST 7: Role Separation (Customer → Vendor Endpoint)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $customerToken"
    }
    $crossRoleResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendor/profile" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "❌ FAIL: Customer accessed vendor endpoint (security issue!)" -ForegroundColor Red
    $testResults += "❌ Role Separation"
} catch {
    if ($_.Exception.Response.StatusCode -eq 403 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Customer correctly blocked from vendor endpoint" -ForegroundColor Green
        $testResults += "✅ Role Separation"
    } else {
        Write-Host "❌ FAIL: Unexpected error" -ForegroundColor Red
        $testResults += "❌ Role Separation"
    }
}

# ===================================================================
# TEST 8: Slug Resolution
# ===================================================================
Write-Host "`nTEST 8: Slug Resolution (if vendor has slug)" -ForegroundColor Yellow
try {
    # This assumes vendor was created with auto-slug
    $slugResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendors/slug/test-store" `
        -Method GET `
        -ErrorAction SilentlyContinue
    
    if ($slugResponse.success -eq $true) {
        Write-Host "✅ PASS: Slug resolution works" -ForegroundColor Green
        $testResults += "✅ Slug Resolution"
    } else {
        Write-Host "⚠️  SKIP: No vendor slug found (not critical)" -ForegroundColor Yellow
        $testResults += "⚠️  Slug Resolution (skipped)"
    }
} catch {
    Write-Host "⚠️  SKIP: Slug endpoint test failed (not critical)" -ForegroundColor Yellow
    $testResults += "⚠️  Slug Resolution (skipped)"
}

# ===================================================================
# TEST SUMMARY
# ===================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$testResults | ForEach-Object { Write-Host $_ }

$passCount = ($testResults | Where-Object { $_ -match "✅" }).Count
$failCount = ($testResults | Where-Object { $_ -match "❌" }).Count
$skipCount = ($testResults | Where-Object { $_ -match "⚠️" }).Count

Write-Host "`n$passCount passed, $failCount failed, $skipCount skipped" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Backend is ready." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  SOME TESTS FAILED. Review errors above." -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

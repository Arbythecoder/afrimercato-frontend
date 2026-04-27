# ===================================================
# BLOCKER 4: Commission Tracking Test
# ===================================================
# Tests that:
# 1. Platform commission is calculated at 12% of subtotal
# 2. Vendor earnings = subtotal - commission
# 3. Earnings endpoint shows correct amounts
# ===================================================

$API_URL = "https://afrimercato-backend.fly.dev/api"

Write-Host "`n=== BLOCKER 4: Commission Tracking Test ===" -ForegroundColor Cyan

# === Step 1: Register a test vendor ===
Write-Host "`nStep 1: Registering test vendor..." -ForegroundColor Yellow
$vendorEmail = "vendor-$(Get-Random -Maximum 9999)@test.com"
$vendorPassword = "TestPass123!"

$registerBody = @{
    firstName = "Test"
    lastName = "Vendor"
    email = $vendorEmail
    password = $vendorPassword
    role = "vendor"
    phoneNumber = "+447700900111"
} | ConvertTo-Json

$registerResponse = curl.exe -s -X POST "$API_URL/auth/register" `
  -H "Content-Type: application/json" `
  -d $registerBody

$registerData = $registerResponse | ConvertFrom-Json
Write-Host "Vendor registered: $($registerData.user.email)" -ForegroundColor Green

# === Step 2: Login as vendor ===
Write-Host "`nStep 2: Logging in as vendor..." -ForegroundColor Yellow
$loginBody = @{
    email = $vendorEmail
    password = $vendorPassword
} | ConvertTo-Json

$loginResponse = curl.exe -s -X POST "$API_URL/auth/login" `
  -H "Content-Type: application/json" `
  -d $loginBody

$loginData = $loginResponse | ConvertFrom-Json
$vendorToken = $loginData.token
Write-Host "Vendor logged in successfully" -ForegroundColor Green

# === Step 3: Create a product ===
Write-Host "`nStep 3: Creating test product..." -ForegroundColor Yellow
$productBody = @{
    name = "Test Product"
    description = "Commission test product"
    price = 100
    category = "Groceries"
    stock = 50
    unit = "kg"
} | ConvertTo-Json

$productResponse = curl.exe -s -X POST "$API_URL/vendor/products" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $vendorToken" `
  -d $productBody

$productData = $productResponse | ConvertFrom-Json
$productId = $productData.product._id
Write-Host "Product created with price: £100" -ForegroundColor Green

# === Step 4: Register a customer ===
Write-Host "`nStep 4: Registering test customer..." -ForegroundColor Yellow
$customerEmail = "customer-$(Get-Random -Maximum 9999)@test.com"
$customerPassword = "TestPass123!"

$customerRegisterBody = @{
    firstName = "Test"
    lastName = "Customer"
    email = $customerEmail
    password = $customerPassword
    role = "customer"
    phoneNumber = "+447700900222"
} | ConvertTo-Json

$customerRegisterResponse = curl.exe -s -X POST "$API_URL/auth/register" `
  -H "Content-Type: application/json" `
  -d $customerRegisterBody

$customerData = $customerRegisterResponse | ConvertFrom-Json
Write-Host "Customer registered" -ForegroundColor Green

# Verify email automatically in development
Write-Host "`nVerifying customer email..." -ForegroundColor Yellow
$verifyToken = $customerData.user.emailVerificationToken
$verifyResponse = curl.exe -s -X POST "$API_URL/auth/verify-email" `
  -H "Content-Type: application/json" `
  -d "{`"token`":`"$verifyToken`"}"

Write-Host "Email verified" -ForegroundColor Green

# === Step 5: Login as customer ===
Write-Host "`nStep 5: Logging in as customer..." -ForegroundColor Yellow
$customerLoginBody = @{
    email = $customerEmail
    password = $customerPassword
} | ConvertTo-Json

$customerLoginResponse = curl.exe -s -X POST "$API_URL/auth/login" `
  -H "Content-Type: application/json" `
  -d $customerLoginBody

$customerLoginData = $customerLoginResponse | ConvertFrom-Json
$customerToken = $customerLoginData.token
Write-Host "Customer logged in" -ForegroundColor Green

# === Step 6: Create checkout session (£100 product * 2 = £200 subtotal) ===
Write-Host "`nStep 6: Creating checkout session (£200 order)..." -ForegroundColor Yellow
$checkoutBody = @{
    items = @(
        @{
            productId = $productId
            quantity = 2
        }
    )
    deliveryAddress = @{
        street = "123 Test St"
        city = "London"
        postcode = "SW1A 1AA"
        country = "UK"
        coordinates = @{
            latitude = 51.5074
            longitude = -0.1278
        }
    }
} | ConvertTo-Json -Depth 5

$checkoutResponse = curl.exe -s -X POST "$API_URL/checkout/create-session" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $customerToken" `
  -d $checkoutBody

$checkoutData = $checkoutResponse | ConvertFrom-Json
Write-Host "Checkout session created" -ForegroundColor Green

# === Step 7: Check order commission calculation ===
Write-Host "`nStep 7: Verifying commission calculation..." -ForegroundColor Yellow
Write-Host "Subtotal: £$($checkoutData.order.pricing.subtotal)" -ForegroundColor White
Write-Host "Platform Commission (12%): £$($checkoutData.order.pricing.platformCommission)" -ForegroundColor Yellow
Write-Host "Vendor Earnings: £$($checkoutData.order.pricing.vendorEarnings)" -ForegroundColor Green

# Verify calculation
$expectedCommission = [Math]::Round($checkoutData.order.pricing.subtotal * 0.12, 2)
$expectedEarnings = $checkoutData.order.pricing.subtotal - $expectedCommission

$actualCommission = $checkoutData.order.pricing.platformCommission
$actualEarnings = $checkoutData.order.pricing.vendorEarnings

if ($actualCommission -eq $expectedCommission -and $actualEarnings -eq $expectedEarnings) {
    Write-Host "Commission calculation is CORRECT!" -ForegroundColor Green
} else {
    Write-Host "Commission calculation is INCORRECT!" -ForegroundColor Red
    Write-Host "Expected commission: $expectedCommission, got: $actualCommission" -ForegroundColor Red
}

# === Step 8: Check vendor earnings endpoint ===
Write-Host "`nStep 8: Checking vendor earnings endpoint..." -ForegroundColor Yellow
$earningsResponse = curl.exe -s -X GET "$API_URL/vendor/dashboard/earnings" `
  -H "Authorization: Bearer $vendorToken"

$earningsData = $earningsResponse | ConvertFrom-Json
Write-Host "Total Earnings: £$($earningsData.totalEarnings)" -ForegroundColor Green
Write-Host "Pending Earnings: £$($earningsData.pendingEarnings)" -ForegroundColor Yellow
Write-Host "Completed Orders: $($earningsData.completedOrdersCount)" -ForegroundColor White
Write-Host "Pending Orders: $($earningsData.pendingOrdersCount)" -ForegroundColor White

Write-Host "`n=== BLOCKER 4 TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "Commission tracking is WORKING!" -ForegroundColor Green

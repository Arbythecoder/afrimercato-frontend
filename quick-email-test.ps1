# QUICK EMAIL VERIFICATION TEST
# Tests that unverified users cannot checkout

$API_URL = "https://afrimercato-backend.fly.dev/api"

Write-Host "`n===== EMAIL VERIFICATION TEST =====" -ForegroundColor Cyan

# Create test user
$email = "test-$(Get-Random)@example.com"
$body = @{
    email = $email
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    role = "customer"
} | ConvertTo-Json

Write-Host "`n[1] Creating unverified user..." -ForegroundColor Yellow
try {
    $register = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $body -ContentType "application/json"
    $token = $register.token
    Write-Host "Created: $email" -ForegroundColor Green
    Write-Host "Email Verified: $($register.user.emailVerified)" -ForegroundColor $(if ($register.user.emailVerified) { "Red" } else { "Green" })
} catch {
    Write-Host "Registration failed: $_" -ForegroundColor Red
    exit 1
}

# Try checkout
Write-Host "`n[2] Attempting checkout (should FAIL)..." -ForegroundColor Yellow
$checkout = @{
    items = @(@{ productId = "507f1f77bcf86cd799439011"; quantity = 1; price = 10; name = "Test" })
    deliveryAddress = "Test Address"
    paymentMethod = "cash"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$API_URL/checkout/create-order" -Method POST -Headers @{"Authorization"="Bearer $token"} -Body $checkout -ContentType "application/json"
    Write-Host "FAIL: Checkout should be blocked!" -ForegroundColor Red
} catch {
    $err = ($_.ErrorDetails.Message | ConvertFrom-Json)
    if ($err.errorCode -eq "EMAIL_NOT_VERIFIED") {
        Write-Host "PASS: Checkout blocked correctly" -ForegroundColor Green
        Write-Host "Error: $($err.message)" -ForegroundColor Gray
    } else {
        Write-Host "FAIL: Wrong error code: $($err.errorCode)" -ForegroundColor Red
    }
}

Write-Host "`n===== TEST COMPLETE =====" -ForegroundColor Green
Write-Host "Test user: $email" -ForegroundColor Gray

# ===============================================
# BLOCKER 1: EMAIL VERIFICATION - TEST COMMANDS
# ===============================================
# PowerShell-safe curl.exe commands to test the full flow

$API_URL = "https://afrimercato-backend.fly.dev/api"
$FRONTEND_URL = "https://your-frontend.vercel.app"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "EMAIL VERIFICATION END-TO-END TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ===========================================
# TEST 1: Register New User
# ===========================================
Write-Host "`n[TEST 1] Register new user..." -ForegroundColor Yellow

$email = "test-$(Get-Random)@example.com"
$testData = @{
    email = $email
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Write-Host "Creating user: $email" -ForegroundColor Gray

curl.exe -X POST "$API_URL/auth/register" `
  -H "Content-Type: application/json" `
  -d $testData `
  --silent | ConvertFrom-Json | Format-List

Write-Host "`n✓ Expected: emailVerified=false, verificationToken returned (dev mode)" -ForegroundColor Green
Write-Host "✓ Expected: Verification link in server logs" -ForegroundColor Green

# ===========================================
# TEST 2: Try Checkout (Should Fail)
# ===========================================
Write-Host "`n[TEST 2] Attempt checkout without verification..." -ForegroundColor Yellow

# First login to get token
$loginData = @{
    email = $email
    password = "Test123!"
} | ConvertTo-Json

$loginResponse = curl.exe -X POST "$API_URL/auth/login" `
  -H "Content-Type: application/json" `
  -d $loginData `
  --silent | ConvertFrom-Json

$token = $loginResponse.token

# Try checkout
$checkoutData = @{
    items = @(
        @{
            product = "507f1f77bcf86cd799439011"
            name = "Test Product"
            price = 10.99
            quantity = 1
        }
    )
    deliveryAddress = @{
        fullName = "Test User"
        street = "123 Test St"
        city = "London"
        postcode = "E1 6AN"
    }
    payment = @{
        method = "cash"
    }
} | ConvertTo-Json -Depth 5

Write-Host "Attempting checkout..." -ForegroundColor Gray

curl.exe -X POST "$API_URL/checkout/create-order" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d $checkoutData `
  --silent

Write-Host "`n✓ Expected: 403 Forbidden, errorCode='EMAIL_NOT_VERIFIED'" -ForegroundColor Green

# ===========================================
# TEST 3: Resend Verification Email
# ===========================================
Write-Host "`n[TEST 3] Resend verification email..." -ForegroundColor Yellow

$resendResponse = curl.exe -X POST "$API_URL/auth/resend-verification" `
  -H "Authorization: Bearer $token" `
  --silent | ConvertFrom-Json

Write-Host "Response:" -ForegroundColor Gray
$resendResponse | Format-List

Write-Host "`n✓ Expected: success=true, verificationToken returned (dev mode)" -ForegroundColor Green
Write-Host "✓ Expected: Verification link in server logs" -ForegroundColor Green

# Save token for next step
$verificationToken = $resendResponse.verificationToken

# ===========================================
# TEST 4: Verify Email
# ===========================================
Write-Host "`n[TEST 4] Verify email with token..." -ForegroundColor Yellow

if ($verificationToken) {
    $verifyData = @{
        token = $verificationToken
    } | ConvertTo-Json

    Write-Host "Verifying with token: $($verificationToken.Substring(0,20))..." -ForegroundColor Gray

    $verifyResponse = curl.exe -X POST "$API_URL/auth/verify-email" `
      -H "Content-Type: application/json" `
      -d $verifyData `
      --silent | ConvertFrom-Json

    Write-Host "Response:" -ForegroundColor Gray
    $verifyResponse | Format-List

    Write-Host "`n✓ Expected: success=true, 'Email verified successfully'" -ForegroundColor Green
} else {
    Write-Host "⚠️  No verification token returned - check server logs for link" -ForegroundColor Yellow
    Write-Host "In production, user would click link in email" -ForegroundColor Gray
}

# ===========================================
# TEST 5: Retry Checkout (Should Succeed)
# ===========================================
Write-Host "`n[TEST 5] Retry checkout after verification..." -ForegroundColor Yellow

Write-Host "Attempting checkout again..." -ForegroundColor Gray

curl.exe -X POST "$API_URL/checkout/create-order" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d $checkoutData `
  --silent | ConvertFrom-Json | Format-List

Write-Host "`n✓ Expected: success=true, order created" -ForegroundColor Green

# ===========================================
# SUMMARY
# ===========================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nTest User Credentials:" -ForegroundColor Cyan
Write-Host "  Email: $email" -ForegroundColor White
Write-Host "  Password: Test123!" -ForegroundColor White

Write-Host "`nVerification Link Format:" -ForegroundColor Cyan
Write-Host "  $FRONTEND_URL/verify-email?token=$verificationToken" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MANUAL UI TEST STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n1. Go to: $FRONTEND_URL/register" -ForegroundColor Yellow
Write-Host "   - Register a new account" -ForegroundColor Gray
Write-Host "   - Check browser console for verification link (dev mode)" -ForegroundColor Gray

Write-Host "`n2. Try to checkout:" -ForegroundColor Yellow
Write-Host "   - Add items to cart" -ForegroundColor Gray
Write-Host "   - Go to checkout" -ForegroundColor Gray
Write-Host "   - Should see RED BANNER: 'Email Verification Required'" -ForegroundColor Gray

Write-Host "`n3. Click 'Resend Verification Email'" -ForegroundColor Yellow
Write-Host "   - Should see success message" -ForegroundColor Gray
Write-Host "   - Check browser console for link (dev mode)" -ForegroundColor Gray

Write-Host "`n4. Click verification link:" -ForegroundColor Yellow
Write-Host "   - Should see green checkmark: 'Email Verified!'" -ForegroundColor Gray
Write-Host "   - Auto-redirects to login after 3 seconds" -ForegroundColor Gray

Write-Host "`n5. Login and retry checkout:" -ForegroundColor Yellow
Write-Host "   - Should work without errors" -ForegroundColor Gray
Write-Host "   - Order completes successfully" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ BLOCKER 1 COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

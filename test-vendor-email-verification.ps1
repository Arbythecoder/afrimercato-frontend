# Test Vendor Email Verification Flow (A1)
Write-Host "🧪 TESTING VENDOR EMAIL VERIFICATION FLOW (A1)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$testEmail = "testvendor$(Get-Random)@example.com"

$testVendorData = @{
  storeName = "Test Store $(Get-Random)"
  fullName = "Test Vendor"
  email = $testEmail
  phone = "+1234567890"
  password = "testpass123"
  storeDescription = "Test store for verification"
  category = "grocery"
  address = @{
    street  = "123 Test St"
    city    = "Test City"
    state   = "TS"
    zipCode = "12345"
    country = "Test Country"
  }
}

try {
  # STEP 1: Register vendor
  Write-Host "`n📝 STEP 1: Register new vendor" -ForegroundColor Yellow
  $registerBody = $testVendorData | ConvertTo-Json -Depth 10

  $registerResponse = Invoke-RestMethod `
    -Uri "$baseUrl/vendor/register" `
    -Method POST `
    -Body $registerBody `
    -ContentType "application/json"

  Write-Host "✅ Registration response:" -ForegroundColor Green
  $registerResponse | ConvertTo-Json -Depth 10

  # Expect: no token + emailVerified false
  if ($registerResponse.data.token) {
    Write-Host "❌ ERROR: Token returned on register (unexpected for verify-first flow)" -ForegroundColor Red
  } else {
    Write-Host "✅ No token returned on register (good)" -ForegroundColor Green
  }

  # STEP 2: Login
  Write-Host "`n🔐 STEP 2: Login vendor" -ForegroundColor Yellow
  $loginBody = @{
    email = $testEmail
    password = "testpass123"
  } | ConvertTo-Json -Depth 10

  $loginResponse = Invoke-RestMethod `
    -Uri "$baseUrl/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

  if (-not $loginResponse.data.token) {
    throw "Login succeeded but token missing in response"
  }

  $authToken = $loginResponse.data.token
  Write-Host "✅ Login token received (first 25 chars): $($authToken.Substring(0,25))..." -ForegroundColor Green

  # STEP 3: Try vendor profile (should fail with EMAIL_NOT_VERIFIED)
  Write-Host "`n🚫 STEP 3: Access vendor profile before verification (should fail)" -ForegroundColor Yellow
  $headers = @{ Authorization = "Bearer $authToken" }

  try {
    $profileResponse = Invoke-RestMethod `
      -Uri "$baseUrl/vendor/profile" `
      -Method GET `
      -Headers $headers

    Write-Host "❌ ERROR: Profile access succeeded but should have failed" -ForegroundColor Red
    $profileResponse | ConvertTo-Json -Depth 10
  } catch {
    $statusCode = $null
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }

    Write-Host "✅ Profile blocked as expected. Status: $statusCode" -ForegroundColor Green

    # Try to parse JSON error body if present
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      try {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "ErrorCode: $($err.errorCode)" -ForegroundColor Gray
        if ($err.errorCode -eq "EMAIL_NOT_VERIFIED") {
          Write-Host "✅ EMAIL_NOT_VERIFIED confirmed" -ForegroundColor Green
        } else {
          Write-Host "⚠️ Unexpected errorCode (expected EMAIL_NOT_VERIFIED): $($err.errorCode)" -ForegroundColor Yellow
        }
      } catch {
        Write-Host "⚠️ Could not parse error body JSON. Raw:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
      }
    }
  }

  # STEP 4: Manual verify guidance
  Write-Host "`n📧 STEP 4: Verify email manually" -ForegroundColor Yellow
  Write-Host "Check server logs/email for verification token, then run:" -ForegroundColor Gray
  Write-Host 'Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-email" -Method POST -ContentType "application/json" -Body ( @{ token = "PASTE_TOKEN_HERE" } | ConvertTo-Json )' -ForegroundColor White

  Write-Host "`n✅ A1 test run complete." -ForegroundColor Green
  Write-Host "Expected next: After verification, GET /api/vendor/profile should return 200." -ForegroundColor Green

} catch {
  Write-Host "`n❌ TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host ($_ | Out-String) -ForegroundColor Red
}

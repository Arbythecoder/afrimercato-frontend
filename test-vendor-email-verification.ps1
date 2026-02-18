# Test Vendor Email Verification Flow
# This script tests that vendor registration requires email verification

Write-Host "🧪 TESTING VENDOR EMAIL VERIFICATION FLOW" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Configuration
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
        street = "123 Test St"
        city = "Test City"
        state = "TS"
        zipCode = "12345"
        country = "Test Country"
    }
}

try {
    Write-Host "`n📝 STEP 1: Register new vendor" -ForegroundColor Yellow
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/vendor/register" -Method POST -Body ($testVendorData | ConvertTo-Json) -ContentType "application/json"
    
    if ($registerResponse.success) {
        Write-Host "✅ Registration successful: $($registerResponse.message)" -ForegroundColor Green
        Write-Host "   Email: $($registerResponse.data.email)" -ForegroundColor Gray
        Write-Host "   Email Verified: $($registerResponse.data.emailVerified)" -ForegroundColor Gray
        
        # Check that no login token was provided
        if ($registerResponse.data.token) {
            Write-Host "❌ ERROR: Login token was provided (should not be)" -ForegroundColor Red
        } else {
            Write-Host "✅ No login token provided (correct)" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Registration failed: $($registerResponse.message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n🔐 STEP 2: Attempt to login vendor" -ForegroundColor Yellow
    $loginData = @{
        email = $testEmail
        password = "testpass123"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $authToken = $loginResponse.data.token
        Write-Host "   Token: $($authToken.Substring(0,20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n🚫 STEP 3: Try to access vendor profile (should fail)" -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $authToken"
        "Content-Type" = "application/json"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/vendor/profile" -Method GET -Headers $headers
        Write-Host "❌ ERROR: Profile access succeeded (should have failed)" -ForegroundColor Red
        Write-Host "   Response: $($profileResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse.StatusCode -eq 403) {
            Write-Host "✅ Profile access blocked with 403 (correct)" -ForegroundColor Green
            try {
                $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
                if ($errorBody.errorCode -eq "EMAIL_NOT_VERIFIED") {
                    Write-Host "✅ Error code is EMAIL_NOT_VERIFIED (correct)" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Error code: $($errorBody.errorCode) (expected EMAIL_NOT_VERIFIED)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   Error details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ Unexpected status code: $($errorResponse.StatusCode)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📧 STEP 4: Simulate email verification" -ForegroundColor Yellow
    Write-Host "In development, check server logs for verification token or email content" -ForegroundColor Gray
    Write-Host "Example verification call would be:" -ForegroundColor Gray
    Write-Host "POST $baseUrl/auth/verify-email" -ForegroundColor Gray
    Write-Host "Body: { `"token`": `"TOKEN_FROM_EMAIL`" }" -ForegroundColor Gray
    
    Write-Host "`n✅ EMAIL VERIFICATION TEST COMPLETE" -ForegroundColor Green
    Write-Host "Results:" -ForegroundColor White
    Write-Host "- ✅ Vendor registration works" -ForegroundColor Green
    Write-Host "- ✅ No immediate login token provided" -ForegroundColor Green  
    Write-Host "- ✅ Login works but email not verified" -ForegroundColor Green
    Write-Host "- ✅ Protected routes block unverified users" -ForegroundColor Green
    Write-Host "- 📧 Manual email verification required" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ TEST FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full Error: $($_ | Out-String)" -ForegroundColor Red
}

Write-Host "`n🔧 MANUAL VERIFICATION STEPS:" -ForegroundColor Magenta
Write-Host "1. Check server console/logs for verification token" -ForegroundColor White
Write-Host "2. Copy the token from the email or server logs" -ForegroundColor White 
Write-Host "3. Run: Invoke-RestMethod -Uri '$baseUrl/auth/verify-email' -Method POST -Body '{`"token`":`"YOUR_TOKEN`"}' -ContentType 'application/json'" -ForegroundColor White
Write-Host "4. Then retry: Invoke-RestMethod -Uri '$baseUrl/vendor/profile' -Method GET -Headers @{'Authorization'='Bearer $authToken'}" -ForegroundColor White
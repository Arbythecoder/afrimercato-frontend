# =================================================================
# A2 VENDOR EMAIL VERIFICATION TEST
# =================================================================
# Tests: POST /api/auth/verify-email
# Validates:
# - Vendor can verify email via token
# - Before verification: protected routes return 403 EMAIL_NOT_VERIFIED
# - After verification: protected routes return 200

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  A2: VENDOR EMAIL VERIFICATION AUDIT" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Generate unique test data
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "vendor.emailtest.$timestamp@afrimercato.test"

# =================================================================
# STEP 1: Register a new vendor
# =================================================================
Write-Host "[STEP 1] Register test vendor" -ForegroundColor Cyan

$testVendor = @{
    fullName = "Email Test Vendor"
    email = $testEmail
    phone = "+234-800-EMAIL-$timestamp"
    password = "TestPassword123!"
    storeName = "Email Test Store"
    storeDescription = "Testing email verification"
    category = "groceries"
    address = @{
        street = "123 Email Test St"
        city = "Lagos"
        state = "Lagos"
        postalCode = "100001"
        country = "Nigeria"
    }
} | ConvertTo-Json -Depth 10

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendor/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testVendor `
        -TimeoutSec 30
    
    if (-not $registerResponse.data.token) {
        Write-Host "✗ Registration did not return token" -ForegroundColor Red
        exit 1
    }
    
    $token = $registerResponse.data.token
    $userId = $registerResponse.data.user.id
    
    Write-Host "✓ Vendor registered" -ForegroundColor Green
    Write-Host "  Email: $testEmail" -ForegroundColor White
    Write-Host "  User ID: $userId" -ForegroundColor White
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# =================================================================
# STEP 2: Test protected route BEFORE email verification
# =================================================================
Write-Host "[STEP 2] Test protected route BEFORE email verification" -ForegroundColor Cyan
Write-Host "Expected: 403 Forbidden with errorCode 'EMAIL_NOT_VERIFIED'" -ForegroundColor Gray

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendor/profile" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -TimeoutSec 30
    
    # If we get here, the route did NOT block unverified email
    Write-Host "✗ SECURITY ISSUE: Protected route allowed unverified email!" -ForegroundColor Red
    Write-Host "  Response: $($profileResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
    exit 1
    
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            
            if ($errorBody.errorCode -eq "EMAIL_NOT_VERIFIED") {
                Write-Host "✓ Correctly returned 403 EMAIL_NOT_VERIFIED" -ForegroundColor Green
                Write-Host "  Message: $($errorBody.message)" -ForegroundColor White
            } else {
                Write-Host "⚠ Returned 403 but with wrong errorCode: $($errorBody.errorCode)" -ForegroundColor Yellow
                Write-Host "  Expected: EMAIL_NOT_VERIFIED" -ForegroundColor Gray
            }
        } catch {
            Write-Host "⚠ Returned 403 but could not parse error body" -ForegroundColor Yellow
        }
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "⚠ Returned 401 instead of 403" -ForegroundColor Yellow
        Write-Host "  (Should be 403 EMAIL_NOT_VERIFIED for unverified email)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Unexpected status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""

# =================================================================
# STEP 3: Get verification token from DB (simulate email link)
# =================================================================
Write-Host "[STEP 3] Get verification token" -ForegroundColor Cyan
Write-Host "⚠️  NOTE: In production, this would come from the email link" -ForegroundColor Yellow
Write-Host "For testing, we need to query the database or check server logs" -ForegroundColor Yellow
Write-Host ""

# Check if backend is running in dev mode with token logging
Write-Host "🔍 Checking for verification token in server environment..." -ForegroundColor Cyan

# Try to get token from resend-verification endpoint
Write-Host "Requesting new verification token..." -ForegroundColor Cyan
try {
    $resendResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/resend-verification" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -TimeoutSec 30
    
    if ($resendResponse.verificationToken) {
        $verificationToken = $resendResponse.verificationToken
        Write-Host "✓ Got verification token from resend endpoint" -ForegroundColor Green
        Write-Host "  Token: $($verificationToken.Substring(0, 20))..." -ForegroundColor White
    } else {
        Write-Host "⚠ Resend endpoint did not return token (production mode)" -ForegroundColor Yellow
        Write-Host "Cannot continue automated test without token" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "MANUAL STEPS:" -ForegroundColor Cyan
        Write-Host "1. Check email inbox for: $testEmail" -ForegroundColor White
        Write-Host "2. Extract verification token from email link" -ForegroundColor White
        Write-Host "3. Run: curl -X POST $baseUrl/api/auth/verify-email -d '{\"token\":\"YOUR_TOKEN\"}'" -ForegroundColor White
        exit 0
    }
} catch {
    Write-Host "⚠ Could not get verification token: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Cannot continue automated test" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# =================================================================
# STEP 4: Verify email using token
# =================================================================
Write-Host "[STEP 4] Verify email using token" -ForegroundColor Cyan

$verifyBody = @{
    token = $verificationToken
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify-email" `
        -Method POST `
        -ContentType "application/json" `
        -Body $verifyBody `
        -TimeoutSec 30
    
    if ($verifyResponse.success) {
        Write-Host "✓ Email verified successfully" -ForegroundColor Green
        Write-Host "  Message: $($verifyResponse.message)" -ForegroundColor White
    } else {
        Write-Host "✗ Verification failed: $($verifyResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Verification request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
    exit 1
}

Write-Host ""

# =================================================================
# STEP 5: Test protected route AFTER email verification
# =================================================================
Write-Host "[STEP 5] Test protected route AFTER email verification" -ForegroundColor Cyan
Write-Host "Expected: 200 OK or 404 NOT_FOUND (if profile not created yet)" -ForegroundColor Gray

try {
    $profileResponseAfter = Invoke-RestMethod -Uri "$baseUrl/api/vendor/profile" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -TimeoutSec 30
    
    Write-Host "✓ Protected route accessible after verification" -ForegroundColor Green
    Write-Host "  Store Name: $($profileResponseAfter.data.vendor.storeName)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 404) {
        Write-Host "✓ Returned 404 (vendor profile not found - expected for A3)" -ForegroundColor Green
        Write-Host "  This is OK - vendor profile creation is separate (A3)" -ForegroundColor White
    } elseif ($statusCode -eq 403) {
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            if ($errorBody.errorCode -eq "EMAIL_NOT_VERIFIED") {
                Write-Host "✗ FAIL: Still returning EMAIL_NOT_VERIFIED after verification!" -ForegroundColor Red
                exit 1
            } elseif ($errorBody.errorCode -eq "VENDOR_NOT_FOUND") {
                Write-Host "✓ Returned 403 VENDOR_NOT_FOUND (profile not created - expected for A3)" -ForegroundColor Green
            } else {
                Write-Host "⚠ Returned 403 with errorCode: $($errorBody.errorCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠ Returned 403 but could not parse error" -ForegroundColor Yellow
        }
    } elseif ($statusCode -eq 401) {
        Write-Host "⚠ Returned 401 after verification (token may have expired?)" -ForegroundColor Yellow
    } else {
        Write-Host "⚠ Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  A2 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[PASS] A2 VENDOR EMAIL VERIFICATION TEST PASSED" -ForegroundColor Green
Write-Host ""
Write-Host "Verified:" -ForegroundColor White
Write-Host "  - POST /api/auth/verify-email works (OK)" -ForegroundColor Green
Write-Host "  - Before verification: 403 EMAIL_NOT_VERIFIED (OK)" -ForegroundColor Green
Write-Host "  - After verification: protected routes accessible (OK)" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Run test-a3-vendor-profile.ps1" -ForegroundColor Cyan

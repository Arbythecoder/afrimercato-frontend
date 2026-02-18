# =================================================================
# A1 VENDOR REGISTRATION TEST (ASCII version)
# =================================================================
# Tests: POST /api/vendor/register

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  A1: VENDOR REGISTRATION AUDIT" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Generate unique test data
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "vendor.test.$timestamp@afrimercato.test"

$testVendor = @{
    fullName = "Test Vendor $timestamp"
    email = $testEmail
    phone = "+2348001234567"
    password = "TestPassword123!"
    storeName = "Test Store $timestamp"
    storeDescription = "Test store for automated A1 audit"
    category = "groceries"
    address = @{
        street = "123 Test Street"
        city = "Lagos"
        state = "Lagos"
        postalCode = "100001"
        country = "Nigeria"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Test Data:" -ForegroundColor Yellow
Write-Host "  Email: $testEmail" -ForegroundColor White
Write-Host "  Endpoint: POST $baseUrl/api/vendor/register" -ForegroundColor White
Write-Host ""

# =================================================================
# TEST 1: Vendor Registration
# =================================================================
Write-Host "[TEST 1] POST /api/vendor/register" -ForegroundColor Cyan
Write-Host "Expected: 201 Created with token, user, and vendor objects" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendor/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testVendor `
        -TimeoutSec 30

    Write-Host "[OK] Registration successful" -ForegroundColor Green
    
    # Validate response structure
    $checks = @()
    
    # Check 1: Response has success=true
    if ($response.success -eq $true) {
        Write-Host "  [PASS] success: true" -ForegroundColor Green
        $checks += $true
    } else {
        Write-Host "  [FAIL] success is not true" -ForegroundColor Red
        $checks += $false
    }
    
    # Check 2: Token is present
    if ($response.data.token) {
        Write-Host "  [PASS] Token present" -ForegroundColor Green
        $token = $response.data.token
        $checks += $true
        
        # Decode JWT to check payload
        try {
            $tokenParts = $response.data.token.Split('.')
            if ($tokenParts.Length -eq 3) {
                $payload = $tokenParts[1]
                # Add padding if needed
                while ($payload.Length % 4 -ne 0) { $payload += "=" }
                $decodedBytes = [System.Convert]::FromBase64String($payload)
                $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
                $jwtPayload = $decodedJson | ConvertFrom-Json
                
                Write-Host "  [PASS] JWT Payload decoded" -ForegroundColor Green
                Write-Host "    - User ID: $($jwtPayload.id)" -ForegroundColor White
                Write-Host "    - Email: $($jwtPayload.email)" -ForegroundColor White
                Write-Host "    - Roles: $($jwtPayload.roles -join ', ')" -ForegroundColor White
                
                # Check if vendor role is in JWT
                if ($jwtPayload.roles -contains "vendor") {
                    Write-Host "  [PASS] JWT contains 'vendor' role" -ForegroundColor Green
                    $checks += $true
                } else {
                    Write-Host "  [FAIL] JWT does NOT contain 'vendor' role" -ForegroundColor Red
                    $checks += $false
                }
            }
        } catch {
            Write-Host "  [WARN] Could not decode JWT payload: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [FAIL] Token missing in response" -ForegroundColor Red
        $checks += $false
    }
    
    # Check 3: RefreshToken is present
    if ($response.data.refreshToken) {
        Write-Host "  [PASS] RefreshToken present" -ForegroundColor Green
        $checks += $true
    } else {
        Write-Host "  [FAIL] RefreshToken missing" -ForegroundColor Red
        $checks += $false
    }
    
    # Check 4: User object is present with vendor role
    if ($response.data.user) {
        Write-Host "  [PASS] User object present" -ForegroundColor Green
        Write-Host "    - ID: $($response.data.user.id)" -ForegroundColor White
        Write-Host "    - Email: $($response.data.user.email)" -ForegroundColor White
        Write-Host "    - Roles: $($response.data.user.roles -join ', ')" -ForegroundColor White
        
        if ($response.data.user.roles -contains "vendor") {
            Write-Host "  [PASS] User.roles contains 'vendor'" -ForegroundColor Green
            $checks += $true
        } else {
            Write-Host "  [FAIL] User.roles does NOT contain 'vendor'" -ForegroundColor Red
            $checks += $false
        }
    } else {
        Write-Host "  [FAIL] User object missing" -ForegroundColor Red
        $checks += $false
    }
    
    # Check 5: Vendor object is present
    if ($response.data.vendor) {
        Write-Host "  [PASS] Vendor object present" -ForegroundColor Green
        Write-Host "    - Vendor ID: $($response.data.vendor.id)" -ForegroundColor White
        Write-Host "    - Store ID: $($response.data.vendor.storeId)" -ForegroundColor White
        Write-Host "    - Store Name: $($response.data.vendor.storeName)" -ForegroundColor White
        Write-Host "    - Approval Status: $($response.data.vendor.approvalStatus)" -ForegroundColor White
        $checks += $true
    } else {
        Write-Host "  [FAIL] Vendor object missing" -ForegroundColor Red
        $checks += $false
    }
    
    # Check 6: Email verification flag
    if ($response.data.vendor.emailVerified -eq $false) {
        Write-Host "  [PASS] emailVerified is false (as expected)" -ForegroundColor Green
        $checks += $true
    } else {
        Write-Host "  [WARN] emailVerified should be false" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "  A1 TEST SUMMARY" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    
    $passedChecks = ($checks | Where-Object { $_ -eq $true }).Count
    $totalChecks = $checks.Count
    
    Write-Host "Passed: $passedChecks / $totalChecks checks" -ForegroundColor White
    Write-Host ""
    
    if ($passedChecks -eq $totalChecks) {
        Write-Host "[PASS] A1 VENDOR REGISTRATION: ALL CHECKS PASSED" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next step: Run test-a2-vendor-email-verification.ps1" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "[PARTIAL] A1 VENDOR REGISTRATION: $passedChecks/$totalChecks checks passed" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "[FAIL] Registration failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Server response:" -ForegroundColor Yellow
            Write-Host ($errorResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray
        } catch {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "[FAIL] A1 VENDOR REGISTRATION TEST FAILED" -ForegroundColor Red
    exit 1
}

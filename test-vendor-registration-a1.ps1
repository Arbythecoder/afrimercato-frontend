# =================================================================
# A1 VENDOR REGISTRATION TEST
# =================================================================
# Tests POST /api/vendor/register endpoint
# Validates User and Vendor document creation

# Test Configuration
$baseUrl = "http://localhost:3000"  # Update for production
$endpoint = "/api/vendor/register"

# Test Data
$testVendor = @{
    fullName = "John Smith"
    email = "john.smith.vendor.$(Get-Date -Format 'yyyyMMdd.HHmmss')@test.com"
    phone = "+1-555-0123"
    password = "securePassword123"
    storeName = "John's Fresh Market"
    storeDescription = "Premium organic produce and fresh groceries delivered to your door"
    category = "fresh-produce"
    address = @{
        street = "123 Market Street"
        city = "London"
        state = "England"
        postalCode = "SW1A 1AA"
        country = "United Kingdom"
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== VENDOR REGISTRATION TEST ===" -ForegroundColor Green
Write-Host "Testing endpoint: $baseUrl$endpoint" -ForegroundColor Yellow
Write-Host "Test data:" -ForegroundColor Cyan
Write-Host $testVendor -ForegroundColor Gray

try {
    # Execute vendor registration request
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method POST -Body $testVendor -ContentType "application/json"
    
    Write-Host "`n✅ REGISTRATION SUCCESS!" -ForegroundColor Green
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    
    if ($response.data) {
        Write-Host "`n📊 RESPONSE DATA:" -ForegroundColor Yellow
        Write-Host "Token: $($response.data.token ? 'Present' : 'Missing')" -ForegroundColor White
        Write-Host "User ID: $($response.data.user.id)" -ForegroundColor White
        Write-Host "User Roles: $($response.data.user.roles -join ', ')" -ForegroundColor White
        Write-Host "Email Verified: $($response.data.user.emailVerified)" -ForegroundColor $(if($response.data.user.emailVerified) { 'Green' } else { 'Red' })
        
        Write-Host "`n🏪 VENDOR DATA:" -ForegroundColor Yellow
        Write-Host "Store ID: $($response.data.vendor.storeId)" -ForegroundColor White
        Write-Host "Store Name: $($response.data.vendor.storeName)" -ForegroundColor White
        Write-Host "Approval Status: $($response.data.vendor.approvalStatus)" -ForegroundColor $(if($response.data.vendor.approvalStatus -eq 'approved') { 'Green' } else { 'Red' })
        Write-Host "Is Verified: $($response.data.vendor.isVerified)" -ForegroundColor $(if($response.data.vendor.isVerified) { 'Green' } else { 'Red' })
        Write-Host "Is Public: $($response.data.vendor.isPublic)" -ForegroundColor $(if($response.data.vendor.isPublic) { 'Green' } else { 'Red' })
        Write-Host "Is Active: $($response.data.vendor.isActive)" -ForegroundColor $(if($response.data.vendor.isActive) { 'Green' } else { 'Red' })
        
        Write-Host "`n🚀 ONBOARDING STATUS:" -ForegroundColor Yellow
        Write-Host "Current Step: $($response.data.onboarding.currentStep)/$($response.data.onboarding.totalSteps)" -ForegroundColor White
        Write-Host "Next Action: $($response.data.onboarding.nextAction)" -ForegroundColor White
        Write-Host "Can Add Products: $($response.data.onboarding.canAddProducts)" -ForegroundColor $(if($response.data.onboarding.canAddProducts) { 'Green' } else { 'Red' })
        Write-Host "Can Receive Orders: $($response.data.onboarding.canReceiveOrders)" -ForegroundColor $(if($response.data.onboarding.canReceiveOrders) { 'Green' } else { 'Red' })
    }
    
    Write-Host "`n✅ AUDIT RESULTS:" -ForegroundColor Magenta
    Write-Host "• User.roles includes 'vendor': $(if($response.data.user.roles -contains 'vendor') { '✅ YES' } else { '❌ NO' })" -ForegroundColor White
    Write-Host "• Email verification bypassed: $(if($response.data.user.emailVerified) { '⚠️  YES (Set to true by default)' } else { '✅ NO' })" -ForegroundColor White
    Write-Host "• Auto-approved for selling: $(if($response.data.vendor.approvalStatus -eq 'approved') { '✅ YES' } else { '❌ NO' })" -ForegroundColor White
    
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    Write-Host "`n❌ REGISTRATION FAILED!" -ForegroundColor Red
    Write-Host "HTTP Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($errorDetails) {
        Write-Host "Error Code: $($errorDetails.errorCode)" -ForegroundColor Red
        Write-Host "Message: $($errorDetails.message)" -ForegroundColor Red
        Write-Host "User Message: $($errorDetails.userMessage)" -ForegroundColor Red
        
        if ($errorDetails.details) {
            Write-Host "`n📝 VALIDATION ERRORS:" -ForegroundColor Yellow
            $errorDetails.details | ForEach-Object {
                Write-Host "  • $($_.field): $($_.message)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "Raw Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Green
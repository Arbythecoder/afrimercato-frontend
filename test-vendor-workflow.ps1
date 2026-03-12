# AfriMercato Vendor Workflow Test Script
# Tests: Registration -> Login -> Create Store -> Add Product

$API_BASE = "http://localhost:5000/api"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AfriMercato Vendor Workflow Test" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Generate random email
$random = Get-Random -Minimum 1000 -Maximum 9999
$email = "vendor$random@test.com"
$password = "Password123"

Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Email: $email" -ForegroundColor White
Write-Host "  Password: $password" -ForegroundColor White
Write-Host ""

# Step 1: Register Vendor
Write-Host "STEP 1 - Registering vendor..." -ForegroundColor Cyan
try {
    $registerBody = @{
        name = "Green Valley Farms"
        email = $email
        password = $password
        confirmPassword = $password
        phone = "+234-800-555-$random"
        role = "vendor"
    }

    $registerData = $registerBody | ConvertTo-Json -Compress

    $registerResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerData

    if ($registerResponse.success) {
        Write-Host "  SUCCESS: Vendor registered" -ForegroundColor Green
        Write-Host "  User ID: $($registerResponse.data.user._id)" -ForegroundColor Gray
        $token = $registerResponse.data.token
    } else {
        Write-Host "  FAILED: $($registerResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Login
Write-Host "STEP 2 - Logging in..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginData

    if ($loginResponse.success) {
        Write-Host "  SUCCESS: Login successful" -ForegroundColor Green
        Write-Host "  Token: $($loginResponse.data.token.Substring(0, 30))..." -ForegroundColor Gray
        $token = $loginResponse.data.token
    } else {
        Write-Host "  FAILED: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create Vendor Store
Write-Host "STEP 3 - Creating vendor store..." -ForegroundColor Cyan
try {
    $storeData = @{
        businessName = "Green Valley Farms"
        businessType = "individual"
        description = "Fresh organic produce from farm to table"
        address = @{
            street = "123 Farm Road"
            city = "Ibadan"
            state = "Oyo"
            country = "Nigeria"
        }
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $storeResponse = Invoke-RestMethod -Uri "$API_BASE/vendor/create-store" `
        -Method Post `
        -Headers $headers `
        -Body $storeData

    if ($storeResponse.success) {
        Write-Host "  SUCCESS: Store created" -ForegroundColor Green
        Write-Host "  Vendor ID: $($storeResponse.data.vendor._id)" -ForegroundColor Gray
        Write-Host "  Business: $($storeResponse.data.vendor.businessName)" -ForegroundColor Gray
        $vendorId = $storeResponse.data.vendor._id
    } else {
        Write-Host "  FAILED: $($storeResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Add Product
Write-Host "STEP 4 - Adding product..." -ForegroundColor Cyan
try {
    $productData = @{
        name = "Fresh Organic Tomatoes"
        description = "Fresh organic tomatoes grown without pesticides. Rich in vitamins and perfect for cooking."
        category = "vegetables"
        price = 500
        unit = "kg"
        stock = 100
        lowStockThreshold = 10
        inStock = $true
        isActive = $true
        images = @(
            @{
                url = "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400"
                isPrimary = $true
            }
        )
    } | ConvertTo-Json -Depth 10

    $productResponse = Invoke-RestMethod -Uri "$API_BASE/vendor/products" `
        -Method Post `
        -Headers $headers `
        -Body $productData

    if ($productResponse.success) {
        Write-Host "  SUCCESS: Product added" -ForegroundColor Green
        Write-Host "  Product ID: $($productResponse.data.product._id)" -ForegroundColor Gray
        Write-Host "  Product Name: $($productResponse.data.product.name)" -ForegroundColor Gray
        Write-Host "  Price: NGN $($productResponse.data.product.price)/$($productResponse.data.product.unit)" -ForegroundColor Gray
    } else {
        Write-Host "  FAILED: $($productResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Verify Product List
Write-Host "STEP 5 - Retrieving product list..." -ForegroundColor Cyan
try {
    $productsResponse = Invoke-RestMethod -Uri "$API_BASE/vendor/products" `
        -Method Get `
        -Headers $headers

    if ($productsResponse.success) {
        Write-Host "  SUCCESS: Products retrieved" -ForegroundColor Green
        Write-Host "  Total Products: $($productsResponse.data.total)" -ForegroundColor Gray
        Write-Host "  Active Products: $($productsResponse.data.activeProducts)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Test Completed Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Test Credentials:" -ForegroundColor Yellow
Write-Host "  Email: $email" -ForegroundColor White
Write-Host "  Password: $password" -ForegroundColor White
Write-Host "  Auth Token: $($token.Substring(0, 30))..." -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open vendor-test-complete.html in browser" -ForegroundColor White
Write-Host "  2. Login with the email above" -ForegroundColor White
Write-Host "  3. View your products in vendor-products-page.html" -ForegroundColor White
Write-Host ""

# =====================================================
# AFRIMERCATO VENDOR API TEST SCRIPT
# =====================================================
# This script will:
# 1. Register a test vendor
# 2. Create vendor profile
# 3. Add sample products
# 4. Show you the auth token to use in the dashboard

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  AFRIMERCATO VENDOR API TEST" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:5000/api"

# Step 1: Register Vendor
Write-Host "[1/6] Registering test vendor..." -ForegroundColor Yellow

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/vendor/register" -Method Post -ContentType "application/json" -Body (@{
        fullName = "Green Farm Vendors"
        email = "vendor@greenfarm.com"
        password = "vendor123"
        phone = "08012345678"
        storeName = "Green Farm Store"
        storeDescription = "Fresh produce and groceries"
        category = "groceries"
        address = @{
            street = "123 Farm Road"
            city = "Lagos"
            state = "Lagos"
            country = "Nigeria"
            postalCode = "100001"
        }
    } | ConvertTo-Json -Depth 10)

    Write-Host "✓ Vendor registered successfully!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠ Vendor already exists, proceeding to login..." -ForegroundColor Yellow
    } else {
        Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Start-Sleep -Seconds 1

# Step 2: Login
Write-Host "[2/6] Logging in..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "vendor@greenfarm.com"
        password = "vendor123"
    } | ConvertTo-Json -Depth 10)

    $token = $loginResponse.data.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $token" -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Step 3: Create Vendor Profile
Write-Host "[3/6] Creating vendor profile..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$API_URL/vendor/profile" -Method Post -Headers $headers -Body (@{
        storeName = "Green Farm Store"
        description = "Fresh organic produce from our farm"
        category = "agriculture"
        address = @{
            street = "123 Farm Road"
            city = "Lagos"
            state = "Lagos"
            country = "Nigeria"
            postalCode = "100001"
        }
        phone = "08012345678"
        businessHours = @{
            monday = @{ open = "08:00"; close = "18:00"; isOpen = $true }
            tuesday = @{ open = "08:00"; close = "18:00"; isOpen = $true }
            wednesday = @{ open = "08:00"; close = "18:00"; isOpen = $true }
            thursday = @{ open = "08:00"; close = "18:00"; isOpen = $true }
            friday = @{ open = "08:00"; close = "18:00"; isOpen = $true }
            saturday = @{ open = "09:00"; close = "15:00"; isOpen = $true }
            sunday = @{ open = "00:00"; close = "00:00"; isOpen = $false }
        }
    } | ConvertTo-Json -Depth 10)

    Write-Host "✓ Vendor profile created!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠ Profile already exists, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "✗ Profile creation failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This might be because you need admin verification" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 1

# Step 4: Add Sample Products
Write-Host "[4/6] Adding sample products..." -ForegroundColor Yellow

$products = @(
    @{
        name = "Fresh Tomatoes"
        description = "Juicy red tomatoes, perfect for cooking"
        category = "vegetables"
        price = 500
        unit = "kg"
        stock = 100
        lowStockThreshold = 10
        tags = @("fresh", "organic", "local")
        specifications = @{
            origin = "Jos, Plateau State"
            brand = "Green Farm"
        }
        images = @(
            @{
                url = "https://via.placeholder.com/400x400/FF6347/FFFFFF?text=Tomatoes"
                isPrimary = $true
            }
        )
    },
    @{
        name = "Fresh Carrots"
        description = "Crunchy orange carrots, rich in vitamins"
        category = "vegetables"
        price = 800
        unit = "kg"
        stock = 75
        lowStockThreshold = 15
        tags = @("fresh", "organic", "healthy")
        specifications = @{
            origin = "Jos, Plateau State"
            brand = "Green Farm"
        }
        images = @(
            @{
                url = "https://via.placeholder.com/400x400/FFA500/FFFFFF?text=Carrots"
                isPrimary = $true
            }
        )
    },
    @{
        name = "Sweet Bananas"
        description = "Ripe yellow bananas, naturally sweet"
        category = "fruits"
        price = 300
        unit = "bunch"
        stock = 50
        lowStockThreshold = 10
        tags = @("fresh", "sweet", "energy")
        specifications = @{
            origin = "Ogun State"
            brand = "Green Farm"
        }
        images = @(
            @{
                url = "https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Bananas"
                isPrimary = $true
            }
        )
    }
)

$addedProducts = 0

foreach ($product in $products) {
    try {
        $productResponse = Invoke-RestMethod -Uri "$API_URL/vendor/products" -Method Post -Headers $headers -Body ($product | ConvertTo-Json -Depth 10)
        $addedProducts++
        Write-Host "   ✓ Added: $($product.name)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ Skipped: $($product.name) (might already exist)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "✓ Added $addedProducts products!" -ForegroundColor Green

Start-Sleep -Seconds 1

# Step 5: Get Dashboard Stats
Write-Host "[5/6] Fetching dashboard statistics..." -ForegroundColor Yellow

try {
    $dashboardResponse = Invoke-RestMethod -Uri "$API_URL/vendor/dashboard/stats" -Method Get -Headers $headers

    Write-Host "✓ Dashboard data loaded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host "  YOUR STORE STATISTICS" -ForegroundColor Cyan
    Write-Host "=====================================================" -ForegroundColor Cyan

    $stats = $dashboardResponse.data.overview

    Write-Host "   Total Revenue:    ₦$($stats.totalRevenue.ToString('N2'))" -ForegroundColor White
    Write-Host "   Monthly Revenue:  ₦$($stats.monthlyRevenue.ToString('N2'))" -ForegroundColor White
    Write-Host "   Total Products:   $($stats.totalProducts)" -ForegroundColor White
    Write-Host "   Active Products:  $($stats.activeProducts)" -ForegroundColor White
    Write-Host "   Total Orders:     $($stats.totalOrders)" -ForegroundColor White
    Write-Host "   Pending Orders:   $($stats.pendingOrders)" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host "✗ Failed to fetch dashboard: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Save Token to File
Write-Host "[6/6] Saving configuration..." -ForegroundColor Yellow

$config = @{
    token = $token
    email = "vendor@greenfarm.com"
    apiUrl = $API_URL
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$config | ConvertTo-Json | Out-File -FilePath "vendor-token.json" -Encoding UTF8

Write-Host "✓ Token saved to vendor-token.json" -ForegroundColor Green

# Final Instructions
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open the HTML dashboard file:" -ForegroundColor White
Write-Host "   c:\Users\Arbythecoder\Downloads\afrihub\vendor-dashboard-demo.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Click the 'Enter Auth Token Manually' button" -ForegroundColor White
Write-Host ""
Write-Host "3. Paste this token:" -ForegroundColor White
Write-Host "   $token" -ForegroundColor Green
Write-Host ""
Write-Host "4. View your live vendor dashboard!" -ForegroundColor White
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Setup complete! Backend is running on http://localhost:5000" -ForegroundColor Green
Write-Host ""

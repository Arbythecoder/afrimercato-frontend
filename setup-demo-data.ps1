# =====================================================
# AFRIMERCATO - SETUP DEMO DATA
# =====================================================

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  AFRIMERCATO DEMO DATA SETUP" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$API_URL = "http://localhost:5000/api"

# Login to get token
Write-Host "`n[1/3] Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body (ConvertTo-Json @{
    email = "vendor@test.com"
    password = "Vendor123"
})

$token = $loginResponse.data.token
Write-Host "Success! Token obtained." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create vendor profile
Write-Host "`n[2/3] Creating vendor profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$API_URL/vendor/profile" -Method Post -Headers $headers -Body (ConvertTo-Json -Depth 10 @{
        storeName = "Green Valley Farms"
        description = "Fresh organic produce directly from our farm to your table. We specialize in pesticide-free vegetables and fruits."
        category = "agriculture"
        address = @{
            street = "123 Farm Road, Ikeja"
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
    })
    Write-Host "Vendor profile created!" -ForegroundColor Green
} catch {
    Write-Host "Profile already exists or error occurred" -ForegroundColor Yellow
}

# Add products
Write-Host "`n[3/3] Adding products..." -ForegroundColor Yellow

$products = @(
    @{
        name = "Fresh Tomatoes"
        description = "Juicy red tomatoes, perfect for salads and cooking. Grown without pesticides."
        category = "vegetables"
        price = 500
        unit = "kg"
        stock = 150
        lowStockThreshold = 20
        tags = @("fresh", "organic", "local", "pesticide-free")
        specifications = @{
            origin = "Jos, Plateau State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Sweet Oranges"
        description = "Sweet and juicy oranges packed with vitamin C. Perfect for fresh juice."
        category = "fruits"
        price = 1200
        unit = "kg"
        stock = 100
        lowStockThreshold = 15
        tags = @("fresh", "citrus", "vitamin-c", "sweet")
        specifications = @{
            origin = "Ibadan, Oyo State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Fresh Carrots"
        description = "Crunchy orange carrots rich in beta-carotene. Great for cooking and snacking."
        category = "vegetables"
        price = 800
        unit = "kg"
        stock = 80
        lowStockThreshold = 15
        tags = @("fresh", "organic", "crunchy", "healthy")
        specifications = @{
            origin = "Jos, Plateau State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Ripe Bananas"
        description = "Naturally sweet bananas. Perfect for smoothies, desserts, or eating fresh."
        category = "fruits"
        price = 300
        unit = "bunch"
        stock = 120
        lowStockThreshold = 20
        tags = @("fresh", "sweet", "energy", "potassium")
        specifications = @{
            origin = "Ogun State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Fresh Spinach"
        description = "Dark green leafy spinach, rich in iron and vitamins. Perfect for soups and smoothies."
        category = "vegetables"
        price = 600
        unit = "kg"
        stock = 60
        lowStockThreshold = 10
        tags = @("fresh", "organic", "leafy", "iron-rich")
        specifications = @{
            origin = "Lagos State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Red Onions"
        description = "Fresh red onions with a mild sweet flavor. Essential for Nigerian cooking."
        category = "vegetables"
        price = 400
        unit = "kg"
        stock = 200
        lowStockThreshold = 30
        tags = @("fresh", "essential", "cooking", "flavorful")
        specifications = @{
            origin = "Kano State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Fresh Watermelon"
        description = "Sweet and refreshing watermelon. Perfect for hot Nigerian weather."
        category = "fruits"
        price = 2000
        unit = "piece"
        stock = 45
        lowStockThreshold = 10
        tags = @("fresh", "sweet", "hydrating", "refreshing")
        specifications = @{
            origin = "Borno State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1587049352846-4a222e784573?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Bell Peppers (Mixed)"
        description = "Colorful mix of red, yellow, and green bell peppers. Sweet and crunchy."
        category = "vegetables"
        price = 1500
        unit = "kg"
        stock = 70
        lowStockThreshold = 15
        tags = @("fresh", "colorful", "sweet", "crunchy")
        specifications = @{
            origin = "Jos, Plateau State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Fresh Pineapple"
        description = "Sweet and tangy pineapples. Rich in vitamin C and digestive enzymes."
        category = "fruits"
        price = 800
        unit = "piece"
        stock = 90
        lowStockThreshold = 15
        tags = @("fresh", "sweet", "tropical", "vitamin-c")
        specifications = @{
            origin = "Benin, Edo State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400"
            isPrimary = $true
        })
    },
    @{
        name = "Garden Eggs"
        description = "Fresh garden eggs (eggplant). Perfect for traditional Nigerian dishes."
        category = "vegetables"
        price = 700
        unit = "kg"
        stock = 55
        lowStockThreshold = 10
        tags = @("fresh", "traditional", "local", "versatile")
        specifications = @{
            origin = "Lagos State"
            brand = "Green Valley Farms"
        }
        images = @(@{
            url = "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=400"
            isPrimary = $true
        })
    }
)

$addedCount = 0
foreach ($product in $products) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/vendor/products" -Method Post -Headers $headers -Body (ConvertTo-Json -Depth 10 $product)
        Write-Host "  Added: $($product.name) - Price: N$($product.price)/$($product.unit)" -ForegroundColor Green
        $addedCount++
        Start-Sleep -Milliseconds 300
    } catch {
        Write-Host "  Skipped: $($product.name) (may already exist)" -ForegroundColor Yellow
    }
}

Write-Host "`nSuccessfully added $addedCount products!" -ForegroundColor Green

# Get final dashboard stats
Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  YOUR DASHBOARD STATISTICS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$dashboardStats = Invoke-RestMethod -Uri "$API_URL/vendor/dashboard/stats" -Method Get -Headers $headers
$stats = $dashboardStats.data.overview

Write-Host "`n  Total Products:   $($stats.totalProducts)" -ForegroundColor White
Write-Host "  Active Products:  $($stats.activeProducts)" -ForegroundColor White
Write-Host "  Total Stock:      $($stats.totalProducts * 90) units (approx)" -ForegroundColor White
Write-Host "  Total Revenue:    N$($stats.totalRevenue)" -ForegroundColor White
Write-Host "  Total Orders:     $($stats.totalOrders)" -ForegroundColor White
Write-Host "  Pending Orders:   $($stats.pendingOrders)" -ForegroundColor White

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  DASHBOARD ACCESS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "`nYour Auth Token:" -ForegroundColor Yellow
Write-Host $token -ForegroundColor Green
Write-Host "`nDashboard URL (open in browser):" -ForegroundColor Yellow
Write-Host "c:\Users\Arbythecoder\Downloads\afrihub\vendor-dashboard-demo.html" -ForegroundColor Green
Write-Host "`nClick 'Enter Auth Token Manually' and paste the token above." -ForegroundColor White
Write-Host "`n=====================================================" -ForegroundColor Cyan

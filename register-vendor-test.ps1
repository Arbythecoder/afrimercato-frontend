# Register a test vendor using PowerShell's Invoke-RestMethod (better than curl on Windows)

$body = @{
    fullName = "Test Vendor B"
    email = "vendorB@test.com"
    password = "Test123!"
    phone = "+44 7700 900123"
    category = "Groceries"
    address = @{
        street = "123 High Street"
        city = "London"
        postcode = "SW1A 1AA"
        country = "UK"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Registering vendor..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/vendor/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "`n✅ Registration successful!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`n❌ Registration failed:" -ForegroundColor Red
    $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd()
    }
}

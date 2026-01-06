# =====================================================
# VERIFY VENDOR IN DATABASE
# =====================================================
# This script updates the MongoDB database directly
# to set the vendor as verified so they can access
# all vendor routes

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  VENDOR VERIFICATION SCRIPT" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# MongoDB connection string from .env
$mongoUri = "mongodb://localhost:27017/afrimercato"

Write-Host "`nConnecting to MongoDB..." -ForegroundColor Yellow

# Create a MongoDB update script
$mongoScript = @"
use afrimercato
db.vendors.updateMany({}, { `$set: { isVerified: true, isActive: true } })
print('Updated vendors:')
db.vendors.find({}).forEach(function(vendor) {
    print('  - ' + vendor.storeName + ' (Verified: ' + vendor.isVerified + ', Active: ' + vendor.isActive + ')')
})
"@

# Save script to temp file
$mongoScript | Out-File -FilePath "temp-mongo-script.js" -Encoding UTF8

# Run MongoDB script
Write-Host "Setting all vendors as verified and active..." -ForegroundColor Yellow
mongo $mongoUri temp-mongo-script.js

# Clean up
Remove-Item "temp-mongo-script.js" -ErrorAction SilentlyContinue

Write-Host "`n=====================================================" -ForegroundColor Green
Write-Host "  VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "`nAll vendors are now verified and can access the dashboard." -ForegroundColor White

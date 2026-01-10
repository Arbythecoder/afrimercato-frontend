# Update Fly.io MongoDB credentials
# Run this script with: powershell -ExecutionPolicy Bypass -File update-fly-secrets.ps1

Write-Host "🔧 Updating Fly.io Secrets for MongoDB Connection" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$MONGODB_URI = 'mongodb+srv://africa:Oluwanifemi123.@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub'

Write-Host "Setting MONGODB_URI..." -ForegroundColor Yellow

# Update Fly.io secret
fly secrets set MONGODB_URI="$MONGODB_URI" -a afrimercato-backend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ MongoDB credentials updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Deploy the app: fly deploy" -ForegroundColor White
    Write-Host "2. Check logs: fly logs" -ForegroundColor White
    Write-Host "3. Test the API: curl https://afrimercato-backend.fly.dev/api/health" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to update secrets!" -ForegroundColor Red
    Write-Host "Make sure you are logged in to Fly.io: fly auth login" -ForegroundColor Yellow
}

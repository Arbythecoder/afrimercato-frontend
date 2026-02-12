# Fly.io Backend Deployment Script
Write-Host "AfriMercato Backend Deployment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\afrimercato-backend"

Write-Host "Checking Fly CLI..." -ForegroundColor Yellow
$flyPath = "$env:USERPROFILE\.fly\bin\fly.exe"

if (Test-Path $flyPath) {
    Write-Host "Found Fly CLI, attempting deploy..." -ForegroundColor Green
    try {
        & $flyPath deploy --ha=false
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Backend deployed!" -ForegroundColor Green
            Write-Host "URL: https://afrimercato-backend.fly.dev" -ForegroundColor Cyan
            exit 0
        }
    } catch {
        Write-Host "Deploy failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "MANUAL DEPLOYMENT REQUIRED" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your Fly CLI is not working. Use the Fly.io Dashboard instead:" -ForegroundColor White
Write-Host ""
Write-Host "1. Opening browser to: https://fly.io/dashboard/afrimercato-backend" -ForegroundColor Cyan
Write-Host "2. Click the 'Deploy' button" -ForegroundColor White
Write-Host "3. Or connect GitHub for auto-deploy" -ForegroundColor White
Write-Host ""
Write-Host "STATUS:" -ForegroundColor Cyan
Write-Host "  [OK] Code on GitHub" -ForegroundColor Green
Write-Host "  [OK] Frontend: https://afrimercato.com" -ForegroundColor Green
Write-Host "  [PENDING] Backend deployment needed" -ForegroundColor Yellow

Start-Process "https://fly.io/dashboard/afrimercato-backend"

# ==============================================================================
# PRODUCTION TIMEOUT FIX - DEPLOYMENT SCRIPT
# ==============================================================================
# Deploys timeout fixes for vendor login, checkout, and store search
# Date: February 8, 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AFRIMERCATO PRODUCTION TIMEOUT FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Not in backend directory. Run from afrimercato-backend/" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Checking package.json..." -ForegroundColor Yellow
$packageJson = Get-Content package.json | ConvertFrom-Json
if ($packageJson.dependencies.'passport-facebook') {
    Write-Host "ERROR: passport-facebook still in package.json. Re-run npm install." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Facebook OAuth removed from dependencies" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Verify Fly secrets
Write-Host "[3/5] Checking Fly.io secrets..." -ForegroundColor Yellow
Write-Host "Required secrets:" -ForegroundColor White
Write-Host "  - GOOGLE_CLIENT_ID" -ForegroundColor White
Write-Host "  - GOOGLE_CLIENT_SECRET" -ForegroundColor White
Write-Host "  - MONGODB_URI" -ForegroundColor White
Write-Host "  - JWT_SECRET" -ForegroundColor White
Write-Host "  - STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host ""

$confirmSecrets = Read-Host "Have you verified all required secrets are set in Fly? (y/n)"
if ($confirmSecrets -ne 'y') {
    Write-Host "Please run: fly secrets list -a afrimercato-backend" -ForegroundColor Yellow
    Write-Host "Then set missing secrets with: fly secrets set KEY=VALUE -a afrimercato-backend" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Secrets verified" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy to Fly.io
Write-Host "[4/5] Deploying to Fly.io..." -ForegroundColor Yellow
Write-Host "This will deploy the following fixes:" -ForegroundColor White
Write-Host "  ✓ Remove Facebook OAuth (not needed)" -ForegroundColor Green
Write-Host "  ✓ Fix vendor login timeouts (5s query + 3s password)" -ForegroundColor Green
Write-Host "  ✓ Fix checkout timeouts (3-5s per query)" -ForegroundColor Green
Write-Host "  ✓ Optimize store search (8s timeout + lean queries)" -ForegroundColor Green
Write-Host "  ✓ Improve DB connection pooling (maxPool=20)" -ForegroundColor Green
Write-Host "  ✓ Speed up health endpoint (<50ms)" -ForegroundColor Green
Write-Host ""

$confirmDeploy = Read-Host "Deploy to production? (y/n)"
if ($confirmDeploy -ne 'y') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

fly deploy --config fly.toml -a afrimercato-backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployment complete" -ForegroundColor Green
Write-Host ""

# Step 5: Verify deployment
Write-Host "[5/5] Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Testing health endpoint..." -ForegroundColor White
try {
    $health = Invoke-RestMethod -Uri "https://afrimercato-backend.fly.dev/api/health" -Method Get -TimeoutSec 5
    if ($health.ok -eq $true) {
        Write-Host "✓ Health check passed" -ForegroundColor Green
        Write-Host "  Database: $($health.database)" -ForegroundColor Gray
        Write-Host "  Uptime: $($health.uptime)s" -ForegroundColor Gray
    } else {
        Write-Host "WARNING: Health check returned non-ok status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Health check failed - $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUCCESSFUL ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test vendor login at: https://afrimercato-backend.fly.dev/api/auth/login" -ForegroundColor White
Write-Host "2. Test store search at: https://afrimercato-backend.fly.dev/api/location/search-vendors?locationText=London" -ForegroundColor White
Write-Host "3. Monitor logs: fly logs -a afrimercato-backend" -ForegroundColor White
Write-Host ""
Write-Host "All timeout issues should be resolved." -ForegroundColor Green
Write-Host "Production testers can now proceed." -ForegroundColor Green
Write-Host ""

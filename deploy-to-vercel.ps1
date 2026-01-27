# Deploy Afrimercato to Vercel
# This script helps you deploy both frontend and backend

Write-Host "🚀 Afrimercato Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking for Vercel CLI..." -ForegroundColor Yellow
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI already installed" -ForegroundColor Green
}
Write-Host ""

# Step 1: Deploy Backend (optional)
Write-Host "Step 1: Backend Deployment" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan
$deployBackend = Read-Host "Do you want to redeploy the backend to Fly.io? (y/n)"

if ($deployBackend -eq "y" -or $deployBackend -eq "Y") {
    Write-Host "Deploying backend..." -ForegroundColor Yellow
    
    # Check if fly CLI is installed
    if (!(Get-Command fly -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Fly CLI not found. Please install it from: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Red
        Write-Host "After installing, run this script again." -ForegroundColor Yellow
        exit 1
    }
    
    Set-Location -Path "afrimercato-backend"
    fly deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
    
    Set-Location -Path ".."
} else {
    Write-Host "⏭️  Skipping backend deployment" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Deploy Frontend to Vercel
Write-Host "Step 2: Frontend Deployment" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan
$deployFrontend = Read-Host "Deploy frontend to Vercel? (y/n)"

if ($deployFrontend -eq "y" -or $deployFrontend -eq "Y") {
    Write-Host "Deploying frontend to Vercel..." -ForegroundColor Yellow
    
    Set-Location -Path "afrimercato-frontend"
    
    # Check if .env file exists
    if (!(Test-Path ".env")) {
        Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "✅ Created .env file. Please verify the settings." -ForegroundColor Green
        }
    }
    
    # Ask for deployment type
    Write-Host ""
    Write-Host "Choose deployment type:" -ForegroundColor Cyan
    Write-Host "1. Preview (test deployment)" -ForegroundColor White
    Write-Host "2. Production" -ForegroundColor White
    $deployType = Read-Host "Enter choice (1 or 2)"
    
    if ($deployType -eq "2") {
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Yellow
        vercel --prod
    } else {
        Write-Host "Deploying preview..." -ForegroundColor Yellow
        vercel
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Deployment Complete!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Copy the deployment URL from above" -ForegroundColor White
        Write-Host "2. Add environment variables in Vercel dashboard if needed" -ForegroundColor White
        Write-Host "3. Test your application!" -ForegroundColor White
    } else {
        Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
    
    Set-Location -Path ".."
} else {
    Write-Host "⏭️  Skipping frontend deployment" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Script completed!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

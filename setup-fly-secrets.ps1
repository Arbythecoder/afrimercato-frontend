# Setup Fly.io Secrets for Afrimercato Backend
# Run this script from the project root directory

Write-Host "🚀 Setting up Fly.io secrets for Afrimercato..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "C:\Users\Arbythecoder\Desktop\afrihub\afrimercato-backend"

Write-Host "📍 Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Generate strong secrets
Write-Host "🔐 Generating JWT secrets..." -ForegroundColor Green
$jwtSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
$refreshSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
$encryptionSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Write-Host "✅ Secrets generated" -ForegroundColor Green
Write-Host ""

# Set JWT secrets
Write-Host "📤 Setting JWT_SECRET..." -ForegroundColor Cyan
fly secrets set JWT_SECRET="$jwtSecret"

Write-Host "📤 Setting JWT_REFRESH_SECRET..." -ForegroundColor Cyan
fly secrets set JWT_REFRESH_SECRET="$refreshSecret"

Write-Host "📤 Setting ENCRYPTION_SECRET..." -ForegroundColor Cyan
fly secrets set ENCRYPTION_SECRET="$encryptionSecret"

# Set JWT expiration
Write-Host "📤 Setting JWT expiration..." -ForegroundColor Cyan
fly secrets set JWT_EXPIRE="7d"
fly secrets set JWT_REFRESH_EXPIRE="30d"

# Set CORS URLs (update after frontend deployment)
Write-Host "📤 Setting CORS URLs..." -ForegroundColor Cyan
fly secrets set CLIENT_URL="https://afrimercato.pages.dev"
fly secrets set FRONTEND_URL="https://afrimercato.pages.dev"

# Set placeholder payment keys
Write-Host "📤 Setting payment keys (placeholders)..." -ForegroundColor Cyan
fly secrets set STRIPE_SECRET_KEY="sk_test_placeholder"
fly secrets set STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"

Write-Host ""
Write-Host "✅ All secrets configured!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Listing all secrets:" -ForegroundColor Yellow
fly secrets list

Write-Host ""
Write-Host "⚠️  IMPORTANT: Update these URLs after deploying frontend:" -ForegroundColor Yellow
Write-Host "   fly secrets set CLIENT_URL='https://your-actual-frontend-url.pages.dev'" -ForegroundColor White
Write-Host "   fly secrets set FRONTEND_URL='https://your-actual-frontend-url.pages.dev'" -ForegroundColor White
Write-Host ""
Write-Host "💳 IMPORTANT: Add real Stripe keys before accepting payments:" -ForegroundColor Yellow
Write-Host "   fly secrets set STRIPE_SECRET_KEY='sk_live_your_real_key'" -ForegroundColor White
Write-Host "   fly secrets set STRIPE_PUBLISHABLE_KEY='pk_live_your_real_key'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Setup complete! Your backend will restart automatically." -ForegroundColor Green

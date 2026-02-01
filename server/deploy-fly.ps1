# Fly.io Deployment Helper Script
# This script uses the full path to flyctl.exe to avoid PATH issues

$flyctl = "C:\Users\Admin\.fly\bin\flyctl.exe"

Write-Host "🚀 SideLedger AI - Fly.io Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl exists
if (!(Test-Path $flyctl)) {
    Write-Host "❌ Flyctl not found. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Flyctl found!" -ForegroundColor Green
Write-Host ""

# Step 1: Launch app (if not already launched)
Write-Host "📦 Launching Fly.io app..." -ForegroundColor Yellow
& $flyctl launch --no-deploy --name siteledger-ai-api --region sin --org personal

# Step 2: Set secrets
Write-Host ""
Write-Host "🔐 Setting environment variables..." -ForegroundColor Yellow

& $flyctl secrets set MONGO_URI="mongodb+srv://adnanmkhan2003_db_user:HIJF8pwZbKi1sR61@cluster0.vs0qfa1.mongodb.net/sideledger-ai?appName=Cluster0"
& $flyctl secrets set JWT_SECRET="supersecretkey123"
& $flyctl secrets set GEMINI_API_KEY="AIzaSyBfIG9iuLc1XbaJnslTzecelaeQowCG3K0"

# Step 3: Deploy
Write-Host ""
Write-Host "🚀 Deploying to Fly.io..." -ForegroundColor Yellow
& $flyctl deploy

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Your API is live at: https://siteledger-ai-api.fly.dev" -ForegroundColor Cyan

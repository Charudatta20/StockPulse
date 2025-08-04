# StockPulse Git Setup for PowerShell
Write-Host "StockPulse Git Setup for PowerShell" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the StockPulse directory." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Initialize Git repository..." -ForegroundColor Yellow
git init

Write-Host ""
Write-Host "Step 2: Add all files to Git..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Step 3: Make initial commit..." -ForegroundColor Yellow
git commit -m "Initial StockPulse deployment with database setup"

Write-Host ""
Write-Host "Git setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub.com and create a new repository named 'stockpulse'" -ForegroundColor White
Write-Host "2. Run these commands (replace YOUR_USERNAME with your GitHub username):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/stockpulse.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Then deploy to Render using the guide in GIT_DEPLOYMENT_GUIDE.md" -ForegroundColor White 
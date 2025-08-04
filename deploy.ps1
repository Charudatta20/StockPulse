# StockPulse Deployment Script
# This script helps you deploy the StockPulse application

Write-Host "StockPulse Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Node.js is available
if (Test-Path ".\node-portable\node-v20.11.0-win-x64\node.exe") {
    Write-Host "Node.js found in portable directory" -ForegroundColor Green
    $env:PATH = ".\node-portable\node-v20.11.0-win-x64;$env:PATH"
} else {
    Write-Host "Node.js not found. Please ensure node-portable is extracted." -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
try {
    .\node-portable\node-v20.11.0-win-x64\npm.cmd run build
    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "Environment file found" -ForegroundColor Green
} else {
    Write-Host "Warning: No .env file found. You'll need to set environment variables in your deployment platform." -ForegroundColor Yellow
    Write-Host "Required variables:" -ForegroundColor Cyan
    Write-Host "  - DATABASE_URL (PostgreSQL connection string)" -ForegroundColor Cyan
    Write-Host "  - NODE_ENV=production" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Deployment Options:" -ForegroundColor Green
Write-Host "1. Railway (Recommended): railway up" -ForegroundColor Cyan
Write-Host "2. Render: Connect GitHub repo and deploy" -ForegroundColor Cyan
Write-Host "3. Vercel: vercel --prod" -ForegroundColor Cyan
Write-Host "4. Heroku: git push heroku main" -ForegroundColor Cyan
Write-Host ""
Write-Host "See DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow 
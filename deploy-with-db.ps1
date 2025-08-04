# StockPulse Deployment Script with Database
Write-Host "StockPulse Deployment with Database Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "postgresql://neondb_owner:npg_C6Rt2PJcoQdu@ep-cold-silence-aejg1u11-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$env:NODE_ENV = "production"

# Check if Node.js is available
if (Test-Path ".\node-portable\node-v20.11.0-win-x64\node.exe") {
    Write-Host "Node.js found in portable directory" -ForegroundColor Green
    $env:PATH = ".\node-portable\node-v20.11.0-win-x64;$env:PATH"
} else {
    Write-Host "Node.js not found. Please ensure node-portable is extracted." -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
try {
    .\node-portable\node-v20.11.0-win-x64\npm.cmd run db:push
    Write-Host "Database migrations completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Database migration failed: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host ""
Write-Host "Deployment Preparation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your database is configured and ready!" -ForegroundColor Green
Write-Host "Database URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps for Deployment:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Ready for deployment'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy to Render:" -ForegroundColor White
Write-Host "   - Go to render.com" -ForegroundColor Gray
Write-Host "   - Connect your GitHub repo" -ForegroundColor Gray
Write-Host "   - Set environment variables:" -ForegroundColor Gray
Write-Host "     DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Gray
Write-Host "     NODE_ENV: production" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Your app will be live at: https://your-app-name.onrender.com" -ForegroundColor Green 
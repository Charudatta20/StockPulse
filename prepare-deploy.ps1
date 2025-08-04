# Prepare StockPulse for Deployment
Write-Host "Preparing StockPulse for deployment..." -ForegroundColor Green

# Check if we're in a git repository
if (Test-Path ".git") {
    Write-Host "Git repository found" -ForegroundColor Green
} else {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for deployment"
}

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
$env:PATH = ".\node-portable\node-v20.11.0-win-x64;$env:PATH"
.\node-portable\node-v20.11.0-win-x64\npm.cmd run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment Preparation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/yourusername/your-repo.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set up database at neon.tech" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy to Render:" -ForegroundColor White
Write-Host "   - Go to render.com" -ForegroundColor Gray
Write-Host "   - Connect your GitHub repo" -ForegroundColor Gray
Write-Host "   - Set environment variables" -ForegroundColor Gray
Write-Host "   - Deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "See RENDER_DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow 
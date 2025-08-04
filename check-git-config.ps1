# Check Git Configuration
Write-Host "Git Configuration Check" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Current Git Configuration:" -ForegroundColor Cyan

# Check current user.name
try {
    $userName = git config --global user.name
    if ($userName) {
        Write-Host "User Name: $userName" -ForegroundColor Green
    } else {
        Write-Host "User Name: NOT SET" -ForegroundColor Red
    }
} catch {
    Write-Host "User Name: NOT SET" -ForegroundColor Red
}

# Check current user.email
try {
    $userEmail = git config --global user.email
    if ($userEmail) {
        Write-Host "User Email: $userEmail" -ForegroundColor Green
    } else {
        Write-Host "User Email: NOT SET" -ForegroundColor Red
    }
} catch {
    Write-Host "User Email: NOT SET" -ForegroundColor Red
}

Write-Host ""
Write-Host "If Git configuration is not set, run these commands:" -ForegroundColor Yellow
Write-Host "git config --global user.name 'Your Real Name'" -ForegroundColor Gray
Write-Host "git config --global user.email 'your.email@example.com'" -ForegroundColor Gray
Write-Host ""
Write-Host "Replace 'Your Real Name' with your actual name" -ForegroundColor White
Write-Host "Replace 'your.email@example.com' with your GitHub email" -ForegroundColor White 
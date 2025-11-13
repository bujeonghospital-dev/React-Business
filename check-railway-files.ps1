# Railway Deployment Checker
# ตรวจสอบว่าไฟล์ที่จำเป็นสำหรับ Railway deployment ครบหรือไม่

Write-Host "🔍 Railway Deployment Checker" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$pythonApiPath = "python-api"
$requiredFiles = @(
    "app.py",
    "requirements.txt",
    "Procfile",
    "railway.json",
    "runtime.txt",
    ".env.example"
)

$allFilesExist = $true
$missingFiles = @()

# Check if python-api directory exists
if (!(Test-Path $pythonApiPath)) {
    Write-Host "❌ Directory 'python-api' not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Checking directory: $pythonApiPath" -ForegroundColor White
Write-Host ""

# Check each required file
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $pythonApiPath $file
    
    if (Test-Path $filePath) {
        Write-Host "✅ $file" -ForegroundColor Green
        
        # Show file size
        $fileSize = (Get-Item $filePath).Length
        if ($fileSize -eq 0) {
            Write-Host "   ⚠️  File is empty!" -ForegroundColor Yellow
        } else {
            Write-Host "   Size: $fileSize bytes" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $file - MISSING" -ForegroundColor Red
        $allFilesExist = $false
        $missingFiles += $file
    }
    Write-Host ""
}

# Check app.py for /health endpoint
Write-Host "🔍 Checking app.py for /health endpoint..." -ForegroundColor Cyan
$appPyPath = Join-Path $pythonApiPath "app.py"
if (Test-Path $appPyPath) {
    $appContent = Get-Content $appPyPath -Raw
    if ($appContent -match "/health") {
        Write-Host "✅ /health endpoint found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  /health endpoint not found - recommended for Railway health checks" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ app.py not found" -ForegroundColor Red
}
Write-Host ""

# Check requirements.txt for essential packages
Write-Host "🔍 Checking requirements.txt for essential packages..." -ForegroundColor Cyan
$reqPath = Join-Path $pythonApiPath "requirements.txt"
if (Test-Path $reqPath) {
    $reqContent = Get-Content $reqPath -Raw
    $essentialPackages = @("flask", "gunicorn", "flask-cors")
    
    foreach ($package in $essentialPackages) {
        if ($reqContent -match $package) {
            Write-Host "✅ $package found" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $package not found" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ requirements.txt not found" -ForegroundColor Red
}
Write-Host ""

# Check .env file (optional but recommended for local testing)
Write-Host "🔍 Checking for .env file (local development)..." -ForegroundColor Cyan
$envPath = Join-Path $pythonApiPath ".env"
if (Test-Path $envPath) {
    Write-Host "✅ .env file exists (for local testing)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env file not found (optional - use .env.example as template)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($allFilesExist) {
    Write-Host "✅ All required files are present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Your project is ready to deploy to Railway!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Read: RAILWAY_QUICK_START.md" -ForegroundColor White
    Write-Host "2. Push to GitHub: git push origin main" -ForegroundColor White
    Write-Host "3. Deploy to Railway: https://railway.app/" -ForegroundColor White
    Write-Host "4. Set Root Directory to: python-api" -ForegroundColor White
    Write-Host "5. Add Environment Variables from .env.example" -ForegroundColor White
} else {
    Write-Host "❌ Missing files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please create the missing files before deploying." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start: RAILWAY_QUICK_START.md" -ForegroundColor White
Write-Host "   - Full Guide: RAILWAY_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "   - Files Summary: python-api/RAILWAY_FILES_SUMMARY.md" -ForegroundColor White
Write-Host ""

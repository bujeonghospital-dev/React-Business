# ========================================
# Build and Test Script
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Contact Inquiry Page - Build & Test  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean cache
Write-Host "[Step 1/5] Cleaning cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  ✓ Removed .next folder" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "  ✓ Removed node_modules/.cache" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check environment variables
Write-Host "[Step 2/5] Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY") {
        Write-Host "  ✓ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY found" -ForegroundColor Green
    } else {
        Write-Host "  ✗ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found!" -ForegroundColor Red
        Write-Host "    Please add it to .env.local" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  ✗ .env.local not found!" -ForegroundColor Red
    Write-Host "    Please create .env.local with NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 3: Check required files
Write-Host "[Step 3/5] Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "src/app/contact-inquiry/page.tsx",
    "src/components/GoogleMap.tsx",
    "src/types/google-maps.d.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "Some required files are missing!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Build
Write-Host "[Step 4/5] Building project..." -ForegroundColor Yellow
Write-Host "  Running: npm run build" -ForegroundColor Gray
Write-Host ""

$buildOutput = npm run build 2>&1
$buildSuccess = $LASTEXITCODE -eq 0

Write-Host $buildOutput

if ($buildSuccess) {
    Write-Host ""
    Write-Host "  ✓ Build successful!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ✗ Build failed!" -ForegroundColor Red
    Write-Host "  Please check the errors above and fix them." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 5: Summary
Write-Host "[Step 5/5] Build Summary" -ForegroundColor Yellow
Write-Host "  ✓ Cache cleaned" -ForegroundColor Green
Write-Host "  ✓ Environment variables configured" -ForegroundColor Green
Write-Host "  ✓ All required files present" -ForegroundColor Green
Write-Host "  ✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test locally:" -ForegroundColor Yellow
Write-Host "   npm run start" -ForegroundColor White
Write-Host "   Then visit: http://localhost:3000/contact-inquiry" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or test in dev mode:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   Then visit: http://localhost:3000/contact-inquiry" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If everything works, deploy:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Fix: 404 error on contact-inquiry page'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Troubleshooting" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see errors:" -ForegroundColor Yellow
Write-Host "  • Check Console (F12) for errors" -ForegroundColor Gray
Write-Host "  • Verify API Key is correct" -ForegroundColor Gray
Write-Host "  • Check docs/FIX_404_CONTACT_INQUIRY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor Green
Write-Host ""

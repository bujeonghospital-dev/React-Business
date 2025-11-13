# Add PYTHON_API_URL to Vercel Environment Variables
# Run this script to add the environment variable to Vercel

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Add PYTHON_API_URL to Vercel" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "https://believable-ambition-production.up.railway.app"

Write-Host "Environment Variable to add:" -ForegroundColor Yellow
Write-Host "  Name:  PYTHON_API_URL" -ForegroundColor White
Write-Host "  Value: $apiUrl" -ForegroundColor White
Write-Host ""

Write-Host "Option 1: Using Vercel Dashboard (Recommended)" -ForegroundColor Green
Write-Host "1. Go to: https://vercel.com/thanakron-hongthongs-projects/react-business/settings/environment-variables"
Write-Host "2. Click 'Add New' button"
Write-Host "3. Enter:"
Write-Host "   - Key: PYTHON_API_URL"
Write-Host "   - Value: $apiUrl"
Write-Host "4. Select environments: Production, Preview, Development"
Write-Host "5. Click 'Save'"
Write-Host ""

Write-Host "Option 2: Using Vercel CLI" -ForegroundColor Green
Write-Host "Run these commands:" -ForegroundColor White
Write-Host ""
Write-Host "  vercel env add PYTHON_API_URL production" -ForegroundColor Cyan
Write-Host "  # When prompted, paste: $apiUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "  vercel env add PYTHON_API_URL preview" -ForegroundColor Cyan
Write-Host "  # When prompted, paste: $apiUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "  vercel env add PYTHON_API_URL development" -ForegroundColor Cyan
Write-Host "  # When prompted, paste: $apiUrl" -ForegroundColor Gray
Write-Host ""

Write-Host "After adding the environment variable:" -ForegroundColor Yellow
Write-Host "1. Go to: https://vercel.com/thanakron-hongthongs-projects/react-business/deployments"
Write-Host "2. Click on the latest deployment"
Write-Host "3. Click '...' (three dots) -> 'Redeploy'"
Write-Host "4. Select 'Use existing Build Cache' -> Click 'Redeploy'"
Write-Host ""

Write-Host "Press any key to open Vercel Dashboard..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://vercel.com/thanakron-hongthongs-projects/react-business/settings/environment-variables"

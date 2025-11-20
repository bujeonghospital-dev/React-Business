# 📱 Mobile Testing Commands

Write-Host "🧪 Starting Mobile Responsive Testing..." -ForegroundColor Cyan
Write-Host ""

# Check if development server is running
$devServerRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" }

if (-not $devServerRunning) {
    Write-Host "⚠️  Development server is not running!" -ForegroundColor Yellow
    Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Write-Host "✅ Development server starting..." -ForegroundColor Green
    Write-Host "⏳ Waiting 5 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
} else {
    Write-Host "✅ Development server is already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌐 Available Testing URLs:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📱 Local:           http://localhost:3000/facebook-ads-manager" -ForegroundColor White
Write-Host "🌍 Network:         http://$(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' } | Select-Object -First 1 -ExpandProperty IPAddress):3000/facebook-ads-manager" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "📱 Testing Modes:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. Chrome DevTools Device Emulation (F12 > Toggle Device Toolbar)" -ForegroundColor White
Write-Host "2. Firefox Responsive Design Mode (Ctrl+Shift+M)" -ForegroundColor White
Write-Host "3. Real Device Testing (Scan QR Code or enter Network URL)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Quick Test Device Presets:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "iPhone SE          375x667   (Small Mobile)" -ForegroundColor White
Write-Host "iPhone 12/13       390x844   (Standard Mobile)" -ForegroundColor White
Write-Host "iPhone 14 Pro Max  430x932   (Large Mobile)" -ForegroundColor White
Write-Host "iPad Mini          768x1024  (Small Tablet)" -ForegroundColor White
Write-Host "iPad Pro 11        834x1194  (Tablet)" -ForegroundColor White
Write-Host "Galaxy S20         360x800   (Android Mobile)" -ForegroundColor White
Write-Host "Galaxy Tab S7      800x1280  (Android Tablet)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Testing Features to Check:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✓ Date Range Dropdown on Mobile" -ForegroundColor Green
Write-Host "✓ Performance Cards (Single Column)" -ForegroundColor Green
Write-Host "✓ TOP 10 Ads Table (Horizontal Scroll)" -ForegroundColor Green
Write-Host "✓ Report Table (Horizontal Scroll)" -ForegroundColor Green
Write-Host "✓ Modal Open/Close" -ForegroundColor Green
Write-Host "✓ Touch Interactions" -ForegroundColor Green
Write-Host "✓ Portrait/Landscape Rotation" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Generate QR Code for mobile testing (requires qrcode-terminal)
$networkIP = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' } | Select-Object -First 1 -ExpandProperty IPAddress
$testUrl = "http://${networkIP}:3000/facebook-ads-manager"

Write-Host "📱 Scan QR Code for Mobile Testing:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "URL: $testUrl" -ForegroundColor Yellow

# Try to generate QR code if qrcode-terminal is installed
try {
    npx qrcode-terminal "$testUrl" 2>$null
} catch {
    Write-Host "⚠️  QR Code generation requires 'qrcode-terminal'" -ForegroundColor Yellow
    Write-Host "Install: npm install -g qrcode-terminal" -ForegroundColor Gray
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. Open Chrome DevTools (F12)" -ForegroundColor White
Write-Host "2. Toggle Device Toolbar (Ctrl+Shift+M)" -ForegroundColor White
Write-Host "3. Select a device from the dropdown" -ForegroundColor White
Write-Host "4. Navigate to: http://localhost:3000/facebook-ads-manager" -ForegroundColor White
Write-Host "5. Test all features from the checklist" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Performance Testing Commands:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Chrome Lighthouse:  Ctrl+Shift+I > Lighthouse Tab" -ForegroundColor White
Write-Host "PageSpeed Insights: https://pagespeed.web.dev/" -ForegroundColor White
Write-Host "WebPageTest:        https://www.webpagetest.org/" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Testing environment ready!" -ForegroundColor Green
Write-Host "📝 Follow MOBILE_TESTING_CHECKLIST.md for comprehensive testing" -ForegroundColor Yellow
Write-Host ""

# Open browser automatically
$openBrowser = Read-Host "Open browser automatically? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "http://localhost:3000/facebook-ads-manager"
    Write-Host "🌐 Browser opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

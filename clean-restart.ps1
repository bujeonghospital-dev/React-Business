# Clean all caches and restart development server
Write-Host "🧹 Cleaning all caches..." -ForegroundColor Yellow
Remove-Item -Path ".next",".vercel","node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Caches cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Starting development server..." -ForegroundColor Cyan
Write-Host "📍 Contact Dashboard will be available at:" -ForegroundColor Magenta
Write-Host "   http://localhost:3000/contact-dashboard" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Don't forget to hard refresh your browser (Ctrl+Shift+R)" -ForegroundColor Yellow
Write-Host ""

npm run dev

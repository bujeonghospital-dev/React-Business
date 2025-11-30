# deploy.ps1 - Script สำหรับ deploy code ใหม่
# ใช้: .\deploy.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BJH Bangkok - Deploy Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# เข้า directory
Set-Location "c:\Users\Administrator\Documents\GitHub\React-Business"

# 1. Pull code ใหม่ (ถ้าใช้ git)
Write-Host "📥 Step 1: Pulling latest code..." -ForegroundColor Yellow
git pull origin main

# 2. Install dependencies (ถ้ามี package ใหม่)
Write-Host ""
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

# 3. Build
Write-Host ""
Write-Host "🔨 Step 3: Building Next.js..." -ForegroundColor Yellow
npm run build

# 4. Restart PM2 (zero-downtime)
Write-Host ""
Write-Host "🔄 Step 4: Restarting PM2..." -ForegroundColor Yellow
pm2 restart bjh-bangkok

# 5. แสดงสถานะ
Write-Host ""
Write-Host "✅ Deploy completed!" -ForegroundColor Green
Write-Host ""
pm2 status

# 6. ทดสอบ
Write-Host ""
Write-Host "🧪 Testing..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "https://app.bjhbangkok.com" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Website is UP - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Website is DOWN - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

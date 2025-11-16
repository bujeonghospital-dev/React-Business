# PowerShell Script สำหรับเตรียม Deploy ไปยัง Vercel

Write-Host "🚀 กำลังเตรียม Deploy ไปยัง Vercel..." -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่ามี Vercel CLI หรือไม่
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ ไม่พบ Vercel CLI" -ForegroundColor Red
    Write-Host "ติดตั้งด้วยคำสั่ง: npm install -g vercel" -ForegroundColor Yellow
    Write-Host ""
    $install = Read-Host "ต้องการติดตั้งตอนนี้? (y/n)"
    if ($install -eq "y") {
        npm install -g vercel
    } else {
        exit
    }
}

Write-Host "✅ พบ Vercel CLI" -ForegroundColor Green
Write-Host ""

# ตรวจสอบ Git status
Write-Host "📋 ตรวจสอบ Git status..." -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "⚠️  คำเตือน: ก่อน deploy ตรวจสอบว่า..." -ForegroundColor Yellow
Write-Host "  1. Database สามารถเข้าถึงได้จาก Internet" -ForegroundColor Yellow
Write-Host "  2. Environment Variables พร้อมแล้ว" -ForegroundColor Yellow
Write-Host "  3. Code ทดสอบเรียบร้อยแล้ว" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "ต้องการ commit และ push code? (y/n)"

if ($continue -eq "y") {
    Write-Host ""
    $commitMessage = Read-Host "Commit message"
    
    Write-Host "📦 Adding files..." -ForegroundColor Cyan
    git add .
    
    Write-Host "💾 Committing..." -ForegroundColor Cyan
    git commit -m $commitMessage
    
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Push สำเร็จ!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📌 ขั้นตอนถัดไป:" -ForegroundColor Cyan
    Write-Host "  1. ไปที่ https://vercel.com/thanakron-hongthongs-projects" -ForegroundColor White
    Write-Host "  2. คลิก 'Add New' → 'Project'" -ForegroundColor White
    Write-Host "  3. เลือก Repository: React-Business" -ForegroundColor White
    Write-Host "  4. ตั้งค่า Environment Variables (ดูใน .env.vercel)" -ForegroundColor White
    Write-Host "  5. คลิก 'Deploy'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ยกเลิก" -ForegroundColor Yellow
}

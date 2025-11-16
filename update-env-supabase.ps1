# อัปเดต Environment Variables สำหรับ Supabase

Write-Host "🔧 Update Environment Variables for Supabase" -ForegroundColor Cyan
Write-Host ""

# ขอ Supabase Password
Write-Host "📋 กรุณากรอก Supabase Database Password" -ForegroundColor Yellow
Write-Host "ดูได้ที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/settings/database" -ForegroundColor Gray
Write-Host ""

$password = Read-Host "Supabase Password" -AsSecureString
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# สร้าง .env.local
$envContent = @"
# Supabase PostgreSQL Configuration
DB_HOST=db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=$passwordPlain
DB_NAME=postgres
DB_SCHEMA=BJH-Server
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "✅ สร้าง .env.local สำเร็จ" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 ทดสอบการเชื่อมต่อ..." -ForegroundColor Cyan

# ทดสอบ
npm run dev

Write-Host ""
Write-Host "📋 ขั้นตอนถัดไป:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. เปิดเบราว์เซอร์ทดสอบ API:" -ForegroundColor White
Write-Host "   http://localhost:3000/api/customer-data" -ForegroundColor Gray
Write-Host ""
Write-Host "2. อัปเดต Environment Variables ใน Vercel:" -ForegroundColor White
Write-Host "   https://vercel.com/thanakron-hongthongs-projects" -ForegroundColor Gray
Write-Host "   → Settings → Environment Variables" -ForegroundColor Gray
Write-Host ""
Write-Host "   เพิ่มตัวแปรเหล่านี้:" -ForegroundColor White
Write-Host "   DB_HOST = db.houhlbfagngkyrbbhmmi.supabase.co" -ForegroundColor Yellow
Write-Host "   DB_PORT = 5432" -ForegroundColor Yellow
Write-Host "   DB_USER = postgres" -ForegroundColor Yellow
Write-Host "   DB_PASSWORD = $passwordPlain" -ForegroundColor Yellow
Write-Host "   DB_NAME = postgres" -ForegroundColor Yellow
Write-Host "   DB_SCHEMA = BJH-Server" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Deploy:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Use Supabase'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""

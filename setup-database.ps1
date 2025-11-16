# PowerShell script สำหรับสร้างตารางใน PostgreSQL
# ต้องติดตั้ง psql client ก่อน (PostgreSQL command line tool)

$env:PGPASSWORD = "Bjh12345!!"
$host = "192.168.1.19"
$port = "5432"
$user = "postgres"
$database = "postgres"

Write-Host "กำลังเชื่อมต่อกับ PostgreSQL..." -ForegroundColor Cyan

# รัน SQL script
psql -h $host -p $port -U $user -d $database -f "database-schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ สร้างตารางสำเร็จ!" -ForegroundColor Green
} else {
    Write-Host "✗ เกิดข้อผิดพลาด กรุณาตรวจสอบว่าติดตั้ง psql แล้ว" -ForegroundColor Red
    Write-Host "หรือใช้ pgAdmin เพื่อรัน SQL script แทน" -ForegroundColor Yellow
}

# ล้าง password จาก environment
Remove-Item Env:\PGPASSWORD

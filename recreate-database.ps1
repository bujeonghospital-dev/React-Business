# PowerShell script สำหรับ DROP และสร้างตารางใหม่
Write-Host "⚠️  คำเตือน: สคริปต์นี้จะลบตาราง customers และสร้างใหม่" -ForegroundColor Yellow
Write-Host "กด Enter เพื่อดำเนินการต่อ หรือ Ctrl+C เพื่อยกเลิก" -ForegroundColor Yellow
Read-Host

Write-Host "กำลัง DROP ตารางเก่าและสร้างตารางใหม่..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/recreate-database" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✓ สร้างตารางใหม่สำเร็จ!" -ForegroundColor Green
        Write-Host "Table: $($response.details.table)" -ForegroundColor Gray
        Write-Host "Columns: $($response.details.columns)" -ForegroundColor Gray
        Write-Host "Indexes: $($response.details.indexes.Count)" -ForegroundColor Gray
    } else {
        Write-Host "✗ เกิดข้อผิดพลาด: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ไม่สามารถเชื่อมต่อได้: $_" -ForegroundColor Red
    Write-Host "ตรวจสอบว่า dev server กำลังรันอยู่ (npm run dev)" -ForegroundColor Yellow
}

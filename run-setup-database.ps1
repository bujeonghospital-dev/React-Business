# สคริปต์สำหรับเรียก API setup database
Write-Host "กำลังสร้างตารางในฐานข้อมูล..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/setup-database" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✓ สร้างตารางสำเร็จ!" -ForegroundColor Green
        Write-Host "Table: $($response.details.table)" -ForegroundColor Gray
        Write-Host "Indexes created: $($response.details.indexes.Count)" -ForegroundColor Gray
        Write-Host "Trigger: $($response.details.trigger)" -ForegroundColor Gray
    } else {
        Write-Host "✗ เกิดข้อผิดพลาด: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ไม่สามารถเชื่อมต่อได้: $_" -ForegroundColor Red
    Write-Host "ตรวจสอบว่า dev server กำลังรันอยู่ (npm run dev)" -ForegroundColor Yellow
}

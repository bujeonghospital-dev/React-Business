# PowerShell Script to Setup Service Account from JSON file
# วิธีใช้: ลาก JSON file ลงมาในหน้าต่างนี้แล้วกด Enter

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Service Account Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Ask for JSON file path
Write-Host "ลาก JSON file ที่ดาวน์โหลดจาก Google Cloud Console มาวางตรงนี้:" -ForegroundColor Yellow
Write-Host "(หรือพิมพ์ path ของไฟล์)" -ForegroundColor Yellow
Write-Host ""

$jsonPath = Read-Host "JSON File Path"

# Remove quotes if present
$jsonPath = $jsonPath -replace '"', ''

# Check if file exists
if (-not (Test-Path $jsonPath)) {
    Write-Host "❌ ไม่พบไฟล์ $jsonPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "กรุณาตรวจสอบ path และลองใหม่" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "✅ พบไฟล์แล้ว กำลังประมวลผล..." -ForegroundColor Green

try {
    # Read and parse JSON
    $json = Get-Content $jsonPath -Raw | ConvertFrom-Json
    
    # Extract values
    $privateKey = $json.private_key
    $clientEmail = $json.client_email
    $projectId = $json.project_id
    
    # Verify required fields
    if (-not $privateKey -or -not $clientEmail) {
        Write-Host "❌ ไฟล์ JSON ไม่ครบถ้วน (ไม่มี private_key หรือ client_email)" -ForegroundColor Red
        pause
        exit
    }
    
    Write-Host ""
    Write-Host "📋 ข้อมูลที่พบ:" -ForegroundColor Cyan
    Write-Host "   Project ID: $projectId" -ForegroundColor White
    Write-Host "   Email: $clientEmail" -ForegroundColor White
    Write-Host "   Private Key: Found ✓" -ForegroundColor Green
    Write-Host ""
    
    # Create .env.local content
    $envContent = @"
# Google Sheets Service Account Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

GOOGLE_SPREADSHEET_ID=1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y
GOOGLE_SERVICE_ACCOUNT_EMAIL=$clientEmail
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="$privateKey"

# Project: $projectId
"@
    
    # Write to .env.local
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline
    
    Write-Host "✅ สร้างไฟล์ .env.local เรียบร้อยแล้ว!" -ForegroundColor Green
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "ขั้นตอนถัดไป:" -ForegroundColor Yellow
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. แชร์ Google Sheet กับ Service Account:" -ForegroundColor White
    Write-Host "   https://docs.google.com/spreadsheets/d/1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y/edit" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   - คลิก 'แชร์'" -ForegroundColor White
    Write-Host "   - เพิ่ม: $clientEmail" -ForegroundColor Cyan
    Write-Host "   - สิทธิ์: Viewer" -ForegroundColor White
    Write-Host "   - ยกเลิก 'Notify people'" -ForegroundColor White
    Write-Host "   - คลิก 'Share'" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Restart development server:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. เปิดเบราว์เซอร์:" -ForegroundColor White
    Write-Host "   http://localhost:3000/performance-surgery-schedule" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ เกิดข้อผิดพลาด: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "กรุณาตรวจสอบว่าไฟล์เป็น JSON ที่ถูกต้อง" -ForegroundColor Red
}

Write-Host ""
Write-Host "กด Enter เพื่อปิด..." -ForegroundColor Gray
pause

# PowerShell Script สำหรับย้ายข้อมูลจาก Local PostgreSQL ไป Supabase

Write-Host "🚀 เริ่มต้นการย้ายข้อมูลไป Supabase..." -ForegroundColor Cyan
Write-Host ""

# ตั้งค่า Local PostgreSQL
$LOCAL_HOST = "192.168.1.19"
$LOCAL_PORT = "5432"
$LOCAL_USER = "postgres"
$LOCAL_PASSWORD = "Bjh12345!!"
$LOCAL_DB = "postgres"
$LOCAL_SCHEMA = "BJH-Server"
$LOCAL_TABLE = "bjh_all_leads"

# ตรวจสอบว่ามี pg_dump
$pgDumpInstalled = Get-Command pg_dump -ErrorAction SilentlyContinue

if (-not $pgDumpInstalled) {
    Write-Host "❌ ไม่พบ pg_dump" -ForegroundColor Red
    Write-Host "กรุณาติดตั้ง PostgreSQL client tools" -ForegroundColor Yellow
    Write-Host "Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit
}

Write-Host "✅ พบ pg_dump" -ForegroundColor Green
Write-Host ""

# รับ Supabase Connection Details
Write-Host "📋 กรุณากรอก Supabase Connection Details" -ForegroundColor Cyan
Write-Host "ดูได้ที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/settings/database" -ForegroundColor Gray
Write-Host ""

$SUPABASE_HOST = Read-Host "Supabase Host (เช่น db.houhlbfagngkyrbbhmmi.supabase.co)"
if ([string]::IsNullOrWhiteSpace($SUPABASE_HOST)) {
    $SUPABASE_HOST = "db.houhlbfagngkyrbbhmmi.supabase.co"
    Write-Host "ใช้ค่าเริ่มต้น: $SUPABASE_HOST" -ForegroundColor Yellow
}

$SUPABASE_PASSWORD = Read-Host "Supabase Password" -AsSecureString
$SUPABASE_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SUPABASE_PASSWORD)
)

Write-Host ""
Write-Host "📤 กำลัง Export ข้อมูลจาก Local PostgreSQL..." -ForegroundColor Cyan

# สร้างโฟลเดอร์สำหรับเก็บ backup
$backupDir = ".\supabase-migration"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$schemaFile = "$backupDir\schema_$timestamp.sql"
$dataFile = "$backupDir\data_$timestamp.sql"
$fullBackupFile = "$backupDir\full_backup_$timestamp.sql"

# Set password environment
$env:PGPASSWORD = $LOCAL_PASSWORD

try {
    # Export Schema
    Write-Host "  → Export Schema..." -ForegroundColor Gray
    pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB `
        -n $LOCAL_SCHEMA -t "$LOCAL_SCHEMA.$LOCAL_TABLE" --schema-only `
        -f $schemaFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Export Schema สำเร็จ: $schemaFile" -ForegroundColor Green
    } else {
        throw "Export Schema ล้มเหลว"
    }

    # Export Data
    Write-Host "  → Export Data..." -ForegroundColor Gray
    pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB `
        -n $LOCAL_SCHEMA -t "$LOCAL_SCHEMA.$LOCAL_TABLE" --data-only `
        -f $dataFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Export Data สำเร็จ: $dataFile" -ForegroundColor Green
    } else {
        throw "Export Data ล้มเหลว"
    }

    # Full Backup
    Write-Host "  → Export Full Backup..." -ForegroundColor Gray
    pg_dump -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB `
        -n $LOCAL_SCHEMA -t "$LOCAL_SCHEMA.$LOCAL_TABLE" `
        -f $fullBackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Export Full Backup สำเร็จ: $fullBackupFile" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Full Backup อาจมีปัญหา" -ForegroundColor Yellow
    }

} catch {
    Write-Host "❌ เกิดข้อผิดพลาด: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📊 ข้อมูลสถิติ:" -ForegroundColor Cyan
$schemaSize = (Get-Item $schemaFile).Length / 1KB
$dataSize = (Get-Item $dataFile).Length / 1KB
Write-Host "  Schema: $([math]::Round($schemaSize, 2)) KB" -ForegroundColor Gray
Write-Host "  Data: $([math]::Round($dataSize, 2)) KB" -ForegroundColor Gray

Write-Host ""
Write-Host "📥 ต้องการ Import ไปยัง Supabase หรือไม่? (y/n)" -ForegroundColor Yellow
$import = Read-Host

if ($import -eq "y") {
    Write-Host ""
    Write-Host "📤 กำลัง Import ไปยัง Supabase..." -ForegroundColor Cyan
    
    # Set Supabase password
    $env:PGPASSWORD = $SUPABASE_PASSWORD_PLAIN
    
    try {
        # สร้าง Schema ก่อน (ถ้ายังไม่มี)
        Write-Host "  → สร้าง Schema..." -ForegroundColor Gray
        $createSchemaSQL = "CREATE SCHEMA IF NOT EXISTS `"$LOCAL_SCHEMA`";"
        echo $createSchemaSQL | psql -h $SUPABASE_HOST -p 5432 -U postgres -d postgres
        
        # Import Schema
        Write-Host "  → Import Schema..." -ForegroundColor Gray
        psql -h $SUPABASE_HOST -p 5432 -U postgres -d postgres -f $schemaFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Import Schema สำเร็จ" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Import Schema อาจมีปัญหา (อาจมีตารางอยู่แล้ว)" -ForegroundColor Yellow
        }
        
        # Import Data
        Write-Host "  → Import Data..." -ForegroundColor Gray
        psql -h $SUPABASE_HOST -p 5432 -U postgres -d postgres -f $dataFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Import Data สำเร็จ" -ForegroundColor Green
        } else {
            throw "Import Data ล้มเหลว"
        }
        
        Write-Host ""
        Write-Host "🎉 ย้ายข้อมูลสำเร็จ!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ เกิดข้อผิดพลาดในการ Import: $_" -ForegroundColor Red
        Write-Host "คุณสามารถ Import ด้วยตัวเองผ่าน Supabase SQL Editor" -ForegroundColor Yellow
        Write-Host "ไฟล์: $fullBackupFile" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "ℹ️  คุณสามารถ Import ด้วยตัวเองภายหลังได้" -ForegroundColor Cyan
    Write-Host "ไฟล์ที่ Export:" -ForegroundColor White
    Write-Host "  - Schema: $schemaFile" -ForegroundColor Gray
    Write-Host "  - Data: $dataFile" -ForegroundColor Gray
    Write-Host "  - Full Backup: $fullBackupFile" -ForegroundColor Gray
}

# Clear passwords
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "📋 ขั้นตอนถัดไป:" -ForegroundColor Cyan
Write-Host "  1. ตรวจสอบข้อมูลใน Supabase Dashboard" -ForegroundColor White
Write-Host "     https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor" -ForegroundColor Gray
Write-Host "  2. อัปเดต .env.local ด้วยค่าจาก Supabase" -ForegroundColor White
Write-Host "  3. ทดสอบการเชื่อมต่อ: npm run dev" -ForegroundColor White
Write-Host "  4. Deploy ไปยัง Vercel" -ForegroundColor White
Write-Host ""

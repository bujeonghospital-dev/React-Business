# ========================================
# Test Webhook API for Surgery Schedule
# ========================================
# สคริปต์นี้ใช้สำหรับทดสอบ API endpoint ที่รับข้อมูลจาก Google Sheets
# และบันทึกลง Supabase

# การตั้งค่า
$API_ENDPOINT = "http://localhost:3000/api/webhooks/surgery-schedule"
# $API_ENDPOINT = "https://desgy-project.vercel.app/api/webhooks/surgery-schedule" # สำหรับ Production

$WEBHOOK_SECRET = "webhook-secret-2025-surgery-schedule-api" # ต้องตรงกับ SURGERY_SCHEDULE_WEBHOOK_SECRET ใน .env.local

# ========================================
# Test 1: GET - ดูข้อมูล API endpoint
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 1: GET - Check API Endpoint" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Get
    Write-Host "✅ API Endpoint is active" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# ========================================
# Test 2: POST - ส่งข้อมูลเดียว (Single Record)
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 2: POST - Send Single Record" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$singleRecord = @{
    doctor = "หมอทดสอบ API"
    contact_person = "สา"
    customer_name = "คุณทดสอบ Single"
    phone_number = "0812345671"
    date_consult_scheduled = "2025-11-15"
    date_surgery_scheduled = "2025-11-20"
    surgery_date = "2025-11-20"
    appointment_time = "10:00:00"
    proposed_amount = "50000"
    campaign = "Facebook Ads Test"
    remarks = "Test from PowerShell - Single Record"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $WEBHOOK_SECRET"
}

Write-Host "Sending data:" -ForegroundColor Yellow
$singleRecord

try {
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Body $singleRecord -Headers $headers -ContentType "application/json"
    Write-Host "`n✅ Single record sent successfully" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# ========================================
# Test 3: POST - ส่งข้อมูลหลายรายการ (Multiple Records)
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 3: POST - Send Multiple Records" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$multipleRecords = @(
    @{
        doctor = "หมอทดสอบ API"
        contact_person = "พัชชา"
        customer_name = "คุณทดสอบ Batch 1"
        phone_number = "0812345672"
        date_consult_scheduled = "2025-11-16"
        date_surgery_scheduled = "2025-11-21"
        appointment_time = "11:00:00"
        proposed_amount = "60000"
        remarks = "Test from PowerShell - Batch 1"
    },
    @{
        doctor = "หมอทดสอบ API"
        contact_person = "ตั้งโอ๋"
        customer_name = "คุณทดสอบ Batch 2"
        phone_number = "0812345673"
        date_consult_scheduled = "2025-11-17"
        surgery_date = "2025-11-22"
        appointment_time = "14:00:00"
        proposed_amount = "70000"
        remarks = "Test from PowerShell - Batch 2"
    },
    @{
        doctor = "หมอทดสอบ API"
        contact_person = "จีน"
        customer_name = "คุณทดสอบ Batch 3"
        phone_number = "0812345674"
        date_consult_scheduled = "2025-11-18"
        date_surgery_scheduled = "2025-11-23"
        surgery_date = "2025-11-23"
        appointment_time = "15:30:00"
        proposed_amount = "80000"
        campaign = "Google Ads Test"
        remarks = "Test from PowerShell - Batch 3"
    }
) | ConvertTo-Json -Depth 5

Write-Host "Sending 3 records..." -ForegroundColor Yellow
$multipleRecords

try {
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Body $multipleRecords -Headers $headers -ContentType "application/json"
    Write-Host "`n✅ Multiple records sent successfully" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
    
    Write-Host "`nSummary:" -ForegroundColor Cyan
    Write-Host "  Processed: $($response.processed)" -ForegroundColor Green
    Write-Host "  Failed: $($response.failed)" -ForegroundColor $(if ($response.failed -eq 0) { "Green" } else { "Red" })
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# ========================================
# Test 4: POST - ทดสอบฟอร์แมตวันที่แบบไทย (DD/MM/YYYY)
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 4: POST - Thai Date Format (DD/MM/YYYY)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$thaiDateRecord = @{
    doctor = "หมอทดสอบ API"
    contact_person = "มุก"
    customer_name = "คุณทดสอบวันที่ไทย"
    phone_number = "0812345675"
    date_consult_scheduled = "15/11/2025"
    date_surgery_scheduled = "20/11/2025"
    surgery_date = "20/11/2025"
    appointment_time = "09:00:00"
    proposed_amount = "45000"
    remarks = "Test Thai date format"
} | ConvertTo-Json

Write-Host "Sending Thai date format:" -ForegroundColor Yellow
$thaiDateRecord

try {
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Body $thaiDateRecord -Headers $headers -ContentType "application/json"
    Write-Host "`n✅ Thai date format accepted" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# ========================================
# Test 5: POST - ทดสอบ contact_person แบบเต็ม (101-สา)
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 5: POST - Full Contact Person Format (101-สา)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$fullContactRecord = @{
    doctor = "หมอทดสอบ API"
    contact_person = "101-สา"
    customer_name = "คุณทดสอบ Contact Full"
    phone_number = "0812345676"
    date_consult_scheduled = "2025-11-19"
    proposed_amount = "55000"
    remarks = "Test contact person extraction (101-สา → สา)"
} | ConvertTo-Json

Write-Host "Sending full contact person format:" -ForegroundColor Yellow
$fullContactRecord

try {
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Body $fullContactRecord -Headers $headers -ContentType "application/json"
    Write-Host "`n✅ Contact person format processed" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# ========================================
# Test 6: POST - ทดสอบ Authentication Error (Wrong Secret)
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 6: POST - Test Authentication (Wrong Secret)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$wrongHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer wrong-secret"
}

$testRecord = @{
    doctor = "หมอทดสอบ"
    customer_name = "ทดสอบ Auth"
} | ConvertTo-Json

Write-Host "Sending with wrong secret..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Body $testRecord -Headers $wrongHeaders -ContentType "application/json"
    Write-Host "`n❌ Authentication should have failed!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "`n✅ Authentication working correctly (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Unexpected error: $_" -ForegroundColor Yellow
    }
}

# ========================================
# Summary
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Supabase database for new records" -ForegroundColor White
Write-Host "   URL: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor" -ForegroundColor Gray
Write-Host "2. View data in Performance Surgery Schedule dashboard" -ForegroundColor White
Write-Host "   URL: http://localhost:3000/performance-surgery-schedule" -ForegroundColor Gray
Write-Host "3. Set up Google Apps Script to send real data" -ForegroundColor White
Write-Host "   File: docs/google-apps-script-webhook.js" -ForegroundColor Gray

Write-Host "`nPress any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

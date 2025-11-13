# ===============================================
# สคริปต์ทดสอบระบบ Call Matrix
# สร้างข้อมูลตัวอย่างสำหรับ Agent 101-108
# ===============================================

Write-Host "🚀 เริ่มสร้างข้อมูลทดสอบ Call Matrix..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiEndpoint = "$baseUrl/api/call-matrix"

# กำหนดวันที่ (วันนี้)
$today = Get-Date
$dateString = $today.ToString("yyyy-MM-dd")

Write-Host "📅 กำลังสร้างข้อมูลสำหรับวันที่: $dateString" -ForegroundColor Yellow
Write-Host ""

# Agent IDs และ Names
$agents = @(
    @{ id = "101"; name = "สา" }
    @{ id = "102"; name = "พัดชา" }
    @{ id = "103"; name = "ตั้งโอ๋" }
    @{ id = "104"; name = "Test" }
    @{ id = "105"; name = "จีน" }
    @{ id = "106"; name = "มุก" }
    @{ id = "107"; name = "เจ" }
    @{ id = "108"; name = "ว่าน" }
)

# ช่วงเวลา 11:00-19:00 (8 ชั่วโมง)
$hours = 11..18

$callCount = 0
$successCount = 0
$errorCount = 0

# สร้างข้อมูลสุ่มสำหรับแต่ละ Agent
foreach ($agent in $agents) {
    $agentId = $agent.id
    $agentName = $agent.name
    
    Write-Host "👤 Agent $agentId - $agentName" -ForegroundColor Magenta
    
    # สุ่มจำนวนการโทรในแต่ละชั่วโมง (0-15 สาย)
    foreach ($hour in $hours) {
        $callsInHour = Get-Random -Minimum 0 -Maximum 16
        
        if ($callsInHour -eq 0) {
            Write-Host "   ⏰ $hour`:00-$(($hour + 1)):00 → 0 สาย (ข้าม)" -ForegroundColor Gray
            continue
        }
        
        # สร้างข้อมูลการโทรในชั่วโมงนั้น
        for ($i = 1; $i -le $callsInHour; $i++) {
            $callCount++
            
            # สุ่มเวลาภายในชั่วโมง
            $minute = Get-Random -Minimum 0 -Maximum 60
            $second = Get-Random -Minimum 0 -Maximum 60
            $startTime = Get-Date -Year $today.Year -Month $today.Month -Day $today.Day -Hour $hour -Minute $minute -Second $second
            
            # สุ่มระยะเวลาการโทร (30-600 วินาที = 0.5-10 นาที)
            $durationSeconds = Get-Random -Minimum 30 -Maximum 601
            $endTime = $startTime.AddSeconds($durationSeconds)
            
            # สุ่มเบอร์ลูกค้า
            $customerPhone = "08" + (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
            
            # สร้าง request body
            $body = @{
                agent_id = $agentId
                customer_phone = $customerPhone
                customer_name = "ลูกค้าทดสอบ #$callCount"
                call_type = "outgoing"
                call_status = "answered"
                start_time = $startTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                end_time = $endTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                duration_seconds = $durationSeconds
                notes = "ข้อมูลทดสอบอัตโนมัติ"
            } | ConvertTo-Json
            
            try {
                # ส่ง POST request
                $response = Invoke-RestMethod -Uri $apiEndpoint -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
                
                if ($response.success) {
                    $successCount++
                    Write-Host "   ✅ $hour`:$($minute.ToString('00')) → สาย #$i ($durationSeconds วินาที)" -ForegroundColor Green
                } else {
                    $errorCount++
                    Write-Host "   ❌ Error: $($response.error)" -ForegroundColor Red
                }
            } catch {
                $errorCount++
                Write-Host "   ❌ Network Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # หน่วงเวลาเล็กน้อยเพื่อไม่ให้ server ทำงานหนักเกินไป
            Start-Sleep -Milliseconds 100
        }
        
        $color = if ($callsInHour -le 2) { "Blue" } 
                 elseif ($callsInHour -le 5) { "Green" }
                 elseif ($callsInHour -le 10) { "Yellow" }
                 else { "Red" }
        
        Write-Host "   ⏰ $hour`:00-$(($hour + 1)):00 → $callsInHour สาย" -ForegroundColor $color
    }
    
    Write-Host ""
}

# สรุปผลการทดสอบ
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "📊 สรุปผลการทดสอบ" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ สำเร็จ: $successCount สาย" -ForegroundColor Green
Write-Host "❌ ล้มเหลว: $errorCount สาย" -ForegroundColor Red
Write-Host "📞 รวมทั้งหมด: $callCount สาย" -ForegroundColor White
Write-Host ""
Write-Host "🌐 เปิดดูผลลัพธ์ที่:" -ForegroundColor Yellow
Write-Host "   $baseUrl/customer-contact-dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ดูข้อมูล API:" -ForegroundColor Yellow
Write-Host "   $apiEndpoint`?date=$dateString" -ForegroundColor Cyan
Write-Host ""

# ถามว่าจะเปิด browser หรือไม่
$openBrowser = Read-Host "ต้องการเปิด Browser หรือไม่? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "$baseUrl/customer-contact-dashboard"
    Write-Host "✅ เปิด Browser แล้ว" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 เสร็จสมบูรณ์!" -ForegroundColor Green

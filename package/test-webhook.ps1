# ========================================
# Yalecom Webhook Test Script (PowerShell)
# ========================================

$WebhookUrl = "https://tpp-thanakon.store/api/webhooks/yalecom-call"

# สี
$SuccessColor = "Green"
$ErrorColor = "Red"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor $InfoColor
    Write-Host "   Yalecom Webhook Tester" -ForegroundColor $InfoColor
    Write-Host "========================================" -ForegroundColor $InfoColor
    Write-Host ""
    Write-Host "Webhook URL: $WebhookUrl" -ForegroundColor $WarningColor
    Write-Host ""
    Write-Host "เลือกประเภท Test:" -ForegroundColor White
    Write-Host "1. 📞 Ringing (รอสาย)" -ForegroundColor Yellow
    Write-Host "2. ✅ Answered (รับสาย)" -ForegroundColor Green
    Write-Host "3. ☎️  In Call (SALE ติดต่อ)" -ForegroundColor Green
    Write-Host "4. 📤 Outbound (โทรออก)" -ForegroundColor Magenta
    Write-Host "5. 🔚 Call Ended (จบสาย)" -ForegroundColor Gray
    Write-Host "6. 🔧 Custom Payload" -ForegroundColor Cyan
    Write-Host "7. 🌐 Test GET (ตรวจสอบ endpoint)" -ForegroundColor Blue
    Write-Host "0. ❌ Exit" -ForegroundColor Red
    Write-Host ""
}

function Send-Webhook {
    param(
        [string]$EventType,
        [string]$Direction,
        [string]$CallStatus,
        [string]$CallerNumber = "0812345678",
        [string]$AgentId = "101"
    )

    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $callId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"

    $body = @{
        call_id = $callId
        caller_number = $CallerNumber
        callee_number = "900"
        queue_name = "Sales Queue"
        queue_extension = "900"
        agent_id = $AgentId
        agent_name = "Agent $AgentId"
        call_status = $CallStatus
        timestamp = $timestamp
        direction = $Direction
        event_type = $EventType
    } | ConvertTo-Json

    Write-Host "`n📤 Sending webhook..." -ForegroundColor $InfoColor
    Write-Host "Payload:" -ForegroundColor White
    Write-Host $body -ForegroundColor Gray
    Write-Host ""

    try {
        $response = Invoke-RestMethod -Uri $WebhookUrl `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop

        Write-Host "✅ SUCCESS!" -ForegroundColor $SuccessColor
        Write-Host "Response:" -ForegroundColor White
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERROR!" -ForegroundColor $ErrorColor
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor $ErrorColor
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        
        if ($_.ErrorDetails.Message) {
            Write-Host "Details:" -ForegroundColor White
            Write-Host $_.ErrorDetails.Message -ForegroundColor $ErrorColor
        }
    }

    Write-Host ""
    Write-Host "กด Enter เพื่อกลับเมนู..." -ForegroundColor $WarningColor
    Read-Host
}

function Test-GetEndpoint {
    Write-Host "`n🌐 Testing GET endpoint..." -ForegroundColor $InfoColor
    
    try {
        $response = Invoke-RestMethod -Uri $WebhookUrl -Method Get -ErrorAction Stop
        
        Write-Host "✅ Endpoint is available!" -ForegroundColor $SuccessColor
        Write-Host "Response:" -ForegroundColor White
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Endpoint not available!" -ForegroundColor $ErrorColor
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor $ErrorColor
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        Write-Host ""
        Write-Host "⚠️  หมายเหตุ: ถ้าได้ HTTP 404 แสดงว่ายังไม่ได้ deploy webhook API" -ForegroundColor $WarningColor
    }

    Write-Host ""
    Write-Host "กด Enter เพื่อกลับเมนู..." -ForegroundColor $WarningColor
    Read-Host
}

function Send-CustomPayload {
    Write-Host "`n🔧 Custom Payload" -ForegroundColor $InfoColor
    Write-Host ""
    
    $callId = Read-Host "Call ID [test-001]"
    if ([string]::IsNullOrWhiteSpace($callId)) { $callId = "test-001" }
    
    $callerNumber = Read-Host "Caller Number [0812345678]"
    if ([string]::IsNullOrWhiteSpace($callerNumber)) { $callerNumber = "0812345678" }
    
    $agentId = Read-Host "Agent ID [101]"
    if ([string]::IsNullOrWhiteSpace($agentId)) { $agentId = "101" }
    
    Write-Host ""
    Write-Host "Event Type:"
    Write-Host "1. call_ringing"
    Write-Host "2. call_answered"
    Write-Host "3. call_started"
    Write-Host "4. call_ended"
    $eventChoice = Read-Host "เลือก [1-4]"
    
    $eventTypes = @{
        "1" = "call_ringing"
        "2" = "call_answered"
        "3" = "call_started"
        "4" = "call_ended"
    }
    $eventType = $eventTypes[$eventChoice]
    if ([string]::IsNullOrWhiteSpace($eventType)) { $eventType = "call_ringing" }
    
    Write-Host ""
    Write-Host "Direction:"
    Write-Host "1. inbound"
    Write-Host "2. outbound"
    $dirChoice = Read-Host "เลือก [1-2]"
    $direction = if ($dirChoice -eq "2") { "outbound" } else { "inbound" }
    
    $callStatus = $eventType -replace "call_", ""
    
    Send-Webhook -EventType $eventType -Direction $direction -CallStatus $callStatus -CallerNumber $callerNumber -AgentId $agentId
}

# Main Loop
do {
    Show-Menu
    $choice = Read-Host "เลือก"
    
    switch ($choice) {
        "1" {
            Send-Webhook -EventType "call_ringing" -Direction "inbound" -CallStatus "ringing"
        }
        "2" {
            Send-Webhook -EventType "call_answered" -Direction "inbound" -CallStatus "answered"
        }
        "3" {
            Send-Webhook -EventType "call_answered" -Direction "inbound" -CallStatus "answered"
        }
        "4" {
            Send-Webhook -EventType "call_started" -Direction "outbound" -CallStatus "started"
        }
        "5" {
            Send-Webhook -EventType "call_ended" -Direction "inbound" -CallStatus "ended"
        }
        "6" {
            Send-CustomPayload
        }
        "7" {
            Test-GetEndpoint
        }
        "0" {
            Write-Host "`nBye! 👋" -ForegroundColor $InfoColor
            break
        }
        default {
            Write-Host "`n❌ เลือกไม่ถูกต้อง กรุณาเลือกใหม่" -ForegroundColor $ErrorColor
            Start-Sleep -Seconds 1
        }
    }
} while ($choice -ne "0")

# ตัวอย่างการทดสอบ Webhook และ API

## 1. ทดสอบ Webhook (รับสาย)

### ใช้ curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/yalecom-call \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-test-001",
    "caller_number": "0812345678",
    "callee_number": "900",
    "queue_name": "Sales Queue",
    "queue_extension": "900",
    "agent_id": "101",
    "agent_name": "Agent 101",
    "call_status": "ringing",
    "timestamp": "2025-11-07T10:00:00.000Z",
    "direction": "inbound",
    "event_type": "call_ringing"
  }'
```

### ใช้ PowerShell:

```powershell
$body = @{
    call_id = "call-test-001"
    caller_number = "0812345678"
    callee_number = "900"
    queue_name = "Sales Queue"
    queue_extension = "900"
    agent_id = "101"
    agent_name = "Agent 101"
    call_status = "ringing"
    timestamp = "2025-11-07T10:00:00.000Z"
    direction = "inbound"
    event_type = "call_ringing"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/webhooks/yalecom-call" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### ใช้ JavaScript/Fetch:

```javascript
fetch("http://localhost:3000/api/webhooks/yalecom-call", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    call_id: "call-test-001",
    caller_number: "0812345678",
    callee_number: "900",
    queue_name: "Sales Queue",
    queue_extension: "900",
    agent_id: "101",
    agent_name: "Agent 101",
    call_status: "ringing",
    timestamp: new Date().toISOString(),
    direction: "inbound",
    event_type: "call_ringing",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 2. ทดสอบ Robocall API (โทรออก)

### ใช้ curl:

```bash
curl -X POST http://localhost:3000/api/yalecom/robocall \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "0812345678",
    "agent_id": "101",
    "campaign_name": "Test Campaign",
    "message": "This is a test call"
  }'
```

### ใช้ PowerShell:

```powershell
$body = @{
    phone_number = "0812345678"
    agent_id = "101"
    campaign_name = "Test Campaign"
    message = "This is a test call"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/yalecom/robocall" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### ใช้ JavaScript/Fetch:

```javascript
fetch("http://localhost:3000/api/yalecom/robocall", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phone_number: "0812345678",
    agent_id: "101",
    campaign_name: "Test Campaign",
    message: "This is a test call",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### เช็คสถานะการโทร:

```bash
curl http://localhost:3000/api/yalecom/robocall?call_id=robocall-1699123456789
```

---

## 3. ทดสอบ Queue Status API

### ใช้ curl:

```bash
# ใช้ queue_extension
curl http://localhost:3000/api/yalecom/queue-status?queue_extension=900

# หรือใช้ queue_uuid
curl http://localhost:3000/api/yalecom/queue-status?queue_uuid=your-queue-uuid
```

### ใช้ PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/yalecom/queue-status?queue_extension=900"
```

### ใช้ JavaScript/Fetch:

```javascript
fetch("http://localhost:3000/api/yalecom/queue-status?queue_extension=900")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 4. ทดสอบหลายกรณี (Test Scenarios)

### Scenario 1: สายเข้า (Ringing)

```json
{
  "event_type": "call_ringing",
  "direction": "inbound",
  "caller_number": "0812345678",
  "agent_queue_status": "Ringing"
}
```

**ผลลัพธ์**: แท็กเป็น `waiting` (รอสาย)

### Scenario 2: รับสาย (Answered)

```json
{
  "event_type": "call_answered",
  "direction": "inbound",
  "caller_number": "0812345678",
  "agent_queue_status": "InCall"
}
```

**ผลลัพธ์**: แท็กเป็น `received` (รับสาย) จาก webhook, แล้วเปลี่ยนเป็น `sale` (SALE ติดต่อ)

### Scenario 3: โทรออก (Outbound)

```json
{
  "event_type": "call_started",
  "direction": "outbound",
  "callee_number": "0812345678",
  "agent_queue_status": "Outbound"
}
```

**ผลลัพธ์**: แท็กเป็น `outgoing` (โทรออก)

### Scenario 4: กำลัง SALE ติดต่อ (In Call)

```json
{
  "agent_queue_status": "InCall",
  "caller_number": "0812345678"
}
```

**ผลลัพธ์**: แท็กเป็น `sale` (SALE ติดต่อ)

---

## 5. ทดสอบใน Postman

### สร้าง Collection ใหม่:

1. New Collection → "Yalecom API Tests"
2. เพิ่ม Requests:

#### Request 1: Webhook - Incoming Call

- **Method**: POST
- **URL**: `http://localhost:3000/api/webhooks/yalecom-call`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "call_id": "call-{{$timestamp}}",
  "caller_number": "0812345678",
  "callee_number": "900",
  "queue_name": "Sales Queue",
  "queue_extension": "900",
  "agent_id": "101",
  "agent_name": "Agent 101",
  "call_status": "ringing",
  "timestamp": "{{$isoTimestamp}}",
  "direction": "inbound",
  "event_type": "call_ringing"
}
```

#### Request 2: Robocall - Make Call

- **Method**: POST
- **URL**: `http://localhost:3000/api/yalecom/robocall`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "phone_number": "0812345678",
  "agent_id": "101",
  "campaign_name": "Test Campaign",
  "message": "Auto dialing test"
}
```

#### Request 3: Queue Status

- **Method**: GET
- **URL**: `http://localhost:3000/api/yalecom/queue-status?queue_extension=900`

---

## 6. ทดสอบ Auto-refresh

Dashboard จะ auto-refresh ทุก 5 วินาที เปิด Console ดูข้อมูล:

```javascript
// เปิด Browser Console (F12)
// จะเห็น logs:
console.log("📞 Fetching queue status...");
console.log("✅ Updated agent contacts:", agentContacts);
```

---

## 7. ทดสอบ Error Cases

### กรณี Missing phone_number:

```bash
curl -X POST http://localhost:3000/api/yalecom/robocall \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "101"
  }'
```

**ผลลัพธ์**: `{ "success": false, "error": "phone_number is required" }`

### กรณี Invalid JSON:

```bash
curl -X POST http://localhost:3000/api/webhooks/yalecom-call \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

**ผลลัพธ์**: `{ "success": false, "error": "Failed to process webhook" }`

---

## 8. Monitor Logs

ดู logs ใน Terminal ที่รัน Next.js:

```bash
npm run dev
```

จะเห็น logs:

```
📞 Webhook received: { call_id: 'call-123', ... }
✅ Contact saved: { id: 'call-123', status: 'received', ... }
📊 Queue status updated: { agents: [...] }
```

---

## สรุป

✅ ทดสอบ Webhook: `POST /api/webhooks/yalecom-call`
✅ ทดสอบ Robocall: `POST /api/yalecom/robocall`
✅ ทดสอบ Queue Status: `GET /api/yalecom/queue-status`
✅ ดู Dashboard: `http://localhost:3000/customer-contact-dashboard`

🔧 **Next**: เชื่อมต่อกับ Yalecom API จริงและตั้งค่า Webhook URL

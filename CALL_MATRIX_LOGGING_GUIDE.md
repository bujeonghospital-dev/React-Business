# 📖 คู่มือการบันทึกข้อมูล Call Matrix

## 🎯 ภาพรวมระบบ

ระบบมี **3 วิธี** ในการบันทึกข้อมูลการโทร:

### 1. 🔄 **Webhook อัตโนมัติ** (แนะนำ)

เมื่อ Yalecom ส่ง webhook มา ระบบจะบันทึกอัตโนมัติ

### 2. 📡 **API Manual** (สำหรับทดสอบ)

เรียก API โดยตรงเพื่อบันทึกข้อมูล

### 3. 🤖 **Auto-Log จาก Queue Status** (ระบบติดตาม)

ตรวจจับการเปลี่ยนสถานะ Agent แล้วบันทึกอัตโนมัติ

---

## 📝 วิธีที่ 1: Webhook อัตโนมัติ

### Endpoint

```
POST /api/webhooks/yalecom-call
```

### ตั้งค่า Webhook ใน Yalecom

1. เข้า Yalecom Dashboard
2. ไปที่ **Settings → Webhooks**
3. เพิ่ม Webhook URL:
   - Development: `http://your-ip:3000/api/webhooks/yalecom-call`
   - Production: `https://your-domain.com/api/webhooks/yalecom-call`
4. เลือก Events:
   - ✅ `call_started` (เมื่อเริ่มโทร)
   - ✅ `call_answered` (เมื่อรับสาย)
   - ✅ `call_ended` (เมื่อจบสาย) **← สำคัญ!**

### การทำงาน

#### เมื่อจบสาย (`call_ended`)

Yalecom จะส่งข้อมูลมา:

```json
{
  "event_type": "call_ended",
  "agent_id": "101",
  "caller_number": "0812345678",
  "callee_number": "0898765432",
  "direction": "outbound",
  "queue_name": "Sales",
  "timestamp": "2025-11-07T14:35:00Z"
}
```

ระบบจะ:

1. รับข้อมูลจาก Yalecom
2. แปลงเป็นรูปแบบของ Call Matrix
3. บันทึกลง `call_logs` table
4. **Trigger อัตโนมัติ** จะอัพเดท `hourly_call_stats`
5. ตาราง Call Matrix แสดงข้อมูลทันที

---

## 📡 วิธีที่ 2: API Manual (ทดสอบ)

### Endpoint

```
POST /api/call-matrix
```

### Request Body

```json
{
  "agent_id": "101",
  "customer_phone": "0812345678",
  "customer_name": "ลูกค้าทดสอบ",
  "call_type": "outgoing",
  "call_status": "answered",
  "start_time": "2025-11-07T14:30:00Z",
  "end_time": "2025-11-07T14:35:00Z",
  "duration_seconds": 300,
  "notes": "ทดสอบระบบ"
}
```

### ฟิลด์ที่ต้องการ (Required)

- ✅ `agent_id` - รหัส Agent (101-108)
- ✅ `start_time` - เวลาเริ่มโทร (ISO 8601)

### ฟิลด์ทางเลือก (Optional)

- `customer_phone` - เบอร์ลูกค้า
- `customer_name` - ชื่อลูกค้า
- `call_type` - ประเภท: `outgoing` / `incoming` / `missed`
- `call_status` - สถานะ: `answered` / `busy` / `no_answer` / `failed`
- `end_time` - เวลาจบสาย
- `duration_seconds` - ระยะเวลา (วินาที)
- `notes` - หมายเหตุ

### ตัวอย่างการใช้งาน

#### PowerShell

```powershell
$body = @{
    agent_id = "101"
    customer_phone = "0812345678"
    call_type = "outgoing"
    call_status = "answered"
    start_time = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    end_time = (Get-Date).AddMinutes(5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    duration_seconds = 300
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/call-matrix" -Method POST -Body $body -ContentType "application/json"
```

#### cURL

```bash
curl -X POST http://localhost:3000/api/call-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "101",
    "customer_phone": "0812345678",
    "call_type": "outgoing",
    "call_status": "answered",
    "start_time": "2025-11-07T14:30:00Z",
    "end_time": "2025-11-07T14:35:00Z",
    "duration_seconds": 300
  }'
```

#### JavaScript/TypeScript

```typescript
const response = await fetch("/api/call-matrix", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agent_id: "101",
    customer_phone: "0812345678",
    call_type: "outgoing",
    call_status: "answered",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 5 * 60000).toISOString(),
    duration_seconds: 300,
  }),
});

const result = await response.json();
console.log(result);
```

---

## 🤖 วิธีที่ 3: Auto-Log จาก Queue Status

### Endpoint

```
POST /api/auto-log-call
```

### การทำงาน

#### 1. เมื่อ Agent เริ่มโทร

เรียก API เพื่อเริ่มติดตาม:

```json
{
  "agent_id": "101",
  "customer_phone": "0812345678",
  "call_type": "outgoing",
  "call_status": "started"
}
```

ระบบจะเก็บข้อมูลใน memory:

```javascript
{
  "101_0812345678": {
    "agent_id": "101",
    "customer_phone": "0812345678",
    "call_type": "outgoing",
    "start_time": "2025-11-07T14:30:00Z"
  }
}
```

#### 2. เมื่อ Agent จบสาย

เรียก API เพื่อบันทึก:

```json
{
  "agent_id": "101",
  "customer_phone": "0812345678",
  "call_type": "outgoing",
  "call_status": "ended"
}
```

ระบบจะ:

1. คำนวณระยะเวลาอัตโนมัติ
2. บันทึกลง database
3. ลบข้อมูลออกจาก memory

---

## 🗄️ การทำงานของ Database

### 1. บันทึกลง `call_logs` table

```sql
INSERT INTO call_logs (
  agent_id,
  customer_phone,
  call_type,
  call_status,
  start_time,
  end_time,
  duration_seconds
) VALUES (
  '101',
  '0812345678',
  'outgoing',
  'answered',
  '2025-11-07 14:30:00',
  '2025-11-07 14:35:00',
  300
);
```

### 2. Trigger อัตโนมัติ (`update_hourly_call_stats`)

หลังจากบันทึก call_logs เสร็จ Trigger จะทำงานทันที:

```sql
-- คำนวณชั่วโมง
v_hour := 14  -- จาก start_time 14:30:00
v_hour_slot := '14-15'

-- อัพเดท hourly_call_stats
INSERT INTO hourly_call_stats (
  agent_id,
  date,
  hour_slot,
  outgoing_calls
) VALUES (
  '101',
  '2025-11-07',
  '14-15',
  1
)
ON CONFLICT (agent_id, date, hour_slot)
DO UPDATE SET
  outgoing_calls = hourly_call_stats.outgoing_calls + 1
```

### 3. ตาราง Call Matrix อัพเดทอัตโนมัติ

เมื่อ `hourly_call_stats` เปลี่ยน:

- ✅ API `/api/call-matrix?date=2025-11-07` จะดึงข้อมูลใหม่
- ✅ Component `CallMatrixTable` refresh ข้อมูล
- ✅ ตารางแสดงจำนวนการโทรทันที

---

## 📊 ตัวอย่างการใช้งานจริง

### Scenario 1: Agent 101 โทรออก 3 สาย (14:30-15:45)

```bash
# สาย 1: 14:30-14:35 (5 นาที)
curl -X POST http://localhost:3000/api/call-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "101",
    "customer_phone": "0811111111",
    "start_time": "2025-11-07T14:30:00Z",
    "end_time": "2025-11-07T14:35:00Z",
    "duration_seconds": 300
  }'

# สาย 2: 14:45-14:50 (5 นาที)
curl -X POST http://localhost:3000/api/call-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "101",
    "customer_phone": "0822222222",
    "start_time": "2025-11-07T14:45:00Z",
    "end_time": "2025-11-07T14:50:00Z",
    "duration_seconds": 300
  }'

# สาย 3: 15:10-15:15 (5 นาที)
curl -X POST http://localhost:3000/api/call-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "101",
    "customer_phone": "0833333333",
    "start_time": "2025-11-07T15:10:00Z",
    "end_time": "2025-11-07T15:15:00Z",
    "duration_seconds": 300
  }'
```

### ผลลัพธ์ในตาราง:

```
┌─────────┬──────┬──────┬─────┐
│ Hour    │ 101  │ 102  │ ... │
├─────────┼──────┼──────┼─────┤
│ 14-15   │  2   │  0   │ ... │  ← สาย 1 + 2
│ 15-16   │  1   │  0   │ ... │  ← สาย 3
│ รวม     │  3   │  0   │ ... │
└─────────┴──────┴──────┴─────┘
```

---

## 🎨 การแสดงผลในตาราง

### สีของตาราง (Color Coding)

```typescript
0 calls     → เทา (bg-gray-100)
1-2 calls   → ฟ้า (bg-blue-500)
3-5 calls   → เขียว (bg-green-500)
6-10 calls  → เหลือง (bg-yellow-500)
10+ calls   → แดง (bg-red-500)
```

### การอัพเดทอัตโนมัติ

- Component จะ fetch ข้อมูลใหม่ทุกครั้งที่:
  - เปิดหน้า Dashboard
  - กดปุ่ม Refresh
  - เปลี่ยนวันที่

---

## 🧪 การทดสอบระบบ

### 1. ทดสอบ Manual API

```powershell
# สร้างข้อมูลทดสอบ 10 สาย
1..10 | ForEach-Object {
    $body = @{
        agent_id = "10$_"
        customer_phone = "08$_$_$_$_$_$_$_$_"
        call_type = "outgoing"
        call_status = "answered"
        start_time = (Get-Date).AddHours(-$_).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        duration_seconds = 180
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:3000/api/call-matrix" -Method POST -Body $body -ContentType "application/json"

    Write-Host "✅ สร้างข้อมูลสาย $_" -ForegroundColor Green
    Start-Sleep -Milliseconds 500
}
```

### 2. ตรวจสอบข้อมูล

```bash
# ดูข้อมูลตาราง
curl http://localhost:3000/api/call-matrix?date=2025-11-07

# ดูข้อมูล raw
curl http://localhost:3000/api/call-matrix?date=2025-11-07 | jq '.rawData'
```

### 3. ตรวจสอบ Database

เปิด Supabase → SQL Editor:

```sql
-- ดูข้อมูล call_logs วันนี้
SELECT * FROM call_logs
WHERE DATE(start_time) = CURRENT_DATE
ORDER BY start_time DESC;

-- ดูข้อมูล hourly_call_stats วันนี้
SELECT * FROM hourly_call_stats
WHERE date = CURRENT_DATE
ORDER BY hour_slot, agent_id;

-- สรุปรายวัน
SELECT * FROM daily_call_summary
WHERE call_date = CURRENT_DATE;
```

---

## 🔧 Troubleshooting

### ปัญหา: ข้อมูลไม่แสดงในตาราง

1. ตรวจสอบว่า SQL Schema รันเรียบร้อย:
   ```sql
   SELECT * FROM agents;
   ```
2. ตรวจสอบ Trigger ทำงาน:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'trigger_update_hourly_stats';
   ```

### ปัญหา: RLS Policy

```sql
-- ปิด RLS ชั่วคราว (Development)
ALTER TABLE call_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_call_stats DISABLE ROW LEVEL SECURITY;
```

### ปัญหา: Webhook ไม่ทำงาน

1. ตรวจสอบ Webhook URL ถูกต้อง
2. ดู Logs ใน Terminal:
   ```
   📞 Webhook received: { event_type: "call_ended", ... }
   ```
3. ทดสอบด้วย cURL:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/yalecom-call \
     -H "Content-Type: application/json" \
     -d '{"event_type":"call_ended","agent_id":"101"}'
   ```

---

## 📌 สรุป

| วิธี           | ข้อดี                 | ข้อเสีย             | เหมาะกับ       |
| -------------- | --------------------- | ------------------- | -------------- |
| **Webhook**    | อัตโนมัติ 100%        | ต้องตั้งค่า Yalecom | Production     |
| **Manual API** | ยืดหยุ่น ควบคุมได้เอง | ต้องเรียกเอง        | ทดสอบ/ระบบอื่น |
| **Auto-Log**   | ติดตามสถานะ           | ต้อง polling        | Fallback       |

**แนะนำ**: ใช้ **Webhook** สำหรับระบบจริง และ **Manual API** สำหรับทดสอบ

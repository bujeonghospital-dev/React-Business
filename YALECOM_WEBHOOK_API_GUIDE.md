# Yalecom Webhook & API Integration Guide

## สรุปการทำงาน

### 1. **โทรออก** (Outgoing Calls)

- ใช้ **Robocall API**
- แท็กสถานะ: `outgoing` (กำลังดำเนินการ)
- API Endpoint: `POST /api/yalecom/robocall`

### 2. **รับสาย** (Incoming Calls)

- ใช้ **Webhook** รับค่าจาก Yalecom
- แท็กสถานะ: `received` (รับสาย)
- Webhook Endpoint: `POST /api/webhooks/yalecom-call`

### 3. **รอสาย** (Waiting/Ringing)

- ใช้ **Queue Status API**
- แท็กสถานะ: `waiting` (รอสาย)
- เช็คจาก `agent_queue_status = "Ringing"`

### 4. **SALE ติดต่อ** (Agent In Call)

- ใช้ **Queue Status API**
- แท็กสถานะ: `sale` (SALE ติดต่อ)
- เช็คจาก `agent_queue_status = "InCall" | "Inbound" | "Busy"`

---

## API Endpoints

### 1. Robocall API (โทรออก)

**POST** `/api/yalecom/robocall`

**Request Body:**

```json
{
  "phone_number": "0812345678",
  "agent_id": "101",
  "campaign_name": "Sales Campaign",
  "message": "Auto dialing..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Robocall initiated successfully",
  "data": {
    "call_id": "robocall-1699123456789",
    "status": "กำลังดำเนินการ",
    "phone_number": "0812345678",
    "timestamp": "2025-11-07T10:00:00.000Z"
  },
  "contact": {
    "id": "robocall-1699123456789",
    "name": "101",
    "company": "Sales Campaign",
    "phone": "0812345678",
    "status": "outgoing",
    "notes": "Robocall: Auto dialing...",
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

**Check Status:**

```bash
GET /api/yalecom/robocall?call_id=robocall-1699123456789
```

---

### 2. Webhook (รับสาย)

**POST** `/api/webhooks/yalecom-call`

**Yalecom จะส่ง Webhook Payload:**

```json
{
  "call_id": "call-123456",
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
}
```

**Supported Events:**

- `call_started` - เริ่มสาย
- `call_ringing` - กำลังดังสาย (รอรับ)
- `call_answered` - รับสายแล้ว
- `call_ended` - จบสาย

**Response:**

```json
{
  "success": true,
  "message": "Incoming call webhook processed",
  "data": {
    "id": "call-123456",
    "name": "Agent 101",
    "company": "Sales Queue",
    "phone": "0812345678",
    "status": "received",
    "lastContact": "2025-11-07T10:00:00.000Z",
    "notes": "สายเข้าจาก Queue 900",
    "createdAt": "2025-11-07T10:00:00.000Z"
  }
}
```

---

### 3. Queue Status API (รอสาย & SALE ติดต่อ)

**GET** `/api/yalecom/queue-status?queue_extension=900`

**Response:**

```json
{
  "success": true,
  "data": {
    "queue_name": "Sales Queue",
    "queue_extension": "900",
    "waiting_calls_in_queue": 2,
    "agents": [
      {
        "agent_id": "101",
        "agent_name": "Agent 101",
        "agent_queue_status": "Ringing", // ← รอสาย
        "agent_outbound_callee_number": "",
        "agent_queue_caller_number": "0812345678"
      },
      {
        "agent_id": "102",
        "agent_name": "Agent 102",
        "agent_queue_status": "InCall", // ← SALE ติดต่อ
        "agent_outbound_callee_number": "",
        "agent_queue_caller_number": "0823456789"
      },
      {
        "agent_id": "103",
        "agent_name": "Agent 103",
        "agent_queue_status": "Outbound", // ← โทรออก
        "agent_outbound_callee_number": "0834567890",
        "agent_queue_caller_number": ""
      }
    ]
  }
}
```

---

## การตั้งค่า Yalecom Webhook

### ขั้นตอนการตั้งค่าใน Yalecom Portal:

1. เข้า Yalecom Dashboard
2. ไปที่ **Settings** → **Webhooks**
3. สร้าง Webhook ใหม่:

   - **URL**: `https://tpp-thanakon.store/api/webhooks/yalecom-call`
   - **Events**: เลือก `call_ringing`, `call_answered`, `call_started`, `call_ended`
   - **Method**: POST
   - **Content-Type**: application/json

4. บันทึกและทดสอบ Webhook

---

## สถานะที่ใช้ใน Dashboard

| Status     | Label       | API/Webhook      | agent_queue_status          |
| ---------- | ----------- | ---------------- | --------------------------- |
| `outgoing` | โทรออก      | Robocall API     | `Outbound`, `Dialing`       |
| `received` | รับสาย      | Webhook          | `call_ringing` (event)      |
| `waiting`  | รอสาย       | Queue Status API | `Ringing`                   |
| `sale`     | SALE ติดต่อ | Queue Status API | `InCall`, `Inbound`, `Busy` |

---

## ตัวอย่างการใช้งาน

### 1. เริ่มต้น Robocall (โทรออก)

```javascript
const response = await fetch("/api/yalecom/robocall", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone_number: "0812345678",
    agent_id: "101",
    campaign_name: "Sales Campaign",
    message: "Auto dialing...",
  }),
});

const result = await response.json();
console.log(result); // { success: true, data: {...} }
```

### 2. รับ Webhook จาก Yalecom (รับสาย)

Yalecom จะเรียก webhook อัตโนมัติเมื่อมีสายเข้า:

```
POST https://tpp-thanakon.store/api/webhooks/yalecom-call
```

### 3. เช็คสถานะ Queue (รอสาย & SALE ติดต่อ)

```javascript
const response = await fetch("/api/yalecom/queue-status?queue_extension=900");
const result = await response.json();

result.data.agents.forEach((agent) => {
  if (agent.agent_queue_status === "Ringing") {
    console.log(`${agent.agent_name} กำลังรอรับสาย`);
  } else if (agent.agent_queue_status === "InCall") {
    console.log(`${agent.agent_name} กำลัง SALE ติดต่อ`);
  }
});
```

---

## Environment Variables

เพิ่มใน `.env.local`:

```env
# Yalecom API
YALECOM_API_KEY=your_api_key_here
YALECOM_API_URL=https://api.yalecom.com
YALECOM_QUEUE_UUID=your_queue_uuid_here
YALECOM_QUEUE_EXTENSION=900

# Webhook Secret (สำหรับ verify webhook)
YALECOM_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## การทดสอบ Webhook

ใช้ `curl` หรือ Postman:

```bash
curl -X POST https://tpp-thanakon.store/api/webhooks/yalecom-call \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test-123",
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

---

## TODO: การบันทึกลง Database

ปัจจุบัน webhook และ API ยังไม่ได้บันทึกลง Database คุณต้องเพิ่มโค้ดบันทึกข้อมูล:

```typescript
// ตัวอย่างการบันทึกลง Supabase
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function saveContactToDatabase(contactData: ContactRecord) {
  const { data, error } = await supabase
    .from("customer_contacts")
    .insert([contactData]);

  if (error) {
    console.error("Error saving to database:", error);
    throw error;
  }

  return data;
}
```

---

## สรุป

✅ **Webhook Endpoint**: `/api/webhooks/yalecom-call`
✅ **Robocall API**: `/api/yalecom/robocall`
✅ **Queue Status API**: `/api/yalecom/queue-status`
✅ **Dashboard**: `/customer-contact-dashboard`

🔧 **Next Steps**:

1. ตั้งค่า Webhook URL ใน Yalecom Portal
2. เพิ่มการบันทึกลง Database
3. เพิ่ม Authentication/Authorization
4. เพิ่ม Webhook Signature Verification

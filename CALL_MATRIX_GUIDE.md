# 📊 Call Matrix System - คู่มือการใช้งาน

## 🎯 ภาพรวมระบบ

ระบบ Call Matrix ออกแบบมาเพื่อติดตามและสรุปการโทรออกของ Agent (101-108) แบ่งตามช่วงเวลา 11:00-19:00 น.

---

## 📋 การตั้งค่า Supabase

### 1. สร้าง Project ใน Supabase

1. ไปที่ https://supabase.com/
2. คลิก "New Project"
3. ตั้งชื่อ Project และรหัสผ่าน Database
4. เลือก Region ที่ใกล้ที่สุด (Southeast Asia)
5. รอจนกว่า Project จะสร้างเสร็จ

### 2. รัน SQL Schema

1. เปิด Supabase Dashboard
2. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
3. คลิก **"New Query"**
4. คัดลอกโค้ดจากไฟล์ `supabase-call-logs-schema.sql`
5. วางลงใน SQL Editor
6. คลิก **"Run"** หรือกด `Ctrl + Enter`

### 3. ตั้งค่า Environment Variables

เพิ่มค่าต่อไปนี้ใน `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**วิธีหา Credentials:**

1. ไปที่ Supabase Dashboard
2. เลือก **Settings** → **API**
3. คัดลอก:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🗄️ โครงสร้าง Database

### ตาราง 1: `agents` (ข้อมูล Agent)

```sql
- id (SERIAL)
- agent_id (VARCHAR) - '101', '102', ..., '108'
- agent_name (VARCHAR) - 'สา', 'พัชชา', etc.
- is_active (BOOLEAN)
- created_at, updated_at
```

### ตาราง 2: `call_logs` (บันทึกการโทร)

```sql
- id (SERIAL)
- agent_id (VARCHAR)
- customer_phone (VARCHAR)
- customer_name (VARCHAR)
- call_type ('outgoing', 'incoming', 'missed')
- call_status ('ringing', 'answered', 'busy', etc.)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- duration_seconds (INTEGER)
- notes (TEXT)
```

### ตาราง 3: `hourly_call_stats` (สรุปรายชั่วโมง)

```sql
- id (SERIAL)
- agent_id (VARCHAR)
- date (DATE)
- hour_slot (VARCHAR) - '11-12', '12-13', etc.
- outgoing_calls (INTEGER)
- incoming_calls (INTEGER)
- successful_calls (INTEGER)
- total_duration_seconds (INTEGER)
```

---

## 🚀 วิธีใช้งาน API

### 1. ดึงข้อมูล Call Matrix

**GET** `/api/call-matrix?date=2025-11-07`

**Response:**

```json
{
  "success": true,
  "date": "2025-11-07",
  "tableData": [
    {
      "hour_slot": "11-12",
      "agent_101": {
        "outgoing_calls": 5,
        "incoming_calls": 2,
        "successful_calls": 4,
        "total_duration_seconds": 1200
      },
      ...
    }
  ],
  "totals": {
    "hour_slot": "รวม",
    "agent_101": {
      "outgoing_calls": 45,
      ...
    }
  }
}
```

### 2. บันทึก Call Log

**POST** `/api/call-matrix`

**Request Body:**

```json
{
  "agent_id": "101",
  "customer_phone": "0812345678",
  "customer_name": "ลูกค้า A",
  "call_type": "outgoing",
  "call_status": "answered",
  "start_time": "2025-11-07T11:30:00Z",
  "end_time": "2025-11-07T11:35:00Z",
  "duration_seconds": 300,
  "notes": "ลูกค้าสนใจสินค้า"
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Call log saved successfully"
}
```

---

## 📱 การใช้งานในหน้า Dashboard

### แสดงตาราง Call Matrix

```tsx
import CallMatrixTable from "@/components/CallMatrixTable";

<CallMatrixTable />;
```

### คุณสมบัติ:

- ✅ แสดงจำนวนการโทรออกแบ่งตาม Agent และช่วงเวลา
- ✅ เลือกวันที่ได้
- ✅ สีแสดงระดับความเข้มข้นของการโทร
- ✅ แสดงผลรวมแต่ละคอลัมน์และแต่ละแถว
- ✅ รีเฟรชข้อมูลแบบ Real-time

---

## 🔄 ระบบทำงานอัตโนมัติ

### Trigger: Auto Update Hourly Stats

เมื่อมีการบันทึก `call_logs` ใหม่:

1. ระบบจะคำนวณ `hour_slot` อัตโนมัติ (เช่น 11:30:00 → '11-12')
2. อัพเดท `hourly_call_stats` โดยอัตโนมัติ
3. เพิ่มจำนวน `outgoing_calls`, `successful_calls` ตามสถานะ
4. รวมเวลาการโทรใน `total_duration_seconds`

---

## 📊 ตัวอย่างการใช้งาน

### 1. บันทึกการโทรออกด้วย JavaScript

```javascript
async function logCall(agentId, customerPhone, duration) {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 1000);

  const response = await fetch("/api/call-matrix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: agentId,
      customer_phone: customerPhone,
      call_type: "outgoing",
      call_status: "answered",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_seconds: duration,
    }),
  });

  return await response.json();
}

// ใช้งาน
await logCall("101", "0812345678", 300); // Agent 101 โทรออก 5 นาที
```

### 2. ดูข้อมูลใน Supabase Dashboard

```sql
-- ดูการโทรทั้งหมดวันนี้
SELECT * FROM call_logs
WHERE DATE(start_time) = CURRENT_DATE
ORDER BY start_time DESC;

-- ดูสรุปรายชั่วโมงวันนี้
SELECT * FROM hourly_call_stats
WHERE date = CURRENT_DATE
ORDER BY hour_slot;

-- ดูสรุปรายวัน
SELECT * FROM daily_call_summary
WHERE call_date = CURRENT_DATE;
```

### 3. Export ข้อมูลเป็น Excel

```sql
-- ใช้ Function get_call_matrix_for_date
SELECT * FROM get_call_matrix_for_date('2025-11-07');
```

---

## 🎨 สีในตาราง

| สาย  | สี     | ความหมาย        |
| ---- | ------ | --------------- |
| 0    | เทา    | ไม่มีการโทร     |
| 1-2  | ฟ้า    | โทรน้อย         |
| 3-5  | เขียว  | โทรปานกลาง      |
| 6-10 | เหลือง | โทรค่อนข้างเยอะ |
| 10+  | แดง    | โทรเยอะมาก      |

---

## 🔧 Troubleshooting

### ปัญหา: ไม่มีข้อมูลแสดงในตาราง

**วิธีแก้:**

1. ตรวจสอบว่ามีข้อมูลใน `call_logs`:
   ```sql
   SELECT COUNT(*) FROM call_logs WHERE DATE(start_time) = CURRENT_DATE;
   ```
2. ตรวจสอบ Trigger ทำงานหรือไม่:
   ```sql
   SELECT * FROM hourly_call_stats WHERE date = CURRENT_DATE;
   ```
3. ตรวจสอบ Environment Variables ใน `.env.local`

### ปัญหา: Trigger ไม่ทำงาน

**วิธีแก้:**

```sql
-- Re-create trigger
DROP TRIGGER IF EXISTS trigger_update_hourly_stats ON call_logs;
CREATE TRIGGER trigger_update_hourly_stats
AFTER INSERT ON call_logs
FOR EACH ROW EXECUTE FUNCTION update_hourly_call_stats();
```

---

## 📈 การขยายระบบ

### เพิ่ม Agent ใหม่ (109, 110, ...)

```sql
INSERT INTO agents (agent_id, agent_name)
VALUES ('109', 'ชื่อ Agent 109');
```

### เพิ่มช่วงเวลาใหม่ (19-20, 20-21, ...)

แก้ไขใน Component:

```tsx
const hourSlots = [
  "11-12",
  "12-13",
  ..."18-19",
  "19-20",
  "20-21", // เพิ่มช่วงใหม่
];
```

---

## 🔐 Security Best Practices

1. **Enable RLS (Row Level Security)** - เปิดใช้งานแล้วใน schema
2. **จำกัดสิทธิ์การเขียน** - ใช้ authenticated users เท่านั้น
3. **ตรวจสอบข้อมูล Input** - Validate ก่อนบันทึกลง database
4. **ใช้ Environment Variables** - ห้ามเปิดเผย API keys

---

## 📞 ติดต่อ & Support

หากมีปัญหาหรือข้อสงสัย:

- เปิด Issue ใน GitHub Repository
- ดูเอกสาร Supabase: https://supabase.com/docs
- ดูเอกสาร Next.js: https://nextjs.org/docs

---

**🎉 ระบบพร้อมใช้งานแล้ว!**

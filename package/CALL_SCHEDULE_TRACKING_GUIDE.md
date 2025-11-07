# คู่มือการใช้งาน Call Schedule Tracking System

## 📋 ภาพรวมระบบ

ระบบนี้ออกแบบมาเพื่อเก็บบันทึกการโทรของเซลล์ (Agent) แต่ละคนในแต่ละช่วงเวลา โดยใช้ Supabase เป็น Database

### โครงสร้างตาราง

1. **agents** - ข้อมูลเซลล์/พนักงาน (101-108)
2. **time_slots** - ช่วงเวลา (11-12:00 น., 12-13:00 น., ...)
3. **call_records** - บันทึกการโทรในแต่ละช่วงเวลา
4. **call_details** - รายละเอียดการโทรแต่ละสาย

---

## 🚀 การติดตั้งและตั้งค่า

### 1. สร้างโปรเจค Supabase

1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้างโปรเจคใหม่
3. จดบันทึก:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon/Public Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. รัน SQL Schema

1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. คัดลอกโค้ดจากไฟล์ `supabase-call-schedule-schema.sql`
3. วางและกด **Run**
4. ตรวจสอบว่าตารางถูกสร้างสำเร็จ

### 3. ตั้งค่า Environment Variables

สร้างหรือแก้ไขไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. ติดตั้ง Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 📊 โครงสร้างข้อมูล

### ตาราง: agents

| Field        | Type         | Description        |
| ------------ | ------------ | ------------------ |
| id           | UUID         | Primary Key        |
| agent_number | VARCHAR(10)  | เลขเซลล์ (101-108) |
| agent_name   | VARCHAR(100) | ชื่อเซลล์          |
| is_active    | BOOLEAN      | สถานะใช้งาน        |

**ข้อมูลเริ่มต้น:**

- 101 - สา
- 102 - พัชชา
- 103 - ตั้งโอ๋
- 104 - Test
- 105 - จีน
- 106 - มุก
- 107 - เจ
- 108 - ว่าน

### ตาราง: time_slots

| Field      | Type        | Description  |
| ---------- | ----------- | ------------ |
| id         | UUID        | Primary Key  |
| start_time | TIME        | เวลาเริ่มต้น |
| end_time   | TIME        | เวลาสิ้นสุด  |
| slot_label | VARCHAR(50) | ชื่อช่วงเวลา |
| sort_order | INTEGER     | ลำดับแสดงผล  |

**ข้อมูลเริ่มต้น:**

- 11-12:00 น.
- 12-13:00 น.
- 13-14:00 น.
- 15-16:00 น.
- 16-17:00 น.
- 17-18:00 น.

### ตาราง: call_records

| Field            | Type        | Description              |
| ---------------- | ----------- | ------------------------ |
| id               | UUID        | Primary Key              |
| agent_id         | UUID        | Foreign Key → agents     |
| time_slot_id     | UUID        | Foreign Key → time_slots |
| record_date      | DATE        | วันที่บันทึก             |
| total_calls      | INTEGER     | จำนวนสายทั้งหมด          |
| successful_calls | INTEGER     | จำนวนสายที่รับสาย        |
| failed_calls     | INTEGER     | จำนวนสายที่ไม่รับ        |
| status           | VARCHAR(50) | สถานะ                    |
| notes            | TEXT        | หมายเหตุ                 |
| duration_minutes | INTEGER     | ระยะเวลารวม (นาที)       |

### ตาราง: call_details

| Field                 | Type         | Description                    |
| --------------------- | ------------ | ------------------------------ |
| id                    | UUID         | Primary Key                    |
| call_record_id        | UUID         | Foreign Key → call_records     |
| agent_id              | UUID         | Foreign Key → agents           |
| customer_phone        | VARCHAR(20)  | เบอร์ลูกค้า                    |
| customer_name         | VARCHAR(100) | ชื่อลูกค้า                     |
| call_type             | VARCHAR(20)  | outgoing/incoming              |
| call_status           | VARCHAR(20)  | answered/busy/no_answer/failed |
| call_started_at       | TIMESTAMP    | เวลาเริ่มโทร                   |
| call_ended_at         | TIMESTAMP    | เวลาจบสาย                      |
| call_duration_seconds | INTEGER      | ระยะเวลา (วินาที)              |
| call_notes            | TEXT         | หมายเหตุ                       |
| yalecom_call_id       | VARCHAR(100) | ID จาก Yalecom                 |
| robocall_id           | INTEGER      | ID จาก Robocall                |

---

## 🔌 การใช้งาน API

### 1. ดึงข้อมูลการโทรวันนี้

**GET** `/api/call-schedule`

**Query Parameters:**

- `date` (optional) - วันที่ต้องการดู (YYYY-MM-DD) - default: วันนี้
- `agent_number` (optional) - เลขเซลล์ เช่น "101"
- `time_slot` (optional) - ช่วงเวลา เช่น "11-12:00 น."

**Example:**

```javascript
// ดึงข้อมูลทั้งหมดวันนี้
const response = await fetch("/api/call-schedule");
const data = await response.json();

// ดึงข้อมูลเฉพาะเซลล์ 101
const response = await fetch("/api/call-schedule?agent_number=101");

// ดึงข้อมูลวันที่ 2024-01-15
const response = await fetch("/api/call-schedule?date=2024-01-15");
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "record_date": "2024-01-15",
      "agent_number": "101",
      "agent_name": "สา",
      "slot_label": "11-12:00 น.",
      "start_time": "11:00:00",
      "end_time": "12:00:00",
      "total_calls": 10,
      "successful_calls": 8,
      "failed_calls": 2,
      "status": "จำนวนโทร",
      "duration_minutes": 45,
      "notes": null
    }
  ],
  "count": 1
}
```

### 2. บันทึก/อัพเดทข้อมูลการโทร

**POST** `/api/call-schedule`

**Request Body:**

```json
{
  "agent_number": "101",
  "slot_label": "11-12:00 น.",
  "record_date": "2024-01-15",
  "total_calls": 10,
  "successful_calls": 8,
  "failed_calls": 2,
  "status": "จำนวนโทร",
  "notes": "โทรไปครบแล้ว",
  "duration_minutes": 45
}
```

**Example:**

```javascript
const response = await fetch("/api/call-schedule", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agent_number: "101",
    slot_label: "11-12:00 น.",
    total_calls: 10,
    successful_calls: 8,
    failed_calls: 2,
    status: "จำนวนโทร",
  }),
});

const result = await response.json();
console.log(result);
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* call_record object */
  },
  "message": "Call record updated successfully"
}
```

### 3. ดูสรุปการโทรรายวัน

**GET** `/api/call-schedule/daily-summary`

**Query Parameters:**

- `date` (optional) - วันที่ต้องการดู - default: วันนี้
- `agent_number` (optional) - เลขเซลล์

**Example:**

```javascript
const response = await fetch(
  "/api/call-schedule/daily-summary?date=2024-01-15"
);
const data = await response.json();
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "record_date": "2024-01-15",
      "agent_number": "101",
      "agent_name": "สา",
      "total_calls": 50,
      "successful_calls": 40,
      "failed_calls": 10,
      "total_duration_minutes": 180,
      "time_slots_worked": 4
    }
  ],
  "count": 1
}
```

### 4. บันทึกรายละเอียดการโทรแต่ละสาย

**POST** `/api/call-schedule/call-details`

**Request Body:**

```json
{
  "call_record_id": "uuid-of-call-record",
  "agent_number": "101",
  "customer_phone": "0812345678",
  "customer_name": "คุณสมชาย",
  "call_type": "outgoing",
  "call_status": "answered",
  "call_started_at": "2024-01-15T11:30:00Z",
  "call_ended_at": "2024-01-15T11:35:00Z",
  "call_duration_seconds": 300,
  "call_notes": "ลูกค้าสนใจสินค้า",
  "call_result": "ขายสำเร็จ",
  "yalecom_call_id": "YC123456",
  "robocall_id": 789
}
```

**Example:**

```javascript
const response = await fetch("/api/call-schedule/call-details", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agent_number: "101",
    customer_phone: "0812345678",
    call_type: "outgoing",
    call_status: "answered",
    call_started_at: new Date().toISOString(),
    call_duration_seconds: 300,
  }),
});
```

### 5. ดูรายละเอียดการโทร

**GET** `/api/call-schedule/call-details`

**Query Parameters:**

- `call_record_id` (optional) - ID ของ call_record
- `agent_number` (optional) - เลขเซลล์
- `date` (optional) - วันที่

**Example:**

```javascript
// ดูการโทรทั้งหมดของเซลล์ 101 วันนี้
const response = await fetch(
  "/api/call-schedule/call-details?agent_number=101&date=2024-01-15"
);
const data = await response.json();
```

---

## 💡 ตัวอย่างการใช้งาน

### ตัวอย่าง 1: บันทึกข้อมูลการโทรแบบง่าย

```typescript
async function recordCall(
  agentNumber: string,
  timeSlot: string,
  totalCalls: number
) {
  const response = await fetch("/api/call-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_number: agentNumber,
      slot_label: timeSlot,
      total_calls: totalCalls,
      status: "จำนวนโทร",
    }),
  });

  return response.json();
}

// บันทึกว่าเซลล์ 101 โทรไป 10 สายในช่วง 11-12:00 น.
await recordCall("101", "11-12:00 น.", 10);
```

### ตัวอย่าง 2: ดึงข้อมูลแสดงในตาราง

```typescript
async function getCallSchedule(date: string) {
  const response = await fetch(`/api/call-schedule?date=${date}`);
  const result = await response.json();

  if (result.success) {
    // จัดกลุ่มข้อมูลตาม time_slot และ agent
    const schedule: any = {};

    result.data.forEach((record: any) => {
      if (!schedule[record.slot_label]) {
        schedule[record.slot_label] = {};
      }
      schedule[record.slot_label][record.agent_number] = record;
    });

    return schedule;
  }

  return null;
}

// แสดงข้อมูลในตาราง
const schedule = await getCallSchedule("2024-01-15");
console.log(schedule);
// {
//   "11-12:00 น.": {
//     "101": { total_calls: 10, ... },
//     "102": { total_calls: 8, ... }
//   },
//   "12-13:00 น.": { ... }
// }
```

### ตัวอย่าง 3: บันทึกการโทรจาก Yalecom API

```typescript
async function saveCallFromYalecom(yalecomData: any) {
  // 1. บันทึก call_record
  const callRecordResponse = await fetch("/api/call-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_number: yalecomData.agent_id,
      slot_label: getCurrentTimeSlot(),
      total_calls: 1,
    }),
  });

  const callRecordResult = await callRecordResponse.json();

  // 2. บันทึก call_detail
  if (callRecordResult.success) {
    await fetch("/api/call-schedule/call-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        call_record_id: callRecordResult.data.id,
        agent_number: yalecomData.agent_id,
        customer_phone: yalecomData.caller_number,
        call_type: "incoming",
        call_status: "answered",
        call_started_at: new Date().toISOString(),
        yalecom_call_id: yalecomData.call_id,
      }),
    });
  }
}

function getCurrentTimeSlot() {
  const hour = new Date().getHours();
  if (hour >= 11 && hour < 12) return "11-12:00 น.";
  if (hour >= 12 && hour < 13) return "12-13:00 น.";
  if (hour >= 13 && hour < 14) return "13-14:00 น.";
  if (hour >= 15 && hour < 16) return "15-16:00 น.";
  if (hour >= 16 && hour < 17) return "16-17:00 น.";
  if (hour >= 17 && hour < 18) return "17-18:00 น.";
  return "11-12:00 น.";
}
```

### ตัวอย่าง 4: แสดงสรุปการโทรรายวัน

```typescript
async function showDailySummary(date: string) {
  const response = await fetch(`/api/call-schedule/daily-summary?date=${date}`);
  const result = await response.json();

  if (result.success) {
    console.log("📊 สรุปการโทรรายวัน:", date);
    console.log("---");

    result.data.forEach((agent: any) => {
      console.log(`${agent.agent_name} (${agent.agent_number})`);
      console.log(`  ✓ โทรทั้งหมด: ${agent.total_calls} สาย`);
      console.log(`  ✓ รับสาย: ${agent.successful_calls} สาย`);
      console.log(`  ✗ ไม่รับ: ${agent.failed_calls} สาย`);
      console.log(`  ⏱️ เวลารวม: ${agent.total_duration_minutes} นาที`);
      console.log(`  🕐 ช่วงเวลาที่ทำ: ${agent.time_slots_worked} ช่วง`);
      console.log("---");
    });
  }
}

await showDailySummary("2024-01-15");
```

---

## 🎯 Use Cases

### 1. ระบบติดตามการทำงานของเซลล์

ใช้บันทึกว่าแต่ละเซลล์โทรออกกี่สายในแต่ละช่วงเวลา และมีผลการโทรอย่างไร

### 2. Dashboard แสดงสถานะ Real-time

ดึงข้อมูลจาก API มาแสดงในหน้า Dashboard ว่าตอนนี้เซลล์แต่ละคนกำลังทำอะไร

### 3. รายงานประสิทธิภาพ

ใช้ View `v_daily_call_summary` และ `v_time_slot_summary` สร้างรายงานประสิทธิภาพการทำงาน

### 4. Integration กับระบบอื่น

บันทึกข้อมูลจาก Yalecom API และ Robocall API ลงในระบบเพื่อเก็บประวัติการโทร

---

## 🛠️ Tips & Best Practices

### 1. Auto-increment Total Calls

แทนที่จะส่ง `total_calls` ทั้งหมด ให้เพิ่มทีละ 1:

```typescript
async function incrementCallCount(agentNumber: string, timeSlot: string) {
  // ดึงข้อมูลปัจจุบัน
  const response = await fetch(
    `/api/call-schedule?agent_number=${agentNumber}&time_slot=${encodeURIComponent(
      timeSlot
    )}`
  );
  const result = await response.json();

  const currentCalls = result.data[0]?.total_calls || 0;

  // บันทึกใหม่
  await fetch("/api/call-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_number: agentNumber,
      slot_label: timeSlot,
      total_calls: currentCalls + 1,
    }),
  });
}
```

### 2. Batch Update

อัพเดทหลาย record พร้อมกัน:

```typescript
async function batchUpdateCallRecords(records: any[]) {
  const promises = records.map((record) =>
    fetch("/api/call-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
  );

  const results = await Promise.all(promises);
  return results;
}
```

### 3. Error Handling

```typescript
async function safeRecordCall(data: any) {
  try {
    const response = await fetch("/api/call-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Failed to record call:", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error recording call:", error);
    return null;
  }
}
```

---

## 📈 Query ที่มีประโยชน์

### ดู Top 3 เซลล์ที่โทรมากที่สุดวันนี้

```sql
SELECT
  agent_number,
  agent_name,
  total_calls
FROM v_daily_call_summary
WHERE record_date = CURRENT_DATE
ORDER BY total_calls DESC
LIMIT 3;
```

### ดูช่วงเวลาที่มีการโทรมากที่สุด

```sql
SELECT
  slot_label,
  SUM(total_calls) as total
FROM v_call_schedule
WHERE record_date = CURRENT_DATE
GROUP BY slot_label
ORDER BY total DESC;
```

### ดูเซลล์ที่ยังไม่ได้บันทึกข้อมูลวันนี้

```sql
SELECT a.agent_number, a.agent_name
FROM agents a
WHERE a.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM call_records cr
    WHERE cr.agent_id = a.id
      AND cr.record_date = CURRENT_DATE
  );
```

---

## 🔒 Security

- ระบบใช้ Row Level Security (RLS) ของ Supabase
- อนุญาตให้อ่านข้อมูลได้ทุกคน (public read)
- เฉพาะ authenticated users เท่านั้นที่แก้ไขข้อมูลได้

---

## 📞 Support

หากมีปัญหาหรือคำถาม สามารถตรวจสอบได้ที่:

1. Supabase Dashboard → Logs
2. Browser Console (F12) → Network Tab
3. ตรวจสอบ API Response ว่า return error message อะไร

---

## 🎉 สรุป

ระบบนี้ช่วยให้คุณ:

- ✅ เก็บบันทึกการโทรของแต่ละเซลล์แบบเรียลไทม์
- ✅ ดูสถิติและสรุปการโทรรายวัน
- ✅ Integration กับ Yalecom และ Robocall API
- ✅ สร้างรายงานประสิทธิภาพการทำงาน
- ✅ ปรับขนาดได้ง่าย รองรับข้อมูลจำนวนมาก

เริ่มต้นใช้งานได้เลย! 🚀

# 🔗 Webhook Integration: Google Sheets → API → Supabase

คู่มือการติดตั้งและใช้งาน Webhook สำหรับส่งข้อมูล Surgery Schedule จาก Google Sheets ไปยัง Supabase Database

---

## 📋 ภาพรวมระบบ

```
Google Sheets (ข้อมูล Surgery Schedule)
        ↓
  Google Apps Script (Webhook Sender)
        ↓
  Next.js API Endpoint (/api/webhooks/surgery-schedule)
        ↓
  Supabase Database (film_data table)
        ↓
  Performance Surgery Schedule Dashboard (แสดงผล)
```

---

## 🚀 ขั้นตอนการติดตั้ง

### 1️⃣ ตั้งค่า Environment Variables

เพิ่มใน `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://houhlbfagngkyrbbhmmi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Webhook Secret (สำหรับ authentication)
SURGERY_SCHEDULE_WEBHOOK_SECRET=your-secret-key-here
```

**วิธีหา Supabase Keys:**

1. ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/settings/api
2. คัดลอก:
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (ระวัง! ห้ามเปิดเผย)

**วิธีสร้าง Webhook Secret:**

```powershell
# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

หรือใช้ online generator: https://www.random.org/strings/

---

### 2️⃣ Deploy API Endpoint

#### Local Development

```powershell
# ติดตั้ง dependencies
npm install @supabase/supabase-js

# รัน development server
npm run dev
```

API จะพร้อมใช้งานที่: `http://localhost:3000/api/webhooks/surgery-schedule`

#### Production (Vercel)

1. Deploy โปรเจ็กต์ไปยัง Vercel:

```powershell
vercel --prod
```

2. เพิ่ม Environment Variables ใน Vercel Dashboard:

   - ไปที่: https://vercel.com/your-project/settings/environment-variables
   - เพิ่ม variables ทั้ง 4 ตัว

3. Redeploy หลังจากเพิ่ม variables:

```powershell
vercel --prod
```

API จะพร้อมใช้งานที่: `https://your-domain.vercel.app/api/webhooks/surgery-schedule`

---

### 3️⃣ ทดสอบ API Endpoint

#### ทดสอบด้วย PowerShell

```powershell
# ทดสอบ GET (ดูข้อมูล endpoint)
Invoke-RestMethod -Uri "http://localhost:3000/api/webhooks/surgery-schedule" -Method Get | ConvertTo-Json

# ทดสอบ POST (ส่งข้อมูลทดสอบ)
$body = @{
  doctor = "หมอทดสอบ"
  contact_person = "สา"
  customer_name = "คุณทดสอบ"
  phone_number = "0812345678"
  date_consult_scheduled = "2025-11-15"
  proposed_amount = "50000"
} | ConvertTo-Json

$headers = @{
  "Content-Type" = "application/json"
  "Authorization" = "Bearer your-webhook-secret-here"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/webhooks/surgery-schedule" `
  -Method Post `
  -Body $body `
  -Headers $headers `
  -ContentType "application/json" | ConvertTo-Json
```

#### ทดสอบด้วย curl

```bash
# ทดสอบ GET
curl http://localhost:3000/api/webhooks/surgery-schedule

# ทดสอบ POST
curl -X POST http://localhost:3000/api/webhooks/surgery-schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-webhook-secret-here" \
  -d '{
    "doctor": "หมอทดสอบ",
    "contact_person": "สา",
    "customer_name": "คุณทดสอบ",
    "phone_number": "0812345678",
    "date_consult_scheduled": "2025-11-15",
    "proposed_amount": "50000"
  }'
```

---

### 4️⃣ ติดตั้ง Google Apps Script

#### A. เปิด Script Editor

1. เปิด Google Sheets ที่มีข้อมูล Surgery Schedule
2. คลิก **Extensions** → **Apps Script**
3. ลบโค้ดเดิมทั้งหมด

#### B. คัดลอกโค้ด

1. เปิดไฟล์: `docs/google-apps-script-webhook.js`
2. คัดลอกโค้ดทั้งหมด
3. Paste ลงใน Apps Script Editor

#### C. ปรับแต่งการตั้งค่า

แก้ไขส่วนนี้ให้ตรงกับของคุณ:

```javascript
// URL ของ API endpoint
const API_ENDPOINT =
  "https://your-domain.vercel.app/api/webhooks/surgery-schedule";

// Secret key สำหรับ authentication
const WEBHOOK_SECRET = "your-webhook-secret-here";

// ชื่อ Sheet ที่เก็บข้อมูล
const DATA_SHEET_NAME = "Sheet1"; // เปลี่ยนเป็นชื่อ sheet ของคุณ
```

#### D. ปรับ Column Mapping

ให้ตรงกับตำแหน่ง column ใน Google Sheets ของคุณ:

```javascript
const COLUMN_MAPPING = {
  doctor: 1, // Column A = หมอ
  contact_person: 2, // Column B = ผู้ติดต่อ (101-สา)
  customer_name: 3, // Column C = ชื่อลูกค้า
  phone_number: 4, // Column D = เบอร์โทร
  date_consult_scheduled: 5, // Column E = วันที่ได้นัด consult
  date_surgery_scheduled: 6, // Column F = วันที่ได้นัดผ่าตัด
  surgery_date: 7, // Column G = วันที่ผ่าตัดจริง
  appointment_time: 8, // Column H = เวลาที่นัด
  proposed_amount: 9, // Column I = ยอดนำเสนอ
  // ... เพิ่ม columns อื่นๆ ตามต้องการ
};
```

#### E. บันทึกและทดสอบ

1. คลิก **💾 Save** (Ctrl+S)
2. ตั้งชื่อโปรเจ็กต์ เช่น "Surgery Schedule Webhook"
3. รันฟังก์ชัน `testConnection` เพื่อทดสอบ:
   - เลือก `testConnection` จาก dropdown
   - คลิก **▶ Run**
   - ดู logs ด้านล่าง (ควรเห็น "✅ API connection successful!")

---

### 5️⃣ ตั้งค่า Auto-Sync (Trigger)

#### A. สร้าง Trigger สำหรับ onEdit

1. คลิกที่ไอคอน **⏰ Triggers** (ด้านซ้าย)
2. คลิก **+ Add Trigger**
3. ตั้งค่าดังนี้:
   - **Choose which function to run**: `onSheetEdit`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `From spreadsheet`
   - **Select event type**: `On edit`
4. คลิก **Save**
5. Authorize (คลิก Review Permissions → Allow)

#### B. สร้าง Trigger สำหรับ onOpen (Optional)

เพื่อให้มีเมนู "🔄 Sync to Database" ใน Google Sheets:

1. คลิก **+ Add Trigger**
2. ตั้งค่า:
   - **Function**: `onOpen`
   - **Event source**: `From spreadsheet`
   - **Event type**: `On open`
3. คลิก **Save**

---

## 🎯 วิธีใช้งาน

### 1️⃣ Sync ข้อมูลทั้งหมดครั้งแรก

1. เปิด Google Sheets
2. คลิกเมนู **🔄 Sync to Database** → **📤 Send All Data**
3. รอสักครู่ (ประมาณ 1-2 นาที สำหรับข้อมูล 100 แถว)
4. ตรวจสอบ logs: คลิก **🔄 Sync to Database** → **📚 View Logs**

### 2️⃣ Auto-Sync เมื่อแก้ไขข้อมูล

หลังจากตั้งค่า Trigger แล้ว:

- **แก้ไขข้อมูล**: จะส่งไปยัง API อัตโนมัติ
- **เพิ่มแถวใหม่**: จะส่งไปยัง API อัตโนมัติ

### 3️⃣ ดูผลลัพธ์

1. ไปที่: http://localhost:3000/performance-surgery-schedule
2. ข้อมูลจะแสดงในตาราง P (วันที่ได้นัด) และ L (วันที่ผ่าตัด)
3. คลิกที่เซลล์ที่มีตัวเลขเพื่อดูรายละเอียด

---

## 📊 ฟอร์แมตข้อมูลที่รองรับ

### วันที่ (Date Fields)

รองรับหลายฟอร์แมต:

- **ISO format**: `2025-11-15` (แนะนำ)
- **Thai format**: `15/11/2025` หรือ `15/11/25`
- **Date object**: จาก Google Sheets (จะแปลงอัตโนมัติ)

### ผู้ติดต่อ (Contact Person)

รองรับทั้ง:

- `101-สา` → จะแปลงเป็น `สา`
- `สา` → ใช้ได้เลย

### เวลา (Appointment Time)

ฟอร์แมต: `HH:MM:SS` เช่น `10:00:00`, `14:30:00`

---

## 🔍 Troubleshooting

### ❌ Error: "Unauthorized"

**สาเหตุ**: `WEBHOOK_SECRET` ใน Google Apps Script ไม่ตรงกับ `SURGERY_SCHEDULE_WEBHOOK_SECRET` ใน `.env.local`

**วิธีแก้:**

1. ตรวจสอบ secret ใน `.env.local`
2. อัพเดท `WEBHOOK_SECRET` ใน Google Apps Script
3. บันทึกและลองใหม่

### ❌ Error: "Missing Supabase environment variables"

**สาเหตุ**: ยังไม่ได้ตั้งค่า `SUPABASE_SERVICE_ROLE_KEY` ใน `.env.local`

**วิธีแก้:**

1. เพิ่ม `SUPABASE_SERVICE_ROLE_KEY` ใน `.env.local`
2. รีสตาร์ท dev server: `npm run dev`

### ❌ Error: "Sheet not found"

**สาเหตุ**: `DATA_SHEET_NAME` ใน Google Apps Script ไม่ตรงกับชื่อ sheet จริง

**วิธีแก้:**

1. ตรวจสอบชื่อ sheet ใน Google Sheets (ด้านล่างซ้าย)
2. อัพเดท `DATA_SHEET_NAME` ใน Google Apps Script
3. บันทึกและลองใหม่

### ❌ ข้อมูลไม่แสดงใน Dashboard

**วิธีตรวจสอบ:**

1. **ตรวจสอบว่าข้อมูลเข้า Supabase หรือไม่:**

   - ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor
   - เปิดตาราง `film_data`
   - ดูว่ามีข้อมูลหรือไม่

2. **ตรวจสอบฟอร์แมตวันที่:**

   - วันที่ต้องเป็น ISO format (YYYY-MM-DD)
   - ตรวจสอบใน Supabase Table Editor

3. **ตรวจสอบชื่อผู้ติดต่อ:**
   - ต้องตรงกับ `CONTACT_PERSON_MAPPING` ใน `utils/googleSheets.ts`
   - เช่น: "สา", "พัชชา", "ตั้งโอ๋", ฯลฯ

### 🐛 Debug Mode

เปิด Browser Console (F12) เมื่อใช้งาน Dashboard:

```javascript
// ดูข้อมูลที่ถูก fetch จาก Supabase
console.log("Surgery data:", data);

// ดู logs จาก Supabase query
console.log("Supabase response:", supabaseResponse);
```

---

## 📈 Performance & Best Practices

### Batch Size

Google Apps Script จะส่งข้อมูลแบบ batch (ครั้งละ 100 records) เพื่อไม่ให้เกิน API rate limit

### Rate Limiting

มี delay 1 วินาทีระหว่าง batch เพื่อป้องกัน rate limit

### Error Handling

- API จะคืนค่า status code 200 พร้อมรายละเอียดการประมวลผล
- ถ้ามี error, จะระบุว่า record ไหน error และเพราะอะไร

---

## 🔒 Security

### Environment Variables

- **ห้าม** commit `.env.local` เข้า Git
- **ห้าม** เปิดเผย `SUPABASE_SERVICE_ROLE_KEY`
- **ห้าม** เปิดเผย `WEBHOOK_SECRET`

### API Authentication

API endpoint ใช้ Bearer token authentication:

```http
Authorization: Bearer your-webhook-secret-here
```

### Supabase RLS

ตรวจสอบว่ามี Row Level Security (RLS) policies ที่เหมาะสม:

```sql
-- อนุญาตให้ service role เขียนข้อมูลได้
CREATE POLICY "Allow service role insert" ON film_data
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

---

## 📚 API Documentation

### Endpoint

```
POST /api/webhooks/surgery-schedule
```

### Headers

```http
Content-Type: application/json
Authorization: Bearer YOUR_WEBHOOK_SECRET
```

### Request Body (Single Record)

```json
{
  "doctor": "หมอสมชาย",
  "contact_person": "สา",
  "customer_name": "คุณสมศรี",
  "phone_number": "0812345678",
  "date_consult_scheduled": "2025-11-15",
  "date_surgery_scheduled": "2025-11-20",
  "surgery_date": "2025-11-20",
  "appointment_time": "10:00:00",
  "proposed_amount": "50000"
}
```

### Request Body (Multiple Records)

```json
[
  {
    /* record 1 */
  },
  {
    /* record 2 */
  },
  {
    /* record 3 */
  }
]
```

### Response (Success)

```json
{
  "success": true,
  "processed": 3,
  "failed": 0,
  "results": [
    {
      "action": "inserted",
      "data": {
        /* inserted record */
      }
    },
    {
      "action": "updated",
      "data": {
        /* updated record */
      }
    }
  ]
}
```

### Response (Error)

```json
{
  "error": "Internal server error",
  "message": "Error details here"
}
```

---

## 🎉 เสร็จสิ้น!

ตอนนี้ระบบของคุณพร้อมใช้งานแล้ว! 🚀

**ลำดับการทำงาน:**

1. แก้ไขข้อมูลใน Google Sheets
2. Google Apps Script ส่งข้อมูลไปยัง API อัตโนมัติ
3. API บันทึกข้อมูลลง Supabase
4. Dashboard แสดงข้อมูลแบบ real-time (refresh ทุก 30 วินาที)

**เอกสารเพิ่มเติม:**

- [API Route Code](../src/app/api/webhooks/surgery-schedule/route.ts)
- [Google Apps Script](./google-apps-script-webhook.js)
- [Supabase Integration](../SUPABASE_SURGERY_SCHEDULE_INTEGRATION.md)
- [Dashboard Page](<../src/app/(fullscreen)/performance-surgery-schedule/page.tsx>)

---

**สร้างโดย**: GitHub Copilot  
**วันที่**: 12 พฤศจิกายน 2025  
**เวอร์ชัน**: 1.0

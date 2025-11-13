# 🔧 แก้ปัญหา "No data found in film_data table"

## ❌ ปัญหา

ระบบแสดง error: `No data found in film_data table`

นี่หมายความว่า:

- ตาราง `film_data` ยังไม่มีข้อมูล หรือ
- ข้อมูลที่มีไม่มีฟิลด์ `date_surgery_scheduled` หรือ `surgery_date`

---

## ✅ วิธีแก้ไข

### 1️⃣ ตรวจสอบว่ามีตาราง film_data หรือไม่

1. เปิด: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor
2. ไปที่ **Table Editor** (เมนูซ้าย)
3. ตรวจสอบว่ามีตาราง `film_data`

**ถ้าไม่มีตาราง** → ไปทำขั้นตอนที่ 2

**ถ้ามีตารางแล้ว** → ไปทำขั้นตอนที่ 3

---

### 2️⃣ สร้างตาราง film_data

#### วิธีที่ 1: ใช้ SQL Editor (แนะนำ)

1. ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/sql/new
2. วางโค้ด SQL นี้:

```sql
-- Create film_data table
CREATE TABLE IF NOT EXISTS public.film_data (
  id BIGSERIAL PRIMARY KEY,
  status TEXT,
  source TEXT,
  interested_product TEXT,
  doctor TEXT,
  contact_person TEXT,
  customer_name TEXT,
  phone_number TEXT,
  notes TEXT,
  last_follow_up_date DATE,
  next_follow_up_date DATE,
  consult_date DATE,
  surgery_date DATE,
  appointment_time TIME,
  date_received_contact DATE,
  date_consult_scheduled DATE,
  date_surgery_scheduled DATE,
  proposed_amount TEXT,
  customer_code TEXT,
  starred TEXT,
  country TEXT,
  pickup_time INTEGER,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_film_data_contact_person ON film_data(contact_person);
CREATE INDEX IF NOT EXISTS idx_film_data_surgery_date ON film_data(surgery_date);
CREATE INDEX IF NOT EXISTS idx_film_data_date_surgery_scheduled ON film_data(date_surgery_scheduled);

-- Enable Row Level Security
ALTER TABLE film_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access
CREATE POLICY "Allow public read access" ON film_data
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_film_data_updated_at
  BEFORE UPDATE ON film_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. คลิก **Run** (หรือกด Ctrl+Enter)

---

### 3️⃣ นำเข้าข้อมูล

คุณมี 3 วิธีในการนำเข้าข้อมูล:

#### วิธีที่ 1: นำเข้าจาก CSV (ง่ายที่สุด) ⭐

ถ้าคุณมีไฟล์ CSV:

1. ไปที่ Table Editor
2. เลือกตาราง `film_data`
3. คลิก **Insert** → **Import data via spreadsheet**
4. อัปโหลดไฟล์ CSV
5. ตรวจสอบการ map คอลัมน์
6. คลิก **Import**

#### วิธีที่ 2: เพิ่มข้อมูลทดสอบด้วย SQL

ถ้าต้องการทดสอบก่อน ให้วางโค้ดนี้ใน SQL Editor:

```sql
-- Insert sample surgery schedule data
INSERT INTO film_data (
  doctor,
  contact_person,
  customer_name,
  phone_number,
  date_surgery_scheduled,
  surgery_date,
  appointment_time,
  proposed_amount,
  status,
  source
) VALUES
(
  'หมอสมชาย',
  'สา',
  'คุณสมศรี ใจดี',
  '0812345678',
  '2025-11-15',
  '2025-11-20',
  '10:00:00',
  '50000',
  'เป็นลูกค้าแล้ว',
  'Facebook'
),
(
  'หมอสมใจ',
  'พิชชา',
  'คุณสมหญิง รักสวย',
  '0823456789',
  '2025-11-18',
  '2025-11-25',
  '14:00:00',
  '75000',
  'เป็นลูกค้าแล้ว',
  'Offline'
),
(
  'หมอสมชาย',
  'ตั้งโอ๋',
  'คุณสมชาย มั่งคั่ง',
  '0834567890',
  '2025-11-20',
  '2025-11-28',
  '09:30:00',
  '100000',
  'เป็นลูกค้าแล้ว',
  'Tiktok'
);
```

#### วิธีที่ 3: ใช้ไฟล์ SQL จากที่มีอยู่แล้ว

ถ้าคุณมีไฟล์ SQL สำหรับนำเข้าข้อมูล (เช่น `bjh_film_data_inserts.sql`):

1. ไปที่ SQL Editor
2. คัดลอกเนื้อหาจากไฟล์ SQL
3. วางและรัน

**หรือใช้ Supabase CLI:**

```bash
supabase db execute --file path/to/bjh_film_data_inserts.sql
```

---

### 4️⃣ ตรวจสอบข้อมูล

หลังจากนำเข้าข้อมูลแล้ว ให้ตรวจสอบ:

```sql
-- ดูข้อมูลทั้งหมด
SELECT * FROM film_data LIMIT 10;

-- นับจำนวนข้อมูล
SELECT COUNT(*) as total FROM film_data;

-- นับจำนวนที่มีวันที่นัดผ่าตัด
SELECT COUNT(*) as with_surgery_schedule
FROM film_data
WHERE date_surgery_scheduled IS NOT NULL;

-- นับจำนวนที่มีวันที่ผ่าตัด
SELECT COUNT(*) as with_surgery_date
FROM film_data
WHERE surgery_date IS NOT NULL;

-- ดูข้อมูลแยกตามผู้ติดต่อ
SELECT
  contact_person,
  COUNT(*) as count
FROM film_data
WHERE date_surgery_scheduled IS NOT NULL
   OR surgery_date IS NOT NULL
GROUP BY contact_person
ORDER BY count DESC;
```

---

### 5️⃣ รีเฟรชหน้าเว็บ

หลังจากนำเข้าข้อมูลแล้ว:

1. กลับไปที่หน้า Performance Surgery Schedule
2. กด **F5** เพื่อรีเฟรช
3. หรือคลิกปุ่ม **🔄 รีเฟรชข้อมูล**

---

## 🔍 ตรวจสอบเพิ่มเติม

### ตรวจสอบว่า RLS Policy ถูกต้อง

ถ้ายังไม่แสดงข้อมูล ให้ตรวจสอบ RLS:

```sql
-- ดู policies ที่มี
SELECT * FROM pg_policies WHERE tablename = 'film_data';

-- ถ้าไม่มี ให้สร้างใหม่
DROP POLICY IF EXISTS "Allow public read access" ON film_data;

CREATE POLICY "Allow public read access" ON film_data
  FOR SELECT
  USING (true);
```

### ตรวจสอบ Connection

เปิด Browser DevTools (F12) → Console แล้วรันคำสั่ง:

```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Key exists" : "Key missing"
);
```

---

## 📊 ข้อมูลที่ Performance Schedule ต้องการ

ระบบต้องการฟิลด์เหล่านี้:

| ฟิลด์ที่สำคัญ            | ใช้สำหรับ                    | จำเป็น |
| ------------------------ | ---------------------------- | ------ |
| `contact_person`         | ผู้ติดต่อ (สา, พิชชา, ฯลฯ)   | ✅     |
| `date_surgery_scheduled` | ตาราง P (วันที่ได้นัดผ่าตัด) | ✅     |
| `surgery_date`           | ตาราง L (วันที่ผ่าตัด)       | ✅     |
| `doctor`                 | หมอ                          | แนะนำ  |
| `customer_name`          | ชื่อลูกค้า                   | แนะนำ  |
| `phone_number`           | เบอร์โทร                     | แนะนำ  |
| `appointment_time`       | เวลานัด                      | แนะนำ  |
| `proposed_amount`        | ยอดนำเสนอ                    | แนะนำ  |

**หมายเหตุ:** ข้อมูลจะแสดงในตารางเฉพาะแถวที่มี `date_surgery_scheduled` หรือ `surgery_date` เท่านั้น

---

## 🎯 ตัวอย่างข้อมูลที่ดี

```json
{
  "contact_person": "สา",
  "date_surgery_scheduled": "2025-11-15",
  "surgery_date": "2025-11-20",
  "doctor": "หมอสมชาย",
  "customer_name": "คุณสมศรี",
  "phone_number": "0812345678",
  "appointment_time": "10:00:00",
  "proposed_amount": "50000"
}
```

---

## 📚 เอกสารเพิ่มเติม

- [คู่มือนำเข้าข้อมูล](c:\Users\Pac-Man45\Videos\Data\README.md)
- [Supabase Dashboard](https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi)
- [คู่มือการเชื่อมต่อ Supabase](SUPABASE_SURGERY_SCHEDULE_INTEGRATION.md)

---

**อัพเดท**: 11 พฤศจิกายน 2025

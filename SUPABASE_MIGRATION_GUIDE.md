# 🔗 วิธีเชื่อมต่อ Supabase กับโปรเจ็ค

## 📋 ขั้นตอนที่ 1: ดึง Connection Details จาก Supabase

1. ไปที่ https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi
2. คลิก **Settings** (เกียร์ล่างซ้าย)
3. คลิก **Database**
4. ใน **Connection String** เลือก **URI**
5. คัดลอก URI ที่ขึ้นต้นด้วย `postgresql://postgres:[YOUR-PASSWORD]@...`

## 🗄️ ขั้นตอนที่ 2: Export ข้อมูลจาก PostgreSQL เดิม

### Export ตาราง bjh_all_leads

```powershell
# ตั้งค่า password
$env:PGPASSWORD = "Bjh12345!!"

# Export เฉพาะตาราง bjh_all_leads พร้อม schema
pg_dump -h 192.168.1.19 -U postgres -d postgres -n "BJH-Server" -t "BJH-Server.bjh_all_leads" --schema-only > schema.sql

# Export ข้อมูล
pg_dump -h 192.168.1.19 -U postgres -d postgres -n "BJH-Server" -t "BJH-Server.bjh_all_leads" --data-only > data.sql

# หรือ Export ทั้งหมดพร้อมกัน
pg_dump -h 192.168.1.19 -U postgres -d postgres -n "BJH-Server" -t "BJH-Server.bjh_all_leads" > full_backup.sql
```

### ถ้าไม่มี pg_dump ติดตั้งก่อน:

```powershell
# Download PostgreSQL Tools
# https://www.postgresql.org/download/windows/
# หรือใช้ผ่าน pgAdmin
```

## 📤 ขั้นตอนที่ 3: Import ข้อมูลไปยัง Supabase

### วิธีที่ 1: ใช้ Supabase SQL Editor (แนะนำ)

1. ไปที่ https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/sql
2. สร้าง Schema "BJH-Server" ก่อน:

```sql
-- สร้าง schema ถ้ายังไม่มี
CREATE SCHEMA IF NOT EXISTS "BJH-Server";

-- Set search path
SET search_path TO "BJH-Server", public;
```

3. คลิก **New Query**
4. Paste SQL จากไฟล์ `schema.sql` (โครงสร้างตาราง)
5. คลิก **Run**
6. สร้าง Query ใหม่ แล้ว Paste SQL จาก `data.sql` (ข้อมูล)
7. คลิก **Run**

### วิธีที่ 2: ใช้ psql Command Line

```powershell
# ดึง Connection String จาก Supabase (ตัวอย่าง)
$SUPABASE_URL = "postgresql://postgres:[YOUR-PASSWORD]@db.houhlbfagngkyrbbhmmi.supabase.co:5432/postgres"

# Import schema
psql $SUPABASE_URL -f schema.sql

# Import data
psql $SUPABASE_URL -f data.sql
```

## 🔧 ขั้นตอนที่ 4: อัปเดต Environment Variables

### สำหรับ Local Development

สร้างไฟล์ `.env.local`:

```env
DB_HOST=db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[YOUR-SUPABASE-PASSWORD]
DB_NAME=postgres
DB_SCHEMA=BJH-Server
NODE_ENV=development
```

### สำหรับ Vercel (Production)

1. ไปที่ https://vercel.com/thanakron-hongthongs-projects
2. เลือก Project: React-Business
3. Settings → Environment Variables
4. เพิ่มตัวแปรเหล่านี้:

```
DB_HOST=db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[YOUR-SUPABASE-PASSWORD]
DB_NAME=postgres
NODE_ENV=production
```

เลือก: ✅ Production, ✅ Preview, ✅ Development

## 🧪 ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อ

### ทดสอบ Local

```powershell
# สร้างไฟล์ .env.local ก่อน
npm run dev

# เปิด browser
# http://localhost:3000/customer-all-data
```

### ตรวจสอบข้อมูล

1. เปิด Supabase Dashboard
2. ไปที่ Table Editor
3. เลือก Schema: BJH-Server
4. เลือกตาราง: bjh_all_leads
5. ตรวจสอบว่าข้อมูลครบถ้วน

## 🔐 ความปลอดภัย

### อัปเดต Row Level Security (RLS)

ใน Supabase SQL Editor รัน:

```sql
-- Enable RLS
ALTER TABLE "BJH-Server".bjh_all_leads ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy สำหรับ Service Role (API)
CREATE POLICY "Allow service role full access"
ON "BJH-Server".bjh_all_leads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- หรือปิด RLS ถ้าต้องการให้ API เข้าถึงได้เลย (ไม่แนะนำ)
-- ALTER TABLE "BJH-Server".bjh_all_leads DISABLE ROW LEVEL SECURITY;
```

## 📊 เปรียบเทียบ Before/After

### ก่อน (Local PostgreSQL)

```
❌ ไม่สามารถเข้าถึงจาก Vercel
❌ ต้องเปิดเครื่องตลอด
❌ ไม่มี Backup อัตโนมัติ
❌ ต้องจัดการ Security เอง
```

### หลัง (Supabase)

```
✅ เข้าถึงได้จาก Vercel
✅ Available 24/7
✅ Backup อัตโนมัติ
✅ SSL/TLS enabled
✅ มี UI จัดการข้อมูล
✅ ฟรี 500MB
```

## 🚨 Troubleshooting

### ❌ "relation bjh_all_leads does not exist"

**แก้ไข**: ตรวจสอบว่าสร้าง schema "BJH-Server" แล้ว

### ❌ "permission denied for schema BJH-Server"

**แก้ไข**: รัน:

```sql
GRANT USAGE ON SCHEMA "BJH-Server" TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA "BJH-Server" TO postgres;
```

### ❌ "no pg_hba.conf entry"

**แก้ไข**: ใช้ Connection String จาก Supabase Dashboard (มี SSL ในตัว)

## 📞 ขั้นตอนถัดไป

1. ✅ Export ข้อมูลจาก 192.168.1.19
2. ✅ Import ไปยัง Supabase
3. ✅ อัปเดต .env.local
4. ✅ ทดสอบ Local
5. ✅ อัปเดต Vercel Environment Variables
6. ✅ Deploy to Vercel
7. ✅ ทดสอบ Production

---

## 🎯 Quick Start Commands

```powershell
# 1. Export
$env:PGPASSWORD = "Bjh12345!!"
pg_dump -h 192.168.1.19 -U postgres -d postgres -n "BJH-Server" > backup.sql

# 2. แก้ไข backup.sql (ถ้าจำเป็น)
# ลบบรรทัดที่เกี่ยวกับ extension หรือ permission ที่ Supabase ไม่รองรับ

# 3. Import to Supabase (ใช้ SQL Editor หรือ psql)

# 4. สร้าง .env.local
@"
DB_HOST=db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]
DB_NAME=postgres
"@ | Out-File -FilePath .env.local -Encoding UTF8

# 5. Test
npm run dev
```

ติดปัญหาตรงไหนบอกได้เลยครับ! 🚀

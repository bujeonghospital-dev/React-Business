# 🚀 Quick Start: ย้ายข้อมูลไป Supabase และ Deploy

## วิธีใช้งานอย่างรวดเร็ว

### ขั้นตอนที่ 1: รัน Migration Script

```powershell
.\migrate-to-supabase.ps1
```

**สคริปต์จะทำอะไร:**

- ✅ ตรวจสอบว่ามี pg_dump ติดตั้งหรือไม่
- ✅ Export Schema จาก Local PostgreSQL (192.168.1.19)
- ✅ Export Data จาก bjh_all_leads table
- ✅ สร้าง Full Backup
- ✅ (Optional) Import ไปยัง Supabase อัตโนมัติ

**ข้อมูลที่ต้องกรอก:**

1. Supabase Host (default: db.houhlbfagngkyrbbhmmi.supabase.co)
2. Supabase Password (ดูได้ที่ Supabase Dashboard)

---

### ขั้นตอนที่ 2: หา Supabase Password

1. เข้า https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/settings/database
2. ในส่วน **"Connection string"** คลิก **"Show"**
3. คัดลอก Password มา

---

### ขั้นตอนที่ 3: อัปเดต Environment Variables

#### สำหรับ Local Development:

```powershell
# เปลี่ยนชื่อไฟล์
Copy-Item .env.local.supabase .env.local

# แก้ไข DB_PASSWORD ใน .env.local
code .env.local
```

#### สำหรับ Vercel:

1. เข้า https://vercel.com/thanakron-hongthongs-projects
2. เลือก Project
3. ไปที่ **Settings → Environment Variables**
4. เพิ่มตัวแปรเหล่านี้:

```
DB_HOST = db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT = 5432
DB_USER = postgres
DB_PASSWORD = [YOUR_SUPABASE_PASSWORD]
DB_NAME = postgres
DB_SCHEMA = BJH-Server
```

---

### ขั้นตอนที่ 4: ทดสอบการเชื่อมต่อ

```powershell
# รัน Development Server
npm run dev

# เปิดเบราว์เซอร์
Start-Process "http://localhost:3000/api/customer-data"
```

**ผลลัพธ์ที่ต้องการ:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "สถานะ": "ติดตาม",
      "ชื่อ": "สมชาย ใจดี",
      "เบอร์โทร": "0812345678",
      ...
    }
  ],
  "count": 10,
  "source": "BJH-Server.bjh_all_leads via Supabase"
}
```

---

### ขั้นตอนที่ 5: Deploy to Vercel

```powershell
# Option 1: ใช้ Script อัตโนมัติ
.\deploy-to-vercel.ps1

# Option 2: ทำด้วยตัวเอง
git add .
git commit -m "Migrate to Supabase"
git push
```

---

## 🎯 One-Command Setup (สำหรับผู้เชี่ยวชาญ)

```powershell
# Run migration และ deploy ในคำสั่งเดียว
.\migrate-to-supabase.ps1; if ($?) { git add .; git commit -m "Migrate to Supabase"; git push }
```

---

## 🔍 ตรวจสอบสถานะการ Migrate

### ดูข้อมูลใน Supabase:

1. เข้า https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor
2. เลือก Schema: `BJH-Server`
3. เปิดตาราง: `bjh_all_leads`
4. ดูจำนวนแถว (Rows) ต้องตรงกับข้อมูลเดิม

### นับจำนวนแถวใน Local PostgreSQL:

```powershell
$env:PGPASSWORD = "Bjh12345!!"
psql -h 192.168.1.19 -U postgres -d postgres -c 'SELECT COUNT(*) FROM "BJH-Server".bjh_all_leads;'
```

### นับจำนวนแถวใน Supabase:

```powershell
$env:PGPASSWORD = "YOUR_SUPABASE_PASSWORD"
psql -h db.houhlbfagngkyrbbhmmi.supabase.co -U postgres -d postgres -c 'SELECT COUNT(*) FROM "BJH-Server".bjh_all_leads;'
```

---

## 🛠️ Troubleshooting

### ปัญหา: "pg_dump: command not found"

**วิธีแก้:**

1. ติดตั้ง PostgreSQL Client Tools
2. Download: https://www.postgresql.org/download/windows/
3. เพิ่ม Path: `C:\Program Files\PostgreSQL\16\bin`

### ปัญหา: "FATAL: password authentication failed"

**วิธีแก้:**

- ตรวจสอบ Supabase Password ใน Dashboard
- Reset Password ได้ที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/settings/database

### ปัญหา: "schema BJH-Server does not exist"

**วิธีแก้:**

```sql
-- รันใน Supabase SQL Editor
CREATE SCHEMA IF NOT EXISTS "BJH-Server";
```

### ปัญหา: Vercel Deployment แสดง Error 500

**วิธีแก้:**

1. ตรวจสอบ Environment Variables ใน Vercel
2. ดู Logs: https://vercel.com/thanakron-hongthongs-projects/[project]/deployments
3. Redeploy: กด **"Redeploy"** หลังจากแก้ Environment Variables

---

## 📊 ตรวจสอบ API หลัง Deploy

```powershell
# Test Production API
Invoke-RestMethod -Uri "https://your-project.vercel.app/api/customer-data"

# เพิ่มข้อมูลทดสอบ
Invoke-RestMethod -Uri "https://your-project.vercel.app/api/customer-data" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"action":"create","data":{"ชื่อ":"ทดสอบ Vercel","เบอร์โทร":"0999999999","สถานะ":"ใหม่"}}'
```

---

## ✅ Checklist

- [ ] รัน `migrate-to-supabase.ps1` สำเร็จ
- [ ] ตรวจสอบข้อมูลใน Supabase Table Editor
- [ ] สร้าง `.env.local` ด้วยค่าจาก Supabase
- [ ] ทดสอบ `http://localhost:3000/api/customer-data` ใช้งานได้
- [ ] เพิ่ม Environment Variables ใน Vercel
- [ ] Push code ไปยัง GitHub
- [ ] Deploy สำเร็จ
- [ ] ทดสอบ Production API
- [ ] ลบไฟล์ backup ใน `supabase-migration/` (หลังจากแน่ใจแล้ว)

---

## 📞 ติดปัญหา?

อ่านเพิ่มเติมใน:

- `SUPABASE_MIGRATION_GUIDE.md` - คู่มือโดยละเอียด
- `DEPLOY_POSTGRESQL_VERCEL.md` - คู่มือ Deployment
- Supabase Docs: https://supabase.com/docs/guides/database

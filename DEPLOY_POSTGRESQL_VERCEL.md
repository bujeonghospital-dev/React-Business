# 🚀 Deploy PostgreSQL + Next.js ไปยัง Vercel

## ⚠️ ปัญหาสำคัญที่ต้องแก้ก่อน Deploy

### ❌ **Database ที่ 192.168.1.19 เป็น Local IP**

Vercel (cloud) ไม่สามารถเชื่อมต่อกับ database ที่อยู่ใน local network ได้

---

## ✅ วิธีแก้ไข: เลือก 1 ใน 3 ตัวเลือก

### ตัวเลือก 1: ย้าย Database ไป Supabase (แนะนำ - ฟรี)

#### ขั้นตอน:

1. สร้างบัญชีที่ https://supabase.com
2. สร้าง New Project
3. ไปที่ Settings → Database → คัดลอก Connection String
4. Export ข้อมูลจาก database เดิม:

```powershell
$env:PGPASSWORD = "Bjh12345!!"
pg_dump -h 192.168.1.19 -U postgres -d postgres -n "BJH-Server" -t bjh_all_leads > backup.sql
```

5. Import ไปยัง Supabase:

```powershell
# ใช้ connection string จาก Supabase
psql "postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres" < backup.sql
```

6. อัปเดต Environment Variables ใน Vercel:

```
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[your-supabase-password]
DB_NAME=postgres
```

**ข้อดี**:

- ✅ ฟรี (500MB storage)
- ✅ รองรับ PostgreSQL เต็มรูปแบบ
- ✅ มี UI สำหรับจัดการข้อมูล
- ✅ Backup อัตโนมัติ
- ✅ SSL enabled

---

### ตัวเลือก 2: ย้าย Database ไป Railway (ฟรี $5/เดือน)

1. สร้างบัญชีที่ https://railway.app
2. New Project → Add PostgreSQL
3. คัดลอก connection details
4. Export/Import เหมือนตัวเลือก 1

**ข้อดี**:

- ✅ ง่ายและรวดเร็ว
- ✅ รองรับ PostgreSQL
- ✅ $5 credit ฟรีทุกเดือน

---

### ตัวเลือก 3: เปิด Port Forwarding + Dynamic DNS (ไม่แนะนำ)

⚠️ **อันตราย - ใช้เฉพาะ Development/Testing เท่านั้น**

1. ตั้งค่า Port Forwarding บน Router:

   - External Port: 5432
   - Internal IP: 192.168.1.19
   - Internal Port: 5432

2. ใช้ Dynamic DNS (เช่น No-IP, DuckDNS):

   - สมัครฟรีที่ https://www.noip.com
   - ติดตั้ง DUC (Dynamic Update Client)
   - จะได้ domain เช่น `yourname.ddns.net`

3. ตั้งค่า PostgreSQL ให้รับ connection จากภายนอก:

```sql
-- แก้ไข pg_hba.conf
host    all    all    0.0.0.0/0    md5

-- แก้ไข postgresql.conf
listen_addresses = '*'
```

4. Restart PostgreSQL

**ข้อเสีย**:

- ❌ ไม่ปลอดภัย
- ❌ IP อาจเปลี่ยน
- ❌ ต้องเปิด firewall

---

## 📋 Checklist สำหรับ Deploy

### ก่อน Deploy

- [ ] Database accessible จาก Internet
- [ ] ทดสอบ connection จาก external network
- [ ] Backup ข้อมูล
- [ ] เตรียม Environment Variables
- [ ] Push code ไปยัง GitHub

### Deploy บน Vercel

- [ ] Import project จาก GitHub
- [ ] ตั้งค่า Environment Variables:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `NODE_ENV=production`
- [ ] Deploy
- [ ] ทดสอบ API endpoints

### หลัง Deploy

- [ ] ทดสอบการดึงข้อมูล
- [ ] ทดสอบการแก้ไขข้อมูล
- [ ] ตรวจสอบ logs
- [ ] ตั้งค่า custom domain (ถ้าต้องการ)

---

## 🚀 คำสั่งสำหรับ Deploy

### 1. Push Code

```powershell
.\deploy-to-vercel.ps1
```

หรือ Manual:

```powershell
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy ผ่าน Vercel CLI (Optional)

```powershell
npm install -g vercel
vercel login
vercel
```

---

## 🔧 Test Connection จาก Local

ทดสอบว่า database เข้าถึงได้จากภายนอก:

```powershell
# ถ้าใช้ public IP/domain
Test-NetConnection -ComputerName your-database-host -Port 5432

# ทดสอบ connect
psql -h your-database-host -U postgres -d postgres -c "SELECT 1"
```

---

## 📞 ความช่วยเหลือ

### Supabase

- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Railway

- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Vercel

- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

---

## 💡 แนะนำ: Supabase

สำหรับโปรเจ็คนี้ แนะนำให้ใช้ **Supabase** เพราะ:

1. ✅ ฟรี และเพียงพอสำหรับ development/production ขนาดเล็ก
2. ✅ PostgreSQL เต็มรูปแบบ รองรับ schema "BJH-Server"
3. ✅ มี UI สวยงาม จัดการง่าย
4. ✅ Backup อัตโนมัติ
5. ✅ ปลอดภัย (SSL/TLS)
6. ✅ Integration กับ Vercel ง่าย

**เริ่มต้นเลย**: https://supabase.com/dashboard/sign-in

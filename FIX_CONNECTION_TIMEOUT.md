# 🔧 แก้ไข Connection Timeout Error

## ปัญหา

```json
{
  "success": false,
  "error": "Connection terminated due to connection timeout"
}
```

## สาเหตุ

❌ **Vercel ไม่สามารถเชื่อมต่อกับ Local PostgreSQL (192.168.1.19) ได้**

เพราะ:

1. IP 192.168.1.19 เป็น Local Network ที่ Vercel เข้าถึงไม่ได้
2. Vercel ใช้ Serverless Function ที่ไม่มี VPN/Tunnel เข้า Network ส่วนตัว
3. PostgreSQL ไม่เปิดให้เข้าถึงจาก Internet

---

## ✅ วิธีแก้ไข (เลือก 1 วิธี)

### วิธีที่ 1: Migrate ไป Supabase (แนะนำ) ⭐

#### ขั้นตอน:

1. **รัน Migration Script:**

```powershell
.\migrate-to-supabase.ps1
```

2. **ตรวจสอบข้อมูลใน Supabase:**

   - เข้า https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor
   - เลือก Schema: `BJH-Server`
   - เปิดตาราง: `bjh_all_leads`

3. **อัปเดต Environment Variables ใน Vercel:**
   - เข้า https://vercel.com/thanakron-hongthongs-projects
   - เลือก Project → Settings → Environment Variables
   - เพิ่ม/แก้ไขตัวแปร:

```
DB_HOST=db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[YOUR_SUPABASE_PASSWORD]
DB_NAME=postgres
DB_SCHEMA=BJH-Server
```

4. **Redeploy:**

```powershell
# ใน Vercel Dashboard กด "Redeploy"
# หรือ push code ใหม่
git add .
git commit -m "Fix connection timeout - use Supabase"
git push
```

5. **ทดสอบ:**

```powershell
# ทดสอบ Production API
Invoke-RestMethod -Uri "https://your-project.vercel.app/api/customer-data"
```

---

### วิธีที่ 2: ใช้ Ngrok/Cloudflare Tunnel (ชั่วคราว)

⚠️ **ไม่แนะนำสำหรับ Production**

#### ขั้นตอน:

1. **ติดตั้ง Cloudflare Tunnel:**

```powershell
# Download
winget install Cloudflare.cloudflared

# Start tunnel
cloudflared tunnel --url postgresql://192.168.1.19:5432
```

2. **จะได้ URL แบบนี้:**

```
https://xxxx-xxxx-xxxx.trycloudflare.com
```

3. **อัปเดต Vercel Environment Variables:**

```
DB_HOST=[cloudflare-tunnel-host]
DB_PORT=5432
```

⚠️ **ข้อเสีย:**

- ต้องรัน tunnel ตลอดเวลา
- Tunnel URL เปลี่ยนทุกครั้งที่รีสตาร์ท
- ไม่มั่นคง สำหรับ Production

---

### วิธีที่ 3: เปิด PostgreSQL ให้เข้าถึงจาก Internet

⚠️ **อันตราย - ไม่แนะนำ**

1. แก้ไข `postgresql.conf`:

```conf
listen_addresses = '*'
```

2. แก้ไข `pg_hba.conf`:

```conf
host    all             all             0.0.0.0/0               md5
```

3. เปิด Port 5432 ใน Firewall

4. ใช้ Public IP ใน Vercel Environment Variables

⚠️ **ความเสี่ยง:**

- ถูกโจมตีได้ง่าย
- ต้องตั้งรหัสผ่านแข็งแรง
- ควรใช้ SSL/TLS
- ไม่แนะนำเลยถ้าไม่มีความรู้ด้าน Security

---

## 🎯 Recommendation

### ให้ใช้วิธีที่ 1: Migrate ไป Supabase

**เพราะ:**

- ✅ ฟรี (Free Tier 500MB)
- ✅ Managed PostgreSQL
- ✅ มี Backup อัตโนมัติ
- ✅ SSL/TLS built-in
- ✅ Dashboard ใช้งานง่าย
- ✅ API & Realtime built-in

---

## 📊 เปรียบเทียบ

| วิธี      | ความปลอดภัย | ค่าใช้จ่าย    | ความซับซ้อน | แนะนำ |
| --------- | ----------- | ------------- | ----------- | ----- |
| Supabase  | ⭐⭐⭐⭐⭐  | ฟรี-$25/เดือน | ⭐⭐        | ✅    |
| Tunnel    | ⭐⭐⭐      | ฟรี           | ⭐⭐⭐      | ⚠️    |
| Public IP | ⭐          | ฟรี           | ⭐⭐⭐⭐⭐  | ❌    |

---

## 🔍 ตรวจสอบสถานะ Environment Variables

### Local (ก่อน migrate):

```powershell
cat .env.local
```

ควรเห็น:

```
DB_HOST=192.168.1.19
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Bjh12345!!
```

### Supabase (หลัง migrate):

```powershell
cat .env.local
```

ควรเห็น:

```
DB_HOST=db.houhlbfagngkyrbbhmmi.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[SUPABASE_PASSWORD]
```

---

## 🧪 ทดสอบการเชื่อมต่อ

### ทดสอบ Local PostgreSQL:

```powershell
$env:PGPASSWORD = "Bjh12345!!"
psql -h 192.168.1.19 -U postgres -d postgres -c "SELECT COUNT(*) FROM \"BJH-Server\".bjh_all_leads;"
```

### ทดสอบ Supabase:

```powershell
$env:PGPASSWORD = "YOUR_SUPABASE_PASSWORD"
psql -h db.houhlbfagngkyrbbhmmi.supabase.co -U postgres -d postgres -c "SELECT COUNT(*) FROM \"BJH-Server\".bjh_all_leads;"
```

### ทดสอบ API:

```powershell
# Local
Invoke-RestMethod -Uri "http://localhost:3000/api/customer-data"

# Production (หลัง deploy)
Invoke-RestMethod -Uri "https://your-project.vercel.app/api/customer-data"
```

---

## ❓ ถาม-ตอบ

### Q: ข้อมูลจะหายไหมเมื่อ migrate?

**A:** ไม่หาย สคริปต์จะ backup ไว้ที่ `supabase-migration/` ก่อน

### Q: ต้องจ่ายเงิน Supabase หรือไม่?

**A:** ไม่ต้อง (Free Tier: 500MB Database, 2GB Transfer/เดือน)

### Q: Migrate แล้วเปลี่ยนกลับได้ไหม?

**A:** ได้ เพียงเปลี่ยน Environment Variables กลับ

### Q: Vercel ใช้ฟรีได้หรือไม่?

**A:** ได้ (Hobby Plan: Unlimited Projects, 100GB Bandwidth/เดือน)

---

## 📞 ติดปัญหา?

1. ตรวจสอบ Vercel Logs:

   - https://vercel.com/[your-project]/deployments
   - คลิก Deployment → Functions → View Logs

2. อ่าน Error Code:

   - `ETIMEDOUT` = Connection timeout (DB ไม่ตอบ)
   - `ENOTFOUND` = Host ไม่ถูกต้อง
   - `ECONNREFUSED` = Port ไม่เปิด

3. ตรวจสอบ Environment Variables:
   - Vercel Dashboard → Settings → Environment Variables
   - ต้อง Redeploy หลังจากแก้ไข

---

## 🚀 Quick Fix (1 นาที)

```powershell
# 1. Migrate data
.\migrate-to-supabase.ps1

# 2. Update .env.local
Copy-Item .env.local.supabase .env.local
# แก้ไข DB_PASSWORD ใน .env.local

# 3. Test local
npm run dev
# เปิด http://localhost:3000/api/customer-data

# 4. Deploy
git add .
git commit -m "Fix: Migrate to Supabase"
git push

# 5. Update Vercel Environment Variables
# ไปที่ Vercel Dashboard → Settings → Environment Variables
# เพิ่ม DB_HOST, DB_PASSWORD

# 6. Redeploy ใน Vercel Dashboard
```

เสร็จแล้ว! 🎉

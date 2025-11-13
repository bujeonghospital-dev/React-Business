# 🔐 Environment Variables สำหรับ Vercel

## วิธีที่ 1: ตั้งค่าผ่าน Vercel Dashboard (แนะนำ)

### ขั้นตอน:

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจกต์ `React-Business` (หรือสร้างใหม่ถ้ายังไม่มี)
3. คลิก **Settings** tab ด้านบน
4. เลือก **Environment Variables** จากเมนูด้านซ้าย
5. เพิ่ม Environment Variables ทีละตัวตามด้านล่าง
6. เลือก Environment: **Production**, **Preview**, **Development** (หรือทั้งหมด)
7. คลิก **Save**

---

## 📋 รายการ Environment Variables ที่ต้องเพิ่ม

### 1. Supabase Configuration (CRITICAL ⚠️)

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://houhlbfagngkyrbbhmmi.supabase.co
Environment: ✅ Production, ✅ Preview, ✅ Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdWhsYmZhZ25na3lyYmJobW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzg1NDAsImV4cCI6MjA3NTk1NDU0MH0.zSYuXuxoT357KPEiNcGyUczoVteoIejziO5QfImMtgM
Environment: ✅ Production, ✅ Preview, ✅ Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdWhsYmZhZ25na3lyYmJobW1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM3ODU0MCwiZXhwIjoyMDc1OTU0NTQwfQ.gKhkgZeTiVeeBLCcOTfYuE2tj9oVNnwMnWMpQD6DMpk
Environment: ✅ Production, ✅ Preview, ✅ Development
```

---

### 2. Google Sheets Service Account (CRITICAL ⚠️)

```
Name: GOOGLE_SPREADSHEET_ID
Value: 1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y
Environment: ✅ Production, ✅ Preview, ✅ Development
```

```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: web-sheets-reader@name-tel-dev.iam.gserviceaccount.com
Environment: ✅ Production, ✅ Preview, ✅ Development
```

```
Name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZ97WjLIORTUMU
pAh6tEiL9iktiTN8TbwdlAO3lin58vAIMkeAqYxTswV+ewS4Uw3wgABZZyDREfKG
iX9er5C3MYQm08g6J8ZUbuYDVHL2aPcxJ2lfG7XzOTOeq7QhSxTZwLVAf4RAdV0m
bPyZHDToFoUwNgrXqys6/66eE3MocbN+RHLxHTO22ufKiRUN0gk3wYbYq5LDmT+f
OyfrViuTFWcnAnMHtHjfIPNsnpYXNqXOkpOFY2PvgGntcwoZKB/Eud4mYW8e0Dn1
oe5C+KEcljrxsianyfkRZRv17rW9xwu9kQ0RzqkZsuL7Ga8L22FrIrPmnx24Huns
25wtioC/AgMBAAECggEABTHBM/8VdTp5D+I00wbwB6DHZNzjGsd4mDrdIT10rxUO
GgiwNtwBevVoMwstbpaGut1mpZ2AEu2bFAThgi1EIZoPDkxIzgV3gHO5WNVph3yl
Ekh1GptRuSHt5uV+Dz18N5hzxPhIWvBasygsIXI9KrNPzP+VwA7rR3NGzdh0IyId
c7MVDTMA3exlLAeEfMzOoAwVz2a6jYueHs4pXAJqTg/dCTOqOwR6DqQJKn93jrwz
advMDrQFe7JQbfzAti5RcPvxA8n7qTsprpEZGZ4oYfKcNRumKQPxQpuBA7I+s/LC
BpmbCb5HJllLHuPxnDHNkxUYDgzhMobikpmjTFQqOQKBgQDSr/6Tz2wq4j1vdQob
xssxljEZGZY6M+NUUa8yny/6qQyHBwgAFBp1I4gj2Kd8l9yphMUAggzBf05m77sO
0MeUmBCRZx/GnN6FHQ48IhIynBMGcNEL1E59jWhscnnod4rwUUf9cG6IT5vvyXLG
i5a2i8e9ZxaftHvhWQIbMUtFdQKBgQC7FNb6ij0gV+J3eWzZ+pMfyCdtsKnnLSh4
DFPIlbLVRfK/0Dy+XTstoh0PMqH9zS/SmVKe4YUojLOtCz6O6njm9OyvxjQs0yEw
MCK6f3dk4TGPFGfY3h9m15xlgP6nvNxbLc3odGoZEzbaKcVq285cuycw8+eF1yp9
dsNmlx0C4wKBgHPQDJfBqEr2bCDtbC4Sm7VZQwnyF7NMvISoFi80dBJMhLdgtRQd
+OE1M+vId2C0tbZ1Zjk+Q7bFvRo2Y1PkjiDvagQTdNMffe4cJ6wEao5pXsfmkfL3
tGGtrp4WW07fD3/EnlcBS7EgWa54xN/A8YrM0XIazcPiWUppPBAoi6DVAoGAGZdn
NQyWAgejph5JIqRhXdaediXViBcoUwu0plq8BOq1o0GUHaJZRwvHF94gRLy9zvxE
ThGhioN8zK4eF6TBdy6H9h+R4ZPcFWBwT7zCE12uztjGv+bautHBxizYKQ/vwNVK
NoM+REHZngxawhxhZVQAr3Sd9jQRzunhHvaK9GsCgYANcQ/IJJgWR8DcaMRTG5Zx
ez2xeda/4GXQ5pq2R0DTSfW985s/f1/4ms0FOsJHB8SrXPobyOgQBJVP1Lg2faUW
CHkHcDaQUJnGo8/i0+g6QOQJcBKaoPzeyiNSkg4/u55rXKagPtNWOyl9VCUNYbmJ
fPCvcFPqJVxMt92O5J3B7Q==
-----END PRIVATE KEY-----
Environment: ✅ Production, ✅ Preview, ✅ Development

⚠️ สำคัญ: ต้องคัดลอกทั้งหมดรวม -----BEGIN PRIVATE KEY----- และ -----END PRIVATE KEY-----
```

---

### 3. Webhook Configuration (Optional)

```
Name: SURGERY_SCHEDULE_WEBHOOK_SECRET
Value: webhook-secret-2025-surgery-schedule-api
Environment: ✅ Production, ✅ Preview, ✅ Development
```

---

### 4. Python API (Optional - ถ้าจะใช้)

```
Name: PYTHON_API_URL
Value: https://your-python-api.railway.app
Environment: ✅ Production, ✅ Preview, ✅ Development

หมายเหตุ: ถ้ายังไม่ได้ deploy Python API ให้ใส่ http://localhost:5000 ไว้ก่อน
```

---

## วิธีที่ 2: ตั้งค่าผ่าน Vercel CLI

### ติดตั้ง Vercel CLI (ถ้ายังไม่มี):

```powershell
npm install -g vercel
```

### Login:

```powershell
vercel login
```

### เพิ่ม Environment Variables:

```powershell
# 1. Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 2. Google Sheets
vercel env add GOOGLE_SPREADSHEET_ID production
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
vercel env add GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY production

# 3. Webhook
vercel env add SURGERY_SCHEDULE_WEBHOOK_SECRET production

# 4. Python API (Optional)
vercel env add PYTHON_API_URL production
```

แต่ละคำสั่งจะถาม Value ให้กรอกค่าจากด้านบน

---

## ✅ หลังจากเพิ่ม Environment Variables แล้ว

### 1. Redeploy โปรเจกต์:

```powershell
vercel --prod
```

### หรือ

ไปที่ Vercel Dashboard > Deployments > คลิกปุ่ม **Redeploy** ที่ deployment ล่าสุด

---

## 🔍 ตรวจสอบว่าตั้งค่าถูกต้อง

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจกต์
3. ไปที่ **Settings > Environment Variables**
4. ควรเห็น Environment Variables ทั้งหมดที่เพิ่มไว้

---

## ⚠️ หมายเหตุสำคัญ

1. **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY** ต้องคัดลอกทั้งหมดรวมบรรทัดแรกและบรรทัดสุดท้าย
2. **NEXT*PUBLIC*** คำนำหน้านี้จะทำให้ตัวแปรสามารถเข้าถึงได้จาก client-side
3. ตัวแปรที่ไม่มี **NEXT*PUBLIC*** จะใช้ได้เฉพาะ server-side เท่านั้น
4. หลังจากเพิ่มหรือแก้ไข Environment Variables ต้อง **Redeploy** ทุกครั้ง

---

## 🚀 Deploy โปรเจกต์

หลังจากตั้งค่า Environment Variables เรียบร้อยแล้ว:

```powershell
# Deploy to production
vercel --prod
```

หรือ Push code ขึ้น GitHub แล้ว Vercel จะ auto-deploy ให้อัตโนมัติ

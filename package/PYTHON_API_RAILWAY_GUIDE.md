# 🚂 วิธี Deploy Python API บน Railway

## 📚 ความเป็นมา

Python API (`python-api/app.py`) เป็น Flask API ที่:

- อ่านข้อมูลจาก Google Sheets ผ่าน Service Account
- ให้บริการผ่าน endpoint `/api/film-call-status`
- ต้อง deploy แยกจาก Next.js เพราะ Vercel ไม่รองรับ Python

---

## 🎯 ทำไมต้อง Deploy Python API แยก?

**Vercel รองรับเฉพาะ:**

- Next.js
- Node.js
- Serverless Functions (JavaScript/TypeScript)

**ไม่รองรับ:**

- ❌ Python Flask/Django/FastAPI
- ❌ Ruby on Rails
- ❌ PHP

ดังนั้นต้อง deploy Python API บน platform อื่น เช่น **Railway**, Render, หรือ PythonAnywhere

---

## 🚂 Deploy บน Railway (แนะนำ - ฟรีและง่าย)

### ขั้นตอนที่ 1: เตรียมโปรเจกต์ ✅

ไฟล์ที่จำเป็นถูกสร้างแล้ว:

- ✅ `Procfile` - บอก Railway วิธีรัน app
- ✅ `runtime.txt` - ระบุ Python version
- ✅ `requirements.txt` - dependencies (เพิ่ม gunicorn แล้ว)

### ขั้นตอนที่ 2: สร้าง Account บน Railway

1. **ไปที่** https://railway.app
2. **Sign up** ด้วย GitHub account
3. **Verify email** (ถ้าต้องการ)

### ขั้นตอนที่ 3: Deploy Python API

#### วิธีที่ 1: Deploy จาก GitHub (แนะนำ)

1. **Push code ขึ้น GitHub** (ถ้ายังไม่ได้ push)

   ```bash
   cd python-api
   git add .
   git commit -m "Add Railway deployment files"
   git push origin main
   ```

2. **บน Railway Dashboard:**
   - คลิก **"New Project"**
   - เลือก **"Deploy from GitHub repo"**
   - เลือก repository: `React-Business`
   - **Root Directory**: ตั้งเป็น `package/python-api`
   - คลิก **"Deploy"**

#### วิธีที่ 2: Deploy จาก Railway CLI

```powershell
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# Login
railway login

# ไปที่โฟลเดอร์ python-api
cd python-api

# สร้าง project และ deploy
railway init
railway up
```

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables บน Railway

1. **บน Railway Dashboard:**
   - เลือก project ที่สร้าง
   - ไปที่ **Variables** tab
   - เพิ่ม Environment Variables:

```
GOOGLE_SPREADSHEET_ID=1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y

GOOGLE_SERVICE_ACCOUNT_EMAIL=web-sheets-reader@name-tel-dev.iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
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

GOOGLE_PROJECT_ID=name-tel-dev

GOOGLE_PRIVATE_KEY_ID=(คัดลอกจาก service account JSON)

GOOGLE_CLIENT_ID=(คัดลอกจาก service account JSON)

GOOGLE_CLIENT_CERT_URL=(คัดลอกจาก service account JSON)
```

⚠️ **สำคัญ**: ต้องใส่ PRIVATE KEY ทั้งหมดรวม header และ footer

### ขั้นตอนที่ 5: รับ URL จาก Railway

หลังจาก deploy สำเร็จ Railway จะให้ URL เช่น:

```
https://your-app-name.up.railway.app
```

**ทดสอบ API:**

```
https://your-app-name.up.railway.app/health
https://your-app-name.up.railway.app/api/film-call-status
```

### ขั้นตอนที่ 6: อัปเดต PYTHON_API_URL บน Vercel

1. **ไปที่ Vercel Dashboard:**

   - Settings > Environment Variables
   - แก้ไข `PYTHON_API_URL`
   - ใส่ URL จาก Railway: `https://your-app-name.up.railway.app`
   - คลิก Save

2. **Redeploy Vercel:**
   ```powershell
   vercel --prod
   ```

---

## 🔄 วิธีใช้งาน Python API ใน Next.js

### ตัวอย่างการเรียกใช้งาน:

```typescript
// In your Next.js API route or component
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:5000";

async function getFilmCallStatus() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/film-call-status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling Python API:", error);
    throw error;
  }
}
```

### ใน Next.js API Route:

```typescript
// pages/api/get-call-status.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const PYTHON_API_URL = process.env.PYTHON_API_URL;

  try {
    const response = await fetch(`${PYTHON_API_URL}/api/film-call-status`);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch from Python API" });
  }
}
```

---

## 🆓 ทางเลือกอื่นสำหรับ Deploy Python API

### 1. **Render** (ฟรี)

- URL: https://render.com
- ข้อดี: ฟรี, ง่าย, auto-deploy จาก GitHub
- ข้อเสีย: cold start ช้า (หลับเมื่อไม่ใช้งาน)

### 2. **PythonAnywhere** (ฟรี)

- URL: https://www.pythonanywhere.com
- ข้อดี: เชี่ยวชาญ Python
- ข้อเสีย: ฟรีมีข้อจำกัดเยอะ

### 3. **Fly.io** (ฟรี)

- URL: https://fly.io
- ข้อดี: เร็ว, มี free tier ดี
- ข้อเสีย: ซับซ้อนกว่า Railway

---

## 📊 สรุป Flow การทำงาน

```
[User Browser]
     ↓
[Next.js on Vercel] (Frontend + API Routes)
     ↓
     ├─→ [Supabase] (Database)
     ├─→ [Google Sheets API] (Direct from Next.js)
     └─→ [Python API on Railway] (ถ้าต้องการ)
              ↓
         [Google Sheets] (via Service Account)
```

---

## ⚠️ คำถามที่พบบ่อย

### Q: ต้อง deploy Python API ไหม?

**A:** ไม่จำเป็น! ถ้า Next.js API routes สามารถอ่าน Google Sheets ได้โดยตรง (ผ่าน `googleapis` package) ก็ไม่ต้องใช้ Python API

### Q: แล้วจะเลือกใช้ Python API หรือ Next.js API routes?

**A:**

- ใช้ **Next.js API routes** ถ้า: logic ไม่ซับซ้อน, ต้องการ deploy ที่เดียว
- ใช้ **Python API** ถ้า: มี Python libraries พิเศษที่จำเป็น, หรือมี code base Python อยู่แล้ว

### Q: ค่าใช้จ่าย?

**A:**

- Railway: ฟรี $5 credit/เดือน (พอใช้งาน hobby project)
- Vercel: ฟรีสำหรับ personal projects
- Supabase: ฟรี tier เพียงพอ

---

## 🎯 สรุป

1. ✅ สร้างไฟล์สำหรับ Railway แล้ว (`Procfile`, `runtime.txt`, อัปเดต `requirements.txt`)
2. 🚂 ไป https://railway.app และ deploy Python API
3. 🔐 ตั้งค่า Environment Variables บน Railway
4. 🔗 ได้ URL แล้วนำไปใส่ใน Vercel env (`PYTHON_API_URL`)
5. 🚀 Redeploy Vercel

หรือ **ไม่ต้องใช้ Python API** ก็ได้ ถ้า Next.js ทำงานได้ครบ!

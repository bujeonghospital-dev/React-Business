# 🚂 Railway Deployment Guide - Python API

## ✅ สิ่งที่เตรียมไว้แล้ว

โปรเจ็กต์นี้มีไฟล์ที่จำเป็นสำหรับ Railway deployment ครบแล้วใน `/python-api`:

```
python-api/
├── app.py              # Flask API application
├── requirements.txt    # Python dependencies
├── Procfile           # Railway start command
├── railway.json       # Railway configuration
├── runtime.txt        # Python version specification
└── .env.example       # Environment variables template
```

---

## 📋 ขั้นตอนการ Deploy ไปยัง Railway

### 1️⃣ สร้าง Railway Project

1. ไปที่ https://railway.app/ และ Login
2. คลิก **"New Project"**
3. เลือก **"Deploy from GitHub repo"**
4. เลือก repository: `React-Business`
5. Railway จะ detect Python project อัตโนมัติ

### 2️⃣ ตั้งค่า Root Directory

เนื่องจาก Python API อยู่ใน `/python-api` subfolder:

1. ไปที่ **Settings** tab
2. หาส่วน **"Root Directory"**
3. ใส่: `python-api`
4. คลิก Save

### 3️⃣ เพิ่ม Environment Variables

ไปที่ **Variables** tab และเพิ่มตัวแปรต่อไปนี้:

```bash
# Google Sheets Service Account
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project.iam.gserviceaccount.com

# Optional: Port (Railway จะ set ให้อัตโนมัติ)
PORT=5000
```

**⚠️ สำคัญ:**

- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` ต้องมี `\n` สำหรับขึ้นบรรทัดใหม่
- คัดลอกค่าจากไฟล์ `.env` ในเครื่องของคุณ

### 4️⃣ Deploy

1. Railway จะ build และ deploy อัตโนมัติ
2. ดูความคืบหน้าได้ที่ **Deployments** tab
3. ดู logs real-time ได้ที่ **View Logs**

---

## 🔗 รับ API URL

หลังจาก deploy สำเร็จ:

1. ไปที่ **Settings** tab
2. หาส่วน **"Domains"**
3. คลิก **"Generate Domain"**
4. Railway จะสร้าง URL ให้ เช่น:
   ```
   https://your-project-production.up.railway.app
   ```

---

## 🧪 ทดสอบ API

### Health Check

```bash
curl https://your-project-production.up.railway.app/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

### Film Data Endpoint

```bash
curl https://your-project-production.up.railway.app/api/film-data
```

### Film Call Status Endpoint

```bash
curl https://your-project-production.up.railway.app/api/film-call-status
```

---

## 🔄 เชื่อมกับ Vercel (Next.js Frontend)

### 1. เพิ่ม Environment Variable ใน Vercel

ไปที่ Vercel Dashboard → Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-project-production.up.railway.app
```

### 2. Redeploy Vercel

Vercel จะ auto-deploy เมื่อมีการเปลี่ยนแปลง environment variables

### 3. ใช้งานใน Next.js Code

```typescript
// ใน src/config หรือ utility file
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// เรียกใช้ API
async function fetchFilmData() {
  const response = await fetch(`${API_URL}/api/film-data`);
  const data = await response.json();
  return data;
}
```

---

## 🐛 การแก้ไขปัญหา

### ❌ Build Failed

**ตรวจสอบ:**

1. Root Directory ตั้งค่าเป็น `python-api` แล้วหรือยัง
2. ไฟล์ `requirements.txt` มีครบถ้วนหรือไม่
3. ดู logs เพื่อหา error message

**วิธีแก้:**

```bash
# ใน railway.json มีการระบุ buildCommand แล้ว
pip install -r requirements.txt
```

### ❌ Application Error / 500 Error

**ตรวจสอบ:**

1. Environment variables ครบหรือไม่
2. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` format ถูกต้องหรือไม่ (ต้องมี `\n`)
3. ดู logs: คลิก **View Logs** เพื่อดู error message

**วิธีแก้:**

- ตรวจสอบว่า Service Account มี permission เข้าถึง Google Sheets หรือไม่
- ลอง test credentials ใน local environment ก่อน

### ❌ CORS Error

**API มี CORS enabled แล้ว:**

```python
CORS(app)  # Enable CORS for all routes
```

ถ้ายังมีปัญหา ให้ระบุ origin:

```python
CORS(app, origins=['https://your-vercel-app.vercel.app'])
```

### ❌ Health Check Failed

**ตรวจสอบ:**

1. Endpoint `/health` ทำงานหรือไม่
2. Port binding ถูกต้องหรือไม่

**railway.json มี healthcheckPath แล้ว:**

```json
"healthcheckPath": "/health"
```

---

## 📊 Monitoring

### View Logs

1. ไปที่ Railway Dashboard
2. เลือก Project
3. คลิก **View Logs**
4. เห็น real-time logs ทั้งหมด

### Metrics

1. ไปที่ **Metrics** tab
2. ดู:
   - CPU Usage
   - Memory Usage
   - Network Traffic
   - Request/Response times

---

## 🔄 การอัพเดท Code

### Auto Deploy (Recommended)

Railway จะ auto-deploy เมื่อมีการ push code ใหม่ไปยัง GitHub:

```bash
# แก้ไข code ใน python-api/app.py
git add python-api/
git commit -m "Update API endpoints"
git push origin main
```

Railway จะ:

1. Detect changes
2. Build ใหม่อัตโนมัติ
3. Deploy version ใหม่
4. Roll back ถ้ามีปัญหา

### Manual Deploy

ถ้าต้องการ deploy ด้วยตนเอง:

1. ไปที่ **Deployments** tab
2. คลิก **Deploy** → **Deploy Latest Commit**

---

## 💰 Pricing & Limits

### Free Tier (Hobby Plan)

- **$5 credit/month** (ฟรี)
- เพียงพอสำหรับ:
  - Small projects
  - Development/Testing
  - Low traffic APIs

### Pro Plan ($20/month)

- **More resources & uptime**
- **Better performance**
- **Priority support**

---

## 📝 Checklist ก่อน Deploy

- [ ] ตั้งค่า Root Directory = `python-api`
- [ ] เพิ่ม Environment Variables ทั้งหมด
- [ ] ตรวจสอบ `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` มี `\n` ขึ้นบรรทัดใหม่
- [ ] Generate Domain และคัดลอก URL
- [ ] ทดสอบ `/health` endpoint
- [ ] ทดสอบ `/api/film-data` endpoint
- [ ] ทดสอบ `/api/film-call-status` endpoint
- [ ] เพิ่ม `NEXT_PUBLIC_API_URL` ใน Vercel
- [ ] Redeploy Vercel
- [ ] ทดสอบการเชื่อมต่อระหว่าง Frontend-Backend

---

## 🎯 API Endpoints Summary

| Endpoint                | Method | Description                                    |
| ----------------------- | ------ | ---------------------------------------------- |
| `/health`               | GET    | Health check status                            |
| `/api/film-data`        | GET    | ดึงข้อมูล surgery schedule จาก Film data sheet |
| `/api/film-call-status` | GET    | ดึงสถานะการโทรจาก Film_dev sheet               |

---

## 🔐 Security Best Practices

1. **ไม่ commit `.env` file** - ใช้ `.env.example` แทน
2. **ใช้ Environment Variables** - เก็บ credentials ใน Railway Variables
3. **Enable HTTPS** - Railway มี SSL certificate ฟรี
4. **Rotate Keys** - เปลี่ยน Service Account key เป็นระยะ
5. **Monitor Logs** - ตรวจสอบ suspicious activities

---

## 📚 เอกสารเพิ่มเติม

- [Railway Documentation](https://docs.railway.app/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)

---

## 🆘 ต้องการความช่วยเหลือ?

- Railway Discord: https://discord.gg/railway
- Railway Community Forum: https://help.railway.app/
- GitHub Issues: สร้าง issue ใน repository นี้

---

**สร้างโดย:** Film Developer Team  
**วันที่อัพเดทล่าสุด:** 2024-01-01  
**เวอร์ชัน:** 1.0.0

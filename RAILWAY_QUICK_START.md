# 🚀 Quick Start: Railway Deployment

## เริ่มต้นใน 5 นาที

### 1. สร้าง Railway Project

```bash
# ไปที่ https://railway.app/
# คลิก "New Project" → "Deploy from GitHub repo"
# เลือก repository: React-Business
```

### 2. ตั้งค่า Root Directory

```
Settings → Root Directory → "python-api"
```

### 3. เพิ่ม Environment Variables

คัดลอกจาก `.env` ไปใส่ใน Railway Variables tab:

```bash
GOOGLE_SPREADSHEET_ID=your_id
GOOGLE_PROJECT_ID=your_project
GOOGLE_PRIVATE_KEY_ID=your_key_id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

### 4. Generate Domain

```
Settings → Domains → Generate Domain
```

คุณจะได้ URL เช่น: `https://your-project.up.railway.app`

### 5. ทดสอบ

```bash
curl https://your-project.up.railway.app/health
```

### 6. เชื่อมกับ Vercel

เพิ่ม environment variable ใน Vercel:

```bash
NEXT_PUBLIC_API_URL=https://your-project.up.railway.app
```

## ✅ เสร็จสิ้น!

ดู guide ฉบับเต็มได้ที่: `RAILWAY_DEPLOYMENT_GUIDE.md`

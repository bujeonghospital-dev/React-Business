# ✅ Railway Deployment Checklist

ใช้ checklist นี้เพื่อให้แน่ใจว่าคุณได้ทำทุกขั้นตอนก่อน deploy

---

## 📋 ก่อน Deploy

### 1. ไฟล์ที่จำเป็น

- [ ] `python-api/app.py` - Flask application
- [ ] `python-api/requirements.txt` - Python dependencies
- [ ] `python-api/Procfile` - Start command
- [ ] `python-api/railway.json` - Railway config
- [ ] `python-api/runtime.txt` - Python version
- [ ] `python-api/.env.example` - Environment template

### 2. ตรวจสอบไฟล์

- [ ] รัน `.\check-railway-files.ps1` แล้วเห็น ✅ ทั้งหมด
- [ ] ทดสอบ API ใน local แล้วทำงานปกติ
- [ ] `/health` endpoint ใช้งานได้

### 3. Git Repository

- [ ] Push code ล่าสุดไปยัง GitHub
- [ ] Branch `main` หรือ `master` มี code ล่าสุด
- [ ] ไม่มีไฟล์ `.env` ใน git (ใช้ `.env.example` แทน)

---

## 🚂 Railway Setup

### 4. สร้าง Project

- [ ] ไปที่ https://railway.app/
- [ ] Login ด้วย GitHub
- [ ] คลิก "New Project"
- [ ] เลือก "Deploy from GitHub repo"
- [ ] เลือก repository `React-Business`

### 5. ตั้งค่า Root Directory

- [ ] ไปที่ **Settings** tab
- [ ] หา **"Root Directory"**
- [ ] ใส่: `python-api`
- [ ] คลิก **Save**

### 6. Environment Variables

ไปที่ **Variables** tab และเพิ่มตัวแปรทั้งหมด:

- [ ] `GOOGLE_SPREADSHEET_ID`
- [ ] `GOOGLE_PROJECT_ID`
- [ ] `GOOGLE_PRIVATE_KEY_ID`
- [ ] `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
  - ⚠️ **สำคัญ:** ต้องมี `\n` สำหรับขึ้นบรรทัดใหม่
  - ตัวอย่าง: `-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----`
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_CERT_URL`

### 7. Generate Domain

- [ ] ไปที่ **Settings** tab
- [ ] หา **"Domains"**
- [ ] คลิก **"Generate Domain"**
- [ ] คัดลอก URL (เช่น `https://your-project.up.railway.app`)

---

## 🧪 หลัง Deploy

### 8. ทดสอบ API

ใช้ URL ที่ได้จาก Railway:

- [ ] ทดสอบ health check:

  ```bash
  curl https://your-project.up.railway.app/health
  ```

  ต้องได้: `{"status": "healthy", "timestamp": "..."}`

- [ ] ทดสอบ film data:

  ```bash
  curl https://your-project.up.railway.app/api/film-data
  ```

- [ ] ทดสอบ film call status:
  ```bash
  curl https://your-project.up.railway.app/api/film-call-status
  ```

### 9. ตรวจสอบ Logs

- [ ] ไปที่ Railway Dashboard
- [ ] คลิก **"View Logs"**
- [ ] ตรวจสอบว่าไม่มี errors
- [ ] เห็นข้อความ "Starting Flask API server..."

### 10. ดู Metrics

- [ ] ไปที่ **Metrics** tab
- [ ] ตรวจสอบ CPU Usage
- [ ] ตรวจสอบ Memory Usage
- [ ] ตรวจสอบ Network Traffic

---

## 🔗 เชื่อมกับ Vercel

### 11. ตั้งค่า Vercel

- [ ] ไปที่ Vercel Dashboard
- [ ] เลือก Next.js project
- [ ] ไปที่ **Settings** → **Environment Variables**
- [ ] เพิ่ม variable:
  ```
  NEXT_PUBLIC_API_URL=https://your-project.up.railway.app
  ```
- [ ] เลือก Environment: `Production`, `Preview`, `Development` (ทั้งหมด)
- [ ] คลิก **Save**

### 12. Redeploy Vercel

- [ ] ไปที่ **Deployments** tab
- [ ] คลิก **"..."** ที่ deployment ล่าสุด
- [ ] เลือก **"Redeploy"**
- [ ] รอจน deployment เสร็จ

### 13. ทดสอบ Integration

- [ ] เปิด Vercel app URL
- [ ] ตรวจสอบว่า Frontend เรียก Railway API ได้
- [ ] ตรวจสอบ Network tab ใน browser
- [ ] ตรวจสอบว่าไม่มี CORS errors
- [ ] ข้อมูลแสดงถูกต้อง

---

## 🎉 เสร็จสิ้น!

- [ ] Frontend (Vercel) ทำงานได้
- [ ] Backend (Railway) ทำงานได้
- [ ] API endpoints ทั้งหมดใช้งานได้
- [ ] ไม่มี errors ใน logs
- [ ] บันทึก Railway URL ไว้ใช้งาน

---

## 📝 บันทึกข้อมูล

**Railway API URL:**

```
https://______________________.up.railway.app
```

**Vercel Frontend URL:**

```
https://______________________.vercel.app
```

**Date Deployed:**

```
____________________
```

---

## 🆘 ถ้ามีปัญหา

ดู troubleshooting ได้ที่:

- `RAILWAY_DEPLOYMENT_GUIDE.md` (section 🐛 การแก้ไขปัญหา)
- Railway Logs: คลิก "View Logs" ใน Dashboard
- Vercel Logs: ไปที่ Deployments → เลือก deployment → View Function Logs

---

## 🔄 การอัพเดทภายหลัง

เมื่อต้องการอัพเดท code:

1. แก้ไข code
2. `git add .`
3. `git commit -m "Your message"`
4. `git push origin main`
5. Railway จะ auto-deploy ให้อัตโนมัติ ✨

---

**Happy Deploying! 🚀**

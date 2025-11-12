# 🚀 วิธีตั้งค่า Film Contacts API สำหรับ Vercel

## 📋 ภาพรวม

API endpoint `/api/film-contacts` ได้รับการปรับปรุงให้เชื่อมต่อกับ Google Sheets โดยตรง แทนที่จะต้องพึ่ง Python API ที่ต้อง deploy แยก

ตอนนี้ API สามารถทำงานบน Vercel ได้เลยโดยไม่ต้อง deploy Python API แยก ✅

---

## 🔑 Environment Variables ที่ต้องตั้งค่าบน Vercel

ไปที่ Vercel Dashboard → Settings → Environment Variables และเพิ่มตัวแปรต่อไปนี้:

### 1. GOOGLE_SPREADSHEET_ID

```
1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y
```

**คำอธิบาย:** ID ของ Google Sheets ที่ต้องการดึงข้อมูล

### 2. GOOGLE_SERVICE_ACCOUNT_EMAIL

```
web-sheets-reader@name-tel-dev.iam.gserviceaccount.com
```

**คำอธิบาย:** Email ของ Service Account ที่มีสิทธิ์อ่าน Google Sheets

### 3. GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZ97WjLIORTUMU
pAh6tEiL9iktiTN8TbwdlAO3lin58vAIMkeAqYxTswV+ewS4Uw3wgABZZyDREfKG
...
(ใส่ Private Key ทั้งหมด)
...
CHkHcDaQUJnGo8/i0+g6QOQJcBKaoPzeyiNSkg4/u55rXKagPtNWOyl9VCUNYbmJ
fPCvcFPqJVxMt92O5J3B7Q==
-----END PRIVATE KEY-----
```

**คำอธิบาย:** Private Key ของ Service Account (ต้องใส่ทั้ง header และ footer)

⚠️ **สำคัญ:** บน Vercel UI อาจต้องใส่ Private Key แบบ single line โดยใช้ `\n` แทนการขึ้นบรรทัดใหม่

### 4. GOOGLE_PROJECT_ID

```
name-tel-dev
```

**คำอธิบาย:** Project ID จาก Google Cloud

### 5. GOOGLE_PRIVATE_KEY_ID (Optional)

```
(ดูจากไฟล์ Service Account JSON)
```

**คำอธิบาย:** Private Key ID จาก Service Account

### 6. GOOGLE_CLIENT_ID (Optional)

```
(ดูจากไฟล์ Service Account JSON)
```

**คำอธิบาย:** Client ID จาก Service Account

### 7. GOOGLE_CLIENT_CERT_URL (Optional)

```
(ดูจากไฟล์ Service Account JSON)
```

**คำอธิบาย:** Client Certificate URL จาก Service Account

---

## 🎯 วิธีตั้งค่าบน Vercel

### ขั้นตอนที่ 1: ไปที่ Vercel Dashboard

1. เปิด https://vercel.com
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Settings** → **Environment Variables**

### ขั้นตอนที่ 2: เพิ่ม Environment Variables

สำหรับแต่ละตัวแปรด้านบน:

1. คลิก **Add New**
2. ใส่ชื่อตัวแปร (เช่น `GOOGLE_SPREADSHEET_ID`)
3. ใส่ค่า
4. เลือก Environment: **Production**, **Preview**, **Development** (แนะนำเลือกทั้งหมด)
5. คลิก **Save**

### ขั้นตอนที่ 3: Redeploy

หลังจากตั้งค่า Environment Variables แล้ว ต้อง Redeploy:

```bash
vercel --prod
```

หรือ Trigger deployment ใหม่จาก Vercel Dashboard → Deployments → Redeploy

---

## 🔐 วิธีหา Service Account Credentials

ถ้าคุณยังไม่มี Service Account หรือต้องการสร้างใหม่:

### 1. ไปที่ Google Cloud Console

https://console.cloud.google.com

### 2. สร้าง Service Account

1. ไปที่ **IAM & Admin** → **Service Accounts**
2. คลิก **Create Service Account**
3. ตั้งชื่อ (เช่น `web-sheets-reader`)
4. คลิก **Create and Continue**
5. ข้าม Role (ไม่จำเป็นต้องเพิ่ม) → คลิก **Done**

### 3. สร้าง Key

1. คลิกที่ Service Account ที่สร้าง
2. ไปที่แท็บ **Keys**
3. คลิก **Add Key** → **Create new key**
4. เลือก **JSON** → คลิก **Create**
5. ไฟล์ JSON จะถูกดาวน์โหลด

### 4. แชร์ Google Sheets กับ Service Account

1. เปิด Google Sheets ที่ต้องการใช้
2. คลิก **Share**
3. ใส่ email ของ Service Account (เช่น `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`)
4. ตั้งสิทธิ์เป็น **Viewer**
5. คลิก **Share**

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "film-2",
      "customerName": "นายทดสอบ",
      "phoneNumber": "0812345678",
      "product": "ผลิตภัณฑ์ A",
      "remarks": "หมายเหตุ",
      "status": "outgoing",
      "contactDate": "2025-11-12T10:30:00.000Z"
    }
  ],
  "total": 1,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "source": "Google Sheets (Film_dev) - Direct API"
}
```

### Error Response

```json
{
  "success": true,
  "data": [],
  "total": 0,
  "error": "Error message here",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

---

## 🧪 วิธีทดสอบ

### ทดสอบในเครื่อง (Local)

1. สร้างไฟล์ `.env.local`:

```env
GOOGLE_SPREADSHEET_ID=1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y
GOOGLE_SERVICE_ACCOUNT_EMAIL=web-sheets-reader@name-tel-dev.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=name-tel-dev
```

2. รัน development server:

```bash
npm run dev
```

3. ทดสอบ API:

```bash
# ดึงข้อมูลทั้งหมด
curl http://localhost:3000/api/film-contacts

# ค้นหาด้วย search query
curl "http://localhost:3000/api/film-contacts?search=นาย"
```

### ทดสอบบน Vercel (Production)

หลังจาก deploy แล้ว ทดสอบด้วย:

```bash
# ดึงข้อมูลทั้งหมด
curl https://your-domain.vercel.app/api/film-contacts

# ค้นหาด้วย search query
curl "https://your-domain.vercel.app/api/film-contacts?search=นาย"
```

---

## ❓ คำถามที่พบบ่อย

### Q: ต้องใช้ Python API อีกไหม?

**A:** ไม่ต้องแล้ว! API ใหม่เชื่อมต่อกับ Google Sheets โดยตรง ไม่ต้อง deploy Python API แยก

### Q: ถ้า Private Key มี newlines ต้องทำอย่างไร?

**A:** บน Vercel ใส่ Private Key แบบ single line โดยแทนที่ newlines ด้วย `\n`:

```
-----BEGIN PRIVATE KEY-----\nMIIEvAI...\n-----END PRIVATE KEY-----\n
```

### Q: ข้อมูลที่ดึงมามาจาก sheet ไหน?

**A:** Sheet `Film_dev` โดยจะกรองเฉพาะแถวที่มี column AS (status_call) = "อยู่ระหว่างโทรออก"

### Q: ทำไมต้องแชร์ Google Sheets กับ Service Account?

**A:** Service Account ต้องมีสิทธิ์อ่าน Google Sheets ถึงจะดึงข้อมูลได้ (เหมือนกับการแชร์ไฟล์ให้คนอื่น)

---

## 🎉 สรุป

1. ✅ แก้ไข `/api/film-contacts` ให้เชื่อมต่อ Google Sheets โดยตรง
2. ✅ ไม่ต้อง deploy Python API แยก
3. ✅ ตั้งค่า Environment Variables บน Vercel
4. ✅ Redeploy → ใช้งานได้เลย!

**ข้อดี:**

- 🚀 ง่ายกว่า ไม่ต้อง maintain Python API แยก
- 💰 ประหยัดทรัพยากร ไม่ต้องจ่าย hosting Python API
- ⚡ เร็วกว่า ไม่ต้องเรียก API กลางอีกชั้น
- 🔄 Scalable บน Vercel serverless infrastructure

**หมายเหตุ:** ถ้าต้องการใช้ Python API ต่อ สามารถดูวิธีการได้ที่ `PYTHON_API_RAILWAY_GUIDE.md`

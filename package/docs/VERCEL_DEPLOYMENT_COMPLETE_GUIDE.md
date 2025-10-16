# 🚀 Vercel Deployment Guide - Google Maps API

## สำหรับ: https://tpp-thanakon.store/contact-inquiry

---

## 📋 สิ่งที่ต้องเตรียม

- ✅ Vercel Account (login ได้แล้ว)
- ✅ API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
- ✅ โค้ด push ไป GitHub แล้ว
- ⚠️ ต้องทำ 2 ขั้นตอนต่อไปนี้

---

## 🔧 ขั้นตอนที่ 1: เพิ่ม Environment Variable ใน Vercel

### 1. เข้า Vercel Dashboard

เปิด: **https://vercel.com/dashboard**

หรือ: **https://vercel.com/**

---

### 2. เลือก Project

หาและคลิกที่ Project ของคุณ:

- ชื่ออาจจะเป็น: `react-business`, `package`, หรือตามที่ตั้งไว้
- ถ้ามี domain `tpp-thanakon.store` ก็คือ Project นั้น

---

### 3. เข้า Settings

```
[Project Dashboard]
→ คลิก "Settings" (แถบบน)
```

---

### 4. เข้า Environment Variables

```
[Settings]
→ คลิก "Environment Variables" (เมนูซ้าย)
```

---

### 5. เพิ่ม API Key

คลิกปุ่ม **"Add New"** หรือ **"New Variable"**

**กรอกข้อมูล:**

```
┌─────────────────────────────────────────────────┐
│ Key (Name)                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Value                                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Environments                                    │
│ ☑ Production                                    │
│ ☑ Preview                                       │
│ ☑ Development                                   │
│                                                 │
│ [Cancel] [Save]                                 │
└─────────────────────────────────────────────────┘
```

**สำคัญ!**

- ✅ Key ต้องเป็น: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (ต้องขึ้นต้นด้วย `NEXT_PUBLIC_`)
- ✅ Value: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
- ✅ เลือกทั้ง 3 environments (Production, Preview, Development)

---

### 6. Save

คลิก **"Save"** หรือ **"Add"**

คุณจะเห็น Environment Variable ใหม่ในรายการ:

```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
├─────────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY                        │
│ AIzaSyB0...                                            │
│ Production, Preview, Development                        │
│ [Edit] [Remove]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 ขั้นตอนที่ 2: Redeploy

Environment Variables ที่เพิ่มใหม่จะมีผลหลังจาก **Redeploy** เท่านั้น!

### วิธีที่ 1: Redeploy จาก Vercel Dashboard (แนะนำ)

#### 1. ไปที่ Deployments

```
[Project Dashboard]
→ คลิก "Deployments" (แถบบน)
```

#### 2. เลือก Deployment ล่าสุด

คุณจะเห็นรายการ deployments:

```
┌─────────────────────────────────────────────────┐
│ Production                                      │
├─────────────────────────────────────────────────┤
│ main@a1b2c3d  ✓ Ready                          │
│ 2 minutes ago                                   │
│ [...]                                           │ ← คลิกที่นี่
└─────────────────────────────────────────────────┘
```

#### 3. คลิก ... (3 dots)

ที่มุมขวาบนของหน้า deployment:

```
[... (3 dots)]
  ↓
  Redeploy          ← เลือกตัวนี้
  View Source
  View Logs
```

#### 4. เลือก "Redeploy"

จะมี popup ถาม:

```
┌─────────────────────────────────────────────┐
│ Redeploy this deployment?                   │
│                                             │
│ ☑ Use existing Build Cache                 │ ← ไม่ต้องติ๊กก็ได้
│                                             │
│ [Cancel]  [Redeploy]                        │
└─────────────────────────────────────────────┘
```

คลิก **"Redeploy"**

---

### วิธีที่ 2: Push Code ใหม่ (ถ้าต้องการ)

หรือถ้าคุณอยากจะ deploy ด้วยการ push code:

```powershell
# ใน Terminal (PowerShell)
cd C:\Users\Thanakron\Documents\GitHub\React-Business\package

# เช็คสถานะ
git status

# ถ้ามีการเปลี่ยนแปลง (เช่น docs ที่เพิ่งสร้าง)
git add .
git commit -m "docs: add Vercel deployment guide"
git push origin main
```

Vercel จะ auto-deploy หลังจาก push สำเร็จ

---

## ⏱️ รอให้ Deploy เสร็จ

### 1. ดู Progress

หลังจาก Redeploy จะเห็นสถานะ:

```
┌─────────────────────────────────────────────────┐
│ Building...                                     │
│ ━━━━━━━━━━░░░░░░░░░░ 50%                       │
│ Building application                            │
└─────────────────────────────────────────────────┘
```

### 2. รอจนเสร็จ

ใช้เวลาประมาณ **2-5 นาที** ตามขนาดโปรเจค

สถานะจะเปลี่ยนเป็น:

```
┌─────────────────────────────────────────────────┐
│ ✓ Ready                                         │
│ https://tpp-thanakon.store                      │
│ Deployment completed                            │
└─────────────────────────────────────────────────┘
```

### 3. ตรวจสอบว่า Environment Variable มีผล

ดูที่หน้า deployment:

```
[Deployment Detail]
→ ดูส่วน "Environment Variables"
→ ต้องเห็น: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

---

## 🌐 ขั้นตอนที่ 3: เพิ่ม Domain ใน Google Cloud Console

**สำคัญมาก!** ถ้าไม่ทำขั้นนี้จะเจอ `RefererNotAllowedMapError`

### 1. เข้า Google Cloud Console

เปิด: **https://console.cloud.google.com/apis/credentials**

### 2. เลือก API Key

หาและคลิก: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`

### 3. เลือก HTTP referrers

ในส่วน **"Application restrictions"**:

```
○ None
● HTTP referrers (web sites)  ← เลือกตัวนี้
○ IP addresses
○ Android apps
○ iOS apps
```

### 4. เพิ่ม Referrers

คลิก **"ADD AN ITEM"** และเพิ่มทั้ง 4 บรรทัดนี้:

```
http://localhost:3000/*
http://127.0.0.1:3000/*
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*
```

**อธิบาย:**

- `localhost:3000` = สำหรับ development
- `127.0.0.1:3000` = สำหรับ development (alternative)
- `tpp-thanakon.store` = สำหรับ production domain
- `*.tpp-thanakon.store` = สำหรับ subdomains (ถ้ามี)

### 5. Save

คลิก **"SAVE"** ด้านล่าง

### 6. รอ 1-2 นาที

Google ต้องใช้เวลา sync การเปลี่ยนแปลง

---

## ✅ ทดสอบ Production

### 1. Clear Browser Cache

กด:

```
Ctrl + Shift + Delete
→ เลือก "Cached images and files"
→ Clear
```

### 2. เปิดเว็บ

```
https://tpp-thanakon.store/contact-inquiry
```

### 3. เปิด Developer Console

กด **F12** หรือ **Ctrl + Shift + I**

### 4. ตรวจสอบ Console

**ก่อนแก้ไข (ที่เห็นตอนนี้):**

```
⚠️ Google Maps API Key is not configured - using fallback iframe
❌ RefererNotAllowedMapError: https://tpp-thanakon.store
```

**หลังแก้ไข (ที่ควรเห็น):**

```
✅ (ไม่มี errors เกี่ยวกับ Google Maps)
```

### 5. ตรวจสอบ Network Tab

1. กด **F12**
2. เปิด tab **"Network"**
3. กรอง: `maps.googleapis.com`
4. Reload หน้าเว็บ (Ctrl+R)

**ควรเห็น:**

```
Name: js?key=AIzaSyB...
Status: 200 OK
Type: script
```

**ถ้า error:**

```
Status: 403 (RefererNotAllowedMapError)
→ ยังไม่ได้เพิ่ม domain ใน Google Cloud หรือ Google ยัง sync ไม่เสร็จ
```

### 6. ตรวจสอบแผนที่

**ก่อนแก้ไข:**

- แสดง iframe (Google Maps Embed)
- หรือ แสดง "Loading map..."

**หลังแก้ไข:**

- ✅ แสดง Web Components (gmp-map)
- ✅ Marker สีแดง (advanced marker)
- ✅ สามารถ zoom, drag ได้
- ✅ Performance ดีกว่า

---

## 📋 Checklist ทั้งหมด

### เตรียมพร้อม:

- [x] มี Vercel Account
- [x] มี Google Cloud Console Account
- [x] มี API Key

### Vercel Setup:

- [ ] เข้า https://vercel.com/dashboard
- [ ] เลือก Project
- [ ] Settings → Environment Variables
- [ ] Add New: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] Value: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
- [ ] เลือกทั้ง 3 environments
- [ ] Save
- [ ] Deployments → เลือก deployment ล่าสุด → ... → Redeploy
- [ ] รอให้ deploy เสร็จ (2-5 นาที)

### Google Cloud Console:

- [ ] เข้า https://console.cloud.google.com/apis/credentials
- [ ] เลือก API Key
- [ ] เลือก "HTTP referrers"
- [ ] เพิ่ม `http://localhost:3000/*`
- [ ] เพิ่ม `http://127.0.0.1:3000/*`
- [ ] เพิ่ม `https://tpp-thanakon.store/*`
- [ ] เพิ่ม `https://*.tpp-thanakon.store/*`
- [ ] Save
- [ ] รอ 1-2 นาที

### ทดสอบ:

- [ ] Clear browser cache
- [ ] เปิด https://tpp-thanakon.store/contact-inquiry
- [ ] กด F12 เปิด Console
- [ ] ไม่มี "API Key is not configured" warning
- [ ] ไม่มี RefererNotAllowedMapError
- [ ] แผนที่แสดงผลเป็น Web Components
- [ ] Marker แสดงผล
- [ ] Zoom/Drag ทำงานได้

---

## 🆘 Troubleshooting

### ปัญหา 1: ยังเห็น "API Key is not configured"

**สาเหตุที่เป็นไปได้:**

1. ไม่ได้ Redeploy หลังจากเพิ่ม Environment Variable
2. Key name ผิด (ต้องเป็น `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
3. Deploy ยังไม่เสร็จ

**วิธีแก้:**

```
1. ตรวจสอบ Environment Variables:
   → Vercel Dashboard
   → Project → Settings → Environment Variables
   → เช็คว่ามี NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

2. ตรวจสอบว่า Redeploy หรือยัง:
   → Deployments tab
   → เช็คเวลา latest deployment
   → ต้องเป็นหลังจากที่เพิ่ม env var

3. Redeploy อีกครั้ง:
   → Deployments → latest → ... → Redeploy

4. Hard Reload Browser:
   → Ctrl + Shift + R
```

---

### ปัญหา 2: RefererNotAllowedMapError

**สาเหตุ:**

- ยังไม่ได้เพิ่ม domain ใน Google Cloud Console
- หรือ Google ยัง sync ไม่เสร็จ

**วิธีแก้:**

```
1. ตรวจสอบ Google Cloud Console:
   → https://console.cloud.google.com/apis/credentials
   → เลือก API Key
   → ดูที่ "Website restrictions"
   → ต้องมี: https://tpp-thanakon.store/*

2. ตรวจสอบ pattern:
   ✅ ถูก: https://tpp-thanakon.store/*
   ❌ ผิด: https://tpp-thanakon.store (ขาด /*)
   ❌ ผิด: tpp-thanakon.store/* (ขาด https://)

3. รอ 2-3 นาที:
   Google ต้องใช้เวลา sync

4. Clear cache และ reload:
   → Ctrl + Shift + Delete
   → Ctrl + Shift + R
```

---

### ปัญหา 3: Environment Variable ไม่มีผลแม้ Redeploy แล้ว

**วิธีแก้:**

```
1. เช็คว่า Key ขึ้นต้นด้วย NEXT_PUBLIC_:
   ✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ❌ GOOGLE_MAPS_API_KEY (ไม่มี NEXT_PUBLIC_)

2. ดู Build Logs:
   → Deployments → latest deployment
   → Scroll ดู logs
   → หา "Environment Variables"
   → ต้องเห็น NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

3. ลบและเพิ่มใหม่:
   → Settings → Environment Variables
   → Remove NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   → Add New อีกครั้ง
   → Redeploy

4. ถ้ายังไม่ได้:
   → ลอง push code commit ใหม่
   → Vercel จะ auto deploy
```

---

### ปัญหา 4: แผนที่แสดงแต่ไม่มี Marker

**สาเหตุ:**

- Coordinates ผิด
- Web Components ยังโหลดไม่เสร็จ

**วิธีแก้:**

```javascript
// เช็คใน src/app/contact-inquiry/page.tsx:
headquarters: {
  title: "สำนักงานใหญ่",
  coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 }
}

// ถ้าถูกต้อง รอสักครู่แล้ว reload
```

---

## 🎯 คาดหวังผลลัพธ์

### ก่อนแก้ไข:

- ⚠️ แผนที่แสดงแบบ iframe (fallback)
- ❌ Console มี warnings/errors
- ⚠️ Performance ไม่ optimal

### หลังแก้ไข:

- ✅ แผนที่แสดงแบบ Web Components (gmp-map)
- ✅ ไม่มี errors/warnings ใน Console
- ✅ Marker แสดงเป็น advanced marker (สวยกว่า)
- ✅ Performance ดีขึ้น (async loading)
- ✅ Zoom/Pan ลื่นกว่า
- ✅ รองรับ dark mode (ถ้ามี)

---

## 📊 เปรียบเทียบ

| Feature        | Before (iframe) | After (Web Components) |
| -------------- | --------------- | ---------------------- |
| Performance    | ⚠️ ช้ากว่า      | ✅ เร็วกว่า            |
| Loading        | ⚠️ Sync         | ✅ Async               |
| Marker Style   | ⚠️ Default      | ✅ Advanced            |
| Customization  | ❌ จำกัด        | ✅ ยืดหยุ่น            |
| Console Errors | ❌ มี warnings  | ✅ ไม่มี               |

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Your Website:** https://tpp-thanakon.store/contact-inquiry
- **Vercel Docs:** https://vercel.com/docs/concepts/projects/environment-variables

---

## 📞 ติดปัญหา?

แจ้งมาพร้อม:

1. Screenshot Environment Variables page (Vercel)
2. Screenshot Google Cloud Console HTTP referrers
3. Screenshot Console errors (F12)
4. ทำตามขั้นตอนไหนไปแล้วบ้าง

---

## ✨ Tips สำหรับ Next.js + Vercel

1. **Environment Variables ใน Next.js:**

   - ต้องขึ้นต้นด้วย `NEXT_PUBLIC_` ถ้าต้องการใช้ใน client-side
   - ไม่มี `NEXT_PUBLIC_` = ใช้ได้แค่ server-side

2. **Vercel Auto-Deploy:**

   - Push ไป `main` branch = auto deploy Production
   - Push ไป branch อื่น = auto deploy Preview

3. **Preview Deployments:**

   - ทุก pull request จะได้ unique URL
   - เหมาะสำหรับ testing ก่อน merge

4. **Caching:**
   - Vercel มี aggressive caching
   - ถ้าเปลี่ยน env var ต้อง Redeploy เสมอ

---

_Updated: October 15, 2025_
_Platform: Vercel_
_Status: Ready for Production Deployment_

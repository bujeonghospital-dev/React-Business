# 🚀 Production Deployment Checklist - Google Maps

## 🌐 Domain: https://tpp-thanakon.store/contact-inquiry

---

## ✅ สถานะปัจจุบัน

### Local (localhost:3000):

- ✅ API Key มีใน `.env.local`
- ⚠️ ยังต้องเพิ่ม `localhost:3000` ใน Google Cloud Console

### Production (tpp-thanakon.store):

- ❌ **ยังไม่ได้เพิ่ม API Key ใน Vercel/Netlify**
- ❌ **ยังไม่ได้เพิ่ม domain ใน Google Cloud Console**

---

## 🔧 ขั้นตอนสำหรับ Production (ทำทั้งหมด 2 ขั้น)

### ขั้นที่ 1: เพิ่ม API Key ใน Vercel/Netlify

#### ถ้าใช้ Vercel:

1. เข้า: https://vercel.com/dashboard
2. เลือก Project: `react-business` หรือชื่อที่คุณตั้ง
3. ไปที่: **Settings** → **Environment Variables**
4. คลิก **Add New**

```
Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

5. เลือก Environments:

   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. คลิก **Save**
7. **Redeploy** โดยไปที่:
   - **Deployments** tab
   - คลิก **...** (3 dots) ที่ deployment ล่าสุด
   - เลือก **Redeploy**

---

#### ถ้าใช้ Netlify:

1. เข้า: https://app.netlify.com/
2. เลือก Site: `react-business` หรือชื่อที่คุณตั้ง
3. ไปที่: **Site configuration** → **Environment variables**
4. คลิก **Add a variable**

```
Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

5. เลือก Scopes:

   - ✅ All scopes

6. คลิก **Create variable**
7. **Trigger deploy** โดยไปที่:
   - **Deploys** tab
   - คลิก **Trigger deploy** → **Deploy site**

---

### ขั้นที่ 2: เพิ่ม Production Domain ใน Google Cloud Console

1. เข้า: https://console.cloud.google.com/apis/credentials
2. คลิก API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
3. เลือก **"HTTP referrers (web sites)"**
4. คลิก **"ADD AN ITEM"** และเพิ่ม:

```
http://localhost:3000/*
http://127.0.0.1:3000/*
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*
```

5. คลิก **SAVE**
6. **รอ 1-2 นาที**

---

## 🧪 การทดสอบ Production

### 1. รอให้ Deploy เสร็จ:

**Vercel:**

- ดูที่ Deployments tab
- รอจนสถานะเป็น **"Ready"**
- ใช้เวลา 2-5 นาที

**Netlify:**

- ดูที่ Deploys tab
- รอจนสถานะเป็น **"Published"**
- ใช้เวลา 2-5 นาที

---

### 2. เปิดเว็บ:

```
https://tpp-thanakon.store/contact-inquiry
```

---

### 3. ตรวจสอบ (กด F12):

#### ที่ Console tab ควรเห็น:

**ก่อนแก้ไข:**

```
❌ Google Maps API Key is not configured - using fallback iframe
❌ RefererNotAllowedMapError: https://tpp-thanakon.store
```

**หลังแก้ไข:**

```
✅ (ไม่มี errors)
```

#### ที่ Network tab:

**ตรวจสอบ request:**

```
https://maps.googleapis.com/maps/api/js?key=AIzaSyB...
```

**Status ควรเป็น:** `200 OK`

**ถ้า error:** ตรวจสอบว่า API Key ตั้งค่าครบหรือยัง

---

### 4. ตรวจสอบแผนที่:

**ก่อนแก้ไข:**

- ⚠️ แสดง iframe (fallback)
- หรือ แสดง "Loading map..." (ถ้าไม่มี API Key)

**หลังแก้ไข:**

- ✅ แสดง Web Components (gmp-map)
- ✅ Marker แสดงผล
- ✅ สามารถ zoom/drag ได้

---

## 📋 Checklist สำหรับ Production

### เตรียมพร้อม:

- [ ] มี API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
- [ ] รู้ว่าใช้ Vercel หรือ Netlify
- [ ] Login เข้า Vercel/Netlify ได้
- [ ] Login เข้า Google Cloud Console ได้

---

### ขั้นตอนที่ 1 - Environment Variables:

- [ ] เข้า Vercel/Netlify Dashboard
- [ ] ไปที่ Settings → Environment Variables
- [ ] เพิ่ม `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] ใส่ค่า: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
- [ ] เลือก All environments/scopes
- [ ] Save
- [ ] Redeploy/Trigger deploy

---

### ขั้นตอนที่ 2 - Google Cloud Console:

- [ ] เข้า Google Cloud Console
- [ ] เลือก API Key
- [ ] เลือก "HTTP referrers (web sites)"
- [ ] เพิ่ม `https://tpp-thanakon.store/*`
- [ ] เพิ่ม `https://*.tpp-thanakon.store/*`
- [ ] (Optional) เพิ่ม localhost ด้วยถ้าจะ dev
- [ ] Save
- [ ] รอ 1-2 นาที

---

### ทดสอบ:

- [ ] รอให้ deploy เสร็จ (2-5 นาที)
- [ ] เปิด `https://tpp-thanakon.store/contact-inquiry`
- [ ] กด F12 เปิด Console
- [ ] ไม่มี errors เรื่อง API Key
- [ ] ไม่มี RefererNotAllowedMapError
- [ ] แผนที่แสดงผลเป็น Web Components
- [ ] Marker แสดงผล
- [ ] Zoom/Drag ทำงานได้

---

## 🆘 Troubleshooting

### ปัญหา: ยังเห็น "API Key is not configured"

**สาเหตุ:**

- ยังไม่ได้เพิ่ม Environment Variable
- หรือ ยังไม่ได้ Redeploy

**แก้:**

1. ตรวจสอบ Environment Variables อีกครั้ง
2. ต้องขึ้นต้นด้วย `NEXT_PUBLIC_` (Next.js requirement)
3. Redeploy อีกครั้ง
4. Clear browser cache (Ctrl+Shift+Delete)
5. Hard reload (Ctrl+Shift+R)

---

### ปัญหา: RefererNotAllowedMapError

**สาเหตุ:**

- ยังไม่ได้เพิ่ม domain ใน Google Cloud Console
- หรือ Google ยัง sync ไม่เสร็จ

**แก้:**

1. เช็ค Google Cloud Console อีกครั้ง
2. ต้องมี `https://tpp-thanakon.store/*`
3. ต้องมี `/*` ท้าย
4. รอ 2-3 นาที
5. Clear cache และ reload

---

### ปัญหา: Environment Variable ไม่มีผล

**Vercel:**

```bash
# ตรวจสอบว่า deploy ครั้งล่าสุดมี env variable หรือไม่:
1. Deployments tab
2. คลิก deployment ล่าสุด
3. ดูที่ "Environment Variables" section
4. ต้องเห็น NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**Netlify:**

```bash
# ตรวจสอบ:
1. Site configuration → Environment variables
2. ต้องเห็น NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
3. ถ้าไม่มี = ต้องเพิ่มใหม่
```

---

### ปัญหา: แผนที่แสดงแต่ไม่มี marker

**สาเหตุ:**

- Web Components โหลดไม่เสร็จ
- หรือ coordinates ผิด

**แก้:**

```typescript
// ตรวจสอบใน page.tsx:
coordinates: { lat: 13.685984091307898, lng: 100.72794861574249 }
```

---

## 🎯 สรุปสั้นๆ

**ทำแค่ 2 ขั้นตอน:**

### 1️⃣ เพิ่ม API Key ใน Vercel/Netlify:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

→ Redeploy

### 2️⃣ เพิ่ม Domain ใน Google Cloud:

```
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*
```

→ Save → รอ 1-2 นาที

### 3️⃣ ทดสอบ:

```
https://tpp-thanakon.store/contact-inquiry
```

→ F12 → ไม่มี errors → แผนที่ทำงาน ✅

---

## 📞 ติดปัญหา?

แจ้งมาพร้อม:

1. Screenshot Environment Variables (Vercel/Netlify)
2. Screenshot Google Cloud Console (HTTP referrers)
3. Screenshot Console errors (F12)
4. ใช้ Vercel หรือ Netlify?

---

_Updated: October 15, 2025_
_Status: Ready for Production Deployment_

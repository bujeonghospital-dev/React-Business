# 🔧 แก้ไขปัญหา Google Maps - สรุปทั้งหมด

## 🚨 ปัญหาที่พบ

### 1. ❌ RefererNotAllowedMapError

```
Your site URL to be authorized: http://localhost:3000/contact-inquiry
```

### 2. ⚠️ API loaded without async

```
Google Maps JavaScript API has been loaded directly without loading=async
```

### 3. ⚠️ getRootNode error

```
Cannot read properties of undefined (reading 'getRootNode')
```

### 4. ❌ API Key not configured (Production)

```
Google Maps API Key is not configured
```

---

## ✅ การแก้ไขที่ทำ

### 1. ปรับปรุง GoogleMap Component

**ไฟล์:** `src/components/GoogleMap.tsx`

**สิ่งที่แก้:**

- ✅ เพิ่ม `loading=async` parameter
- ✅ รอให้ Web Components พร้อม (`customElements.whenDefined`)
- ✅ เพิ่ม error handling
- ✅ เปลี่ยน `console.error` เป็น `console.warn` สำหรับ missing API Key
- ✅ ตรวจสอบว่า `gmp-map` พร้อมก่อนสร้าง

**โค้ดที่สำคัญ:**

```typescript
// ใช้ loading=async
script.src = `...&loading=async&libraries=maps,marker&v=beta`;

// รอ Web Components พร้อม
customElements.whenDefined("gmp-map").then(() => {
  setScriptLoaded(true);
});

// ตรวจสอบก่อนสร้าง
if (customElements.get("gmp-map")) {
  // สร้าง map
}
```

---

## 🚀 ขั้นตอนที่ต้องทำต่อ

### ⚠️ สำคัญ! ต้องทำด้วยตัวเอง:

### 1. แก้ RefererNotAllowedMapError

**เข้า Google Cloud Console:**
👉 https://console.cloud.google.com/apis/credentials

**ทำตามขั้นตอน:**

1. คลิก API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
2. ในส่วน **Application restrictions** → เลือก **HTTP referrers**
3. คลิก **ADD AN ITEM**
4. เพิ่ม 4 บรรทัดนี้:

```
http://localhost:3000/*
http://127.0.0.1:3000/*
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*
```

5. คลิก **SAVE**
6. **รอ 1-2 นาที**
7. กลับมาที่เว็บ กด `Ctrl + Shift + R`

---

### 2. เพิ่ม API Key บน Production (Vercel/Netlify)

#### Vercel:

```
Settings → Environment Variables

Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
Environments: Production, Preview, Development (ทั้งหมด)

→ Save → Redeploy
```

#### Netlify:

```
Site configuration → Environment variables

Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0

→ Save → Trigger deploy
```

---

## 📊 ผลลัพธ์หลังแก้ไข

| ปัญหา                     | Status     | Action                          |
| ------------------------- | ---------- | ------------------------------- |
| RefererNotAllowedMapError | ⚠️ รอ      | เพิ่ม localhost ใน Google Cloud |
| Loading async warning     | ✅ แก้แล้ว | เพิ่ม `loading=async`           |
| getRootNode error         | ✅ แก้แล้ว | รอ customElements พร้อม         |
| API Key production        | ⚠️ รอ      | เพิ่มบน Vercel/Netlify          |

---

## 🔍 การทดสอบ

### Local (localhost:3000):

```bash
npm run dev
```

**เปิด:** `http://localhost:3000/contact-inquiry`

**ควรเห็น:**

- ✅ iframe แผนที่ (fallback) - จนกว่าจะแก้ RefererNotAllowedMapError
- ⚠️ ยังเห็น RefererNotAllowedMapError - จนกว่าจะเพิ่ม localhost ใน Google Cloud

**หลังจากเพิ่ม localhost:**

- ✅ Web Components map (advanced)
- ✅ ไม่มี errors
- ✅ ไม่มี warnings เรื่อง async

### Production:

**เปิด:** `https://tpp-thanakon.store/contact-inquiry`

**ก่อนเพิ่ม API Key:**

- ✅ iframe แผนที่ (fallback)
- ⚠️ Console: "API Key is not configured" (warning)

**หลังเพิ่ม API Key:**

- ✅ Web Components map
- ✅ ไม่มี errors/warnings

---

## 📝 Checklist

### Development (Local):

- [x] แก้โค้ด GoogleMap.tsx
- [ ] เพิ่ม `http://localhost:3000/*` ใน Google Cloud ← **ต้องทำ!**
- [ ] ทดสอบ: แผนที่แสดงผล
- [ ] ทดสอบ: ไม่มี RefererNotAllowedMapError

### Production:

- [ ] เพิ่ม `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` บน Vercel/Netlify ← **ต้องทำ!**
- [ ] Redeploy
- [ ] ทดสอบ: แผนที่แสดงผล
- [ ] ทดสอบ: ไม่มี errors

### Google Cloud Console:

- [ ] เพิ่ม `localhost:3000` ← **สำคัญที่สุด!**
- [ ] เพิ่ม production domain
- [ ] Save และรอ 1-2 นาที

---

## 💡 Tips

### ถ้ายังเห็น RefererNotAllowedMapError:

1. **ตรวจสอบ:** เพิ่ม `http://localhost:3000/*` แล้วหรือยัง?
2. **รอ:** Google ใช้เวลา sync 1-2 นาที
3. **Clear cache:** Ctrl + Shift + Delete
4. **Hard reload:** Ctrl + Shift + R

### ถ้าแผนที่ไม่แสดง:

1. **ดู Console (F12):** มี error อะไร?
2. **ตรวจสอบ API Key:** ตั้งค่าถูกต้องหรือไม่?
3. **ดู iframe fallback:** ถ้าเห็น iframe = API Key ไม่มี/ไม่ถูกต้อง

---

## 🎯 สรุป

**ที่แก้แล้ว:**

- ✅ Loading async
- ✅ getRootNode error
- ✅ Error handling

**ที่ต้องทำต่อ:**

1. ⚠️ เพิ่ม `localhost:3000` ใน Google Cloud Console
2. ⚠️ เพิ่ม API Key บน Vercel/Netlify
3. ⚠️ Test และ Redeploy

**เสร็จแล้วจะได้:**

- ✅ แผนที่ทำงานได้ทั้ง local และ production
- ✅ ไม่มี errors/warnings
- ✅ Performance ดีขึ้น (async loading)

---

## 🔗 Quick Links

- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Vercel Dashboard: https://vercel.com/dashboard
- Netlify Dashboard: https://app.netlify.com/

---

**ทำทันที:** แก้ RefererNotAllowedMapError ก่อน! 🚀

---

_Updated: October 15, 2025_
_Status: โค้ดแก้แล้ว - รอเพิ่ม localhost ใน Google Cloud_

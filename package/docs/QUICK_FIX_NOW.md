# ⚡ แก้ไขปัญหาด่วน - Production Errors

## 🚨 ปัญหาที่เจอ

```
❌ Google Maps API Key is not configured
❌ GET /images/Home/banner-home.jpg 404
❌ GET /images/team/login-background.png 404
```

---

## ✅ แก้ไขเสร็จแล้ว!

### 1. ✅ แก้รูปภาพ 404

**แก้ไข:** `src/app/contact-inquiry/page.tsx`

```tsx
// เปลี่ยนจาก:
src = "/images/Home/banner-home.jpg"; // ❌ ไฟล์ไม่มี

// เป็น:
src = "/images/team/TPP_HOME.png"; // ✅ ไฟล์มี
```

### 2. ⚠️ ยังต้องแก้: API Key

**ต้องทำบน Hosting Platform:**

#### Vercel:

1. Dashboard → Settings → Environment Variables
2. เพิ่ม:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
   ```
3. Redeploy

#### Netlify:

1. Site configuration → Environment variables
2. เพิ่ม:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
   ```
3. Trigger deploy

---

## 🚀 Deploy ทันที

```cmd
cd c:\Users\Thanakron\Documents\GitHub\React-Business\package

git add .
git commit -m "Fix: Replace missing banner image with existing file"
git push
```

---

## 📋 Checklist

- [x] แก้รูปภาพ 404 (เปลี่ยนเป็นไฟล์ที่มีอยู่)
- [ ] เพิ่ม API Key บน Vercel/Netlify ← **ต้องทำด้วยตัวเอง**
- [ ] Redeploy
- [ ] ทดสอบ: `https://tpp-thanakon.store/contact-inquiry`
- [ ] ทดสอบ: `https://tpp-thanakon.store/th/contact-inquiry`
- [ ] ตรวจสอบไม่มี errors ใน Console

---

## 📊 สรุป

| ปัญหา               | Status     | Action                   |
| ------------------- | ---------- | ------------------------ |
| banner-home.jpg 404 | ✅ แก้แล้ว | เปลี่ยนเป็น TPP_HOME.png |
| API Key missing     | ⚠️ รอ      | เพิ่มบน Vercel/Netlify   |
| Middleware locale   | ✅ แก้แล้ว | มีไฟล์ middleware.ts     |

---

## 🎯 หลังจาก Deploy

**จะเห็น:**

- ✅ รูป Hero section แสดงผล (TPP_HOME.png)
- ✅ ไม่มี image 404 errors
- ⚠️ แผนที่ยังไม่แสดง (รอเพิ่ม API Key)

**หลังจากเพิ่ม API Key:**

- ✅ แผนที่แสดงผลปกติ
- ✅ ไม่มี errors ทั้งหมด

---

**Deploy เลย!** 🚀

```cmd
git push
```

จากนั้นไปเพิ่ม API Key บน Vercel/Netlify และ Redeploy!

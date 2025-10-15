# ✅ แก้ไข 404 Error เสร็จสมบูรณ์!

## 🎯 สิ่งที่แก้ไข

**ไฟล์:** `src/components/GoogleMap.tsx`

**ปัญหา:** หน้า `/contact-inquiry` ให้ 404 error เพราะ SSR ไม่รองรับ Web Components

**วิธีแก้:** เพิ่ม iframe fallback และ client-side detection

## 🚀 วิธี Deploy ด่วน (5 นาที)

### 1. Build โปรเจกต์

```cmd
REM ใช้ Command Prompt (cmd)
cd c:\Users\Thanakron\Documents\GitHub\React-Business\package

REM ลบ cache
rmdir /s /q .next

REM Build
npm run build
```

### 2. ทดสอบ

```cmd
npm run start
```

เปิด: `http://localhost:3000/contact-inquiry`

ตรวจสอบ:

- ✅ ไม่มี 404
- ✅ แผนที่แสดงผล
- ✅ Form ทำงาน

### 3. Deploy

```cmd
git add .
git commit -m "Fix: 404 error on contact-inquiry - add SSR support"
git push
```

### 4. ตั้งค่า Hosting

**Vercel/Netlify Environment Variable:**

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

**Google Cloud Console:**
เพิ่ม domain: `https://tpp-thanakon.store/*`

## ✨ เสร็จแล้ว!

หน้า contact-inquiry จะทำงานได้บน production โดยไม่มี 404 error อีกต่อไป! 🎉

---

**อ่านเพิ่มเติม:** [DEPLOY_FIX_GUIDE.md](./DEPLOY_FIX_GUIDE.md)

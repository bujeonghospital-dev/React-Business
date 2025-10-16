# ✅ แก้ไข 404 Error สำหรับ Locale URLs (/th/, /en/)

## 🎯 ปัญหา

```
URL: https://tpp-thanakon.store/th/contact-inquiry
URL: https://tpp-thanakon.store/en/contact-inquiry
Status: 404 Not Found
```

**สาเหตุ:** เว็บไซต์ถูก access ผ่าน locale URLs (`/th/...`, `/en/...`) แต่ไฟล์ page.tsx อยู่ที่ `/contact-inquiry` ไม่มี locale prefix

## ✅ การแก้ไข

### สร้างไฟล์ Middleware

**ไฟล์:** `src/middleware.ts`

**หน้าที่:**

- รับ request ที่มี locale prefix (`/th/`, `/en/`)
- Rewrite ไปยัง path จริงโดยไม่มี prefix
- เก็บ locale ไว้ใน header สำหรับใช้ต่อ

**ตัวอย่าง:**

```
/th/contact-inquiry  →  /contact-inquiry (with x-locale: th)
/en/contact-inquiry  →  /contact-inquiry (with x-locale: en)
/contact-inquiry     →  /contact-inquiry (ไม่เปลี่ยน)
```

## 🚀 วิธี Deploy

### 1. Build โปรเจกต์

```cmd
cd c:\Users\Thanakron\Documents\GitHub\React-Business\package

REM ลบ cache
rmdir /s /q .next

REM Build
npm run build
```

### 2. ทดสอบ Local

```cmd
npm run start
```

**ทดสอบ URLs:**

- `http://localhost:3000/contact-inquiry` ✅
- `http://localhost:3000/th/contact-inquiry` ✅
- `http://localhost:3000/en/contact-inquiry` ✅

### 3. Commit และ Push

```cmd
git add .
git commit -m "Fix: Add middleware for locale routing (th/en)"
git push
```

### 4. Deploy

Deploy ตามปกติ - Vercel/Netlify จะ auto-deploy

## 📋 การทำงานของ Middleware

### Request Flow:

```
1. User เข้า: /th/contact-inquiry
   ↓
2. Middleware ตรวจสอบ locale prefix
   ↓
3. Rewrite เป็น: /contact-inquiry
   ↓
4. เก็บ locale ใน header: x-locale = "th"
   ↓
5. Next.js render: src/app/contact-inquiry/page.tsx
   ↓
6. Return response
```

### Supported Locales:

- ✅ `th` (ไทย) - default
- ✅ `en` (English)

### Excluded Paths:

Middleware จะ **ไม่** ทำงานกับ:

- `/api/*` - API routes
- `/_next/static/*` - Static files
- `/_next/image/*` - Image optimization
- `/images/*` - Public images
- `/downloads/*` - Download files
- `/favicon.ico`, `/TPP.ico` - Icons

## 🔍 Troubleshooting

### ยังเจอ 404 หลัง deploy?

**1. ตรวจสอบว่า middleware.ts ถูก build:**

```cmd
npm run build
```

ใน output ควรเห็น:

```
✓ Compiled /middleware
```

**2. ตรวจสอบว่าไฟล์ถูก deploy:**

ดู `.next/server/middleware.js` มีหรือไม่?

**3. Clear build cache:**

```cmd
rmdir /s /q .next
rmdir /s /q .next\cache
npm run build
```

### แผนที่ไม่แสดง?

- ตรวจสอบ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- ดู Console (F12) มี error หรือไม่?

### หน้าอื่นๆ ทำงานแต่ contact-inquiry ไม่ได้?

- ตรวจสอบว่าไฟล์ `src/app/contact-inquiry/page.tsx` มีอยู่จริง
- ตรวจสอบว่าไม่มี syntax errors

## 📊 ผลลัพธ์

| URL                   | ก่อน   | หลัง   |
| --------------------- | ------ | ------ |
| `/contact-inquiry`    | ✅ 200 | ✅ 200 |
| `/th/contact-inquiry` | ❌ 404 | ✅ 200 |
| `/en/contact-inquiry` | ❌ 404 | ✅ 200 |

## 🎓 การใช้ Locale ใน Component

หากต้องการใช้ locale ใน component:

```tsx
import { headers } from "next/headers";

export default function Page() {
  const headersList = headers();
  const locale = headersList.get("x-locale") || "th";

  return (
    <div>
      <p>Current locale: {locale}</p>
      {locale === "th" ? "สวัสดี" : "Hello"}
    </div>
  );
}
```

## 📝 Checklist

- [ ] สร้างไฟล์ `src/middleware.ts` แล้ว
- [ ] ลบ `.next` folder แล้ว
- [ ] Build สำเร็จ (no errors)
- [ ] ทดสอบ `/contact-inquiry` (200)
- [ ] ทดสอบ `/th/contact-inquiry` (200)
- [ ] ทดสอบ `/en/contact-inquiry` (200)
- [ ] แผนที่แสดงผล
- [ ] Form ทำงาน
- [ ] ไม่มี Console errors
- [ ] Commit & Push แล้ว
- [ ] Deploy สำเร็จ
- [ ] ทดสอบบน production แล้ว

## 🎯 สรุป

การแก้ไขนี้จะทำให้:

✅ รองรับ locale URLs (`/th/...`, `/en/...`)
✅ ไม่ต้องสร้างไฟล์ซ้ำสำหรับแต่ละ locale
✅ Code maintainable (ไฟล์เดียวรองรับหลาย locale)
✅ SEO-friendly
✅ ไม่กระทบหน้าอื่นๆ ที่มีอยู่แล้ว

## 🔗 เอกสารเพิ่มเติม

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

**Status:** ✅ พร้อม Deploy  
**Updated:** October 15, 2025  
**Version:** 3.0 (Locale-aware routing)

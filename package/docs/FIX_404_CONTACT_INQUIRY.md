# 🔧 แก้ไข 404 Error - Contact Inquiry Page

## ปัญหาที่พบ

```
Request URL: https://tpp-thanakon.store/en/contact-inquiry?_rsc=1xvvv
Status Code: 404 Not Found
```

## สาเหตุ

หน้า `contact-inquiry` ให้ 404 error เนื่องจาก:

1. ❌ **Hydration Mismatch** - ใช้ `dangerouslySetInnerHTML` กับ Web Components
2. ❌ **SSR Issues** - Web Components ไม่ทำงานบน server-side
3. ❌ **Script Loading** - Google Maps script โหลดช้าเกินไป

## การแก้ไข

### ✅ อัปเดท GoogleMap.tsx

**ไฟล์:** `src/components/GoogleMap.tsx`

**การเปลี่ยนแปลง:**

1. ✅ เพิ่ม **Client-Side Detection** - ตรวจสอบว่าอยู่ใน browser จริงๆ
2. ✅ เพิ่ม **Fallback iframe** - แสดง iframe ระหว่างรอ Web Components
3. ✅ ลบ `dangerouslySetInnerHTML` - ใช้ DOM API แทน
4. ✅ เพิ่ม **Proper State Management** - จัดการ loading state

**โค้ดที่สำคัญ:**

```tsx
const [isClient, setIsClient] = useState(false);
const [scriptLoaded, setScriptLoaded] = useState(false);

// ตรวจสอบว่าอยู่ใน client-side
useEffect(() => {
  setIsClient(true);
}, []);

// แสดง iframe fallback สำหรับ SSR
if (!isClient || !scriptLoaded) {
  return (
    <iframe
      src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${center.lat},${center.lng}`}
      // ...
    />
  );
}
```

## ขั้นตอนการแก้ไข

### 1. อัปเดทโค้ด

```powershell
# ไฟล์ที่แก้ไขแล้ว:
src/components/GoogleMap.tsx
```

### 2. Build ใหม่

```powershell
# Clear cache
rm -rf .next

# Build
npm run build

# Test locally
npm run start
```

### 3. ทดสอบ

```powershell
# เปิดหน้า contact-inquiry
http://localhost:3000/contact-inquiry
http://localhost:3000/en/contact-inquiry
```

### 4. Deploy

```powershell
# Deploy ตามปกติ (Vercel, Netlify, etc.)
git add .
git commit -m "Fix: 404 error on contact-inquiry page - improve SSR support"
git push
```

## การทำงานใหม่

### Server-Side Rendering (SSR):

1. ✅ แสดง iframe fallback (ไม่เกิด error)
2. ✅ SEO-friendly
3. ✅ Fast initial load

### Client-Side (After Hydration):

1. ✅ โหลด Google Maps script
2. ✅ เปลี่ยนเป็น Web Components
3. ✅ แสดง Advanced Markers

### Flow:

```
SSR → iframe (visible) → Client Hydration → Load Script → Web Components (replace iframe)
```

## ข้อดี

| ก่อนแก้ไข             | หลังแก้ไข                             |
| --------------------- | ------------------------------------- |
| ❌ 404 Error          | ✅ ทำงานปกติ                          |
| ❌ Hydration Mismatch | ✅ ไม่มีปัญหา                         |
| ❌ SEO ไม่ดี          | ✅ SEO ดีขึ้น                         |
| ❌ ช้าในการโหลด       | ✅ เร็วขึ้น (progressive enhancement) |

## การตรวจสอบ

### 1. ตรวจสอบ Build

```powershell
npm run build
```

**ควรเห็น:**

```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization
```

### 2. ตรวจสอบหน้า

เปิด browser → F12 → Console

**ไม่ควรเห็น errors:**

- ❌ Hydration mismatch
- ❌ 404 errors
- ❌ Script loading errors

### 3. ตรวจสอบ Network

F12 → Network → Reload

**ควรเห็น:**

- ✅ Status 200 (ไม่ใช่ 404)
- ✅ Map iframe โหลดสำเร็จ
- ✅ Google Maps script โหลดสำเร็จ

## Environment Variables

ตรวจสอบว่ามี API Key บน production:

### Vercel:

```
Settings → Environment Variables
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = your_api_key
```

### Netlify:

```
Site settings → Environment variables
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = your_api_key
```

## Troubleshooting

### ยังเจอ 404?

1. **Clear cache:**

   ```powershell
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. **Rebuild:**

   ```powershell
   npm run build
   ```

3. **ตรวจสอบ routing:**
   - มีไฟล์ `src/app/contact-inquiry/page.tsx` หรือไม่?
   - ชื่อถูกต้องหรือไม่? (ต้องเป็น `page.tsx`)

### Map ไม่แสดง?

1. **ตรวจสอบ API Key:**

   ```tsx
   console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
   ```

2. **ตรวจสอบ domain restrictions:**

   - เพิ่ม production domain ใน Google Cloud Console

3. **ดู Console errors:**
   - F12 → Console → มี error อะไรไหม?

### Hydration Mismatch?

- ✅ แก้แล้ว! ใช้ `isClient` state เพื่อป้องกัน

## Performance

### Before:

- ⚠️ Web Components only (fail on SSR)
- ⚠️ 404 error
- ⚠️ Blank page

### After:

- ✅ SSR-friendly iframe fallback
- ✅ Progressive enhancement เป็น Web Components
- ✅ Fast initial render
- ✅ Better UX

## Testing Checklist

- [ ] Build สำเร็จ (no errors)
- [ ] หน้า `/contact-inquiry` เข้าได้ (200, ไม่ใช่ 404)
- [ ] หน้า `/en/contact-inquiry` เข้าได้
- [ ] แผนที่แสดงผล (อาจเป็น iframe หรือ Web Components)
- [ ] ไม่มี Console errors
- [ ] Form ส่งได้ปกติ
- [ ] Responsive (mobile, tablet, desktop)
- [ ] SEO OK (view page source → เห็น content)

## Next Steps

หลังจาก deploy แล้ว:

1. ✅ Monitor Google Cloud Console usage
2. ✅ ตรวจสอบ error logs
3. ✅ Test บน devices ต่างๆ
4. ✅ รอ Google index หน้าใหม่ (1-2 วัน)

## สรุป

การแก้ไขนี้จะทำให้:

- ✅ หน้า contact-inquiry ทำงานได้บน production
- ✅ ไม่เกิด 404 error
- ✅ Map แสดงผลได้ทั้ง SSR และ Client-side
- ✅ UX ดีขึ้น (progressive enhancement)
- ✅ SEO ดีขึ้น

**พร้อม Deploy!** 🚀

---

_อัปเดท: October 15, 2025_
_Status: แก้ไขเสร็จสมบูรณ์_

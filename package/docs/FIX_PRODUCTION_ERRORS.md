# 🚨 แก้ไขปัญหา Production Errors

## ปัญหาที่พบ

### 1. ❌ Google Maps API Key is not configured

```
Google Maps API Key is not configured
```

### 2. ❌ Images 404 Not Found

```
GET /images/Home/banner-home.jpg 404
GET /images/team/login-background.png 404
GET /images/news-banner.jpg 404
```

---

## ✅ การแก้ไข

### ปัญหา 1: API Key Missing

**สาเหตุ:** Environment Variable ไม่ถูกตั้งค่าบน hosting platform

**วิธีแก้:**

#### **สำหรับ Vercel:**

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือกโปรเจกต์ `tpp-thanakon.store`
3. ไปที่ **Settings** → **Environment Variables**
4. เพิ่ม:

```
Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
Environment: Production, Preview, Development (เลือกทั้งหมด)
```

5. คลิก **Save**
6. **Redeploy** โปรเจกต์:
   - ไปที่ **Deployments**
   - เลือก deployment ล่าสุด
   - คลิก **...** (three dots)
   - เลือก **Redeploy**

#### **สำหรับ Netlify:**

1. ไปที่ [Netlify Dashboard](https://app.netlify.com/)
2. เลือกโปรเจกต์ `tpp-thanakon.store`
3. ไปที่ **Site configuration** → **Environment variables**
4. คลิก **Add a variable**
5. เพิ่ม:

```
Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

6. คลิก **Save**
7. **Redeploy**:
   - ไปที่ **Deploys**
   - คลิก **Trigger deploy** → **Clear cache and deploy site**

---

### ปัญหา 2: Images 404

**สาเหตุ:** ไฟล์รูปภาพไม่ถูก deploy หรือ path ไม่ถูกต้อง

**วิธีแก้:**

#### **ตรวจสอบไฟล์รูปภาพ:**

1. เปิด File Explorer
2. ไปที่: `c:\Users\Thanakron\Documents\GitHub\React-Business\package\public\images\`
3. ตรวจสอบว่ามีไฟล์เหล่านี้หรือไม่:

```
public/
├── images/
│   ├── Home/
│   │   └── banner-home.jpg  ← ต้องมี!
│   ├── team/
│   │   └── login-background.png  ← ต้องมี!
│   └── news-banner.jpg  ← ต้องมี!
```

#### **ถ้าไฟล์ไม่มี:**

**วิธีที่ 1: ใช้รูปสำรอง (Placeholder)**

สร้างไฟล์ fallback:

```powershell
cd c:\Users\Thanakron\Documents\GitHub\React-Business\package\public\images\Home
# ถ้าไม่มีโฟลเดอร์ให้สร้าง
New-Item -ItemType Directory -Force -Path "c:\Users\Thanakron\Documents\GitHub\React-Business\package\public\images\Home"
New-Item -ItemType Directory -Force -Path "c:\Users\Thanakron\Documents\GitHub\React-Business\package\public\images\team"
```

**วิธีที่ 2: ใช้รูปที่มีอยู่แทน**

ถ้าไม่มีรูปเหล่านี้ ให้แก้โค้ดใช้รูปที่มีอยู่แล้ว

#### **ตรวจสอบว่ารูปถูก commit หรือไม่:**

```cmd
cd c:\Users\Thanakron\Documents\GitHub\React-Business\package

# ดูว่ารูปถูก track ใน Git หรือไม่
git ls-files public/images/Home/banner-home.jpg
git ls-files public/images/team/login-background.png
git ls-files public/images/news-banner.jpg
```

**ถ้าไม่มี output:** รูปไม่ถูก commit → ต้อง add และ commit:

```cmd
git add public/images/
git commit -m "Add missing images"
git push
```

#### **ตรวจสอบ .gitignore:**

```cmd
# ดูว่า images ถูก ignore หรือไม่
type .gitignore | findstr images
```

**ถ้าเจอบรรทัดที่มี `images`:** ให้ลบออกหรือแก้ไข

---

## 🔍 การตรวจสอบหลัง Deploy

### 1. ตรวจสอบ Environment Variables

เปิด Console (F12) บน production site:

```javascript
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
```

**ควรเห็น:** API Key (ไม่ใช่ `undefined`)

### 2. ตรวจสอบรูปภาพ

ลองเข้า URL ตรงๆ:

- `https://tpp-thanakon.store/images/Home/banner-home.jpg`
- `https://tpp-thanakon.store/images/team/login-background.png`
- `https://tpp-thanakon.store/images/news-banner.jpg`

**ควรเห็น:** รูปภาพ (ไม่ใช่ 404)

---

## 📋 Checklist แก้ไข

### Environment Variable:

- [ ] เพิ่ม `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` บน Vercel/Netlify
- [ ] Redeploy หลังจากเพิ่ม env var
- [ ] ทดสอบว่า API Key โหลดได้ (Console)
- [ ] แผนที่แสดงผลบน production

### Images:

- [ ] ตรวจสอบไฟล์รูปอยู่ใน `public/images/`
- [ ] ตรวจสอบชื่อไฟล์ตรงกับที่ใช้ในโค้ด
- [ ] ตรวจสอบ case-sensitive (banner-home.jpg vs Banner-Home.jpg)
- [ ] Git add และ commit รูปภาพทั้งหมด
- [ ] Push ไป repository
- [ ] ตรวจสอบว่ารูปแสดงผลบน production

---

## 🛠️ วิธีแก้ไขด่วน (Quick Fix)

### 1. เพิ่ม API Key

```cmd
# ไปที่ Vercel Dashboard
# Settings → Environment Variables → Add
```

### 2. Commit รูปภาพ

```cmd
cd c:\Users\Thanakron\Documents\GitHub\React-Business\package
git status
git add public/images/
git commit -m "Fix: Add missing images for production"
git push
```

### 3. Redeploy

Vercel/Netlify จะ auto-deploy หรือ trigger manual deploy

---

## 💡 ป้องกันปัญหาในอนาคต

### 1. ตรวจสอบ Environment Variables ก่อน Deploy

สร้างไฟล์ `.env.production.example`:

```bash
# .env.production.example
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. ตรวจสอบรูปภาพก่อน Deploy

```cmd
# แสดงรายการรูปทั้งหมด
dir /s /b public\images\*.jpg
dir /s /b public\images\*.png
```

### 3. เพิ่ม Image Fallback

แก้โค้ดให้มี fallback เมื่อรูปหาไม่เจอ:

```tsx
<Image
  src="/images/Home/banner-home.jpg"
  alt="Banner"
  fill
  onError={(e) => {
    // Fallback to placeholder
    e.currentTarget.src = "/images/placeholder.jpg";
  }}
/>
```

---

## 📊 สรุป

| ปัญหา                  | สาเหตุ            | วิธีแก้                         |
| ---------------------- | ----------------- | ------------------------------- |
| API Key not configured | ไม่มี env var     | เพิ่มใน Vercel/Netlify Settings |
| Images 404             | ไฟล์ไม่ถูก deploy | Git add + commit + push         |

---

**หลังจากแก้แล้ว:**

- ✅ แผนที่จะแสดงผลปกติ
- ✅ รูปภาพจะโหลดได้
- ✅ ไม่มี errors ใน Console

**Redeploy ทันที!** 🚀

---

_Updated: October 15, 2025_

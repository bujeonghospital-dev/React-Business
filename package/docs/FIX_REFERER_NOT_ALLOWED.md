# 🔧 แก้ไข RefererNotAllowedMapError

## 🚨 ปัญหา

```
Google Maps JavaScript API error: RefererNotAllowedMapError
Your site URL to be authorized: http://localhost:3000/contact-inquiry
```

**สาเหตุ:** API Key มี HTTP referrer restrictions และ `localhost:3000` ไม่ได้อยู่ในรายการที่อนุญาต

---

## ✅ วิธีแก้ (เลือก 1 ใน 2)

### **วิธีที่ 1: เพิ่ม localhost ใน Google Cloud Console** ⭐ แนะนำ

#### ขั้นตอน:

1. **ไปที่ Google Cloud Console:**

   - https://console.cloud.google.com/apis/credentials

2. **เลือก API Key:**

   - คลิกที่ API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`

3. **แก้ไข Application restrictions:**

   - ในส่วน **Application restrictions**
   - เลือก **HTTP referrers (web sites)**

4. **เพิ่ม referrers:**

   เพิ่มบรรทัดต่อไปนี้:

   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   https://tpp-thanakon.store/*
   https://*.tpp-thanakon.store/*
   ```

5. **กด Save**

6. **รอ 1-2 นาที** ให้การตั้งค่ามีผล

7. **Reload หน้าเว็บ** (Ctrl + Shift + R)

---

### **วิธีที่ 2: ปิด Restrictions ชั่วคราว** (สำหรับ Development)

⚠️ **ใช้เฉพาะ Development เท่านั้น!**

#### ขั้นตอน:

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. เลือก API Key
3. ในส่วน **Application restrictions**
4. เลือก **None** (ไม่จำกัด)
5. กด **Save**

⚠️ **อย่าลืม:** ตั้งค่ากลับเป็น HTTP referrers ก่อน deploy production!

---

## 📋 ตัวอย่าง HTTP Referrers ที่ถูกต้อง

```
# Development
http://localhost:*/*
http://127.0.0.1:*/*
http://localhost:3000/*

# Production
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*

# Vercel Preview (ถ้ามี)
https://*.vercel.app/*

# Netlify Preview (ถ้ามี)
https://*.netlify.app/*
```

---

## 🔍 การตรวจสอบ

### 1. ตรวจสอบ API Key Restrictions:

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. คลิก API Key
3. ดูที่ **Application restrictions** → **Website restrictions**

**ควรเห็น:**

```
http://localhost:3000/*
https://tpp-thanakon.store/*
```

### 2. ทดสอบหน้าเว็บ:

```
http://localhost:3000/contact-inquiry
```

**ควรเห็น:**

- ✅ แผนที่แสดงผล (iframe หรือ Web Components)
- ✅ ไม่มี `RefererNotAllowedMapError`

---

## 💡 Tips

### ใช้ Environment Variables แยกกัน:

สำหรับความปลอดภัย ควรใช้ API Key แยกระหว่าง dev และ prod:

**Development (.env.local):**

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=dev_api_key_here
```

**Production (Vercel/Netlify):**

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=prod_api_key_here
```

---

## 🎯 สรุป

| ปัญหา                     | สาเหตุ                    | วิธีแก้                |
| ------------------------- | ------------------------- | ---------------------- |
| RefererNotAllowedMapError | localhost ไม่ได้รับอนุญาต | เพิ่มใน HTTP referrers |

---

## 📊 Checklist

- [ ] เข้า Google Cloud Console
- [ ] เลือก API Key
- [ ] เพิ่ม `http://localhost:3000/*` ใน HTTP referrers
- [ ] เพิ่ม `https://tpp-thanakon.store/*` ใน HTTP referrers
- [ ] Save
- [ ] รอ 1-2 นาที
- [ ] Reload หน้าเว็บ (Ctrl + Shift + R)
- [ ] แผนที่แสดงผลปกติ

---

## 🚀 Quick Fix (1 นาที)

1. **เปิด:** https://console.cloud.google.com/apis/credentials
2. **คลิก:** API Key ที่ใช้
3. **เพิ่ม:** `http://localhost:3000/*`
4. **Save**
5. **Reload** หน้าเว็บ

**เสร็จแล้ว!** ✅

---

**หลังจากแก้:** แผนที่จะแสดงผลปกติทั้ง development และ production! 🎉

---

_Updated: October 15, 2025_

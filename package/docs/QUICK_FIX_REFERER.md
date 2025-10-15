# ⚡ แก้ไขด่วน: RefererNotAllowedMapError (1 นาที)

## 🎯 ทำตามขั้นตอนนี้:

### 1. เปิด Google Cloud Console

👉 https://console.cloud.google.com/apis/credentials

### 2. คลิกที่ API Key

🔍 หา API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`

### 3. Scroll ลงไปที่ "Application restrictions"

📝 เลือก: **HTTP referrers (web sites)**

### 4. คลิก "ADD AN ITEM" และเพิ่ม:

```
http://localhost:3000/*
```

**กด Enter** จากนั้นเพิ่มอีก 3 บรรทัด:

```
http://127.0.0.1:3000/*
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*
```

### 5. คลิก "SAVE" ด้านล่าง

### 6. รอ 1-2 นาที

### 7. กลับมาที่เว็บ

กด **Ctrl + Shift + R** (Hard Reload)

---

## ✅ เสร็จแล้ว!

แผนที่จะแสดงผลปกติ ไม่มี error อีกต่อไป! 🎉

---

## 📸 ตัวอย่าง HTTP Referrers

ควรมีอย่างน้อย 4 บรรทัดนี้:

```
✅ http://localhost:3000/*
✅ http://127.0.0.1:3000/*
✅ https://tpp-thanakon.store/*
✅ https://*.tpp-thanakon.store/*
```

---

## ❓ ยังไม่ได้?

### ถ้ายังเห็น error:

1. **รอ 2-3 นาที** (Google ต้องใช้เวลา sync)
2. **Clear browser cache:**
   - Chrome: Ctrl + Shift + Delete
   - เลือก "Cached images and files"
   - Clear data
3. **Reload:** Ctrl + Shift + R
4. **ตรวจสอบ Console (F12):**
   - ยังเห็น RefererNotAllowedMapError หรือไม่?
   - ถ้าเห็น → ตรวจสอบว่า referrer ที่เพิ่มถูกต้อง

---

## 🔗 Link ด่วน

- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Documentation: https://developers.google.com/maps/documentation/javascript/get-api-key

---

**เสร็จใน 1 นาที!** ⚡

# 🔑 วิธีแก้ "API Key is not configured" และ RefererNotAllowedMapError

## 🚨 อาการที่เห็น

Console ใน Browser (F12) แสดง:

- ⚠️ `Google Maps API Key is not configured - using fallback iframe`
- ❌ `RefererNotAllowedMapError: http://localhost:3000/contact-inquiry`
- 🗺️ แผนที่แสดงแบบ iframe (fallback) แทน Web Components

---

## ✅ สถานะปัจจุบัน

### ✅ ที่ตั้งค่าแล้ว:

- API Key มีแล้วใน `.env.local`
- โค้ด GoogleMap.tsx แก้ไขแล้ว (async loading, error handling)

### ❌ ที่ยังไม่ได้ทำ:

- **ยังไม่ได้เพิ่ม `localhost:3000` ใน Google Cloud Console** ← สาเหตุหลัก!

---

## 🔧 วิธีแก้ (ทำตามทีละขั้น)

### ขั้นตอนที่ 1: เข้า Google Cloud Console

1. เปิด: https://console.cloud.google.com/apis/credentials
2. เลือก Project ของคุณ
3. หา API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
4. คลิกที่ API Key นั้น

---

### ขั้นตอนที่ 2: ตั้งค่า HTTP Referrers

#### หน้าจอควรมี:

```
Application restrictions
○ None (ไม่แนะนำ - ไม่ปลอดภัย)
○ HTTP referrers (web sites) ← เลือกตัวนี้
○ IP addresses
○ Android apps
○ iOS apps
```

#### เลือก **"HTTP referrers (web sites)"**

---

### ขั้นตอนที่ 3: เพิ่ม Referrers

คลิก **"ADD AN ITEM"** และเพิ่มทีละบรรทัด:

#### สำหรับ Development (Local):

```
http://localhost:3000/*
```

```
http://127.0.0.1:3000/*
```

#### สำหรับ Production:

```
https://tpp-thanakon.store/*
```

```
https://*.tpp-thanakon.store/*
```

---

### ขั้นตอนที่ 4: บันทึก

1. คลิก **"SAVE"** ด้านล่าง
2. **รอ 1-2 นาที** ให้ Google ประมวลผล
3. ไม่ต้องปิด Browser

---

### ขั้นตอนที่ 5: ทดสอบ

#### 1. Clear Cache:

- กด `Ctrl + Shift + Delete`
- เลือก "Cached images and files"
- Clear

#### 2. Hard Reload:

- กด `Ctrl + Shift + R` (Windows)
- หรือ `Cmd + Shift + R` (Mac)

#### 3. เปิดหน้า Contact:

```
http://localhost:3000/contact-inquiry
```

#### 4. เปิด Console (F12) และดู:

**ควรเห็น:**

- ✅ ไม่มี RefererNotAllowedMapError
- ✅ แผนที่แสดงแบบ Web Components (ไม่ใช่ iframe)
- ✅ ไม่มี warnings

**ถ้ายังเห็น error:**

- รอ 2-3 นาที (Google ยังไม่ sync เสร็จ)
- Clear cache อีกครั้ง
- ลอง Incognito Mode

---

## 🖼️ ภาพตัวอย่างหน้าจอ Google Cloud Console

### 1. หน้า API Credentials:

```
┌────────────────────────────────────────────────┐
│ API Keys                                       │
├────────────────────────────────────────────────┤
│ Name                       Created             │
│ AIzaSyB0WCRvbI...          Oct 10, 2025       │
│ [คลิกที่นี่]                                   │
└────────────────────────────────────────────────┘
```

### 2. หน้า Edit API Key:

```
┌────────────────────────────────────────────────┐
│ Application restrictions                       │
├────────────────────────────────────────────────┤
│ ○ None                                         │
│ ● HTTP referrers (web sites) ← เลือกตัวนี้    │
│ ○ IP addresses                                 │
│ ○ Android apps                                 │
│ ○ iOS apps                                     │
├────────────────────────────────────────────────┤
│ Website restrictions                           │
├────────────────────────────────────────────────┤
│ [ADD AN ITEM] ← คลิกที่นี่                     │
│                                                 │
│ 1. http://localhost:3000/*                     │
│ 2. http://127.0.0.1:3000/*                     │
│ 3. https://tpp-thanakon.store/*                │
│ 4. https://*.tpp-thanakon.store/*              │
│                                                 │
├────────────────────────────────────────────────┤
│ [CANCEL]  [SAVE] ← คลิก SAVE เมื่อเสร็จ        │
└────────────────────────────────────────────────┘
```

---

## 💡 เคล็ดลับ

### Pattern ที่ถูกต้อง:

✅ **ถูกต้อง:**

```
http://localhost:3000/*
https://tpp-thanakon.store/*
https://*.tpp-thanakon.store/*
```

❌ **ผิด:**

```
localhost:3000              ← ไม่มี http://
http://localhost:3000       ← ขาด /* ท้าย
http://localhost/*          ← ขาด port 3000
```

---

## 🎯 ผลลัพธ์ที่คาดหวัง

### ก่อนแก้ไข (ตอนนี้):

- ⚠️ แผนที่แสดงแบบ iframe (fallback)
- ❌ Console มี RefererNotAllowedMapError
- ⚠️ Warning: "API Key is not configured"

### หลังแก้ไข (ที่จะได้):

- ✅ แผนที่แสดงแบบ Web Components (gmp-map)
- ✅ ไม่มี errors ใน Console
- ✅ Performance ดีขึ้น
- ✅ Map loading เร็วขึ้น
- ✅ Marker สวยกว่า (advanced marker)

---

## 🔄 หลังจากเพิ่ม Referrers แล้ว

### Test Checklist:

- [ ] เพิ่ม referrers ใน Google Cloud Console แล้ว
- [ ] Save และรอ 1-2 นาที แล้ว
- [ ] Clear browser cache แล้ว
- [ ] Hard reload (Ctrl+Shift+R) แล้ว
- [ ] เปิด http://localhost:3000/contact-inquiry
- [ ] กด F12 เปิด Console
- [ ] ไม่มี RefererNotAllowedMapError
- [ ] แผนที่แสดงผลถูกต้อง
- [ ] Marker แสดงผลถูกต้อง

---

## 🆘 ถ้ายังไม่ได้

### 1. ตรวจสอบ API Key:

```bash
# PowerShell
Get-Content .env.local | Select-String "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
```

ควรเห็น:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

### 2. Restart Dev Server:

```bash
# Stop server: Ctrl + C

# Start server:
npm run dev
```

### 3. เปิด Incognito Mode:

```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

เปิด: `http://localhost:3000/contact-inquiry`

### 4. ตรวจสอบ Referrers อีกครั้ง:

- กลับไปที่ Google Cloud Console
- เช็คว่าบันทึก 4 บรรทัดครบหรือไม่
- ต้องมี `/*` ท้ายทุกบรรทัด

---

## 📞 ถ้ายังไม่ได้

แจ้งมาพร้อม:

1. Screenshot หน้า API Key settings (Application restrictions)
2. Screenshot Console errors (F12)
3. เวอร์ชั่น Browser ที่ใช้
4. รอกี่นาทีหลัง Save แล้ว

---

## ✅ สรุป

**ทำเพียง 3 ขั้นตอน:**

1. 🌐 เข้า Google Cloud Console
2. 🔑 เพิ่ม 4 referrers (localhost, 127.0.0.1, domain, wildcard)
3. 💾 Save และรอ 1-2 นาที

**แล้วจะได้:**

- ✅ แผนที่ใช้งานได้เต็มรูปแบบ
- ✅ ไม่มี errors
- ✅ Performance ดีขึ้น

---

_Updated: October 15, 2025_
_Next Step: Add localhost to Google Cloud Console HTTP referrers_

# การตั้งค่า Google Maps API Key สำหรับการใช้งานออนไลน์

## ข้อมูล API Key ปัจจุบัน

- **API Key:** `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`
- **สถานะ:** พร้อมใช้งาน (หลังจากตั้งค่าเพิ่มเติม)

## ขั้นตอนการตั้งค่า Google Cloud Console

### 1. เข้าสู่ Google Cloud Console

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เข้าสู่ระบบด้วย Google Account ที่สร้าง API Key นี้
3. เลือกโปรเจ็กต์ที่มี API Key นี้

### 2. เปิดใช้งาน APIs ที่จำเป็น

1. ไปที่ **APIs & Services > Library**
2. ค้นหาและเปิดใช้งาน APIs ต่อไปนี้:
   - **Maps Embed API** ✅
   - **Maps JavaScript API** ✅
   - **Geocoding API** (แนะนำ)
   - **Places API** (แนะนำ)

### 3. ตั้งค่า API Key Restrictions (สำคัญมาก!)

#### 3.1 ไปที่การจัดการ API Keys

1. **APIs & Services > Credentials**
2. คลิกที่ API Key: `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0`

#### 3.2 ตั้งค่า Application Restrictions

เลือก **HTTP referrers (web sites)** และเพิ่ม domains ต่อไปนี้:

```
# สำหรับ Development
http://localhost:3000/*
https://localhost:3000/*

# สำหรับ Production (แทนที่ด้วย domain จริงของคุณ)
https://yourdomain.com/*
https://www.yourdomain.com/*

# สำหรับ Vercel (ถ้าใช้ Vercel hosting)
https://*.vercel.app/*

# สำหรับ Netlify (ถ้าใช้ Netlify hosting)
https://*.netlify.app/*
```

#### 3.3 ตั้งค่า API Restrictions

เลือก **Restrict key** และเลือก APIs ที่ต้องการใช้:

- ✅ Maps Embed API
- ✅ Maps JavaScript API
- ✅ Geocoding API (ถ้าจำเป็น)

### 4. ตัวอย่าง Domain สำหรับเว็บไซต์ธุรกิจ

```
# Production URLs (แทนที่ด้วย domain จริง)
https://tpppack.com/*
https://www.tpppack.com/*

# Development URLs
http://localhost:3000/*
https://localhost:3000/*

# Staging URLs (ถ้ามี)
https://staging.tpppack.com/*
```

### 5. การทดสอบ API Key

#### 5.1 ทดสอบใน Development

```bash
# รีสตาร์ทเซิร์ฟเวอร์
npm run dev
```

#### 5.2 ทดสอบ API ด้วย URL

```
https://www.google.com/maps/embed/v1/place?key=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0&q=13.685984091307898,100.72794861574249&zoom=15
```

### 6. การ Deploy เว็บไซต์

#### 6.1 Environment Variables ใน Production

ตั้งค่า environment variable ในแพลตฟอร์ม hosting:

**Vercel:**

```bash
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# ใส่ค่า: AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

**Netlify:**

```bash
# Site settings > Environment variables
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0
```

### 7. การตรวจสอบและแก้ไขปัญหา

#### 7.1 ตรวจสอบ Console Errors

เปิด Browser Developer Tools และดู Console สำหรับ errors:

```javascript
// Error ที่อาจพบ
RefererNotAllowedMapError; // ต้องเพิ่ม domain ใน API restrictions
ApiNotActivatedMapError; // ต้องเปิดใช้งาน Maps APIs
InvalidKeyMapError; // API key ไม่ถูกต้อง
```

#### 7.2 ทดสอบ API Key Status

```bash
# ตรวจสอบใน Browser Network Tab
# ดู request ไปที่ maps.googleapis.com
# ควรได้ status 200 และไม่มี error
```

### 8. ความปลอดภัย (Security)

#### 8.1 ข้อแนะนำ

- ✅ ใช้ HTTP referrers restrictions เสมอ
- ✅ จำกัด APIs ที่จำเป็นเท่านั้น
- ✅ ตรวจสอบ usage และ billing เป็นประจำ
- ❌ ไม่ควรใช้ API key แบบไม่จำกัด

#### 8.2 Monitoring

- ตรวจสอบ [Google Cloud Console > APIs & Services > Quotas](https://console.cloud.google.com/apis/api/maps-embed-backend.googleapis.com/quotas)
- ดู usage statistics เพื่อป้องกันการใช้งานที่ผิดปกติ

### 9. การแก้ไขปัญหาทั่วไป

| ปัญหา               | สาเหตุ                     | วิธีแก้ไข                       |
| ------------------- | -------------------------- | ------------------------------- |
| แผนที่ไม่แสดง       | API key ไม่ถูกต้อง         | ตรวจสอบ API key ใน .env.local   |
| "RefererNotAllowed" | Domain ไม่อยู่ใน whitelist | เพิ่ม domain ใน HTTP referrers  |
| "ApiNotActivated"   | ไม่ได้เปิดใช้งาน API       | เปิดใช้งาน Maps Embed API       |
| แผนที่โหลดช้า       | Network หรือ quota         | ตรวจสอบ internet และ API limits |

### 10. Next Steps หลัง Deploy

1. **ทดสอบในเว็บไซต์จริง** - เปิดหน้า contact และตรวจสอบแผนที่
2. **ตรวจสอบ Performance** - ดู loading time ของแผนที่
3. **Monitor Usage** - ติดตาม API calls ใน Google Cloud Console
4. **Setup Alerts** - ตั้งการแจ้งเตือนเมื่อใกล้ถึง quota limit

---

## สรุป

API Key `AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0` พร้อมใช้งานแล้ว!

**สิ่งที่ต้องทำต่อ:**

1. ตั้งค่า HTTP referrers restrictions ใน Google Cloud Console
2. เพิ่ม domain ของเว็บไซต์ที่จะใช้งาน
3. ทดสอบและ deploy เว็บไซต์

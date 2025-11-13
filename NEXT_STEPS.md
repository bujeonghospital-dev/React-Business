# 🚀 ขั้นตอนการใช้งาน Google Ads Dashboard ทันที

## ✅ สิ่งที่มีแล้ว

- ✓ Google Ads API: Enabled
- ✓ Client ID: `532682674935-19dkn4a99gkcnreuas4tk96gqig06tpt.apps.googleusercontent.com`
- ✓ OAuth Client: BJH_file
- ✓ ไฟล์ .env.local: สร้างแล้ว

---

## 📋 ขั้นตอนที่ต้องทำ (เรียงลำดับ)

### 🔥 Step 1: เพิ่ม Redirect URI (ทำตอนนี้เลย!)

1. **กลับไปที่หน้า Google Cloud Console** ที่คุณเปิดอยู่
2. **Scroll ลงหา "Authorized redirect URIs"**
3. **คลิก "+ Add URI"**
4. **พิมพ์:** `http://localhost:3000/oauth2callback`
5. **คลิก "Save"** (ปุ่มสีน้ำเงินด้านล่าง)

---

### 🔥 Step 2: ดู Client Secret

**วิธีที่ 1:** ดูค่าที่มีอยู่

1. คลิกที่ **"\*\***moW\_"\*\* (ใน Client secrets section)
2. คัดลอกค่าที่แสดง

**วิธีที่ 2:** สร้างใหม่ (แนะนำ)

1. คลิก **"+ Add secret"**
2. คัดลอกค่าที่แสดงขึ้นมา
3. **เก็บไว้ในที่ปลอดภัย!**

---

### 🔥 Step 3: ใส่ Client Secret ใน .env.local

เปิดไฟล์ `.env.local` และแก้ไขบรรทัดนี้:

```env
GOOGLE_ADS_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

เปลี่ยนเป็น:

```env
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxx  # ใส่ค่าจริงที่คัดลอกมา
```

---

### 🔥 Step 4: ทดสอบ Dashboard ด้วย Mock Data

```bash
cd c:\Users\Pac-Man45\OneDrive\Documents\GitHub\React-Business\package
npm run dev
```

เปิดเบราว์เซอร์: **http://localhost:3000/google-ads-dashboard**

คุณจะเห็น Dashboard พร้อมข้อมูลตัวอย่าง! 🎉

---

## 🎯 ขั้นตอนถัดไป (สำหรับเชื่อมต่อข้อมูลจริง)

### Step 5: สร้าง Refresh Token

**ติดตั้ง dependencies:**

```bash
npm install google-auth-library readline
```

**แก้ไขสคริปต์** `scripts/generate-google-ads-refresh-token.js`:

- Client ID: ✅ ใส่แล้ว (`532682674935-19dkn4a99gkcnreuas4tk96gqig06tpt.apps.googleusercontent.com`)
- Client Secret: ❌ ต้องใส่ค่าจริง (แทนที่ `YOUR_CLIENT_SECRET_HERE`)

**รันสคริปต์:**

```bash
node scripts/generate-google-ads-refresh-token.js
```

**ทำตามขั้นตอน:**

1. คัดลอก URL ที่แสดง
2. เปิดในเบราว์เซอร์
3. Login และอนุญาต
4. คัดลอก Authorization Code
5. Paste ใน Terminal
6. คัดลอก Refresh Token
7. ใส่ใน `.env.local`

---

### Step 6: ขอ Developer Token (รอ 1-3 วัน)

1. ไปที่: https://ads.google.com/aw/apicenter
2. Apply for API Access
3. กรอกแบบฟอร์ม:
   - **Application type:** Test Account
   - **Description:** "Creating a dashboard to monitor campaign performance"
4. Submit และรอการอนุมัติ

---

### Step 7: หา Customer ID

1. ไปที่: https://ads.google.com/
2. ดูมุมขวาบน
3. คัดลอก Customer ID (รูปแบบ: `123-456-7890`)
4. ใส่ใน `.env.local`

---

## 📝 ตัวอย่าง .env.local สมบูรณ์

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB0WCRvbI_4fgT7mDCyxMFCFov9VDF2LB0

# Google Ads API Configuration
GOOGLE_ADS_CLIENT_ID=532682674935-19dkn4a99gkcnreuas4tk96gqig06tpt.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx  # ✅ ใส่ค่าจริง
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdEFghIJklMNopQRst  # ⏳ รอการอนุมัติ
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxx  # 📝 สร้างด้วยสคริปต์
GOOGLE_ADS_CUSTOMER_ID=123-456-7890  # 📋 หาจาก Google Ads
```

---

## 🎮 การใช้งาน

### ใช้ Mock Data (ค่าเริ่มต้น)

```bash
npm run dev
```

เปิด: http://localhost:3000/google-ads-dashboard

### เปลี่ยนเป็นข้อมูลจริง

เมื่อมี credentials ครบ 5 ตัวแล้ว:

1. ติดตั้ง Google Ads API:

```bash
npm install google-ads-api
```

2. แก้ไขไฟล์ `.env.local` เพิ่ม:

```env
USE_MOCK_DATA=false
```

3. Restart dev server
4. Dashboard จะดึงข้อมูลจาก Google Ads API จริง!

---

## ✅ Checklist ความคืบหน้า

- [x] Enable Google Ads API
- [x] มี OAuth Client ID
- [x] สร้างไฟล์ .env.local
- [ ] เพิ่ม Redirect URI
- [ ] ใส่ Client Secret ใน .env.local
- [ ] ทดสอบ Dashboard (Mock Data)
- [ ] สร้าง Refresh Token
- [ ] ขอ Developer Token (รอ 1-3 วัน)
- [ ] หา Customer ID
- [ ] ติดตั้ง google-ads-api
- [ ] เปลี่ยนเป็นข้อมูลจริง

---

## 🆘 ปัญหาที่อาจเจอ

### ปัญหา: "Redirect URI mismatch"

**วิธีแก้:**

- ตรวจสอบว่าเพิ่ม `http://localhost:3000/oauth2callback` ใน Google Cloud Console แล้ว
- URI ต้องตรงทุกตัวอักษร (ห้ามมี `/` ต่อท้าย)

### ปัญหา: "Invalid client secret"

**วิธีแก้:**

- คัดลอก Client Secret ใหม่จาก Google Cloud Console
- ตรวจสอบว่าไม่มีช่องว่างหน้า/หลัง

### ปัญหา: "Cannot find module 'google-auth-library'"

**วิธีแก้:**

```bash
npm install google-auth-library readline
```

---

## 🎉 สรุป

**ตอนนี้คุณสามารถ:**

1. ✅ ดู Dashboard ได้ทันทีด้วย Mock Data
2. ✅ มี Client ID พร้อมใช้แล้ว
3. 📝 เหลือแค่ใส่ Client Secret
4. 🔄 สร้าง Refresh Token เมื่อพร้อม
5. ⏳ รอ Developer Token (1-3 วัน)

**การทำงานตอนนี้:**

- Mock Data → ทำงานได้ทันที
- ข้อมูลจริง → รอ Developer Token

---

**สร้างเมื่อ:** พฤศจิกายน 2025  
**อัปเดตล่าสุด:** พฤศจิกายน 2025  
**สถานะ:** 🟢 พร้อมใช้งานด้วย Mock Data

# 🔑 วิธีขอ Google Ads API Credentials

## สรุปแหล่งที่มาของแต่ละค่า

| Environment Variable         | แหล่งที่มา            | เวลาที่ใช้          |
| ---------------------------- | --------------------- | ------------------- |
| `GOOGLE_ADS_CLIENT_ID`       | Google Cloud Console  | ~5 นาที             |
| `GOOGLE_ADS_CLIENT_SECRET`   | Google Cloud Console  | ~5 นาที             |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API Center | 1-3 วัน (รออนุมัติ) |
| `GOOGLE_ADS_REFRESH_TOKEN`   | สร้างเองด้วยสคริปต์   | ~5 นาที             |
| `GOOGLE_ADS_CUSTOMER_ID`     | Google Ads Account    | ทันที               |

---

## 1️⃣ GOOGLE_ADS_CLIENT_ID และ CLIENT_SECRET

### 📍 แหล่งที่มา: [Google Cloud Console](https://console.cloud.google.com/)

### ขั้นตอน:

#### Step 1: สร้าง/เลือก Project

1. ไปที่ https://console.cloud.google.com/
2. คลิก dropdown ชื่อ Project ด้านบน
3. คลิก **"New Project"** หรือเลือก Project ที่มีอยู่
4. ตั้งชื่อ Project เช่น "My Google Ads Dashboard"
5. คลิก **"Create"**

#### Step 2: เปิดใช้งาน Google Ads API

1. ไปที่ **"APIs & Services"** > **"Library"**
2. ค้นหา **"Google Ads API"**
3. คลิก **"Enable"**

#### Step 3: สร้าง OAuth 2.0 Credentials

1. ไปที่ **"APIs & Services"** > **"Credentials"**
2. คลิก **"+ CREATE CREDENTIALS"**
3. เลือก **"OAuth 2.0 Client ID"**

#### Step 4: ตั้งค่า OAuth Consent Screen (ถ้ายังไม่เคยทำ)

1. คลิก **"Configure Consent Screen"**
2. เลือก **"External"** (สำหรับทดสอบ) หรือ **"Internal"** (ถ้าเป็น Google Workspace)
3. กรอกข้อมูล:
   - App name: "My Google Ads Dashboard"
   - User support email: อีเมลของคุณ
   - Developer contact: อีเมลของคุณ
4. คลิก **"Save and Continue"**
5. ใน Scopes: คลิก **"Save and Continue"** (ข้ามไปก่อน)
6. ใน Test users: เพิ่มอีเมลของคุณ
7. คลิก **"Save and Continue"**

#### Step 5: สร้าง OAuth Client ID

1. กลับไปที่ **"Credentials"** > **"+ CREATE CREDENTIALS"** > **"OAuth 2.0 Client ID"**
2. Application type: เลือก **"Web application"**
3. Name: "Google Ads Dashboard"
4. Authorized redirect URIs: เพิ่ม
   ```
   http://localhost:3000/oauth2callback
   ```
5. คลิก **"Create"**

#### Step 6: คัดลอก Credentials

จะมี Popup แสดง:

```
Your Client ID
xxx.apps.googleusercontent.com

Your Client Secret
xxx
```

**บันทึกทั้ง 2 ค่านี้!**

### ✅ ผลลัพธ์:

```env
GOOGLE_ADS_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

---

## 2️⃣ GOOGLE_ADS_DEVELOPER_TOKEN

### 📍 แหล่งที่มา: [Google Ads API Center](https://ads.google.com/aw/apicenter)

### ขั้นตอน:

#### Step 1: เข้าสู่ Google Ads Account

1. ไปที่ https://ads.google.com/
2. Login ด้วยบัญชีที่มี Google Ads

#### Step 2: ขอ API Access

1. คลิกที่ **"Tools & Settings"** (🔧 ไอคอนประแจ)
2. ใน **"Setup"** section: คลิก **"API Center"**
3. คลิก **"Apply for Basic Access"** หรือ **"Apply for Standard Access"**

#### Step 3: กรอกแบบฟอร์ม

1. **Application type**: เลือก "Test Account" (ถ้าทดสอบ)
2. **Description**: อธิบายว่าจะใช้ API ทำอะไร
   - ตัวอย่าง: "Creating a dashboard to monitor campaign performance"
3. **Use case**: อธิบายการใช้งาน
4. Submit

#### Step 4: รอการอนุมัติ

- ⏱️ **Basic Access**: ~24-48 ชั่วโมง
- ⏱️ **Standard Access**: อาจใช้เวลานานกว่า

#### Step 5: ดู Developer Token

1. เมื่อได้รับการอนุมัติ กลับไปที่ **API Center**
2. จะเห็น **Developer Token** แสดงอยู่
3. คัดลอก Token

### ⚠️ สำคัญ:

- **Basic Access**: ใช้กับบัญชีทดสอบของคุณเองได้เท่านั้น
- **Standard Access**: ใช้กับบัญชีลูกค้าได้ แต่ต้องผ่านการตรวจสอบ

### ✅ ผลลัพธ์:

```env
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdEFghIJklMNopQRst
```

---

## 3️⃣ GOOGLE_ADS_REFRESH_TOKEN

### 📍 แหล่งที่มา: สร้างเองด้วยสคริปต์

### ขั้นตอน:

#### Step 1: แก้ไขสคริปต์

เปิดไฟล์ `scripts/generate-google-ads-refresh-token.js`:

```javascript
const CLIENT_ID = "ใส่ CLIENT_ID ของคุณ";
const CLIENT_SECRET = "ใส่ CLIENT_SECRET ของคุณ";
```

#### Step 2: รันสคริปต์

```bash
node scripts/generate-google-ads-refresh-token.js
```

#### Step 3: ทำตามขั้นตอน

1. สคริปต์จะแสดง URL ยาวๆ
2. **คัดลอก URL** และเปิดในเบราว์เซอร์
3. Login ด้วย Google Account ที่มี Google Ads
4. คลิก **"Allow"** เพื่ออนุญาต
5. จะถูก redirect ไปที่ `http://localhost:3000/oauth2callback?code=xxx`
6. **คัดลอก code** จาก URL (ส่วนหลัง `code=`)
7. วางใน Terminal
8. สคริปต์จะแสดง **Refresh Token**

### 💡 หมายเหตุ:

- Refresh Token จะไม่หมดอายุ (ยกเว้นถูกเพิกถอน)
- เก็บไว้ในที่ปลอดภัย
- ถ้าทำผิดพลาด สามารถรันสคริปต์ใหม่ได้

### ✅ ผลลัพธ์:

```env
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxx
```

---

## 4️⃣ GOOGLE_ADS_CUSTOMER_ID

### 📍 แหล่งที่มา: Google Ads Account

### ขั้นตอน:

#### วิธีที่ 1: จาก Google Ads UI

1. ไปที่ https://ads.google.com/
2. Login เข้าสู่ Account
3. ดูมุมขวาบนของหน้าจอ
4. จะเห็นเลข **Customer ID** รูปแบบ: `123-456-7890`

#### วิธีที่ 2: จาก Account Settings

1. คลิก **"Tools & Settings"** (🔧)
2. คลิก **"Settings"**
3. ใน **"Account"** section: จะเห็น Customer ID

### ⚠️ หมายเหตุ:

- ถ้ามีหลาย Account เลือก Account ที่ต้องการดึงข้อมูล
- ใช้ **Manager Account** ถ้าต้องการเข้าถึงหลาย Account

### 🔄 รูปแบบ:

- **UI แสดง**: `123-456-7890` (มีเครื่องหมาย `-`)
- **ใช้ใน API**: `1234567890` (ไม่มีเครื่องหมาย `-`)

### ✅ ผลลัพธ์:

```env
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

หรือ

```env
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
```

(โค้ดของเราจะ handle ทั้ง 2 แบบ)

---

## 🔄 Process Flow สรุป

```
1. Google Cloud Console
   ↓
   สร้าง OAuth 2.0 Client
   ↓
   ได้ CLIENT_ID + CLIENT_SECRET

2. Google Ads API Center
   ↓
   สมัคร API Access
   ↓
   รอการอนุมัติ (1-3 วัน)
   ↓
   ได้ DEVELOPER_TOKEN

3. Run สคริปต์ generate-refresh-token.js
   ↓
   ใช้ CLIENT_ID + CLIENT_SECRET
   ↓
   OAuth Flow
   ↓
   ได้ REFRESH_TOKEN

4. Google Ads Dashboard
   ↓
   คัดลอก Customer ID
   ↓
   ได้ CUSTOMER_ID

5. รวมทุกอย่างใน .env.local
   ↓
   พร้อมใช้งาน! 🎉
```

---

## 📝 ไฟล์ .env.local สมบูรณ์

สร้างไฟล์ `.env.local` ใน root ของโปรเจค:

```env
# จาก Google Cloud Console
GOOGLE_ADS_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# จาก Google Ads API Center
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdEFghIJklMNopQRst

# จาก generate-refresh-token.js
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxxxxxxxxxx

# จาก Google Ads Dashboard
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

---

## ⏱️ Timeline สรุป

| ขั้นตอน                  | เวลาที่ใช้ | หมายเหตุ                      |
| ------------------------ | ---------- | ----------------------------- |
| 1. สร้าง OAuth Client    | 5-10 นาที  | ทำได้ทันที                    |
| 2. สมัคร Developer Token | 1-3 วัน    | ต้องรออนุมัติ ⚠️              |
| 3. สร้าง Refresh Token   | 5 นาที     | ทำได้เมื่อมี Client ID/Secret |
| 4. หา Customer ID        | 1 นาที     | ดูใน Google Ads UI            |

**รวม: ~5-15 นาที + 1-3 วัน (รอ Developer Token)**

---

## 🚀 Alternative: ใช้ Mock Data ก่อน

**ถ้าไม่อยากรอ Developer Token:**

Dashboard ของเราใช้ Mock Data อยู่แล้ว! คุณสามารถ:

1. ใช้งาน Dashboard ได้ทันที โดยไม่ต้องตั้งค่าอะไร
2. ดูและทดสอบ UI
3. เมื่อได้ credentials แล้ว ค่อยเปลี่ยนเป็นข้อมูลจริง

```bash
# ใช้งานได้เลย!
npm run dev
# เปิด http://localhost:3000/google-ads-dashboard
```

---

## 🆘 Troubleshooting

### ปัญหา 1: ไม่เจอ API Center ใน Google Ads

**วิธีแก้:**

- ตรวจสอบว่า Account มีสิทธิ์ Admin
- ลองเปลี่ยนไปใช้ Manager Account

### ปัญหา 2: Developer Token ไม่ผ่าน

**วิธีแก้:**

- อธิบายการใช้งานให้ชัดเจนมากขึ้น
- ใช้ Test Account Mode ก่อน (Basic Access)

### ปัญหา 3: Refresh Token ไม่ได้

**วิธีแก้:**

- ตรวจสอบ Redirect URI ต้องตรงกัน
- ลอง Revoke Access แล้วทำใหม่
- เพิ่มตัวเองใน Test Users (OAuth Consent Screen)

### ปัญหา 4: Customer ID ไม่ถูกต้อง

**วิธีแก้:**

- ลบเครื่องหมาย `-` ออก: `123-456-7890` → `1234567890`
- หรือใช้เลขที่มี `-` โค้ดเราจะแปลงให้เอง

---

## 📚 Resources เพิ่มเติม

### Official Documentation

- [Google Ads API Docs](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 Guide](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Developer Token Guide](https://developers.google.com/google-ads/api/docs/first-call/dev-token)

### Video Tutorials

- [Google Ads API Getting Started](https://www.youtube.com/results?search_query=google+ads+api+tutorial)

### Community

- [Google Ads API Forum](https://groups.google.com/g/adwords-api)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-ads-api)

---

## ✅ Checklist

ใช้ checklist นี้ตรวจสอบความคืบหน้า:

- [ ] สร้าง Project ใน Google Cloud Console
- [ ] เปิดใช้งาน Google Ads API
- [ ] สร้าง OAuth 2.0 Client ID
- [ ] ได้ CLIENT_ID และ CLIENT_SECRET แล้ว
- [ ] สมัคร Developer Token
- [ ] รอการอนุมัติ Developer Token (1-3 วัน)
- [ ] ได้ DEVELOPER_TOKEN แล้ว
- [ ] รันสคริปต์ generate-refresh-token.js
- [ ] ได้ REFRESH_TOKEN แล้ว
- [ ] หา CUSTOMER_ID จาก Google Ads
- [ ] สร้างไฟล์ .env.local
- [ ] ใส่ค่าทั้งหมดใน .env.local
- [ ] ทดสอบการเชื่อมต่อ

---

## 💡 Pro Tips

1. **เก็บ Credentials ให้ปลอดภัย**

   - ห้าม commit ไฟล์ `.env.local` เข้า Git
   - ใช้ `.gitignore` ตรวจสอบ

2. **ใช้ Environment Variables แยกต่อ environment**

   - `.env.local` - Development
   - `.env.production` - Production
   - ใช้ Vercel/Netlify env vars สำหรับ deploy

3. **Test ด้วย Mock Data ก่อน**

   - ทำ UI ให้เสร็จก่อน
   - ค่อยเชื่อมต่อ API ภายหลัง

4. **Backup Credentials**

   - เก็บไว้ใน Password Manager
   - หรือ secure note

5. **Monitor API Usage**
   - ตรวจสอบ Quota ใน Google Cloud Console
   - ระวัง Rate Limits

---

**สร้างเมื่อ:** พฤศจิกายน 2025  
**อัปเดตล่าสุด:** พฤศจิกายน 2025  
**สถานะ:** ✅ Complete Guide

ขอให้โชคดีในการตั้งค่า! 🚀

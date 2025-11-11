# 🔐 วิธีใช้งาน Google Sheets Service Account

## ✅ สิ่งที่คุณมีแล้ว

- ✅ Service Account Email: `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`
- ✅ Spreadsheet ID: `1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y`
- ⚠️ Private Key: ต้องเพิ่มใน `.env.local`

---

## 🔑 ขั้นตอนที่ 1: ดาวน์โหลด Service Account Key

### 1.1 ไปที่ Google Cloud Console

1. เปิด [Google Cloud Console](https://console.cloud.google.com/)
2. เลือก Project: **name-tel-dev**

### 1.2 ดาวน์โหลด JSON Key File

1. ไปที่เมนู ☰ > **IAM & Admin** > **Service Accounts**
2. หา Service Account: `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`
3. คลิกที่ email (หรือ ⋮ menu)
4. ไปที่แท็บ **KEYS**
5. คลิก **ADD KEY** > **Create new key**
6. เลือก **JSON**
7. คลิก **CREATE**
8. ไฟล์ JSON จะถูกดาวน์โหลด (ชื่อประมาณ `name-tel-dev-xxxxx.json`)

---

## 📝 ขั้นตอนที่ 2: แก้ไขไฟล์ .env.local

### วิธีที่ 1: คัดลอก Private Key จากไฟล์ JSON

1. เปิดไฟล์ JSON ที่ดาวน์โหลดมา
2. หา field `"private_key"` จะมีค่าประมาณนี้:

   ```json
   {
     "type": "service_account",
     "project_id": "name-tel-dev",
     "private_key_id": "8424f0279f40d9b1cda8f430b9670df8c8fc0714",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFA...\n-----END PRIVATE KEY-----\n",
     "client_email": "web-sheets-reader@name-tel-dev.iam.gserviceaccount.com",
     ...
   }
   ```

3. **คัดลอกค่าใน `"private_key"`** ทั้งหมด (รวม `-----BEGIN` และ `-----END`)

4. เปิดไฟล์ `.env.local` และแทนที่:

   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```

   ด้วย:

   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFA...\n-----END PRIVATE KEY-----\n"
   ```

### ⚠️ สำคัญมาก!

- Private key ต้องอยู่บนบรรทัดเดียว
- ต้องมี `\n` สำหรับขึ้นบรรทัดใหม่
- ต้องอยู่ใน double quotes `"..."`
- **อย่า commit ไฟล์นี้ลง Git!**

### วิธีที่ 2: ใช้ PowerShell Script (แนะนำ)

```powershell
# อ่านไฟล์ JSON และแปลง private key
$json = Get-Content "path\to\your\downloaded-key.json" | ConvertFrom-Json
$privateKey = $json.private_key

# เพิ่มลงในไฟล์ .env.local
$envContent = @"
# Google Sheets Service Account Configuration
GOOGLE_SPREADSHEET_ID=1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y
GOOGLE_SERVICE_ACCOUNT_EMAIL=web-sheets-reader@name-tel-dev.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="$privateKey"
"@

$envContent | Out-File -FilePath .env.local -Encoding utf8
Write-Host "✅ .env.local updated successfully!"
```

---

## 🔐 ขั้นตอนที่ 3: แชร์ Google Sheet กับ Service Account

### 3.1 เปิด Google Sheet

เปิด: https://docs.google.com/spreadsheets/d/1OdHZNSlS-SrUpn4wIEn_6tegeVkv3spBfj-FyRRxg3Y/edit

### 3.2 แชร์กับ Service Account

1. คลิกปุ่ม **"แชร์"** (Share) มุมขวาบน
2. ใส่ email: `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`
3. ตั้งสิทธิ์เป็น **"ผู้ดู"** (Viewer)
4. **ยกเลิกการเลือก** "แจ้งเตือน" (Notify)
5. คลิก **"แชร์"** (Share)

### ✅ ผลลัพธ์

Service Account จะสามารถอ่านข้อมูลจาก Sheet ได้โดยไม่ต้องทำให้ Sheet เป็น public!

---

## 📊 ขั้นตอนที่ 4: ตรวจสอบ Sheet Structure

ตรวจสอบว่า Google Sheet มี:

- ✅ ชื่อ Sheet: **"Film data"** (ตรงทุกตัวอักษร)
- ✅ แถวแรกมีคอลัมน์:
  - หมอ
  - ผู้ติดต่อ
  - ชื่อ
  - เบอร์โทร
  - วันที่ได้นัดผ่าตัด
  - เวลาที่นัด
  - ยอดนำเสนอ

### ตัวอย่างข้อมูล

| หมอ      | ผู้ติดต่อ | ชื่อ     | เบอร์โทร     | วันที่ได้นัดผ่าตัด | เวลาที่นัด | ยอดนำเสนอ |
| -------- | --------- | -------- | ------------ | ------------------ | ---------- | --------- |
| ดร.สมชาย | สา        | คุณหนึ่ง | 081-234-5678 | 15/11/2024         | 10:00      | 50000     |

---

## 🚀 ขั้นตอนที่ 5: รันโปรเจค

### 5.1 Restart Development Server

```powershell
# หยุด server (Ctrl+C ถ้ารันอยู่)
npm run dev
```

### 5.2 เปิดเบราว์เซอร์

```
http://localhost:3000/performance-surgery-schedule
```

---

## ✅ สิ่งที่ควรเห็น

### เมื่อตั้งค่าถูกต้อง:

- ✅ โหลดข้อมูลได้ (ไม่มี error)
- ✅ เห็นตัวเลขในช่องที่มีนัด (badge สีม่วง)
- ✅ คลิกช่องแล้วเห็น popup รายละเอียด

### ถ้าเจอ Error:

- ❌ แสดง error message พร้อมคำแนะนำ
- 🔍 เปิด Browser Console (F12) ดู error details

---

## 🔍 Troubleshooting

### Error: "Missing required environment variables"

**สาเหตุ**: ไฟล์ `.env.local` ไม่ครบ

**แก้ไข**:

```powershell
# ตรวจสอบว่ามีครบ 3 ตัว
Get-Content .env.local
```

ต้องมี:

```env
GOOGLE_SPREADSHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN..."
```

### Error: "Failed to fetch data"

**สาเหตุ**: Service Account ไม่มีสิทธิ์เข้าถึง Sheet

**แก้ไข**:

1. เปิด Google Sheet
2. คลิก "แชร์"
3. ตรวจสอบว่ามี `web-sheets-reader@name-tel-dev.iam.gserviceaccount.com`
4. ถ้าไม่มี ให้เพิ่มด้วยสิทธิ์ "Viewer"

### Error: "Cannot find name 'Film data'"

**สาเหตุ**: ชื่อ Sheet ไม่ตรง

**แก้ไข**:

1. เปิด Google Sheet
2. ดูชื่อ tab ล่างซ้าย
3. ต้องเป็น **"Film data"** (ตรงทุกตัว)

### Error: "Invalid private key"

**สาเหตุ**: Private key format ไม่ถูกต้อง

**แก้ไข**:

1. Private key ต้องอยู่บนบรรทัดเดียว
2. ต้องมี `\n` สำหรับ newline
3. ต้องอยู่ใน double quotes
4. ตัวอย่าง:
   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
   ```

---

## 📁 โครงสร้างไฟล์ที่เพิ่มมา

```
package/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── surgery-schedule/
│   │           └── route.ts          # API Route สำหรับ Service Account
│   └── utils/
│       └── googleSheets.ts            # อัพเดทให้เรียก API Route
├── .env.local                         # Service Account credentials
└── SERVICE_ACCOUNT_SETUP.md           # คู่มือนี้
```

---

## 🔒 ความปลอดภัย

### ✅ ข้อดีของ Service Account

1. **ไม่ต้องทำ Sheet เป็น Public** - แชร์เฉพาะกับ Service Account
2. **ปลอดภัยกว่า API Key** - Private key ถูกเก็บที่ server
3. **จัดการสิทธิ์ง่าย** - ควบคุมได้ว่า Sheet ไหนเข้าถึงได้

### ⚠️ สิ่งที่ต้องระวัง

1. **อย่า commit `.env.local` ลง Git**

   ```bash
   # ตรวจสอบว่ามีใน .gitignore
   .env.local
   ```

2. **อย่าแชร์ Private Key**

   - ไม่ควร copy-paste ใน chat/email
   - ไม่ควรเก็บใน code
   - ควรเก็บใน environment variables

3. **Rotate Keys เป็นระยะ**
   - ควรสร้าง key ใหม่ทุก 3-6 เดือน
   - ลบ key เก่าทิ้ง

---

## 📚 เอกสารเพิ่มเติม

- [Google Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets API v4](https://developers.google.com/sheets/api)
- HOW_TO_FIX_API_403_ERROR.md (สำหรับ API Key method)

---

## 🎯 Next Steps

หลังจากตั้งค่าเสร็จ:

1. ✅ ทดสอบดึงข้อมูล
2. ✅ เพิ่มข้อมูลใน Google Sheet
3. ✅ ตรวจสอบว่าแสดงผลถูกต้อง
4. ✅ Deploy to production (ตั้งค่า env variables ใน hosting platform)

---

**เวอร์ชัน**: 1.0  
**อัพเดทล่าสุด**: พฤศจิกายน 2024  
**สำหรับ**: Performance Surgery Schedule System

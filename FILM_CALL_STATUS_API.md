# Film Call Status API - คู่มือการใช้งาน

## 📋 ภาพรวม

API นี้ดึงข้อมูลจาก Google Sheets ชีต **"Film data"** เพื่อแสดงรายการโทรศัพท์ที่มีสถานะ **"อยู่ระหว่างโทรออก"** ในกล่อง **"โทรออก"** บน Dashboard

---

## 🔗 Endpoint

```
GET /api/google-sheets-film-call-status
```

---

## 📊 คอลัมน์ที่ใช้งาน

API นี้จะอ่านข้อมูลจากคอลัมน์ต่อไปนี้ในชีต **"Film data"**:

| คอลัมน์    | ตำแหน่ง              | ชื่อเรียก     | คำอธิบาย                                  |
| ---------- | -------------------- | ------------- | ----------------------------------------- |
| `สถานะ`    | คอลัมน์ AS (index 0) | สถานะการโทร   | สถานะของการโทร (เช่น "อยู่ระหว่างโทรออก") |
| `เบอร์โทร` | คอลัมน์ G (index 6)  | เบอร์โทรศัพท์ | หมายเลขโทรศัพท์ของลูกค้า                  |
| `ชื่อ`     | คอลัมน์ F (index 5)  | ชื่อลูกค้า    | ชื่อของลูกค้า (ไม่บังคับ)                 |

---

## 🎯 การทำงาน

### 1. **ดึงข้อมูลจาก Google Sheets**

- API จะอ่านข้อมูลทั้งหมดจากชีต "Film data" (คอลัมน์ A-Z)
- แถวแรกถือเป็น Header

### 2. **กรองข้อมูล**

- กรองเฉพาะแถวที่มี คอลัมน์ `สถานะ` = **"อยู่ระหว่างโทรออก"**
- ต้องมีเบอร์โทรศัพท์ (ไม่เป็นค่าว่างหรือ "-")

### 3. **แสดงผลใน Dashboard**

- แสดงเบอร์โทรศัพท์พร้อมชื่อลูกค้าในกล่อง **"โทรออก"**
- ถ้าไม่มีชื่อลูกค้า จะแสดงเบอร์โทรศัพท์แทน

### 4. **อัพเดทอัตโนมัติ**

- เมื่อสถานะเปลี่ยนจาก **"อยู่ระหว่างโทรออก"** เป็นสถานะอื่น
- เบอร์โทรศัพท์จะหายไปจากกล่อง **"โทรออก"** โดยอัตโนมัติ

---

## 📤 Response Format

### ✅ Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": "film-2",
      "name": "สมชาย ใจดี",
      "phone": "0812345678",
      "status": "อยู่ระหว่างโทรออก"
    },
    {
      "id": "film-5",
      "name": "0898765432",
      "phone": "0898765432",
      "status": "อยู่ระหว่างโทรออก"
    }
  ],
  "total": 2,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "debug": {
    "totalRows": 150,
    "matchedRows": 2,
    "statusCallColumn": "status_call",
    "phoneColumn": "เบอร์โทร",
    "nameColumn": "ชื่อ"
  }
}
```

### ❌ Error Response

```json
{
  "success": false,
  "error": "Required columns \"status_call\" or \"เบอร์โทร\" not found in Film data sheet",
  "availableHeaders": ["คอลัมน์ A", "คอลัมน์ B", "..."]
}
```

---

## 🔄 Cache

- **Cache Duration**: 10 วินาที
- **Cache Key**: `film-call-status`
- **Header**: `X-Cache-Status` (HIT/MISS)

---

## 🧪 การทดสอบ

### ทดสอบ API ด้วย Browser

```
http://localhost:3000/api/google-sheets-film-call-status
```

### ทดสอบด้วย PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/google-sheets-film-call-status" -Method Get | ConvertTo-Json -Depth 5
```

---

## 📝 ตัวอย่างข้อมูลใน Google Sheets

| ชื่อ          | เบอร์โทร   | status_call           | ผู้ติดต่อ |
| ------------- | ---------- | --------------------- | --------- |
| สมชาย ใจดี    | 0812345678 | **อยู่ระหว่างโทรออก** | สา        |
| สมหญิง รักสวย | 0898765432 | รับสายแล้ว            | พัชชา     |
| จอห์น ดู      | 0823456789 | **อยู่ระหว่างโทรออก** | จีน       |

**ผลลัพธ์**: จะแสดงเฉพาะ "สมชาย ใจดี" และ "จอห์น ดู" ในกล่อง "โทรออก"

---

## 🔧 Configuration

### Environment Variables

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

---

## 📌 หมายเหตุ

1. **ชื่อคอลัมน์ต้องตรงกับที่กำหนด**

   - `status_call` (หรือ "สถานะการโทร")
   - `เบอร์โทร` (หรือ "phone")
   - `ชื่อ` (หรือ "name", "ชื่อลูกค้า")

2. **การอัพเดทแบบ Real-time**

   - Dashboard จะรีเฟรชข้อมูลทุก 30 วินาที
   - สามารถกดปุ่ม "รีเฟรช" เพื่ออัพเดททันที

3. **การจัดการ Cache**
   - Cache จะช่วยลด API calls ไปยัง Google Sheets
   - Cache จะหมดอายุทุก 10 วินาที

---

## 🎨 การแสดงผลบน Dashboard

### กล่อง "โทรออก" (Outgoing)

```
┌─────────────────────────────────┐
│        โทรออก (Outgoing)        │
├─────────────────────────────────┤
│ Film Data - สมชาย ใจดี          │
│ 📞 0812345678                   │
├─────────────────────────────────┤
│ Film Data - จอห์น ดู            │
│ 📞 0823456789                   │
└─────────────────────────────────┘
```

### เมื่อสถานะเปลี่ยน

```
สถานะเปลี่ยนจาก: "อยู่ระหว่างโทรออก"
เป็น: "รับสายแล้ว", "ไม่รับสาย", "ติดต่อสำเร็จ", etc.

→ เบอร์โทรศัพท์จะหายไปจากกล่อง "โทรออก" โดยอัตโนมัติ
```

---

## 🚀 การใช้งานใน Code

### การเรียกใช้ใน React Component

```typescript
const [filmCallStatusData, setFilmCallStatusData] = useState<any[]>([]);

const fetchFilmCallStatusData = async () => {
  try {
    const response = await fetch("/api/google-sheets-film-call-status");
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      setFilmCallStatusData(result.data);
      console.log(
        "✅ Film call status data loaded:",
        result.data.length,
        "calls"
      );
    }
  } catch (error) {
    console.error("❌ Error fetching Film call status data:", error);
  }
};

// เรียกใช้ทุก 30 วินาที
useEffect(() => {
  fetchFilmCallStatusData();
  const interval = setInterval(fetchFilmCallStatusData, 30000);
  return () => clearInterval(interval);
}, []);
```

### การแปลงเป็น ContactRecord

```typescript
const filmCallStatusContacts: ContactRecord[] = filmCallStatusData
  .filter((call) => call.status === "อยู่ระหว่างโทรออก")
  .map((call) => ({
    id: call.id,
    name: call.name || call.phone,
    company: "Film Data (อยู่ระหว่างโทรออก)",
    phone: call.phone,
    email: "",
    status: "outgoing",
    lastContact: new Date().toISOString(),
    notes: `สถานะ: ${call.status}`,
    createdAt: new Date().toISOString(),
  }));
```

---

## ✅ Checklist การตั้งค่า

- [ ] สร้างไฟล์ API route: `/api/google-sheets-film-call-status/route.ts`
- [ ] ตรวจสอบ Environment Variables
- [ ] ตรวจสอบชื่อคอลัมน์ใน Google Sheets
- [ ] ทดสอบ API response
- [ ] เชื่อมต่อกับ Dashboard component
- [ ] ทดสอบการแสดงผลในกล่อง "โทรออก"
- [ ] ทดสอบการอัพเดทเมื่อสถานะเปลี่ยน

---

## 🐛 Troubleshooting

### ปัญหา: ไม่แสดงข้อมูลในกล่อง "โทรออก"

**แก้ไข**:

1. ตรวจสอบว่ามีข้อมูลในชีต "Film data" หรือไม่
2. ตรวจสอบชื่อคอลัมน์ว่าถูกต้อง (`status_call`, `เบอร์โทร`, `ชื่อ`)
3. ตรวจสอบว่ามีแถวที่มีสถานะ "อยู่ระหว่างโทรออก" หรือไม่
4. ดู Console logs เพื่อตรวจสอบข้อผิดพลาด

### ปัญหา: ข้อมูลไม่อัพเดท

**แก้ไข**:

1. ล้าง Cache โดยรอ 10 วินาที
2. กดปุ่ม "รีเฟรช" บน Dashboard
3. ตรวจสอบว่า Auto-refresh interval ทำงานปกติ

### ปัญหา: API Error 500

**แก้ไข**:

1. ตรวจสอบ Environment Variables
2. ตรวจสอบ Service Account permissions
3. ตรวจสอบ Spreadsheet ID

---

## 📞 ติดต่อ & Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

- ตรวจสอบ Console logs
- ดู Error messages ใน API response
- ตรวจสอบ Network tab ใน Browser DevTools

---

**เอกสารนี้อัพเดทล่าสุด**: 15 มกราคม 2025

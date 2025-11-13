# 🎯 Quick Start: Webhook Setup

คู่มือฉบับย่อสำหรับการติดตั้งและใช้งาน Webhook Integration

---

## ⚡ ติดตั้งภายใน 5 นาที

### 1. ตั้งค่า Environment Variables

ตรวจสอบไฟล์ `.env.local` ว่ามีค่าเหล่านี้:

```bash
# Supabase (ตั้งค่าเรียบร้อยแล้ว ✅)
NEXT_PUBLIC_SUPABASE_URL=https://houhlbfagngkyrbbhmmi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Webhook Secret (ตั้งค่าเรียบร้อยแล้ว ✅)
SURGERY_SCHEDULE_WEBHOOK_SECRET=webhook-secret-2025-surgery-schedule-api
```

### 2. รัน Dev Server

```powershell
npm run dev
```

### 3. ทดสอบ API

```powershell
.\test-webhook-surgery-schedule.ps1
```

### 4. ติดตั้ง Google Apps Script

1. เปิด Google Sheets → Extensions → Apps Script
2. คัดลอกโค้ดจาก `docs/google-apps-script-webhook.js`
3. แก้ไข `API_ENDPOINT` และ `WEBHOOK_SECRET`
4. รันฟังก์ชัน `testConnection`

### 5. ตั้งค่า Auto-Sync

1. ใน Apps Script → Triggers
2. Add Trigger: `onSheetEdit` → On edit
3. บันทึกและ Authorize

---

## 🎉 เสร็จสิ้น!

ทุกครั้งที่แก้ไข Google Sheets → ข้อมูลจะถูกส่งไปยัง Supabase อัตโนมัติ

---

## 📚 เอกสารเพิ่มเติม

- [คู่มือเต็ม (WEBHOOK_INTEGRATION_GUIDE.md)](../WEBHOOK_INTEGRATION_GUIDE.md)
- [Troubleshooting](../WEBHOOK_INTEGRATION_GUIDE.md#-troubleshooting)
- [API Documentation](../WEBHOOK_INTEGRATION_GUIDE.md#-api-documentation)

---

## 🆘 ช่วยเหลือด่วน

### ไม่ทำงาน?

1. ตรวจสอบ Console logs (F12 ใน browser)
2. ตรวจสอบ Apps Script logs (View → Logs)
3. ตรวจสอบ Supabase Table Editor

### เจอ Error?

- `Unauthorized` → ตรวจสอบ `WEBHOOK_SECRET`
- `Missing env vars` → รีสตาร์ท dev server
- `Sheet not found` → ตรวจสอบ `DATA_SHEET_NAME`

---

**คำถาม?** อ่าน [WEBHOOK_INTEGRATION_GUIDE.md](../WEBHOOK_INTEGRATION_GUIDE.md)

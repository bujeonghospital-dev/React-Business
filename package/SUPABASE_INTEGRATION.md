# 🔗 Supabase Integration Guide

## ขั้นตอนการเชื่อมต่อ Supabase กับ Customer Contact Dashboard

### ✅ สิ่งที่ได้ทำเสร็จแล้ว

1. ✅ ติดตั้ง `@supabase/supabase-js`
2. ✅ สร้างไฟล์ `src/utils/supabase/client.ts`
3. ✅ เพิ่ม Environment Variables ใน `.env.local`
4. ✅ สร้าง SQL Schema (`supabase-schema.sql`)
5. ✅ อัพเดท API Routes ทั้งหมดให้ใช้ Supabase
6. ✅ อัพเดท Dashboard Component

---

## 📋 ขั้นตอนที่คุณต้องทำ

### 1️⃣ หา Supabase Anon Key

1. ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/settings/api
2. คัดลอก **anon public key**
3. เพิ่มใน `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2️⃣ สร้างตารางใน Supabase Database

1. ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor
2. คลิก **"New Query"**
3. คัดลอกโค้ดจากไฟล์ `supabase-schema.sql` ทั้งหมด
4. กด **Run** เพื่อสร้างตาราง

### 3️⃣ ตรวจสอบว่าตารางสร้างสำเร็จ

1. ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor
2. คลิกที่ **Table Editor** (เมนูซ้าย)
3. ควรเห็นตาราง `customer_contacts` พร้อมข้อมูลตัวอย่าง 4 รายการ

### 4️⃣ รีสตาร์ท Development Server

```bash
npm run dev
```

---

## 🎯 ฟีเจอร์ที่ใช้งานได้

### ✅ CRUD Operations ผ่าน API Routes

1. **GET /api/customer-contacts**

   - ดึงข้อมูลทั้งหมดจาก Supabase
   - รองรับการกรองตาม status
   - รองรับการค้นหา (search)

2. **POST /api/customer-contacts**

   - เพิ่มข้อมูลใหม่ลง Supabase
   - มี validation ครบถ้วน

3. **GET /api/customer-contacts/[id]**

   - ดึงข้อมูล 1 รายการ

4. **PUT /api/customer-contacts/[id]**

   - แก้ไขข้อมูล
   - อัพเดท `updated_at` อัตโนมัติ

5. **DELETE /api/customer-contacts/[id]**
   - ลบข้อมูล

### ✅ Dashboard Features

- แสดงข้อมูลจาก Supabase และ Yalecom API พร้อมกัน
- Kanban Board แบ่งตามสถานะ
- ตารางแสดงรายละเอียดครบถ้วน
- Form สำหรับเพิ่ม/แก้ไขข้อมูล
- Auto-refresh ทุก 5 วินาที

---

## 🔍 ตรวจสอบการทำงาน

### ทดสอบ API ด้วย Browser

1. เปิด: http://localhost:3000/api/customer-contacts

   - ควรเห็นข้อมูลจาก Supabase

2. ตรวจสอบ Console ใน Browser DevTools
   - ไม่ควรมี error เกี่ยวกับ Supabase

### ทดสอบ Dashboard

1. เปิด: http://localhost:3000/customer-contact-dashboard
2. ทดสอบปุ่ม **"เพิ่มรายการใหม่"**
3. ทดสอบปุ่ม **"แก้ไข"** และ **"ลบ"**
4. ดูข้อมูลใน Supabase Table Editor เพื่อยืนยัน

---

## 📊 Database Schema

```sql
customer_contacts
├── id (UUID, Primary Key)
├── name (VARCHAR)
├── company (VARCHAR)
├── phone (VARCHAR)
├── email (VARCHAR, nullable)
├── status (VARCHAR) → 'outgoing' | 'received' | 'waiting' | 'sale'
├── last_contact (TIMESTAMPTZ)
├── notes (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## 🔒 Security (Row Level Security)

ตอนนี้ตั้งค่าให้ทุกคนสามารถ CRUD ได้ (สำหรับ Development)

**สำหรับ Production:**

- ควรเปิดใช้ Authentication
- จำกัดสิทธิ์ตาม user role
- ใช้ Service Role Key สำหรับ API Routes

---

## 🐛 Troubleshooting

### ❌ Error: "Invalid API key"

- ตรวจสอบ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน `.env.local`
- รีสตาร์ท dev server

### ❌ Error: "relation "customer_contacts" does not exist"

- รัน SQL จากไฟล์ `supabase-schema.sql` ใน Supabase SQL Editor

### ❌ Error: "CORS policy"

- Supabase อนุญาต localhost โดยอัตโนมัติ
- สำหรับ Production ต้อง whitelist domain ใน Supabase Settings

---

## 📚 เอกสารเพิ่มเติม

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 🎉 เสร็จสิ้น!

ตอนนี้ Dashboard ของคุณเชื่อมต่อกับ Supabase เรียบร้อยแล้ว 🚀

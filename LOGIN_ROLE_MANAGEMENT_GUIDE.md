# คู่มือการใช้งานระบบ Login และ Role Management

## ✅ สิ่งที่ได้ทำเสร็จแล้ว

### 1. **ป้องกันการเข้าถึงหน้า customer-all-data โดยไม่ login**

- สร้าง Middleware ตรวจสอบ authentication token
- Redirect ไปหน้า login ถ้าไม่มี token
- เก็บ URL ที่ต้องการเข้าถึงไว้ใน query parameter

### 2. **Redirect หลัง Login**

- เมื่อ login สำเร็จจะไปที่ `/customer-all-data`
- เก็บ token ใน cookie สำหรับ middleware
- เก็บข้อมูล user ใน localStorage

### 3. **แสดงข้อมูลตาม Role**

- User ที่ไม่ใช่ admin จะเห็นเฉพาะข้อมูลของตัวเอง
- Filter โดยชื่อใน column "ผู้ติดต่อ"
- Auto-filter เมื่อโหลดหน้า

### 4. **ซ่อน Filter "ผู้ติดต่อ"**

- แสดงเฉพาะสำหรับ role: `superadmin` และ `admin`
- User role อื่นๆ จะไม่เห็น dropdown filter นี้

### 5. **Role Hierarchy Database**

- สร้างตาราง `role_hierarchy` พร้อมระดับสิทธิ์
- 5 Roles: dev (100), superadmin (90), admin (80), sale (50), user (10)
- สิทธิ์ที่จัดการ: view/edit contacts, manage users, analytics

---

## 📊 Role Hierarchy

| Role           | Level | View All | Edit All | Manage Users | Analytics |
| -------------- | ----- | -------- | -------- | ------------ | --------- |
| **dev**        | 100   | ✅       | ✅       | ✅           | ✅        |
| **superadmin** | 90    | ✅       | ✅       | ✅           | ✅        |
| **admin**      | 80    | ✅       | ✅       | ✅           | ✅        |
| **sale**       | 50    | ❌       | ❌       | ❌           | ✅        |
| **user**       | 10    | ❌       | ❌       | ❌           | ❌        |

---

## 🚀 วิธีติดตั้ง

### 1. รัน SQL Script

```bash
psql -U postgres -d your_database -f create-role-hierarchy.sql
```

### 2. ตรวจสอบตาราง

```sql
-- ดูข้อมูล role hierarchy
SELECT * FROM role_hierarchy ORDER BY role_level DESC;

-- ดูข้อมูล user พร้อมสิทธิ์
SELECT * FROM user_with_role_hierarchy;

-- ตรวจสอบสิทธิ์ของ user
SELECT username, role_name, can_view_all_contacts, can_edit_all_contacts
FROM user_with_role_hierarchy
WHERE username = 'admin';
```

### 3. สร้าง User ตัวอย่าง

```sql
-- เพิ่ม Sale user
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role)
VALUES (
  'สา',
  'พนักงานขาย',
  'sale_sa',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'sa@example.com',
  'sale',
  FALSE,
  (SELECT id_role FROM roles WHERE tag = 'sale')
);

-- เพิ่ม Dev user
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role)
VALUES (
  'Developer',
  'System',
  'dev',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'dev@example.com',
  'dev',
  TRUE,
  (SELECT id_role FROM roles WHERE tag = 'dev')
);
```

---

## 🔐 การทดสอบ

### ทดสอบ Admin (เห็นทุกอย่าง + มี Filter ผู้ติดต่อ)

1. Login: `admin@example.com` / `admin123`
2. จะเห็นข้อมูลทั้งหมด
3. มี dropdown filter "ผู้ติดต่อ"
4. สามารถกรองตาม ผู้ติดต่อ ได้

### ทดสอบ Sale (เห็นแค่ของตัวเอง + ไม่มี Filter ผู้ติดต่อ)

1. Login: `sale_sa@example.com` / `admin123`
2. จะเห็นเฉพาะข้อมูลที่ "ผู้ติดต่อ" = "สา"
3. **ไม่มี** dropdown filter "ผู้ติดต่อ"
4. ไม่สามารถเปลี่ยนดูข้อมูลคนอื่นได้

### ทดสอบ Protection

1. Logout หรือเคลียร์ cookie
2. พยายามเข้า `/customer-all-data`
3. จะถูก redirect ไป `/login?redirect=/customer-all-data`
4. Login แล้วจะกลับมาหน้าเดิม

---

## 💡 ฟีเจอร์เพิ่มเติม

### 1. Function ตรวจสอบสิทธิ์

```sql
-- ตรวจสอบว่า user id 1 มีสิทธิ์ดูข้อมูลทั้งหมดหรือไม่
SELECT check_user_permission(1, 'view_all_contacts');

-- ตรวจสอบว่า user id 2 สามารถจัดการ user ได้หรือไม่
SELECT check_user_permission(2, 'manage_users');
```

### 2. View สำหรับดูข้อมูล User

```sql
-- ดูข้อมูล user ทั้งหมดพร้อมสิทธิ์
SELECT
  username,
  role_name,
  role_level,
  can_view_all_contacts,
  can_edit_all_contacts,
  can_manage_users
FROM user_with_role_hierarchy
ORDER BY role_level DESC;
```

---

## 🔧 API Integration (ถ้าต้องการในอนาคต)

### ตัวอย่าง API Endpoint สำหรับตรวจสอบสิทธิ์

```typescript
// /api/auth/check-permission
import pool from "@/lib/db";

export async function POST(request: Request) {
  const { userId, permission } = await request.json();

  const result = await pool.query(
    "SELECT check_user_permission($1, $2) as has_permission",
    [userId, permission]
  );

  return Response.json({
    hasPermission: result.rows[0].has_permission,
  });
}
```

---

## 📝 สรุป Files ที่สร้าง/แก้ไข

### ไฟล์ที่สร้างใหม่

1. ✅ `create-role-hierarchy.sql` - SQL สำหรับสร้าง role hierarchy

### ไฟล์ที่แก้ไข

1. ✅ `src/middleware.ts` - เพิ่ม authentication check
2. ✅ `src/app/login/page.tsx` - เปลี่ยน redirect และเก็บ cookie
3. ✅ `src/app/(fullscreen)/customer-all-data/page.tsx` - เพิ่ม filter ตาม user และซ่อน filter

---

## 🎯 การใช้งานจริง

### สำหรับ Admin/SuperAdmin

- เห็นข้อมูลทั้งหมด
- สามารถกรองตาม "ผู้ติดต่อ" ได้
- จัดการ user ได้
- เข้าถึง analytics ได้

### สำหรับ Sale

- เห็นเฉพาะลูกค้าของตัวเอง
- ไม่มีปุ่มกรอง "ผู้ติดต่อ"
- ดูสถิติได้ (แต่เฉพาะของตัวเอง)

### สำหรับ User ทั่วไป

- เห็นเฉพาะข้อมูลของตัวเอง
- ไม่มีสิทธิ์พิเศษใดๆ

---

## ⚠️ หมายเหตุ

1. **Password ตัวอย่าง:** `admin123` (ทุก user)
2. **Cookie Expiry:**
   - Remember me: 30 วัน
   - ไม่ remember: 7 วัน
3. **Middleware:** ทำงานกับทุก route ยกเว้น static files และ API
4. **Role Tag:** ใช้ `role_tag` ใน localStorage เพื่อตรวจสอบสิทธิ์

---

ระบบพร้อมใช้งานแล้ว! 🎉

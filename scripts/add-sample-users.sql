-- ตัวอย่างการเพิ่ม user ใหม่
-- รหัสผ่าน: admin123

-- 1. เพิ่ม user ธรรมดา
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role) 
VALUES (
  'ทดสอบ', 
  'ผู้ใช้', 
  'testuser2', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'test2@example.com', 
  'member', 
  FALSE, 
  4
)
ON CONFLICT (username) DO NOTHING;

-- 2. เพิ่ม manager
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role) 
VALUES (
  'ผู้จัดการ', 
  'ทดสอบ', 
  'manager', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'manager@example.com', 
  'manager', 
  FALSE, 
  3
)
ON CONFLICT (username) DO NOTHING;

-- 3. ตรวจสอบข้อมูล
SELECT 
  id, 
  name, 
  lname, 
  username, 
  email, 
  status_rank, 
  admin,
  create_date
FROM "user"
ORDER BY id;

-- 4. ลบ user (soft delete)
-- UPDATE "user" SET delete_date = CURRENT_TIMESTAMP WHERE username = 'testuser2';

-- 5. กู้คืน user ที่ถูกลบ
-- UPDATE "user" SET delete_date = NULL WHERE username = 'testuser2';

-- 6. แก้ไขข้อมูล user
-- UPDATE "user" SET name = 'ชื่อใหม่', email = 'newemail@example.com' WHERE id = 1;

-- 7. เปลี่ยนรหัสผ่าน (ต้อง hash ก่อน)
-- UPDATE "user" SET password = '$2b$10$...' WHERE id = 1;

-- 8. เปลี่ยนสถานะเป็น admin
-- UPDATE "user" SET admin = TRUE, id_role = 1 WHERE id = 2;

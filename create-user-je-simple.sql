-- สร้าง user je แบบง่ายที่สุด (ไม่ต้องมี role ก่อนก็ได้)

-- ลบ user เก่าถ้ามี
DELETE FROM "user" WHERE username = 'je' OR email = 'je@example.com';

-- สร้างใหม่
INSERT INTO "user" (
  name, 
  username, 
  password, 
  email, 
  admin
) 
VALUES (
  'เจ', 
  'je', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'je@example.com',
  false
);

-- ตรวจสอบ
SELECT id, name, username, email, admin, delete_date 
FROM "user" 
WHERE username = 'je';

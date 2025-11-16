-- ตรวจสอบข้อมูล user ที่มีอยู่
SELECT 
  id, 
  name, 
  username, 
  email,
  id_role,
  delete_date,
  LEFT(password, 20) as password_start
FROM "user" 
WHERE username = 'je' OR email = 'je@example.com';

-- ตรวจสอบ roles
SELECT * FROM roles;

-- ถ้าไม่มี user je ให้สร้างใหม่
INSERT INTO "user" (
  name, 
  lname, 
  username, 
  password, 
  email, 
  status_rank, 
  admin, 
  id_role,
  delete_date
) 
VALUES (
  'เจ', 
  'พนักงานขาย', 
  'je', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'je@example.com', 
  'sale', 
  FALSE, 
  (SELECT id_role FROM roles WHERE tag = 'sale' OR name = 'Sales' LIMIT 1),
  NULL
)
ON CONFLICT (username) 
DO UPDATE SET 
  password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  email = 'je@example.com',
  delete_date = NULL;

-- ตรวจสอบอีกครั้ง
SELECT 
  u.id, 
  u.name, 
  u.username, 
  u.email,
  u.delete_date,
  r.name as role_name,
  r.tag as role_tag
FROM "user" u
LEFT JOIN roles r ON u.id_role = r.id_role
WHERE u.username = 'je' OR u.email = 'je@example.com';

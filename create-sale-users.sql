-- สร้าง Sale Users สำหรับทดสอบ
-- Password: admin123 (เข้ารหัสด้วย bcrypt)

-- 1. ตรวจสอบว่ามี role 'sale' หรือยัง ถ้าไม่มีให้สร้าง
INSERT INTO roles (name, tag, back_end) 
VALUES ('Sales', 'sale', FALSE)
ON CONFLICT DO NOTHING;

-- 2. สร้าง User: สา
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role) 
VALUES (
  'สา', 
  'พนักงานขาย', 
  'sa', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'sa@example.com', 
  'sale', 
  FALSE, 
  (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1)
)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password;

-- 3. สร้าง User: เจ
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role) 
VALUES (
  'เจ', 
  'พนักงานขาย', 
  'je', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'je@example.com', 
  'sale', 
  FALSE, 
  (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1)
)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password;

-- 4. สร้าง User เพิ่มเติมตามรายชื่อในระบบ
INSERT INTO "user" (name, lname, username, password, email, status_rank, admin, id_role) 
VALUES 
  ('พิดยา', 'พนักงานขาย', 'pidya', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pidya@example.com', 'sale', FALSE, (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1)),
  ('ว่าน', 'พนักงานขาย', 'wan', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'wan@example.com', 'sale', FALSE, (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1)),
  ('จีน', 'พนักงานขาย', 'jeen', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jeen@example.com', 'sale', FALSE, (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1)),
  ('มุก', 'พนักงานขาย', 'mook', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mook@example.com', 'sale', FALSE, (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1)),
  ('ตั้งโอ๋', 'พนักงานขาย', 'tangoh', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tangoh@example.com', 'sale', FALSE, (SELECT id_role FROM roles WHERE tag = 'sale' LIMIT 1))
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password;

-- 5. ตรวจสอบว่าสร้างสำเร็จ
SELECT 
  id, 
  name, 
  username, 
  email, 
  status_rank,
  (SELECT name FROM roles WHERE id_role = "user".id_role) as role_name
FROM "user" 
WHERE delete_date IS NULL
ORDER BY id;

-- อัพเดท password ให้เป็น format ที่ถูกต้องสำหรับ Node.js bcrypt
-- Password: admin123

UPDATE "user" 
SET password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username IN ('sa', 'je', 'admin', 'testuser');

-- ตรวจสอบการอัพเดท
SELECT id, name, username, email, 
       LEFT(password, 10) as password_prefix,
       (SELECT tag FROM roles WHERE id_role = "user".id_role) as role_tag
FROM "user" 
WHERE delete_date IS NULL
ORDER BY id;

-- ถ้าต้องการสร้าง password ใหม่ด้วย bcrypt
-- ใช้คำสั่งนี้ใน Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);
-- console.log(hash);

-- สร้างตาราง user สำหรับระบบ login (PostgreSQL)
CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lname VARCHAR(255) DEFAULT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status_rank VARCHAR(50) DEFAULT 'member',
  admin BOOLEAN DEFAULT FALSE,
  id_role INTEGER DEFAULT NULL,
  id_dep INTEGER DEFAULT NULL,
  position INTEGER DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  token VARCHAR(255) DEFAULT NULL,
  last_login TIMESTAMP DEFAULT NULL,
  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP DEFAULT NULL,
  delete_date TIMESTAMP DEFAULT NULL
);

-- สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_id_role ON "user"(id_role);
CREATE INDEX IF NOT EXISTS idx_id_dep ON "user"(id_dep);
CREATE INDEX IF NOT EXISTS idx_position ON "user"(position);

-- สร้าง trigger สำหรับ auto update update_date
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment สำหรับตาราง user
COMMENT ON TABLE "user" IS 'ตารางผู้ใช้งานระบบ';
COMMENT ON COLUMN "user".name IS 'ชื่อผู้ใช้';
COMMENT ON COLUMN "user".lname IS 'นามสกุล';
COMMENT ON COLUMN "user".username IS 'ID_login - ชื่อผู้ใช้สำหรับเข้าสู่ระบบ';
COMMENT ON COLUMN "user".password IS 'Password - เข้ารหัสด้วย bcrypt';
COMMENT ON COLUMN "user".status_rank IS 'ระดับสิทธิ์ เช่น admin, manager, member';
COMMENT ON COLUMN "user".admin IS 'สถานะ admin (false=ไม่ใช่, true=ใช่)';
COMMENT ON COLUMN "user".id_role IS 'รหัสบทบาท (roles)';
COMMENT ON COLUMN "user".id_dep IS 'รหัสแผนก (department)';
COMMENT ON COLUMN "user".position IS 'รหัสตำแหน่ง (position)';
COMMENT ON COLUMN "user".email IS 'อีเมล';
COMMENT ON COLUMN "user".token IS 'Token สำหรับ session';
COMMENT ON COLUMN "user".last_login IS 'เข้าสู่ระบบล่าสุด';
COMMENT ON COLUMN "user".create_date IS 'วันที่สร้าง';
COMMENT ON COLUMN "user".update_date IS 'วันที่แก้ไข';
COMMENT ON COLUMN "user".delete_date IS 'วันที่ลบ (soft delete)';

-- สร้างตาราง roles (บทบาท/สิทธิ์)
CREATE TABLE IF NOT EXISTS roles (
  id_role SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tag VARCHAR(50) DEFAULT NULL,
  back_end BOOLEAN DEFAULT FALSE,
  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'ตารางบทบาทและสิทธิ์';
COMMENT ON COLUMN roles.name IS 'ชื่อบทบาท';
COMMENT ON COLUMN roles.tag IS 'แท็กบทบาท';
COMMENT ON COLUMN roles.back_end IS 'สิทธิ์เข้าถึง backend';

-- สร้างตาราง department (แผนก)
CREATE TABLE IF NOT EXISTS department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_full_th VARCHAR(255) DEFAULT NULL,
  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE department IS 'ตารางแผนก';
COMMENT ON COLUMN department.name IS 'ชื่อแผนกย่อ';
COMMENT ON COLUMN department.name_full_th IS 'ชื่อแผนกเต็ม (ไทย)';

-- สร้างตาราง position (ตำแหน่ง)
CREATE TABLE IF NOT EXISTS "position" (
  id SERIAL PRIMARY KEY,
  name_full_th VARCHAR(255) NOT NULL,
  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "position" IS 'ตารางตำแหน่ง';
COMMENT ON COLUMN "position".name_full_th IS 'ชื่อตำแหน่ง (ไทย)';

-- สร้างตาราง parth_file (สำหรับเก็บรูปโปรไฟล์)
CREATE TABLE IF NOT EXISTS parth_file (
  id SERIAL PRIMARY KEY,
  id_ref INTEGER NOT NULL,
  prefix VARCHAR(50) DEFAULT NULL,
  path VARCHAR(500) DEFAULT NULL,
  name_file VARCHAR(255) DEFAULT NULL,
  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delete_date TIMESTAMP DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_id_ref ON parth_file(id_ref, prefix);

COMMENT ON TABLE parth_file IS 'ตารางเก็บไฟล์และรูปภาพ';
COMMENT ON COLUMN parth_file.id_ref IS 'รหัสอ้างอิง (user id)';
COMMENT ON COLUMN parth_file.prefix IS 'คำนำหน้า เช่น user_img';
COMMENT ON COLUMN parth_file.path IS 'path ของไฟล์';
COMMENT ON COLUMN parth_file.name_file IS 'ชื่อไฟล์';

-- ===================================
-- เพิ่ม Foreign Keys
-- ===================================

ALTER TABLE "user" ADD CONSTRAINT fk_user_role 
  FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE SET NULL;

ALTER TABLE "user" ADD CONSTRAINT fk_user_department 
  FOREIGN KEY (id_dep) REFERENCES department(id) ON DELETE SET NULL;

ALTER TABLE "user" ADD CONSTRAINT fk_user_position 
  FOREIGN KEY (position) REFERENCES "position"(id) ON DELETE SET NULL;

-- ===================================
-- ข้อมูลตัวอย่าง (Sample Data)
-- ===================================

-- Insert ข้อมูล roles ตัวอย่าง
INSERT INTO roles (name, tag, back_end) VALUES
('Super Admin', 'superadmin', TRUE),
('Admin', 'admin', TRUE),
('Manager', 'manager', FALSE),
('Member', 'member', FALSE)
ON CONFLICT DO NOTHING;

-- Insert ข้อมูล department ตัวอย่าง
INSERT INTO department (name, name_full_th) VALUES
('IT', 'ฝ่ายเทคโนโลยีสารสนเทศ'),
('HR', 'ฝ่ายทรัพยากรบุคคล'),
('SALES', 'ฝ่ายขาย')
ON CONFLICT DO NOTHING;

-- Insert ข้อมูล position ตัวอย่าง
INSERT INTO "position" (name_full_th) VALUES
('ผู้จัดการ'),
('หัวหน้าแผนก'),
('พนักงาน'),
('ฝึกงาน')
ON CONFLICT DO NOTHING;

-- Insert ผู้ใช้ตัวอย่าง
-- รหัสผ่าน: admin123 (เข้ารหัสด้วย bcrypt)
INSERT INTO "user" (name, lname, username, password, status_rank, admin, id_role, email) VALUES
('Admin', 'System', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, 1, 'admin@example.com'),
('Test', 'User', 'testuser', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', FALSE, 4, 'test@example.com')
ON CONFLICT (username) DO NOTHING;

-- หมายเหตุ: 
-- รหัสผ่านที่แนะนำคือ 'admin123'
-- สามารถ login ด้วย:
-- - email: admin@example.com / password: admin123
-- - email: test@example.com / password: admin123

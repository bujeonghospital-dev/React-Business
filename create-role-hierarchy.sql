-- สร้างตาราง role_hierarchy สำหรับจัดการระดับสิทธิ์
CREATE TABLE IF NOT EXISTS role_hierarchy (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  role_level INTEGER NOT NULL UNIQUE,
  description VARCHAR(255),
  can_view_all_contacts BOOLEAN DEFAULT FALSE,
  can_edit_all_contacts BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_access_analytics BOOLEAN DEFAULT FALSE,
  create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP DEFAULT NULL
);

-- สร้าง trigger สำหรับ auto update
CREATE OR REPLACE FUNCTION update_role_hierarchy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_role_hierarchy_updated_at 
BEFORE UPDATE ON role_hierarchy
FOR EACH ROW EXECUTE FUNCTION update_role_hierarchy_timestamp();

-- Comment สำหรับตาราง
COMMENT ON TABLE role_hierarchy IS 'ตารางจัดการระดับสิทธิ์และลำดับชั้น';
COMMENT ON COLUMN role_hierarchy.role_name IS 'ชื่อ role';
COMMENT ON COLUMN role_hierarchy.role_level IS 'ระดับสิทธิ์ (ยิ่งสูงยิ่งมีสิทธิ์มาก)';
COMMENT ON COLUMN role_hierarchy.can_view_all_contacts IS 'สามารถดูข้อมูลผู้ติดต่อทั้งหมด';
COMMENT ON COLUMN role_hierarchy.can_edit_all_contacts IS 'สามารถแก้ไขข้อมูลผู้ติดต่อทั้งหมด';
COMMENT ON COLUMN role_hierarchy.can_manage_users IS 'สามารถจัดการผู้ใช้งาน';
COMMENT ON COLUMN role_hierarchy.can_access_analytics IS 'สามารถเข้าถึงรายงานและสถิติ';

-- Insert role hierarchy data
INSERT INTO role_hierarchy (role_name, role_level, description, can_view_all_contacts, can_edit_all_contacts, can_manage_users, can_access_analytics) VALUES
('dev', 100, 'Developer - สิทธิ์สูงสุดสำหรับพัฒนาระบบ', TRUE, TRUE, TRUE, TRUE),
('superadmin', 90, 'Super Administrator - ผู้ดูแลระบบระดับสูงสุด', TRUE, TRUE, TRUE, TRUE),
('admin', 80, 'Administrator - ผู้ดูแลระบบ', TRUE, TRUE, TRUE, TRUE),
('sale', 50, 'Sales - พนักงานขาย', FALSE, FALSE, FALSE, TRUE),
('user', 10, 'User - ผู้ใช้งานทั่วไป', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role_name) DO NOTHING;

-- Update roles table ให้มีความสัมพันธ์กับ role_hierarchy
ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_hierarchy_id INTEGER;
ALTER TABLE roles ADD CONSTRAINT fk_roles_hierarchy 
  FOREIGN KEY (role_hierarchy_id) REFERENCES role_hierarchy(id) ON DELETE SET NULL;

-- Update existing roles ให้เชื่อมโยงกับ role_hierarchy
UPDATE roles SET role_hierarchy_id = (SELECT id FROM role_hierarchy WHERE role_name = 'superadmin') WHERE tag = 'superadmin';
UPDATE roles SET role_hierarchy_id = (SELECT id FROM role_hierarchy WHERE role_name = 'admin') WHERE tag = 'admin';
UPDATE roles SET role_hierarchy_id = (SELECT id FROM role_hierarchy WHERE role_name = 'sale') WHERE tag = 'manager';
UPDATE roles SET role_hierarchy_id = (SELECT id FROM role_hierarchy WHERE role_name = 'user') WHERE tag = 'member';

-- เพิ่ม roles สำหรับ dev และ sale ถ้ายังไม่มี
INSERT INTO roles (name, tag, back_end, role_hierarchy_id) VALUES
('Developer', 'dev', TRUE, (SELECT id FROM role_hierarchy WHERE role_name = 'dev')),
('Sales', 'sale', FALSE, (SELECT id FROM role_hierarchy WHERE role_name = 'sale'))
ON CONFLICT DO NOTHING;

-- สร้าง view สำหรับดูข้อมูล user พร้อม role hierarchy
CREATE OR REPLACE VIEW user_with_role_hierarchy AS
SELECT 
  u.id,
  u.name,
  u.lname,
  u.username,
  u.email,
  u.status_rank,
  u.admin,
  r.name AS role_name,
  r.tag AS role_tag,
  rh.role_name AS hierarchy_role,
  rh.role_level,
  rh.can_view_all_contacts,
  rh.can_edit_all_contacts,
  rh.can_manage_users,
  rh.can_access_analytics,
  d.name_full_th AS department_name,
  p.name_full_th AS position_name
FROM "user" u
LEFT JOIN roles r ON u.id_role = r.id_role
LEFT JOIN role_hierarchy rh ON r.role_hierarchy_id = rh.id
LEFT JOIN department d ON u.id_dep = d.id
LEFT JOIN "position" p ON u.position = p.id
WHERE u.delete_date IS NULL;

COMMENT ON VIEW user_with_role_hierarchy IS 'View แสดงข้อมูล user พร้อมสิทธิ์และ role hierarchy';

-- Query ตัวอย่าง: ดูข้อมูล user พร้อมสิทธิ์
-- SELECT * FROM user_with_role_hierarchy ORDER BY role_level DESC;

-- Query ตัวอย่าง: ตรวจสอบว่า user มีสิทธิ์ดูข้อมูลทั้งหมดหรือไม่
-- SELECT username, role_name, can_view_all_contacts FROM user_with_role_hierarchy WHERE username = 'admin';

-- สร้าง function สำหรับตรวจสอบสิทธิ์
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id INTEGER,
  p_permission VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN;
BEGIN
  SELECT 
    CASE p_permission
      WHEN 'view_all_contacts' THEN rh.can_view_all_contacts
      WHEN 'edit_all_contacts' THEN rh.can_edit_all_contacts
      WHEN 'manage_users' THEN rh.can_manage_users
      WHEN 'access_analytics' THEN rh.can_access_analytics
      ELSE FALSE
    END INTO v_result
  FROM "user" u
  LEFT JOIN roles r ON u.id_role = r.id_role
  LEFT JOIN role_hierarchy rh ON r.role_hierarchy_id = rh.id
  WHERE u.id = p_user_id AND u.delete_date IS NULL;
  
  RETURN COALESCE(v_result, FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_user_permission(INTEGER, VARCHAR) IS 'ฟังก์ชันตรวจสอบสิทธิ์ของผู้ใช้';

-- ตัวอย่างการใช้งาน:
-- SELECT check_user_permission(1, 'view_all_contacts');
-- SELECT check_user_permission(1, 'manage_users');

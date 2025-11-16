-- สร้างตาราง user สำหรับระบบ login
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'ชื่อผู้ใช้',
  `Lname` VARCHAR(255) DEFAULT NULL COMMENT 'นามสกุล',
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT 'ID_login - ชื่อผู้ใช้สำหรับเข้าสู่ระบบ',
  `password` VARCHAR(255) NOT NULL COMMENT 'Password - เข้ารหัสด้วย password_hash',
  `status_rank` VARCHAR(50) DEFAULT 'member' COMMENT 'ระดับสิทธิ์ เช่น admin, manager, member',
  `admin` TINYINT(1) DEFAULT 0 COMMENT 'สถานะ admin (0=ไม่ใช่, 1=ใช่)',
  `id_role` INT(11) DEFAULT NULL COMMENT 'รหัสบทบาท (roles)',
  `id_dep` INT(11) DEFAULT NULL COMMENT 'รหัสแผนก (department)',
  `position` INT(11) DEFAULT NULL COMMENT 'รหัสตำแหน่ง (position)',
  `email` VARCHAR(255) DEFAULT NULL COMMENT 'อีเมล',
  `token` VARCHAR(255) DEFAULT NULL COMMENT 'Token สำหรับ session',
  `last_login` DATETIME DEFAULT NULL COMMENT 'เข้าสู่ระบบล่าสุด',
  `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `update_date` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่แก้ไข',
  `delete_date` DATETIME DEFAULT NULL COMMENT 'วันที่ลบ (soft delete)',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_id_role` (`id_role`),
  KEY `idx_id_dep` (`id_dep`),
  KEY `idx_position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางผู้ใช้งานระบบ';

-- สร้างตาราง roles (บทบาท/สิทธิ์)
CREATE TABLE IF NOT EXISTS `roles` (
  `id_role` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'ชื่อบทบาท',
  `tag` VARCHAR(50) DEFAULT NULL COMMENT 'แท็กบทบาท',
  `back_end` TINYINT(1) DEFAULT 0 COMMENT 'สิทธิ์เข้าถึง backend',
  `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง department (แผนก)
CREATE TABLE IF NOT EXISTS `department` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'ชื่อแผนกย่อ',
  `name_full_th` VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อแผนกเต็ม (ไทย)',
  `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง position (ตำแหน่ง)
CREATE TABLE IF NOT EXISTS `position` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name_full_th` VARCHAR(255) NOT NULL COMMENT 'ชื่อตำแหน่ง (ไทย)',
  `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง parth_file (สำหรับเก็บรูปโปรไฟล์)
CREATE TABLE IF NOT EXISTS `parth_file` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `id_ref` INT(11) NOT NULL COMMENT 'รหัสอ้างอิง (user id)',
  `prefix` VARCHAR(50) DEFAULT NULL COMMENT 'คำนำหน้า เช่น user_img',
  `path` VARCHAR(500) DEFAULT NULL COMMENT 'path ของไฟล์',
  `name_file` VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อไฟล์',
  `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `delete_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_id_ref` (`id_ref`, `prefix`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- ข้อมูลตัวอย่าง (Sample Data)
-- ===================================

-- Insert ข้อมูล roles ตัวอย่าง
INSERT INTO `roles` (`name`, `tag`, `back_end`) VALUES
('Super Admin', 'superadmin', 1),
('Admin', 'admin', 1),
('Manager', 'manager', 0),
('Member', 'member', 0);

-- Insert ข้อมูล department ตัวอย่าง
INSERT INTO `department` (`name`, `name_full_th`) VALUES
('IT', 'ฝ่ายเทคโนโลยีสารสนเทศ'),
('HR', 'ฝ่ายทรัพยากรบุคคล'),
('SALES', 'ฝ่ายขาย');

-- Insert ข้อมูล position ตัวอย่าง
INSERT INTO `position` (`name_full_th`) VALUES
('ผู้จัดการ'),
('หัวหน้าแผนก'),
('พนักงาน'),
('ฝึกงาน');

-- Insert ผู้ใช้ตัวอย่าง
-- รหัสผ่าน: admin123 (เข้ารหัสด้วย password_hash)
INSERT INTO `user` (`name`, `Lname`, `username`, `password`, `status_rank`, `admin`, `id_role`, `email`) VALUES
('Admin', 'System', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1, 'admin@example.com'),
('Test', 'User', 'testuser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 0, 4, 'test@example.com');

-- หมายเหตุ: รหัสผ่านที่แนะนำคือ 'admin123'
-- หากต้องการสร้างรหัสผ่านใหม่ ใช้คำสั่ง PHP:
-- password_hash('รหัสผ่านของคุณ', PASSWORD_DEFAULT);

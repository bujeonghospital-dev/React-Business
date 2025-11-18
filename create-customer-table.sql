-- สร้างตาราง customers สำหรับเก็บข้อมูลลูกค้า
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  สถานะ VARCHAR(100),
  แหล่งที่มา VARCHAR(100),
  ผลิตภัณฑ์ที่สนใจ VARCHAR(200),
  หมอ VARCHAR(100),
  ผู้ติดต่อ VARCHAR(100),
  ชื่อ VARCHAR(200),
  เบอร์โทร VARCHAR(20),
  หมายเหตุ TEXT,
  วันที่ติดตามครั้งล่าสุด DATE,
  วันที่ติดตามครั้งถัดไป DATE,
  "วันที่ Consult" DATE,
  วันที่ผ่าตัด DATE,
  เวลาที่นัด TIME,
  "วันที่ได้ชื่อ เบอร์" DATE,
  "วันที่ได้นัด consult" DATE,
  วันที่ได้นัดผ่าตัด DATE,
  ยอดนำเสนอ DECIMAL(12, 2),
  รหัสลูกค้า VARCHAR(50) UNIQUE,
  ติดดาว BOOLEAN DEFAULT FALSE,
  ประเทศ VARCHAR(100),
  เวลาให้เรียกรถ TIME,
  "Lat" DECIMAL(10, 8),
  "Long" DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX idx_customers_status ON customers(สถานะ);
CREATE INDEX idx_customers_contact ON customers(ผู้ติดต่อ);
CREATE INDEX idx_customers_phone ON customers(เบอร์โทร);
CREATE INDEX idx_customers_code ON customers(รหัสลูกค้า);
CREATE INDEX idx_customers_consult_date ON customers("วันที่ Consult");
CREATE INDEX idx_customers_surgery_date ON customers(วันที่ผ่าตัด);
CREATE INDEX idx_customers_follow_up_next ON customers(วันที่ติดตามครั้งถัดไป);

-- สร้าง trigger สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
BEFORE UPDATE ON customers 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- เพิ่ม comment อธิบายตาราง
COMMENT ON TABLE customers IS 'ตารางเก็บข้อมูลลูกค้าทั้งหมด';
COMMENT ON COLUMN customers.id IS 'รหัสอ้างอิง (Primary Key)';
COMMENT ON COLUMN customers.สถานะ IS 'สถานะของลูกค้า (เช่น นัดแล้ว, ติดตาม, เป็นลูกค้าแล้ว)';
COMMENT ON COLUMN customers.แหล่งที่มา IS 'แหล่งที่มาของลูกค้า';
COMMENT ON COLUMN customers.ผลิตภัณฑ์ที่สนใจ IS 'ผลิตภัณฑ์หรือบริการที่ลูกค้าสนใจ';
COMMENT ON COLUMN customers.หมอ IS 'ชื่อแพทย์ที่รับผิดชอบ';
COMMENT ON COLUMN customers.ผู้ติดต่อ IS 'ชื่อพนักงานที่ติดต่อ';
COMMENT ON COLUMN customers.ชื่อ IS 'ชื่อลูกค้า';
COMMENT ON COLUMN customers.เบอร์โทร IS 'เบอร์โทรศัพท์ติดต่อ';
COMMENT ON COLUMN customers.หมายเหตุ IS 'หมายเหตุเพิ่มเติม';
COMMENT ON COLUMN customers.ยอดนำเสนอ IS 'ยอดเงินที่นำเสนอ';
COMMENT ON COLUMN customers.รหัสลูกค้า IS 'รหัสลูกค้า (HN) ไม่ซ้ำกัน';
COMMENT ON COLUMN customers.ติดดาว IS 'ทำเครื่องหมายลูกค้าสำคัญ';
COMMENT ON COLUMN customers."Lat" IS 'ละติจูดสำหรับ Google Maps';
COMMENT ON COLUMN customers."Long" IS 'ลองจิจูดสำหรับ Google Maps';

-- ===================================================================
-- ตัวอย่างคำสั่ง INSERT ข้อมูลลูกค้าตัวอย่าง
-- ===================================================================
/*
INSERT INTO customers (
  สถานะ,
  แหล่งที่มา,
  ผลิตภัณฑ์ที่สนใจ,
  หมอ,
  ผู้ติดต่อ,
  ชื่อ,
  เบอร์โทร,
  หมายเหตุ,
  วันที่ติดตามครั้งล่าสุด,
  วันที่ติดตามครั้งถัดไป,
  "วันที่ Consult",
  วันที่ผ่าตัด,
  เวลาที่นัด,
  "วันที่ได้ชื่อ เบอร์",
  "วันที่ได้นัด consult",
  วันที่ได้นัดผ่าตัด,
  ยอดนำเสนอ,
  รหัสลูกค้า,
  ติดดาว,
  ประเทศ,
  เวลาให้เรียกรถ,
  "Lat",
  "Long"
) VALUES (
  'นัดแล้ว',
  'Facebook',
  'ตาสองชั้น',
  'หมอสมชาย',
  'สา',
  'คุณสมหญิง ใจดี',
  '0812345678',
  'ลูกค้าสนใจมาก ติดต่อง่าย',
  '2024-01-15',
  '2024-01-20',
  '2024-01-25',
  '2024-02-01',
  '10:00:00',
  '2024-01-10',
  '2024-01-15',
  '2024-01-18',
  150000.00,
  'HN001234',
  TRUE,
  'ไทย',
  '09:30:00',
  13.7563,
  100.5018
);
*/

-- ===================================================================
-- คำสั่ง SELECT ตัวอย่าง
-- ===================================================================

-- ดึงข้อมูลลูกค้าทั้งหมด
-- SELECT * FROM customers ORDER BY created_at DESC;

-- ดึงข้อมูลลูกค้าตามสถานะ
-- SELECT * FROM customers WHERE สถานะ = 'นัดแล้ว';

-- ดึงข้อมูลลูกค้าตามผู้ติดต่อ
-- SELECT * FROM customers WHERE ผู้ติดต่อ = 'สา';

-- ดึงข้อมูลลูกค้าที่ติดดาว
-- SELECT * FROM customers WHERE ติดดาว = TRUE;

-- ดึงข้อมูลลูกค้าที่มีนัดในวันที่กำหนด
-- SELECT * FROM customers WHERE "วันที่ Consult" = '2024-01-25';

-- นับจำนวนลูกค้าตามสถานะ
-- SELECT สถานะ, COUNT(*) as จำนวน FROM customers GROUP BY สถานะ ORDER BY จำนวน DESC;

-- นับจำนวนลูกค้าตามผู้ติดต่อ
-- SELECT ผู้ติดต่อ, COUNT(*) as จำนวน FROM customers GROUP BY ผู้ติดต่อ ORDER BY จำนวน DESC;

-- ===================================================================
-- คำสั่ง UPDATE ตัวอย่าง
-- ===================================================================

-- อัพเดทสถานะลูกค้า
-- UPDATE customers SET สถานะ = 'เป็นลูกค้าแล้ว' WHERE รหัสลูกค้า = 'HN001234';

-- อัพเดทวันที่ติดตามครั้งถัดไป
-- UPDATE customers SET วันที่ติดตามครั้งถัดไป = '2024-02-01' WHERE id = 1;

-- อัพเดทหมายเหตุ
-- UPDATE customers SET หมายเหตุ = 'ลูกค้าโทรมาติดตามเอง' WHERE รหัสลูกค้า = 'HN001234';

-- ===================================================================
-- คำสั่ง DELETE ตัวอย่าง (ใช้ระวัง!)
-- ===================================================================

-- ลบลูกค้าตาม ID
-- DELETE FROM customers WHERE id = 1;

-- ลบลูกค้าตามรหัสลูกค้า
-- DELETE FROM customers WHERE รหัสลูกค้า = 'HN001234';

-- ===================================================================
-- คำสั่งสำหรับ Backup และ Restore
-- ===================================================================

-- Backup ตาราง customers
-- pg_dump -U your_username -d your_database -t customers -F c -f customers_backup.dump

-- Restore ตาราง customers
-- pg_restore -U your_username -d your_database -t customers customers_backup.dump

-- Export ข้อมูลเป็น CSV
-- COPY customers TO '/path/to/customers.csv' DELIMITER ',' CSV HEADER;

-- Import ข้อมูลจาก CSV
-- COPY customers FROM '/path/to/customers.csv' DELIMITER ',' CSV HEADER;

-- ===================================================================
-- คำสั่งสำหรับดู Schema และ Indexes
-- ===================================================================

-- ดูโครงสร้างตาราง
-- \d customers

-- ดู indexes ทั้งหมดของตาราง
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'customers';

-- ดูขนาดของตาราง
-- SELECT pg_size_pretty(pg_total_relation_size('customers'));

-- ===================================================================
-- คำสั่งสำหรับ Performance Tuning
-- ===================================================================

-- วิเคราะห์ตารางเพื่อปรับปรุง query performance
-- ANALYZE customers;

-- Vacuum ตารางเพื่อล้างข้อมูลที่ไม่ใช้แล้ว
-- VACUUM customers;

-- Reindex ตารางเพื่อปรับปรุง index
-- REINDEX TABLE customers;

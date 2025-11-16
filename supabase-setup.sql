-- คัดลอกทั้งหมดนี้ไป Paste ใน Supabase SQL Editor
-- https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/sql/new

-- 1. สร้าง Schema
CREATE SCHEMA IF NOT EXISTS "BJH-Server";

-- 2. สร้างตาราง bjh_all_leads
CREATE TABLE IF NOT EXISTS "BJH-Server".bjh_all_leads (
  id BIGSERIAL PRIMARY KEY,
  status TEXT,
  source TEXT,
  interested_product TEXT,
  doctor TEXT,
  contact_staff TEXT,
  customer_name TEXT,
  phone TEXT,
  note TEXT,
  last_followup TEXT,
  next_followup TEXT,
  consult_date TEXT,
  surgery_date TEXT,
  appointment_time TEXT,
  got_contact_date TEXT,
  booked_consult_date TEXT,
  booked_surgery_date TEXT,
  proposed_amount TEXT,
  customer_code TEXT,
  star_flag TEXT,
  country TEXT,
  car_call_time TEXT,
  lat DOUBLE PRECISION,
  long DOUBLE PRECISION,
  photo_note TEXT,
  gender TEXT,
  age INTEGER,
  occupation TEXT,
  from_province TEXT,
  travel_method TEXT,
  contact_prefer_date TEXT,
  contact_prefer_time TEXT,
  free_program TEXT,
  event_id TEXT,
  html_link TEXT,
  ical_uid TEXT,
  log TEXT,
  doc_calendar TEXT,
  doc_event_id TEXT,
  doc_html_link TEXT,
  doc_ical_uid TEXT,
  line_note TEXT,
  line_doctor_note TEXT,
  ivr TEXT,
  transfer_to TEXT,
  status_call TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. สร้าง Indexes
CREATE INDEX IF NOT EXISTS idx_status ON "BJH-Server".bjh_all_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_staff ON "BJH-Server".bjh_all_leads(contact_staff);
CREATE INDEX IF NOT EXISTS idx_phone ON "BJH-Server".bjh_all_leads(phone);
CREATE INDEX IF NOT EXISTS idx_consult_date ON "BJH-Server".bjh_all_leads(consult_date);
CREATE INDEX IF NOT EXISTS idx_surgery_date ON "BJH-Server".bjh_all_leads(surgery_date);
CREATE INDEX IF NOT EXISTS idx_next_followup ON "BJH-Server".bjh_all_leads(next_followup);
CREATE INDEX IF NOT EXISTS idx_customer_name ON "BJH-Server".bjh_all_leads(customer_name);
CREATE INDEX IF NOT EXISTS idx_customer_code ON "BJH-Server".bjh_all_leads(customer_code);

-- 4. สร้าง Trigger สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION "BJH-Server".update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bjh_all_leads_updated_at
BEFORE UPDATE ON "BJH-Server".bjh_all_leads
FOR EACH ROW
EXECUTE FUNCTION "BJH-Server".update_updated_at_column();

-- 5. เพิ่มข้อมูลตัวอย่าง 3 รายการ
INSERT INTO "BJH-Server".bjh_all_leads 
  (status, customer_name, phone, note, contact_staff, doctor, interested_product, source)
VALUES
  ('ติดตาม', 'สมชาย ใจดี', '0812345678', 'สนใจทำจมูก', 'พนักงาน A', 'หมอ B', 'ศัลยกรรมจมูก', 'Facebook'),
  ('นัดแล้ว', 'สมหญิง สวยงาม', '0898765432', 'นัด Consult วันที่ 20', 'พนักงาน C', 'หมอ D', 'ฉีดโบท็อก', 'LINE'),
  ('เป็นลูกค้าแล้ว', 'นายทดสอบ ระบบ', '0999999999', 'ทำเสร็จแล้ว พอใจ', 'พนักงาน E', 'หมอ F', 'ฟิลเลอร์', 'Walk-in');

-- 6. ตรวจสอบว่าสร้างสำเร็จ
SELECT 'Schema created successfully! ✅' AS status;
SELECT COUNT(*) AS total_records FROM "BJH-Server".bjh_all_leads;

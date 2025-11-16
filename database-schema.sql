-- สร้างตาราง customers สำหรับเก็บข้อมูลลูกค้า
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  
  -- ข้อมูลพื้นฐาน
  status TEXT,
  source TEXT,
  interested_product TEXT,
  doctor TEXT,
  contact_staff TEXT,
  customer_name TEXT,
  phone TEXT,
  note TEXT,
  
  -- วันที่ต่างๆ
  last_followup TEXT,
  next_followup TEXT,
  consult_date TEXT,
  surgery_date TEXT,
  appointment_time TEXT,
  got_contact_date TEXT,
  booked_consult_date TEXT,
  booked_surgery_date TEXT,
  
  -- ข้อมูลทางการเงินและรหัส
  proposed_amount TEXT,
  customer_code TEXT,
  star_flag TEXT,
  
  -- ข้อมูลสถานที่
  country TEXT,
  car_call_time TEXT,
  lat DOUBLE PRECISION,
  long DOUBLE PRECISION,
  
  -- ข้อมูลเพิ่มเติม
  photo_note TEXT,
  gender TEXT,
  age INTEGER,
  occupation TEXT,
  from_province TEXT,
  travel_method TEXT,
  
  -- ข้อมูลการติดต่อ
  contact_prefer_date TEXT,
  contact_prefer_time TEXT,
  free_program TEXT,
  
  -- ข้อมูล Google Calendar
  event_id TEXT,
  html_link TEXT,
  ical_uid TEXT,
  log TEXT,
  
  -- ข้อมูล Doctor Calendar
  doc_calendar TEXT,
  doc_event_id TEXT,
  doc_html_link TEXT,
  doc_ical_uid TEXT,
  
  -- ข้อมูล LINE
  line_note TEXT,
  line_doctor_note TEXT,
  
  -- ข้อมูลการโทร
  ivr TEXT,
  transfer_to TEXT,
  status_call TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- สร้าง index สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_customer_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_contact ON customers(contact_staff);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customer_consult_date ON customers(consult_date);
CREATE INDEX IF NOT EXISTS idx_customer_surgery_date ON customers(surgery_date);
CREATE INDEX IF NOT EXISTS idx_customer_next_followup ON customers(next_followup);
CREATE INDEX IF NOT EXISTS idx_customer_name ON customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_customer_code ON customers(customer_code);

-- สร้าง trigger สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ตัวอย่างการ Insert ข้อมูล (สามารถลบออกได้ถ้าไม่ต้องการ)
-- INSERT INTO customers (status, customer_name, phone, contact_staff, interested_product) 
-- VALUES ('ติดตาม', 'ทดสอบ ลูกค้า', '0812345678', 'สา', 'ตาสองชั้น');

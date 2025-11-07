-- ============================================
-- Customer Contacts Table Schema for Supabase
-- ============================================
-- คัดลอก SQL นี้และรันใน Supabase SQL Editor
-- ไปที่: https://supabase.com/dashboard/project/houhlbfagngkyrbbhmmi/editor

-- 1. สร้างตาราง customer_contacts
CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  status VARCHAR(50) NOT NULL CHECK (status IN ('outgoing', 'received', 'waiting', 'sale')),
  last_contact TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้าง Index เพื่อเพิ่มความเร็วในการค้นหา
CREATE INDEX IF NOT EXISTS idx_customer_contacts_status ON customer_contacts(status);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_phone ON customer_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_created_at ON customer_contacts(created_at DESC);

-- 3. สร้าง Function สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. สร้าง Trigger เพื่อเรียกใช้ Function ข้างบน
DROP TRIGGER IF EXISTS update_customer_contacts_updated_at ON customer_contacts;
CREATE TRIGGER update_customer_contacts_updated_at
  BEFORE UPDATE ON customer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;

-- 6. สร้าง Policy เพื่ออนุญาตให้ทุกคนสามารถอ่านและเขียนได้ (สำหรับ Development)
-- ⚠️ สำหรับ Production ควรจำกัดสิทธิ์ตาม user authentication
CREATE POLICY "Enable read access for all users" ON customer_contacts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON customer_contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON customer_contacts
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON customer_contacts
  FOR DELETE USING (true);

-- 7. เพิ่มข้อมูลตัวอย่าง (Optional)
INSERT INTO customer_contacts (name, company, phone, email, status, notes) VALUES
  ('สมชาย ใจดี', 'บริษัท ABC จำกัด', '089-123-4567', 'somchai@abc.com', 'waiting', 'ลูกค้าใหม่ รอติดต่อกลับ'),
  ('สมหญิง รักสุข', 'บริษัท XYZ จำกัด', '081-234-5678', 'somying@xyz.com', 'sale', 'SALE ติดต่อไปแล้ว'),
  ('ประเสริฐ ดีเลิศ', 'บริษัท DEF จำกัด', '092-345-6789', 'prasert@def.com', 'outgoing', 'กำลังโทรออก'),
  ('สุดา มั่งมี', 'บริษัท GHI จำกัด', '084-456-7890', 'suda@ghi.com', 'received', 'รับสายแล้ว รอติดตาม')
ON CONFLICT DO NOTHING;

-- ✅ เสร็จสิ้น! ตอนนี้คุณพร้อมใช้งาน Supabase Database แล้ว

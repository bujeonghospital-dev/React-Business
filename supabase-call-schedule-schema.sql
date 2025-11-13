-- ===================================
-- Supabase Schema: Call Schedule Tracking
-- ตารางสำหรับเก็บข้อมูลการโทรของแต่ละเซลล์ในแต่ละช่วงเวลา
-- ===================================

-- Table 1: agents (ข้อมูลเซลล์/พนักงาน)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_number VARCHAR(10) UNIQUE NOT NULL, -- เลขเซลล์ เช่น "101", "102"
  agent_name VARCHAR(100) NOT NULL, -- ชื่อเซลล์ เช่น "สา", "พัชชา"
  is_active BOOLEAN DEFAULT true, -- สถานะว่ายังใช้งานอยู่หรือไม่
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: time_slots (ช่วงเวลา)
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIME NOT NULL, -- เวลาเริ่มต้น เช่น "11:00:00"
  end_time TIME NOT NULL, -- เวลาสิ้นสุด เช่น "12:00:00"
  slot_label VARCHAR(50) NOT NULL, -- ชื่อช่วงเวลา เช่น "11-12:00 น."
  sort_order INTEGER NOT NULL, -- ลำดับการแสดงผล
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(start_time, end_time)
);

-- Table 3: call_records (บันทึกการโทรในแต่ละช่วงเวลา)
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE, -- วันที่บันทึก
  
  -- ข้อมูลการโทร
  total_calls INTEGER DEFAULT 0, -- จำนวนสายที่โทรทั้งหมด
  successful_calls INTEGER DEFAULT 0, -- จำนวนสายที่โทรสำเร็จ/รับสาย
  failed_calls INTEGER DEFAULT 0, -- จำนวนสายที่โทรไม่สำเร็จ
  
  -- สถานะการทำงาน
  status VARCHAR(50), -- สถานะ เช่น "จำนวนโทร", "จำนวนนับ", "รอสาย", "SALE ติดต่อ"
  
  -- ข้อมูลเพิ่มเติม
  notes TEXT, -- หมายเหตุเพิ่มเติม
  duration_minutes INTEGER, -- ระยะเวลารวม (นาที)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: แต่ละเซลล์ในแต่ละช่วงเวลาในแต่ละวัน มีได้แค่ 1 record
  UNIQUE(agent_id, time_slot_id, record_date)
);

-- Table 4: call_details (รายละเอียดการโทรแต่ละสาย)
CREATE TABLE IF NOT EXISTS call_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_record_id UUID NOT NULL REFERENCES call_records(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- ข้อมูลการโทร
  customer_phone VARCHAR(20), -- เบอร์ลูกค้า
  customer_name VARCHAR(100), -- ชื่อลูกค้า
  call_type VARCHAR(20) CHECK (call_type IN ('outgoing', 'incoming')), -- ประเภทการโทร
  call_status VARCHAR(20) CHECK (call_status IN ('answered', 'busy', 'no_answer', 'failed')), -- สถานะการโทร
  
  -- เวลา
  call_started_at TIMESTAMP WITH TIME ZONE, -- เวลาที่เริ่มโทร
  call_ended_at TIMESTAMP WITH TIME ZONE, -- เวลาที่จบการโทร
  call_duration_seconds INTEGER, -- ระยะเวลาการโทร (วินาที)
  
  -- ข้อมูลเพิ่มเติม
  call_notes TEXT, -- หมายเหตุการโทร
  call_result VARCHAR(50), -- ผลการโทร เช่น "ขายสำเร็จ", "ไม่สนใจ", "ติดต่อกลับ"
  
  -- Integration IDs
  yalecom_call_id VARCHAR(100), -- ID จาก Yalecom API
  robocall_id INTEGER, -- ID จาก Robocall API
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- Indexes สำหรับ Performance
-- ===================================

CREATE INDEX idx_call_records_agent_date ON call_records(agent_id, record_date);
CREATE INDEX idx_call_records_time_slot ON call_records(time_slot_id, record_date);
CREATE INDEX idx_call_records_date ON call_records(record_date DESC);
CREATE INDEX idx_call_details_call_record ON call_details(call_record_id);
CREATE INDEX idx_call_details_agent ON call_details(agent_id);
CREATE INDEX idx_call_details_started_at ON call_details(call_started_at DESC);
CREATE INDEX idx_agents_number ON agents(agent_number);

-- ===================================
-- Row Level Security (RLS)
-- ===================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_details ENABLE ROW LEVEL SECURITY;

-- Policy: อนุญาตให้อ่านได้ทุกคน
CREATE POLICY "Allow public read access" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON call_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON call_details FOR SELECT USING (true);

-- Policy: อนุญาตให้ authenticated users แก้ไขได้
CREATE POLICY "Allow authenticated insert" ON call_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON call_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON call_records FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON call_details FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON call_details FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON call_details FOR DELETE USING (auth.role() = 'authenticated');

-- ===================================
-- Triggers สำหรับ Updated At
-- ===================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_records_updated_at BEFORE UPDATE ON call_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_details_updated_at BEFORE UPDATE ON call_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Initial Data: Agents (เซลล์)
-- ===================================

INSERT INTO agents (agent_number, agent_name) VALUES
  ('101', 'สา'),
  ('102', 'พัดชา'),
  ('103', 'ตั้งโอ๋'),
  ('104', 'Test'),
  ('105', 'จีน'),
  ('106', 'มุก'),
  ('107', 'เจ'),
  ('108', 'ว่าน')
ON CONFLICT (agent_number) DO NOTHING;

-- ===================================
-- Initial Data: Time Slots (ช่วงเวลา)
-- ===================================

INSERT INTO time_slots (start_time, end_time, slot_label, sort_order) VALUES
  ('11:00:00', '12:00:00', '11-12:00 น.', 1),
  ('12:00:00', '13:00:00', '12-13:00 น.', 2),
  ('13:00:00', '14:00:00', '13-14:00 น.', 3),
  ('15:00:00', '16:00:00', '15-16:00 น.', 4),
  ('16:00:00', '17:00:00', '16-17:00 น.', 5),
  ('17:00:00', '18:00:00', '17-18:00 น.', 6)
ON CONFLICT (start_time, end_time) DO NOTHING;

-- ===================================
-- Views สำหรับการดึงข้อมูล
-- ===================================

-- View: ดูภาพรวมการโทรของแต่ละเซลล์ในแต่ละช่วงเวลา
CREATE OR REPLACE VIEW v_call_schedule AS
SELECT 
  cr.id,
  cr.record_date,
  a.agent_number,
  a.agent_name,
  ts.slot_label,
  ts.start_time,
  ts.end_time,
  cr.total_calls,
  cr.successful_calls,
  cr.failed_calls,
  cr.status,
  cr.duration_minutes,
  cr.notes,
  cr.created_at,
  cr.updated_at
FROM call_records cr
JOIN agents a ON cr.agent_id = a.id
JOIN time_slots ts ON cr.time_slot_id = ts.id
ORDER BY cr.record_date DESC, ts.sort_order, a.agent_number;

-- View: สรุปการโทรรายวัน
CREATE OR REPLACE VIEW v_daily_call_summary AS
SELECT 
  cr.record_date,
  a.agent_number,
  a.agent_name,
  SUM(cr.total_calls) as total_calls,
  SUM(cr.successful_calls) as successful_calls,
  SUM(cr.failed_calls) as failed_calls,
  SUM(cr.duration_minutes) as total_duration_minutes,
  COUNT(DISTINCT cr.time_slot_id) as time_slots_worked
FROM call_records cr
JOIN agents a ON cr.agent_id = a.id
GROUP BY cr.record_date, a.agent_number, a.agent_name
ORDER BY cr.record_date DESC, a.agent_number;

-- View: สรุปการโทรตามช่วงเวลา
CREATE OR REPLACE VIEW v_time_slot_summary AS
SELECT 
  ts.slot_label,
  ts.start_time,
  ts.end_time,
  cr.record_date,
  COUNT(DISTINCT cr.agent_id) as active_agents,
  SUM(cr.total_calls) as total_calls,
  SUM(cr.successful_calls) as successful_calls,
  SUM(cr.failed_calls) as failed_calls,
  AVG(cr.duration_minutes) as avg_duration_minutes
FROM time_slots ts
LEFT JOIN call_records cr ON ts.id = cr.time_slot_id
GROUP BY ts.slot_label, ts.start_time, ts.end_time, cr.record_date, ts.sort_order
ORDER BY cr.record_date DESC, ts.sort_order;

-- ===================================
-- Functions สำหรับการทำงาน
-- ===================================

-- Function: สร้าง/อัพเดท call record
CREATE OR REPLACE FUNCTION upsert_call_record(
  p_agent_number VARCHAR,
  p_slot_label VARCHAR,
  p_record_date DATE,
  p_total_calls INTEGER DEFAULT NULL,
  p_successful_calls INTEGER DEFAULT NULL,
  p_failed_calls INTEGER DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_agent_id UUID;
  v_time_slot_id UUID;
  v_call_record_id UUID;
BEGIN
  -- หา agent_id
  SELECT id INTO v_agent_id FROM agents WHERE agent_number = p_agent_number;
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'Agent not found: %', p_agent_number;
  END IF;
  
  -- หา time_slot_id
  SELECT id INTO v_time_slot_id FROM time_slots WHERE slot_label = p_slot_label;
  IF v_time_slot_id IS NULL THEN
    RAISE EXCEPTION 'Time slot not found: %', p_slot_label;
  END IF;
  
  -- Insert หรือ Update
  INSERT INTO call_records (
    agent_id,
    time_slot_id,
    record_date,
    total_calls,
    successful_calls,
    failed_calls,
    status,
    notes
  ) VALUES (
    v_agent_id,
    v_time_slot_id,
    p_record_date,
    COALESCE(p_total_calls, 0),
    COALESCE(p_successful_calls, 0),
    COALESCE(p_failed_calls, 0),
    p_status,
    p_notes
  )
  ON CONFLICT (agent_id, time_slot_id, record_date) 
  DO UPDATE SET
    total_calls = COALESCE(p_total_calls, call_records.total_calls),
    successful_calls = COALESCE(p_successful_calls, call_records.successful_calls),
    failed_calls = COALESCE(p_failed_calls, call_records.failed_calls),
    status = COALESCE(p_status, call_records.status),
    notes = COALESCE(p_notes, call_records.notes),
    updated_at = NOW()
  RETURNING id INTO v_call_record_id;
  
  RETURN v_call_record_id;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Sample Queries
-- ===================================

-- Query 1: ดูข้อมูลการโทรวันนี้ทั้งหมด
-- SELECT * FROM v_call_schedule WHERE record_date = CURRENT_DATE;

-- Query 2: ดูสรุปการโทรรายวันของเซลล์ 101
-- SELECT * FROM v_daily_call_summary WHERE agent_number = '101';

-- Query 3: ดูสรุปการโทรตามช่วงเวลา
-- SELECT * FROM v_time_slot_summary WHERE record_date = CURRENT_DATE;

-- Query 4: Insert/Update การโทรของเซลล์ 101 ในช่วง 11-12:00 น.
-- SELECT upsert_call_record('101', '11-12:00 น.', CURRENT_DATE, 10, 8, 2, 'จำนวนโทร', 'โทรไปครบแล้ว');

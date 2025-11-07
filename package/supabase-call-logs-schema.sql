-- ====================================
-- Supabase Schema: Call Logs System
-- ====================================

-- 1. ตาราง agents - เก็บข้อมูล Agent
CREATE TABLE IF NOT EXISTS public.agents (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(10) UNIQUE NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ตาราง call_logs - เก็บ log การโทรแต่ละครั้ง
CREATE TABLE IF NOT EXISTS public.call_logs (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(10) NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  customer_phone VARCHAR(20),
  customer_name VARCHAR(255),
  call_type VARCHAR(20) CHECK (call_type IN ('outgoing', 'incoming', 'missed')) DEFAULT 'outgoing',
  call_status VARCHAR(20) CHECK (call_status IN ('ringing', 'answered', 'busy', 'no_answer', 'failed')) DEFAULT 'ringing',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ตาราง hourly_call_stats - สรุปจำนวนการโทรแยกตามชั่วโมง
CREATE TABLE IF NOT EXISTS public.hourly_call_stats (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(10) NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour_slot VARCHAR(20) NOT NULL, -- เช่น '11-12', '12-13', '13-14'
  outgoing_calls INTEGER DEFAULT 0,
  incoming_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date, hour_slot)
);

-- 4. สร้าง indexes เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX idx_call_logs_start_time ON public.call_logs(start_time);
CREATE INDEX idx_call_logs_agent_date ON public.call_logs(agent_id, DATE(start_time));
CREATE INDEX idx_hourly_stats_agent_date ON public.hourly_call_stats(agent_id, date);

-- 5. Function: อัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Triggers สำหรับ updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hourly_stats_updated_at BEFORE UPDATE ON public.hourly_call_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Function: คำนวณและอัพเดท hourly_call_stats
CREATE OR REPLACE FUNCTION update_hourly_call_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
  v_hour INTEGER;
  v_hour_slot VARCHAR(20);
BEGIN
  -- ดึงวันที่และชั่วโมงจาก start_time
  v_date := DATE(NEW.start_time);
  v_hour := EXTRACT(HOUR FROM NEW.start_time);
  
  -- สร้าง hour_slot (เช่น 11-12, 12-13)
  v_hour_slot := v_hour || '-' || (v_hour + 1);
  
  -- อัพเดทหรือสร้างข้อมูลใน hourly_call_stats
  INSERT INTO public.hourly_call_stats (
    agent_id, 
    date, 
    hour_slot,
    outgoing_calls,
    incoming_calls,
    successful_calls,
    total_duration_seconds
  )
  VALUES (
    NEW.agent_id,
    v_date,
    v_hour_slot,
    CASE WHEN NEW.call_type = 'outgoing' THEN 1 ELSE 0 END,
    CASE WHEN NEW.call_type = 'incoming' THEN 1 ELSE 0 END,
    CASE WHEN NEW.call_status = 'answered' THEN 1 ELSE 0 END,
    COALESCE(NEW.duration_seconds, 0)
  )
  ON CONFLICT (agent_id, date, hour_slot)
  DO UPDATE SET
    outgoing_calls = public.hourly_call_stats.outgoing_calls + 
      CASE WHEN NEW.call_type = 'outgoing' THEN 1 ELSE 0 END,
    incoming_calls = public.hourly_call_stats.incoming_calls + 
      CASE WHEN NEW.call_type = 'incoming' THEN 1 ELSE 0 END,
    successful_calls = public.hourly_call_stats.successful_calls + 
      CASE WHEN NEW.call_status = 'answered' THEN 1 ELSE 0 END,
    total_duration_seconds = public.hourly_call_stats.total_duration_seconds + 
      COALESCE(NEW.duration_seconds, 0),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger: อัพเดท hourly_call_stats เมื่อมีการเพิ่ม call_logs
CREATE TRIGGER trigger_update_hourly_stats
AFTER INSERT ON public.call_logs
FOR EACH ROW EXECUTE FUNCTION update_hourly_call_stats();

-- 9. เพิ่มข้อมูล Agents เริ่มต้น (101-108)
INSERT INTO public.agents (agent_id, agent_name) VALUES
  ('101', 'สา'),
  ('102', 'พัชชา'),
  ('103', 'ตั้งโอ๋'),
  ('104', 'Test'),
  ('105', 'จีน'),
  ('106', 'มุก'),
  ('107', 'เจ'),
  ('108', 'ว่าน')
ON CONFLICT (agent_id) DO NOTHING;

-- 10. View: สรุปการโทรรายวัน
CREATE OR REPLACE VIEW public.daily_call_summary AS
SELECT 
  cl.agent_id,
  a.agent_name,
  DATE(cl.start_time) as call_date,
  COUNT(*) as total_calls,
  COUNT(CASE WHEN cl.call_type = 'outgoing' THEN 1 END) as outgoing_calls,
  COUNT(CASE WHEN cl.call_type = 'incoming' THEN 1 END) as incoming_calls,
  COUNT(CASE WHEN cl.call_status = 'answered' THEN 1 END) as successful_calls,
  SUM(cl.duration_seconds) as total_duration_seconds,
  ROUND(AVG(cl.duration_seconds)::numeric, 2) as avg_duration_seconds
FROM public.call_logs cl
JOIN public.agents a ON cl.agent_id = a.agent_id
GROUP BY cl.agent_id, a.agent_name, DATE(cl.start_time);

-- 11. View: ตารางสรุปการโทรตามชั่วโมง (สำหรับแสดงในตาราง)
CREATE OR REPLACE VIEW public.hourly_call_matrix AS
SELECT 
  hcs.date,
  hcs.hour_slot,
  jsonb_object_agg(
    hcs.agent_id,
    jsonb_build_object(
      'agent_name', a.agent_name,
      'outgoing_calls', hcs.outgoing_calls,
      'incoming_calls', hcs.incoming_calls,
      'successful_calls', hcs.successful_calls,
      'total_duration_seconds', hcs.total_duration_seconds
    )
  ) as agents_data
FROM public.hourly_call_stats hcs
JOIN public.agents a ON hcs.agent_id = a.agent_id
GROUP BY hcs.date, hcs.hour_slot
ORDER BY hcs.date DESC, hcs.hour_slot;

-- 12. Function: ดึงข้อมูลตารางสำหรับวันที่กำหนด
CREATE OR REPLACE FUNCTION get_call_matrix_for_date(target_date DATE)
RETURNS TABLE (
  hour_slot VARCHAR(20),
  agent_101 INTEGER,
  agent_102 INTEGER,
  agent_103 INTEGER,
  agent_104 INTEGER,
  agent_105 INTEGER,
  agent_106 INTEGER,
  agent_107 INTEGER,
  agent_108 INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hcs.hour_slot,
    MAX(CASE WHEN hcs.agent_id = '101' THEN hcs.outgoing_calls ELSE 0 END) as agent_101,
    MAX(CASE WHEN hcs.agent_id = '102' THEN hcs.outgoing_calls ELSE 0 END) as agent_102,
    MAX(CASE WHEN hcs.agent_id = '103' THEN hcs.outgoing_calls ELSE 0 END) as agent_103,
    MAX(CASE WHEN hcs.agent_id = '104' THEN hcs.outgoing_calls ELSE 0 END) as agent_104,
    MAX(CASE WHEN hcs.agent_id = '105' THEN hcs.outgoing_calls ELSE 0 END) as agent_105,
    MAX(CASE WHEN hcs.agent_id = '106' THEN hcs.outgoing_calls ELSE 0 END) as agent_106,
    MAX(CASE WHEN hcs.agent_id = '107' THEN hcs.outgoing_calls ELSE 0 END) as agent_107,
    MAX(CASE WHEN hcs.agent_id = '108' THEN hcs.outgoing_calls ELSE 0 END) as agent_108
  FROM public.hourly_call_stats hcs
  WHERE hcs.date = target_date
  GROUP BY hcs.hour_slot
  ORDER BY hcs.hour_slot;
END;
$$ LANGUAGE plpgsql;

-- 13. Enable Row Level Security (RLS) - ถ้าต้องการความปลอดภัย
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hourly_call_stats ENABLE ROW LEVEL SECURITY;

-- 14. Policy: อนุญาตให้ทุกคนอ่านได้ (แก้ไขตามความต้องการ)
CREATE POLICY "Allow public read access on agents" ON public.agents
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on call_logs" ON public.call_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on hourly_call_stats" ON public.hourly_call_stats
  FOR SELECT USING (true);

-- 15. Policy: อนุญาตให้ authenticated users เขียนได้
CREATE POLICY "Allow authenticated insert on call_logs" ON public.call_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on call_logs" ON public.call_logs
  FOR UPDATE TO authenticated USING (true);

-- ====================================
-- ตัวอย่างการใช้งาน
-- ====================================

-- เพิ่ม log การโทร
-- INSERT INTO public.call_logs (agent_id, customer_phone, customer_name, call_type, call_status, start_time, end_time, duration_seconds)
-- VALUES ('101', '0812345678', 'ลูกค้า A', 'outgoing', 'answered', '2025-11-07 11:30:00', '2025-11-07 11:35:00', 300);

-- ดูข้อมูลตารางสำหรับวันนี้
-- SELECT * FROM get_call_matrix_for_date('2025-11-07');

-- ดูสรุปรายวัน
-- SELECT * FROM public.daily_call_summary WHERE call_date = '2025-11-07';

COMMENT ON TABLE public.agents IS 'ตารางเก็บข้อมูล Agent (101-108)';
COMMENT ON TABLE public.call_logs IS 'ตารางเก็บ log การโทรทุกครั้ง';
COMMENT ON TABLE public.hourly_call_stats IS 'ตารางสรุปจำนวนการโทรแบ่งตามชั่วโมง';
COMMENT ON VIEW public.daily_call_summary IS 'View สรุปการโทรรายวัน';
COMMENT ON VIEW public.hourly_call_matrix IS 'View ตารางแสดงข้อมูลการโทรแบบ Matrix';

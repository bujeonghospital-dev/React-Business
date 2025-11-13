-- ====================================
-- Fix RLS Policies for Call Logs
-- ====================================

-- ลบ policy เดิมที่ใช้ authenticated
DROP POLICY IF EXISTS "Allow authenticated insert on call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow authenticated update on call_logs" ON public.call_logs;

-- สร้าง policy ใหม่ที่อนุญาตทุกคน (anon + authenticated)
-- สำหรับ Development - ใช้งานง่าย
CREATE POLICY "Allow all insert on call_logs" ON public.call_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on call_logs" ON public.call_logs
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on call_logs" ON public.call_logs
  FOR DELETE USING (true);

-- เพิ่ม policy สำหรับ hourly_call_stats (เพราะ trigger จะอัพเดทตารางนี้)
CREATE POLICY "Allow all insert on hourly_call_stats" ON public.hourly_call_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on hourly_call_stats" ON public.hourly_call_stats
  FOR UPDATE USING (true);

-- ====================================
-- ✅ รัน SQL นี้แล้วลอง POST ข้อมูลใหม่อีกครั้ง
-- ====================================

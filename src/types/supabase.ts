// Supabase Types for film_data table

export interface FilmData {
  id: number;
  status: string | null; // สถานะลูกค้า เช่น ไม่สนใจ, ติดตาม, เป็นลูกค้าแล้ว
  source: string | null; // แหล่งที่มา เช่น Facebook, Offline, Tiktok
  interested_product: string | null; // ผลิตภัณฑ์ที่สนใจ
  doctor: string | null; // หมอ
  contact_person: string | null; // ผู้ติดต่อ
  customer_name: string | null; // ชื่อลูกค้า
  phone_number: string | null; // เบอร์โทรศัพท์
  notes: string | null; // หมายเหตุและประวัติการติดต่อ
  last_follow_up_date: string | null; // วันที่ติดตามครั้งล่าสุด (DATE)
  next_follow_up_date: string | null; // วันที่ติดตามครั้งถัดไป (DATE)
  consult_date: string | null; // วันที่ Consult (DATE)
  surgery_date: string | null; // วันที่ผ่าตัด (DATE)
  appointment_time: string | null; // เวลาที่นัด (TIME)
  date_received_contact: string | null; // วันที่ได้ชื่อ เบอร์ (DATE)
  date_consult_scheduled: string | null; // วันที่ได้นัด consult (DATE)
  date_surgery_scheduled: string | null; // วันที่ได้นัดผ่าตัด (DATE)
  proposed_amount: string | null; // ยอดนำเสนอ
  customer_code: string | null; // รหัสลูกค้า
  starred: string | null; // ติดดาว
  country: string | null; // ประเทศ
  pickup_time: number | null; // เวลาให้เรียกรถ
  latitude: number | null; // พิกัด Latitude
  longitude: number | null; // พิกัด Longitude
  created_at: string; // วันเวลาที่สร้างระเบียน (Auto)
  updated_at: string; // วันเวลาที่แก้ไขล่าสุด (Auto)
}

// Type for Surgery Schedule compatible with existing code
export interface SurgeryScheduleFromSupabase {
  หมอ: string;
  ผู้ติดต่อ: string;
  ชื่อ: string;
  เบอร์โทร: string;
  วันที่ได้นัดผ่าตัด: string;
  เวลาที่นัด: string;
  ยอดนำเสนอ: string;
  วันที่ผ่าตัด?: string; // Optional field for L table
  date_consult_scheduled?: string; // วันที่ได้นัด consult (English key)
  contact_person?: string; // ผู้ติดต่อ (English key)
  date_surgery_scheduled?: string; // วันที่ได้นัดผ่าตัด (English key)
  surgery_date?: string; // วันที่ผ่าตัด (English key)
}

// Helper function to convert FilmData to SurgeryScheduleFromSupabase
export function convertFilmDataToSurgerySchedule(
  filmData: FilmData
): SurgeryScheduleFromSupabase {
  return {
    หมอ: filmData.doctor || "",
    ผู้ติดต่อ: filmData.contact_person || "",
    ชื่อ: filmData.customer_name || "",
    เบอร์โทร: filmData.phone_number || "",
    วันที่ได้นัดผ่าตัด: filmData.date_surgery_scheduled || "",
    เวลาที่นัด: filmData.appointment_time || "",
    ยอดนำเสนอ: filmData.proposed_amount || "",
    วันที่ผ่าตัด: filmData.surgery_date || "",
    date_consult_scheduled: filmData.date_consult_scheduled || "",
    contact_person: filmData.contact_person || "",
    date_surgery_scheduled: filmData.date_surgery_scheduled || "",
    surgery_date: filmData.surgery_date || "",
  };
}

export interface Appointment {
  record_no?: number;
  appoint_code: string;
  code?: string | null; // customer cn
  cn?: string | null;
  prefix?: string | null;
  name?: string | null;
  surname?: string | null;
  nickname?: string | null;
  display_name?: string | null;
  mobilephone?: string | null;
  doctor_code?: string | null;
  doctor_name?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  activity?: string | null;
  note?: string | null;
  status?: string | null;
  vn?: string | null;
  dest_name?: string | null;
  organize?: string | null;
  bind_code?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

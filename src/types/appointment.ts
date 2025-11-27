export interface Appointment {
  record_no: number;
  code: string;
  appoint_code: string;
  register_date: string | null;
  start_date: string | null;
  end_date: string | null;
  prefix: string | null;
  name: string | null;
  surname: string | null;
  nickname: string | null;
  display_name: string | null;
  mobilephone: string | null;
  email: string | null;
  activity: string | null;
  note: string | null;
  doctor_code: string | null;
  doctor_name: string | null;
  dest_code: string | null;
  dest_name: string | null;
  organize: string | null;
  bind_code: string | null;
  bind_date: string | null;
  vn: string | null;
}

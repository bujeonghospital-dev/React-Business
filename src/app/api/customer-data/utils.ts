import type { FieldDef } from "pg";

export const columnMapping: Record<string, string> = {
  id: "id",
  id_all: "id_all",
  status: "สถานะ",
  source: "แหล่งที่มา",
  interested_product: "ผลิตภัณฑ์ที่สนใจ",
  doctor: "หมอ",
  contact_staff: "ผู้ติดต่อ",
  customer_name: "ชื่อ",
  phone: "เบอร์โทร",
  note: "หมายเหตุ",
  last_followup: "วันที่ติดตามครั้งล่าสุด",
  next_followup: "วันที่ติดตามครั้งถัดไป",
  consult_date: "วันที่ Consult",
  surgery_date: "วันที่ผ่าตัด",
  appointment_time: "เวลาที่นัด",
  got_contact_date: "วันที่ได้ชื่อ เบอร์",
  booked_consult_date: "วันที่ได้นัด consult",
  booked_surgery_date: "วันที่ได้นัดผ่าตัด",
  proposed_amount: "ยอดนำเสนอ",
  customer_code: "รหัสลูกค้า",
  star_flag: "ติดดาว",
  country: "ประเทศ",
  car_call_time: "เวลาให้เรียกรถ",
  lat: "Lat",
  long: "Long",
  photo_note: "รูป",
  gender: "เพศ",
  age: "อายุ",
  occupation: "อาชีพ",
  from_province: "มาจากจังหวัด",
  travel_method: "จะเดินทางมารพ.ยังไง",
  contact_prefer_date: "วันที่สะดวกให้ติดต่อ",
  contact_prefer_time: "ช่วงเวลาที่สะดวกให้ติดต่อ",
  free_program: "โครงการฟรี",
  event_id: "Event ID",
  html_link: "htmlLink",
  ical_uid: "iCalUID",
  log: "Log",
  doc_calendar: "Doc Calendar",
  doc_event_id: "Doc Event ID",
  doc_html_link: "Doc htmlLink",
  doc_ical_uid: "Doc iCalUID",
  line_note: "line",
  line_doctor_note: "line หมอ",
  ivr: "IVR",
  transfer_to: "TRANSFER_TO",
  status_call: "status_call",
  created_at: "created_at",
  updated_at: "updated_at",
};

export const reverseColumnMapping: Record<string, string> = Object.entries(
  columnMapping
).reduce((acc, [eng, thai]) => {
  acc[thai] = eng;
  return acc;
}, {} as Record<string, string>);

const mapFieldNameToThai = (fieldName: string) => columnMapping[fieldName] || fieldName;

export const getThaiHeaders = (fields: FieldDef[]) =>
  fields.map((field) => mapFieldNameToThai(field.name));

export const mapRowsToThai = (rows: Record<string, any>[], fields: FieldDef[]) =>
  rows.map((row) => {
    const rowObj: Record<string, any> = {};
    fields.forEach((field, index) => {
      const thaiColumnName = mapFieldNameToThai(field.name);
      rowObj[thaiColumnName] = row[field.name];
    });
    return rowObj;
  });

export const getLatestUpdatedAt = (rows: Record<string, any>[]) => {
  let latest: string | null = null;
  rows.forEach((row) => {
    if (row.updated_at) {
      const date = new Date(row.updated_at);
      if (!Number.isNaN(date.getTime())) {
        const iso = date.toISOString();
        if (!latest || iso > latest) {
          latest = iso;
        }
      }
    }
  });
  return latest;
};

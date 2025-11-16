import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Mapping ชื่อคอลัมน์จากภาษาอังกฤษ (ในฐานข้อมูล) เป็นภาษาไทย (สำหรับ UI)
const columnMapping: Record<string, string> = {
  id: "id",
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

// Reverse mapping สำหรับแปลงกลับจากภาษาไทยเป็นภาษาอังกฤษ
const reverseColumnMapping: Record<string, string> = Object.entries(
  columnMapping
).reduce((acc, [eng, thai]) => {
  acc[thai] = eng;
  return acc;
}, {} as Record<string, string>);

export async function GET(request: NextRequest) {
  try {
    // ดึงข้อมูลทั้งหมดจากตาราง bjh_all_leads ใน schema BJH-Server
    const result = await pool.query(
      'SELECT * FROM "BJH-Server".bjh_all_leads ORDER BY id DESC'
    );

    const customers = result.rows;

    // แปลงชื่อคอลัมน์เป็นภาษาไทย
    const thaiHeaders = result.fields.map(
      (field) => columnMapping[field.name] || field.name
    );

    // แปลงข้อมูลให้อยู่ในรูปแบบที่หน้า customer-all-data ต้องการ
    const data = [
      thaiHeaders,
      ...customers.map((row) => result.fields.map((field) => row[field.name])),
    ];

    return NextResponse.json({
      success: true,
      data: {
        all_data: data,
      },
      totalRecords: customers.length,
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from database",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === "update") {
      // อัพเดทข้อมูลลูกค้า
      const { id, ...updateData } = data;

      // แปลงชื่อคอลัมน์จากภาษาไทยเป็นภาษาอังกฤษ
      const englishData: Record<string, any> = {};
      Object.entries(updateData).forEach(([thaiKey, value]) => {
        const englishKey = reverseColumnMapping[thaiKey] || thaiKey;
        englishData[englishKey] = value;
      });

      // สร้าง SQL query สำหรับ update
      const fields = Object.keys(englishData);
      const values = Object.values(englishData);
      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

      const query = `UPDATE "BJH-Server".bjh_all_leads SET ${setClause}, updated_at = NOW() WHERE id = $${
        fields.length + 1
      } RETURNING *`;
      const result = await pool.query(query, [...values, id]);

      return NextResponse.json({
        success: true,
        message: "Customer updated successfully",
        data: result.rows[0],
      });
    } else if (action === "create") {
      // สร้างลูกค้าใหม่
      // แปลงชื่อคอลัมน์จากภาษาไทยเป็นภาษาอังกฤษ
      const englishData: Record<string, any> = {};
      Object.entries(data).forEach(([thaiKey, value]) => {
        const englishKey = reverseColumnMapping[thaiKey] || thaiKey;
        englishData[englishKey] = value;
      });

      const fields = Object.keys(englishData);
      const values = Object.values(englishData);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

      const query = `INSERT INTO "BJH-Server".bjh_all_leads (${fields.join(
        ", "
      )}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW()) RETURNING *`;
      const result = await pool.query(query, values);

      return NextResponse.json({
        success: true,
        message: "Customer created successfully",
        data: result.rows[0],
      });
    } else if (action === "delete") {
      // ลบข้อมูลลูกค้า
      const { id } = data;
      await pool.query('DELETE FROM "BJH-Server".bjh_all_leads WHERE id = $1', [
        id,
      ]);

      return NextResponse.json({
        success: true,
        message: "Customer deleted successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process request",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

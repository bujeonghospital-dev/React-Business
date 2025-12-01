import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
// Mapping ชื่อคอลัมน์จากภาษาอังกฤษ (ในฐานข้อมูล) เป็นภาษาไทย (สำหรับ UI)
const columnMapping: Record<string, string> = {
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
// Reverse mapping สำหรับแปลงกลับจากภาษาไทยเป็นภาษาอังกฤษ
const reverseColumnMapping: Record<string, string> = Object.entries(
  columnMapping
).reduce((acc, [eng, thai]) => {
  acc[thai] = eng;
  return acc;
}, {} as Record<string, string>);
export async function GET(request: NextRequest) {
  let client;
  try {
    // ใช้ client แทน pool.query โดยตรง เพื่อควบคุม timeout ได้ดีขึ้น
    client = await pool.connect();
    // ดึงข้อมูลทั้งหมดจากตาราง bjh_all_leads ใน schema BJH-Server
    const result = await client.query(
      'SELECT *, id_all AS id FROM "BJH-Server".bjh_master_customers ORDER BY id_all DESC'
    );
    const customers = result.rows;
    // แปลงชื่อคอลัมน์เป็นภาษาไทย
    const thaiHeaders = result.fields.map(
      (field) => columnMapping[field.name] || field.name
    );
    // แปลงข้อมูลให้อยู่ในรูปแบบ { columns: [], data: [] } เหมือน Railway API
    const formattedData = customers.map((row) => {
      const rowObj: Record<string, any> = {};
      result.fields.forEach((field, index) => {
        const thaiColumnName = thaiHeaders[index];
        rowObj[thaiColumnName] = row[field.name];
      });
      return rowObj;
    });
    return NextResponse.json({
      success: true,
      columns: thaiHeaders,
      data: formattedData,
      totalRecords: customers.length,
      source: `${process.env.DB_HOST || "n8n.bjhbangkok.com"}:${
        process.env.DB_PORT || "5432"
      }`,
    });
  } catch (error: any) {
    console.error("Database error:", error);
    console.error("DB_HOST:", process.env.DB_HOST || "192.168.1.19");
    console.error("Error code:", error.code);
    // ให้ข้อความที่ชัดเจนกว่า
    let errorMessage = "Failed to connect to database";
    if (error.code === "ETIMEDOUT" || error.message.includes("timeout")) {
      errorMessage =
        "Database connection timeout. กรุณาตรวจสอบ DB_HOST environment variable หรือ migrate ไปยัง Supabase";
    } else if (error.code === "ENOTFOUND") {
      errorMessage =
        "Database host not found. กรุณาตรวจสอบ DB_HOST environment variable";
    }
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
        code: error.code,
        host: process.env.DB_HOST || "192.168.1.19",
      },
      { status: 500 }
    );
  } finally {
    // Release client กลับไปยัง pool
    if (client) {
      client.release();
    }
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
        // กรองฟิลด์ที่ไม่ควรอัปเดต
        if (
          englishKey !== "id" &&
          englishKey !== "created_at" &&
          englishKey !== "updated_at"
        ) {
          englishData[englishKey] = value;
        }
      });
      // สร้าง SQL query สำหรับ update
      const fields = Object.keys(englishData);
      const values = Object.values(englishData);
      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");
      const primaryKeyColumn = "id_all";
      const query = `UPDATE "BJH-Server".bjh_master_customers SET ${setClause} WHERE ${primaryKeyColumn} = $${
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
      try {
        // แปลงชื่อคอลัมน์จากภาษาไทยเป็นภาษาอังกฤษ
        const englishData: Record<string, any> = {};
        Object.entries(data).forEach(([thaiKey, value]) => {
          const englishKey = reverseColumnMapping[thaiKey] || thaiKey;
          // กรอง id, created_at, updated_at ออก เพื่อให้ database สร้างให้เอง
          if (
            englishKey !== "id" &&
            englishKey !== "created_at" &&
            englishKey !== "updated_at" &&
            value !== "" &&
            value !== null &&
            value !== undefined
          ) {
            englishData[englishKey] = value;
          }
        });

        // If no fields to insert, return error
        if (Object.keys(englishData).length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "ไม่มีข้อมูลที่จะเพิ่ม กรุณากรอกข้อมูลอย่างน้อย 1 ฟิลด์",
            },
            { status: 400 }
          );
        }

        const fields = Object.keys(englishData);
        const values = Object.values(englishData);
        const placeholders = fields
          .map((_, index) => `$${index + 1}`)
          .join(", ");
        const query = `INSERT INTO "BJH-Server".bjh_master_customers (${fields.join(
          ", "
        )}) VALUES (${placeholders}) RETURNING *`;

        console.log("Inserting with fields:", fields);
        console.log("Values:", values);

        const result = await pool.query(query, values);
        return NextResponse.json({
          success: true,
          message: "Customer created successfully",
          data: result.rows[0],
        });
      } catch (insertError: any) {
        console.error("Insert error:", insertError);

        // Check if it's a duplicate key error
        if (insertError.code === "23505") {
          return NextResponse.json(
            {
              success: false,
              error: "ข้อมูลซ้ำ กรุณาตรวจสอบข้อมูลก่อนส่ง",
              code: "DUPLICATE_ENTRY",
              details: insertError.message,
            },
            { status: 409 }
          );
        }

        throw insertError;
      }
    } else if (action === "delete") {
      // ลบข้อมูลลูกค้า
      const { id } = data;
      await pool.query('DELETE FROM "BJH-Server".bjh_master_customers WHERE id_all = $1', [
        id,
      ]);
      return NextResponse.json({
        success: true,
        message: "Customer deleted successfully",
      });
    } else if (action === "deleteMultiple") {
      // ลบข้อมูลลูกค้าหลายรายการพร้อมกัน
      const { ids } = data;

      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, error: "กรุณาระบุ ID ที่ต้องการลบ" },
          { status: 400 }
        );
      }

      // สร้าง placeholders สำหรับ SQL query ($1, $2, $3, ...)
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
      const query = `DELETE FROM "BJH-Server".bjh_master_customers WHERE id_all IN (${placeholders}) RETURNING id_all AS id`;

      const result = await pool.query(query, ids);

      return NextResponse.json({
        success: true,
        message: `ลบข้อมูลสำเร็จ ${result.rowCount} รายการ`,
        deletedCount: result.rowCount,
        deletedIds: result.rows.map((row) => row.id),
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

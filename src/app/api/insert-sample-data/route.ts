import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // ข้อมูลตัวอย่าง
    const sampleData = [
      {
        status: "ติดตาม",
        source: "Facebook Ads",
        interested_product: "ตาสองชั้น",
        doctor: "หมออ้อม",
        contact_staff: "สา",
        customer_name: "ทดสอบ ลูกค้า 1",
        phone: "0812345678",
        note: "สนใจมาก ติดตามต่อ",
        next_followup: "2025-11-20",
        proposed_amount: "35000",
        gender: "หญิง",
        age: 28,
      },
      {
        status: "นัดแล้ว",
        source: "Google Ads",
        interested_product: "เสริมจมูก",
        doctor: "หมออ้อม",
        contact_staff: "เจ",
        customer_name: "ทดสอบ ลูกค้า 2",
        phone: "0823456789",
        note: "นัดวันที่ 25 พฤศจิกายน",
        consult_date: "2025-11-25",
        proposed_amount: "55000",
        gender: "หญิง",
        age: 32,
      },
      {
        status: "เป็นลูกค้าแล้ว",
        source: "Line Official",
        interested_product: "ตีตัวไล่ตัว",
        doctor: "หมออ้อม",
        contact_staff: "พิดยา",
        customer_name: "ทดสอบ ลูกค้า 3",
        phone: "0834567890",
        note: "ทำเสร็จแล้ว พอใจมาก",
        surgery_date: "2025-11-15",
        proposed_amount: "120000",
        gender: "หญิง",
        age: 35,
      },
    ];

    const insertedData = [];

    for (const customer of sampleData) {
      const fields = Object.keys(customer);
      const values = Object.values(customer);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

      const query = `
        INSERT INTO customers (${fields.join(", ")}, created_at, updated_at) 
        VALUES (${placeholders}, NOW(), NOW()) 
        RETURNING *
      `;

      const result = await pool.query(query, values);
      insertedData.push(result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: `เพิ่มข้อมูลตัวอย่าง ${insertedData.length} รายการสำเร็จ`,
      data: insertedData,
    });
  } catch (error: any) {
    console.error("Error inserting sample data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to insert sample data",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST method to insert sample data",
    instructions:
      "Send a POST request to this endpoint to add 3 sample customer records",
  });
}

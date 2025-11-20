import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับตารางบันทึกการโทรตามช่วงเวลา (user_log_robocall)
 * ดึงข้อมูลจากตาราง user_log_robocall ใน schema BJH-Server
 */

export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    const searchParams = request.nextUrl.searchParams;
    const reportDate = searchParams.get("report_date"); // วันที่ในรูปแบบ YYYY-MM-DD
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const callerId = searchParams.get("caller_id");
    const limit = searchParams.get("limit") || "1000";

    // สร้าง query พื้นฐาน
    let query = `SELECT * FROM postgres."BJH-Server".user_log_robocall`;
    const params: any[] = [];
    const conditions: string[] = [];

    // กรองตาม report_date (ถ้ามี)
    if (reportDate) {
      params.push(reportDate);
      conditions.push(`report_date = $${params.length}`);
    }

    // กรองตามช่วงวันที่ (ถ้าไม่มี report_date)
    if (!reportDate && startDate) {
      params.push(startDate);
      conditions.push(`report_date >= $${params.length}`);
    }

    if (!reportDate && endDate) {
      params.push(endDate);
      conditions.push(`report_date <= $${params.length}`);
    }

    // กรองตาม caller_id_name
    if (callerId) {
      params.push(callerId);
      conditions.push(`caller_id_name = $${params.length}`);
    }

    // รวมเงื่อนไข
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // เรียงลำดับและจำกัดจำนวน
    query += ` ORDER BY report_date DESC, caller_id_name ASC LIMIT $${
      params.length + 1
    }`;
    params.push(parseInt(limit));

    console.log("🔍 Executing query:", query);
    console.log("📊 With params:", params);

    const result = await client.query(query, params);

    return NextResponse.json({
      success: true,
      message: "ดึงข้อมูลบันทึกการโทรสำเร็จ",
      data: result.rows,
      count: result.rowCount,
      query_params: {
        report_date: reportDate,
        start_date: startDate,
        end_date: endDate,
        caller_id: callerId,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user_log_robocall:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถดึงข้อมูลบันทึกการโทรได้",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * POST - เพิ่มบันทึกการโทรใหม่
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { user_id, phone_number, call_status, call_duration, notes } = body;

    if (!user_id || !phone_number) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id และ phone_number จำเป็นต้องระบุ",
        },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO postgres."BJH-Server".user_log_robocall 
      (user_id, phone_number, call_status, call_duration, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const params = [
      user_id,
      phone_number,
      call_status || "initiated",
      call_duration || 0,
      notes || "",
    ];

    console.log("➕ Inserting new robocall log:", params);

    const result = await client.query(query, params);

    return NextResponse.json({
      success: true,
      message: "บันทึกการโทรสำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error inserting user_log_robocall:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถบันทึกข้อมูลการโทรได้",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * PUT - อัพเดทบันทึกการโทร
 */
export async function PUT(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { id, call_status, call_duration, notes } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id จำเป็นต้องระบุ",
        },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (call_status) {
      params.push(call_status);
      updates.push(`call_status = $${params.length}`);
    }

    if (call_duration !== undefined) {
      params.push(call_duration);
      updates.push(`call_duration = $${params.length}`);
    }

    if (notes !== undefined) {
      params.push(notes);
      updates.push(`notes = $${params.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่มีข้อมูลที่ต้องการอัพเดท",
        },
        { status: 400 }
      );
    }

    params.push(id);
    const query = `
      UPDATE postgres."BJH-Server".user_log_robocall 
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${params.length}
      RETURNING *
    `;

    console.log("🔄 Updating robocall log:", { id, updates });

    const result = await client.query(query, params);

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบข้อมูลที่ต้องการอัพเดท",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "อัพเดทข้อมูลสำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating user_log_robocall:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถอัพเดทข้อมูลได้",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - ลบบันทึกการโทร
 */
export async function DELETE(request: NextRequest) {
  const client = await pool.connect();

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id จำเป็นต้องระบุ",
        },
        { status: 400 }
      );
    }

    const query = `
      DELETE FROM postgres."BJH-Server".user_log_robocall 
      WHERE id = $1
      RETURNING *
    `;

    console.log("🗑️ Deleting robocall log:", id);

    const result = await client.query(query, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบข้อมูลที่ต้องการลบ",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error deleting user_log_robocall:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถลบข้อมูลได้",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

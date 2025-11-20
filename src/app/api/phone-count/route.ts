import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  let client;
  try {
    client = await pool.connect();

    // Query จากที่ user ต้องการ - นับลูกค้าที่มี tag "phone" ในวันนี้
    const result = await client.query(`
      SELECT COUNT(DISTINCT ct.customer_id) AS customers_with_phone_today
      FROM "BJH-Server".fb_customer_tags ct
      JOIN "BJH-Server".fb_tags t
        ON t.id = ct.tag_id
      WHERE t.name = 'phone'
        AND ct.assigned_at::date = CURRENT_DATE
    `);

    const count = parseInt(result.rows[0]?.customers_with_phone_today || "0");

    return NextResponse.json({
      success: true,
      count: count,
      date: new Date().toISOString().split("T")[0],
    });
  } catch (error: any) {
    console.error("Database error:", error);

    let errorMessage = "Failed to connect to database";
    if (error.code === "ETIMEDOUT" || error.message.includes("timeout")) {
      errorMessage = "Database connection timeout";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Database host not found";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

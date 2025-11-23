import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD (optional)

    client = await pool.connect();

    // Query - นับลูกค้าที่มี tag "phone" แยกตามวันที่
    let query = `
      SELECT
        ct.assigned_at::date AS date,
        COUNT(DISTINCT ct.customer_id) AS customers_with_phone
      FROM "BJH-Server".fb_customer_tags ct
      JOIN "BJH-Server".fb_tags t
        ON t.id = ct.tag_id
      WHERE t.name = 'phone'
    `;

    const queryParams: any[] = [];

    // Add date filter if provided (for single date)
    if (dateParam) {
      queryParams.push(dateParam);
      query += ` AND ct.assigned_at::date = $${queryParams.length}`;
    }

    query += `
      GROUP BY ct.assigned_at::date
      ORDER BY date DESC
    `;

    const result = await client.query(query, queryParams);

    // Convert to map for easy lookup by date (format: YYYY-MM-DD)
    const phoneCountMap: { [key: string]: number } = {};
    result.rows.forEach((row) => {
      // PostgreSQL returns date as Date object - format it properly
      const date = new Date(row.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      phoneCountMap[dateStr] = parseInt(row.customers_with_phone) || 0;
    });

    return NextResponse.json({
      success: true,
      data: phoneCountMap,
      details: result.rows,
      count: result.rows.length,
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
        data: {},
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

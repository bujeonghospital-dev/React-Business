import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT 
          source_name AS "value",
          source_name AS "label"
        FROM "BJH-Server".source_options
        ORDER BY id
      `);

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching source options:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch source options",
      },
      { status: 500 }
    );
  }
}

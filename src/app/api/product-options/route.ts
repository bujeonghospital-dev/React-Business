import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT 
          product_name AS "value",
          product_name AS "label"
        FROM "BJH-Server".product_options
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
    console.error("Error fetching product options:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product options",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { Pool } from "pg";

// Default table size options as fallback
const DEFAULT_TABLE_SIZE_OPTIONS = [
  { id: 1, size_value: 0, size_label: "ปกติ (0px)", sort_order: 1 },
  { id: 2, size_value: 200, size_label: "เล็ก (200px)", sort_order: 2 },
  { id: 3, size_value: 500, size_label: "กลาง (500px)", sort_order: 3 },
  { id: 4, size_value: 800, size_label: "ใหญ่ (800px)", sort_order: 4 },
  { id: 5, size_value: 1200, size_label: "ใหญ่มาก (1200px)", sort_order: 5 },
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function GET() {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.warn(
        "DATABASE_URL not configured, using default table size options"
      );
      return NextResponse.json({
        success: true,
        data: DEFAULT_TABLE_SIZE_OPTIONS,
      });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, size_value, size_label, sort_order 
         FROM "BJH-Server".table_size_options 
         WHERE is_active = true 
         ORDER BY sort_order ASC`
      );

      // If no data found in database, use default options
      if (result.rows.length === 0) {
        console.warn("No table size options found in database, using defaults");
        return NextResponse.json({
          success: true,
          data: DEFAULT_TABLE_SIZE_OPTIONS,
        });
      }

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching table size options:", error);
    // Return default options instead of error
    console.warn("Database error, falling back to default table size options");
    return NextResponse.json({
      success: true,
      data: DEFAULT_TABLE_SIZE_OPTIONS,
    });
  }
}

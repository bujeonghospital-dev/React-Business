import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Test connection first
    const testResult = await pool.query("SELECT 1 as test");
    console.log("✅ Database connection successful");
    // Try multiple schema name formats
    let query = `
      SELECT 
        id,
        value,
        label,
        color,
        display_order,
        is_active
      FROM status_options
      WHERE is_active = true
      ORDER BY display_order ASC
    `;
    let result;
    try {
      // Try without schema first
      result = await pool.query(query);
      console.log(`✅ Found ${result.rows.length} status options (no schema)`);
    } catch (err1) {
      console.log(
        "⚠️ Failed without schema, trying with 'BJH-Server' schema..."
      );
      try {
        // Try with BJH-Server schema
        query = `
          SELECT 
            id,
            value,
            label,
            color,
            display_order,
            is_active
          FROM "BJH-Server".status_options
          WHERE is_active = true
          ORDER BY display_order ASC
        `;
        result = await pool.query(query);
        console.log(
          `✅ Found ${result.rows.length} status options (BJH-Server schema)`
        );
      } catch (err2) {
        console.log(
          "⚠️ Failed with BJH-Server, trying with 'public' schema..."
        );
        // Try with public schema
        query = `
          SELECT 
            id,
            value,
            label,
            color,
            display_order,
            is_active
          FROM public.status_options
          WHERE is_active = true
          ORDER BY display_order ASC
        `;
        result = await pool.query(query);
        console.log(
          `✅ Found ${result.rows.length} status options (public schema)`
        );
      }
    }
    // Transform data to match the format expected by the frontend
    const statusOptions = result.rows.map((row) => ({
      value: row.value,
      label: row.label,
      color: row.color,
    }));
    return NextResponse.json({
      success: true,
      data: statusOptions,
      count: statusOptions.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching status options:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch status options",
        details: error.message || error.code || "Unknown database error",
        hint: "Check if the table 'status_options' exists and DATABASE_URL is correct",
      },
      { status: 500 }
    );
  }
}
// POST method for adding new status option
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    if (action === "create") {
      const { value, label, color, display_order } = data;
      // Insert new status option
      const query = `
        INSERT INTO "BJH-Server".status_options 
        (value, label, color, display_order, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `;
      const result = await pool.query(query, [
        value,
        label,
        color,
        display_order || 999,
      ]);
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: "Status option created successfully",
      });
    } else if (action === "update") {
      const { id, value, label, color, display_order } = data;
      // Update existing status option
      const query = `
        UPDATE "BJH-Server".status_options 
        SET value = $1, label = $2, color = $3, display_order = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;
      const result = await pool.query(query, [
        value,
        label,
        color,
        display_order,
        id,
      ]);
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: "Status option updated successfully",
      });
    } else if (action === "delete") {
      const { id } = data;
      // Soft delete - set is_active to false
      const query = `
        UPDATE "BJH-Server".status_options 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: "Status option deleted successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Use 'create', 'update', or 'delete'",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("❌ Error modifying status options:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to modify status options",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

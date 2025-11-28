import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".b_itemservice';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get("groupCode")?.trim();

    if (!groupCode) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: groupCode" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT itemcode, itemname, saleprice FROM ${TABLE} WHERE groupcode = $1 ORDER BY itemname`,
        [groupCode]
      );
      return NextResponse.json({ success: true, data: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching item services:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load item services" },
      { status: 500 }
    );
  }
}

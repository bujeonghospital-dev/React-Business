import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".b_itemgroup';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT groupcode, groupname FROM ${TABLE} ORDER BY groupname`
      );
      return NextResponse.json({ success: true, data: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching item groups:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load item groups" },
      { status: 500 }
    );
  }
}

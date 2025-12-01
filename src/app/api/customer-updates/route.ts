import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getThaiHeaders, mapRowsToThai, getLatestUpdatedAt } from "@/app/api/customer-data/utils";

const TABLE = '"BJH-Server".bjh_master_customers';
const DEFAULT_LIMIT = 200;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    if (!since) {
      return NextResponse.json({
        success: true,
        columns: [],
        data: [],
        latestUpdatedAt: null,
      });
    }

    const limit = Number(searchParams.get("limit") || DEFAULT_LIMIT);
    const result = await pool.query(
      `SELECT *, id_all AS id FROM ${TABLE} WHERE updated_at > $1 ORDER BY updated_at ASC LIMIT $2`,
      [since, limit]
    );

    const thaiHeaders = getThaiHeaders(result.fields);
    const rows = mapRowsToThai(result.rows, result.fields);
    const latestUpdatedAt = getLatestUpdatedAt(result.rows);

    return NextResponse.json({
      success: true,
      columns: thaiHeaders,
      data: rows,
      latestUpdatedAt,
    });
  } catch (error: any) {
    console.error("Error fetching customer updates:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to load realtime updates",
    }, { status: 500 });
  }
}

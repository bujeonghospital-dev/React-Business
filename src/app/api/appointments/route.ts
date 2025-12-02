import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".bjh_appointment';

const sanitizePayload = (data: Record<string, unknown> = {}) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : value;
    if (
      normalized !== "" &&
      normalized !== null &&
      normalized !== undefined
    ) {
      acc[key] = normalized as string | number;
    }
    return acc;
  }, {} as Record<string, string | number>);
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const idAll = url.searchParams.get("id_all")?.trim();
  if (!idAll) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const query = `SELECT * FROM ${TABLE} WHERE "id_all" = $1 ORDER BY "start_date" DESC`;
    const result = await pool.query(query, [idAll]);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Appointment history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "ไม่สามารถโหลดประวัตินัดหมายได้",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body?.data;
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "ข้อมูลนัดหมายไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const filtered = sanitizePayload(data as Record<string, unknown>);

    if (!filtered.id_all) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุลูกค้า (id_all) ให้ครบ" },
        { status: 400 }
      );
    }

    const fields = Object.keys(filtered);
    if (!fields.length) {
      return NextResponse.json(
        { success: false, error: "ไม่มีข้อมูลที่จะบันทึก" },
        { status: 400 }
      );
    }

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO ${TABLE} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, fields.map((field) => filtered[field]));

    return NextResponse.json({
      success: true,
      message: "บันทึกนัดหมายเรียบร้อย",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Appointment save error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "เกิดข้อผิดพลาดขณะบันทึกนัดหมาย",
      },
      { status: 500 }
    );
  }
}

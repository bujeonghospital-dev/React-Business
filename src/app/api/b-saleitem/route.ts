import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".b_saleitem';

const toNumber = (value: unknown) => {
  const numeric = typeof value === "string" ? Number(value.trim()) : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

type ServicePayload = {
  itemCode?: string | null;
  itemName?: string | null;
  unitSale?: number;
  netAmount?: number;
  saleType?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: code" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM ${TABLE} WHERE code = $1 ORDER BY sale_date DESC`,
      [code]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      totalRecords: result.rowCount,
    });
  } catch (error: any) {
    console.error("Error fetching b_saleitem records:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load b_saleitem history",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body.code ?? "").toString().trim();
    const saleCode = body.saleCode?.toString().trim() || null;
    const displayName = body.displayName?.toString().trim() || null;
    const receiptNo = body.receiptNo?.toString().trim() || null;
    const services: ServicePayload[] = Array.isArray(body.services)
      ? body.services
      : [];

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing customer code" },
        { status: 400 }
      );
    }

    if (services.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่มีรายการบริการให้บันทึก" },
        { status: 400 }
      );
    }

    const saleDateValue = new Date().toISOString();
    const columns = [
      "code",
      "sale_date",
      "receipt_no",
      "sale_code",
      "item_code",
      "item_name",
      "unit_sale",
      "quantity",
      "amount",
      "sale_type",
      "income",
      "payment",
      "cash",
      "display_name",
      "organize",
      "id_all",
    ];
    const values: any[] = [];
    const placeholders = services.map((service, index) => {
      const offset = index * columns.length;
      const quantity = 1;
      const basePrice = toNumber(service.unitSale);
      const netAmount = toNumber(service.netAmount);
      const saleTypeValue = (service.saleType ?? "20").toString();
      values.push(
        code,
        saleDateValue,
        receiptNo,
        saleCode,
        service.itemCode ?? null,
        service.itemName ?? null,
        basePrice.toString(),
        quantity,
        netAmount,
        saleTypeValue,
        netAmount,
        netAmount,
        netAmount,
        displayName,
        "OPD",
        code
      );
      const placeholdersForRow = columns
        .map((_, colIdx) => `$${offset + colIdx + 1}`)
        .join(", ");
      return `(${placeholdersForRow})`;
    });

    const query = `INSERT INTO ${TABLE} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`;
    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: `บันทึก ${result.rowCount} รายการใน b_saleitem แล้ว`,
      insertedCount: result.rowCount,
    });
  } catch (error: any) {
    console.error("Error saving b_saleitem records:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to persist b_saleitem records",
      },
      { status: 500 }
    );
  }
}

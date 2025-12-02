import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".bjh_master_customers';

// Fields that can be inserted into bjh_master_customers
const CUSTOMER_FIELDS = [
  "id_all",
  "cn",
  "code",
  "status",
  "source",
  "interested_product",
  "doctor",
  "contact_staff",
  "prefix",
  "name",
  "surname",
  "nickname",
  "gender",
  "birthdate",
  "occupation",
  "member",
  "cusgroup",
  "customer_name",
  "phone",
  "mobilephone",
  "email",
  "lineid",
  "facebook",
  "country",
  "from_province",
  "medianame",
  "disease",
  "allergic",
  "note",
  "got_contact_date",
  "last_followup",
  "next_followup",
  "consult_date",
  "surgery_date",
  "appointment_time",
  "booked_consult_date",
  "booked_surgery_date",
  "proposed_amount",
  "star_flag",
  "address",
  "province",
  "zipcode",
  "registerdate",
  "ownername",
  "binddate",
  "is_opd",
  "locno",
  "road",
  "moo",
  "tumbon",
  "amphur",
  "id_card",
];

const DATE_FIELDS = new Set([
  "birthdate",
  "got_contact_date",
  "last_followup",
  "next_followup",
  "consult_date",
  "surgery_date",
  "booked_consult_date",
  "booked_surgery_date",
  "registerdate",
  "binddate",
]);

const NUMERIC_FIELDS = new Set(["proposed_amount", "star_flag"]);

type CustomerPayload = Partial<Record<string, any>>;

function sanitizeValue(field: string, value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (DATE_FIELDS.has(field)) {
      // Only take date part (YYYY-MM-DD)
      return trimmed.slice(0, 10);
    }
    if (NUMERIC_FIELDS.has(field)) {
      const num = Number(trimmed);
      return Number.isFinite(num) ? num : null;
    }
    return trimmed;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  return DATE_FIELDS.has(field) ? String(value).slice(0, 10) : value;
}

function buildCustomerName(payload: CustomerPayload): string | null {
  if (payload.customer_name) {
    return payload.customer_name;
  }

  const pieces = [payload.prefix, payload.name, payload.surname]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  return pieces.length ? pieces.join(" ") : null;
}

function buildInsertStatement(payload: CustomerPayload) {
  const columns: string[] = [];
  const values: unknown[] = [];

  // Add customer_name if not provided
  if (!payload.customer_name) {
    payload.customer_name = buildCustomerName(payload);
  }

  // Add registerdate if not provided
  const now = new Date().toISOString();
  if (!payload.registerdate) {
    payload.registerdate = now.slice(0, 10);
  }

  // Build columns and values
  CUSTOMER_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      columns.push(`"${field}"`);
      values.push(sanitizeValue(field, payload[field]));
    }
  });

  if (columns.length === 0) {
    throw new Error("No valid fields provided");
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const query = `INSERT INTO ${TABLE} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  return { query, values };
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const payload = await request.json();

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    // Validate at least name is provided
    if (!payload.name && !payload.customer_name) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกชื่อลูกค้า",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Get max id_all and generate new one
    const maxIdResult = await client.query(
      `SELECT COALESCE(MAX(id_all), 0) + 1 as next_id FROM ${TABLE}`
    );
    const nextIdAll = maxIdResult.rows[0].next_id;

    // Add id_all to payload
    payload.id_all = nextIdAll;

    const { query, values } = buildInsertStatement(payload);

    console.log("Insert query:", query);
    console.log("Values:", values);

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Failed to insert customer");
    }

    const newCustomer = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "เพิ่มข้อมูลลูกค้าสำเร็จ",
      data: newCustomer,
      id_all: newCustomer.id_all,
    });
  } catch (error: any) {
    console.error("Error adding customer:", error);

    // Handle duplicate key error
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "ข้อมูลลูกค้าซ้ำกับที่มีอยู่แล้ว",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "ไม่สามารถเพิ่มข้อมูลลูกค้าได้",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Also support GET to check if endpoint is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Customer add API is working",
    endpoint: "/api/customer-add",
    method: "POST",
    requiredFields: ["name"],
    optionalFields: CUSTOMER_FIELDS,
  });
}

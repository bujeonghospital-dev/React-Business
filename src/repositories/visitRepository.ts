import pool from "@/lib/db";
import { Visit } from "@/types/visit";

const TABLE = '"BJH-Server".n_visit';

const VISIT_FIELDS = [
  "record_no",
  "vn",
  "cn",
  "doctor_code",
  "doctor_name",
  "start_date",
  "end_date",
  "doc_type",
  "display_name",
  "cc",
  "note_result",
  "status",
  "created_at",
  "updated_at",
];

const DATE_FIELDS = new Set([
  "start_date",
  "end_date",
  "created_at",
  "updated_at",
]);
const AUTO_GENERATED_FIELDS = new Set([
  "record_no",
  "created_at",
  "updated_at",
]);

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
      return trimmed.slice(0, 10);
    }
    return trimmed;
  }

  return DATE_FIELDS.has(field) ? String(value).slice(0, 10) : value;
}

export async function createVisit(
  visitPayload: Omit<Visit, "record_no">
): Promise<Visit> {
  const columns: string[] = [];
  const values: unknown[] = [];

  VISIT_FIELDS.forEach((field) => {
    if (AUTO_GENERATED_FIELDS.has(field)) {
      return;
    }
    const value = (visitPayload as Record<string, unknown>)[field];
    if (value !== undefined) {
      columns.push(`"${field}"`);
      values.push(sanitizeValue(field, value));
    }
  });

  if (!columns.includes('"vn"')) {
    throw new Error("Missing required field: vn");
  }

  if (!columns.includes('"cn"')) {
    throw new Error("Missing required field: cn");
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const query = `INSERT INTO ${TABLE} (${columns.join(
    ", "
  )}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0] as Visit;
  } finally {
    client.release();
  }
}

export async function getVisitByVn(vn: string): Promise<Visit | null> {
  const client = await pool.connect();
  try {
    const selectColumns = VISIT_FIELDS.map((field) => `"${field}"`).join(", ");
    const result = await client.query(
      `SELECT ${selectColumns} FROM ${TABLE} WHERE "vn" = $1 LIMIT 1`,
      [vn]
    );
    return result.rows.length > 0 ? (result.rows[0] as Visit) : null;
  } finally {
    client.release();
  }
}

export async function listVisitsByCn(cn: string): Promise<Visit[]> {
  const client = await pool.connect();
  try {
    const selectColumns = VISIT_FIELDS.map((field) => `"${field}"`).join(", ");
    const result = await client.query(
      `SELECT ${selectColumns} FROM ${TABLE} WHERE "cn" = $1 ORDER BY "start_date" DESC`,
      [cn]
    );
    return result.rows as Visit[];
  } finally {
    client.release();
  }
}

export async function updateVisit(
  vn: string,
  payload: Partial<Omit<Visit, "record_no" | "vn" | "cn">>
): Promise<Visit | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  VISIT_FIELDS.forEach((field) => {
    if (
      field === "record_no" ||
      field === "vn" ||
      field === "cn" ||
      field === "created_at" ||
      field === "updated_at"
    ) {
      return;
    }

    const value = (payload as Record<string, unknown>)[field];
    if (value !== undefined) {
      setClauses.push(`"${field}" = $${setClauses.length + 1}`);
      values.push(sanitizeValue(field, value));
    }
  });

  if (!setClauses.length) {
    return null;
  }

  // Add updated_at
  setClauses.push(`"updated_at" = NOW()`);

  const vnPlaceholder = values.length + 1;
  const query = `UPDATE ${TABLE} SET ${setClauses.join(
    ", "
  )} WHERE "vn" = $${vnPlaceholder} RETURNING *`;
  values.push(vn);

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows.length > 0 ? (result.rows[0] as Visit) : null;
  } finally {
    client.release();
  }
}

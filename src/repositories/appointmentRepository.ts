import pool from "@/lib/db";
import { Appointment } from "@/types/appointment";

const TABLE = '"BJH-Server".n_appointment';

const APPOINTMENT_FIELDS = [
  "record_no",
  "appoint_code",
  "code",
  "cn",
  "prefix",
  "name",
  "surname",
  "nickname",
  "display_name",
  "doctor_code",
  "doctor_name",
  "start_date",
  "start_time",
  "end_date",
  "end_time",
  "activity",
  "note",
  "status",
  "vn",
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
const IMMUTABLE_FIELDS = new Set(["appoint_code"]);

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

export async function getAppointmentByCode(
  appointCode: string
): Promise<Appointment | null> {
  const client = await pool.connect();
  try {
    const selectColumns = APPOINTMENT_FIELDS.map((field) => `"${field}"`).join(
      ", "
    );
    const result = await client.query(
      `SELECT ${selectColumns} FROM ${TABLE} WHERE "appoint_code" = $1 LIMIT 1`,
      [appointCode]
    );
    return result.rows.length > 0 ? (result.rows[0] as Appointment) : null;
  } finally {
    client.release();
  }
}

export async function linkVisitToAppointment(
  appointCode: string,
  vn: string
): Promise<Appointment | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE ${TABLE} SET "vn" = $1, "updated_at" = NOW() WHERE "appoint_code" = $2 RETURNING *`,
      [vn, appointCode]
    );
    return result.rows.length > 0 ? (result.rows[0] as Appointment) : null;
  } finally {
    client.release();
  }
}

export async function deleteAppointmentByCode(
  appointCode: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM ${TABLE} WHERE "appoint_code" = $1 RETURNING "appoint_code"`,
      [appointCode]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } finally {
    client.release();
  }
}

export async function updateAppointmentByCode(
  appointCode: string,
  payload: Record<string, unknown>
): Promise<Appointment | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  APPOINTMENT_FIELDS.forEach((field) => {
    if (IMMUTABLE_FIELDS.has(field) || AUTO_GENERATED_FIELDS.has(field)) {
      return;
    }

    if (payload[field] !== undefined) {
      setClauses.push(`"${field}" = $${setClauses.length + 1}`);
      values.push(sanitizeValue(field, payload[field]));
    }
  });

  if (!setClauses.length) {
    return null;
  }

  // Add updated_at
  setClauses.push(`"updated_at" = NOW()`);

  const appointCodePlaceholder = values.length + 1;
  const query = `UPDATE ${TABLE} SET ${setClauses.join(
    ", "
  )} WHERE "appoint_code" = $${appointCodePlaceholder} RETURNING *`;
  values.push(appointCode);

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows.length > 0 ? (result.rows[0] as Appointment) : null;
  } finally {
    client.release();
  }
}

export async function listAppointmentsByCn(cn: string): Promise<Appointment[]> {
  const client = await pool.connect();
  try {
    const selectColumns = APPOINTMENT_FIELDS.map((field) => `"${field}"`).join(
      ", "
    );
    const result = await client.query(
      `SELECT ${selectColumns} FROM ${TABLE} WHERE "cn" = $1 OR "code" = $1 ORDER BY "start_date" DESC, "start_time" DESC`,
      [cn]
    );
    return result.rows as Appointment[];
  } finally {
    client.release();
  }
}

export async function createAppointmentForCustomer(
  cn: string,
  payload: Record<string, unknown>
): Promise<Appointment> {
  const columns: string[] = [];
  const values: unknown[] = [];

  // Ensure cn is included
  const mergedPayload: Record<string, unknown> = { ...payload, cn, code: cn };

  // Generate appoint_code if not provided
  if (!mergedPayload.appoint_code) {
    mergedPayload.appoint_code = `APT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
  }

  APPOINTMENT_FIELDS.forEach((field) => {
    if (AUTO_GENERATED_FIELDS.has(field)) {
      return;
    }
    if (mergedPayload[field] !== undefined) {
      columns.push(`"${field}"`);
      values.push(sanitizeValue(field, mergedPayload[field]));
    }
  });

  if (!columns.includes('"appoint_code"')) {
    throw new Error("Missing required field: appoint_code");
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const query = `INSERT INTO ${TABLE} (${columns.join(
    ", "
  )}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0] as Appointment;
  } finally {
    client.release();
  }
}

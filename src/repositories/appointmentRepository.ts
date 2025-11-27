import { query } from "../db";
import { Appointment } from "../types/appointment";

const TABLE = '"BJH-Server"."b_appointment"';

const BASE_SELECT_COLUMNS: Array<keyof Appointment> = [
  "record_no",
  "code",
  "appoint_code",
  "register_date",
  "start_date",
  "end_date",
  "prefix",
  "name",
  "surname",
  "nickname",
  "display_name",
  "mobilephone",
  "email",
  "activity",
  "note",
  "doctor_code",
  "doctor_name",
  "dest_code",
  "dest_name",
  "organize",
  "bind_code",
  "bind_date",
];

const OPTIONAL_SELECT_COLUMNS: Array<keyof Appointment> = ["vn"];

let selectColumnsCache: Array<keyof Appointment> | null = null;

const formatSelectColumns = (columns: Array<keyof Appointment>) =>
  columns.map((column) => `"${column}"`).join(", ");

const getSelectColumns = async (): Promise<Array<keyof Appointment>> => {
  if (selectColumnsCache) {
    return selectColumnsCache;
  }

  let optionalColumns: Array<keyof Appointment> = [];

  try {
    const result = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'BJH-Server' AND table_name = 'b_appointment' AND column_name = ANY($1::text[])`,
      [OPTIONAL_SELECT_COLUMNS]
    );

    const available = new Set(
      result.rows
        .map((row: any) => (typeof row.column_name === "string" ? row.column_name.toLowerCase() : null))
        .filter(Boolean)
    );

    optionalColumns = OPTIONAL_SELECT_COLUMNS.filter((column) =>
      available.has(column.toLowerCase())
    );
  } catch (error) {
    console.warn(
      "Unable to inspect optional columns for b_appointment; continuing without them.",
      error
    );
  }

  selectColumnsCache = [...BASE_SELECT_COLUMNS, ...optionalColumns];
  return selectColumnsCache;
};

const isDateOnlyValue = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

type AppointmentFilters = {
  from?: string;
  to?: string;
  doctor_code?: string;
  dest_code?: string;
};

const normalizeRow = (row: any): Appointment => ({
  record_no:
    typeof row.record_no === "string"
      ? Number(row.record_no)
      : row.record_no ?? 0,
  code: row.code ?? "",
  appoint_code: row.appoint_code ?? "",
  register_date: row.register_date ?? null,
  start_date: row.start_date ?? null,
  end_date: row.end_date ?? null,
  prefix: row.prefix ?? null,
  name: row.name ?? null,
  surname: row.surname ?? null,
  nickname: row.nickname ?? null,
  display_name: row.display_name ?? null,
  mobilephone: row.mobilephone ?? null,
  email: row.email ?? null,
  activity: row.activity ?? null,
  note: row.note ?? null,
  doctor_code: row.doctor_code ?? null,
  doctor_name: row.doctor_name ?? null,
  dest_code: row.dest_code ?? null,
  dest_name: row.dest_name ?? null,
  organize: row.organize ?? null,
  bind_code: row.bind_code ?? null,
  bind_date: row.bind_date ?? null,
  vn: row.vn ?? null,
});

export async function listAppointments(
  filters: AppointmentFilters = {}
): Promise<Appointment[]> {
  const selectColumns = await getSelectColumns();
  const selectClause = formatSelectColumns(selectColumns);
  const conditions: string[] = [];
  const params: unknown[] = [];
  let index = 1;

  if (filters.from) {
    const comparisonColumn = isDateOnlyValue(filters.from)
      ? 'DATE("start_date")'
      : '"start_date"';
    conditions.push(`${comparisonColumn} >= $${index}`);
    params.push(filters.from);
    index += 1;
  }

  if (filters.to) {
    const comparisonColumn = isDateOnlyValue(filters.to)
      ? 'DATE("start_date")'
      : '"start_date"';
    conditions.push(`${comparisonColumn} <= $${index}`);
    params.push(filters.to);
    index += 1;
  }

  if (filters.doctor_code) {
    conditions.push(`"doctor_code" = $${index}`);
    params.push(filters.doctor_code);
    index += 1;
  }

  if (filters.dest_code) {
    conditions.push(`"dest_code" = $${index}`);
    params.push(filters.dest_code);
    index += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const queryText = `SELECT ${selectClause} FROM ${TABLE} ${whereClause} ORDER BY "start_date" ASC NULLS LAST`;

  const result = await query(queryText, params);
  return result.rows.map(normalizeRow);
}

export async function listAppointmentsByCn(cn: string): Promise<Appointment[]> {
  if (!cn?.trim()) {
    return [];
  }

  const selectColumns = await getSelectColumns();
  const selectClause = formatSelectColumns(selectColumns);
  const result = await query(
    `SELECT ${selectClause} FROM ${TABLE} WHERE "code" = $1 ORDER BY "start_date" DESC`,
    [cn]
  );

  return result.rows.map(normalizeRow);
}

export async function getAppointmentByCode(
  appointCode: string
): Promise<Appointment | null> {
  if (!appointCode) {
    return null;
  }

  const selectColumns = await getSelectColumns();
  const selectClause = formatSelectColumns(selectColumns);
  const result = await query(
    `SELECT ${selectClause} FROM ${TABLE} WHERE "appoint_code" = $1 LIMIT 1`,
    [appointCode]
  );

  if (!result.rows.length) {
    return null;
  }

  return normalizeRow(result.rows[0]);
}

export async function createAppointmentForCustomer(
  cn: string,
  payload: Partial<Appointment>
): Promise<Appointment> {
  if (!cn?.trim()) {
    throw new Error("Missing customer CN");
  }

  const selectColumns = await getSelectColumns();
  const selectClause = formatSelectColumns(selectColumns);
  const availableColumns = new Set(selectColumns);
  const appointmentPayload = { ...payload, code: cn };
  if (!appointmentPayload.appoint_code?.trim()) {
    throw new Error("appoint_code is required");
  }

  const entries = Object.entries(appointmentPayload).filter(
    ([field, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      return availableColumns.has(field as keyof Appointment);
    }
  );

  const columns = entries.map(([field]) => `"${field}"`).join(", ");
  const placeholders = entries.map((_, index) => `$${index + 1}`).join(", ");
  const values = entries.map(([, value]) => value);

  const result = await query(
    `INSERT INTO ${TABLE} (${columns}) VALUES (${placeholders}) RETURNING ${selectClause}`,
    values
  );

  return normalizeRow(result.rows[0]);
}

export async function updateAppointmentByCode(
  appointCode: string,
  updates: Partial<Appointment>
): Promise<Appointment | null> {
  if (!appointCode) {
    return null;
  }

  const selectColumns = await getSelectColumns();
  const selectClause = formatSelectColumns(selectColumns);
  const availableColumns = new Set(selectColumns);
  const entries = Object.entries(updates).filter(
    ([field, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      return availableColumns.has(field as keyof Appointment);
    }
  );

  if (!entries.length) {
    return getAppointmentByCode(appointCode);
  }

  const setClauses = entries.map(([field], index) => `"${field}" = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  const queryText = `UPDATE ${TABLE} SET ${setClauses.join(", ")} WHERE "appoint_code" = $${
    values.length + 1
  } RETURNING ${selectClause}`;

  const result = await query(queryText, [...values, appointCode]);
  if (!result.rows.length) {
    return null;
  }

  return normalizeRow(result.rows[0]);
}

export async function linkVisitToAppointment(
  appointCode: string,
  vn: string
): Promise<void> {
  if (!appointCode || !vn) {
    return;
  }

  const selectColumns = await getSelectColumns();
  if (!selectColumns.includes("vn")) {
    console.warn(
      'Attempted to update column "vn" on b_appointment, but the column is unavailable.'
    );
    return;
  }

  await query(`UPDATE ${TABLE} SET "vn" = $1 WHERE "appoint_code" = $2`, [vn, appointCode]);
}

export async function deleteAppointmentByCode(appointCode: string): Promise<boolean> {
  if (!appointCode) {
    return false;
  }

  const result = await query(`DELETE FROM ${TABLE} WHERE "appoint_code" = $1`, [appointCode]);
  return (result.rowCount ?? 0) > 0;
}
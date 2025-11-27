import { query } from "../db";
import { Visit } from "../types/visit";

export async function getVisitByVn(vn: string): Promise<Visit | null> {
  const result = await query<Visit>("SELECT * FROM b_visit WHERE vn = $1", [vn]);
  return result.rows[0] ?? null;
}

export async function listVisitsByCn(cn: string): Promise<Visit[]> {
  if (!cn.trim()) {
    return [];
  }
  const result = await query<Visit>(
    "SELECT * FROM b_visit WHERE cn = $1 ORDER BY start_date DESC",
    [cn]
  );
  return result.rows;
}

export async function createVisit(input: Omit<Visit, "record_no">): Promise<Visit> {
  if (!input.cn?.trim()) {
    throw new Error("cn is required to create a visit");
  }

  const entries = Object.entries(input).filter(([, value]) => value !== undefined);
  const fields = entries.map(([field]) => field);
  const columns = fields.map((field) => `"${field}"`).join(", ");
  const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");
  const values = entries.map(([, value]) => value);

  const result = await query<Visit>(
    `INSERT INTO b_visit (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function updateVisitByVn(
  vn: string,
  data: Partial<Visit>
): Promise<Visit | null> {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return getVisitByVn(vn);
  }

  const setClauses = entries.map(([field], idx) => `"${field}" = $${idx + 1}`);
  const values = entries.map(([, value]) => value);

  const result = await query<Visit>(
    `UPDATE b_visit SET ${setClauses.join(", ")} WHERE vn = $${entries.length + 1} RETURNING *`,
    [...values, vn]
  );

  return result.rows[0] ?? null;
}

export async function deleteVisitByVn(vn: string): Promise<boolean> {
  const result = await query("DELETE FROM b_visit WHERE vn = $1", [vn]);
  return result.rowCount > 0;
}

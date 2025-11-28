import pool from "./lib/db";
import type { QueryResult, QueryResultRow } from "pg";

export async function query<T extends QueryResultRow = any>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}

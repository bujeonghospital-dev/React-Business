import pool from "./lib/db";
import type { QueryResult } from "pg";

export async function query<T>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}

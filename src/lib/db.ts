import { Pool } from "pg";

// สร้าง connection pool สำหรับ PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "192.168.1.19",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Bjh12345!!",
  database: process.env.DB_NAME || "postgres",
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // เพิ่มเป็น 10 วินาที
  statement_timeout: 30000, // Query timeout 30 วินาที
  query_timeout: 30000,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ตรวจสอบการเชื่อมต่อ
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
  console.log(`Host: ${process.env.DB_HOST || "192.168.1.19"}`);
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  console.error(
    `Failed to connect to: ${process.env.DB_HOST || "192.168.1.19"}`
  );
  // ไม่ exit ใน production เพื่อให้ retry ได้
  if (process.env.NODE_ENV !== "production") {
    process.exit(-1);
  }
});

export default pool;

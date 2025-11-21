import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds
/**
 * GET /api/n-clinic-db
 * ดึงข้อมูลรายรับจาก n_income + n_customer + n_staff (sale_date <= วันนี้)
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const contactPerson = searchParams.get("contact_person");
    // Check cache first
    const cacheKey = `n-clinic-db-${month || "all"}-${year || "all"}-${
      contactPerson || "all"
    }`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached n_clinic data from database`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }
    console.log(
      `📡 Fetching n_clinic data from n_income + n_customer + n_staff...`
    );
    // SQL query - ใช้ n_income table
    let query = `
      SELECT
        ni.sale_date       AS income_date,
        ni.income,          
        ni.payment         AS payment_type,
        ni.display_name    AS income_display_name,
        ns.nickname        AS staff_display_name
      FROM postgres."BJH-Server".n_income ni
      LEFT JOIN postgres."BJH-Server".n_customer nc
             ON ni.code = nc.code
      LEFT JOIN postgres."BJH-Server".n_staff ns
             ON nc.ownercode = ns.code
      WHERE ni.sale_date <= CURRENT_DATE
    `;
    const params: any[] = [];
    let paramIndex = 1;
    // Filter by month and year if provided
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM ni.sale_date::date) = $${paramIndex++}`;
      params.push(parseInt(month));
      query += ` AND EXTRACT(YEAR FROM ni.sale_date::date) = $${paramIndex++}`;
      params.push(parseInt(year));
    } else if (year) {
      query += ` AND EXTRACT(YEAR FROM ni.sale_date::date) = $${paramIndex++}`;
      params.push(parseInt(year));
    }
    // Filter by contact person if provided
    if (contactPerson && contactPerson !== "all") {
      query += ` AND ns.nickname = $${paramIndex++}`;
      params.push(contactPerson);
    }
    // Order by sale_date DESC
    query += ` ORDER BY ni.sale_date DESC`;
    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      console.log(
        `✅ Successfully fetched ${result.rows.length} n_clinic records from database`
      );
      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database (n_income + n_customer + n_staff)",
        debug: {
          filters: {
            month: month || "all",
            year: year || "all",
            contact_person: contactPerson || "all",
          },
        },
      };
      // Update cache with expiration time
      cache.set(cacheKey, {
        data: transformedData,
        timestamp: now,
        expiresAt: now + CACHE_DURATION,
      });
      // Clean old cache entries
      for (const [key, value] of cache.entries()) {
        if (now > value.expiresAt + 60000) {
          cache.delete(key);
        }
      }
      return NextResponse.json(transformedData, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "MISS",
          "X-Data-Source": "PostgreSQL Database (Fresh)",
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching n_clinic data from database:", error);
    // Return cached data if available even if expired
    const cached = cache.get("n-clinic-db");
    if (cached) {
      console.log("⚠️ Using expired cache due to database error");
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "X-Cache-Status": "STALE",
          "X-Data-Source": "Database (Error Fallback)",
        },
      });
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from database",
        details: {
          type: error.name,
          message: error.message,
          hint: "ตรวจสอบว่า database มีตาราง n_income, n_customer และ n_staff",
        },
        data: [],
      },
      { status: 500 }
    );
  }
}
// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

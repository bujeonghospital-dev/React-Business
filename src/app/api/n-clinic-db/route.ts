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
 * ดึงข้อมูลรายรับจาก n_saleIncentive + n_staff + bjh_all_leads (sale_date <= วันนี้)
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
      `📡 Fetching n_clinic data from n_saleIncentive + n_staff + bjh_all_leads (sale_date <= today)...`
    );

    // SQL query - ใช้ sale_date แทน surgery_date
    let query = `
      SELECT 
        s.sale_code,
        TO_CHAR(s.sale_date::date, 'YYYY-MM-DD') as sale_date,
        s.item_name,
        CASE 
          WHEN bl.proposed_amount::text ~ '^[0-9,]+$' 
          THEN ROUND(CAST(REPLACE(bl.proposed_amount::text, ',', '') AS NUMERIC))::INTEGER
          ELSE NULL
        END AS proposed_amount,
        n.nickname as contact_staff,
        CONCAT(n.name, ' ', n.surname) AS full_name
      FROM postgres."BJH-Server"."n_saleIncentive" AS s
      LEFT JOIN postgres."BJH-Server".n_staff AS n
        ON s.emp_code = n.code
      LEFT JOIN postgres."BJH-Server".bjh_all_leads AS bl
        ON s.emp_name = bl.contact_staff
        AND s.sale_date::date = bl.surgery_date::date
      WHERE DATE(s.sale_date) <= DATE(NOW())
        AND bl.proposed_amount IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided (ใช้ sale_date)
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM s.sale_date::date) = $${paramIndex++}`;
      params.push(parseInt(month));
      query += ` AND EXTRACT(YEAR FROM s.sale_date::date) = $${paramIndex++}`;
      params.push(parseInt(year));
    } else if (year) {
      query += ` AND EXTRACT(YEAR FROM s.sale_date::date) = $${paramIndex++}`;
      params.push(parseInt(year));
    }

    // Filter by contact person if provided (ใช้ nickname)
    if (contactPerson && contactPerson !== "all") {
      query += ` AND n.nickname = $${paramIndex++}`;
      params.push(contactPerson);
    }

    // Order by sale_date
    query += ` ORDER BY s.sale_date::date ASC`;

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
        source:
          "PostgreSQL Database (n_saleIncentive + n_staff + bjh_all_leads - sale_date <= today)",
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
          hint: "ตรวจสอบว่า database มีตาราง n_saleIncentive, n_staff และ bjh_all_leads",
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

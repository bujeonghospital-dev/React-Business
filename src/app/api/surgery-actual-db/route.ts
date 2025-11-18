import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/surgery-actual-db
 * ดึงข้อมูล Surgery Actual (วันที่ผ่าตัดจริง) จาก PostgreSQL Database
 * ตารางที่ 2: จำนวนผ่าตัด L
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const contactPerson = searchParams.get("contact_person");

    // Check cache first
    const cacheKey = `surgery-actual-db-${month || "all"}-${year || "all"}-${
      contactPerson || "all"
    }`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached surgery actual data from database`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }

    console.log(`📡 Fetching surgery actual data from database...`);

    // สร้าง SQL query - ดึงจากตาราง bjh_all_leads (วันที่ผ่าตัดจริง)
    let query = `
      SELECT 
        id,
        contact_staff as contact_person,
        contact_staff as ผู้ติดต่อ,
        TO_CHAR(
          CASE 
            WHEN surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' 
            THEN TO_DATE(surgery_date::text, 'DD/MM/YYYY')
            WHEN surgery_date::text ~ '^[0-9]+$' AND surgery_date::text::INTEGER BETWEEN 1 AND 100000
            THEN DATE '1899-12-30' + surgery_date::text::INTEGER
            ELSE NULL 
          END, 
          'YYYY-MM-DD'
        ) as surgery_date,
        surgery_date as วันที่ผ่าตัด,
        doctor as doctor,
        doctor as หมอ,
        customer_name as customer_name,
        customer_name as ชื่อ,
        phone as phone,
        phone as เบอร์โทร,
        CASE 
          WHEN REPLACE(proposed_amount, ',', '') ~ '^[0-9]+\.?[0-9]*$' 
          THEN REPLACE(proposed_amount, ',', '')::NUMERIC
          ELSE NULL 
        END as proposed_amount,
        COALESCE(proposed_amount, '') as ยอดนำเสนอ,
        appointment_time as เวลาที่นัด,
        'bjh_all_leads' as data_source
      FROM postgres."BJH-Server".bjh_all_leads
      WHERE surgery_date IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided (using surgery_date)
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM 
        CASE 
          WHEN surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date::text, 'DD/MM/YYYY')
          WHEN surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::text::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(month));
      query += ` AND EXTRACT(YEAR FROM 
        CASE 
          WHEN surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date::text, 'DD/MM/YYYY')
          WHEN surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::text::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(year));
    } else if (year) {
      query += ` AND EXTRACT(YEAR FROM 
        CASE 
          WHEN surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date::text, 'DD/MM/YYYY')
          WHEN surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::text::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(year));
    }

    // Filter by contact person if provided
    if (contactPerson && contactPerson !== "all") {
      query += ` AND contact_staff = $${paramIndex++}`;
      params.push(contactPerson);
    }

    // Order by date
    query += ` ORDER BY 
      CASE 
        WHEN surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(surgery_date::text, 'DD/MM/YYYY')
        WHEN surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + surgery_date::text::INTEGER
        ELSE NULL 
      END DESC NULLS LAST`;

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      console.log(
        `✅ Successfully fetched ${result.rows.length} surgery actual records from database`
      );

      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database (Surgery Actual)",
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
    console.error("Error fetching surgery actual data from database:", error);

    // Return cached data if available even if expired
    const cached = cache.get("surgery-actual-db");
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
          hint: "ตรวจสอบว่า database มีข้อมูลและ connection ทำงานปกติ",
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

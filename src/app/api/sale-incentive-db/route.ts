import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/sale-incentive-db
 * ดึงข้อมูล Sale Incentive จาก PostgreSQL Database
 * แทนที่ Python API ที่ดึงจาก Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const salePerson = searchParams.get("sale_person");

    // Check cache first
    const cacheKey = `sale-incentive-db-${month || "all"}-${year || "all"}-${
      salePerson || "all"
    }`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached sale incentive from database`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }

    console.log(`📡 Fetching sale incentive from database...`);

    // สร้าง SQL query แบบ dynamic
    // ดึงข้อมูลจาก n_saleIncentive และเปรียบเทียบกับ bjh_all_leads
    let query = `
      WITH sale_data AS (
        SELECT 
          s.sale_code,
          s.item_name,
          FLOOR(s.income) as income,
          n.nickname as sale_person,
          CONCAT(n.name, ' ', n.surname) AS full_name,
          EXTRACT(DAY FROM s.sale_date) as day,
          EXTRACT(MONTH FROM s.sale_date) as month,
          EXTRACT(YEAR FROM s.sale_date) as year,
          s.sale_date,
          '' as customer_name,
          '' as notes,
          'n_saleIncentive' as data_source,
          CURRENT_TIMESTAMP as created_at,
          CURRENT_TIMESTAMP as updated_at
        FROM postgres."BJH-Server"."n_saleIncentive" AS s
        LEFT JOIN postgres."BJH-Server".n_staff AS n
          ON s.emp_code = n.code
      ),
      bjh_data AS (
        SELECT 
          contact_staff as sale_person,
          CASE 
            WHEN surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' 
            THEN TO_DATE(surgery_date::text, 'DD/MM/YYYY')::DATE
            WHEN surgery_date::text ~ '^[0-9]+$' AND surgery_date::text::INTEGER BETWEEN 1 AND 100000
            THEN (DATE '1899-12-30' + surgery_date::text::INTEGER)::DATE
            ELSE NULL 
          END as surgery_date,
          CASE 
            WHEN REPLACE(proposed_amount, ',', '') ~ '^[0-9]+\.?[0-9]*$' 
            THEN REPLACE(proposed_amount, ',', '')::NUMERIC
            ELSE 0
          END as proposed_amount,
          doctor,
          customer_name,
          phone,
          appointment_time
        FROM postgres."BJH-Server".bjh_all_leads
        WHERE surgery_date IS NOT NULL
      ),
      combined_data AS (
        SELECT 
          COALESCE(s.sale_person, '') as sale_person,
          COALESCE(TO_CHAR(s.sale_date, 'YYYY-MM-DD'), '') as sale_date,
          CASE 
            WHEN COALESCE(b.proposed_amount, 0) > COALESCE(s.income, 0) AND b.proposed_amount IS NOT NULL 
            THEN b.proposed_amount
            ELSE COALESCE(s.income, 0)
          END as income,
          COALESCE(s.day, 0) as day,
          COALESCE(s.month, 0) as month,
          COALESCE(s.year, 0) as year,
          CASE 
            WHEN COALESCE(b.proposed_amount, 0) > COALESCE(s.income, 0) AND b.customer_name IS NOT NULL 
            THEN b.customer_name
            ELSE COALESCE(s.customer_name, '')
          END as customer_name,
          COALESCE(s.notes, '') as notes,
          CASE 
            WHEN COALESCE(b.proposed_amount, 0) > COALESCE(s.income, 0) AND b.proposed_amount IS NOT NULL 
            THEN 'bjh_all_leads'
            ELSE COALESCE(s.data_source, 'n_saleIncentive')
          END as data_source,
          s.created_at,
          s.updated_at,
          CASE 
            WHEN COALESCE(b.proposed_amount, 0) > COALESCE(s.income, 0) AND b.proposed_amount IS NOT NULL 
            THEN 1
            ELSE 0
          END as is_bjh_count
        FROM sale_data s
        LEFT JOIN bjh_data b
          ON s.sale_person = b.sale_person 
          AND s.sale_date::DATE = b.surgery_date
      )
      SELECT 
        sale_person,
        sale_date,
        income::NUMERIC as income,
        day::INTEGER as day,
        month::INTEGER as month,
        year::INTEGER as year,
        customer_name,
        notes,
        data_source,
        created_at,
        updated_at,
        is_bjh_count::INTEGER as is_bjh_count
      FROM combined_data
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided
    if (month && year) {
      query += ` AND month = $${paramIndex++}`;
      params.push(parseInt(month));
      query += ` AND year = $${paramIndex++}`;
      params.push(parseInt(year));
    } else if (year) {
      query += ` AND year = $${paramIndex++}`;
      params.push(parseInt(year));
    }

    // Filter by sale person if provided
    if (salePerson && salePerson !== "all") {
      query += ` AND sale_person = $${paramIndex++}`;
      params.push(salePerson);
    }

    // Order by date
    query += ` ORDER BY sale_date DESC, created_at DESC`;

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      console.log(
        `✅ Successfully fetched ${result.rows.length} sale incentive records from database`
      );

      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total_records: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database",
        debug: {
          filters: {
            month: month || "all",
            year: year || "all",
            sale_person: salePerson || "all",
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
    console.error("Error fetching sale incentive from database:", error);

    // Return cached data if available even if expired
    const cached = cache.get("sale-incentive-db");
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
          hint: "ตรวจสอบว่า database มีตาราง sale_incentive และ connection ทำงานปกติ",
        },
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sale-incentive-db
 * เพิ่มข้อมูล Sale Incentive ใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sale_person, sale_date, income, customer_name, notes } = body;

    // Validate required fields
    if (!sale_person || !sale_date || income === undefined || income === null) {
      return NextResponse.json(
        {
          success: false,
          error: "sale_person, sale_date, and income are required",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO sale_incentive (
          sale_person, sale_date, income, customer_name, notes
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        sale_person,
        sale_date,
        income,
        customer_name || null,
        notes || null,
      ];

      const result = await client.query(query, values);

      // Clear cache
      cache.clear();

      return NextResponse.json(
        {
          success: true,
          data: result.rows[0],
          message: "Sale incentive created successfully",
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error creating sale incentive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create sale incentive",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sale-incentive-db
 * อัพเดทข้อมูล Sale Incentive
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 }
      );
    }

    // สร้าง dynamic update query
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 }
      );
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = [id, ...fields.map((field) => updateData[field])];

    const client = await pool.connect();
    try {
      const query = `
        UPDATE sale_incentive
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Sale incentive not found",
          },
          { status: 404 }
        );
      }

      // Clear cache
      cache.clear();

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: "Sale incentive updated successfully",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error updating sale incentive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update sale incentive",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sale-incentive-db
 * ลบข้อมูล Sale Incentive
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "id is required",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `DELETE FROM sale_incentive WHERE id = $1 RETURNING id`;
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Sale incentive not found",
          },
          { status: 404 }
        );
      }

      // Clear cache
      cache.clear();

      return NextResponse.json({
        success: true,
        message: "Sale incentive deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error deleting sale incentive:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete sale incentive",
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
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

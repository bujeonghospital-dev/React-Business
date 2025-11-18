import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/surgery-schedule-db
 * ดึงข้อมูล Surgery Schedule จาก PostgreSQL Database
 * แทนที่ Python API ที่ดึงจาก Google Sheets
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 1-12
    const year = searchParams.get("year");
    const contactPerson = searchParams.get("contact_person");

    // Check cache first
    const cacheKey = `surgery-schedule-db-${month || "all"}-${year || "all"}-${
      contactPerson || "all"
    }`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached surgery schedule from database`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }

    console.log(`📡 Fetching surgery schedule from database...`);

    // สร้าง SQL query แบบ dynamic - ดึงจากตาราง bjh_all_leads
    let query = `
      SELECT 
        id,
        contact_staff as contact_person,
        contact_staff as ผู้ติดต่อ,
        TO_CHAR(
          CASE 
            WHEN booked_surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' 
            THEN TO_DATE(booked_surgery_date::text, 'DD/MM/YYYY')
            WHEN booked_surgery_date::text ~ '^[0-9]+$' AND booked_surgery_date::text::INTEGER BETWEEN 1 AND 100000
            THEN DATE '1899-12-30' + booked_surgery_date::text::INTEGER
            ELSE NULL 
          END, 
          'YYYY-MM-DD'
        ) as date_surgery_scheduled,
        booked_surgery_date as วันที่ได้นัดผ่าตัด,
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
      WHERE booked_surgery_date IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided (using booked_surgery_date)
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM 
        CASE 
          WHEN booked_surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(booked_surgery_date::text, 'DD/MM/YYYY')
          WHEN booked_surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + booked_surgery_date::text::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(month));
      query += ` AND EXTRACT(YEAR FROM 
        CASE 
          WHEN booked_surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(booked_surgery_date::text, 'DD/MM/YYYY')
          WHEN booked_surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + booked_surgery_date::text::INTEGER
          ELSE NULL 
        END) = $${paramIndex++}`;
      params.push(parseInt(year));
    } else if (year) {
      query += ` AND EXTRACT(YEAR FROM 
        CASE 
          WHEN booked_surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(booked_surgery_date::text, 'DD/MM/YYYY')
          WHEN booked_surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + booked_surgery_date::text::INTEGER
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
        WHEN booked_surgery_date::text ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' THEN TO_DATE(booked_surgery_date::text, 'DD/MM/YYYY')
        WHEN booked_surgery_date::text ~ '^[0-9]+$' THEN DATE '1899-12-30' + booked_surgery_date::text::INTEGER
        ELSE NULL 
      END DESC NULLS LAST`;

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      console.log(
        `✅ Successfully fetched ${result.rows.length} records from database`
      );

      // Transform data to match expected format
      const transformedData = {
        success: true,
        data: result.rows,
        total: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database",
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
    console.error("Error fetching surgery schedule from database:", error);

    // Return cached data if available even if expired
    const cached = cache.get("surgery-schedule-db");
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
          hint: "ตรวจสอบว่า database มีตาราง surgery_schedule และ connection ทำงานปกติ",
        },
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/surgery-schedule-db
 * เพิ่มข้อมูล Surgery Schedule ใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      doctor,
      contact_person,
      customer_name,
      phone,
      date_surgery_scheduled,
      appointment_time,
      surgery_date,
      date_consult_scheduled,
      proposed_amount,
      status,
      notes,
    } = body;

    // Validate required fields
    if (!contact_person) {
      return NextResponse.json(
        {
          success: false,
          error: "contact_person is required",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO postgres."BJH-Server".bjh_all_leads (
          doctor, contact_staff, customer_name, phone,
          booked_surgery_date, appointment_time, surgery_date,
          booked_consult_date, proposed_amount, status, note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        doctor || null,
        contact_person,
        customer_name || null,
        phone || null,
        date_surgery_scheduled || null,
        appointment_time || null,
        surgery_date || null,
        date_consult_scheduled || null,
        proposed_amount || null,
        status || null,
        notes || null,
      ];

      const result = await client.query(query, values);

      // Clear cache
      cache.clear();

      return NextResponse.json(
        {
          success: true,
          data: result.rows[0],
          message: "Surgery schedule created successfully",
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error creating surgery schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create surgery schedule",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/surgery-schedule-db
 * อัพเดทข้อมูล Surgery Schedule
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
        UPDATE postgres."BJH-Server".bjh_all_leads
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Surgery schedule not found",
          },
          { status: 404 }
        );
      }

      // Clear cache
      cache.clear();

      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: "Surgery schedule updated successfully",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error updating surgery schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update surgery schedule",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/surgery-schedule-db
 * ลบข้อมูล Surgery Schedule
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
      const query = `DELETE FROM postgres."BJH-Server".bjh_all_leads WHERE id = $1 RETURNING id`;
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Surgery schedule not found",
          },
          { status: 404 }
        );
      }

      // Clear cache
      cache.clear();

      return NextResponse.json({
        success: true,
        message: "Surgery schedule deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error deleting surgery schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete surgery schedule",
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

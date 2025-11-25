import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * GET /api/crm-advanced
 * ดึงข้อมูล CRM Advanced จาก PostgreSQL Database
 * ดึงเฉพาะรายการที่มี consult_date หรือ surgery_date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Check cache first
    const cacheKey = `crm-advanced-${startDate || "all"}-${endDate || "all"}-${
      month || "all"
    }-${year || "all"}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached CRM advanced data`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "PostgreSQL Database (Cached)",
        },
      });
    }

    console.log(`📡 Fetching CRM advanced data from database...`);

    // สร้าง SQL query
    let query = `
      SELECT 
        id,
        appointment_time,
        status,
        customer_name,
        phone,
        interested_product,
        doctor,
        contact_staff,
        proposed_amount,
        star_flag,
        country,
        note,
        surgery_date,
        consult_date
      FROM "BJH-Server"."bjh_all_leads"
      WHERE 
        1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by month and year if provided (for calendar view)
    if (month && year) {
      query += ` AND (
        (status = 'นัด Consult' AND consult_date IS NOT NULL AND EXTRACT(MONTH FROM consult_date::date) = $${paramIndex} AND EXTRACT(YEAR FROM consult_date::date) = $${
        paramIndex + 1
      })
        OR 
        (status = 'นัดพร้อมทำ' AND surgery_date IS NOT NULL AND EXTRACT(MONTH FROM surgery_date::date) = $${paramIndex} AND EXTRACT(YEAR FROM surgery_date::date) = $${
        paramIndex + 1
      })
      )`;
      params.push(parseInt(month), parseInt(year));
      paramIndex += 2;
    }
    // Filter by specific date (when clicking on calendar day)
    else if (startDate && startDate === endDate) {
      query += ` AND (
        (status = 'นัด Consult' AND consult_date::date = $${paramIndex}::date)
        OR 
        (status = 'นัดพร้อมทำ' AND surgery_date::date = $${paramIndex}::date)
      )`;
      params.push(startDate);
      paramIndex += 1;
    }
    // Filter by date range if provided (for table view)
    else if (startDate && endDate) {
      query += ` AND (
        (status = 'นัด Consult' AND consult_date::date BETWEEN $${paramIndex}::date AND $${
        paramIndex + 1
      }::date)
        OR 
        (status = 'นัดพร้อมทำ' AND surgery_date::date BETWEEN $${paramIndex}::date AND $${
        paramIndex + 1
      }::date)
      )`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }
    // No date filter - get all records with consult_date or surgery_date
    else {
      query += ` AND (
        (status = 'นัด Consult' AND consult_date IS NOT NULL)
        OR 
        (status = 'นัดพร้อมทำ' AND surgery_date IS NOT NULL)
      )`;
    }

    // Order by date according to status
    query += ` ORDER BY 
      CASE 
        WHEN status = 'นัด Consult' THEN consult_date::date
        WHEN status = 'นัดพร้อมทำ' THEN surgery_date::date
      END ASC,
      appointment_time ASC
    `;

    // Execute query
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      console.log(
        `✅ Successfully fetched ${result.rows.length} CRM records from database`
      );

      // Transform data
      const transformedData = {
        success: true,
        data: result.rows.map((row) => {
          // แปลง date ให้เป็น YYYY-MM-DD format
          // เนื่องจากตั้งค่า pg ให้ return date เป็น string แล้ว จึงไม่มีปัญหา timezone
          const formatDate = (dateValue: any): string => {
            if (!dateValue) return "";
            const dateStr = String(dateValue);
            // ถ้ามี T อยู่ (ISO format) ให้ตัดเอาส่วน date
            if (dateStr.includes("T")) {
              return dateStr.split("T")[0];
            }
            // ถ้ามี space (timestamp format เช่น "2025-11-25 10:00:00")
            if (dateStr.includes(" ")) {
              return dateStr.split(" ")[0];
            }
            // ถ้าเป็น YYYY-MM-DD อยู่แล้ว
            return dateStr;
          };

          // แปลง time ให้เป็น HH:MM:SS format
          const formatTime = (timeValue: any): string => {
            if (!timeValue) return "";
            // ถ้าเป็น string ให้ใช้โดยตรง
            if (typeof timeValue === "string") {
              return timeValue;
            }
            // ถ้าเป็น object หรืออื่นๆ ให้แปลงเป็น string
            return String(timeValue);
          };

          return {
            id: row.id,
            appointmentTime: formatTime(row.appointment_time),
            status: row.status || "",
            customer_name: row.customer_name || "",
            phone: row.phone || "",
            interested_product: row.interested_product || "",
            doctor: row.doctor || "",
            contact_staff: row.contact_staff || "",
            proposed_amount: parseFloat(row.proposed_amount || 0),
            proposedAmount: parseFloat(row.proposed_amount || 0),
            star_flag: row.star_flag || "",
            country: row.country || "",
            note: row.note || "",
            surgery_date: formatDate(row.surgery_date),
            consult_date: formatDate(row.consult_date),
            // เพิ่ม field สำหรับแสดงในปฏิทิน
            displayDate:
              formatDate(row.surgery_date) ||
              formatDate(row.consult_date) ||
              row.appointment_time ||
              "",
          };
        }),
        total: result.rows.length,
        timestamp: new Date().toISOString(),
        source: "PostgreSQL Database",
        debug: {
          filters: {
            startDate: startDate || "all",
            endDate: endDate || "all",
            month: month || "all",
            year: year || "all",
          },
        },
      };

      // Update cache
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
    console.error("Error fetching CRM advanced data:", error);

    // Return cached data if available
    const cached = cache.get("crm-advanced");
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
        error: error.message || "Failed to fetch CRM data",
        details: {
          type: error.name,
          message: error.message,
          hint: "ตรวจสอบว่า database connection ทำงานปกติ",
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

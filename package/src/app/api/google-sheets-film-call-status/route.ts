import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 วินาที

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ cache ก่อน
    const cacheKey = "film-call-status";
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log("✅ Returning cached film-call-status data");
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
          "X-Cache-Status": "HIT",
        },
      });
    }

    // ตรวจสอบว่ามี environment variables ครบหรือไม่
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
      !process.env.GOOGLE_SPREADSHEET_ID
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Google Sheets credentials in environment variables",
        },
        { status: 500 }
      );
    }

    // สร้าง auth client ด้วย Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ดึงข้อมูลจากชีท "Film_dev"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Film_dev!A:Z", // ดึงข้อมูลทั้งหมดจากชีท
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    // ตรวจสอบว่า header อยู่แถวไหน (บางครั้งมี 2 แถว header)
    // แถว 0: ชื่อคอลัมน์ Google Sheets (AS, AT, AU...)
    // แถว 1: Header จริง (status_call, ชื่อ, เบอร์โทร...)
    let headers = rows[0];
    let dataRows = rows.slice(1);

    // ตรวจสอบว่าแถวแรกเป็น Google Sheets column names หรือไม่
    const firstRowHasSheetColumnNames = rows[0].some((cell: string) =>
      /^[A-Z]{1,3}$/.test(String(cell || "").trim())
    );

    if (firstRowHasSheetColumnNames && rows.length > 1) {
      console.log(
        "📋 Detected 2-row header system (Sheet columns + Real headers)"
      );
      console.log("Row 0 (Sheet columns):", rows[0]);
      console.log("Row 1 (Real headers):", rows[1]);
      headers = rows[1]; // ใช้แถวที่ 2 เป็น header จริง
      dataRows = rows.slice(2); // ข้อมูลเริ่มจากแถวที่ 3
    }

    console.log("=== GOOGLE SHEETS - Film_dev (Call Status) ===");
    console.log("Total columns:", headers.length);
    console.log("Headers (raw):", JSON.stringify(headers));
    console.log("Total data rows:", dataRows.length);

    // แสดง headers แต่ละตัวพร้อม index
    headers.forEach((h: string, i: number) => {
      console.log(`  [${i}] "${h}" (lowercase: "${h.toLowerCase()}")`);
    });

    // หา index ของคอลัมน์ที่ต้องการ - ค้นหาแบบยืดหยุ่น
    const statusCallIndex = headers.findIndex((h: string) => {
      const lower = h.toLowerCase().trim();
      return (
        lower === "status_call" || // จากรูป: แถว 2 มี "status_call"
        lower === "statuscall" ||
        lower === "status call" ||
        lower === "สถานะ" ||
        lower === "status" ||
        (lower.includes("status") && lower.includes("call"))
      );
    });

    const phoneIndex = headers.findIndex((h: string) => {
      const lower = h.toLowerCase().trim();
      return (
        lower === "เบอร์โทร" ||
        lower === "เบอร์" ||
        lower === "phone" ||
        lower === "tel" ||
        lower === "telephone" ||
        lower.includes("เบอร์โทร") ||
        lower.includes("phone") ||
        lower.includes("tel")
      );
    });

    const nameIndex = headers.findIndex((h: string) => {
      const lower = h.toLowerCase().trim();
      return (
        lower === "ชื่อ" ||
        lower === "name" ||
        lower === "ชื่อลูกค้า" ||
        lower === "customer name" ||
        lower.includes("ชื่อ") ||
        lower.includes("name")
      );
    });

    console.log("\n=== Column Detection ===");
    console.log(
      "- status_call index:",
      statusCallIndex,
      statusCallIndex !== -1 ? `"${headers[statusCallIndex]}"` : "NOT FOUND"
    );
    console.log(
      "- phone index:",
      phoneIndex,
      phoneIndex !== -1 ? `"${headers[phoneIndex]}"` : "NOT FOUND"
    );
    console.log(
      "- name index:",
      nameIndex,
      nameIndex !== -1 ? `"${headers[nameIndex]}"` : "NOT FOUND"
    );

    if (statusCallIndex === -1 || phoneIndex === -1) {
      console.error("\n❌ Required columns not found");
      console.error("Available headers:", headers);
      return NextResponse.json(
        {
          success: false,
          error:
            'Required columns "status_call" or "เบอร์โทร" not found in Film_dev sheet',
          availableHeaders: headers,
          hint: "Please check the exact column names in your Google Sheet. Looking for: status_call (or similar) and เบอร์โทร (or phone/tel)",
        },
        { status: 500 }
      );
    }

    // กรองข้อมูลที่มีสถานะ "อยู่ระหว่างโทรออก"
    const outgoingCalls: Array<{
      id: string;
      name: string;
      phone: string;
      status: string;
    }> = [];

    // เก็บสถานะที่พบทั้งหมดเพื่อ debug
    const statusValues = new Set<string>();

    dataRows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const statusCall = row[statusCallIndex]?.toString().trim() || "";
      const phone = row[phoneIndex]?.toString().trim() || "";
      const name =
        nameIndex !== -1 ? row[nameIndex]?.toString().trim() || "" : "";

      // เก็บสถานะที่พบ
      if (statusCall) {
        statusValues.add(statusCall);
      }

      // ตรวจสอบว่าสถานะเป็น "อยู่ระหว่างโทรออก" หรือไม่
      if (
        statusCall === "อยู่ระหว่างโทรออก" &&
        phone &&
        phone !== "" &&
        phone !== "-"
      ) {
        outgoingCalls.push({
          id: `film-${index + 2}`, // +2 เพราะแถวแรกเป็น header และเริ่มนับจาก 1
          name: name || phone, // ถ้าไม่มีชื่อให้ใช้เบอร์แทน
          phone: phone,
          status: statusCall,
        });

        console.log(
          `✅ Row ${index + 2}: ${name || "No name"} - ${phone} (${statusCall})`
        );
      }
    });

    console.log("=== UNIQUE STATUS VALUES FOUND ===");
    console.log("Total unique statuses:", statusValues.size);
    console.log("Status values:", Array.from(statusValues));

    console.log("=== RESULTS ===");
    console.log("Total outgoing calls:", outgoingCalls.length);
    console.log("Outgoing calls data:", outgoingCalls);

    // อัพเดท cache
    const responseData = {
      success: true,
      data: outgoingCalls,
      total: outgoingCalls.length,
      timestamp: new Date().toISOString(),
      debug: {
        totalRows: dataRows.length,
        matchedRows: outgoingCalls.length,
        statusCallColumn: headers[statusCallIndex],
        phoneColumn: headers[phoneIndex],
        nameColumn: nameIndex !== -1 ? headers[nameIndex] : "Not found",
      },
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error(
      "Error fetching Google Sheets (Film_dev call status):",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'Failed to fetch call status data from Google Sheets "Film_dev"',
        details: error,
      },
      { status: 500 }
    );
  }
}

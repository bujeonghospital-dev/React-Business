import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// In-memory cache with date key
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 2 นาที (120 วินาที) - ลด API calls

export async function GET(request: NextRequest) {
  try {
    // รับพารามิเตอร์ date จาก query string (รูปแบบ YYYY-MM-DD)
    const { searchParams } = new URL(request.url);
    const targetDate =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // ตรวจสอบ cache ก่อน
    const cacheKey = `film-dev-${targetDate}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Returning cached Film_dev data for ${targetDate}`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
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
        date: targetDate,
        agentCounts: {},
        total: 0,
      });
    }

    // สมมติว่าแถวแรกเป็น header
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log("=== GOOGLE SHEETS - Film_dev ===");
    console.log("Target date:", targetDate);
    console.log("Total columns:", headers.length);
    console.log("Headers:", headers);
    console.log("Total data rows:", dataRows.length);

    // หา index ของคอลัมน์ที่ต้องการ
    const contactPersonIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes("ผู้ติดต่อ") || h === "ผู้ติดต่อ"
    );
    const statusIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes("สถานะ") || h === "สถานะ"
    );

    console.log("Column indices:");
    console.log("  ผู้ติดต่อ:", contactPersonIndex);
    console.log("  สถานะ:", statusIndex);

    if (contactPersonIndex === -1 || statusIndex === -1) {
      console.error("❌ Required columns not found");
      return NextResponse.json(
        {
          success: false,
          error:
            "Required columns (ผู้ติดต่อ, สถานะ) not found in Film_dev sheet",
          availableHeaders: headers,
        },
        { status: 500 }
      );
    }

    // Agent Name Mapping (ชื่อใน Google Sheet -> Agent ID)
    const agentNameMap: { [key: string]: string } = {
      สา: "101",
      พัชชา: "102",
      ตั้งโอ๋: "103",
      Test: "104",
      จีน: "105",
      มุก: "106",
      เจ: "107",
      ว่าน: "108",
    };

    // นับจำนวนแต่ละ agent
    const agentCounts: { [key: string]: number } = {};

    // Initialize counts
    Object.values(agentNameMap).forEach((agentId) => {
      agentCounts[agentId] = 0;
    });

    // ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบ YYYY-MM-DD
    const normalizeDate = (dateStr: string): string | null => {
      if (!dateStr || dateStr.trim() === "") return null;

      try {
        // ลองแปลงวันที่หลายรูปแบบ
        const cleanDate = dateStr.trim();

        // ถ้าเป็นรูปแบบ DD/MM/YYYY หรือ DD-MM-YYYY
        const ddmmyyyyMatch = cleanDate.match(
          /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
        );
        if (ddmmyyyyMatch) {
          const [, day, month, year] = ddmmyyyyMatch;
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        // ถ้าเป็นรูปแบบ YYYY-MM-DD อยู่แล้ว
        const yyyymmddMatch = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (yyyymmddMatch) {
          const [, year, month, day] = yyyymmddMatch;
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        // ลองใช้ Date object
        const date = new Date(cleanDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }

        return null;
      } catch (error) {
        console.error("Error parsing date:", dateStr, error);
        return null;
      }
    };

    let matchedRows = 0;

    dataRows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const contactPerson = row[contactPersonIndex]?.toString().trim() || "";
      const status = row[statusIndex]?.toString().trim() || "";

      // Debug: แสดงข้อมูล 5 แถวแรก
      if (index < 5) {
        console.log(`🔍 Debug Row ${index + 2}:`, {
          contactPerson,
          status,
          rawRow: row.slice(0, 10), // แสดง 10 คอลัมน์แรก
        });
      }

      if (!contactPerson || !status) return;

      // กรองเฉพาะสถานะที่ตรงกับ "นัด Consult (VDO)" เท่านั้น
      const isConsultVDO = status === "นัด Consult (VDO)";

      if (!isConsultVDO) {
        return; // ข้ามแถวที่ไม่ใช่สถานะ "นัด Consult (VDO)"
      }

      // หา agent ID จากชื่อผู้ติดต่อ
      // รองรับรูปแบบ: "101-สา", "สา", "สา-101", "เจ 107", etc.
      let matchedAgentId: string | null = null;

      // ลองหาจากรหัส Agent ก่อน (101-108)
      for (const agentId of Object.values(agentNameMap)) {
        if (contactPerson.includes(agentId)) {
          matchedAgentId = agentId;
          break;
        }
      }

      // ถ้าไม่เจอ ให้หาจากชื่อ
      if (!matchedAgentId) {
        for (const [agentName, agentId] of Object.entries(agentNameMap)) {
          if (contactPerson.includes(agentName)) {
            matchedAgentId = agentId;
            break;
          }
        }
      }

      if (!matchedAgentId) {
        // ไม่เจอทั้งรหัสและชื่อ - ข้ามแถวนี้
        return;
      }

      // นับเฉพาะแถวที่มีสถานะ "นัด Consult"
      agentCounts[matchedAgentId]++;
      matchedRows++;
      console.log(
        `✅ Row ${
          index + 2
        }: ${contactPerson} (${matchedAgentId}) - สถานะ: ${status}`
      );
    });

    const totalCount = Object.values(agentCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    console.log("=== RESULTS ===");
    console.log("Matched rows:", matchedRows);
    console.log("Agent counts:", agentCounts);
    console.log("Total count:", totalCount);

    // อัพเดท cache
    const responseData = {
      success: true,
      date: targetDate,
      agentCounts: agentCounts,
      totalCount: totalCount,
      debug: {
        totalRows: dataRows.length,
        matchedRows: matchedRows,
        contactPersonColumn: headers[contactPersonIndex],
        statusColumn: headers[statusIndex],
      },
    };
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Error fetching Google Sheets (Film_dev):", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || 'Failed to fetch data from Google Sheets "Film_dev"',
        details: error,
      },
      { status: 500 }
    );
  }
}

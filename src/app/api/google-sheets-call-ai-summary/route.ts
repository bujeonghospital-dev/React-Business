import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// In-memory cache with date key
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 120000; // 2 นาที (120 วินาที) - ลด API calls

export async function GET(request: NextRequest) {
  try {
    // ดึง date parameter จาก query string
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Date parameter is required (format: YYYY-MM-DD)",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบ cache ก่อน
    const cacheKey = `summary-${dateParam}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Returning cached call-ai-summary for ${dateParam}`);
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

    // ดึงข้อมูลจากชีท "สรุป call_AI"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "สรุป call_AI!A:Z",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        date: dateParam,
        timeSlots: [],
        totals: {},
        message: "No data found in sheet",
      });
    }

    // สมมติว่าแถวแรกเป็น header
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log("=== GOOGLE SHEETS CALL AI SUMMARY ===");
    console.log("Selected date:", dateParam);
    console.log("Total columns:", headers.length);
    console.log("Headers:", headers);
    console.log("Total data rows:", dataRows.length);

    // หา index ของคอลัมน์ที่ต้องการ
    const startColumnIndex = headers.findIndex((h: string) =>
      ["start", "Start", "เวลาเริ่มต้น"].includes(h)
    );
    const summaryTimeColumnIndex = headers.findIndex((h: string) =>
      ["สรุปเวลา", "summary_time", "duration"].includes(h)
    );
    const callerColumnIndex = headers.findIndex((h: string) =>
      ["ผู้โทร", "caller", "agent"].includes(h)
    );

    if (
      startColumnIndex === -1 ||
      summaryTimeColumnIndex === -1 ||
      callerColumnIndex === -1
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Required columns not found: start, สรุปเวลา, ผู้โทร",
          availableHeaders: headers,
        },
        { status: 400 }
      );
    }

    console.log("📋 Column indices:", {
      start: startColumnIndex,
      สรุปเวลา: summaryTimeColumnIndex,
      ผู้โทร: callerColumnIndex,
    });

    // ฟังก์ชันแปลง duration เป็นวินาที
    const parseDuration = (duration: string): number => {
      if (!duration || duration === "-" || duration === "") {
        return 0;
      }

      // รองรับรูปแบบ "0:45" หรือ "1:30" หรือ "0:05"
      const parts = duration.split(":");
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return minutes * 60 + seconds;
      }

      return 0;
    };

    // ฟังก์ชันแปลงวันที่ให้ตรงกัน
    const parseDate = (dateString: string): string => {
      if (!dateString) return "";

      // รูปแบบ: "2025-11-07 11:46:51" หรือ "2025-11-07"
      const datePart = dateString.split(" ")[0];
      return datePart;
    };

    // เก็บข้อมูลแยกตามช่วงเวลา
    const timeSlots: Record<string, Record<string, number>> = {};
    const agentTotals: Record<string, number> = {};

    // กรองข้อมูลตามวันที่และ duration >= 30 วินาที
    const filteredRows = dataRows.filter((row) => {
      if (!row || row.length === 0) return false;

      const startValue = row[startColumnIndex] || "";
      const summaryTime = row[summaryTimeColumnIndex] || "";

      const rowDate = parseDate(startValue);
      const durationSeconds = parseDuration(summaryTime);

      const isCorrectDate = rowDate === dateParam;
      const isLongEnough = durationSeconds >= 30;

      if (isCorrectDate && !isLongEnough) {
        console.log("🚫 Filtered out (duration < 30s):", {
          start: startValue,
          duration: summaryTime,
          seconds: durationSeconds,
        });
      }

      return isCorrectDate && isLongEnough;
    });

    console.log(
      `✅ Filtered ${filteredRows.length} rows for date ${dateParam} with duration >= 30s`
    );

    // วนลูปผ่านแถวที่กรองแล้ว
    filteredRows.forEach((row) => {
      const startValue = row[startColumnIndex] || "";
      const callerValue = row[callerColumnIndex] || "";

      if (!startValue || !callerValue) return;

      // ดึงเวลา (hour) จาก start
      // รูปแบบ: "2025-11-07 11:46:51" -> hour = 11
      const timePart = startValue.split(" ")[1] || "";
      const hourPart = timePart.split(":")[0] || "";
      const hour = parseInt(hourPart, 10);

      if (isNaN(hour) || hour < 11 || hour > 18) {
        return; // ข้ามถ้าไม่อยู่ในช่วงเวลา 11:00-18:59
      }

      const hourKey = String(hour);

      // เตรียม timeSlot
      if (!timeSlots[hourKey]) {
        timeSlots[hourKey] = {};
      }

      // นับจำนวนการโทรของ agent
      if (!timeSlots[hourKey][callerValue]) {
        timeSlots[hourKey][callerValue] = 0;
      }
      timeSlots[hourKey][callerValue]++;

      // นับรวมทั้งหมดของ agent
      if (!agentTotals[callerValue]) {
        agentTotals[callerValue] = 0;
      }
      agentTotals[callerValue]++;
    });

    console.log("📊 Time slots summary:", timeSlots);
    console.log("📊 Agent totals:", agentTotals);

    // แปลงเป็นรูปแบบ array
    const timeSlotsArray = Object.keys(timeSlots)
      .map((hourKey) => ({
        hourStart: hourKey,
        hourEnd: String(parseInt(hourKey, 10) + 1),
        label: `${hourKey}:00-${parseInt(hourKey, 10) + 1}:00 น.`,
        agentCounts: timeSlots[hourKey],
      }))
      .sort((a, b) => parseInt(a.hourStart, 10) - parseInt(b.hourStart, 10));

    // อัพเดท cache
    const responseData = {
      success: true,
      date: dateParam,
      timeSlots: timeSlotsArray,
      totals: agentTotals,
      totalCalls: filteredRows.length,
      message: `Counted ${filteredRows.length} calls for ${dateParam} with duration >= 30 seconds`,
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
    console.error("Error fetching Google Sheets call AI summary:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Failed to fetch call AI summary from Google Sheets",
        details: error,
      },
      { status: 500 }
    );
  }
}

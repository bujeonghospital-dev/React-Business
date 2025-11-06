import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const datePreset = searchParams.get("date_preset") || "today";
    const timeRange = searchParams.get("time_range");
    const daily = searchParams.get("daily") === "true"; // ถ้า daily=true จะให้ข้อมูลแยกรายวัน

    // ตรวจสอบว่ามี environment variables ครบหรือไม่
    if (
      !process.env.GOOGLE_SA_CLIENT_EMAIL ||
      !process.env.GOOGLE_SA_PRIVATE_KEY ||
      !process.env.GOOGLE_SHEET_ID
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
        client_email: process.env.GOOGLE_SA_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ดึงข้อมูลจาก Google Sheets
    // ชีทชื่อ "เคสได้ชื่อเบอร์" และดึงคอลัมน์ "ได้ชื่อได้เบอร์" พร้อมวันที่
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "เคสได้ชื่อเบอร์!A:Z", // ดึงข้อมูลทั้งหมดจากชีท
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        data: [],
      });
    }

    // สมมติว่าแถวแรกเป็น header
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log("=== HEADERS ANALYSIS ===");
    console.log("Total columns:", headers.length);
    console.log("All headers with index:");
    headers.forEach((h: string, idx: number) => {
      console.log(`  [${idx}]: "${h}"`);
    });

    // ตรวจสอบ 5 แถวแรกของข้อมูลเพื่อดูโครงสร้าง
    console.log("\n=== SAMPLE DATA (first 3 rows) ===");
    dataRows.slice(0, 3).forEach((row: any[], idx: number) => {
      console.log(`Row ${idx + 2}:`, row.slice(0, 5)); // แสดง 5 คอลัมน์แรก
    });

    // จากภาพ: คอลัมน์ A ชื่อ "ได้ชื่อได้เบอร์" แต่ข้อมูลเป็นวันที่ 05/11/2025
    // ดังนั้นให้ใช้คอลัมน์ A เป็นคอลัมน์วันที่สำหรับกรองและนับ
    const namePhoneColIndex = 0; // คอลัมน์ A
    const dateColIndex = 0; // คอลัมน์เดียวกัน

    console.log("\n=== COLUMN DETECTION RESULT ===");
    console.log(
      `Using column A (index 0) for both date filtering and counting`
    );
    console.log(`Column header: "${headers[namePhoneColIndex]}"`);
    console.log(`Sample data: "${dataRows[0]?.[0]}"`);

    // กรองข้อมูลตาม date range
    let filteredRows = dataRows;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    // คำนวณวันที่ตาม date_preset หรือ time_range
    if (timeRange) {
      try {
        const range = JSON.parse(timeRange);
        startDate = new Date(range.since);
        endDate = new Date(range.until);
        endDate.setHours(23, 59, 59, 999); // ตั้งเวลาให้ครบวัน
      } catch (e) {
        console.error("Invalid time_range format:", e);
      }
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (datePreset) {
        case "today":
          startDate = today;
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "yesterday":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 1);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_7d":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_30d":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this_month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last_month":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          // ไม่กรองถ้าไม่รู้จัก preset
          break;
      }
    }

    // กรองข้อมูลตามวันที่ (ถ้ามีคอลัมน์วันที่และมีการระบุช่วงเวลา)
    if (dateColIndex >= 0 && startDate && endDate) {
      console.log("=== DATE FILTERING START ===");
      console.log("Date range:", {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        startLocal: startDate.toLocaleDateString("th-TH"),
        endLocal: endDate.toLocaleDateString("th-TH"),
      });

      let matchCount = 0;
      let skipCount = 0;

      filteredRows = dataRows.filter((row: any[], rowIndex: number) => {
        const dateValue = row[dateColIndex];
        const namePhoneValue = row[namePhoneColIndex];

        if (!dateValue) {
          console.log(`Row ${rowIndex + 2}: No date value`);
          skipCount++;
          return false;
        }

        // พยายาม parse วันที่จากหลายรูปแบบ
        let rowDate: Date | null = null;
        const dateStr = dateValue.toString().trim();

        // รูปแบบ ISO (YYYY-MM-DD)
        if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateStr)) {
          rowDate = new Date(dateStr);
        }
        // รูปแบบ DD/MM/YYYY หรือ D/M/YYYY (รูปแบบไทย)
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
          const parts = dateStr.split("/");
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          rowDate = new Date(year, month, day);
        }
        // รูปแบบ DD-MM-YYYY หรือ D-M-YYYY
        else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateStr)) {
          const parts = dateStr.split("-");
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          rowDate = new Date(year, month, day);
        }
        // รูปแบบ YYYY/MM/DD
        else if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(dateStr)) {
          const parts = dateStr.split("/");
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          rowDate = new Date(year, month, day);
        }
        // รูปแบบที่มีเวลาด้วย เช่น "DD/MM/YYYY HH:MM:SS"
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{1,2}/.test(dateStr)) {
          const [datePart] = dateStr.split(" ");
          const parts = datePart.split("/");
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          rowDate = new Date(year, month, day);
        }
        // พยายาม parse แบบทั่วไป
        else {
          rowDate = new Date(dateStr);
        }

        if (!rowDate || isNaN(rowDate.getTime())) {
          console.log(
            `Row ${rowIndex + 2}: Failed to parse date: "${dateValue}"`
          );
          skipCount++;
          return false;
        }

        // ตั้งเวลาเป็นเที่ยงคืนเพื่อเปรียบเทียบแค่วันที่
        rowDate.setHours(0, 0, 0, 0);

        const isInRange = rowDate >= startDate! && rowDate <= endDate!;

        if (isInRange) {
          matchCount++;
          console.log(
            `Row ${
              rowIndex + 2
            }: ✓ MATCH - Date: ${dateStr} => ${rowDate.toLocaleDateString(
              "th-TH"
            )}, Value: "${namePhoneValue || "(empty)"}"`
          );
        } else {
          console.log(
            `Row ${
              rowIndex + 2
            }: ✗ OUT OF RANGE - Date: ${dateStr} => ${rowDate.toLocaleDateString(
              "th-TH"
            )}`
          );
          skipCount++;
        }

        return isInRange;
      });

      console.log(`=== DATE FILTERING RESULT ===`);
      console.log(`Total rows: ${dataRows.length}`);
      console.log(`Matched: ${matchCount}`);
      console.log(`Skipped: ${skipCount}`);
      console.log(`Filtered result: ${filteredRows.length} rows`);
    } else {
      console.log("No date filtering applied (using all rows)");
      if (dateColIndex < 0) {
        console.log("Reason: Date column not found");
      }
      if (!startDate || !endDate) {
        console.log("Reason: Date range not specified");
      }
    }

    // นับจำนวนแถวที่มีค่าในคอลัมน์ "ได้ชื่อได้เบอร์"
    console.log(`=== COUNTING VALID DATA ===`);
    console.log(`Checking column index: ${namePhoneColIndex}`);

    const validRows = filteredRows.filter((row: any[], index: number) => {
      const value = row[namePhoneColIndex];
      const hasValue = value && value.toString().trim() !== "";

      if (hasValue) {
        console.log(`✓ Row has data: "${value}"`);
      } else {
        console.log(`✗ Row empty or invalid: "${value}"`);
      }

      return hasValue;
    });

    const count = validRows.length;

    console.log(`=== FINAL COUNT ===`);
    console.log(`Valid rows with data in "ได้ชื่อได้เบอร์" column: ${count}`);

    // ถ้าต้องการข้อมูลรายวัน
    if (daily && dateColIndex >= 0) {
      console.log(`=== GROUPING BY DATE ===`);

      // จัดกลุ่มข้อมูลตามวันที่
      const dailyDataMap = new Map<string, number>();

      validRows.forEach((row: any[]) => {
        const dateValue = row[dateColIndex];
        if (!dateValue) return;

        // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
        let dateStr = "";
        const rawDateStr = dateValue.toString().trim();

        // รูปแบบ ISO (YYYY-MM-DD)
        if (/^\d{4}-\d{1,2}-\d{1,2}/.test(rawDateStr)) {
          dateStr = rawDateStr.split(" ")[0]; // เอาแค่ส่วนวันที่
        }
        // รูปแบบ DD/MM/YYYY
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(rawDateStr)) {
          const parts = rawDateStr.split(" ")[0].split("/");
          const day = parts[0].padStart(2, "0");
          const month = parts[1].padStart(2, "0");
          const year = parts[2];
          dateStr = `${year}-${month}-${day}`;
        }
        // รูปแบบ DD-MM-YYYY
        else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(rawDateStr)) {
          const parts = rawDateStr.split(" ")[0].split("-");
          const day = parts[0].padStart(2, "0");
          const month = parts[1].padStart(2, "0");
          const year = parts[2];
          dateStr = `${year}-${month}-${day}`;
        }
        // รูปแบบ YYYY/MM/DD
        else if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(rawDateStr)) {
          const parts = rawDateStr.split(" ")[0].split("/");
          const year = parts[0];
          const month = parts[1].padStart(2, "0");
          const day = parts[2].padStart(2, "0");
          dateStr = `${year}-${month}-${day}`;
        }

        if (dateStr) {
          const currentCount = dailyDataMap.get(dateStr) || 0;
          dailyDataMap.set(dateStr, currentCount + 1);
        }
      });

      // แปลงเป็น array และเรียงตามวันที่
      const dailyData = Array.from(dailyDataMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      console.log(`✅ Daily breakdown: ${dailyData.length} days`);
      dailyData.forEach((d) => {
        console.log(`  ${d.date}: ${d.count} records`);
      });

      return NextResponse.json({
        success: true,
        dailyData: dailyData,
        total: count,
        dateRange: {
          start: startDate?.toISOString().split("T")[0],
          end: endDate?.toISOString().split("T")[0],
        },
      });
    }

    return NextResponse.json({
      success: true,
      total: count,
      dateRange: {
        start: startDate?.toISOString().split("T")[0],
        end: endDate?.toISOString().split("T")[0],
      },
      dateColIndex: dateColIndex,
      hasDateColumn: dateColIndex >= 0,
      totalRowsBeforeFilter: dataRows.length,
      rowsAfterDateFilter: filteredRows.length,
      data: validRows.slice(0, 10).map((row: any[]) => ({
        date: dateColIndex >= 0 ? row[dateColIndex] : null,
        namePhone: row[namePhoneColIndex],
      })),
    });
  } catch (error: any) {
    console.error("Error fetching Google Sheets data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Google Sheets",
        details: error,
      },
      { status: 500 }
    );
  }
}

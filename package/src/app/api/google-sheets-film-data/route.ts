import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// In-memory cache with date key
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 120000; // 2 นาที (120 วินาที) - ลด API calls

export async function GET(request: NextRequest) {
  try {
    // รับพารามิเตอร์ date จาก query string (รูปแบบ YYYY-MM-DD)
    const { searchParams } = new URL(request.url);
    const targetDate =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // ตรวจสอบ cache ก่อน
    const cacheKey = `film-${targetDate}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Returning cached film-data for ${targetDate}`);
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

    // ดึงข้อมูลจากชีท "Film data"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Film data!A:Z", // ดึงข้อมูลทั้งหมดจากชีท
    });

    const rows = response.data.values;

    // ดึงข้อมูลจากชีท "Film_dev" เพิ่มเติม
    const filmDevResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Film_dev!A:Z",
    });

    const filmDevRows = filmDevResponse.data.values || [];

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

    console.log("=== GOOGLE SHEETS - Film data ===");
    console.log("Target date:", targetDate);
    console.log("Total columns:", headers.length);
    console.log("Headers:", headers);
    console.log("Total data rows:", dataRows.length);

    // หา index ของคอลัมน์ที่ต้องการ
    const contactPersonIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes("ผู้ติดต่อ") || h === "ผู้ติดต่อ"
    );
    const consultDateIndex = headers.findIndex(
      (h: string) =>
        h.toLowerCase().includes("วันที่ได้นัด consult") ||
        h === "วันที่ได้นัด consult"
    );
    const surgeryDateIndex = headers.findIndex(
      (h: string) =>
        h.toLowerCase().includes("วันที่ได้นัดผ่าตัด") ||
        h === "วันที่ได้นัดผ่าตัด"
    );

    if (contactPersonIndex === -1 || consultDateIndex === -1) {
      console.error("❌ Required columns not found");
      console.error("contactPersonIndex:", contactPersonIndex);
      console.error("consultDateIndex:", consultDateIndex);
      console.error("surgeryDateIndex:", surgeryDateIndex);
      return NextResponse.json(
        {
          success: false,
          error: "Required columns not found in Film data sheet",
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

    // นับจำนวนแต่ละ agent ที่มีวันที่ตรงกับ targetDate
    const agentCounts: { [key: string]: number } = {};
    const surgeryCounts: { [key: string]: number } = {};

    // Initialize counts
    Object.values(agentNameMap).forEach((agentId) => {
      agentCounts[agentId] = 0;
      surgeryCounts[agentId] = 0;
    });

    // ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบ YYYY-MM-DD
    const normalizeDate = (dateStr: string): string | null => {
      if (!dateStr || dateStr.trim() === "") return null;

      try {
        // ลองแปลงวันที่หลายรูปแบบ
        // รูปแบบ: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
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

    let matchedConsultRows = 0;
    let matchedSurgeryRows = 0;

    dataRows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const contactPerson = row[contactPersonIndex]?.toString().trim() || "";
      const consultDate = row[consultDateIndex]?.toString().trim() || "";
      const surgeryDate =
        surgeryDateIndex !== -1
          ? row[surgeryDateIndex]?.toString().trim() || ""
          : "";

      if (!contactPerson) return;

      // หา agent ID จากชื่อผู้ติดต่อ
      let matchedAgentId: string | null = null;
      for (const [agentName, agentId] of Object.entries(agentNameMap)) {
        if (contactPerson.includes(agentName)) {
          matchedAgentId = agentId;
          break;
        }
      }

      if (!matchedAgentId) {
        return;
      }

      // นับจำนวนนัด consult
      if (consultDate) {
        const normalizedConsultDate = normalizeDate(consultDate);
        if (normalizedConsultDate === targetDate) {
          agentCounts[matchedAgentId]++;
          matchedConsultRows++;
          console.log(
            `✅ Consult Row ${
              index + 2
            }: ${contactPerson} (${matchedAgentId}) on ${normalizedConsultDate}`
          );
        }
      }

      // นับจำนวนนัดผ่าตัด
      if (surgeryDate && surgeryDateIndex !== -1) {
        const normalizedSurgeryDate = normalizeDate(surgeryDate);
        if (normalizedSurgeryDate === targetDate) {
          surgeryCounts[matchedAgentId]++;
          matchedSurgeryRows++;
          console.log(
            `✅ Surgery Row ${
              index + 2
            }: ${contactPerson} (${matchedAgentId}) on ${normalizedSurgeryDate}`
          );
        }
      }
    });

    const totalConsults = Object.values(agentCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalSurgeries = Object.values(surgeryCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    // ประมวลผลข้อมูลจาก Film_dev (วันที่ได้นัด consult - คอลัมน์ O)
    const filmDevConsultCounts: { [key: string]: number } = {};
    Object.values(agentNameMap).forEach((agentId) => {
      filmDevConsultCounts[agentId] = 0;
    });

    if (filmDevRows.length > 0) {
      const filmDevHeaders = filmDevRows[0];
      const filmDevDataRows = filmDevRows.slice(1);

      console.log("=== GOOGLE SHEETS - Film_dev ===");
      console.log("Total Film_dev columns:", filmDevHeaders.length);
      console.log("Film_dev Headers:", filmDevHeaders);
      console.log("Total Film_dev data rows:", filmDevDataRows.length);

      // หา index ของคอลัมน์ที่ต้องการ
      const contactPersonIndexDev = filmDevHeaders.findIndex(
        (h: string) =>
          h.toLowerCase().includes("ผู้ติดต่อ") || h === "ผู้ติดต่อ"
      );
      const consultDateIndexDev = filmDevHeaders.findIndex(
        (h: string) =>
          h.toLowerCase().includes("วันที่ได้นัด consult") ||
          h === "วันที่ได้นัด consult"
      );

      console.log("Film_dev contactPersonIndex:", contactPersonIndexDev);
      console.log("Film_dev consultDateIndex:", consultDateIndexDev);

      if (contactPersonIndexDev !== -1 && consultDateIndexDev !== -1) {
        let matchedFilmDevRows = 0;

        filmDevDataRows.forEach((row, index) => {
          if (!row || row.length === 0) return;

          const contactPerson =
            row[contactPersonIndexDev]?.toString().trim() || "";
          const consultDate = row[consultDateIndexDev]?.toString().trim() || "";

          // ตรวจสอบว่ามีวันที่และผู้ติดต่อ
          if (consultDate && contactPerson) {
            const normalizedConsultDate = normalizeDate(consultDate);

            // กรองเฉพาะวันที่ตรงกับ targetDate
            if (normalizedConsultDate === targetDate) {
              // หา agent ID จากชื่อผู้ติดต่อ
              let matchedAgentId: string | null = null;
              for (const [agentName, agentId] of Object.entries(agentNameMap)) {
                if (contactPerson.includes(agentName)) {
                  matchedAgentId = agentId;
                  break;
                }
              }

              if (matchedAgentId) {
                filmDevConsultCounts[matchedAgentId]++;
                matchedFilmDevRows++;
                console.log(
                  `✅ Film_dev Row ${
                    index + 2
                  }: ${contactPerson} (${matchedAgentId}) on ${normalizedConsultDate}`
                );
              }
            }
          }
        });

        console.log("Film_dev matched rows:", matchedFilmDevRows);
        console.log("Film_dev consult counts:", filmDevConsultCounts);
      } else {
        console.warn("⚠️ Film_dev: Required columns not found");
      }
    }

    // รวมจำนวน consult จาก Film data และ Film_dev
    const combinedConsultCounts: { [key: string]: number } = {};
    Object.keys(agentCounts).forEach((agentId) => {
      combinedConsultCounts[agentId] =
        (agentCounts[agentId] || 0) + (filmDevConsultCounts[agentId] || 0);
    });

    const totalCombinedConsults = Object.values(combinedConsultCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    console.log("=== RESULTS ===");
    console.log("Matched consult rows (Film data):", matchedConsultRows);
    console.log("Matched surgery rows:", matchedSurgeryRows);
    console.log("Film data consult counts:", agentCounts);
    console.log("Film_dev consult counts:", filmDevConsultCounts);
    console.log("Combined consult counts:", combinedConsultCounts);
    console.log("Agent surgery counts:", surgeryCounts);
    console.log("Total consults (Film data only):", totalConsults);
    console.log("Total consults (Combined):", totalCombinedConsults);
    console.log("Total surgeries:", totalSurgeries);

    // อัพเดท cache
    const responseData = {
      success: true,
      date: targetDate,
      agentCounts: agentCounts, // ใช้เฉพาะข้อมูลจาก Film data
      surgeryCounts: surgeryCounts,
      totalConsults: totalConsults, // ใช้จำนวนจาก Film data เท่านั้น
      totalSurgeries: totalSurgeries,
      debug: {
        filmDataRows: dataRows.length,
        filmDevRows: filmDevRows.length - 1,
        matchedConsultRows: matchedConsultRows,
        matchedSurgeryRows: matchedSurgeryRows,
        filmDataConsultCounts: agentCounts,
        filmDevConsultCounts: filmDevConsultCounts,
        combinedConsultCounts: combinedConsultCounts,
        contactPersonColumn: headers[contactPersonIndex],
        consultDateColumn: headers[consultDateIndex],
        surgeryDateColumn:
          surgeryDateIndex !== -1 ? headers[surgeryDateIndex] : "Not found",
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
    console.error("Error fetching Google Sheets (Film data):", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'Failed to fetch data from Google Sheets "Film data"',
        details: error,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// In-memory cache
let cachedData: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 120000; // 2 นาที (120 วินาที) - ลด API calls

export async function GET(request: NextRequest) {
  // ตรวจสอบ cache ก่อน
  const now = Date.now();
  if (cachedData && now - cacheTime < CACHE_DURATION) {
    console.log("✅ Returning cached Log_call_ai data");
    return NextResponse.json(cachedData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
        "X-Cache-Status": "HIT",
      },
    });
  }
  try {
    const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
    const SHEET_NAME = "Log_call_ai"; // ชื่อชีทที่ต้องการดึง

    if (!SPREADSHEET_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_SPREADSHEET_ID is not configured",
        },
        { status: 500 }
      );
    }

    // ตรวจสอบว่ามี credentials หรือไม่
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured",
        },
        { status: 500 }
      );
    }

    // Parse credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ดึงข้อมูลจาก Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`, // ดึงทุกคอลัมน์
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No data found in the sheet",
        },
        { status: 404 }
      );
    }

    // แถวแรกคือ headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // แปลงข้อมูลเป็น array of objects
    const data = dataRows.map((row, index) => {
      const rowData: { [key: string]: any } = {
        id: `log-${index + 1}`,
      };

      headers.forEach((header: string, colIndex: number) => {
        rowData[header] = row[colIndex] || "";
      });

      return rowData;
    });

    // อัพเดท cache
    const responseData = {
      success: true,
      data: data,
      headers: headers,
      totalRows: data.length,
    };
    cachedData = responseData;
    cacheTime = Date.now();

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Error fetching Google Sheets Log_call_ai:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Google Sheets",
      },
      { status: 500 }
    );
  }
}

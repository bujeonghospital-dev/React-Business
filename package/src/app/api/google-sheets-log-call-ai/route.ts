import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const SHEET_NAME = "Log_call_ai"; // ชื่อชีทที่ต้องการดึง

    if (!SPREADSHEET_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_SHEETS_SPREADSHEET_ID is not configured",
        },
        { status: 500 }
      );
    }

    // ตรวจสอบว่ามี credentials หรือไม่
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_SHEETS_CREDENTIALS is not configured",
        },
        { status: 500 }
      );
    }

    // Parse credentials
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
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

    return NextResponse.json(
      {
        success: true,
        data: data,
        headers: headers,
        totalRows: data.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
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

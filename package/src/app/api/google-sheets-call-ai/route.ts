import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
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

    // ดึงข้อมูลจากชีท "สรุป call_AI"
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "สรุป call_AI!A:Z", // ดึงข้อมูลทั้งหมดจากชีท
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

    console.log("=== GOOGLE SHEETS - สรุป call_AI ===");
    console.log("Total columns:", headers.length);
    console.log("Headers:", headers);
    console.log("Total data rows:", dataRows.length);

    // แปลงข้อมูลเป็น array of objects
    const data = dataRows
      .filter((row) => row && row.length > 0) // กรองแถวว่าง
      .map((row, index) => {
        const rowData: any = { id: `row-${index + 1}` };

        // Map ค่าจากแต่ละคอลัมน์ตาม header
        headers.forEach((header: string, colIndex: number) => {
          const value = row[colIndex] || "";
          // ใช้ header เป็น key (ลบช่องว่างและแปลงเป็น camelCase ถ้าต้องการ)
          rowData[header] = value;
        });

        return rowData;
      });

    console.log("Processed data rows:", data.length);
    console.log("Sample first row:", data[0]);

    return NextResponse.json({
      success: true,
      total: data.length,
      headers: headers,
      data: data,
    });
  } catch (error: any) {
    console.error("Error fetching Google Sheets (สรุป call_AI):", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'Failed to fetch data from Google Sheets "สรุป call_AI"',
        details: error,
      },
      { status: 500 }
    );
  }
}

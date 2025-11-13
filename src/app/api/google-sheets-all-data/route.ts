import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

interface TableData {
  headers: string[];
  rows: any[][];
}

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ credentials
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

    // สร้าง auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SA_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ดึงข้อมูล spreadsheet metadata ก่อนเพื่อหาชื่อชีท
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const allSheets = spreadsheetInfo.data.sheets || [];
    console.log(
      "📋 Available sheets:",
      allSheets.map((s) => s.properties?.title)
    );

    // หาชีทที่ชื่อ "Film data"
    const targetSheet = allSheets.find(
      (sheet) => sheet.properties?.title === "Film data"
    );

    if (!targetSheet || !targetSheet.properties?.title) {
      return NextResponse.json(
        {
          success: false,
          error: `Sheet 'Film data' not found. Available sheets: ${allSheets
            .map((s) => s.properties?.title)
            .join(", ")}`,
        },
        { status: 404 }
      );
    }

    const sheetName = targetSheet.properties.title;
    const sheetId = targetSheet.properties.sheetId;

    console.log(`✅ Found sheet: "${sheetName}" (ID: ${sheetId})`);

    // ดึงข้อมูล raw values (ใช้ A:ZZ เพื่อครอบคลุมคอลัมน์มากขึ้น)
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${sheetName}'`, // ใช้ single quotes ครอบชื่อชีท (ไม่ระบุ range จะดึงทั้งหมด)
    });

    const rows = valuesResponse.data.values || [];

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        tables: [],
      });
    }

    console.log(`📊 Total rows in sheet: ${rows.length}`);
    console.log(`📊 Total columns: ${rows[0]?.length || 0}`);

    // ดึงข้อมูลทั้งหมด (ไม่หาสีเหลือง)
    // สมมติว่าแถวแรกเป็น header
    const headers = rows[0] || [];
    const dataRows = rows.slice(1); // ข้อมูลตั้งแต่แถวที่ 2 เป็นต้นไป

    console.log(`� Headers (${headers.length}):`, headers);
    console.log(`📋 Data rows: ${dataRows.length}`);

    // จัดรูปแบบข้อมูล
    const formattedData = dataRows.map((row) => {
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, colIndex: number) => {
        rowData[header] = row?.[colIndex] || "";
      });
      return rowData;
    });

    // สร้างตารางเดียว
    const table = {
      tableNumber: 1,
      headers: headers,
      rowCount: formattedData.length,
      data: formattedData,
    };

    const formattedTables = [table];

    console.log(`✅ Loaded all data from sheet: ${formattedData.length} rows`);

    return NextResponse.json({
      success: true,
      totalTables: formattedTables.length,
      tables: formattedTables,
      rawData: {
        totalRows: rows.length,
        totalColumns: rows[0]?.length || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching Google Sheets data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Google Sheets",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

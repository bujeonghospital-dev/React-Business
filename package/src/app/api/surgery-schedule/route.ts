import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get the month and year from query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Get credentials from environment variables
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!privateKey || !clientEmail || !spreadsheetId) {
      return NextResponse.json(
        {
          error:
            "Missing required environment variables: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_SPREADSHEET_ID",
        },
        { status: 500 }
      );
    }

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Film data!A1:Z1000",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // First row contains headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Map column indices
    const columnIndices = {
      หมอ: headers.indexOf("หมอ"),
      ผู้ติดต่อ: headers.indexOf("ผู้ติดต่อ"),
      ชื่อ: headers.indexOf("ชื่อ"),
      เบอร์โทร: headers.indexOf("เบอร์โทร"),
      วันที่ได้นัดผ่าตัด: headers.indexOf("วันที่ได้นัดผ่าตัด"),
      เวลาที่นัด: headers.indexOf("เวลาที่นัด"),
      ยอดนำเสนอ: headers.indexOf("ยอดนำเสนอ"),
    };

    // Check if all required columns exist
    const missingColumns = Object.entries(columnIndices)
      .filter(([_, index]) => index === -1)
      .map(([name]) => name);

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Parse data rows
    const scheduleData = dataRows
      .filter((row: any[]) => row[columnIndices.วันที่ได้นัดผ่าตัด])
      .map((row: any[]) => ({
        หมอ: row[columnIndices.หมอ] || "",
        ผู้ติดต่อ: row[columnIndices.ผู้ติดต่อ] || "",
        ชื่อ: row[columnIndices.ชื่อ] || "",
        เบอร์โทร: row[columnIndices.เบอร์โทร] || "",
        วันที่ได้นัดผ่าตัด: row[columnIndices.วันที่ได้นัดผ่าตัด] || "",
        เวลาที่นัด: row[columnIndices.เวลาที่นัด] || "",
        ยอดนำเสนอ: row[columnIndices.ยอดนำเสนอ] || "",
      }));

    return NextResponse.json({ data: scheduleData });
  } catch (error: any) {
    console.error("Error fetching surgery schedule data:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data from Google Sheets",
      },
      { status: 500 }
    );
  }
}

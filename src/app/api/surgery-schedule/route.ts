import { google } from "googleapis";
import { NextResponse } from "next/server";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Fetch data from the sheet - get all columns like Python API
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Film data!A:AZ", // Extended range to match Python API
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        message: "No data found in Film data sheet",
      });
    }

    // First row contains headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log("\n=== GOOGLE SHEETS - Film data (Surgery Schedule) ===");
    console.log(`Total columns: ${headers.length}`);
    console.log(`Total data rows: ${dataRows.length}`);

    // Case-insensitive column finder (like Python API)
    const findColumnIndex = (headerName: string): number => {
      for (let idx = 0; idx < headers.length; idx++) {
        const header = headers[idx];
        if (
          header &&
          header.toString().trim().toLowerCase() === headerName.toLowerCase()
        ) {
          return idx;
        }
      }
      return -1;
    };

    // Find indexes for surgery-related columns
    const doctorIdx = findColumnIndex("หมอ");
    const contactPersonIdx = findColumnIndex("ผู้ติดต่อ");
    const nameIdx = findColumnIndex("ชื่อ");
    const phoneIdx = findColumnIndex("เบอร์โทร");
    const dateSurgeryScheduledIdx = findColumnIndex("วันที่ได้นัดผ่าตัด");
    const timeScheduledIdx = findColumnIndex("เวลาที่นัด");
    const amountIdx = findColumnIndex("ยอดนำเสนอ");
    const surgeryDateIdx = findColumnIndex("วันที่ผ่าตัด");
    const dateConsultScheduledIdx = findColumnIndex("วันที่ได้นัด consult");

    console.log("\n=== MAPPING COLUMNS ===");
    console.log(
      `หมอ (index ${doctorIdx}): '${
        doctorIdx >= 0 ? headers[doctorIdx] : "N/A"
      }'`
    );
    console.log(
      `ผู้ติดต่อ (index ${contactPersonIdx}): '${
        contactPersonIdx >= 0 ? headers[contactPersonIdx] : "N/A"
      }'`
    );
    console.log(
      `ชื่อ (index ${nameIdx}): '${nameIdx >= 0 ? headers[nameIdx] : "N/A"}'`
    );
    console.log(
      `เบอร์โทร (index ${phoneIdx}): '${
        phoneIdx >= 0 ? headers[phoneIdx] : "N/A"
      }'`
    );
    console.log(
      `วันที่ได้นัดผ่าตัด (index ${dateSurgeryScheduledIdx}): '${
        dateSurgeryScheduledIdx >= 0 ? headers[dateSurgeryScheduledIdx] : "N/A"
      }'`
    );
    console.log(
      `เวลาที่นัด (index ${timeScheduledIdx}): '${
        timeScheduledIdx >= 0 ? headers[timeScheduledIdx] : "N/A"
      }'`
    );
    console.log(
      `ยอดนำเสนอ (index ${amountIdx}): '${
        amountIdx >= 0 ? headers[amountIdx] : "N/A"
      }'`
    );
    console.log(
      `วันที่ผ่าตัด (index ${surgeryDateIdx}): '${
        surgeryDateIdx >= 0 ? headers[surgeryDateIdx] : "N/A"
      }'`
    );
    console.log(
      `วันที่ได้นัด consult (index ${dateConsultScheduledIdx}): '${
        dateConsultScheduledIdx >= 0 ? headers[dateConsultScheduledIdx] : "N/A"
      }'`
    );

    // Process data rows (like Python API - include all records)
    const scheduleData = [];

    for (let idx = 0; idx < dataRows.length; idx++) {
      const row = dataRows[idx];

      if (!row || row.length === 0) {
        continue;
      }

      // Get values safely (like Python API)
      const getValue = (colIdx: number): string => {
        return (row[colIdx] && row[colIdx].toString().trim()) || "";
      };

      const doctor = getValue(doctorIdx);
      const contactPerson = getValue(contactPersonIdx);
      const name = getValue(nameIdx);
      const phone = getValue(phoneIdx);
      const dateSurgeryScheduled = getValue(dateSurgeryScheduledIdx);
      const timeScheduled = getValue(timeScheduledIdx);
      const amount = getValue(amountIdx);
      const surgeryDate = getValue(surgeryDateIdx);
      const dateConsultScheduled = getValue(dateConsultScheduledIdx);

      // Add record (include all records, frontend will filter)
      scheduleData.push({
        id: `film-${idx + 2}`,
        หมอ: doctor,
        ผู้ติดต่อ: contactPerson || "ไม่ระบุ",
        ชื่อ: name,
        เบอร์โทร: phone,
        วันที่ได้นัดผ่าตัด: dateSurgeryScheduled,
        เวลาที่นัด: timeScheduled,
        ยอดนำเสนอ: amount,
        วันที่ผ่าตัด: surgeryDate,
        date_consult_scheduled: dateConsultScheduled,
        contact_person: contactPerson || "ไม่ระบุ",
        date_surgery_scheduled: dateSurgeryScheduled,
        surgery_date: surgeryDate,
      });
    }

    console.log("\n=== RESULTS ===");
    console.log(`Total records processed: ${scheduleData.length}`);

    // Sample first 3 rows for debugging
    console.log("📊 ตัวอย่างข้อมูล 3 รายการแรก:");
    scheduleData.slice(0, 3).forEach((item: any, idx: number) => {
      console.log(
        `  [${idx + 1}] ชื่อ: "${item.ชื่อ}", ผู้ติดต่อ: "${
          item.ผู้ติดต่อ
        }", วันที่P: "${item.วันที่ได้นัดผ่าตัด}", วันที่L: "${
          item.วันที่ผ่าตัด
        }"`
      );
    });

    return NextResponse.json(
      {
        success: true,
        data: scheduleData,
        total: scheduleData.length,
        timestamp: new Date().toISOString(),
        debug: {
          totalRows: dataRows.length,
          processedRows: scheduleData.length,
          columns: {
            doctor: `หมอ (index ${doctorIdx})`,
            contact_person: `ผู้ติดต่อ (index ${contactPersonIdx})`,
            name: `ชื่อ (index ${nameIdx})`,
            phone: `เบอร์โทร (index ${phoneIdx})`,
            date_surgery_scheduled: `วันที่ได้นัดผ่าตัด (index ${dateSurgeryScheduledIdx})`,
            time_scheduled: `เวลาที่นัด (index ${timeScheduledIdx})`,
            amount: `ยอดนำเสนอ (index ${amountIdx})`,
            surgery_date: `วันที่ผ่าตัด (index ${surgeryDateIdx})`,
            date_consult_scheduled: `วันที่ได้นัด consult (index ${dateConsultScheduledIdx})`,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
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

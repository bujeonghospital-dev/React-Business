import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const cache = new Map();
const CACHE_DURATION = 10000;

export async function GET(request: NextRequest) {
  try {
    const cacheKey = "film-call-status";
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, { status: 200 });
    }

    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
      !process.env.GOOGLE_SPREADSHEET_ID
    ) {
      return NextResponse.json(
        { success: false, error: "Missing credentials" },
        { status: 500 }
      );
    }

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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Film_dev!A:Z",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, data: [], total: 0 });
    }

    let headers = rows[0];
    let dataRows = rows.slice(1);

    if (
      rows[0].some((cell: string) =>
        /^[A-Z]{1,3}$/.test(String(cell || "").trim())
      )
    ) {
      headers = rows[1];
      dataRows = rows.slice(2);
    }

    console.log("Total columns:", headers.length);
    console.log("Headers:", headers);

    const findCol = (terms: string[]) =>
      headers.findIndex((h: string) =>
        terms.some((t) =>
          String(h || "")
            .toLowerCase()
            .includes(t.toLowerCase())
        )
      );

    let statusIdx = findCol(["status", "สถานะ", "ไม่สนใจ"]);
    let phoneIdx = findCol(["เบอร์", "phone", "tel"]);
    let nameIdx = findCol(["ชื่อ", "name"]);
    const productIdx = findCol(["ผลิตภัณฑ์", "product"]);
    let remarksIdx = findCol(["หมายเหตุ", "remarks", "note"]);

    if (phoneIdx === -1 && dataRows.length > 0) {
      for (let i = 0; i < Math.min(dataRows[0].length, 20); i++) {
        if (/^0\d{8,9}$/.test(dataRows[0][i]?.toString() || "")) {
          phoneIdx = i;
          nameIdx = nameIdx === -1 && i > 0 ? i - 1 : nameIdx;
          statusIdx = statusIdx === -1 ? 0 : statusIdx;
          remarksIdx = remarksIdx === -1 ? i + 1 : remarksIdx;
          break;
        }
      }
    }

    if (phoneIdx === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone column not found",
          availableHeaders: headers,
        },
        { status: 400 }
      );
    }

    const calls: any[] = [];
    const statuses = new Set();

    dataRows.forEach((row, idx) => {
      if (!row || row.length === 0) return;
      const status =
        statusIdx !== -1 ? row[statusIdx]?.toString().trim() || "" : "";
      const phone =
        phoneIdx !== -1 ? row[phoneIdx]?.toString().trim() || "" : "";
      const name = nameIdx !== -1 ? row[nameIdx]?.toString().trim() || "" : "";
      const product =
        productIdx !== -1 ? row[productIdx]?.toString().trim() || "" : "";
      const remarks =
        remarksIdx !== -1 ? row[remarksIdx]?.toString().trim() || "" : "";

      if (status) statuses.add(status);
      if (
        (statusIdx === -1 || status === "อยู่ระหว่างโทรออก") &&
        /^0\d{8,9}$/.test(phone)
      ) {
        calls.push({
          id: `film-${idx + 2}`,
          customerName: name || phone,
          phoneNumber: phone,
          product,
          remarks,
          status: status || "unknown",
          contactDate: new Date().toISOString(),
        });
      }
    });

    const data = {
      success: true,
      data: calls,
      total: calls.length,
      timestamp: new Date().toISOString(),
      debug: {
        totalRows: dataRows.length,
        matchedRows: calls.length,
        columns: {
          status: statusIdx,
          phone: phoneIdx,
          name: nameIdx,
          product: productIdx,
          remarks: remarksIdx,
        },
        uniqueStatuses: Array.from(statuses).sort(),
        allHeaders: headers,
      },
    };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

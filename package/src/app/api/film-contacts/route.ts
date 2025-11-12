import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * GET /api/film-contacts
 * ดึงข้อมูลการติดต่อจาก Google Sheets (Film_dev) โดยตรง
 * กรองเฉพาะสถานะ "อยู่ระหว่างโทรออก"
 */

// Cache to reduce Google Sheets API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Check cache first
    const cacheKey = "film-contacts";
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Apply search filter if needed
      let contacts = cached.data;
      if (search && contacts.length > 0) {
        const searchLower = search.toLowerCase();
        contacts = contacts.filter(
          (c: any) =>
            c.customerName?.toLowerCase().includes(searchLower) ||
            c.phoneNumber?.includes(search) ||
            c.product?.toLowerCase().includes(searchLower) ||
            c.remarks?.toLowerCase().includes(searchLower)
        );
      }

      return NextResponse.json({
        success: true,
        data: contacts,
        total: contacts.length,
        timestamp: cached.timestamp,
        source: "Film_dev Google Sheets (cached)",
      });
    }

    // Validate environment variables
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
      !process.env.GOOGLE_SPREADSHEET_ID
    ) {
      console.error("Missing Google credentials");
      return NextResponse.json(
        {
          success: false,
          error: "Missing Google credentials configuration",
          data: [],
          total: 0,
        },
        { status: 500 }
      );
    }

    // Initialize Google Sheets API
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

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Film_dev!A:Z",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        timestamp: new Date().toISOString(),
        source: "Film_dev Google Sheets",
      });
    }

    // Parse headers and data
    let headers = rows[0];
    let dataRows = rows.slice(1);

    // Check if first row is column labels (A, B, C, etc.)
    if (
      rows[0].some((cell: string) =>
        /^[A-Z]{1,3}$/.test(String(cell || "").trim())
      )
    ) {
      headers = rows[1];
      dataRows = rows.slice(2);
    }

    // Find column indices
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

    // Fallback: auto-detect phone column
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
      console.error("Phone column not found in Google Sheets");
      return NextResponse.json({
        success: false,
        error: "Phone column not found in spreadsheet",
        availableHeaders: headers,
        data: [],
        total: 0,
      });
    }

    // Parse contacts
    const contacts: any[] = [];

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

      // Filter: only "อยู่ระหว่างโทรออก" status or no status column, and valid phone number
      if (
        (statusIdx === -1 || status === "อยู่ระหว่างโทรออก") &&
        /^0\d{8,9}$/.test(phone)
      ) {
        contacts.push({
          id: `film-${idx + 2}`,
          customerName: name || phone,
          phoneNumber: phone,
          product,
          remarks,
          status: "pending", // Map to dashboard status
          contactDate: new Date().toISOString(),
        });
      }
    });

    // Cache the result
    cache.set(cacheKey, { data: contacts, timestamp: Date.now() });

    // Apply search filter if needed
    let filteredContacts = contacts;
    if (search && contacts.length > 0) {
      const searchLower = search.toLowerCase();
      filteredContacts = contacts.filter(
        (c: any) =>
          c.customerName?.toLowerCase().includes(searchLower) ||
          c.phoneNumber?.includes(search) ||
          c.product?.toLowerCase().includes(searchLower) ||
          c.remarks?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredContacts,
      total: filteredContacts.length,
      timestamp: new Date().toISOString(),
      source: "Film_dev Google Sheets",
    });
  } catch (error: any) {
    console.error("Error fetching Film contacts:", error);

    // Return empty array instead of error to prevent UI crash
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      error: error?.message || "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

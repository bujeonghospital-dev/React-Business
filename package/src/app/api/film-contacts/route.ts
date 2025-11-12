import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * GET /api/film-contacts
 * ดึงข้อมูลการติดต่อจาก Google Sheets (Film_dev sheet) โดยตรง
 * กรองข้อมูลที่มีสถานะ "อยู่ระหว่างโทรออก"
 */

interface ContactData {
  id: string;
  customerName: string;
  phoneNumber: string;
  product: string;
  remarks: string;
  status: string;
  contactDate: string;
}

// Create Google Sheets service
async function getGoogleSheetsService() {
  const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Get Google Sheets service
    const sheets = await getGoogleSheetsService();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID not configured");
    }

    // Read only required columns to reduce data transfer and memory usage
    // C=ผลิตภัณฑ์, F=ชื่อ, G=เบอร์, H=หมายเหตุ, AS=status_call
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        "Film_dev!C:C", // Product (index 0 in results)
        "Film_dev!F:F", // Name (index 1)
        "Film_dev!G:G", // Phone (index 2)
        "Film_dev!H:H", // Remarks (index 3)
        "Film_dev!AS:AS", // Status (index 4)
      ],
    });

    const valueRanges = response.data.valueRanges;

    if (!valueRanges || valueRanges.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        timestamp: new Date().toISOString(),
        source: "Google Sheets (Film_dev)",
        message: "No data found in Film_dev sheet",
      });
    }

    // Extract columns
    const productCol = valueRanges[0]?.values || [];
    const nameCol = valueRanges[1]?.values || [];
    const phoneCol = valueRanges[2]?.values || [];
    const remarksCol = valueRanges[3]?.values || [];
    const statusCol = valueRanges[4]?.values || [];

    // Find the maximum length to iterate through all rows
    const maxLength = Math.max(
      productCol.length,
      nameCol.length,
      phoneCol.length,
      remarksCol.length,
      statusCol.length
    );

    if (maxLength === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        timestamp: new Date().toISOString(),
        source: "Google Sheets (Film_dev)",
        message: "No data found in Film_dev sheet",
      });
    }

    // Check if first row has column names - skip first 2 rows
    // Row 0 might be column letter (A, B, C), Row 1 is real header
    const startRow = 2;

    // Filter data with status "อยู่ระหว่างโทรออก"
    const contacts: ContactData[] = [];

    for (let idx = startRow; idx < maxLength; idx++) {
      // Get values safely from each column
      const status =
        idx < statusCol.length && statusCol[idx] && statusCol[idx][0]
          ? String(statusCol[idx][0]).trim()
          : "";
      const product =
        idx < productCol.length && productCol[idx] && productCol[idx][0]
          ? String(productCol[idx][0]).trim()
          : "";
      const name =
        idx < nameCol.length && nameCol[idx] && nameCol[idx][0]
          ? String(nameCol[idx][0]).trim()
          : "";
      const phone =
        idx < phoneCol.length && phoneCol[idx] && phoneCol[idx][0]
          ? String(phoneCol[idx][0]).trim()
          : "";
      const remarks =
        idx < remarksCol.length && remarksCol[idx] && remarksCol[idx][0]
          ? String(remarksCol[idx][0]).trim()
          : "";

      // Filter by status "อยู่ระหว่างโทรออก" and valid phone number
      if (status === "อยู่ระหว่างโทรออก" && phone && phone !== "-") {
        contacts.push({
          id: `film-${idx + 1}`,
          customerName: name || phone,
          phoneNumber: phone,
          product: product,
          remarks: remarks,
          status: "outgoing",
          contactDate: new Date().toISOString(),
        });
      }
    }

    // Filter by search if provided
    let filteredContacts = contacts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = contacts.filter(
        (c) =>
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
      source: "Google Sheets (Film_dev) - Direct API",
    });
  } catch (error) {
    console.error("Error fetching Film contacts:", error);

    // Return empty array instead of error to prevent UI crash
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}

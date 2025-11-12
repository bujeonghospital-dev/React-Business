import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/film-contacts
 * ดึงข้อมูลการติดต่อจาก Python API (Film_dev Google Sheets)
 * กรองเฉพาะสถานะ "อยู่ระหว่างโทรออก"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Call Python API
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:5000";
    const response = await fetch(`${pythonApiUrl}/api/film-call-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch data from Python API");
    }

    let contacts = result.data || [];

    // Filter by search if provided
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
      timestamp: new Date().toISOString(),
      source: "Film_dev Google Sheets",
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

import { NextResponse } from "next/server";

const ROBOCALL_API_KEY =
  "161d76de22e979407a675a6a1fc39cbab8885dbe468b9ab26576af6d2c6cc6ea";
const COMPANY_ID = "8b477f34-bdba-46bf-8b43-46a73be29880";

export async function GET() {
  try {
    const url = `https://client.yalecom.co.th/api/robocall?key=${ROBOCALL_API_KEY}&company_id=${COMPANY_ID}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // ไม่ cache เพื่อให้ได้ข้อมูลล่าสุดเสมอ
    });

    if (!response.ok) {
      throw new Error(`Robocall API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error("❌ Robocall API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Robocall data",
      },
      { status: 500 }
    );
  }
}

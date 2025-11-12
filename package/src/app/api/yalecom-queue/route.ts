import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔄 Fetching YaleCom queue status from server...");

    const response = await fetch(
      "https://client.yalecom.co.th/api/queue_status?key=161d76de22e979407a675a6a1fc39cbab8885dbe468b9ab26576af6d2c6cc6ea&company_id=8b477f34-bdba-46bf-8b43-46a73be29880&queue_extension=901",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Disable caching to get real-time data
      }
    );

    if (!response.ok) {
      console.error(
        "❌ YaleCom API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch queue status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ YaleCom queue data fetched successfully:", data);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("❌ Error in YaleCom API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

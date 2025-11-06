import { NextRequest, NextResponse } from "next/server";

// Yalecom API Configuration
const YALECOM_CONFIG = {
  company_id: "8b477f34-bdba-46bf-8b43-46a73be29880",
  key: "161d76de22e979407a675a6a1fc39cbab8885dbe468b9ab26576af6d2c6cc6ea",
  api_url: "https://client.yalecom.co.th/api/queue_status",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queueUuid = searchParams.get("queue_uuid");
    const queueExtension = searchParams.get("queue_extension");

    const params = new URLSearchParams({
      company_id: YALECOM_CONFIG.company_id,
      key: YALECOM_CONFIG.key,
    });

    if (queueUuid) {
      params.append("queue_uuid", queueUuid);
    } else if (queueExtension) {
      params.append("queue_extension", queueExtension);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "queue_uuid or queue_extension is required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${YALECOM_CONFIG.api_url}?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Yalecom API error:", data);
      return NextResponse.json(
        {
          success: false,
          error: `Yalecom API error: ${response.status} ${response.statusText}`,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching Yalecom queue status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

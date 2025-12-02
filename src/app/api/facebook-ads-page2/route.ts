import { NextRequest, NextResponse } from "next/server";

// Interface สำหรับข้อมูล Ad Insight
interface AdInsightData {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
}

interface FacebookApiResponse {
  data: AdInsightData[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Access token และ Ad Account ID สำหรับ Page 2
    const accessToken =
      "EAAPb1ZBYCiNcBPzNxxSUntCZCTVHyl5AkAZBIiwCmDzrWKMLU4VEHJxRve7oqUDSaMs8om9pdVWFLzUdeTbTvkGPuTeuQ4KvGFizMy3VsSid8vgmjZB8OMoLySRmXxyAUpAwyyhSqOO8tSZAU6IYpxarsXBbZCDzFdy8u279HxSXtyWMpIolRtjJEWLdmfU5SwZCsP5";
    const adAccountId = "act_869492750129928";

    // ดึง query parameters จาก request (ถ้ามี)
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date") || "yesterday";
    const datePreset = searchParams.get("date_preset");
    const timeRange = searchParams.get("time_range");

    // Fields ที่ต้องดึงตาม requirement
    const fields =
      "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm";

    // สร้าง URL สำหรับ Facebook Graph API
    const apiUrl = `https://graph.facebook.com/v24.0/${adAccountId}/insights`;

    const params = new URLSearchParams({
      access_token: accessToken,
      level: "ad",
      fields: fields,
    });

    // ถ้ามี time_range ให้ใช้ time_range
    if (timeRange) {
      params.append("time_range", timeRange);
    } else if (datePreset) {
      // ถ้ามี date_preset ให้ใช้ date_preset
      params.append("date_preset", datePreset);
    } else {
      // Default ใช้ yesterday
      params.append(
        "date_preset",
        dateParam === "yesterday" ? "yesterday" : dateParam
      );
    }

    console.log(
      "[Page 2 API] Fetching from:",
      `${apiUrl}?${params.toString().replace(accessToken, "***TOKEN***")}`
    );

    // เรียก Facebook Graph API
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // ป้องกัน cache
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Page 2 API] Facebook API Error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถดึงข้อมูลจาก Facebook Ads API ได้",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data: FacebookApiResponse = await response.json();

    // คำนวณ summary metrics
    const summary = {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalAds: data.data?.length || 0,
      avgCtr: 0,
      avgCpc: 0,
      avgCpm: 0,
    };

    if (data.data && data.data.length > 0) {
      data.data.forEach((ad) => {
        summary.totalSpend += parseFloat(ad.spend || "0");
        summary.totalImpressions += parseInt(ad.impressions || "0");
        summary.totalClicks += parseInt(ad.clicks || "0");
      });

      // คำนวณ Average CTR, CPC, CPM
      if (summary.totalImpressions > 0) {
        summary.avgCtr = (summary.totalClicks / summary.totalImpressions) * 100;
        summary.avgCpm = (summary.totalSpend / summary.totalImpressions) * 1000;
      }
      if (summary.totalClicks > 0) {
        summary.avgCpc = summary.totalSpend / summary.totalClicks;
      }
    }

    console.log("[Page 2 API] Success - Found", data.data?.length || 0, "ads");

    return NextResponse.json({
      success: true,
      data: data.data || [],
      summary: summary,
      paging: data.paging || null,
    });
  } catch (error) {
    console.error("[Page 2 API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

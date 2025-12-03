import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Access token สำหรับ Page 2 (hardcoded ตาม requirement)
    const accessToken =
      "EAAPb1ZBYCiNcBPzNxxSUntCZCTVHyl5AkAZBIiwCmDzrWKMLU4VEHJxRve7oqUDSaMs8om9pdVWFLzUdeTbTvkGPuTeuQ4KvGFizMy3VsSid8vgmjZB8OMoLySRmXxyAUpAwyyhSqOO8tSZAU6IYpxarsXBbZCDzFdy8u279HxSXtyWMpIolRtjJEWLdmfU5SwZCsP5";

    // Ad Account ID สำหรับ Page 2 (ตาม requirement)
    const adAccountId = "act_869492750129928";

    // ดึง query parameters จาก request
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") || "ad"; // campaign, adset, ad
    const datePreset = searchParams.get("date_preset");
    const timeRange = searchParams.get("time_range");
    const timeIncrement = searchParams.get("time_increment");
    const actionBreakdowns = searchParams.get("action_breakdowns") || "";
    const filtering = searchParams.get("filtering") || "";

    // Fields เริ่มต้นตามระดับ
    let defaultFields: string;
    if (level === "campaign") {
      defaultFields =
        "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions,reach,frequency";
    } else if (level === "adset") {
      defaultFields =
        "adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions,reach,frequency";
    } else {
      // ad level
      defaultFields =
        "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions,reach,frequency";
    }

    const fields = searchParams.get("fields") || defaultFields;

    // สร้าง URL โดยเรียก /insights โดยตรง
    const apiUrl = `https://graph.facebook.com/v24.0/${adAccountId}/insights`;

    const params = new URLSearchParams({
      access_token: accessToken,
      level: level,
      fields: fields,
      limit: "500",
    });

    // เลือกใช้ date_preset หรือ time_range (ไม่สามารถใช้ทั้ง 2 อย่างพร้อมกันได้)
    if (timeRange) {
      // ใช้ time_range แทน date_preset
      params.append("time_range", timeRange);
    } else if (datePreset) {
      // ใช้ date_preset
      params.append("date_preset", datePreset);
    } else {
      // default เป็น today
      params.append("date_preset", "today");
    }

    // เพิ่ม time_increment ถ้ามี (1 = แยกตามวัน)
    if (timeIncrement) {
      params.append("time_increment", timeIncrement);
    }

    // เพิ่ม action_breakdowns ถ้ามี
    if (actionBreakdowns) {
      params.append("action_breakdowns", actionBreakdowns);
    }

    // เพิ่ม filtering ถ้ามี (สำหรับกรองเฉพาะ action types ที่ต้องการ)
    if (filtering) {
      params.append("filtering", filtering);
    }

    console.log(
      "[Page 2 Campaigns API] Fetching insights from:",
      `${apiUrl}?${params.toString().replace(accessToken, "***TOKEN***")}`
    );

    // เรียก Facebook Graph API โดยตรงที่ /insights
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
      console.error("[Page 2 Campaigns API] Facebook API Error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถดึงข้อมูลจาก Facebook Ads API ได้",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const items = data.data || [];

    // คำนวณ summary
    const summary = {
      total_spend: items.reduce(
        (sum: number, item: { spend?: string }) =>
          sum + parseFloat(item.spend || "0"),
        0
      ),
      total_impressions: items.reduce(
        (sum: number, item: { impressions?: string }) =>
          sum + parseInt(item.impressions || "0"),
        0
      ),
      total_reach: items.reduce(
        (sum: number, item: { reach?: string }) =>
          sum + parseInt(item.reach || "0"),
        0
      ),
      total_clicks: items.reduce(
        (sum: number, item: { clicks?: string }) =>
          sum + parseInt(item.clicks || "0"),
        0
      ),
      total_results: items.reduce(
        (sum: number, item: { actions?: Array<{ value?: string }> }) => {
          if (item.actions && Array.isArray(item.actions)) {
            return (
              sum +
              item.actions.reduce(
                (actionSum: number, action: { value?: string }) =>
                  actionSum + parseInt(action.value || "0"),
                0
              )
            );
          }
          return sum;
        },
        0
      ),
      // สำหรับ messaging actions โดยเฉพาะ
      total_messaging_first_reply: items.reduce(
        (
          sum: number,
          item: { actions?: Array<{ action_type?: string; value?: string }> }
        ) => {
          if (item.actions && Array.isArray(item.actions)) {
            const action = item.actions.find(
              (a: { action_type?: string }) =>
                a.action_type === "onsite_conversion.messaging_first_reply"
            );
            return sum + parseInt(action?.value || "0");
          }
          return sum;
        },
        0
      ),
      total_messaging_connection: items.reduce(
        (
          sum: number,
          item: { actions?: Array<{ action_type?: string; value?: string }> }
        ) => {
          if (item.actions && Array.isArray(item.actions)) {
            const action = item.actions.find(
              (a: { action_type?: string }) =>
                a.action_type === "onsite_conversion.total_messaging_connection"
            );
            return sum + parseInt(action?.value || "0");
          }
          return sum;
        },
        0
      ),
    };

    console.log(
      "[Page 2 Campaigns API] Success - Found",
      items.length,
      "items"
    );

    return NextResponse.json({
      success: true,
      level: level,
      date_preset: datePreset || "today",
      data: items,
      summary: summary,
      paging: data.paging || null,
    });
  } catch (error) {
    console.error("[Page 2 Campaigns API] Error:", error);
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

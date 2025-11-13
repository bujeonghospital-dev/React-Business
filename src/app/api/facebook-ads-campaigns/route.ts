import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบ Facebook Access Token",
          message:
            process.env.NODE_ENV === "production"
              ? "กรุณาตั้งค่า FACEBOOK_ACCESS_TOKEN ใน Environment Variables ของ hosting platform (เช่น Vercel, Netlify)"
              : "กรุณาตั้งค่า FACEBOOK_ACCESS_TOKEN ใน .env.local",
          hint:
            process.env.NODE_ENV === "production"
              ? "สำหรับ Vercel: Project Settings → Environment Variables"
              : "สร้างไฟล์ .env.local ในโฟลเดอร์ package/ และเพิ่ม FACEBOOK_ACCESS_TOKEN=your_token",
          docs: "ดูเอกสารเพิ่มเติมที่ VERCEL_ENV_SETUP.md และ FACEBOOK_ADS_SETUP.md",
        },
        { status: 500 }
      );
    }

    if (!adAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบ Facebook Ad Account ID",
          message:
            process.env.NODE_ENV === "production"
              ? "กรุณาตั้งค่า FACEBOOK_AD_ACCOUNT_ID ใน Environment Variables ของ hosting platform"
              : "กรุณาตั้งค่า FACEBOOK_AD_ACCOUNT_ID ใน .env.local",
          hint: "Ad Account ID รูปแบบ: act_1234567890",
        },
        { status: 500 }
      );
    }

    // ดึง query parameters จาก request
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") || "ad"; // campaign, adset, ad
    const datePreset = searchParams.get("date_preset");
    const timeRange = searchParams.get("time_range");
    const timeIncrement = searchParams.get("time_increment");
    const actionBreakdowns = searchParams.get("action_breakdowns") || "";

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

    // สร้าง URL โดยเรียก /insights โดยตรง (วิธีที่ง่ายและเร็วกว่า)
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

    console.log("Fetching insights from:", `${apiUrl}?${params.toString()}`);

    // เรียก Facebook Graph API โดยตรงที่ /insights
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Facebook API Error:", errorData);
      return NextResponse.json(
        {
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
        (sum: number, item: any) => sum + parseFloat(item.spend || "0"),
        0
      ),
      total_impressions: items.reduce(
        (sum: number, item: any) => sum + parseInt(item.impressions || "0"),
        0
      ),
      total_reach: items.reduce(
        (sum: number, item: any) => sum + parseInt(item.reach || "0"),
        0
      ),
      total_clicks: items.reduce(
        (sum: number, item: any) => sum + parseInt(item.clicks || "0"),
        0
      ),
      total_results: items.reduce((sum: number, item: any) => {
        if (item.actions && Array.isArray(item.actions)) {
          return (
            sum +
            item.actions.reduce(
              (actionSum: number, action: any) =>
                actionSum + parseInt(action.value || "0"),
              0
            )
          );
        }
        return sum;
      }, 0),
    };

    return NextResponse.json({
      success: true,
      level: level,
      date_preset: datePreset,
      data: items,
      summary: summary,
      paging: data.paging || null,
    });
  } catch (error) {
    console.error("Error fetching Facebook Ads data:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

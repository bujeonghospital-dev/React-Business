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
    const level = searchParams.get("level") || "ad";
    const datePreset = searchParams.get("date_preset") || "today";
    const fields =
      searchParams.get("fields") ||
      "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions";
    const actionBreakdowns = searchParams.get("action_breakdowns") || "";

    // สร้าง URL สำหรับ Facebook Graph API
    const apiUrl = `https://graph.facebook.com/v24.0/${adAccountId}/insights`;
    const params = new URLSearchParams({
      access_token: accessToken,
      level: level,
      fields: fields,
      date_preset: datePreset,
    });

    // เพิ่ม action_breakdowns ถ้ามี
    if (actionBreakdowns) {
      params.append("action_breakdowns", actionBreakdowns);
    }

    console.log("Fetching insights from:", `${apiUrl}?${params.toString()}`);

    // เรียก Facebook Graph API
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

    return NextResponse.json({
      success: true,
      data: data.data || [],
      paging: data.paging || null,
      summary: data.summary || null,
    });
  } catch (error) {
    console.error("Error fetching Facebook Ads insights:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

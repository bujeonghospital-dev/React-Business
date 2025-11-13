import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

    // ตรวจสอบว่ามี environment variables หรือไม่
    const envCheck = {
      hasAccessToken: !!accessToken,
      hasAdAccountId: !!adAccountId,
      accessTokenLength: accessToken?.length || 0,
      adAccountId: adAccountId || "NOT_SET",
    };

    if (!accessToken || !adAccountId) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        envCheck,
        message:
          "กรุณาตั้งค่า FACEBOOK_ACCESS_TOKEN และ FACEBOOK_AD_ACCOUNT_ID ใน .env.local แล้วรีสตาร์ท server",
      });
    }

    // ทดสอบเรียก Facebook API
    const testUrl = `https://graph.facebook.com/v24.0/me?access_token=${accessToken}`;
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "✅ Facebook Access Token ใช้งานได้!",
        envCheck,
        userInfo: {
          id: data.id,
          name: data.name,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Token ไม่ถูกต้องหรือหมดอายุ",
        envCheck,
        details: data,
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาด",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

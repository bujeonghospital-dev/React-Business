// src/app/api/facebook-ads-simple/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Facebook Marketing API Route (ใช้ Graph API โดยตรง)
 *
 * ไม่ต้องติดตั้ง SDK ใช้ fetch API เรียก Graph API โดยตรง
 */

interface FacebookAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
}

interface FacebookAdsResponse {
  campaigns: FacebookAdsCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    averageCpm: number;
    averageCpc: number;
    averageCtr: number;
    totalConversions: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || "2025-01-01";
    const endDate = searchParams.get("endDate") || "2025-04-04";

    // เอาเฉพาะ Access Token และ Ad Account ID
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        {
          error: "ยังไม่พร้อมใช้งาน Facebook Ads API",
          message: "ขาด credentials ดังนี้:",
          missing: [
            !accessToken && "FACEBOOK_ACCESS_TOKEN",
            !adAccountId && "FACEBOOK_AD_ACCOUNT_ID",
          ].filter(Boolean),
          instructions: {
            "1. ขอ Access Token":
              "ไปที่ https://developers.facebook.com/tools/explorer/",
            "2. เลือก Permissions": "ads_read, read_insights",
            "3. Generate Access Token": "คัดลอก Token",
            "4. หา Ad Account ID":
              "ไปที่ https://business.facebook.com/settings/ad-accounts",
            "5. เพิ่มใน .env.local":
              "FACEBOOK_ACCESS_TOKEN และ FACEBOOK_AD_ACCOUNT_ID",
          },
        },
        { status: 503 }
      );
    }

    console.log(
      "✅ Credentials available. Connecting to Facebook Graph API..."
    );

    try {
      // Fetch campaigns จาก Graph API
      const campaignsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns`;
      const campaignsParams = new URLSearchParams({
        access_token: accessToken,
        fields: "id,name,status,objective",
      });

      const campaignsResponse = await fetch(
        `${campaignsUrl}?${campaignsParams}`
      );

      if (!campaignsResponse.ok) {
        const error = await campaignsResponse.json();
        throw new Error(error.error?.message || "Failed to fetch campaigns");
      }

      const campaignsResult = await campaignsResponse.json();
      const campaigns = campaignsResult.data || [];

      console.log(`✅ Retrieved ${campaigns.length} campaigns`);

      const campaignData: FacebookAdsCampaign[] = [];

      // Fetch insights for each campaign
      for (const campaign of campaigns) {
        try {
          const insightsUrl = `https://graph.facebook.com/v21.0/${campaign.id}/insights`;
          const insightsParams = new URLSearchParams({
            access_token: accessToken,
            time_range: JSON.stringify({
              since: startDate,
              until: endDate,
            }),
            fields: "impressions,clicks,spend,cpm,cpc,ctr,actions",
          });

          const insightsResponse = await fetch(
            `${insightsUrl}?${insightsParams}`
          );

          if (insightsResponse.ok) {
            const insightsResult = await insightsResponse.json();
            const insights = insightsResult.data || [];

            if (insights.length > 0) {
              const insight = insights[0];

              // หา conversions จาก actions
              let conversions = 0;
              let costPerConversion = 0;

              if (insight.actions && Array.isArray(insight.actions)) {
                const conversionAction = insight.actions.find(
                  (action: any) =>
                    action.action_type ===
                      "offsite_conversion.fb_pixel_purchase" ||
                    action.action_type === "purchase" ||
                    action.action_type === "omni_purchase"
                );
                conversions = conversionAction
                  ? parseFloat(conversionAction.value)
                  : 0;
              }

              if (conversions > 0 && insight.spend) {
                costPerConversion = parseFloat(insight.spend) / conversions;
              }

              campaignData.push({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective || "Unknown",
                impressions: parseInt(insight.impressions || "0"),
                clicks: parseInt(insight.clicks || "0"),
                spend: parseFloat(insight.spend || "0"),
                cpm: parseFloat(insight.cpm || "0"),
                cpc: parseFloat(insight.cpc || "0"),
                ctr: parseFloat(insight.ctr || "0"),
                conversions,
                costPerConversion,
              });
            }
          }
        } catch (insightError) {
          console.error(
            `Error fetching insights for campaign ${campaign.id}:`,
            insightError
          );
        }
      }

      console.log(
        `✅ Retrieved ${campaignData.length} campaigns with insights`
      );

      // คำนวณ summary
      const summary = {
        totalImpressions: campaignData.reduce(
          (sum, c) => sum + c.impressions,
          0
        ),
        totalClicks: campaignData.reduce((sum, c) => sum + c.clicks, 0),
        totalSpend: campaignData.reduce((sum, c) => sum + c.spend, 0),
        averageCpm:
          campaignData.length > 0
            ? campaignData.reduce((sum, c) => sum + c.cpm, 0) /
              campaignData.length
            : 0,
        averageCpc:
          campaignData.length > 0
            ? campaignData.reduce((sum, c) => sum + c.cpc, 0) /
              campaignData.length
            : 0,
        averageCtr:
          campaignData.length > 0
            ? campaignData.reduce((sum, c) => sum + c.ctr, 0) /
              campaignData.length
            : 0,
        totalConversions: campaignData.reduce(
          (sum, c) => sum + c.conversions,
          0
        ),
      };

      const response: FacebookAdsResponse = {
        campaigns: campaignData,
        summary,
        dateRange: {
          startDate,
          endDate,
        },
      };

      return NextResponse.json(response);
    } catch (apiError: any) {
      console.error("❌ Facebook Graph API Error:", apiError);

      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ Facebook Ads API";
      let errorDetails = apiError.message || "Unknown error";

      if (errorDetails.includes("access") || errorDetails.includes("token")) {
        errorMessage = "Access Token ไม่ถูกต้องหรือหมดอายุ";
        errorDetails =
          "กรุณาสร้าง Access Token ใหม่ที่ https://developers.facebook.com/tools/explorer/";
      } else if (
        errorDetails.includes("permissions") ||
        errorDetails.includes("OAuth")
      ) {
        errorMessage = "ไม่มีสิทธิ์เข้าถึง";
        errorDetails =
          "กรุณาตรวจสอบว่า Access Token มี permissions: ads_read, read_insights";
      } else if (
        errorDetails.includes("account") ||
        errorDetails.includes("Unsupported")
      ) {
        errorMessage = "ไม่พบ Ad Account";
        errorDetails = `Ad Account ID ${adAccountId} ไม่ถูกต้อง กรุณาตรวจสอบที่ Business Manager`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          adAccountId: adAccountId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

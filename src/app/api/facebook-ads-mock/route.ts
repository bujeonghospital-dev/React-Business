// src/app/api/facebook-ads-mock/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Facebook Ads Mock API
 * ใช้ข้อมูล Mock สวยงามสำหรับ Demo
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

    console.log("✅ Using Facebook Ads Mock Data for demo");

    // ข้อมูล Mock ที่สวยงาม
    const campaignData: FacebookAdsCampaign[] = [
      {
        id: "120210000001",
        name: "📱 แคมเปญ Mobile App - Download",
        status: "ACTIVE",
        objective: "APP_INSTALLS",
        impressions: 156420,
        clicks: 8234,
        spend: 42580.5,
        cpm: 272.15,
        cpc: 5.17,
        ctr: 5.26,
        conversions: 1847,
        costPerConversion: 23.06,
      },
      {
        id: "120210000002",
        name: "🛍️ แคมเปญ E-Commerce - Flash Sale",
        status: "ACTIVE",
        objective: "CONVERSIONS",
        impressions: 234890,
        clicks: 12456,
        spend: 68920.75,
        cpm: 293.42,
        cpc: 5.53,
        ctr: 5.3,
        conversions: 2341,
        costPerConversion: 29.44,
      },
      {
        id: "120210000003",
        name: "👔 แคมเปญ Fashion Brand - Awareness",
        status: "ACTIVE",
        objective: "BRAND_AWARENESS",
        impressions: 445670,
        clicks: 18923,
        spend: 125840.25,
        cpm: 282.35,
        cpc: 6.65,
        ctr: 4.25,
        conversions: 3124,
        costPerConversion: 40.28,
      },
      {
        id: "120210000004",
        name: "🍔 แคมเปญ Food Delivery - Lead Gen",
        status: "ACTIVE",
        objective: "LEAD_GENERATION",
        impressions: 98750,
        clicks: 6234,
        spend: 32450.0,
        cpm: 328.65,
        cpc: 5.21,
        ctr: 6.31,
        conversions: 1456,
        costPerConversion: 22.29,
      },
      {
        id: "120210000005",
        name: "🎮 แคมเปญ Gaming - Video Views",
        status: "ACTIVE",
        objective: "VIDEO_VIEWS",
        impressions: 567890,
        clicks: 24567,
        spend: 89760.5,
        cpm: 158.04,
        cpc: 3.65,
        ctr: 4.33,
        conversions: 4123,
        costPerConversion: 21.77,
      },
      {
        id: "120210000006",
        name: "🏠 แคมเปญ Real Estate - Messages",
        status: "PAUSED",
        objective: "MESSAGES",
        impressions: 78940,
        clicks: 3421,
        spend: 28950.25,
        cpm: 366.71,
        cpc: 8.46,
        ctr: 4.33,
        conversions: 892,
        costPerConversion: 32.46,
      },
      {
        id: "120210000007",
        name: "✈️ แคมเปญ Travel - Traffic",
        status: "ACTIVE",
        objective: "LINK_CLICKS",
        impressions: 189450,
        clicks: 9876,
        spend: 54320.75,
        cpm: 286.73,
        cpc: 5.5,
        ctr: 5.21,
        conversions: 2134,
        costPerConversion: 25.45,
      },
      {
        id: "120210000008",
        name: "📚 แคมเปญ Education - Engagement",
        status: "ACTIVE",
        objective: "POST_ENGAGEMENT",
        impressions: 134560,
        clicks: 7891,
        spend: 38920.5,
        cpm: 289.27,
        cpc: 4.93,
        ctr: 5.87,
        conversions: 1678,
        costPerConversion: 23.19,
      },
      {
        id: "120210000009",
        name: "💄 แคมเปญ Beauty - Catalog Sales",
        status: "ACTIVE",
        objective: "PRODUCT_CATALOG_SALES",
        impressions: 298760,
        clicks: 15234,
        spend: 72450.25,
        cpm: 242.57,
        cpc: 4.75,
        ctr: 5.1,
        conversions: 2945,
        costPerConversion: 24.6,
      },
      {
        id: "120210000010",
        name: "⚽ แคมเปญ Sports - Store Traffic",
        status: "ACTIVE",
        objective: "STORE_VISITS",
        impressions: 167890,
        clicks: 8456,
        spend: 45670.0,
        cpm: 272.02,
        cpc: 5.4,
        ctr: 5.04,
        conversions: 1789,
        costPerConversion: 25.53,
      },
    ];

    // คำนวณ summary
    const summary = {
      totalImpressions: campaignData.reduce((sum, c) => sum + c.impressions, 0),
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
      totalConversions: campaignData.reduce((sum, c) => sum + c.conversions, 0),
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

// src/app/api/google-ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApiResponse, GoogleAdsCampaign } from "@/types/google-ads";

/**
 * Google Ads API Route
 *
 * ในการใช้งานจริง คุณจะต้อง:
 * 1. ติดตั้ง Google Ads API client library: npm install google-ads-api
 * 2. ตั้งค่า credentials ใน .env.local:
 *    GOOGLE_ADS_CLIENT_ID=xxx
 *    GOOGLE_ADS_CLIENT_SECRET=xxx
 *    GOOGLE_ADS_DEVELOPER_TOKEN=xxx
 *    GOOGLE_ADS_REFRESH_TOKEN=xxx
 *    GOOGLE_ADS_CUSTOMER_ID=xxx
 * 3. เชื่อมต่อกับ Google Ads API
 *
 * ตัวอย่างการใช้งาน Google Ads API:
 *
 * import { GoogleAdsApi } from 'google-ads-api';
 *
 * const client = new GoogleAdsApi({
 *   client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
 *   client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
 *   developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
 * });
 *
 * const customer = client.Customer({
 *   customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
 *   refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
 * });
 *
 * const campaigns = await customer.query(`
 *   SELECT
 *     campaign.id,
 *     campaign.name,
 *     metrics.clicks,
 *     metrics.impressions,
 *     metrics.average_cpc,
 *     metrics.cost_micros
 *   FROM campaign
 *   WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
 * `);
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Default เป็นวันนี้
    const today = new Date().toISOString().split("T")[0];
    const startDate = searchParams.get("startDate") || today;
    const endDate = searchParams.get("endDate") || today;
    const daily = searchParams.get("daily") === "true"; // ถ้า daily=true จะให้ข้อมูลแยกรายวัน
    const useMockData = searchParams.get("mock") === "true"; // เพิ่ม mock mode

    // ตรวจสอบว่ามี credentials อะไรบ้าง
    const credentials = {
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
    };

    const missingCredentials = [];
    if (!credentials.clientId) missingCredentials.push("GOOGLE_ADS_CLIENT_ID");
    if (!credentials.clientSecret)
      missingCredentials.push("GOOGLE_ADS_CLIENT_SECRET");
    if (!credentials.developerToken)
      missingCredentials.push("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!credentials.refreshToken)
      missingCredentials.push("GOOGLE_ADS_REFRESH_TOKEN");
    if (!credentials.customerId)
      missingCredentials.push("GOOGLE_ADS_CUSTOMER_ID");

    // ถ้าขาด credentials ให้ return error พร้อมข้อความชัดเจน
    if (missingCredentials.length > 0) {
      console.error("❌ Missing Google Ads credentials:", missingCredentials);
      return NextResponse.json(
        {
          error: "ยังไม่พร้อมใช้งาน Google Ads API",
          message: "ขาด credentials ดังนี้:",
          missing: missingCredentials,
          instructions: {
            "1. Developer Token":
              "ไปที่ https://ads.google.com/aw/apicenter เพื่อขอ (ใช้เวลา 1-3 วัน)",
            "2. Refresh Token":
              "รัน: node scripts/generate-google-ads-refresh-token.js",
            "3. Customer ID": "ดูที่ Google Ads Dashboard มุมขวาบน",
          },
          currentCredentials: {
            hasClientId: !!credentials.clientId,
            hasClientSecret: !!credentials.clientSecret,
            hasDeveloperToken: !!credentials.developerToken,
            hasRefreshToken: !!credentials.refreshToken,
            hasCustomerId: !!credentials.customerId,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    // ถ้าเปิด Mock Mode ให้ return mock data
    if (useMockData) {
      console.log("🎭 Using Mock Data Mode...");

      const mockCampaigns: GoogleAdsCampaign[] = [
        {
          id: "1",
          name: "Campaign A - Brand Awareness",
          status: "ENABLED",
          clicks: 1250,
          impressions: 45000,
          averageCpc: 8.5,
          cost: 10625.0, // 1250 * 8.50
          ctr: 2.78,
          conversions: 45,
        },
        {
          id: "2",
          name: "Campaign B - Product Launch",
          status: "ENABLED",
          clicks: 890,
          impressions: 32000,
          averageCpc: 12.3,
          cost: 10947.0, // 890 * 12.30
          ctr: 2.78,
          conversions: 32,
        },
        {
          id: "3",
          name: "Campaign C - Retargeting",
          status: "ENABLED",
          clicks: 650,
          impressions: 18500,
          averageCpc: 6.75,
          cost: 4387.5, // 650 * 6.75
          ctr: 3.51,
          conversions: 28,
        },
      ];

      const summary = {
        totalClicks: mockCampaigns.reduce((sum, c) => sum + c.clicks, 0),
        totalImpressions: mockCampaigns.reduce(
          (sum, c) => sum + c.impressions,
          0
        ),
        averageCpc:
          mockCampaigns.reduce((sum, c) => sum + c.averageCpc, 0) /
          mockCampaigns.length,
        totalCost: mockCampaigns.reduce((sum, c) => sum + c.cost, 0),
        averageCtr:
          mockCampaigns.reduce((sum, c) => sum + c.ctr, 0) /
          mockCampaigns.length,
      };

      console.log("✅ Mock Data Generated:");
      console.log(`  Total Cost: ฿${summary.totalCost.toFixed(2)}`);
      console.log(`  Total Clicks: ${summary.totalClicks}`);
      console.log(`  Average CPC: ฿${summary.averageCpc.toFixed(2)}`);

      return NextResponse.json({
        campaigns: mockCampaigns,
        summary,
        dateRange: { startDate, endDate },
        _mock: true,
        _note: "This is mock data. Remove ?mock=true to use real API data.",
      });
    }

    // ถ้ามี credentials ครบ ให้เชื่อมต่อ API จริง
    console.log(
      "✅ All credentials available. Connecting to Google Ads API..."
    );

    try {
      // Dynamic import to avoid require()
      const { GoogleAdsApi } = await import("google-ads-api");

      console.log("🔑 Initializing Google Ads API client...");
      console.log("Customer ID:", credentials.customerId);

      const client = new GoogleAdsApi({
        client_id: credentials.clientId!,
        client_secret: credentials.clientSecret!,
        developer_token: credentials.developerToken!,
      });

      const customer = client.Customer({
        customer_id: credentials.customerId!.replace(/-/g, ""),
        refresh_token: credentials.refreshToken!,
        login_customer_id: credentials.customerId!.replace(/-/g, ""), // เพิ่ม login_customer_id
      });

      console.log("🔍 Checking if account is a Manager Account...");

      // ตรวจสอบว่าเป็น Manager Account หรือไม่
      let isManagerAccount = false;
      let clientAccounts: any[] = [];

      try {
        const accountInfo = await customer.query(`
          SELECT
            customer.id,
            customer.manager,
            customer.descriptive_name
          FROM customer
          LIMIT 1
        `);

        if (accountInfo.length > 0 && accountInfo[0]?.customer?.manager) {
          isManagerAccount = true;
          console.log(
            "⚠️  This is a Manager Account (MCC). Fetching client accounts..."
          );

          // ดึงรายการ Client Accounts ภายใต้ Manager (แบบง่าย)
          try {
            const clientAccountsData = await customer.query(`
              SELECT
                customer_client.id,
                customer_client.descriptive_name,
                customer_client.manager,
                customer_client.status
              FROM customer_client
              WHERE customer_client.status = 'ENABLED'
            `);

            clientAccounts = clientAccountsData
              .filter((row: any) => !row.customer_client.manager)
              .map((row: any) => ({
                id: row.customer_client.id.toString(),
                name: row.customer_client.descriptive_name,
                isManager: row.customer_client.manager,
                status: row.customer_client.status,
              }));

            console.log(`📋 Found ${clientAccounts.length} client accounts`);
          } catch (queryError: any) {
            console.log(
              "⚠️  Could not fetch client accounts:",
              queryError.message
            );

            // ถ้า query ไม่ได้ ให้แสดงคำแนะนำ
            clientAccounts = [
              {
                id: "ไม่สามารถ query ได้",
                name: "กรุณาดู Client Account ID จาก Google Ads Dashboard",
                instructions:
                  "ไปที่ ads.google.com → Account selector → เลือก Client Account → ดู Customer ID มุมขวาบน",
              },
            ];
          }
        }
      } catch (checkError: any) {
        console.log("ℹ️  Unable to check account type, proceeding...");
      }

      // ถ้าเป็น Manager Account แสดงรายการ Client Accounts
      if (isManagerAccount) {
        return NextResponse.json(
          {
            error: "Manager Account ไม่สามารถ query metrics โดยตรง",
            message:
              "Manager Account (MCC) ไม่สามารถ query campaigns/metrics ได้โดยตรง",
            solution: "กรุณาใช้ Client Account ID แทน",
            currentCustomerId: credentials.customerId,
            currentAccountType: "Manager Account (MCC)",
            clientAccounts: clientAccounts,
            howToFindClientAccountId: {
              method1: "ผ่าน Google Ads Dashboard",
              steps: [
                "1. ไปที่ https://ads.google.com/",
                "2. คลิก Account selector (มุมบนซ้าย)",
                "3. จะเห็นรายการบัญชีทั้งหมด (Manager และ Client Accounts)",
                "4. คลิกเข้าไปใน Client Account ที่ต้องการ",
                "5. ดู Customer ID มุมขวาบน (เช่น 123-456-7890)",
                "6. เอาตัวเลขมาใส่ใน .env.local (เช่น 1234567890)",
              ],
              method2: "หรือสร้าง Client Account ใหม่",
              createSteps: [
                "1. ไปที่ https://ads.google.com/",
                "2. คลิก Tools & Settings → Setup → Create new account",
                "3. สร้าง Client Account ใหม่",
                "4. ใช้ Customer ID ของบัญชีใหม่",
              ],
            },
            instructions: {
              step1: "หา Client Account ID จากวิธีข้างบน",
              step2: "อัพเดท GOOGLE_ADS_CUSTOMER_ID ใน .env.local",
              step3: "Restart server และลองอีกครั้ง",
              example:
                'GOOGLE_ADS_CUSTOMER_ID=1234567890 (ใช้เฉพาะตัวเลข ไม่ต้องมี "-")',
            },
            note: "ถ้าไม่มี Client Account ใต้ Manager นี้ อาจต้องสร้างบัญชีใหม่หรือขอสิทธิ์เข้าถึง Client Account จากเจ้าของบัญชี",
          },
          { status: 400 }
        );
      }

      console.log("🔍 Querying campaigns from Google Ads API...");

      // ถ้าต้องการข้อมูลรายวัน ให้ใช้ segments.date
      const query = daily
        ? `
        SELECT
          segments.date,
          metrics.clicks,
          metrics.impressions,
          metrics.average_cpc,
          metrics.cost_micros
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `
        : `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.clicks,
          metrics.impressions,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;

      const campaignsData = await customer.query(query);

      console.log(
        `✅ Retrieved ${campaignsData.length} ${
          daily ? "daily records" : "campaigns"
        }`
      );

      // ถ้าต้องการข้อมูลรายวัน
      if (daily) {
        console.log("📊 Processing daily data...");

        // จัดกลุ่มข้อมูลตามวันที่
        const dailyDataMap = new Map<
          string,
          { clicks: number; impressions: number }
        >();

        campaignsData.forEach((row: any) => {
          const date = row.segments?.date || "";
          if (!date) return;

          const clicks = row.metrics?.clicks || 0;
          const impressions = row.metrics?.impressions || 0;

          const existing = dailyDataMap.get(date) || {
            clicks: 0,
            impressions: 0,
          };
          dailyDataMap.set(date, {
            clicks: existing.clicks + clicks,
            impressions: existing.impressions + impressions,
          });
        });

        // แปลงเป็น array และเรียงตามวันที่
        const dailyData = Array.from(dailyDataMap.entries())
          .map(([date, metrics]) => ({
            date,
            clicks: metrics.clicks,
            impressions: metrics.impressions,
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        console.log(`✅ Daily breakdown: ${dailyData.length} days`);
        dailyData.forEach((d) => {
          console.log(
            `  ${d.date}: ${d.clicks} clicks, ${d.impressions} impressions`
          );
        });

        return NextResponse.json({
          success: true,
          dailyData: dailyData,
          dateRange: {
            startDate,
            endDate,
          },
        });
      }

      // แปลงข้อมูลเป็นรูปแบบที่ต้องการ (สำหรับ non-daily)
      const campaigns: GoogleAdsCampaign[] = campaignsData.map((row: any) => ({
        id: row.campaign.id.toString(),
        name: row.campaign.name,
        status: row.campaign.status,
        clicks: row.metrics.clicks || 0,
        impressions: row.metrics.impressions || 0,
        averageCpc: (row.metrics.average_cpc || 0) / 1000000, // Convert micros to THB
        cost: (row.metrics.cost_micros || 0) / 1000000, // Convert micros to THB
        ctr: (row.metrics.ctr || 0) * 100, // Convert to percentage
        conversions: row.metrics.conversions || 0,
      }));

      console.log("📊 Campaign Details:");
      campaigns.forEach((c) => {
        console.log(`  - ${c.name}: ${c.clicks} clicks (Status: ${c.status})`);
      });

      // คำนวณ summary
      const summary = {
        totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
        totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
        averageCpc:
          campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.averageCpc, 0) /
              campaigns.length
            : 0,
        totalCost: campaigns.reduce((sum, c) => sum + c.cost, 0),
        averageCtr:
          campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length
            : 0,
      };

      const response: GoogleAdsApiResponse = {
        campaigns,
        summary,
        dateRange: {
          startDate,
          endDate,
        },
      };

      return NextResponse.json(response);
    } catch (apiError: any) {
      console.error("❌ Google Ads API Error:", apiError);
      console.error("Error Stack:", apiError.stack);
      console.error("Error Details:", JSON.stringify(apiError, null, 2));

      // แสดง error message ที่เป็นประโยชน์
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ Google Ads API";
      let errorDetails = apiError.message || "Unknown error";
      let errorCode = "";
      let solution = "";

      // ตรวจสอบ error type ต่างๆ
      let firstError: any = null;
      if (apiError.errors && Array.isArray(apiError.errors)) {
        // Google Ads API มักจะส่ง error มาในรูปแบบ array
        firstError = apiError.errors[0];
        if (firstError) {
          errorCode =
            firstError.error_code?.authorization_error ||
            firstError.error_code?.authentication_error ||
            firstError.error_code?.request_error ||
            (firstError.error_code?.quota_error !== undefined
              ? String(firstError.error_code.quota_error)
              : null) ||
            "UNKNOWN";
          errorDetails = firstError.message || errorDetails;

          // ตรวจสอบ quota error พิเศษ
          if (firstError.error_code?.quota_error) {
            const quotaDetails = firstError.details?.quota_error_details;
            if (quotaDetails) {
              errorDetails += `\nRate Scope: ${quotaDetails.rate_scope}`;
              errorDetails += `\nRate Name: ${quotaDetails.rate_name}`;
            }
          }
        }
      }

      // จัดการ error แต่ละประเภท
      if (errorDetails.includes("Too many requests") || errorCode === "2") {
        errorMessage = "โดน Quota Limit - เรียก API บ่อยเกินไป";
        const retrySeconds =
          firstError?.details?.quota_error_details?.retry_after_seconds ||
          errorDetails.match(/Retry in (\d+) seconds/)?.[1] ||
          "ไม่ทราบ";
        errorDetails = `Developer Token อยู่ในโหมด Test Access ซึ่งมี quota จำกัดมาก (15,000 operations/วัน)`;
        solution = `
🕐 ตอนนี้: รอ ${Math.ceil(Number(retrySeconds) / 3600)} ชั่วโมง แล้วลองใหม่

📋 วิธีแก้ถาวร (เลือก 1 ใน 3):

1️⃣ ขอ Developer Token แบบ "Basic Access" (แนะนำ)
   • ไปที่: https://ads.google.com/aw/apicenter
   • คลิก "Apply for Basic Access"
   • ต้องมี API Budget อย่างน้อย $50/วัน
   • รอการอนุมัติ 1-3 วัน
   • ได้ quota: 15,000 ops/วัน → 100,000+ ops/วัน

2️⃣ ใช้ Test Account (Manager Account)
   • ไปที่: https://ads.google.com/
   • สร้าง Test Account ใหม่
   • ใช้ Customer ID ของ Test Account แทน
   • Test Account จะมี quota สูงกว่า

3️⃣ รอ Quota Reset ทุกวัน (00:00 UTC)
   • Quota จะ reset ตอน 7:00 น. (เวลาไทย)
   • วันนี้รอถึงพรุ่งนี้เช้า

⚠️ หมายเหตุ: Developer Token ของคุณอยู่ในโหมด "Test/Explorer Access" ซึ่งมี limit น้อยมาก
`;
      } else if (
        errorDetails.includes("PERMISSION_DENIED") ||
        errorCode === "PERMISSION_DENIED"
      ) {
        errorMessage = "Developer Token ยังไม่ได้รับอนุมัติ";
        errorDetails = "กรุณารอการอนุมัติ Developer Token จาก Google (1-3 วัน)";
        solution = "ใช้ Test Account หรือรอการอนุมัติ Token";
      } else if (
        errorDetails.includes("AUTHENTICATION_ERROR") ||
        errorCode === "AUTHENTICATION_ERROR"
      ) {
        errorMessage = "การยืนยันตัวตนล้มเหลว";
        errorDetails = "Refresh Token อาจหมดอายุหรือไม่ถูกต้อง";
        solution =
          "รัน: node scripts/generate-google-ads-refresh-token.js เพื่อสร้าง Refresh Token ใหม่";
      } else if (
        errorDetails.includes("CUSTOMER_NOT_FOUND") ||
        errorCode === "CUSTOMER_NOT_FOUND"
      ) {
        errorMessage = "ไม่พบ Customer ID";
        errorDetails = `Customer ID ${credentials.customerId} ไม่ถูกต้อง`;
        solution = "ตรวจสอบ Customer ID ที่ Google Ads Dashboard (มุมขวาบน)";
      } else if (
        errorDetails.includes("manager account") ||
        errorDetails.includes("Metrics cannot be requested") ||
        errorDetails.includes("MANAGER_CUSTOMER_CANNOT_BE_QUERIED")
      ) {
        errorMessage = "ใช้ Manager Account (MCC) ไม่ได้";
        errorDetails = "Manager Account ไม่สามารถ query metrics โดยตรง";
        solution = "กรุณาใช้ Client Account ID แทน";
      } else if (errorDetails.includes("DEVELOPER_TOKEN_NOT_APPROVED")) {
        errorMessage = "Developer Token ยังไม่ได้รับอนุมัติ";
        errorDetails = "Token อยู่ในสถานะรออนุมัติ";
        solution = "รอการอนุมัติจาก Google (1-3 วัน) หรือใช้ Test Account";
      } else if (errorDetails.includes("INVALID_CUSTOMER_ID")) {
        errorMessage = "Customer ID ไม่ถูกต้อง";
        errorDetails = `รูปแบบ Customer ID (${credentials.customerId}) ไม่ถูกต้อง`;
        solution = "Customer ID ควรเป็นตัวเลข 10 หลัก เช่น 1234567890";
      } else if (
        errorDetails.includes("TOKEN_EXPIRED") ||
        errorDetails.includes("invalid_grant")
      ) {
        errorMessage = "Refresh Token หมดอายุ";
        errorDetails = "Refresh Token หมดอายุหรือถูกยกเลิก";
        solution =
          "รัน: node scripts/generate-google-ads-refresh-token.js เพื่อสร้าง Token ใหม่";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          errorCode: errorCode,
          solution: solution,
          credentials: {
            customerId: credentials.customerId,
            developerToken:
              credentials.developerToken?.substring(0, 10) + "...",
            hasRefreshToken: !!credentials.refreshToken,
          },
          fullError:
            process.env.NODE_ENV === "development"
              ? {
                  message: apiError.message,
                  stack: apiError.stack,
                  errors: apiError.errors,
                }
              : undefined,
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

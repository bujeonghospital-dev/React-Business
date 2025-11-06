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

    // ถ้ามี credentials ครบ ให้เชื่อมต่อ API จริง
    console.log(
      "✅ All credentials available. Connecting to Google Ads API..."
    );

    try {
      // Dynamic import to avoid require()
      const { GoogleAdsApi } = await import("google-ads-api");

      const client = new GoogleAdsApi({
        client_id: credentials.clientId!,
        client_secret: credentials.clientSecret!,
        developer_token: credentials.developerToken!,
      });

      const customer = client.Customer({
        customer_id: credentials.customerId!.replace(/-/g, ""),
        refresh_token: credentials.refreshToken!,
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

      // แสดง error message ที่เป็นประโยชน์
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ Google Ads API";
      let errorDetails = apiError.message || "Unknown error";

      if (errorDetails.includes("PERMISSION_DENIED")) {
        errorMessage = "Developer Token ยังไม่ได้รับอนุมัติ";
        errorDetails =
          "กรุณารอการอนุมัติ Developer Token จาก Google (1-3 วัน) หรือใช้ Test Account";
      } else if (errorDetails.includes("AUTHENTICATION")) {
        errorMessage = "การยืนยันตัวตนล้มเหลว";
        errorDetails =
          "กรุณาตรวจสอบ Client ID, Client Secret และ Refresh Token";
      } else if (errorDetails.includes("CUSTOMER_NOT_FOUND")) {
        errorMessage = "ไม่พบ Customer ID";
        errorDetails = `Customer ID ${credentials.customerId} ไม่ถูกต้อง กรุณาตรวจสอบที่ Google Ads Dashboard`;
      } else if (
        errorDetails.includes("manager account") ||
        errorDetails.includes("Metrics cannot be requested")
      ) {
        errorMessage = "ใช้ Manager Account (MCC) ไม่ได้";
        errorDetails =
          "กรุณาใช้ Client Account ID แทน ลองเรียก API อีกครั้งเพื่อดูรายการ Client Accounts";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          credentials: {
            customerId: credentials.customerId,
            developerToken:
              credentials.developerToken?.substring(0, 10) + "...",
          },
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

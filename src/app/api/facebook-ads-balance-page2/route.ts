import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Access token และ Ad Account ID สำหรับ Page 2
    const accessToken =
      "EAAPb1ZBYCiNcBPzNxxSUntCZCTVHyl5AkAZBIiwCmDzrWKMLU4VEHJxRve7oqUDSaMs8om9pdVWFLzUdeTbTvkGPuTeuQ4KvGFizMy3VsSid8vgmjZB8OMoLySRmXxyAUpAwyyhSqOO8tSZAU6IYpxarsXBbZCDzFdy8u279HxSXtyWMpIolRtjJEWLdmfU5SwZCsP5";
    const adAccountId = "act_869492750129928";

    // Fields ที่ต้องดึง
    const fields =
      "account_id,name,account_status,balance,amount_spent,currency,funding_source_details,min_daily_budget,spend_cap";

    // สร้าง URL สำหรับ Facebook Graph API
    const apiUrl = `https://graph.facebook.com/v24.0/${adAccountId}?fields=${fields}&access_token=${accessToken}`;

    console.log(
      "[Page 2 Balance API] Fetching from:",
      apiUrl.replace(accessToken, "***TOKEN***")
    );

    // เรียก Facebook Graph API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Page 2 Balance API] Facebook API Error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถดึงข้อมูล Balance จาก Facebook Ads API ได้",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Facebook คืนค่า balance และ amount_spent เป็นหน่วย cent (หารด้วย 100 เพื่อแปลงเป็นหน่วยปกติ)
    const balanceRaw = parseInt(data.balance || "0");
    const amountSpentRaw = parseInt(data.amount_spent || "0");
    const minDailyBudgetRaw = parseInt(data.min_daily_budget || "0");
    const spendCapRaw = parseInt(data.spend_cap || "0");

    // แปลงจาก cent เป็นหน่วยปกติ (หาร 100)
    const balance = balanceRaw / 100;
    const amountSpent = amountSpentRaw / 100;
    const minDailyBudget = minDailyBudgetRaw / 100;
    const spendCap = spendCapRaw / 100;

    console.log(
      "[Page 2 Balance API] Success - Balance:",
      balance,
      data.currency
    );

    return NextResponse.json({
      success: true,
      data: {
        account_id: data.account_id,
        name: data.name,
        account_status: data.account_status,
        balance: balance,
        balance_raw: balanceRaw,
        amount_spent: amountSpent,
        amount_spent_raw: amountSpentRaw,
        currency: data.currency || "THB",
        funding_source_details: data.funding_source_details || null,
        min_daily_budget: minDailyBudget,
        spend_cap: spendCap,
        // Available balance = balance (prepaid) หรือ spend_cap - amount_spent (credit)
        available_balance:
          balance > 0 ? balance : Math.max(0, spendCap - amountSpent),
      },
    });
  } catch (error) {
    console.error("[Page 2 Balance API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล Balance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

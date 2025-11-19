import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const ACCESS_TOKEN =
      process.env.FACEBOOK_ACCESS_TOKEN ||
      "EAAPb1ZBYCiNcBPzNxxSUntCZCTVHyl5AkAZBIiwCmDzrWKMLU4VEHJxRve7oqUDSaMs8om9pdVWFLzUdeTbTvkGPuTeuQ4KvGFizMy3VsSid8vgmjZB8OMoLySRmXxyAUpAwyyhSqOO8tSZAU6IYpxarsXBbZCDzFdy8u279HxSXtyWMpIolRtjJEWLdmfU5SwZCsP5";
    const ACCOUNT_ID = "act_454323590676166";

    const url = `https://graph.facebook.com/v24.0/${ACCOUNT_ID}?fields=account_id,name,account_status,balance,amount_spent,currency,funding_source_details,min_daily_budget,spend_cap&access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url, {
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
          success: false,
          error: "ไม่สามารถดึงข้อมูลยอดเงินคงเหลือได้",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Facebook Balance API Response:", data);

    // Extract balance from display_string
    let availableBalance = 0;
    if (data.funding_source_details?.display_string) {
      const displayString = data.funding_source_details.display_string;
      // Extract number from "ยอดคงเหลือที่ใช้ได้ (฿1,530.04 THB)"
      const match = displayString.match(/฿([\d,]+\.?\d*)/);
      if (match) {
        // Remove commas and convert to number
        availableBalance = parseFloat(match[1].replace(/,/g, ""));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        account_id: data.account_id,
        account_name: data.name,
        account_status: data.account_status,
        balance: data.balance,
        amount_spent: data.amount_spent,
        currency: data.currency,
        available_balance: availableBalance,
        display_string: data.funding_source_details?.display_string || "",
        spend_cap: data.spend_cap,
      },
    });
  } catch (error) {
    console.error("Error fetching Facebook balance:", error);
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

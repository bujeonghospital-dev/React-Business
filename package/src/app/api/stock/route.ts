import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/stock
 * Proxy endpoint for SET Market Data API
 * This helps avoid CORS issues when calling the API directly from the browser
 */
export async function GET(request: Request) {
  try {
    // Get optional symbol parameter from query string
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    // SET API configuration
    const API_KEY =
      process.env.SET_API_KEY || "461b3d65-d964-4d93-97a0-79b670d3867f";
    const API_URL =
      process.env.SET_API_URL ||
      "https://marketplace.set.or.th/api/public/realtime-data/stock";

    console.log("🔄 Attempting to fetch SET API...");

    // Try different authentication methods
    const authMethods: Array<{
      name: string;
      headers: Record<string, string>;
    }> = [
      // Method 1: Bearer token
      {
        name: "Bearer Token",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      },
      // Method 2: x-api-key
      {
        name: "X-API-Key",
        headers: {
          Accept: "application/json",
          "x-api-key": API_KEY,
        },
      },
      // Method 3: Both
      {
        name: "Both Headers",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "x-api-key": API_KEY,
        },
      },
    ];

    let lastError = null;

    // Try each authentication method
    for (const method of authMethods) {
      try {
        console.log(`   Trying ${method.name}...`);
        const response = await fetch(API_URL, {
          headers: method.headers,
          next: { revalidate: 300 },
        });

        if (response.ok) {
          console.log(`✅ Success with ${method.name}`);
          const data = await response.json();

          // If specific symbol requested, filter the data
          if (symbol && data.data && Array.isArray(data.data)) {
            const stockData = data.data.find(
              (stock: any) =>
                stock.symbol.toUpperCase() === symbol.toUpperCase()
            );

            if (stockData) {
              return NextResponse.json({ data: [stockData] });
            } else {
              return NextResponse.json(
                { error: `Stock symbol ${symbol} not found` },
                { status: 404 }
              );
            }
          }

          // Return all data if no symbol specified
          return NextResponse.json(data);
        }

        lastError = `${response.status} ${response.statusText}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
      }
    }

    // All methods failed
    console.error("❌ All authentication methods failed:", lastError);
    throw new Error(`SET API authentication failed: ${lastError}`);
  } catch (error) {
    console.error("❌ Stock API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch stock data",
        message: error instanceof Error ? error.message : "Unknown error",
        fallback: "Using mock data on client side",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

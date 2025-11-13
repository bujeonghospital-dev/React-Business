import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

const SETSMART_API_KEY = "b206a5c3-1a6c-4871-b1a3-9fbfa0bbc1be";

// In-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting: track last request time per symbol
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests for same symbol

/**
 * GET /api/stock
 * Proxy endpoint for SETSMART API
 * This helps avoid CORS issues when calling the API directly from the browser
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!symbol || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: symbol, startDate, endDate" },
        { status: 400 }
      );
    }

    const cacheKey = `${symbol}-${startDate}-${endDate}`;
    const now = Date.now();

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Cache hit for ${symbol}`);
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    // Rate limiting check
    const lastRequest = lastRequestTime.get(symbol);
    if (lastRequest && now - lastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequest);
      console.log(`⏱️ Rate limit: waiting ${waitTime}ms for ${symbol}`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const apiUrl = `https://www.setsmart.com/api/listed-company-api/eod-price-by-symbol?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}&adjustedPriceFlag=y`;

    console.log(`🔄 Fetching SETSMART data for ${symbol}...`);
    lastRequestTime.set(symbol, Date.now());

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "api-key": SETSMART_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ SETSMART API Error: ${response.status}`, errorText);

      // If rate limited, return cached data if available (even if expired)
      if (response.status === 429 && cached) {
        console.log(`⚠️ Rate limited, returning stale cache for ${symbol}`);
        return NextResponse.json(cached.data);
      }

      throw new Error(`SETSMART API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched data for ${symbol}`);

    // Update cache
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("❌ Stock API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch stock data",
        message: error instanceof Error ? error.message : "Unknown error",
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

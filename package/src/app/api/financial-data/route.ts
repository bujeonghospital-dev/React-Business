import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

const SETSMART_API_KEY = "b206a5c3-1a6c-4871-b1a3-9fbfa0bbc1be";

// In-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting: track last request time per symbol
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds between requests

/**
 * GET /api/financial-data
 * Proxy endpoint for SETSMART Financial Data and Ratio API
 * Parameters:
 * - symbol: Stock symbol (required)
 * - startYear: Start fiscal year (required)
 * - startQuarter: Start fiscal quarter 1-4 (required)
 * - endYear: End fiscal year (optional)
 * - endQuarter: End fiscal quarter 1-4 (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const startYear = searchParams.get("startYear");
    const startQuarter = searchParams.get("startQuarter");
    const endYear = searchParams.get("endYear");
    const endQuarter = searchParams.get("endQuarter");

    // Validate required parameters
    if (!symbol || !startYear || !startQuarter) {
      return NextResponse.json(
        {
          error: "Missing required parameters: symbol, startYear, startQuarter",
        },
        { status: 400 }
      );
    }

    // Validate quarter values
    const startQuarterNum = parseInt(startQuarter);
    if (isNaN(startQuarterNum) || startQuarterNum < 1 || startQuarterNum > 4) {
      return NextResponse.json(
        { error: "startQuarter must be a number between 1 and 4" },
        { status: 400 }
      );
    }

    if (endQuarter) {
      const endQuarterNum = parseInt(endQuarter);
      if (isNaN(endQuarterNum) || endQuarterNum < 1 || endQuarterNum > 4) {
        return NextResponse.json(
          { error: "endQuarter must be a number between 1 and 4" },
          { status: 400 }
        );
      }
    }

    // Build cache key
    const cacheKey = `${symbol}-${startYear}-${startQuarter}-${endYear || ""}-${
      endQuarter || ""
    }`;
    const now = Date.now();

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Cache hit for financial-data ${symbol}`);
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
      console.log(
        `⏱️ Rate limit: waiting ${waitTime}ms for financial-data ${symbol}`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // If we just hit rate limit before, return cached data instead
    if (lastRequest && now - lastRequest < MIN_REQUEST_INTERVAL * 3 && cached) {
      console.log(`⚠️ Recent rate limit, returning cached data for ${symbol}`);
      return NextResponse.json(cached.data);
    }

    // Build API URL
    let apiUrl =
      `https://www.setsmart.com/api/listed-company-api/financial-data-and-ratio-by-symbol` +
      `?symbol=${symbol}` +
      `&startYear=${startYear}` +
      `&startQuarter=${startQuarter}`;

    if (endYear) apiUrl += `&endYear=${endYear}`;
    if (endQuarter) apiUrl += `&endQuarter=${endQuarter}`;

    console.log(`🔄 Fetching SETSMART financial data for ${symbol}...`);
    lastRequestTime.set(symbol, Date.now());

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "api-key": SETSMART_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ SETSMART Financial API Error: ${response.status}`,
        errorText
      );

      // If rate limited, return cached data if available (even if expired)
      if ((response.status === 429 || response.status === 503) && cached) {
        console.log(
          `⚠️ Rate limited/Unavailable, returning stale cache for financial-data ${symbol}`
        );
        return NextResponse.json(cached.data);
      }

      // For rate limit errors, still throw but will be caught
      if (response.status === 429 || response.status === 503) {
        throw new Error(`SETSMART Service Limit Exceeded (${response.status})`);
      }

      throw new Error(`SETSMART Financial API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `✅ Successfully fetched financial data for ${symbol}:`,
      data.length || Object.keys(data).length,
      "items"
    );

    // Update cache
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("❌ Financial Data API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch financial data",
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

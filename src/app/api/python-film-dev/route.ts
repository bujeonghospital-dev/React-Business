import { NextRequest, NextResponse } from "next/server";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 120000; // 2 นาที

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetDate =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Check cache
    const cacheKey = `python-film-dev-${targetDate}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Returning cached Python Film_dev data for ${targetDate}`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
        },
      });
    }

    // Call Python API
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:5000";
    const apiUrl = `${pythonApiUrl}/api/film-dev?date=${targetDate}`;

    console.log(`🐍 Calling Python API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Python API returned ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("❌ Error calling Python API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Python API",
      },
      { status: 500 }
    );
  }
}

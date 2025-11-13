import { NextRequest, NextResponse } from "next/server";

// In-memory cache
const cache = new Map<
  string,
  { data: any; timestamp: number; expiresAt: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

export async function GET(request: NextRequest) {
  try {
    // Get Python API URL from environment or use default
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:5000";
    const endpoint = `${pythonApiUrl}/api/film-data`;

    // Check cache first
    const cacheKey = "surgery-schedule-python";
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now < cached.expiresAt) {
      console.log(`✅ Returning cached surgery schedule from Python API`);
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "Python API (Cached)",
        },
      });
    }

    console.log(`📡 Fetching surgery schedule from Python API: ${endpoint}`);

    // Fetch data from Python API
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Python API error (${response.status}): ${errorText}`);

      // Return cached data if available even if expired
      if (cached) {
        console.log("⚠️ Using expired cache due to API error");
        return NextResponse.json(cached.data, {
          status: 200,
          headers: {
            "X-Cache-Status": "STALE",
            "X-Data-Source": "Python API (Stale Cache)",
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: `Python API returned error: ${response.status} ${response.statusText}`,
          details: errorText,
          data: [],
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success) {
      console.error("❌ Python API returned unsuccessful response:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Python API returned unsuccessful response",
          data: [],
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Successfully fetched ${data.total || 0} records from Python API`
    );

    // Transform data to match expected format
    const transformedData = {
      success: true,
      data: data.data || [],
      total: data.total || 0,
      timestamp: data.timestamp || new Date().toISOString(),
      source: "Python API (Google Sheets)",
      debug: data.debug || {},
    };

    // Update cache with expiration time
    cache.set(cacheKey, {
      data: transformedData,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    });

    // Clean old cache entries
    for (const [key, value] of cache.entries()) {
      if (now > value.expiresAt + 60000) {
        // Remove if expired for more than 1 minute
        cache.delete(key);
      }
    }

    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "X-Cache-Status": "MISS",
        "X-Data-Source": "Python API (Fresh)",
      },
    });
  } catch (error: any) {
    console.error("Error fetching from Python API:", error);

    // Return cached data if available even if expired
    const cached = cache.get("surgery-schedule-python");
    if (cached) {
      console.log("⚠️ Using expired cache due to fetch error");
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "X-Cache-Status": "STALE",
          "X-Data-Source": "Python API (Error Fallback)",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data from Python API",
        details: {
          type: error.name,
          message: error.message,
          hint: "Make sure Python API is running on the configured URL",
        },
        data: [],
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

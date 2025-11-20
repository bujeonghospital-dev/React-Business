import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Create PostgreSQL connection pool
// Support both DATABASE_URL or individual connection params
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.DB_HOST || "n8n.bjhbangkok.com",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "Bjh12345!!",
        database: process.env.DB_NAME || "postgres",
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
);

export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD
    const adIds = searchParams.get("ad_ids"); // Comma-separated ad_ids

    console.log("📞 [Phone Leads API] Request params:", { dateParam, adIds });

    // Check database configuration
    const hasDbConfig =
      process.env.DATABASE_URL ||
      (process.env.DB_HOST && process.env.DB_PASSWORD);

    if (!hasDbConfig) {
      console.error("❌ [Phone Leads API] Database not configured");
      console.error("Available env vars:", {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DB_HOST: !!process.env.DB_HOST,
        DB_PASSWORD: !!process.env.DB_PASSWORD,
      });
      return NextResponse.json({
        success: false,
        error: "Database configuration missing",
        details: "Please set DATABASE_URL or DB_HOST/DB_PASSWORD in .env.local",
        data: {},
      });
    }

    console.log("✅ [Phone Leads API] Database configuration found");

    // Parse ad_ids if provided
    let adIdList: string[] = [];
    if (adIds) {
      adIdList = adIds.split(",").map((id) => id.trim());
    }

    // Build SQL query
    let query = `
      SELECT
        ads.fb_ad_id,
        ads.ad_name,
        COUNT(DISTINCT ct.customer_id) AS customers_with_phone
      FROM "BJH-Server".fb_customer_tags AS ct
      JOIN "BJH-Server".fb_tags AS t
        ON t.id = ct.tag_id
      JOIN "BJH-Server".fb_conversations AS conv
        ON conv.customer_id = ct.customer_id
      JOIN "BJH-Server".fb_conversation_sources AS src
        ON src.conversation_id = conv.id
      JOIN "BJH-Server".fb_ads AS ads
        ON ads.id = src.ad_id
      WHERE t.name = 'phone'
    `;

    const queryParams: any[] = [];

    // Add date filter if provided
    if (dateParam) {
      queryParams.push(dateParam);
      query += ` AND ct.assigned_at::date = $${queryParams.length}`;
    } else {
      // Default to current date
      query += ` AND ct.assigned_at::date = CURRENT_DATE`;
    }

    // Add ad_id filter if provided
    if (adIdList.length > 0) {
      queryParams.push(adIdList);
      query += ` AND ads.fb_ad_id = ANY($${queryParams.length}::text[])`;
    }

    query += `
      GROUP BY
        ads.fb_ad_id,
        ads.ad_name
      ORDER BY
        customers_with_phone DESC
    `;

    console.log("📞 [Phone Leads API] Executing query:", query);
    console.log("📞 [Phone Leads API] Query params:", queryParams);

    // Get a client from the pool
    client = await pool.connect();
    console.log("✅ [Phone Leads API] Database connected successfully");

    const result = await client.query(query, queryParams);

    console.log(
      "✅ [Phone Leads API] Query result:",
      result.rows.length,
      "rows"
    );
    console.log("📊 [Phone Leads API] Sample data:", result.rows.slice(0, 3));

    // Convert to map for easy lookup by fb_ad_id
    const phoneLeadsMap: { [key: string]: number } = {};
    result.rows.forEach((row) => {
      phoneLeadsMap[row.fb_ad_id] = parseInt(row.customers_with_phone) || 0;
      console.log(
        `  📍 Ad ${row.fb_ad_id}: ${row.customers_with_phone} phone leads`
      );
    });

    return NextResponse.json({
      success: true,
      data: phoneLeadsMap,
      details: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error("❌ [Phone Leads API] Error:", error);
    console.error("❌ [Phone Leads API] Error stack:", error?.stack);
    console.error("❌ [Phone Leads API] Error name:", error?.name);
    console.error("❌ [Phone Leads API] Error message:", error?.message);

    // Return empty data instead of error to prevent breaking the UI
    return NextResponse.json({
      success: false,
      error: "Failed to fetch phone leads data",
      details: error?.message || error?.toString() || "Unknown error",
      errorType: error?.name || "Error",
      data: {}, // Return empty object so the UI can handle it gracefully
    });
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
}

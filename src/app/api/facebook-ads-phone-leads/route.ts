import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
export async function GET(request: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD (optional)
    const adIdsParam = searchParams.get("ad_ids"); // Format: comma-separated ad IDs (optional)

    console.log("📞 [Phone Leads API] Request params:", {
      dateParam,
      adIdsParam,
    });

    client = await pool.connect();
    console.log("✅ [Phone Leads API] Database connected successfully");

    // Build SQL query - Group by date OR by ad_id
    let query: string;
    const queryParams: any[] = [];

    if (adIdsParam) {
      // Query for specific ad IDs - group by ad_id
      const adIds = adIdsParam.split(",").map((id) => id.trim());
      query = `
        SELECT
          c.ad_id,
          COUNT(DISTINCT ct.customer_id) AS customers_with_phone
        FROM "BJH-Server".fb_customer_tags ct
        JOIN "BJH-Server".fb_tags t ON t.id = ct.tag_id
        JOIN "BJH-Server".fb_customers c ON c.id = ct.customer_id
        WHERE t.name = 'phone'
          AND c.ad_id = ANY($1)
        GROUP BY c.ad_id
      `;
      queryParams.push(adIds);
    } else {
      // Query for all dates - group by date
      query = `
        SELECT
          ct.assigned_at::date AS date,
          COUNT(DISTINCT ct.customer_id) AS customers_with_phone
        FROM "BJH-Server".fb_customer_tags ct
        JOIN "BJH-Server".fb_tags t ON t.id = ct.tag_id
        WHERE t.name = 'phone'
      `;

      // Add date filter if provided (for single date)
      if (dateParam) {
        queryParams.push(dateParam);
        query += ` AND ct.assigned_at::date = $${queryParams.length}`;
      }

      query += `
        GROUP BY ct.assigned_at::date
        ORDER BY date DESC
      `;
    }

    console.log("📞 [Phone Leads API] Executing query:", query);
    console.log("📞 [Phone Leads API] Query params:", queryParams);

    const result = await client.query(query, queryParams);
    console.log(
      "✅ [Phone Leads API] Query result:",
      result.rows.length,
      "rows"
    );
    console.log("📊 [Phone Leads API] Sample data:", result.rows.slice(0, 3));

    // Convert to map for easy lookup
    const phoneLeadsMap: { [key: string]: number } = {};

    if (adIdsParam) {
      // Format: { "ad_id_1": count, "ad_id_2": count, ... }
      result.rows.forEach((row) => {
        phoneLeadsMap[row.ad_id] = parseInt(row.customers_with_phone) || 0;
        console.log(
          `  📍 Ad ${row.ad_id}: ${row.customers_with_phone} phone leads`
        );
      });
    } else {
      // Format: { "YYYY-MM-DD": count, ... }
      result.rows.forEach((row) => {
        const date = new Date(row.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        phoneLeadsMap[dateStr] = parseInt(row.customers_with_phone) || 0;
        console.log(
          `  📍 Date ${dateStr}: ${row.customers_with_phone} phone leads`
        );
      });
    }

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

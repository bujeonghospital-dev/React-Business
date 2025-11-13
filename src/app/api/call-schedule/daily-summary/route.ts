import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// GET: ดึงข้อมูลสรุปการโทรรายวัน
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];
    const agentNumber = searchParams.get("agent_number");

    let query = supabase
      .from("v_daily_call_summary")
      .select("*")
      .eq("record_date", date);

    if (agentNumber) {
      query = query.eq("agent_number", agentNumber);
    }

    const { data, error } = await query.order("agent_number", {
      ascending: true,
    });

    if (error) {
      console.error("Error fetching daily summary:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error("Error in GET /api/call-schedule/daily-summary:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

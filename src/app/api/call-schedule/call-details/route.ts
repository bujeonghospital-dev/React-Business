import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// GET: ดึงรายละเอียดการโทรแต่ละสาย
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const callRecordId = searchParams.get("call_record_id");
    const agentNumber = searchParams.get("agent_number");
    const date = searchParams.get("date");

    let query = supabase.from("call_details").select(`
        *,
        agent:agents(agent_number, agent_name)
      `);

    if (callRecordId) {
      query = query.eq("call_record_id", callRecordId);
    }

    if (agentNumber) {
      query = query.eq("agent.agent_number", agentNumber);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query = query
        .gte("call_started_at", startDate.toISOString())
        .lte("call_started_at", endDate.toISOString());
    }

    const { data, error } = await query.order("call_started_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching call details:", error);
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
    console.error("Error in GET /api/call-schedule/call-details:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: เพิ่มรายละเอียดการโทรแต่ละสาย
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      call_record_id,
      agent_number,
      customer_phone,
      customer_name,
      call_type,
      call_status,
      call_started_at,
      call_ended_at,
      call_duration_seconds,
      call_notes,
      call_result,
      yalecom_call_id,
      robocall_id,
    } = body;

    // Validate required fields
    if (!agent_number) {
      return NextResponse.json(
        { success: false, error: "agent_number is required" },
        { status: 400 }
      );
    }

    // Get agent_id
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("agent_number", agent_number)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: `Agent not found: ${agent_number}` },
        { status: 404 }
      );
    }

    // Insert call detail
    const { data, error } = await supabase
      .from("call_details")
      .insert({
        call_record_id,
        agent_id: agent.id,
        customer_phone,
        customer_name,
        call_type,
        call_status,
        call_started_at,
        call_ended_at,
        call_duration_seconds,
        call_notes,
        call_result,
        yalecom_call_id,
        robocall_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting call detail:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Call detail created successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /api/call-schedule/call-details:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

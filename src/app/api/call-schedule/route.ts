import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// GET: ดึงข้อมูลการโทรทั้งหมดตามวันที่
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
    const timeSlot = searchParams.get("time_slot");

    // Query from view
    let query = supabase
      .from("v_call_schedule")
      .select("*")
      .eq("record_date", date);

    if (agentNumber) {
      query = query.eq("agent_number", agentNumber);
    }

    if (timeSlot) {
      query = query.eq("slot_label", timeSlot);
    }

    const { data, error } = await query.order("start_time", {
      ascending: true,
    });

    if (error) {
      console.error("Error fetching call records:", error);
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
    console.error("Error in GET /api/call-schedule:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: สร้าง/อัพเดทข้อมูลการโทร
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
      agent_number,
      slot_label,
      record_date = new Date().toISOString().split("T")[0],
      total_calls = 0,
      successful_calls = 0,
      failed_calls = 0,
      status,
      notes,
      duration_minutes,
    } = body;

    // Validate required fields
    if (!agent_number || !slot_label) {
      return NextResponse.json(
        { success: false, error: "agent_number and slot_label are required" },
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

    // Get time_slot_id
    const { data: timeSlot, error: timeSlotError } = await supabase
      .from("time_slots")
      .select("id")
      .eq("slot_label", slot_label)
      .single();

    if (timeSlotError || !timeSlot) {
      return NextResponse.json(
        { success: false, error: `Time slot not found: ${slot_label}` },
        { status: 404 }
      );
    }

    // Upsert call record
    const { data, error } = await supabase
      .from("call_records")
      .upsert(
        {
          agent_id: agent.id,
          time_slot_id: timeSlot.id,
          record_date,
          total_calls,
          successful_calls,
          failed_calls,
          status,
          notes,
          duration_minutes,
        },
        {
          onConflict: "agent_id,time_slot_id,record_date",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error upserting call record:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Call record updated successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /api/call-schedule:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // สร้าง Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase credentials not configured",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ดึงข้อมูลจาก hourly_call_stats สำหรับวันที่กำหนด
    const { data: statsData, error: statsError } = await supabase
      .from("hourly_call_stats")
      .select(
        `
        hour_slot,
        agent_id,
        outgoing_calls,
        incoming_calls,
        successful_calls,
        total_duration_seconds,
        agents (
          agent_name
        )
      `
      )
      .eq("date", date)
      .order("hour_slot", { ascending: true });

    if (statsError) {
      console.error("❌ Supabase error:", statsError);
      return NextResponse.json(
        {
          success: false,
          error: statsError.message,
        },
        { status: 500 }
      );
    }

    // แปลงข้อมูลเป็นรูปแบบตาราง
    const hourSlots = [
      "11-12",
      "12-13",
      "13-14",
      "14-15",
      "15-16",
      "16-17",
      "17-18",
      "18-19",
    ];
    const agentIds = ["101", "102", "103", "104", "105", "106", "107", "108"];

    const tableData = hourSlots.map((slot) => {
      const rowData: any = { hour_slot: slot };

      agentIds.forEach((agentId) => {
        const agentStats = statsData?.find(
          (item: any) => item.hour_slot === slot && item.agent_id === agentId
        );

        const agents: any = agentStats?.agents;
        rowData[`agent_${agentId}`] = {
          outgoing_calls: agentStats?.outgoing_calls || 0,
          incoming_calls: agentStats?.incoming_calls || 0,
          successful_calls: agentStats?.successful_calls || 0,
          total_duration_seconds: agentStats?.total_duration_seconds || 0,
          agent_name: agents?.agent_name || "",
        };
      });

      return rowData;
    });

    // คำนวณ totals
    const totals: any = { hour_slot: "รวม" };
    agentIds.forEach((agentId) => {
      const agentTotal = statsData?.filter(
        (item: any) => item.agent_id === agentId
      );
      totals[`agent_${agentId}`] = {
        outgoing_calls:
          agentTotal?.reduce(
            (sum: number, item: any) => sum + (item.outgoing_calls || 0),
            0
          ) || 0,
        incoming_calls:
          agentTotal?.reduce(
            (sum: number, item: any) => sum + (item.incoming_calls || 0),
            0
          ) || 0,
        successful_calls:
          agentTotal?.reduce(
            (sum: number, item: any) => sum + (item.successful_calls || 0),
            0
          ) || 0,
        total_duration_seconds:
          agentTotal?.reduce(
            (sum: number, item: any) =>
              sum + (item.total_duration_seconds || 0),
            0
          ) || 0,
      };
    });

    return NextResponse.json({
      success: true,
      date: date,
      tableData: tableData,
      totals: totals,
      rawData: statsData,
    });
  } catch (error: any) {
    console.error("❌ Error fetching call matrix:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch call matrix data",
      },
      { status: 500 }
    );
  }
}

// POST: บันทึก call log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agent_id,
      customer_phone,
      customer_name,
      call_type = "outgoing",
      call_status = "answered",
      start_time,
      end_time,
      duration_seconds,
      notes,
    } = body;

    // Validation
    if (!agent_id || !start_time) {
      return NextResponse.json(
        {
          success: false,
          error: "agent_id and start_time are required",
        },
        { status: 400 }
      );
    }

    // สร้าง Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase credentials not configured",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // บันทึก call log
    const { data, error } = await supabase
      .from("call_logs")
      .insert([
        {
          agent_id,
          customer_phone,
          customer_name,
          call_type,
          call_status,
          start_time,
          end_time,
          duration_seconds,
          notes,
        },
      ])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Call log saved successfully",
    });
  } catch (error: any) {
    console.error("❌ Error saving call log:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save call log",
      },
      { status: 500 }
    );
  }
}

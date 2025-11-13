import { NextRequest, NextResponse } from "next/server";

/**
 * API สำหรับบันทึกการโทรอัตโนมัติ
 * ใช้งานร่วมกับ Queue Status API
 *
 * วิธีใช้:
 * 1. เรียกใช้ตอน agent เริ่มโทร (status = "Outbound")
 * 2. เรียกใช้ตอน agent จบสาย (status = "Waiting/Available")
 */

interface AutoLogPayload {
  agent_id: string;
  customer_phone: string;
  customer_name?: string;
  call_type: "outgoing" | "incoming";
  call_status: "started" | "ended";
  timestamp?: string;
}

// เก็บข้อมูล call ที่กำลังดำเนินการ (in-memory)
const activeCallsMap = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const payload: AutoLogPayload = await request.json();

    const {
      agent_id,
      customer_phone,
      customer_name,
      call_type,
      call_status,
      timestamp,
    } = payload;

    // Validation
    if (!agent_id || !customer_phone || !call_status) {
      return NextResponse.json(
        {
          success: false,
          error: "agent_id, customer_phone, and call_status are required",
        },
        { status: 400 }
      );
    }

    const callKey = `${agent_id}_${customer_phone}`;
    const now = timestamp || new Date().toISOString();

    // ===========================================
    // กรณี: เริ่มต้นโทร (call_status = "started")
    // ===========================================
    if (call_status === "started") {
      activeCallsMap.set(callKey, {
        agent_id,
        customer_phone,
        customer_name,
        call_type,
        start_time: now,
      });

      console.log(`📞 Call started: Agent ${agent_id} -> ${customer_phone}`);

      return NextResponse.json({
        success: true,
        message: "Call tracking started",
        call_key: callKey,
      });
    }

    // ===========================================
    // กรณี: จบสาย (call_status = "ended")
    // ===========================================
    if (call_status === "ended") {
      const activeCall = activeCallsMap.get(callKey);

      if (!activeCall) {
        return NextResponse.json(
          {
            success: false,
            error: "No active call found for this agent and phone",
          },
          { status: 404 }
        );
      }

      // คำนวณระยะเวลา
      const startTime = new Date(activeCall.start_time);
      const endTime = new Date(now);
      const durationSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      // บันทึกลง Call Matrix Database
      const callLogData = {
        agent_id: activeCall.agent_id,
        customer_phone: activeCall.customer_phone,
        customer_name: activeCall.customer_name || null,
        call_type: activeCall.call_type,
        call_status: "answered", // ถือว่าโทรสำเร็จ
        start_time: activeCall.start_time,
        end_time: now,
        duration_seconds: durationSeconds,
        notes: "Auto-logged from Queue Status",
      };

      const saveResponse = await fetch(getBaseUrl() + "/api/call-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callLogData),
      });

      const saveResult = await saveResponse.json();

      // ลบออกจาก active calls
      activeCallsMap.delete(callKey);

      if (saveResult.success) {
        console.log(
          `✅ Call ended & logged: Agent ${agent_id} -> ${customer_phone} (${durationSeconds}s)`
        );
        return NextResponse.json({
          success: true,
          message: "Call ended and logged successfully",
          saved_data: saveResult.data,
          duration_seconds: durationSeconds,
        });
      } else {
        return NextResponse.json(
          { success: false, error: saveResult.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid call_status. Use 'started' or 'ended'",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Auto-log error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to auto-log call" },
      { status: 500 }
    );
  }
}

// GET: ดูข้อมูล active calls
export async function GET() {
  const activeCalls = Array.from(activeCallsMap.entries()).map(
    ([key, value]) => ({
      call_key: key,
      ...value,
    })
  );

  return NextResponse.json({
    success: true,
    active_calls_count: activeCalls.length,
    active_calls: activeCalls,
  });
}

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

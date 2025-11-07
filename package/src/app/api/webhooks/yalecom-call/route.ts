import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook สำหรับรับสาย (Incoming Call)
 * Yalecom จะส่ง webhook มาเมื่อมีสายเข้า
 */

interface YalecomWebhookPayload {
  call_id?: string;
  caller_number?: string;
  callee_number?: string;
  queue_name?: string;
  queue_extension?: string;
  agent_id?: string;
  agent_name?: string;
  call_status?: string;
  timestamp?: string;
  direction?: "inbound" | "outbound";
  event_type?: "call_started" | "call_answered" | "call_ended" | "call_ringing";
}

export async function POST(request: NextRequest) {
  try {
    const payload: YalecomWebhookPayload = await request.json();

    console.log("📞 Webhook received:", payload);

    // ========================================
    // เมื่อสายจบ (call_ended) - บันทึกลง Call Matrix
    // ========================================
    if (payload.event_type === "call_ended" && payload.agent_id) {
      const callLogData = {
        agent_id: payload.agent_id,
        customer_phone:
          payload.caller_number || payload.callee_number || "Unknown",
        customer_name: null,
        call_type: payload.direction === "inbound" ? "incoming" : "outgoing",
        call_status: "answered", // เมื่อจบสายถือว่ารับสายสำเร็จ
        start_time: payload.timestamp || new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: 0, // ถ้า Yalecom ส่งมาให้ใช้ payload.duration
        notes: `Webhook: ${payload.event_type} - Queue: ${payload.queue_name}`,
      };

      // บันทึกลง Call Matrix Database
      const saveResponse = await fetch(`${getBaseUrl()}/api/call-matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callLogData),
      });

      const saveResult = await saveResponse.json();

      if (saveResult.success) {
        console.log("✅ Call log saved to database:", saveResult.data);
        return NextResponse.json({
          success: true,
          message: "Call ended - logged successfully",
          saved_data: saveResult.data,
        });
      } else {
        console.error("❌ Failed to save call log:", saveResult.error);
      }
    }

    // ========================================
    // สายเข้า - บันทึกลง customer_contacts
    // ========================================
    if (
      payload.direction === "inbound" &&
      payload.event_type === "call_ringing"
    ) {
      const contactData = {
        name: payload.agent_name || "Unknown Agent",
        company: payload.queue_name || "Unknown Queue",
        phone: payload.caller_number || "Unknown",
        email: "",
        status: "received", // แท็กเป็น "รับสาย"
        notes: `สายเข้าจาก Queue ${payload.queue_extension}`,
      };

      // บันทึกลง customer_contacts
      const contactResponse = await fetch(
        `${getBaseUrl()}/api/customer-contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        }
      );

      const contactResult = await contactResponse.json();

      return NextResponse.json({
        success: true,
        message: "Incoming call webhook processed",
        data: contactResult.data,
      });
    }

    // ========================================
    // สายออก - บันทึกลง customer_contacts
    // ========================================
    if (
      payload.direction === "outbound" &&
      payload.event_type === "call_started"
    ) {
      const contactData = {
        name: payload.agent_name || "Unknown Agent",
        company: payload.queue_name || "Unknown Queue",
        phone: payload.callee_number || "Unknown",
        email: "",
        status: "outgoing", // แท็กเป็น "โทรออก"
        notes: `โทรออกจาก Agent ${payload.agent_id}`,
      };

      const contactResponse = await fetch(
        `${getBaseUrl()}/api/customer-contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        }
      );

      const contactResult = await contactResponse.json();

      return NextResponse.json({
        success: true,
        message: "Outbound call webhook processed",
        data: contactResult.data,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received but not processed",
      payload,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ฟังก์ชันช่วย: ดึง Base URL
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

// รองรับ GET สำหรับทดสอบ
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Yalecom Call Webhook Endpoint",
    endpoints: {
      POST: "/api/webhooks/yalecom-call",
      description: "Receive incoming/outgoing call events from Yalecom",
    },
    supported_events: [
      "call_started",
      "call_answered",
      "call_ended",
      "call_ringing",
    ],
  });
}

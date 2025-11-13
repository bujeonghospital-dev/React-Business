import { NextRequest, NextResponse } from "next/server";

/**
 * Robocall API - สำหรับโทรออกอัตโนมัติ
 * แท็กสถานะเป็น "กำลังดำเนินการ" (outgoing)
 */

interface RobocallRequest {
  phone_number: string;
  agent_id?: string;
  campaign_name?: string;
  message?: string;
}

interface RobocallResponse {
  call_id: string;
  status: "กำลังดำเนินการ" | "สำเร็จ" | "ล้มเหลว";
  phone_number: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RobocallRequest = await request.json();
    const { phone_number, agent_id, campaign_name, message } = body;

    if (!phone_number) {
      return NextResponse.json(
        {
          success: false,
          error: "phone_number is required",
        },
        { status: 400 }
      );
    }

    // TODO: เรียก Yalecom Robocall API จริง
    // const yalecomResponse = await fetch("https://api.yalecom.com/robocall", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${process.env.YALECOM_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     phone_number,
    //     agent_id,
    //     campaign_name,
    //     message,
    //   }),
    // });

    // Mock response สำหรับทดสอบ
    const callId = `robocall-${Date.now()}`;
    const result: RobocallResponse = {
      call_id: callId,
      status: "กำลังดำเนินการ",
      phone_number,
      timestamp: new Date().toISOString(),
    };

    // บันทึกข้อมูลการโทรออก
    const contactData = {
      id: callId,
      name: agent_id || "Robocall System",
      company: campaign_name || "Robocall Campaign",
      phone: phone_number,
      email: "",
      status: "outgoing", // แท็กเป็น "โทรออก"
      lastContact: result.timestamp,
      notes: `Robocall: ${message || "Auto dialing..."}`,
      createdAt: result.timestamp,
    };

    // TODO: บันทึกลง Database
    // await saveContactToDatabase(contactData);

    console.log("📞 Robocall initiated:", contactData);

    return NextResponse.json({
      success: true,
      message: "Robocall initiated successfully",
      data: result,
      contact: contactData,
    });
  } catch (error) {
    console.error("❌ Robocall error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate robocall",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - ตรวจสอบสถานะการโทร
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const call_id = searchParams.get("call_id");

  if (!call_id) {
    return NextResponse.json({
      success: true,
      message: "Robocall API Endpoint",
      usage: {
        POST: "Initiate robocall",
        GET: "Check call status (requires call_id parameter)",
      },
    });
  }

  // TODO: ตรวจสอบสถานะจาก Yalecom API
  // const status = await checkRobocallStatus(call_id);

  return NextResponse.json({
    success: true,
    data: {
      call_id,
      status: "กำลังดำเนินการ",
      timestamp: new Date().toISOString(),
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { listAppointments } from "@/repositories/appointmentRepository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      doctor_code: searchParams.get("doctor_code") || undefined,
      dest_code: searchParams.get("dest_code") || undefined,
    };

    const data = await listAppointments(filters);

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch appointments",
        data: [],
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  createAppointmentForCustomer,
  listAppointmentsByCn,
} from "@/repositories/appointmentRepository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cn?: string }> }
) {
  const { cn } = await params;
  if (!cn) {
    return NextResponse.json({ success: false, error: "Missing customer CN" }, { status: 400 });
  }

  const data = await listAppointmentsByCn(cn);
  return NextResponse.json({ success: true, data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cn?: string }> }
) {
  const { cn } = await params;
  if (!cn) {
    return NextResponse.json({ success: false, error: "Missing customer CN" }, { status: 400 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  try {
    const created = await createAppointmentForCustomer(cn, payload);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create appointment" },
      { status: 400 }
    );
  }
}

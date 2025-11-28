import { NextRequest, NextResponse } from "next/server";
import {
  deleteAppointmentByCode,
  getAppointmentByCode,
  updateAppointmentByCode,
} from "@/repositories/appointmentRepository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointCode?: string }> }
) {
  const { appointCode } = await params;
  if (!appointCode) {
    return NextResponse.json({ success: false, error: "Missing appointCode" }, { status: 400 });
  }

  const appointment = await getAppointmentByCode(appointCode);
  if (!appointment) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: appointment });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appointCode?: string }> }
) {
  const { appointCode } = await params;
  if (!appointCode) {
    return NextResponse.json({ success: false, error: "Missing appointCode" }, { status: 400 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const updated = await updateAppointmentByCode(appointCode, payload);
  if (!updated) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ appointCode?: string }> }
) {
  const { appointCode } = await params;
  if (!appointCode) {
    return NextResponse.json({ success: false, error: "Missing appointCode" }, { status: 400 });
  }

  const deleted = await deleteAppointmentByCode(appointCode);
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

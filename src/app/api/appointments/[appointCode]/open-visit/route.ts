import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createVisit } from "@/repositories/visitRepository";
import {
  getAppointmentByCode,
  linkVisitToAppointment,
} from "@/repositories/appointmentRepository";
import { Visit } from "@/types/visit";
import { Appointment } from "@/types/appointment";

const buildDisplayName = (appointment: Appointment | null) => {
  if (!appointment) {
    return null;
  }
  if (appointment.display_name?.trim()) {
    return appointment.display_name.trim();
  }

  const pieces = [appointment.prefix, appointment.name, appointment.surname]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  if (pieces.length) {
    return pieces.join(" ");
  }

  if (appointment.nickname?.trim()) {
    return appointment.nickname.trim();
  }

  return appointment.code || null;
};

export async function POST(
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

  const cn = appointment.code;
  if (!cn?.trim()) {
    return NextResponse.json(
      { success: false, error: "Appointment is missing customer reference" },
      { status: 400 }
    );
  }

  if (appointment.vn) {
    return NextResponse.json(
      { success: true, data: { vn: appointment.vn, cn, appointCode } },
      { status: 200 }
    );
  }

  const vn = uuidv4();
  const displayName = buildDisplayName(appointment);
  const visitPayload: Omit<Visit, "record_no"> = {
    vn,
    cn,
    doctor_code: appointment.doctor_code || undefined,
    start_date: appointment.start_date || null,
    doc_type: "OPD",
    display_name: displayName || undefined,
    cc: appointment.activity || undefined,
    note_result: appointment.note || undefined,
  };

  try {
    await createVisit(visitPayload);
    await linkVisitToAppointment(appointCode, vn);

    return NextResponse.json({
      success: true,
      data: { vn, cn, appointCode },
    });
  } catch (error: any) {
    console.error("Failed to open visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to open visit",
      },
      { status: 500 }
    );
  }
}

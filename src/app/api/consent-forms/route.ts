import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const TABLE = '"BJH-Server".bjh_consent_forms';

const toNullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

type ConsentSectionPayload = {
  part?: string | null;
  weight?: string | number | null;
  height?: string | number | null;
  hasChronic?: boolean | null;
  chronicDiseaseDetail?: string | null;
  hasDrugAllergy?: boolean | null;
  drugAllergyDetail?: string | null;
  signatureUrl?: string | null;
  weight_kg?: string | number | null;
  height_cm?: string | number | null;
  has_chronic_disease?: boolean | null;
  chronic_disease_detail?: string | null;
  has_drug_allergy?: boolean | null;
  drug_allergy_detail?: string | null;
  signature_url?: string | null;
  consentCode?: string | null;
  consent_code?: string | null;
  consentDate?: string | null;
  consent_date?: string | null;
  verifiedByStaff?: string | null;
  verified_by_staff?: string | null;
  doctorCode?: string | null;
  doctor_code?: string | null;
  medicalConsent?: string | null;
  medical_consent?: string | null;
  acceptPdpa?: string | null;
  accept_pdpa?: string | null;
  acceptMedia?: string | null;
  accept_media?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idAll = searchParams.get("id_all")?.trim() || searchParams.get("code")?.trim();

    if (!idAll) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id_all" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM ${TABLE} WHERE id_all = $1 ORDER BY updated_at DESC, created_at DESC`,
      [idAll]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      totalRecords: result.rowCount,
    });
  } catch (error: any) {
    console.error("Error loading consent forms:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load consent forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idAllValue =
      (body.idAll ?? body.id_all ?? body.code ?? "").toString().trim() || "";
    const createdBy = body.createdBy?.toString().trim() || null;
    const sections: ConsentSectionPayload[] = Array.isArray(body.sections)
      ? body.sections
      : [];

    if (!idAllValue) {
      return NextResponse.json(
        { success: false, error: "Missing customer id_all" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let savedSections = 0;
      for (const section of sections) {
        const part = (section.part ?? "").toString().trim();
        if (!part) continue;
        savedSections += 1;
        const weightValue = toNullableNumber(section.weight ?? section.weight_kg);
        const heightValue = toNullableNumber(section.height ?? section.height_cm);
        const hasChronic = Boolean(
          section.hasChronic ?? section.has_chronic_disease
        );
        const chronicDiseaseDetail =
          section.chronicDiseaseDetail?.toString().trim() ||
          section.chronic_disease_detail?.toString().trim() ||
          null;
        const hasDrugAllergy = Boolean(
          section.hasDrugAllergy ?? section.has_drug_allergy
        );
        const drugAllergyDetail =
          section.drugAllergyDetail?.toString().trim() ||
          section.drug_allergy_detail?.toString().trim() ||
          null;
        const signatureUrl =
          section.signatureUrl?.toString().trim() ||
          section.signature_url?.toString().trim() ||
          null;
        const consentCode =
          section.consentCode?.toString().trim() ||
          section.consent_code?.toString().trim() ||
          null;
        const consentDate =
          section.consentDate?.toString().trim() ||
          section.consent_date?.toString().trim() ||
          null;
        const verifiedByStaff =
          section.verifiedByStaff?.toString().trim() ||
          section.verified_by_staff?.toString().trim() ||
          null;
        const doctorCode =
          section.doctorCode?.toString().trim() ||
          section.doctor_code?.toString().trim() ||
          null;
        const medicalConsent =
          section.medicalConsent?.toString().trim() ||
          section.medical_consent?.toString().trim() ||
          null;
        const acceptPdpa =
          section.acceptPdpa?.toString().trim() ||
          section.accept_pdpa?.toString().trim() ||
          null;
        const acceptMedia =
          section.acceptMedia?.toString().trim() ||
          section.accept_media?.toString().trim() ||
          null;

        await client.query(
          `DELETE FROM ${TABLE} WHERE id_all = $1 AND part = $2`,
          [idAllValue, part]
        );
        await client.query(
          `INSERT INTO ${TABLE} (id_all, part, consent_code, consent_date, weight_kg, height_cm, has_chronic_disease, chronic_disease_detail, has_drug_allergy, drug_allergy_detail, signature_url, verified_by_staff, doctor_code, medical_consent, accept_pdpa, accept_media, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
          [
            idAllValue,
            part,
            consentCode,
            consentDate,
            weightValue,
            heightValue,
            hasChronic,
            chronicDiseaseDetail,
            hasDrugAllergy,
            drugAllergyDetail,
            signatureUrl,
            verifiedByStaff,
            doctorCode,
            medicalConsent,
            acceptPdpa,
            acceptMedia,
          ]
        );
      }

      await client.query("COMMIT");
      const message = savedSections
        ? `บันทึก ${savedSections} ส่วนของ Consent เรียบร้อยแล้ว`
        : "ไม่มีส่วนของ Consent ที่ต้องบันทึก";
      return NextResponse.json({ success: true, message });
    } catch (error: any) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error saving consent forms:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to persist consent forms" },
      { status: 500 }
    );
  }
}

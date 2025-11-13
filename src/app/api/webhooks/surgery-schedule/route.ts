import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper function to get Supabase client (lazy initialization)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Interface สำหรับข้อมูลที่ส่งมาจาก Google Sheets
interface SurgeryScheduleWebhookData {
  // ข้อมูลพื้นฐาน
  doctor?: string; // หมอ
  contact_person?: string; // ผู้ติดต่อ (101-สา, 102-พัชชา, ฯลฯ)
  customer_name?: string; // ชื่อลูกค้า
  phone_number?: string; // เบอร์โทร

  // วันที่และเวลา
  date_consult_scheduled?: string; // วันที่ได้นัด consult (YYYY-MM-DD)
  date_surgery_scheduled?: string; // วันที่ได้นัดผ่าตัด (YYYY-MM-DD)
  surgery_date?: string; // วันที่ผ่าตัดจริง (YYYY-MM-DD)
  appointment_time?: string; // เวลาที่นัด (HH:MM:SS)

  // ข้อมูลทางการเงิน
  proposed_amount?: string; // ยอดนำเสนอ

  // ข้อมูลเพิ่มเติม (ตามที่มีใน film_data table)
  campaign?: string;
  campaign_link?: string;
  medical_fee?: string;
  hospital_fee?: string;
  anesthesia_fee?: string;
  item_fee?: string;
  other_expenses?: string;
  consulting_specialist?: string;
  remarks?: string;

  // สำหรับ update (ต้องมี ID)
  id?: string;
}

// Helper function: แปลงวันที่จาก DD/MM/YYYY เป็น YYYY-MM-DD
function convertThaiDateToISO(dateStr: string | undefined): string | null {
  if (!dateStr || dateStr.trim() === "") return null;

  const cleanStr = dateStr.trim();

  // ถ้าเป็น ISO format อยู่แล้ว (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return cleanStr;
  }

  // แปลงจาก DD/MM/YYYY หรือ D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
    const parts = cleanStr.split("/");
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  return null;
}

// Helper function: ดึงเฉพาะชื่อผู้ติดต่อจาก "101-สา" → "สา"
function extractContactPersonName(contactPerson: string | undefined): string {
  if (!contactPerson) return "";

  const parts = contactPerson.split("-");
  if (parts.length > 1) {
    return parts[1].trim();
  }

  return contactPerson.trim();
}

// POST: รับข้อมูลจาก Google Sheets Webhook
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication (optional: ใช้ API key หรือ secret)
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.SURGERY_SCHEDULE_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // อ่านข้อมูลที่ส่งมาจาก webhook
    const body: SurgeryScheduleWebhookData | SurgeryScheduleWebhookData[] =
      await request.json();

    // ตรวจสอบว่าเป็น array หรือ object เดียว
    const dataArray = Array.isArray(body) ? body : [body];

    if (dataArray.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process แต่ละ record
    for (const data of dataArray) {
      try {
        // แปลงวันที่เป็น ISO format
        const dateConsultScheduled = convertThaiDateToISO(
          data.date_consult_scheduled
        );
        const dateSurgeryScheduled = convertThaiDateToISO(
          data.date_surgery_scheduled
        );
        const surgeryDate = convertThaiDateToISO(data.surgery_date);

        // ดึงเฉพาะชื่อผู้ติดต่อ
        const contactPersonName = extractContactPersonName(data.contact_person);

        // เตรียมข้อมูลสำหรับบันทึกลง Supabase
        // เฉพาะ fields ที่มีในตาราง film_data
        const filmDataRecord = {
          doctor: data.doctor || null,
          contact_person: contactPersonName || null,
          customer_name: data.customer_name || null,
          phone_number: data.phone_number || null,
          date_consult_scheduled: dateConsultScheduled,
          date_surgery_scheduled: dateSurgeryScheduled,
          surgery_date: surgeryDate,
          appointment_time: data.appointment_time || null,
          proposed_amount: data.proposed_amount || null,
        };

        let result;

        // ถ้ามี ID = update, ถ้าไม่มี = insert
        if (data.id) {
          // Update existing record
          const { data: updateData, error: updateError } =
            await getSupabaseClient()
              .from("film_data")
              .update(filmDataRecord)
              .eq("id", data.id)
              .select()
              .single();

          if (updateError) throw updateError;
          result = { action: "updated", data: updateData };
        } else {
          // Insert new record
          const { data: insertData, error: insertError } =
            await getSupabaseClient()
              .from("film_data")
              .insert(filmDataRecord)
              .select()
              .single();

          if (insertError) throw insertError;
          result = { action: "inserted", data: insertData };
        }

        results.push(result);
      } catch (error: any) {
        console.error("Error processing record:", error);
        errors.push({
          data: data,
          error: error.message,
        });
      }
    }

    // Return response
    return NextResponse.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// GET: ทดสอบว่า endpoint ทำงานหรือไม่
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Surgery Schedule Webhook Endpoint",
    status: "active",
    endpoint: "/api/webhooks/surgery-schedule",
    methods: ["POST"],
    description:
      "Receives data from Google Sheets and saves to Supabase film_data table",
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_WEBHOOK_SECRET (optional)",
      },
      body: {
        single: {
          doctor: "หมอสมชาย",
          contact_person: "101-สา",
          customer_name: "คุณสมศรี",
          phone_number: "0812345678",
          date_consult_scheduled: "15/11/2025 or 2025-11-15",
          date_surgery_scheduled: "20/11/2025 or 2025-11-20",
          appointment_time: "10:00:00",
          proposed_amount: "50000",
        },
        multiple: [
          {
            /* record 1 */
          },
          {
            /* record 2 */
          },
        ],
      },
    },
  });
}

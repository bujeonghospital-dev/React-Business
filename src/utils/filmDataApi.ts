// Python API Client สำหรับ Film Data Contacts
const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL ||
  "https://believable-ambition-production.up.railway.app";

export interface FilmDataContactsResponse {
  success: boolean;
  error?: string;
  data: Array<{
    id: string;
    contact_person: string;
    consult_date: string;
    consult_date_normalized: string;
    surgery_appointment_date: string;
    surgery_appointment_date_normalized: string | null;
    // Support both Thai and English field names
    ผู้ติดต่อ?: string;
    "วันที่ได้นัด consult"?: string;
    วันที่ได้นัดผ่าตัด?: string;
    [key: string]: any;
  }>;
  count_summary: {
    consult_appointments: {
      by_date: Array<{ date: string; count: number }>;
      total_appointments: number;
      total_dates: number;
    };
    surgery_appointments: {
      by_date: Array<{ date: string; count: number }>;
      total_appointments: number;
      total_dates: number;
    };
  };
  columns: string[];
  total: number;
  source: string;
  timestamp: string;
  filter?: {
    date?: string;
    type?: string;
  };
}

export interface FilmDataCountsByAgent {
  consultCounts: Record<string, number>; // จำนวน consult แต่ละ agent
  surgeryCounts: Record<string, number>; // จำนวนนัดผ่าตัดแต่ละ agent
}

/**
 * ดึงข้อมูล Film Data Contacts พร้อมจำนวน consult และนัดผ่าตัด
 * @param date - วันที่ในรูปแบบ YYYY-MM-DD (optional)
 * @param count - ขอ count summary ด้วยไหม (default: true)
 * @param today - ดึงข้อมูลวันนี้เท่านั้น (default: false)
 */
export async function fetchFilmDataContacts(
  date?: string,
  count: boolean = true,
  today: boolean = false
): Promise<FilmDataContactsResponse> {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (count) params.append("count", "true");
    if (today) params.append("today", "true");

    const url = `${PYTHON_API_URL}/api/film-data-contacts?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching film data contacts:", error);
    throw error;
  }
}

/**
 * แปลงข้อมูล Film Data เป็นจำนวนแยกตาม Agent
 * รองรับทั้ง field ภาษาไทยและอังกฤษ
 * สมมติว่า contact_person มีรูปแบบเช่น "สา", "พัดชา", "ตั้งโอ๋" (ชื่อเซลล์)
 */
export function transformFilmDataToAgentCounts(
  data: FilmDataContactsResponse
): FilmDataCountsByAgent {
  const consultCounts: Record<string, number> = {};
  const surgeryCounts: Record<string, number> = {};

  // Map ชื่อเซลล์ไปเป็น Agent ID
  const agentNameMap: Record<string, string> = {
    สา: "101",
    พัดชา: "102",
    ตั้งโอ๋: "103",
    Test: "104",
    โอ๋: "105",
    เต้: "106",
    เอ้: "107",
    อ้อม: "108",
  };

  // นับจากข้อมูลแต่ละแถว
  data.data.forEach((row) => {
    // รองรับทั้ง field ภาษาอังกฤษและไทย
    const contact = row.contact_person || row["ผู้ติดต่อ"] || "";
    const consultDate = row.consult_date || row["วันที่ได้นัด consult"] || "";
    const surgeryDate =
      row.surgery_appointment_date || row["วันที่ได้นัดผ่าตัด"] || "";

    // ดึง Agent ID จากชื่อผู้ติดต่อ
    const contactName = contact.trim();
    const agentId = agentNameMap[contactName];

    if (!agentId) {
      // ถ้าไม่เจอใน map ลองดึงจากตัวเลข 3 หลัก
      const agentMatch = contactName.match(/^(\d{3})/);
      if (!agentMatch) return;
      const extractedId = agentMatch[1];

      // นับ consult ถ้ามีวันที่
      if (consultDate && consultDate.trim() !== "") {
        consultCounts[extractedId] = (consultCounts[extractedId] || 0) + 1;
      }

      // นับนัดผ่าตัดถ้ามีวันที่
      if (surgeryDate && surgeryDate.trim() !== "") {
        surgeryCounts[extractedId] = (surgeryCounts[extractedId] || 0) + 1;
      }
      return;
    }

    // นับ consult ถ้ามีวันที่
    if (consultDate && consultDate.trim() !== "") {
      consultCounts[agentId] = (consultCounts[agentId] || 0) + 1;
    }

    // นับนัดผ่าตัดถ้ามีวันที่
    if (surgeryDate && surgeryDate.trim() !== "") {
      surgeryCounts[agentId] = (surgeryCounts[agentId] || 0) + 1;
    }
  });

  return {
    consultCounts,
    surgeryCounts,
  };
}

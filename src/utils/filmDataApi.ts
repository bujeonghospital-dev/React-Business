// Python API Client สำหรับ Film Data Contacts
const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL ||
  "https://believable-ambition-production.up.railway.app";

export interface FilmDataContactsResponse {
  success: boolean;
  data: Array<{
    ผู้ติดต่อ: string;
    "วันที่ได้นัด consult": string;
    วันที่ได้นัดผ่าตัด: string;
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
 */
export async function fetchFilmDataContacts(
  date?: string,
  count: boolean = true
): Promise<FilmDataContactsResponse> {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (count) params.append("count", "true");

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
 * สมมติว่า "ผู้ติดต่อ" มีรูปแบบเช่น "101", "102", "107" หรือ "101-ชื่อ"
 */
export function transformFilmDataToAgentCounts(
  data: FilmDataContactsResponse
): FilmDataCountsByAgent {
  const consultCounts: Record<string, number> = {};
  const surgeryCounts: Record<string, number> = {};

  // นับจากข้อมูลแต่ละแถว
  data.data.forEach((row) => {
    const contact = row["ผู้ติดต่อ"] || "";
    const consultDate = row["วันที่ได้นัด consult"] || "";
    const surgeryDate = row["วันที่ได้นัดผ่าตัด"] || "";

    // ดึง Agent ID จากชื่อผู้ติดต่อ (เช่น "101", "102-ชื่อ" → "102")
    const agentMatch = contact.match(/^(\d{3})/);
    if (!agentMatch) return;

    const agentId = agentMatch[1];

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

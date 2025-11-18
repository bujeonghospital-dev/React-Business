// Python API Client สำหรับ Call Matrix
const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL ||
  "https://believable-ambition-production.up.railway.app";

export interface CallMatrixData {
  success: boolean;
  date: string;
  time_slots: string[];
  matrix_data: Record<string, Record<string, number>>;
  totals_by_agent?: Record<string, number>; // Optional: จะมาจาก API ใหม่ในอนาคต
  totals_by_slot?: Record<string, number>; // Optional: จะมาจาก API ใหม่ในอนาคต
  grand_total: number;
}

export interface AgentSummary {
  success: boolean;
  agent_id: string;
  date: string;
  calls_by_slot: Record<string, number>;
  total_calls: number;
}

export interface TimeSlotSummary {
  success: boolean;
  time_slot: string;
  date: string;
  calls_by_agent: Record<string, number>;
  total_calls: number;
}

export interface LogCallRequest {
  agent_id: string;
  call_type?: "outgoing" | "incoming" | "missed";
  time_slot?: string;
}

export interface UpdateCallRequest {
  agent_id: string;
  time_slot: string;
  value: number;
}

export interface BatchUpdateRequest {
  updates: UpdateCallRequest[];
}

export interface TotalsByAgentResponse {
  success: boolean;
  date: string;
  totals_by_agent: Record<string, number>;
  grand_total: number;
}

export interface TotalsBySlotResponse {
  success: boolean;
  date: string;
  totals_by_slot: Record<string, number>;
  grand_total: number;
}

/**
 * ดึงข้อมูล Call Matrix ทั้งหมด
 * @param date - วันที่ในรูปแบบ YYYY-MM-DD (optional)
 */
export async function fetchCallMatrix(date?: string): Promise<CallMatrixData> {
  try {
    const url = date
      ? `${PYTHON_API_URL}/api/call-matrix?date=${date}`
      : `${PYTHON_API_URL}/api/call-matrix`;

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
    console.error("Error fetching call matrix:", error);
    throw error;
  }
}

/**
 * ดึงสรุปการโทรของ Agent คนหนึ่ง
 * @param agentId - รหัส agent (เช่น '101', '102')
 * @param date - วันที่ในรูปแบบ YYYY-MM-DD (optional)
 */
export async function fetchAgentSummary(
  agentId: string,
  date?: string
): Promise<AgentSummary> {
  try {
    const url = date
      ? `${PYTHON_API_URL}/api/call-matrix/agent/${agentId}?date=${date}`
      : `${PYTHON_API_URL}/api/call-matrix/agent/${agentId}`;

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
    console.error(`Error fetching agent ${agentId} summary:`, error);
    throw error;
  }
}

/**
 * ดึงสรุปการโทรในช่วงเวลาหนึ่ง
 * @param timeSlot - ช่วงเวลา (เช่น '9-10', '10-11')
 * @param date - วันที่ในรูปแบบ YYYY-MM-DD (optional)
 */
export async function fetchTimeSlotSummary(
  timeSlot: string,
  date?: string
): Promise<TimeSlotSummary> {
  try {
    const url = date
      ? `${PYTHON_API_URL}/api/call-matrix/time-slot/${timeSlot}?date=${date}`
      : `${PYTHON_API_URL}/api/call-matrix/time-slot/${timeSlot}`;

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
    console.error(`Error fetching time slot ${timeSlot} summary:`, error);
    throw error;
  }
}

/**
 * ดึงยอดรวมการโทรแยกตาม Agent (totals_by_agent)
 * @param date - วันที่ในรูปแบบ YYYY-MM-DD (optional)
 */
export async function fetchTotalsByAgent(
  date?: string
): Promise<TotalsByAgentResponse> {
  try {
    const url = date
      ? `${PYTHON_API_URL}/api/call-matrix/totals-by-agent?date=${date}`
      : `${PYTHON_API_URL}/api/call-matrix/totals-by-agent`;

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
    console.error("Error fetching totals by agent:", error);
    throw error;
  }
}

/**
 * ดึงยอดรวมการโทรแยกตามช่วงเวลา (totals_by_slot)
 * @param date - วันที่ในรูปแบบ YYYY-MM-DD (optional)
 */
export async function fetchTotalsBySlot(
  date?: string
): Promise<TotalsBySlotResponse> {
  try {
    const url = date
      ? `${PYTHON_API_URL}/api/call-matrix/totals-by-slot?date=${date}`
      : `${PYTHON_API_URL}/api/call-matrix/totals-by-slot`;

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
    console.error("Error fetching totals by slot:", error);
    throw error;
  }
}

/**
 * บันทึกการโทร (เพิ่ม +1 ในช่วงเวลาปัจจุบันหรือที่กำหนด)
 * @param request - ข้อมูลการโทร
 */
export async function logCall(request: LogCallRequest): Promise<any> {
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/call-matrix/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging call:", error);
    throw error;
  }
}

/**
 * อัพเดทจำนวนการโทรด้วยตนเอง (set ค่าโดยตรง)
 * @param request - ข้อมูลที่ต้องการอัพเดท
 */
export async function updateCallCount(
  request: UpdateCallRequest
): Promise<any> {
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/call-matrix/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating call count:", error);
    throw error;
  }
}

/**
 * อัพเดทหลายช่องพร้อมกัน (batch update)
 * @param request - รายการข้อมูลที่ต้องการอัพเดท
 */
export async function batchUpdateCallCounts(
  request: BatchUpdateRequest
): Promise<any> {
  try {
    const response = await fetch(
      `${PYTHON_API_URL}/api/call-matrix/batch-update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error batch updating call counts:", error);
    throw error;
  }
}

/**
 * แปลงข้อมูลจาก Python API format เป็น format ที่ใช้ในหน้า dashboard
 */
export function transformCallMatrixData(data: CallMatrixData): {
  callMatrixYaleCounts: Record<string, Record<string, number>>;
  callMatrixYaleTotals: Record<string, number>;
} {
  const callMatrixYaleCounts: Record<string, Record<string, number>> = {};
  const callMatrixYaleTotals: Record<string, number> = {};

  // แปลง matrix_data เป็น format ที่ใช้ในหน้า dashboard
  // matrix_data: { "101": { "9-10": 5, "10-11": 8, ... }, "102": { ... }, ... }
  // ต้องแปลงเป็น: { "9": { "101": 5, "102": 6, ... }, "10": { "101": 8, ... }, ... }

  data.time_slots.forEach((slot) => {
    // slot = "9-10", "10-11", etc.
    const hourStart = slot.split("-")[0]; // "9", "10", etc.
    callMatrixYaleCounts[hourStart] = {};

    Object.entries(data.matrix_data).forEach(([agentId, calls]) => {
      const callCount = calls[slot] || 0;
      callMatrixYaleCounts[hourStart][agentId] = callCount;
    });
  });

  // คัดลอก totals_by_agent หรือคำนวณเองถ้าไม่มี
  if (data.totals_by_agent && Object.keys(data.totals_by_agent).length > 0) {
    Object.entries(data.totals_by_agent).forEach(([agentId, total]) => {
      callMatrixYaleTotals[agentId] = total;
    });
  } else {
    // คำนวณยอดรวมเองจาก matrix_data
    Object.entries(data.matrix_data).forEach(([agentId, calls]) => {
      const total = Object.values(calls).reduce((sum, count) => sum + count, 0);
      callMatrixYaleTotals[agentId] = total;
    });
  }

  return {
    callMatrixYaleCounts,
    callMatrixYaleTotals,
  };
}

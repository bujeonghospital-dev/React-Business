// Database API Integration for Future Revenue Data (surgery_date >= today)
import { SurgeryScheduleData } from "./googleSheets";

export interface RevenueFutureData {
  contact_staff?: string;
  surgery_date?: string;
  doctor?: string;
  customer_name?: string;
  phone?: string;
  proposed_amount?: number;
  appointment_time?: string;
}

/**
 * Fetch future revenue data from bjh_all_leads (surgery_date >= วันนี้)
 */
export async function fetchRevenueFutureFromDatabase(): Promise<
  RevenueFutureData[]
> {
  try {
    // Check if running on client side
    if (typeof window === "undefined") {
      console.error("fetchRevenueFutureFromDatabase called on server side");
      return [];
    }

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/revenue-future-db?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (errorData?.error) {
        throw new Error(errorData.error);
      }

      throw new Error(
        `ไม่สามารถโหลดข้อมูลได้: ${response.statusText}\n\n` +
          "กรุณาตรวจสอบ:\n" +
          "1. Database connection ทำงานปกติ\n" +
          "2. ตาราง bjh_all_leads มีอยู่ในฐานข้อมูล\n" +
          "3. Environment variables ถูกต้อง"
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "Database API returned unsuccessful response"
      );
    }

    console.log(
      `✅ Successfully fetched ${
        result.total || 0
      } future revenue records from Database`
    );

    return result.data || [];
  } catch (error: any) {
    console.error("Error fetching future revenue from Database:", error);
    throw error;
  }
}

// Parse date string from Database API
export function parseDatabaseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;

  const cleanStr = dateStr.trim();

  try {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const date = new Date(cleanStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try D/M/YYYY or DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
      const parts = cleanStr.split("/").map(Number);
      const [first, second, year] = parts;

      const day = first;
      const month = second;

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        if (
          date.getUTCFullYear() === year &&
          date.getUTCMonth() === month - 1 &&
          date.getUTCDate() === day
        ) {
          return date;
        }
      }

      return null;
    }

    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}

/**
 * Calculate daily revenue by person from bjh_all_leads (future surgeries)
 * ใช้ proposed_amount จาก surgery_date >= วันนี้เป็นต้นไป
 */
export function calculateDailyRevenueByPersonFuture(
  data: RevenueFutureData[],
  month: number,
  year: number
): Map<string, Map<number, number>> {
  const revenueMap = new Map<string, Map<number, number>>();

  let processedCount = 0;
  let matchedCount = 0;
  let totalRevenue = 0;

  data.forEach((item) => {
    // ใช้ surgery_date (วันที่ผ่าตัดที่กำหนดไว้)
    const dateStr = item.surgery_date || "";

    if (dateStr) {
      processedCount++;
      const date = parseDatabaseDate(dateStr);

      if (date) {
        if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
          matchedCount++;
          const day = date.getUTCDate();

          // ใช้ contact_staff
          const person = (item.contact_staff || "").trim() || "ไม่ระบุ";

          // ใช้ proposed_amount
          const amount = item.proposed_amount || 0;

          if (amount > 0) {
            if (!revenueMap.has(person)) {
              revenueMap.set(person, new Map<number, number>());
            }

            const personMap = revenueMap.get(person)!;
            const currentAmount = personMap.get(day) || 0;
            personMap.set(day, currentAmount + amount);
            totalRevenue += amount;
          }
        }
      }
    }
  });

  console.log(
    `💰 Calculate Future Revenue (bjh_all_leads >= today): Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
      month + 1
    }, total revenue: ${totalRevenue.toLocaleString()} บาท`
  );

  return revenueMap;
}

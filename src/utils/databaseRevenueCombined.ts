// Database API Integration for Combined Revenue Data
import { SurgeryScheduleData } from "./googleSheets";

export interface RevenueCombinedData {
  contact_staff?: string;
  surgery_date?: string;
  doctor?: string;
  customer_name?: string;
  phone?: string;
  proposed_amount?: number;
  appointment_time?: string;
}

/**
 * Fetch revenue data from n_saleIncentive + n_staff
 */
export async function fetchRevenueCombinedFromDatabase(): Promise<
  RevenueCombinedData[]
> {
  try {
    // Check if running on client side
    if (typeof window === "undefined") {
      console.error("fetchRevenueCombinedFromDatabase called on server side");
      return [];
    }

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/revenue-combined-db?t=${timestamp}`, {
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
          "2. ตาราง n_saleIncentive และ n_staff มีอยู่ในฐานข้อมูล\n" +
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
      } revenue records from Database (bjh_all_leads - CURRENT_DATE only)`
    );

    // Transform data to ensure proposed_amount is a number
    const transformedData = (result.data || []).map((item: any) => ({
      ...item,
      proposed_amount: item.proposed_amount
        ? parseFloat(item.proposed_amount.toString().replace(/,/g, ""))
        : 0,
    }));

    console.log("🔍 Transformed data sample:", {
      raw: result.data?.[0],
      transformed: transformedData[0],
    });

    return transformedData;
  } catch (error: any) {
    console.error("Error fetching revenue from Database:", error);
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
 * Calculate daily revenue by person using proposed_amount from bjh_all_leads
 * ใช้ contact_staff และ proposed_amount จาก bjh_all_leads โดยตรง
 * แสดงเฉพาะข้อมูลที่ surgery_date ตรงกับวันที่ในตาราง (ไม่ใช่เฉพาะวันนี้)
 */
export function calculateDailyRevenueByPersonCombined(
  data: RevenueCombinedData[],
  month: number,
  year: number
): Map<string, Map<number, number>> {
  const revenueMap = new Map<string, Map<number, number>>();

  let processedCount = 0;
  let matchedCount = 0;
  let totalRevenue = 0;
  let skippedNoDate = 0;
  let skippedInvalidDate = 0;
  let skippedWrongMonth = 0;
  let skippedNoAmount = 0;

  console.log(`🔍 Starting calculation for ${year}-${month + 1}:`, {
    totalDataRecords: data.length,
    targetMonth: month + 1,
    targetYear: year,
  });

  data.forEach((item, index) => {
    // ใช้ surgery_date (วันที่นัดผ่าตัด)
    const dateStr = item.surgery_date || "";

    if (!dateStr) {
      skippedNoDate++;
      if (index < 3) {
        console.log(`⚠️ Record ${index} has no surgery_date:`, item);
      }
      return;
    }

    processedCount++;
    const date = parseDatabaseDate(dateStr);

    if (!date) {
      skippedInvalidDate++;
      if (index < 3) {
        console.log(`⚠️ Record ${index} has invalid date format:`, {
          surgery_date: dateStr,
          item,
        });
      }
      return;
    }

    if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
      matchedCount++;
      const day = date.getUTCDate();

      // ใช้ contact_staff จาก bjh_all_leads
      const person = (item.contact_staff || "").trim() || "ไม่ระบุ";

      // ใช้ proposed_amount จาก bjh_all_leads (เก็บเฉพาะค่าที่อยู่ในวันนั้นๆ)
      // Ensure it's a number (should already be converted in fetch function)
      const amount =
        typeof item.proposed_amount === "number"
          ? item.proposed_amount
          : item.proposed_amount
          ? parseFloat(String(item.proposed_amount).replace(/,/g, ""))
          : 0;

      if (matchedCount <= 3) {
        console.log(`🔢 Amount parsing for record ${index}:`, {
          raw: item.proposed_amount,
          type: typeof item.proposed_amount,
          parsed: amount,
          person,
          day,
        });
      }

      if (amount > 0) {
        if (!revenueMap.has(person)) {
          revenueMap.set(person, new Map<number, number>());
        }

        const personMap = revenueMap.get(person)!;
        const currentAmount = personMap.get(day) || 0;
        personMap.set(day, currentAmount + amount);
        totalRevenue += amount;

        if (matchedCount <= 5) {
          console.log(`✅ Added revenue: ${person} on day ${day}: ${amount}`, {
            contact_staff: item.contact_staff,
            surgery_date: item.surgery_date,
            proposed_amount: item.proposed_amount,
            parsedDate: date.toISOString(),
          });
        }
      } else {
        skippedNoAmount++;
      }
    } else {
      skippedWrongMonth++;
      if (skippedWrongMonth <= 3) {
        console.log(`⏭️ Skipped (wrong month): ${dateStr}`, {
          parsedMonth: date.getUTCMonth() + 1,
          parsedYear: date.getUTCFullYear(),
          targetMonth: month + 1,
          targetYear: year,
        });
      }
    }
  });

  console.log(
    `💰 Calculate Revenue (proposed_amount): Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
      month + 1
    }, total revenue: ${totalRevenue.toLocaleString()} บาท`,
    {
      skippedNoDate,
      skippedInvalidDate,
      skippedWrongMonth,
      skippedNoAmount,
      finalMapSize: revenueMap.size,
      persons: Array.from(revenueMap.keys()),
    }
  );

  return revenueMap;
}

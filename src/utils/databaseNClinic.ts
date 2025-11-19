// Database API Integration for N_Clinic Revenue Data (sale_date <= today)
import { SurgeryScheduleData } from "./googleSheets";

export interface NClinicData {
  sale_code?: string;
  sale_date?: string;
  item_name?: string;
  proposed_amount?: number;
  contact_staff?: string;
  full_name?: string;
}

/**
 * Fetch n_clinic revenue data from n_saleIncentive + n_staff + bjh_all_leads (sale_date <= วันนี้)
 */
export async function fetchNClinicFromDatabase(): Promise<NClinicData[]> {
  try {
    // Check if running on client side
    if (typeof window === "undefined") {
      console.error("fetchNClinicFromDatabase called on server side");
      return [];
    }

    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/n-clinic-db?t=${timestamp}`, {
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
          "2. ตาราง n_saleIncentive, n_staff และ bjh_all_leads มีอยู่ในฐานข้อมูล\n" +
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
      } n_clinic records from Database (sale_date <= today)`
    );

    // Transform data to ensure proposed_amount is a number
    const transformedData = (result.data || []).map((item: any) => ({
      ...item,
      proposed_amount: item.proposed_amount
        ? parseFloat(item.proposed_amount.toString().replace(/,/g, ""))
        : 0,
    }));

    console.log("🔍 Transformed n_clinic data sample:", {
      raw: result.data?.[0],
      transformed: transformedData[0],
    });

    return transformedData;
  } catch (error: any) {
    console.error("Error fetching n_clinic from Database:", error);
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
 * Calculate daily revenue by person from n_clinic data (sale_date <= today)
 * ใช้ proposed_amount จาก bjh_all_leads ที่ match กับ n_saleIncentive
 */
export function calculateDailyRevenueByPersonNClinic(
  data: NClinicData[],
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

  console.log(`🔍 Starting n_clinic calculation for ${year}-${month + 1}:`, {
    totalDataRecords: data.length,
    targetMonth: month + 1,
    targetYear: year,
  });

  data.forEach((item, index) => {
    // ใช้ sale_date
    const dateStr = item.sale_date || "";

    if (!dateStr) {
      skippedNoDate++;
      if (index < 3) {
        console.log(`⚠️ Record ${index} has no sale_date:`, item);
      }
      return;
    }

    processedCount++;
    const date = parseDatabaseDate(dateStr);

    if (!date) {
      skippedInvalidDate++;
      if (index < 3) {
        console.log(`⚠️ Record ${index} has invalid date format:`, {
          sale_date: dateStr,
          item,
        });
      }
      return;
    }

    if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
      matchedCount++;
      const day = date.getUTCDate();

      // ใช้ contact_staff (nickname จาก n_staff)
      const person = (item.contact_staff || "").trim() || "ไม่ระบุ";

      // ใช้ proposed_amount จาก bjh_all_leads
      const amount =
        typeof item.proposed_amount === "number"
          ? item.proposed_amount
          : item.proposed_amount
          ? parseFloat(String(item.proposed_amount).replace(/,/g, ""))
          : 0;

      if (matchedCount <= 3) {
        console.log(`🔢 N_Clinic amount parsing for record ${index}:`, {
          raw: item.proposed_amount,
          type: typeof item.proposed_amount,
          parsed: amount,
          person,
          day,
          sale_date: item.sale_date,
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
          console.log(
            `✅ Added n_clinic revenue: ${person} on day ${day}: ${amount}`,
            {
              contact_staff: item.contact_staff,
              sale_date: item.sale_date,
              proposed_amount: item.proposed_amount,
              parsedDate: date.toISOString(),
            }
          );
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
    `💰 Calculate N_Clinic Revenue: Processed ${processedCount} records, matched ${matchedCount} for ${year}-${
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

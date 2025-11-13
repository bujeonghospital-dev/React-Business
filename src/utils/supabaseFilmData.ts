// Supabase Film Data Integration
// This file should only be used in Client Components
import { supabase } from "./supabase/client";
import {
  FilmData,
  SurgeryScheduleFromSupabase,
  convertFilmDataToSurgerySchedule,
} from "@/types/supabase";
import { SurgeryScheduleData, CONTACT_PERSON_MAPPING } from "./googleSheets";

// Fetch surgery schedule data from Supabase (film_data table)
// This function should only be called from Client Components
export async function fetchSurgeryScheduleFromSupabase(): Promise<
  SurgeryScheduleData[]
> {
  try {
    // Check if running on client side
    if (typeof window === "undefined") {
      console.error("fetchSurgeryScheduleFromSupabase called on server side");
      return [];
    }

    if (!supabase) {
      throw new Error(
        "Supabase client ไม่พร้อมใช้งาน กรุณาตรวจสอบ Environment Variables"
      );
    }

    // Query film_data table
    // Fetch all records first, then filter on client side for flexibility
    const { data, error } = await supabase.from("film_data").select("*");

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn(
        "⚠️ No surgery data found in film_data table. " +
          "Please check: " +
          "1. Table 'film_data' exists in Supabase " +
          "2. Data has been imported " +
          "3. Records have 'date_surgery_scheduled' or 'surgery_date' fields"
      );
      return [];
    }

    // Convert all FilmData rows to SurgeryScheduleData format (no filter)
    const surgeryScheduleData: SurgeryScheduleData[] = data.map(
      (filmData: FilmData) => {
        const converted = convertFilmDataToSurgerySchedule(filmData);
        return {
          หมอ: converted.หมอ ?? "",
          ผู้ติดต่อ: converted.ผู้ติดต่อ ?? "",
          ชื่อ: converted.ชื่อ ?? "",
          เบอร์โทร: converted.เบอร์โทร ?? "",
          วันที่ได้นัดผ่าตัด: converted.วันที่ได้นัดผ่าตัด ?? "",
          เวลาที่นัด: converted.เวลาที่นัด ?? "",
          ยอดนำเสนอ: converted.ยอดนำเสนอ ?? "",
          วันที่ผ่าตัด: converted.วันที่ผ่าตัด ?? "",
          // เพิ่ม fields จาก Supabase เพื่อใช้ในการกรอง
          date_consult_scheduled: converted.date_consult_scheduled ?? "",
          contact_person: converted.contact_person ?? "",
          date_surgery_scheduled: converted.date_surgery_scheduled ?? "",
          surgery_date: converted.surgery_date ?? "",
        };
      }
    );

    console.log(
      `Successfully fetched ${surgeryScheduleData.length} surgery records from Supabase (from ${data.length} total records)`
    );
    return surgeryScheduleData;
  } catch (error: any) {
    console.error("Error fetching from Supabase:", error);
    throw error;
  }
}

// Parse date string from Supabase (supports ISO format and Thai format)
export function parseSupabaseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;

  const cleanStr = dateStr.trim();

  try {
    // ISO format (YYYY-MM-DD) - Supabase default
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const date = new Date(cleanStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // D/M/YYYY or DD/MM/YYYY format (Thai format)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
      const parts = cleanStr.split("/").map(Number);
      const [day, month, year] = parts;

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
    }

    // Fallback to built-in parser
    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

// Count surgeries by date and contact person (for P table - วันที่ได้นัด consult)
export function countSupabaseSurgeriesByDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();

  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    countMap.set(person, new Map<number, SurgeryScheduleData[]>());
  });

  data.forEach((item) => {
    // ใช้ date_consult_scheduled สำหรับตาราง P (วันที่ได้นัด consult)
    const consultDate = item.date_consult_scheduled;

    if (consultDate) {
      const date = parseSupabaseDate(consultDate);

      if (date) {
        if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
          const day = date.getUTCDate();

          // ใช้ contact_person จากฐานข้อมูล
          const person =
            item.contact_person && item.contact_person.trim() !== ""
              ? item.contact_person.trim()
              : "ไม่ระบุ";

          if (countMap.has(person)) {
            const personMap = countMap.get(person)!;
            if (!personMap.has(day)) {
              personMap.set(day, []);
            }
            personMap.get(day)!.push(item);
          }
        }
      }
    }
  });

  return countMap;
}

// Count surgeries by actual surgery date (for L table - วันที่ผ่าตัด)
export function countSupabaseSurgeriesByActualDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();

  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    countMap.set(person, new Map<number, SurgeryScheduleData[]>());
  });

  data.forEach((item) => {
    // ใช้ surgery_date สำหรับตาราง L (วันที่ผ่าตัดจริง)
    const surgeryDate = item.surgery_date;

    if (surgeryDate) {
      const date = parseSupabaseDate(surgeryDate);

      if (date) {
        if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
          const day = date.getUTCDate();

          // ใช้ contact_person จากฐานข้อมูล
          const person =
            item.contact_person && item.contact_person.trim() !== ""
              ? item.contact_person.trim()
              : "ไม่ระบุ";

          if (countMap.has(person)) {
            const personMap = countMap.get(person)!;
            if (!personMap.has(day)) {
              personMap.set(day, []);
            }
            personMap.get(day)!.push(item);
          }
        }
      }
    }
  });

  return countMap;
}

// Get statistics from Supabase
export async function getSurgeryStatistics() {
  try {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("film_data")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error getting count:", countError);
      return { totalCount: 0, surgeryCount: 0, consultCount: 0 };
    }

    // Get surgery scheduled count
    const { count: surgeryCount, error: surgeryError } = await supabase
      .from("film_data")
      .select("*", { count: "exact", head: true })
      .not("date_surgery_scheduled", "is", null);

    // Get consult scheduled count
    const { count: consultCount, error: consultError } = await supabase
      .from("film_data")
      .select("*", { count: "exact", head: true })
      .not("date_consult_scheduled", "is", null);

    return {
      totalCount: totalCount || 0,
      surgeryCount: surgeryCount || 0,
      consultCount: consultCount || 0,
    };
  } catch (error) {
    console.error("Error getting statistics:", error);
    return { totalCount: 0, surgeryCount: 0, consultCount: 0 };
  }
}

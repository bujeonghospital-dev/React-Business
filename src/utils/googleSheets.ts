// Google Sheets API Integration
export interface SurgeryScheduleData {
  หมอ: string;
  ผู้ติดต่อ: string;
  ชื่อ: string;
  เบอร์โทร: string;
  วันที่ได้นัดผ่าตัด: string;
  เวลาที่นัด: string;
  ยอดนำเสนอ: string;
  วันที่ผ่าตัด?: string; // Optional field for L table
  date_consult_scheduled?: string; // วันที่ได้นัด consult (Supabase)
  contact_person?: string; // ผู้ติดต่อ (Supabase)
  date_surgery_scheduled?: string; // วันที่ได้นัดผ่าตัด (Supabase)
  surgery_date?: string; // วันที่ผ่าตัด (Supabase)
}
// Configure your Google Sheets API key and Sheet ID
const GOOGLE_SHEETS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || "";
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || "";
const SHEET_NAME = "Film data";
// Mapping between row IDs and contact person names
export const CONTACT_PERSON_MAPPING: { [key: string]: string } = {
  "101-สา": "สา",
  "102-พิชชา": "พิชชา",
  "103-ตั้งโอ๋": "ตั้งโอ๋",
  "104-Test": "Test",
  "105-จีน": "จีน",
  "106-มุก": "มุก",
  "107-เจ": "เจ",
  "108-ว่าน": "ว่าน",
  "109-ไม่ระบุ": "ไม่ระบุ", // For empty contact person
  "110-ส่วนกลาง": "ส่วนกลาง",
};
// Fetch data from Google Sheets via API Route (using Service Account)
export async function fetchSurgeryScheduleData(): Promise<
  SurgeryScheduleData[]
> {
  try {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/surgery-schedule?t=${timestamp}`, {
      cache: "no-store", // Disable cache
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
          "1. ไฟล์ .env.local มี Service Account credentials ครบถ้วน\n" +
          "2. Service Account มีสิทธิ์เข้าถึง Google Sheet\n" +
          "3. Sheet name เป็น 'Film data'"
      );
    }
    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    throw error;
  }
}
// Parse date string from Google Sheets (supports various formats)
export function parseSheetDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  // Clean up the string
  const cleanStr = dateStr.trim();
  try {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const date = new Date(cleanStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Try D/M/YYYY or DD/MM/YYYY format (Thai format - assume DD/MM/YYYY)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
      const parts = cleanStr.split("/").map(Number);
      const [first, second, year] = parts;
      // Assume DD/MM/YYYY format (Thai standard)
      // first = day, second = month
      const day = first;
      const month = second;
      // Validate the date
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // Use UTC to avoid timezone issues that can shift the date by +1 day
        const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        // Double check that the date is valid (e.g., not Feb 31)
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
    // Try parsing with built-in Date parser as fallback
    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  } catch (error) {
    return null;
  }
}
// Count surgeries by date and contact person (for P table - วันที่ได้นัดผ่าตัด)
export function countSurgeriesByDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();
  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    countMap.set(person, new Map<number, SurgeryScheduleData[]>());
  });
  let processedCount = 0;
  let matchedCount = 0;
  data.forEach((item) => {
    if (item.วันที่ได้นัดผ่าตัด) {
      processedCount++;
      const date = parseSheetDate(item.วันที่ได้นัดผ่าตัด);
      if (date) {
        if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
          matchedCount++;
          const day = date.getUTCDate();
          // ถ้าไม่มีผู้ติดต่อ หรือว่างเปล่า ให้ใช้ "ไม่ระบุ"
          const person =
            item.ผู้ติดต่อ && item.ผู้ติดต่อ.trim() !== ""
              ? item.ผู้ติดต่อ.trim()
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
export function countSurgeriesByActualDateAndPerson(
  data: SurgeryScheduleData[],
  month: number,
  year: number
): Map<string, Map<number, SurgeryScheduleData[]>> {
  const countMap = new Map<string, Map<number, SurgeryScheduleData[]>>();
  // Initialize map for each contact person
  Object.values(CONTACT_PERSON_MAPPING).forEach((person) => {
    countMap.set(person, new Map<number, SurgeryScheduleData[]>());
  });
  let processedCount = 0;
  let matchedCount = 0;
  data.forEach((item) => {
    if (item.วันที่ผ่าตัด) {
      processedCount++;
      const date = parseSheetDate(item.วันที่ผ่าตัด);
      if (date) {
        if (date.getUTCMonth() === month && date.getUTCFullYear() === year) {
          matchedCount++;
          const day = date.getUTCDate();
          // ถ้าไม่มีผู้ติดต่อ หรือว่างเปล่า ให้ใช้ "ไม่ระบุ"
          const person =
            item.ผู้ติดต่อ && item.ผู้ติดต่อ.trim() !== ""
              ? item.ผู้ติดต่อ.trim()
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
// Get row ID from contact person name
export function getRowIdFromContactPerson(contactPerson: string): string {
  for (const [rowId, person] of Object.entries(CONTACT_PERSON_MAPPING)) {
    if (person === contactPerson) {
      return rowId;
    }
  }
  return contactPerson;
}

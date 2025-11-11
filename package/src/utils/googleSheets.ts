// Google Sheets API Integration
export interface SurgeryScheduleData {
  หมอ: string;
  ผู้ติดต่อ: string;
  ชื่อ: string;
  เบอร์โทร: string;
  วันที่ได้นัดผ่าตัด: string;
  เวลาที่นัด: string;
  ยอดนำเสนอ: string;
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
};

// Fetch data from Google Sheets via API Route (using Service Account)
export async function fetchSurgeryScheduleData(): Promise<
  SurgeryScheduleData[]
> {
  try {
    const response = await fetch("/api/surgery-schedule");

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
    console.error("Error fetching surgery schedule data:", error);
    throw error;
  }
}

// Parse date string from Google Sheets (supports various formats)
export function parseSheetDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }

    // Try DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    }

    // Try Thai date format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch {
    return null;
  }
}

// Count surgeries by date and contact person
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

  data.forEach((item) => {
    const date = parseSheetDate(item.วันที่ได้นัดผ่าตัด);
    if (!date) return;

    // Check if date is in the selected month/year
    if (date.getMonth() === month && date.getFullYear() === year) {
      const day = date.getDate();
      const person = item.ผู้ติดต่อ;

      if (countMap.has(person)) {
        const personMap = countMap.get(person)!;
        if (!personMap.has(day)) {
          personMap.set(day, []);
        }
        personMap.get(day)!.push(item);
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

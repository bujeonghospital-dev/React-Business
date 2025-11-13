// Test Date Parsing from Google Sheets
// วิธีทดสอบ: node test-date-parsing.js

console.log("🧪 ทดสอบการจับวันที่จาก Google Sheets\n");
console.log("=".repeat(60));

// ฟังก์ชันจับวันที่เหมือนในระบบ
function parseSheetDate(dateStr) {
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

    // Try D/M/YYYY or DD/MM/YYYY format (Thai format)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
      const parts = cleanStr.split("/").map(Number);
      const [first, second, year] = parts;

      // Assume DD/MM/YYYY format (Thai standard)
      const day = first;
      const month = second;

      // Validate the date
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // Use UTC to avoid timezone issues
        const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        // Double check that the date is valid
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

// รูปแบบวันที่ที่ Google Sheets อาจส่งมา
const testDates = [
  // รูปแบบไทย DD/MM/YYYY
  "11/11/2025",
  "1/11/2025",
  "31/12/2025",
  "01/01/2025",

  // รูปแบบ ISO YYYY-MM-DD
  "2025-11-11",
  "2025-01-15",

  // รูปแบบ American MM/DD/YYYY (อาจจะมี)
  "11/11/2025",

  // รูปแบบที่ Google Sheets อาจ serialize
  "44911", // Serial date
  "45241", // Serial date for 2023-11-11

  // Text format
  "November 11, 2025",
  "11 Nov 2025",

  // Invalid formats
  "invalid",
  "",
  null,
  undefined,
];

console.log("\n📋 ทดสอบรูปแบบวันที่ต่างๆ:\n");

testDates.forEach((testDate) => {
  const parsed = parseSheetDate(testDate);

  console.log(`Input: "${testDate}"`);

  if (parsed) {
    console.log(`✅ ผลลัพธ์: ${parsed.toISOString()}`);
    console.log(
      `   วันที่: ${parsed.getUTCDate()}/${
        parsed.getUTCMonth() + 1
      }/${parsed.getUTCFullYear()}`
    );
  } else {
    console.log(`❌ ไม่สามารถจับวันที่ได้`);
  }
  console.log("");
});

console.log("=".repeat(60));
console.log("\n📊 สรุปรูปแบบที่รองรับ:");
console.log("1. ✅ DD/MM/YYYY (รูปแบบไทย) - เช่น 11/11/2025");
console.log("2. ✅ D/M/YYYY (รูปแบบไทยแบบสั้น) - เช่น 1/1/2025");
console.log("3. ✅ YYYY-MM-DD (ISO format) - เช่น 2025-11-11");
console.log("4. ❓ Serial date (44911) - ต้องแปลงก่อน");
console.log("5. ❓ Text dates - ขึ้นกับ browser");

console.log("\n💡 คำแนะนำสำหรับ Google Sheets:");
console.log("- ใช้รูปแบบ DD/MM/YYYY หรือ YYYY-MM-DD");
console.log("- ตั้ง Format ของเซลล์เป็น 'Plain text' หรือ 'Date'");
console.log("- หลีกเลี่ยงการใช้ Serial date format");
console.log("- ถ้าใช้ฟอร์มูลา ให้ใช้ TEXT() เพื่อแปลงเป็น string");
console.log('  ตัวอย่าง: =TEXT(A1, "DD/MM/YYYY")');

console.log("\n" + "=".repeat(60));

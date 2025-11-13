/**
 * Google Apps Script สำหรับส่งข้อมูล Surgery Schedule ไปยัง API
 *
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheets ของคุณ
 * 2. ไปที่ Extensions > Apps Script
 * 3. คัดลอกโค้ดนี้ทั้งหมดลงใน Code.gs
 * 4. แก้ไข API_ENDPOINT และ WEBHOOK_SECRET ให้ตรงกับของคุณ
 * 5. บันทึกและรันฟังก์ชัน sendAllDataToAPI() เพื่อทดสอบ
 *
 * ฟีเจอร์:
 * - ส่งข้อมูลทั้งหมดหรือเฉพาะแถวที่เพิ่ม/แก้ไข
 * - รองรับการส่งข้อมูลแบบ batch (หลายแถวพร้อมกัน)
 * - แปลงวันที่จาก Google Sheets เป็น ISO format (YYYY-MM-DD)
 * - Log การส่งข้อมูลใน Logger
 */

// ===================================
// การตั้งค่า - กรุณาแก้ไขให้ตรงกับของคุณ
// ===================================

// URL ของ API endpoint (Production หรือ Local)
const API_ENDPOINT =
  "https://desgy-project.vercel.app/api/webhooks/surgery-schedule";
// const API_ENDPOINT = "http://localhost:3000/api/webhooks/surgery-schedule"; // สำหรับ Local testing

// Secret key สำหรับ authentication (ต้องตรงกับ SURGERY_SCHEDULE_WEBHOOK_SECRET ใน .env.local)
const WEBHOOK_SECRET = "webhook-secret-2025-surgery-schedule-api";

// ชื่อ Sheet ที่เก็บข้อมูล
const DATA_SHEET_NAME = "Film data"; // เปลี่ยนเป็นชื่อ sheet ของคุณ

// Column mapping (ปรับตาม Google Sheets ของคุณ)
const COLUMN_MAPPING = {
  doctor: 1, // Column A
  contact_person: 2, // Column B (101-สา, 102-พัชชา, ฯลฯ)
  customer_name: 3, // Column C
  phone_number: 4, // Column D
  date_consult_scheduled: 5, // Column E
  date_surgery_scheduled: 6, // Column F
  surgery_date: 7, // Column G
  appointment_time: 8, // Column H
  proposed_amount: 9, // Column I
  campaign: 10, // Column J
  campaign_link: 11, // Column K
  medical_fee: 12, // Column L
  hospital_fee: 13, // Column M
  anesthesia_fee: 14, // Column N
  item_fee: 15, // Column O
  other_expenses: 16, // Column P
  consulting_specialist: 17, // Column Q
  remarks: 18, // Column R
  id: 19, // Column S (Supabase ID สำหรับ update)
};

// แถวที่เริ่มข้อมูล (skip header)
const DATA_START_ROW = 2;

// ===================================
// Helper Functions
// ===================================

/**
 * แปลงวันที่จาก Google Sheets เป็น ISO format (YYYY-MM-DD)
 */
function formatDateToISO(dateValue) {
  if (!dateValue) return null;

  try {
    // ถ้าเป็น Date object อยู่แล้ว
    if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // ถ้าเป็น string
    const dateStr = String(dateValue).trim();

    // ถ้าเป็น ISO format อยู่แล้ว
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // แปลงจาก DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split("/");
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }

    return null;
  } catch (error) {
    Logger.log(`Error formatting date: ${error.message}`);
    return null;
  }
}

/**
 * แปลงแถวข้อมูลเป็น object
 */
function rowToObject(row) {
  const obj = {};

  for (const [key, colIndex] of Object.entries(COLUMN_MAPPING)) {
    const value = row[colIndex - 1]; // -1 because array is 0-indexed

    if (value !== undefined && value !== null && value !== "") {
      // แปลงวันที่เป็น ISO format
      if (key.includes("date") && !key.includes("updated")) {
        obj[key] = formatDateToISO(value);
      } else {
        obj[key] = String(value).trim();
      }
    }
  }

  return obj;
}

/**
 * ส่งข้อมูลไปยัง API
 */
function sendToAPI(data) {
  try {
    const payload = JSON.stringify(data);

    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      payload: payload,
      muteHttpExceptions: true,
    };

    Logger.log("Sending to API: " + API_ENDPOINT);
    Logger.log("Payload: " + payload);

    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);
    Logger.log("Response: " + responseText);

    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      Logger.log(
        `✅ Success: ${result.processed} records processed, ${result.failed} failed`
      );
      return { success: true, result: result };
    } else {
      Logger.log(`❌ Error: HTTP ${responseCode}`);
      return { success: false, error: responseText };
    }
  } catch (error) {
    Logger.log(`❌ Exception: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ===================================
// Main Functions
// ===================================

/**
 * ส่งข้อมูลทั้งหมดไปยัง API (ใช้สำหรับ initial sync หรือ full refresh)
 */
function sendAllDataToAPI() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET_NAME);

  if (!sheet) {
    Logger.log(`❌ Sheet "${DATA_SHEET_NAME}" not found`);
    return;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < DATA_START_ROW) {
    Logger.log("⚠️ No data to send");
    return;
  }

  // อ่านข้อมูลทั้งหมด
  const dataRange = sheet.getRange(
    DATA_START_ROW,
    1,
    lastRow - DATA_START_ROW + 1,
    sheet.getLastColumn()
  );
  const data = dataRange.getValues();

  Logger.log(`📊 Found ${data.length} rows of data`);

  // แปลงเป็น array of objects
  const records = data
    .map((row) => rowToObject(row))
    .filter((obj) => Object.keys(obj).length > 0); // กรองแถวว่าง

  Logger.log(`✅ Prepared ${records.length} valid records`);

  if (records.length === 0) {
    Logger.log("⚠️ No valid records to send");
    return;
  }

  // ส่งข้อมูลแบบ batch (ครั้งละ 100 records)
  const batchSize = 100;
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    Logger.log(
      `📤 Sending batch ${Math.floor(i / batchSize) + 1} (${
        batch.length
      } records)`
    );

    const result = sendToAPI(batch);

    if (result.success) {
      totalSent += result.result.processed;
      totalFailed += result.result.failed;
    } else {
      totalFailed += batch.length;
    }

    // Delay เล็กน้อยเพื่อไม่ให้ API rate limit
    Utilities.sleep(1000);
  }

  Logger.log(`\n📊 Summary:`);
  Logger.log(`   Total: ${records.length}`);
  Logger.log(`   Sent: ${totalSent}`);
  Logger.log(`   Failed: ${totalFailed}`);
}

/**
 * ส่งข้อมูลแถวเดียว (ใช้กับ onEdit trigger)
 */
function sendSingleRowToAPI(rowIndex) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET_NAME);

  if (!sheet) {
    Logger.log(`❌ Sheet "${DATA_SHEET_NAME}" not found`);
    return;
  }

  if (rowIndex < DATA_START_ROW) {
    Logger.log("⚠️ Header row, skipping");
    return;
  }

  const row = sheet
    .getRange(rowIndex, 1, 1, sheet.getLastColumn())
    .getValues()[0];
  const record = rowToObject(row);

  if (Object.keys(record).length === 0) {
    Logger.log("⚠️ Empty row, skipping");
    return;
  }

  Logger.log(`📤 Sending row ${rowIndex}`);
  const result = sendToAPI(record);

  if (result.success) {
    Logger.log(`✅ Row ${rowIndex} sent successfully`);
  } else {
    Logger.log(`❌ Failed to send row ${rowIndex}`);
  }
}

/**
 * Trigger: เมื่อมีการแก้ไขข้อมูลใน Sheet
 * ต้องติดตั้ง trigger ด้วยตนเอง:
 * 1. ไปที่ Triggers (นาฬิกาด้านซ้าย)
 * 2. Add Trigger
 * 3. Choose function: onSheetEdit
 * 4. Event source: From spreadsheet
 * 5. Event type: On edit
 */
function onSheetEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();

    // ตรวจสอบว่าเป็น sheet ที่ต้องการหรือไม่
    if (sheet.getName() !== DATA_SHEET_NAME) {
      return;
    }

    const row = e.range.getRow();

    Logger.log(`📝 Edit detected at row ${row}`);

    // ส่งข้อมูลแถวที่ถูกแก้ไข
    sendSingleRowToAPI(row);
  } catch (error) {
    Logger.log(`❌ Error in onSheetEdit: ${error.message}`);
  }
}

/**
 * ทดสอบการเชื่อมต่อ API
 */
function testConnection() {
  try {
    const testData = {
      doctor: "ทดสอบ",
      contact_person: "101-สา",
      customer_name: "ทดสอบระบบ",
      phone_number: "0812345678",
      date_consult_scheduled: "2025-11-15",
      proposed_amount: "1000",
    };

    Logger.log("🧪 Testing API connection...");
    const result = sendToAPI(testData);

    if (result.success) {
      Logger.log("✅ API connection successful!");
    } else {
      Logger.log("❌ API connection failed!");
    }
  } catch (error) {
    Logger.log(`❌ Test failed: ${error.message}`);
  }
}

/**
 * สร้างเมนูใน Google Sheets
 * จะถูกเรียกอัตโนมัติเมื่อเปิด Spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🔄 Sync to Database")
    .addItem("📤 Send All Data", "sendAllDataToAPI")
    .addItem("🧪 Test Connection", "testConnection")
    .addSeparator()
    .addItem("📚 View Logs", "showLogs")
    .addToUi();
}

/**
 * แสดง logs
 */
function showLogs() {
  const logs = Logger.getLog();
  const ui = SpreadsheetApp.getUi();
  ui.alert("Logs", logs || "No logs available", ui.ButtonSet.OK);
}

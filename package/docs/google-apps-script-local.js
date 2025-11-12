/**
 * Google Apps Script สำหรับส่งข้อมูล Film data Sheet ไปยัง Supabase
 * ใช้สำหรับ LOCAL TESTING (localhost:3000)
 *
 * วิธีการใช้งาน:
 * 1. เปิด Google Sheets "Film data"
 * 2. Extensions > Apps Script
 * 3. คัดลอกโค้ดนี้ลงใน Code.gs
 * 4. ตรวจสอบว่า ngrok หรือ cloudflare tunnel กำลังรัน
 * 5. อัพเดท API_ENDPOINT ให้เป็น public URL
 * 6. รันฟังก์ชัน sendAllDataToAPI() เพื่อส่งข้อมูลทั้งหมด
 */

// ===================================
// การตั้งค่า - สำหรับ LOCAL TESTING
// ===================================

// สำหรับ Local Testing ต้องใช้ ngrok หรือ cloudflare tunnel
// ติดตั้ง ngrok: https://ngrok.com/download
// รัน: ngrok http 3000
// แล้วคัดลอก URL มาใส่ที่นี่
const API_ENDPOINT =
  "https://4af4358164c7.ngrok-free.app/api/webhooks/surgery-schedule";
// ตัวอย่าง: "https://abc123.ngrok.io/api/webhooks/surgery-schedule"

const WEBHOOK_SECRET = "webhook-secret-2025-surgery-schedule-api";
const DATA_SHEET_NAME = "Film data";

// Column mapping สำหรับ Film data sheet
const COLUMN_MAPPING = {
  doctor: 1, // Column A
  contact_person: 2, // Column B
  customer_name: 3, // Column C
  phone_number: 4, // Column D
  date_consult_scheduled: 5, // Column E
  date_surgery_scheduled: 6, // Column F
  surgery_date: 7, // Column G
  appointment_time: 8, // Column H
  proposed_amount: 9, // Column I
};

const DATA_START_ROW = 2; // แถวที่เริ่มข้อมูล (ข้าม header)

// ===================================
// Helper Functions
// ===================================

function formatDateToISO(dateValue) {
  if (!dateValue) return null;

  try {
    if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    const dateStr = String(dateValue).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

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

function rowToObject(row) {
  const obj = {};

  for (const [key, colIndex] of Object.entries(COLUMN_MAPPING)) {
    const value = row[colIndex - 1];

    if (value !== undefined && value !== null && value !== "") {
      if (key.includes("date") && !key.includes("updated")) {
        obj[key] = formatDateToISO(value);
      } else {
        obj[key] = String(value).trim();
      }
    }
  }

  return obj;
}

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

    Logger.log("📤 Sending to API: " + API_ENDPOINT);

    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log("Response Code: " + responseCode);

    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      Logger.log(
        `✅ Success: ${result.processed} records processed, ${result.failed} failed`
      );
      return { success: true, result: result };
    } else {
      Logger.log(`❌ Error: HTTP ${responseCode}`);
      Logger.log(responseText);
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
 * ส่งข้อมูลทั้งหมดไปยัง API
 */
function sendAllDataToAPI() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET_NAME);

  if (!sheet) {
    Logger.log(`❌ Sheet "${DATA_SHEET_NAME}" not found`);
    SpreadsheetApp.getUi().alert(`ไม่พบ Sheet "${DATA_SHEET_NAME}"`);
    return;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < DATA_START_ROW) {
    Logger.log("⚠️ No data to send");
    SpreadsheetApp.getUi().alert("ไม่มีข้อมูลให้ส่ง");
    return;
  }

  const dataRange = sheet.getRange(
    DATA_START_ROW,
    1,
    lastRow - DATA_START_ROW + 1,
    sheet.getLastColumn()
  );
  const data = dataRange.getValues();

  Logger.log(`📊 Found ${data.length} rows of data`);

  const records = data
    .map((row) => rowToObject(row))
    .filter((obj) => Object.keys(obj).length > 0 && obj.customer_name);

  Logger.log(`✅ Prepared ${records.length} valid records`);

  if (records.length === 0) {
    Logger.log("⚠️ No valid records to send");
    SpreadsheetApp.getUi().alert("ไม่มีข้อมูลที่ถูกต้องให้ส่ง");
    return;
  }

  SpreadsheetApp.getUi().alert(
    `กำลังส่งข้อมูล ${records.length} รายการ...\n\nกรุณารอสักครู่`
  );

  const batchSize = 50;
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

    Utilities.sleep(1000);
  }

  Logger.log(`\n📊 Summary:`);
  Logger.log(`   Total: ${records.length}`);
  Logger.log(`   Sent: ${totalSent}`);
  Logger.log(`   Failed: ${totalFailed}`);

  SpreadsheetApp.getUi().alert(
    `เสร็จสิ้น!\n\n` +
      `ส่งข้อมูลสำเร็จ: ${totalSent} รายการ\n` +
      `ล้มเหลว: ${totalFailed} รายการ`
  );
}

/**
 * ส่งข้อมูลแถวเดียว
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

  if (Object.keys(record).length === 0 || !record.customer_name) {
    Logger.log("⚠️ Empty or invalid row, skipping");
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
 * Trigger: เมื่อมีการแก้ไขข้อมูล
 */
function onSheetEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();

    if (sheet.getName() !== DATA_SHEET_NAME) {
      return;
    }

    const row = e.range.getRow();
    Logger.log(`📝 Edit detected at row ${row}`);

    sendSingleRowToAPI(row);
  } catch (error) {
    Logger.log(`❌ Error in onSheetEdit: ${error.message}`);
  }
}

/**
 * ทดสอบการเชื่อมต่อ
 */
function testConnection() {
  try {
    const testData = {
      doctor: "ทดสอบ",
      contact_person: "สา",
      customer_name: "ทดสอบระบบ Auto Sync",
      phone_number: "0812345678",
      date_consult_scheduled: "2025-11-15",
      proposed_amount: "1000",
    };

    Logger.log("🧪 Testing API connection...");
    const result = sendToAPI(testData);

    if (result.success) {
      Logger.log("✅ API connection successful!");
      SpreadsheetApp.getUi().alert("✅ เชื่อมต่อ API สำเร็จ!");
    } else {
      Logger.log("❌ API connection failed!");
      SpreadsheetApp.getUi().alert(
        "❌ เชื่อมต่อ API ล้มเหลว\n\n" + result.error
      );
    }
  } catch (error) {
    Logger.log(`❌ Test failed: ${error.message}`);
    SpreadsheetApp.getUi().alert("❌ ทดสอบล้มเหลว\n\n" + error.message);
  }
}

/**
 * สร้างเมนูใน Google Sheets
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

#!/usr/bin/env node

/**
 * Pre-deployment Environment Variables Checker
 *
 * ใช้ตรวจสอบว่า environment variables ถูกตั้งค่าครบถ้วนก่อน deploy
 *
 * Usage:
 *   node scripts/check-env-local.js
 */

const fs = require("fs");
const path = require("path");

// สี ANSI สำหรับ terminal
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  log("\n🔍 กำลังตรวจสอบ Environment Variables...", "cyan");
  log("━".repeat(60), "cyan");

  // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
  if (!fs.existsSync(envPath)) {
    log("\n❌ ไม่พบไฟล์ .env.local", "red");
    log("\n💡 วิธีแก้:", "yellow");
    log("   1. สร้างไฟล์ .env.local จาก template:", "yellow");
    log("      cp .env.local.example .env.local", "green");
    log("   2. แก้ไขค่าในไฟล์ .env.local ให้ถูกต้อง", "yellow");
    log("\n📚 อ่านเพิ่มเติม: .env.local.example\n", "yellow");
    process.exit(1);
  }

  // อ่านไฟล์ .env.local
  const envContent = fs.readFileSync(envPath, "utf-8");
  const envLines = envContent.split("\n");

  // Parse environment variables
  const envVars = {};
  envLines.forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      if (key && value) {
        envVars[key] = value;
      }
    }
  });

  // Required variables
  const requiredVars = ["FACEBOOK_ACCESS_TOKEN", "FACEBOOK_AD_ACCOUNT_ID"];

  // Optional variables
  const optionalVars = [
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_CUSTOMER_ID",
    "GOOGLE_SA_CLIENT_EMAIL",
    "GOOGLE_SA_PRIVATE_KEY",
    "GOOGLE_SHEET_ID",
  ];

  // ตรวจสอบ required variables
  log("\n✅ Required Variables:", "green");
  let hasAllRequired = true;
  let requiredCount = 0;

  requiredVars.forEach((varName) => {
    const value = envVars[varName];
    const hasValue =
      value &&
      value.length > 0 &&
      !value.includes("your_") &&
      !value.includes("your-");

    if (hasValue) {
      const preview = value.substring(0, 15) + "...";
      log(`   ✓ ${varName}: ${preview} (${value.length} chars)`, "green");
      requiredCount++;
    } else {
      log(`   ✗ ${varName}: ❌ ไม่พบหรือยังไม่ได้ตั้งค่า`, "red");
      hasAllRequired = false;
    }
  });

  // ตรวจสอบ optional variables
  log("\n⚙️  Optional Variables:", "blue");
  let optionalCount = 0;

  optionalVars.forEach((varName) => {
    const value = envVars[varName];
    const hasValue =
      value &&
      value.length > 0 &&
      !value.includes("your_") &&
      !value.includes("your-");

    if (hasValue) {
      const preview = value.substring(0, 15) + "...";
      log(`   ✓ ${varName}: ${preview}`, "blue");
      optionalCount++;
    } else {
      log(`   - ${varName}: ไม่ได้ตั้งค่า`, "yellow");
    }
  });

  // สรุปผล
  log("\n━".repeat(60), "cyan");
  log("\n📊 สรุป:", "cyan");
  log(
    `   Required: ${requiredCount}/${requiredVars.length}`,
    requiredCount === requiredVars.length ? "green" : "red"
  );
  log(`   Optional: ${optionalCount}/${optionalVars.length}`, "blue");

  if (hasAllRequired) {
    log("\n✅ พร้อม Deploy!", "green");
    log("   Environment variables ถูกตั้งค่าครบถ้วนแล้ว", "green");

    if (optionalCount < optionalVars.length) {
      log(
        `\n⚠️  คำเตือน: Optional variables ขาด ${
          optionalVars.length - optionalCount
        } ตัว`,
        "yellow"
      );
      log("   (ไม่จำเป็นสำหรับ Facebook Ads Manager)", "yellow");
    }

    log("\n🚀 ขั้นตอนถัดไป:", "cyan");
    log("   1. ตั้งค่า Environment Variables บน Vercel:", "white");
    log("      • FACEBOOK_ACCESS_TOKEN", "white");
    log("      • FACEBOOK_AD_ACCOUNT_ID", "white");
    log("   2. Deploy:", "white");
    log("      vercel --prod", "green");
    log("\n📚 อ่านเพิ่มเติม: QUICK_START_PRODUCTION.md\n", "cyan");

    process.exit(0);
  } else {
    log("\n❌ ยังไม่พร้อม Deploy!", "red");
    log("   กรุณาตั้งค่า Required Environment Variables ให้ครบถ้วน", "red");

    log("\n💡 วิธีแก้:", "yellow");
    log("   1. เปิดไฟล์ .env.local", "yellow");
    log("   2. แก้ไขค่า Required Variables ที่ยังไม่ได้ตั้ง", "yellow");
    log("   3. บันทึกไฟล์", "yellow");
    log("   4. รันคำสั่งนี้อีกครั้ง:", "yellow");
    log("      node scripts/check-env-local.js", "green");

    log("\n📖 วิธีหา Facebook Credentials:", "cyan");
    log(
      "   • Access Token: https://developers.facebook.com/tools/explorer/",
      "blue"
    );
    log(
      "   • Ad Account ID: https://business.facebook.com/ → Ad Accounts",
      "blue"
    );
    log("\n📚 อ่านคู่มือ: FACEBOOK_ADS_SETUP.md\n", "cyan");

    process.exit(1);
  }
}

// ตรวจสอบว่าอยู่ใน package directory หรือไม่
const packageJsonPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(packageJsonPath)) {
  log("\n❌ Error: ไม่พบ package.json", "red");
  log("กรุณารันคำสั่งนี้ในโฟลเดอร์ package/\n", "yellow");
  process.exit(1);
}

// เริ่มตรวจสอบ
checkEnvFile();

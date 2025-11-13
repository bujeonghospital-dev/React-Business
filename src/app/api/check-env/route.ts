import { NextResponse } from "next/server";

/**
 * API Endpoint สำหรับตรวจสอบ Environment Variables
 * ใช้ดูว่าตั้งค่าครบถ้วนหรือไม่
 *
 * Usage:
 * - Local: http://localhost:3000/api/check-env
 * - Production: https://your-project.vercel.app/api/check-env
 */
export async function GET() {
  const requiredVars = {
    FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
    FACEBOOK_AD_ACCOUNT_ID: process.env.FACEBOOK_AD_ACCOUNT_ID,
  };

  const optionalVars = {
    GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID,
    GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET,
    GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    GOOGLE_ADS_REFRESH_TOKEN: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID,
    GOOGLE_SA_CLIENT_EMAIL: process.env.GOOGLE_SA_CLIENT_EMAIL,
    GOOGLE_SA_PRIVATE_KEY: process.env.GOOGLE_SA_PRIVATE_KEY,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  };

  // ตรวจสอบ required variables
  const missingRequired = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  // ตรวจสอบ optional variables
  const missingOptional = Object.entries(optionalVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const allRequired = missingRequired.length === 0;

  // สร้าง response โดยแสดงเฉพาะ 10 ตัวอักษรแรกของ token
  const maskedRequired = Object.entries(requiredVars).reduce(
    (acc, [key, value]) => {
      if (value) {
        const maskedValue =
          value.substring(0, 10) + "..." + value.substring(value.length - 10);
        acc[key] = {
          exists: true,
          preview: maskedValue,
          length: value.length,
        };
      } else {
        acc[key] = {
          exists: false,
          preview: null,
          length: 0,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      { exists: boolean; preview: string | null; length: number }
    >
  );

  const maskedOptional = Object.entries(optionalVars).reduce(
    (acc, [key, value]) => {
      if (value) {
        const maskedValue = value.substring(0, 10) + "...";
        acc[key] = {
          exists: true,
          preview: maskedValue,
          length: value.length,
        };
      } else {
        acc[key] = {
          exists: false,
          preview: null,
          length: 0,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      { exists: boolean; preview: string | null; length: number }
    >
  );

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    status: allRequired ? "✅ Ready" : "❌ Not Ready",
    required: {
      allPresent: allRequired,
      missing: missingRequired,
      details: maskedRequired,
    },
    optional: {
      present: Object.keys(optionalVars).length - missingOptional.length,
      missing: missingOptional,
      details: maskedOptional,
    },
    recommendations: allRequired
      ? [
          "✅ ตั้งค่า Required Environment Variables ครบถ้วน",
          missingOptional.length > 0
            ? `⚠️ Optional Variables ขาด ${missingOptional.length} ตัว (ไม่จำเป็น)`
            : "✅ ตั้งค่า Optional Variables ครบถ้วน",
        ]
      : [
          "❌ กรุณาตั้งค่า Required Environment Variables:",
          ...missingRequired.map((key) => `  - ${key}`),
          process.env.NODE_ENV === "production"
            ? "📚 ดูวิธีตั้งค่าที่: PRODUCTION_DEPLOYMENT.md"
            : "📚 ดูวิธีตั้งค่าที่: .env.local.example",
        ],
    helpLinks: {
      productionSetup: "/PRODUCTION_DEPLOYMENT.md",
      quickStart: "/QUICK_START_PRODUCTION.md",
      vercelSetup: "/VERCEL_ENV_SETUP.md",
      facebookSetup: "/FACEBOOK_ADS_SETUP.md",
    },
  });
}

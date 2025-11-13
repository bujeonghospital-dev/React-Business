// src/app/oauth2callback/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.close()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (code) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">สำเร็จ!</h1>
            <p className="text-gray-600 mb-6">ได้รับ Authorization Code แล้ว</p>

            <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left overflow-x-auto">
              <p className="text-xs text-gray-400 mb-2">Authorization Code:</p>
              <code className="text-sm text-green-400 break-all">{code}</code>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-900 mb-2">📋 ขั้นตอนต่อไป:</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>คัดลอก Authorization Code ด้านบน</li>
                <li>กลับไปที่ Terminal/Command Prompt</li>
                <li>Paste code ลงไปในช่องที่สคริปต์ถาม</li>
                <li>รอรับ Refresh Token</li>
                <li>นำ Refresh Token ไปใส่ใน .env.local</li>
              </ol>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  alert("คัดลอก Authorization Code แล้ว!");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 คัดลอก Code
              </button>
              <button
                onClick={() => window.close()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-4">กำลังรอ...</h1>
          <p className="text-gray-600">ไม่พบ Authorization Code</p>
        </div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}

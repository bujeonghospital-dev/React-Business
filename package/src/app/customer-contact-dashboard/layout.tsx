import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard การติดต่อลูกค้า",
  description: "ระบบจัดการและติดตามการติดต่อลูกค้า",
};

export default function CustomerContactDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* ซ่อน Header และ Footer เฉพาะหน้านี้ */
          body > div > div > header,
          body > div > div > footer,
          body header,
          body footer {
            display: none !important;
          }
          
          /* ทำให้ main เต็มหน้าจอ */
          body > div > div > main,
          body main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* ซ่อน ScrollToTop button */
          body > div > div > div[class*="scroll"],
          body > div > button[class*="scroll"] {
            display: none !important;
          }
        `,
        }}
      />
      {children}
    </>
  );
}

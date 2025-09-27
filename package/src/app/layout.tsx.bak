// package/src/app/layout.tsx
import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Aoscompo from "@/utils/aos";
import "../Style/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../app/globals.css";
import DevMiniToolbar from "@/components/DevMiniToolbar";

import LoadingOverlay from "@/components/LoadingOverlay";
import NavProgress from "@/components/NavProgress";
import HomeBackground from "@/components/HomeBackground";
import { Suspense } from "react";
import Providers from "./providers";

// ====== SEO / Metadata ======
export const metadata: Metadata = {
  metadataBase: new URL("https://tpp-thanakon.store"),
  title: { default: "THAI PACKAGING & PRINTING PCL", template: "%s | TPP" },
  description:
    "Thai Packaging & Printing PCL — packaging & printing solutions.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: { icon: "/TPP.ico" },

  // เพิ่ม Open Graph ช่วยแชร์สวยและช่วย Search Engine
  openGraph: {
    type: "website",
    url: "https://tpp-thanakon.store",
    siteName: "TPP",
    title: "THAI PACKAGING & PRINTING PCL",
    description:
      "Thai Packaging & Printing PCL — packaging & printing solutions.",
  },

  // เพิ่ม Twitter Card (ถ้ายังไม่ใช้รูป ใส่ได้ภายหลัง)
  twitter: {
    card: "summary_large_image",
    title: "THAI PACKAGING & PRINTING PCL",
    description:
      "Thai Packaging & Printing PCL — packaging & printing solutions.",
  },
};

// ====== Fonts ======
const font = localFont({
  src: [
    { path: "../../fonts/Kanit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/Kanit-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* JSON-LD: Organization (ปรับ URL รูปโลโก้ให้ตรงไฟล์จริงของคุณ) */}
        <script
          type="application/ld+json"
          // ถ้ามีโลโก้จริง เช่น /images/logo.png เปลี่ยนค่า "logo" ให้ถูก
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Thai Packaging & Printing PCL",
              url: "https://tpp-thanakon.store",
              logo: "https://tpp-thanakon.store/TPP.png",
            }),
          }}
        />
      </head>

      <body
        className={`about-bg-image-background min-h-dvh overflow-x-hidden antialiased ${font.className}`}>
        <Providers>
          <Suspense fallback={null}>
            <HomeBackground />
          </Suspense>

          <Suspense fallback={null}>
            <LoadingOverlay />
          </Suspense>

          <Suspense fallback={null}>
            <NavProgress minDuration={300} killMs={10000} />
          </Suspense>

          <Suspense fallback={null}>
            <Aoscompo>
              <div className="layout-grid">
                <Suspense fallback={null}>
                  <Header />
                </Suspense>

                <main className="flex-grow-1">
                  <Suspense fallback={null}>
                    <DevMiniToolbar
                      position="bottom-left"
                      storageKey="my_dev_toolbar"
                    />
                  </Suspense>
                  {children}
                </main>

                <Footer />
              </div>
            </Aoscompo>
          </Suspense>

          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

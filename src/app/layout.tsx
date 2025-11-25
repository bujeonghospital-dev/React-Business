import ScaledCanvas from "../components/ScaledCanvas";
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
import { DefaultSEO } from "@/components/SEO";
// ====== SEO / Metadata ======
export const metadata: Metadata = {
  metadataBase: new URL("https://app.bjhbangkok.com"),
  title: {
    default:
      "BJH Bangkok | Thai Packaging & Printing | บรรจุภัณฑ์และงานพิมพ์คุณภาพ",
    template: "%s | BJH Bangkok",
  },
  description:
    "BJH Bangkok (บีเจเอช แบงค็อก) - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Thai Packaging & Printing PCL | บริการครบวงจร คุณภาพระดับโลก | ติดต่อ BJH Bangkok วันนี้",
  keywords: [
    "BJH Bangkok",
    "บีเจเอช แบงค็อก",
    "bjh bangkok",
    "BJH",
    "Thai Packaging",
    "Thai Packaging and Printing",
    "TPP",
    "บรรจุภัณฑ์",
    "งานพิมพ์",
    "Printing Solutions",
    "Packaging Thailand",
    "กล่องกระดาษ",
    "corrugated box bangkok",
    "packaging company bangkok",
    "printing company bangkok",
    "บริษัทบรรจุภัณฑ์ กรุงเทพ",
    "บริษัทงานพิมพ์ กรุงเทพ",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: { icon: "/BJH.ico", apple: "/BJH.png" },
  // เพิ่ม Open Graph ช่วยแชร์สวยและช่วย Search Engine
  openGraph: {
    type: "website",
    url: "https://app.bjhbangkok.com",
    siteName: "BJH Bangkok",
    title: "BJH Bangkok | Thai Packaging & Printing | บรรจุภัณฑ์และงานพิมพ์",
    description:
      "BJH Bangkok (บีเจเอช แบงค็อก) - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Thai Packaging & Printing PCL",
    images: [
      {
        url: "https://app.bjhbangkok.com/BJH.png",
        width: 1200,
        height: 630,
        alt: "BJH Bangkok Logo",
      },
    ],
  },
  // เพิ่ม Twitter Card (ถ้ายังไม่ใช้รูป ใส่ได้ภายหลัง)
  twitter: {
    card: "summary_large_image",
    title: "BJH Bangkok | Thai Packaging & Printing",
    description: "BJH Bangkok - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย",
    images: ["/BJH.png"],
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
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="flGnNhb1Ui0L9FS0V80ePdbJw7VeQWIuNXjtDV2R6nU"
        />
        {/* JSON-LD: Organization - ช่วยให้ Google เข้าใจข้อมูลบริษัท */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BJH Bangkok",
              legalName: "Thai Packaging & Printing Public Company Limited",
              alternateName: [
                "บีเจเอช แบงค็อก",
                "TPP",
                "Thai Packaging",
                "BJH",
              ],
              url: "https://app.bjhbangkok.com",
              logo: "https://app.bjhbangkok.com/BJH.png",
              description:
                "BJH Bangkok - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Leading packaging & printing solutions provider in Thailand",
              foundingDate: "1991",
              email: "info@bjhbangkok.com",
              telephone: "+66-2-xxx-xxxx",
              address: {
                "@type": "PostalAddress",
                addressCountry: "TH",
                addressLocality: "Bangkok",
                addressRegion: "Bangkok",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "13.7563",
                longitude: "100.5018",
              },
              sameAs: [
                "https://www.facebook.com/bjhbangkok",
                "https://www.linkedin.com/company/bjhbangkok",
              ],
              knowsAbout: [
                "Packaging",
                "Printing",
                "Corrugated Box",
                "บรรจุภัณฑ์",
                "งานพิมพ์",
              ],
            }),
          }}
        />
        {/* JSON-LD: LocalBusiness - สำหรับการค้นหาในพื้นที่ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://app.bjhbangkok.com/#organization",
              name: "BJH Bangkok",
              alternateName: "บีเจเอช แบงค็อก",
              description:
                "ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในกรุงเทพฯ และประเทศไทย",
              url: "https://app.bjhbangkok.com",
              image: "https://app.bjhbangkok.com/BJH.png",
              priceRange: "$$",
              telephone: "+66-2-xxx-xxxx",
              email: "info@bjhbangkok.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bangkok",
                addressRegion: "Bangkok",
                addressCountry: "TH",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "13.7563",
                longitude: "100.5018",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "08:00",
                  closes: "17:00",
                },
              ],
              sameAs: [
                "https://www.facebook.com/bjhbangkok",
                "https://www.linkedin.com/company/bjhbangkok",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`about-bg-image-background min-h-dvh overflow-x-hidden antialiased ${font.className}`}
      >
        <DefaultSEO />
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

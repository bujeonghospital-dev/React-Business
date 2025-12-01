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
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// ====== SEO / Metadata ======
// Note: Next.js 15 App Router uses Metadata API instead of next-seo
export const metadata: Metadata = {
  metadataBase: new URL("https://app.bjhbangkok.com"),
  title: {
    default:
      "BJH Bangkok | โรงพยาบาลบีเจเอช | BJH Hospital Bangkok Thailand",
    template: "%s | BJH Bangkok - โรงพยาบาลบีเจเอช",
  },
  description:
    "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ ประเทศไทย | BJH Hospital Bangkok - Leading Healthcare Provider in Thailand | บริการทางการแพทย์ครบวงจร มาตรฐานสากล | ติดต่อ BJH Hospital วันนี้",
  keywords: [
    // Primary Keywords - ค้นหาหลัก
    "BJH Bangkok",
    "bjh bangkok",
    "BJH",
    "bjh",
    "โรงพยาบาลบีเจเอช",
    "โรงพยาบาล bjh",
    "โรงพยาบาล BJH",
    "BJH Hospital",
    "bjh hospital",
    // Secondary Keywords - ค้นหารอง
    "บีเจเอช แบงค็อก",
    "โรงพยาบาลบีเจเอช กรุงเทพ",
    "BJH Hospital Bangkok",
    "BJH Hospital Thailand",
    "Bujeong Hospital",
    "โรงพยาบาลบูจอง",
    // Location Keywords
    "โรงพยาบาล กรุงเทพ",
    "hospital bangkok",
    "bangkok hospital",
    "thailand hospital",
    // Service Keywords
    "บริการทางการแพทย์",
    "healthcare bangkok",
    "medical services thailand",
    "คลินิก กรุงเทพ",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://app.bjhbangkok.com",
    languages: {
      'th': 'https://app.bjhbangkok.com',
      'en': 'https://app.bjhbangkok.com/en',
    }
  },
  icons: { icon: "/BJH.ico", apple: "/BJH.png" },
  // Open Graph - สำหรับ Facebook และ Social Media
  openGraph: {
    type: "website",
    url: "https://app.bjhbangkok.com",
    siteName: "BJH Bangkok Hospital - โรงพยาบาลบีเจเอช",
    title: "BJH Bangkok | โรงพยาบาลบีเจเอช | BJH Hospital Thailand",
    description:
      "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ | BJH Hospital - Leading Healthcare Provider in Bangkok, Thailand",
    locale: "th_TH",
    images: [
      {
        url: "https://app.bjhbangkok.com/BJH.png",
        width: 1200,
        height: 630,
        alt: "BJH Bangkok Hospital - โรงพยาบาลบีเจเอช Logo",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "BJH Bangkok | โรงพยาบาลบีเจเอช | BJH Hospital",
    description: "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ ประเทศไทย | Leading Hospital in Bangkok",
    images: ["/BJH.png"],
  },
  // Additional SEO
  verification: {
    google: "flGnNhb1Ui0L9FS0V80ePdbJw7VeQWIuNXjtDV2R6nU",
  },
  category: "Healthcare",
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
        {/* JSON-LD: Hospital - ช่วยให้ Google เข้าใจว่าเป็นโรงพยาบาล */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hospital",
              "@id": "https://app.bjhbangkok.com/#hospital",
              name: "BJH Bangkok Hospital",
              alternateName: [
                "โรงพยาบาลบีเจเอช",
                "BJH Hospital",
                "BJH Bangkok",
                "บีเจเอช แบงค็อก",
                "Bujeong Hospital",
                "โรงพยาบาลบูจอง",
                "BJH",
              ],
              url: "https://app.bjhbangkok.com",
              logo: "https://app.bjhbangkok.com/BJH.png",
              image: "https://app.bjhbangkok.com/BJH.png",
              description:
                "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ ประเทศไทย | Leading Hospital in Bangkok, Thailand | บริการทางการแพทย์ครบวงจร มาตรฐานสากล",
              email: "info@bjhbangkok.com",
              telephone: "+66-2-xxx-xxxx",
              priceRange: "$$$",
              currenciesAccepted: "THB",
              paymentAccepted: "Cash, Credit Card, Insurance",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Bangkok",
                addressLocality: "Bangkok",
                addressRegion: "Bangkok",
                postalCode: "10xxx",
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
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "00:00",
                  closes: "23:59",
                },
              ],
              medicalSpecialty: [
                "GeneralPractice",
                "Surgery",
                "InternalMedicine",
                "Cardiology",
                "Orthopedics",
              ],
              availableService: {
                "@type": "MedicalProcedure",
                name: "Medical Services",
                description: "บริการทางการแพทย์ครบวงจร",
              },
              sameAs: [
                "https://www.facebook.com/bjhbangkok",
                "https://www.linkedin.com/company/bjhbangkok",
              ],
            }),
          }}
        />
        {/* JSON-LD: MedicalOrganization - เสริม SEO สำหรับองค์กรทางการแพทย์ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalOrganization",
              "@id": "https://app.bjhbangkok.com/#organization",
              name: "BJH Bangkok Hospital",
              alternateName: ["โรงพยาบาลบีเจเอช", "BJH Hospital", "BJH"],
              description:
                "โรงพยาบาลบีเจเอช กรุงเทพ - บริการทางการแพทย์ครบวงจร มาตรฐานสากล | BJH Hospital Bangkok - Comprehensive Healthcare Services",
              url: "https://app.bjhbangkok.com",
              logo: "https://app.bjhbangkok.com/BJH.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+66-2-xxx-xxxx",
                contactType: "customer service",
                availableLanguage: ["Thai", "English"],
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bangkok",
                addressRegion: "Bangkok",
                addressCountry: "TH",
              },
            }),
          }}
        />
        {/* JSON-LD: WebSite with SearchAction - ช่วยให้ Google แสดง Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://app.bjhbangkok.com/#website",
              name: "BJH Bangkok Hospital - โรงพยาบาลบีเจเอช",
              alternateName: ["BJH Hospital", "โรงพยาบาลบีเจเอช", "BJH Bangkok"],
              url: "https://app.bjhbangkok.com",
              inLanguage: ["th", "en"],
              publisher: {
                "@id": "https://app.bjhbangkok.com/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://app.bjhbangkok.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`about-bg-image-background min-h-dvh overflow-x-hidden antialiased ${font.className}`}
      >
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
                      hiddenPaths={["/all-files-gallery"]}
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
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}

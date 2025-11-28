import { Metadata, Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};
export const metadata: Metadata = {
  title: "Facebook Ads Manager Dashboard",
  description: "จัดการและติดตามประสิทธิภาพโฆษณา Facebook",
  icons: {
    icon: "/TPP.ico",
  },
};
export default function FacebookAdsManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

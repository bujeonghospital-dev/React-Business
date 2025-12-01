import ScaledCanvas from "../components/ScaledCanvas";
import Video from "@/components/Home/Video";
import Aboutus from "@/components/Home/AboutUs";
import Dedicated from "@/components/Home/Detail";
import Insta from "@/components/Home/News";
import { Metadata } from "next";
import ProductsServices from "@/components/ProductsServices";
import InvestorRelations from "@/components/InvestorRelations";
import Loading from "@/app/loading";
import ClientApp from "@/components/ClientApp";
// สำหรับ CSS
import "../Style/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
export const metadata: Metadata = {
  title: "BJH Bangkok | โรงพยาบาลบีเจเอช | BJH Hospital Thailand",
  description: "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ ประเทศไทย | BJH Hospital Bangkok - Leading Healthcare Provider in Thailand | บริการทางการแพทย์ครบวงจร มาตรฐานสากล",
  keywords: ["BJH Bangkok", "bjh bangkok", "BJH", "bjh", "โรงพยาบาลบีเจเอช", "โรงพยาบาล BJH", "BJH Hospital", "บีเจเอช แบงค็อก", "BJH Hospital Bangkok", "BJH Hospital Thailand"],
  icons: {
    icon: "/BJH.ico",
    apple: "/BJH.png",
  },
  openGraph: {
    title: "BJH Bangkok | โรงพยาบาลบีเจเอช | BJH Hospital Thailand",
    description: "BJH Bangkok (โรงพยาบาลบีเจเอช) - โรงพยาบาลชั้นนำในกรุงเทพฯ | BJH Hospital - Leading Healthcare Provider in Bangkok, Thailand",
    url: "https://app.bjhbangkok.com",
    siteName: "BJH Bangkok Hospital - โรงพยาบาลบีเจเอช",
    images: [
      {
        url: "https://app.bjhbangkok.com/BJH.png",
        width: 1200,
        height: 630,
        alt: "BJH Bangkok Hospital - โรงพยาบาลบีเจเอช",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
};
export default function Home() {
  return (
    <ScaledCanvas>
      <ClientApp />
    </ScaledCanvas>
  );
}
// *ALL

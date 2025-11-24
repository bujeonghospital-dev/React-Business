// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://app.bjhbangkok.com";
  const currentDate = new Date();

  const staticPages = [
    "/", // หน้าหลัก
    // เกี่ยวกับเรา
    "/about-philosophy",
    "/about-history",
    "/about-executives",
    "/about-subsidiaries",
    // สินค้าและบริการ
    "/products-pakku-packaging",
    "/our-services",
    "/our-customers",
    // โรงงานและมาตรฐาน
    "/factory-technology",
    "/quality-control",
    "/quality-certification",
    "/awards-achievements",
    // คอนเทนต์
    "/news-events",
    "/articles",
    // นักลงทุนสัมพันธ์
    "/investor-financials",
    "/investor-governance",
    "/investor-shareholders",
    "/investor-downloads",
    "/investor-contact",
    // ติดต่อเรา
    "/careers",
    "/contact-inquiry",
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "/" ? "daily" : ("weekly" as "daily" | "weekly"),
    priority: route === "/" ? 1.0 : 0.7,
  }));
}

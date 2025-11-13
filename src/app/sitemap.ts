// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tpp-thanakon.store";
  const now = new Date();

  const pages = [
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

  return pages.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.7,
  }));
}

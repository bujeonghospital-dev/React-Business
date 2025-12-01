// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://app.bjhbangkok.com";
  const currentDate = new Date();

  // หน้าหลักที่สำคัญสำหรับ SEO โรงพยาบาล
  const staticPages = [
    // หน้าหลัก - ความสำคัญสูงสุด
    { route: "/", priority: 1.0, changeFreq: "daily" as const },

    // เกี่ยวกับโรงพยาบาล
    { route: "/about", priority: 0.9, changeFreq: "weekly" as const },
    {
      route: "/about-philosophy",
      priority: 0.7,
      changeFreq: "monthly" as const,
    },
    { route: "/about-history", priority: 0.7, changeFreq: "monthly" as const },
    {
      route: "/about-executives",
      priority: 0.6,
      changeFreq: "monthly" as const,
    },
    {
      route: "/about-subsidiaries",
      priority: 0.6,
      changeFreq: "monthly" as const,
    },

    // บริการทางการแพทย์ - ความสำคัญสูง
    { route: "/services", priority: 0.9, changeFreq: "weekly" as const },
    { route: "/our-services", priority: 0.9, changeFreq: "weekly" as const },
    { route: "/departments", priority: 0.8, changeFreq: "weekly" as const },

    // แพทย์และทีมงาน
    { route: "/doctors", priority: 0.8, changeFreq: "weekly" as const },
    { route: "/our-customers", priority: 0.7, changeFreq: "weekly" as const },

    // สินค้าและบริการ
    {
      route: "/products-pakku-packaging",
      priority: 0.7,
      changeFreq: "weekly" as const,
    },

    // โรงงานและมาตรฐาน
    {
      route: "/factory-technology",
      priority: 0.6,
      changeFreq: "monthly" as const,
    },
    {
      route: "/quality-control",
      priority: 0.7,
      changeFreq: "monthly" as const,
    },
    {
      route: "/quality-certification",
      priority: 0.7,
      changeFreq: "monthly" as const,
    },
    {
      route: "/awards-achievements",
      priority: 0.6,
      changeFreq: "monthly" as const,
    },

    // ข่าวสารและบทความ
    { route: "/news-events", priority: 0.8, changeFreq: "daily" as const },
    { route: "/articles", priority: 0.7, changeFreq: "weekly" as const },

    // นักลงทุนสัมพันธ์
    {
      route: "/investor-financials",
      priority: 0.5,
      changeFreq: "monthly" as const,
    },
    {
      route: "/investor-governance",
      priority: 0.5,
      changeFreq: "monthly" as const,
    },
    {
      route: "/investor-shareholders",
      priority: 0.5,
      changeFreq: "monthly" as const,
    },
    {
      route: "/investor-downloads",
      priority: 0.5,
      changeFreq: "monthly" as const,
    },
    {
      route: "/investor-contact",
      priority: 0.5,
      changeFreq: "monthly" as const,
    },

    // ติดต่อเรา - ความสำคัญสูง
    { route: "/contact", priority: 0.9, changeFreq: "weekly" as const },
    { route: "/contact-inquiry", priority: 0.8, changeFreq: "weekly" as const },
    { route: "/careers", priority: 0.7, changeFreq: "weekly" as const },
  ];

  return staticPages.map(({ route, priority, changeFreq }) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: changeFreq,
    priority: priority,
  }));
}

"use client";

import { DefaultSeo } from "next-seo";
import { SEO_CONFIG } from "@/lib/seo.config";

/**
 * Default SEO Component
 * ใช้สำหรับตั้งค่า SEO เริ่มต้นทั้งหมด
 * ใส่ไว้ใน layout.tsx หรือ _app.tsx
 */
export default function DefaultSEO() {
  return <DefaultSeo {...SEO_CONFIG} />;
}

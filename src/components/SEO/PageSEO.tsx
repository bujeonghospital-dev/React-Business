"use client";

import { NextSeo, NextSeoProps } from "next-seo";

/**
 * Page SEO Component
 * ใช้สำหรับแต่ละหน้าที่ต้องการ override SEO
 *
 * @example
 * ```tsx
 * <PageSEO
 *   title="เกี่ยวกับเรา"
 *   description="เรื่องราวของ BJH Bangkok"
 *   canonical="/about"
 * />
 * ```
 */
export default function PageSEO(props: NextSeoProps) {
  return <NextSeo {...props} />;
}

"use client";

/**
 * JSON-LD Component
 * ใช้สำหรับเพิ่ม Structured Data (Schema.org) ในหน้า
 *
 * @example
 * ```tsx
 * import { createArticleSchema } from '@/lib/seo.config';
 *
 * <JsonLd data={createArticleSchema({
 *   title: "ข่าวสาร",
 *   description: "รายละเอียด",
 *   image: "/image.jpg",
 *   datePublished: "2024-01-01"
 * })} />
 * ```
 */
export default function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

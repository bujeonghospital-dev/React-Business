# BJH Bangkok SEO Setup Guide

## 📦 ติดตั้งแล้ว

- ✅ next-seo
- ✅ next-sitemap

## 📁 โครงสร้างไฟล์ SEO

```
src/
├── lib/
│   └── seo.config.ts          # การตั้งค่า SEO หลัก + Schema helpers
├── components/
│   └── SEO/
│       ├── DefaultSEO.tsx     # SEO เริ่มต้นทั้งเว็บ
│       ├── PageSEO.tsx        # SEO สำหรับแต่ละหน้า
│       ├── JsonLd.tsx         # Structured Data (Schema.org)
│       └── index.ts           # Export ทั้งหมด
```

---

## 🚀 วิธีใช้งาน

### 1. เพิ่ม DefaultSEO ใน Root Layout

แก้ไขไฟล์ `src/app/layout.tsx`:

```tsx
import { DefaultSEO } from "@/components/SEO";

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <DefaultSEO />
        {children}
      </body>
    </html>
  );
}
```

### 2. ใช้ PageSEO ในหน้าต่างๆ

**ตัวอย่าง: หน้าเกี่ยวกับเรา** (`src/app/about/page.tsx`):

```tsx
import { PageSEO } from "@/components/SEO";

export default function AboutPage() {
  return (
    <>
      <PageSEO
        title="เกี่ยวกับเรา"
        description="ประวัติและวิสัยทัศน์ของ BJH Bangkok - ผู้นำด้านบรรจุภัณฑ์และการพิมพ์"
        canonical="/about"
        openGraph={{
          title: "เกี่ยวกับ BJH Bangkok",
          description: "ประวัติและวิสัยทัศน์ของบริษัท",
          url: "https://app.bjhbangkok.com/about",
          images: [
            {
              url: "https://app.bjhbangkok.com/images/about-og.jpg",
              width: 1200,
              height: 630,
              alt: "BJH Bangkok About",
            },
          ],
        }}
      />

      <h1>เกี่ยวกับเรา</h1>
      {/* เนื้อหา */}
    </>
  );
}
```

### 3. เพิ่ม Structured Data (JSON-LD)

**ตัวอย่าง: หน้าข่าวสาร** (`src/app/news/[slug]/page.tsx`):

```tsx
import { PageSEO, JsonLd } from "@/components/SEO";
import { createArticleSchema, createBreadcrumbSchema } from "@/lib/seo.config";

export default function NewsDetailPage({ params }) {
  const article = {
    title: "ข่าวสารล่าสุด BJH Bangkok",
    description: "รายละเอียดข่าวสาร...",
    image: "https://app.bjhbangkok.com/images/news.jpg",
    datePublished: "2024-01-15",
  };

  return (
    <>
      <PageSEO
        title={article.title}
        description={article.description}
        canonical={`/news/${params.slug}`}
      />

      <JsonLd data={createArticleSchema(article)} />

      <JsonLd
        data={createBreadcrumbSchema([
          { name: "หน้าแรก", url: "/" },
          { name: "ข่าวสาร", url: "/news" },
          { name: article.title, url: `/news/${params.slug}` },
        ])}
      />

      <article>
        <h1>{article.title}</h1>
        {/* เนื้อหา */}
      </article>
    </>
  );
}
```

### 4. เพิ่ม FAQ Schema

**ตัวอย่าง: หน้า FAQ** (`src/app/faq/page.tsx`):

```tsx
import { PageSEO, JsonLd } from "@/components/SEO";
import { createFAQSchema } from "@/lib/seo.config";

export default function FAQPage() {
  const faqs = [
    {
      question: "BJH Bangkok ให้บริการอะไรบ้าง?",
      answer: "เราให้บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง",
    },
    {
      question: "ติดต่อได้ที่ไหน?",
      answer: "ติดต่อได้ที่ info@bjhbangkok.com",
    },
  ];

  return (
    <>
      <PageSEO
        title="คำถามที่พบบ่อย (FAQ)"
        description="คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับ BJH Bangkok"
        canonical="/faq"
      />

      <JsonLd data={createFAQSchema(faqs)} />

      <div>
        {faqs.map((faq, i) => (
          <div key={i}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

### 5. เพิ่ม Product Schema

**ตัวอย่าง: หน้าผลิตภัณฑ์** (`src/app/products/[id]/page.tsx`):

```tsx
import { PageSEO, JsonLd } from "@/components/SEO";
import { createProductSchema } from "@/lib/seo.config";

export default function ProductPage({ params }) {
  const product = {
    name: "กล่องบรรจุภัณฑ์ Premium",
    description: "กล่องบรรจุภัณฑ์คุณภาพสูง ทนทาน",
    image: "https://app.bjhbangkok.com/images/product.jpg",
  };

  return (
    <>
      <PageSEO
        title={product.name}
        description={product.description}
        canonical={`/products/${params.id}`}
        openGraph={{
          type: "product",
          images: [{ url: product.image }],
        }}
      />

      <JsonLd data={createProductSchema(product)} />

      <div>
        <h1>{product.name}</h1>
        {/* รายละเอียดผลิตภัณฑ์ */}
      </div>
    </>
  );
}
```

---

## 🎯 Schema Types ที่พร้อมใช้

### 1. Organization Schema

```tsx
import { JsonLd } from "@/components/SEO";
import { ORGANIZATION_SCHEMA } from "@/lib/seo.config";

<JsonLd data={ORGANIZATION_SCHEMA} />;
```

### 2. Breadcrumb Schema

```tsx
import { createBreadcrumbSchema } from "@/lib/seo.config";

const breadcrumbs = createBreadcrumbSchema([
  { name: "หน้าแรก", url: "/" },
  { name: "ผลิตภัณฑ์", url: "/products" },
]);
```

### 3. Article Schema

```tsx
import { createArticleSchema } from "@/lib/seo.config";

const article = createArticleSchema({
  title: "หัวข้อข่าว",
  description: "รายละเอียด",
  image: "https://...",
  datePublished: "2024-01-01",
});
```

### 4. Product Schema

```tsx
import { createProductSchema } from "@/lib/seo.config";

const product = createProductSchema({
  name: "ชื่อผลิตภัณฑ์",
  description: "รายละเอียด",
  image: "https://...",
});
```

### 5. FAQ Schema

```tsx
import { createFAQSchema } from "@/lib/seo.config";

const faqs = createFAQSchema([{ question: "คำถาม?", answer: "คำตอบ" }]);
```

---

## 🔧 การตั้งค่า next-sitemap

แก้ไขไฟล์ `next-sitemap.config.js` (ถ้ายังไม่มี):

```js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://app.bjhbangkok.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/api/*", "/admin/*", "/_*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
  },
};
```

เพิ่มใน `package.json`:

```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

---

## 📊 เครื่องมือตรวจสอบ SEO

### 1. Google Tools

- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### 2. Schema Validator

- [Schema.org Validator](https://validator.schema.org/)
- [JSON-LD Playground](https://json-ld.org/playground/)

### 3. Open Graph Debugger

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## ✅ SEO Checklist

- ✅ ติดตั้ง next-seo
- ✅ สร้าง SEO config
- ✅ เพิ่ม DefaultSEO ใน layout
- ✅ ใช้ PageSEO ในแต่ละหน้า
- ✅ เพิ่ม JSON-LD Schema
- ✅ ตั้งค่า next-sitemap
- ⬜ สร้าง robots.txt
- ⬜ สร้าง sitemap.xml
- ⬜ เพิ่ม Open Graph images
- ⬜ ทดสอบกับ Rich Results Test
- ⬜ Submit sitemap ไปยัง Google Search Console

---

## 🎨 Best Practices

1. **Title Tags**: 50-60 ตัวอักษร
2. **Meta Description**: 150-160 ตัวอักษร
3. **Open Graph Image**: 1200x630px (PNG/JPG)
4. **Alt Text**: ใส่ทุกรูป
5. **Canonical URL**: ใส่ทุกหน้า
6. **JSON-LD**: ใส่ตาม page type
7. **robots.txt**: กำหนด crawl rules
8. **sitemap.xml**: Update ทุกครั้งที่เพิ่มหน้าใหม่

---

## 🆘 ปัญหาที่อาจพบ

### ❌ SEO ไม่ทำงาน

- ตรวจสอบว่าใส่ DefaultSEO ใน layout แล้ว
- ตรวจสอบว่า import ถูกต้อง

### ❌ Schema ไม่ผ่าน validation

- ใช้ [Rich Results Test](https://search.google.com/test/rich-results) ตรวจสอบ
- ตรวจสอบ field ที่จำเป็นครบหรือไม่

### ❌ Open Graph ไม่แสดง

- Clear cache ของ Facebook/Twitter debugger
- ตรวจสอบว่ารูปภาพเข้าถึงได้ (public URL)

---

## 📚 Resources

- [next-seo Documentation](https://github.com/garmeeh/next-seo)
- [Schema.org Types](https://schema.org/docs/full.html)
- [Google Search Central](https://developers.google.com/search)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

**สร้างโดย**: BJH Bangkok Development Team  
**วันที่อัพเดท**: November 25, 2025

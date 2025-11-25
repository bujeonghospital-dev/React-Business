# 🚀 BJH Bangkok SEO - Quick Start

## ✅ เสร็จแล้ว

- ✅ ติดตั้ง `next-seo` เรียบร้อย
- ✅ สร้าง SEO Components และ Config
- ✅ เพิ่ม DefaultSEO ใน layout.tsx แล้ว

---

## 📝 ใช้งาน 3 ขั้นตอน

### 1️⃣ สำหรับหน้าทั่วไป - เพิ่ม PageSEO

```tsx
import { PageSEO } from "@/components/SEO";

export default function AboutPage() {
  return (
    <>
      <PageSEO
        title="เกี่ยวกับเรา"
        description="ประวัติและวิสัยทัศน์ของ BJH Bangkok"
        canonical="/about"
      />

      <h1>เกี่ยวกับเรา</h1>
      {/* เนื้อหา */}
    </>
  );
}
```

### 2️⃣ สำหรับข่าวสาร/บทความ - เพิ่ม Schema

```tsx
import { PageSEO, JsonLd } from "@/components/SEO";
import { createArticleSchema } from "@/lib/seo.config";

export default function NewsPage() {
  return (
    <>
      <PageSEO
        title="ข่าวสารล่าสุด"
        description="รายละเอียดข่าว..."
        canonical="/news/latest"
      />

      <JsonLd
        data={createArticleSchema({
          title: "ข่าวสารล่าสุด",
          description: "รายละเอียด",
          image: "https://app.bjhbangkok.com/image.jpg",
          datePublished: "2024-11-25",
        })}
      />

      <article>
        <h1>ข่าวสารล่าสุด</h1>
      </article>
    </>
  );
}
```

### 3️⃣ สำหรับ FAQ - เพิ่ม FAQ Schema

```tsx
import { PageSEO, JsonLd } from "@/components/SEO";
import { createFAQSchema } from "@/lib/seo.config";

export default function FAQPage() {
  const faqs = [{ question: "คำถาม?", answer: "คำตอบ" }];

  return (
    <>
      <PageSEO title="FAQ" canonical="/faq" />
      <JsonLd data={createFAQSchema(faqs)} />

      {/* แสดง FAQ */}
    </>
  );
}
```

---

## 🎯 Schema Types พร้อมใช้

| Schema          | ใช้กับ        | Function                   |
| --------------- | ------------- | -------------------------- |
| 🏢 Organization | ข้อมูลบริษัท  | `ORGANIZATION_SCHEMA`      |
| 📄 Article      | ข่าวสาร/บล็อก | `createArticleSchema()`    |
| 📦 Product      | สินค้า        | `createProductSchema()`    |
| ❓ FAQ          | คำถาม-คำตอบ   | `createFAQSchema()`        |
| 🍞 Breadcrumb   | เส้นทางหน้า   | `createBreadcrumbSchema()` |

---

## 📂 ไฟล์ที่สร้างแล้ว

```
src/
├── lib/
│   └── seo.config.ts              ← Config + Helpers
├── components/
│   └── SEO/
│       ├── DefaultSEO.tsx         ← ใส่ใน layout แล้ว ✅
│       ├── PageSEO.tsx            ← ใช้ในแต่ละหน้า
│       ├── JsonLd.tsx             ← เพิ่ม Schema
│       └── index.ts
└── examples/
    └── seo-usage-examples.tsx     ← ตัวอย่าง 8 หน้า
```

---

## 🧪 ทดสอบ SEO

### Google Tools

1. [Rich Results Test](https://search.google.com/test/rich-results) - ทดสอบ Schema
2. [PageSpeed Insights](https://pagespeed.web.dev/) - ทดสอบความเร็ว
3. [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - ทดสอบ Mobile

### Social Media

1. [Facebook Debugger](https://developers.facebook.com/tools/debug/) - ทดสอบ OG
2. [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. [LinkedIn Inspector](https://www.linkedin.com/post-inspector/)

---

## 📊 ดูตัวอย่างเพิ่มเติม

เปิดไฟล์ `src/examples/seo-usage-examples.tsx` เพื่อดูตัวอย่าง:

- ✅ หน้า About
- ✅ หน้า Contact
- ✅ หน้าข่าวสาร (List + Detail)
- ✅ หน้าผลิตภัณฑ์
- ✅ หน้า FAQ
- ✅ หน้า Services
- ✅ หน้า Blog

---

## 🔧 Config ที่ต้องปรับ

### 1. แก้ URL รูปภาพ OG

ใน `src/lib/seo.config.ts` แก้:

```typescript
images: [
  {
    url: 'https://app.bjhbangkok.com/BJH.png', // ← แก้เป็นรูปที่ต้องการ
    width: 1200,
    height: 630,
  },
],
```

### 2. แก้ Twitter Handle

```typescript
twitter: {
  handle: '@bjhbangkok',  // ← แก้เป็น Twitter ของคุณ
  site: '@bjhbangkok',
},
```

### 3. แก้ Email & Address

ใน `ORGANIZATION_SCHEMA`:

```typescript
email: 'info@bjhbangkok.com',  // ← แก้ email
address: {
  '@type': 'PostalAddress',
  addressCountry: 'TH',
  addressLocality: 'Bangkok',  // ← เพิ่มที่อยู่เต็ม
},
```

---

## ⚡ Tips

1. **Title ไม่ควรเกิน 60 ตัวอักษร**
2. **Description ควรอยู่ที่ 150-160 ตัวอักษร**
3. **OG Image ควรเป็น 1200x630px**
4. **ใส่ canonical ทุกหน้า**
5. **ใส่ alt text ในรูปภาพทุกรูป**

---

## 📖 เอกสารเพิ่มเติม

เปิดไฟล์ `SEO_SETUP_GUIDE.md` สำหรับคู่มือฉบับเต็ม

---

## ✅ Checklist หลังติดตั้ง

- [ ] ทดสอบด้วย Rich Results Test
- [ ] ตรวจสอบ Open Graph ด้วย Facebook Debugger
- [ ] ตั้งค่า Google Search Console
- [ ] Submit sitemap.xml
- [ ] เพิ่ม Schema ในหน้าสำคัญ
- [ ] ทดสอบความเร็วด้วย PageSpeed

---

**พร้อมใช้งานแล้ว! 🎉**

หากมีคำถาม ดูตัวอย่างใน `src/examples/seo-usage-examples.tsx`

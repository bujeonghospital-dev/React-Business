# ✨ การใช้งาน SEO สำเร็จแล้ว!

## 📦 สิ่งที่ติดตั้งและสร้างแล้ว

### ✅ ไลบรารีที่ติดตั้ง

- **next-seo** - จัดการ SEO, Meta Tags, Open Graph, Twitter Cards และ JSON-LD

### ✅ ไฟล์ที่สร้างแล้ว

1. **`src/lib/seo.config.ts`**

   - การตั้งค่า SEO หลักทั้งหมด
   - Functions สำหรับสร้าง Schema (Article, Product, FAQ, Breadcrumb)
   - Organization Schema

2. **`src/components/SEO/`**

   - `DefaultSEO.tsx` - SEO เริ่มต้นสำหรับทั้งเว็บ ✅ **เพิ่มใน layout.tsx แล้ว**
   - `PageSEO.tsx` - สำหรับกำหนด SEO แต่ละหน้า
   - `JsonLd.tsx` - เพิ่ม Structured Data (Schema.org)
   - `index.ts` - Export components

3. **เอกสารและตัวอย่าง**
   - `SEO_SETUP_GUIDE.md` - คู่มือฉบับเต็ม
   - `SEO_QUICK_START.md` - เริ่มต้นใช้งานเร็ว
   - `src/examples/seo-usage-examples.tsx` - ตัวอย่าง 8 หน้า

---

## 🚀 วิธีใช้งานง่ายๆ

### สำหรับหน้าทั่วไป

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
    </>
  );
}
```

### สำหรับหน้าข่าวสาร

```tsx
import { PageSEO, JsonLd } from "@/components/SEO";
import { createArticleSchema } from "@/lib/seo.config";

export default function NewsPage() {
  return (
    <>
      <PageSEO title="ข่าวสาร" canonical="/news" />
      <JsonLd
        data={createArticleSchema({
          title: "ข่าวสารล่าสุด",
          description: "รายละเอียด",
          image: "https://app.bjhbangkok.com/image.jpg",
          datePublished: "2024-11-25",
        })}
      />
      <article>...</article>
    </>
  );
}
```

---

## 📝 ขั้นตอนต่อไป

### 1. เริ่มเพิ่ม SEO ในหน้าสำคัญ

เปิดหน้าใดก็ได้ เช่น:

- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/products/page.tsx`

เพิ่ม:

```tsx
import { PageSEO } from "@/components/SEO";

// เพิ่มใน component
<PageSEO
  title="ชื่อหน้า"
  description="คำอธิบาย 150-160 ตัวอักษร"
  canonical="/url-path"
/>;
```

### 2. อัพเดท Config (ถ้าต้องการ)

แก้ไขไฟล์ `src/lib/seo.config.ts`:

- เปลี่ยน URL รูปภาพ Open Graph
- เปลี่ยน Twitter handle
- เพิ่มข้อมูลบริษัท (email, ที่อยู่)

### 3. ทดสอบ SEO

1. **Rich Results Test** - https://search.google.com/test/rich-results
2. **Facebook Debugger** - https://developers.facebook.com/tools/debug/
3. **PageSpeed Insights** - https://pagespeed.web.dev/

### 4. ตั้งค่า next-sitemap

ตรวจสอบไฟล์ `next-sitemap.config.js` และรัน:

```powershell
npm run build
```

จะสร้าง `sitemap.xml` และ `robots.txt` อัตโนมัติ

---

## 📚 เอกสารและตัวอย่าง

### คู่มือทั้งหมด:

- **`SEO_QUICK_START.md`** → เริ่มต้นใช้งาน 3 ขั้นตอน
- **`SEO_SETUP_GUIDE.md`** → คู่มือฉบับเต็ม พร้อมทุกรายละเอียด
- **`src/examples/seo-usage-examples.tsx`** → ตัวอย่างโค้ด 8 หน้า:
  1. หน้า About
  2. หน้า Contact
  3. หน้าข่าวสาร (List)
  4. หน้าข่าวสาร (Detail)
  5. หน้าผลิตภัณฑ์
  6. หน้า FAQ
  7. หน้า Services
  8. หน้า Blog

---

## 🎯 Schema Types ที่พร้อมใช้

| Schema          | ใช้กับหน้า    | Function                   |
| --------------- | ------------- | -------------------------- |
| 🏢 Organization | ข้อมูลบริษัท  | `ORGANIZATION_SCHEMA`      |
| 📄 Article      | ข่าวสาร/บล็อก | `createArticleSchema()`    |
| 📦 Product      | สินค้า        | `createProductSchema()`    |
| ❓ FAQ          | คำถาม-คำตอบ   | `createFAQSchema()`        |
| 🍞 Breadcrumb   | เส้นทางหน้า   | `createBreadcrumbSchema()` |

---

## 🔧 เทคนิคขั้นสูง

### Dynamic OG Images (ถ้าต้องการ)

สร้างไฟล์ `src/app/api/og/route.tsx`:

```tsx
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "BJH Bangkok";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to right, #3b82f6, #6366f1)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: 60, color: "white" }}>{title}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

จากนั้นใช้:

```tsx
<PageSEO
  title="หน้าใดก็ได้"
  openGraph={{
    images: [{ url: "/api/og?title=หน้าใดก็ได้" }],
  }}
/>
```

---

## ✅ Checklist

- [x] ติดตั้ง next-seo
- [x] สร้าง SEO config และ components
- [x] เพิ่ม DefaultSEO ใน layout.tsx
- [ ] เพิ่ม PageSEO ในหน้าสำคัญ
- [ ] เพิ่ม Schema ในหน้าข่าวสาร/ผลิตภัณฑ์
- [ ] ทดสอบด้วย Rich Results Test
- [ ] ทดสอบ Open Graph
- [ ] ตั้งค่า Google Search Console
- [ ] Submit sitemap

---

## 🆘 ปัญหาที่อาจพบ

### next-seo ไม่ทำงาน?

- ตรวจสอบว่าใส่ `<DefaultSEO />` ใน layout แล้ว ✅
- ตรวจสอบ import path: `'@/components/SEO'`

### Schema ไม่ผ่าน validation?

- ใช้ Rich Results Test ตรวจสอบ
- ตรวจสอบ required fields ครบหรือไม่

### Open Graph ไม่แสดง?

- Clear cache ของ Facebook/Twitter debugger
- ตรวจสอบรูปภาพเข้าถึงได้ (public URL)
- ขนาดรูปควรเป็น 1200x630px

---

## 🎉 เสร็จสมบูรณ์!

ระบบ SEO พร้อมใช้งานแล้ว ตอนนี้คุณสามารถ:

1. ✅ จัดการ Meta Tags ทั้งหมด
2. ✅ เพิ่ม Open Graph สำหรับ Social Media
3. ✅ เพิ่ม Structured Data (Schema.org)
4. ✅ ปรับแต่ง SEO แต่ละหน้าได้ง่าย
5. ✅ รองรับ Twitter Cards
6. ✅ มี sitemap.xml และ robots.txt

---

**หากต้องการความช่วยเหลือเพิ่มเติม เปิดไฟล์:**

- `SEO_QUICK_START.md` - เริ่มต้นใช้งาน
- `SEO_SETUP_GUIDE.md` - คู่มือฉบับเต็ม
- `src/examples/seo-usage-examples.tsx` - ตัวอย่างโค้ด

**พร้อมทำ SEO ให้เว็บไซต์ติดอันดับแล้ว! 🚀**

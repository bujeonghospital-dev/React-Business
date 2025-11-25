/**
 * ตัวอย่างการใช้งาน SEO Components
 * สำหรับหน้าต่างๆ ในโปรเจ็ค BJH Bangkok
 */

// ============================================
// ตัวอย่างที่ 1: หน้า About
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";
import { createBreadcrumbSchema } from "@/lib/seo.config";

export default function AboutPage() {
  return (
    <>
      <PageSEO
        title="เกี่ยวกับเรา - ประวัติและวิสัยทัศน์"
        description="BJH Bangkok มีประวัติกว่า 30 ปี ในการให้บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง"
        canonical="/about"
        openGraph={{
          title: "เกี่ยวกับ BJH Bangkok",
          description: "ผู้นำด้านบรรจุภัณฑ์และการพิมพ์ในประเทศไทย",
          images: [
            {
              url: "https://app.bjhbangkok.com/images/about-banner.jpg",
              width: 1200,
              height: 630,
              alt: "BJH Bangkok Office",
            },
          ],
        }}
      />

      <JsonLd
        data={createBreadcrumbSchema([
          { name: "หน้าแรก", url: "/" },
          { name: "เกี่ยวกับเรา", url: "/about" },
        ])}
      />

      <h1>เกี่ยวกับ BJH Bangkok</h1>
      {/* เนื้อหาหน้า About */}
    </>
  );
}

// ============================================
// ตัวอย่างที่ 2: หน้า Contact
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "ติดต่อเรา - BJH Bangkok",
    description: "ช่องทางการติดต่อ BJH Bangkok",
  };

  return (
    <>
      <PageSEO
        title="ติดต่อเรา"
        description="ติดต่อ BJH Bangkok - โทร 02-xxx-xxxx หรือ info@bjhbangkok.com"
        canonical="/contact"
      />

      <JsonLd data={contactSchema} />

      <h1>ติดต่อเรา</h1>
      {/* ฟอร์มติดต่อ */}
    </>
  );
}

// ============================================
// ตัวอย่างที่ 3: หน้าข่าวสาร (List)
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";

export default function NewsPage() {
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ข่าวสารและกิจกรรม",
    description: "ข่าวสารและกิจกรรมล่าสุดจาก BJH Bangkok",
  };

  return (
    <>
      <PageSEO
        title="ข่าวสารและกิจกรรม"
        description="ติดตามข่าวสารและกิจกรรมล่าสุดของ BJH Bangkok"
        canonical="/news"
        openGraph={{
          type: "website",
          title: "ข่าวสารและกิจกรรม BJH Bangkok",
        }}
      />

      <JsonLd data={newsSchema} />

      <h1>ข่าวสารและกิจกรรม</h1>
      {/* รายการข่าว */}
    </>
  );
}

// ============================================
// ตัวอย่างที่ 4: หน้าข่าวสาร (Detail)
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";
import { createArticleSchema, createBreadcrumbSchema } from "@/lib/seo.config";

export default function NewsDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // ข้อมูลจริงควรดึงจาก database
  const article = {
    title: "BJH Bangkok เปิดตัวบรรจุภัณฑ์รักษ์โลกรุ่นใหม่",
    description:
      "บริษัทเปิดตัวบรรจุภัณฑ์เพื่อสิ่งแวดล้อม 100% biodegradable ตอบโจทย์ ESG",
    image: "https://app.bjhbangkok.com/images/news/eco-packaging.jpg",
    datePublished: "2024-11-25",
    dateModified: "2024-11-25",
  };

  return (
    <>
      <PageSEO
        title={article.title}
        description={article.description}
        canonical={`/news/${params.slug}`}
        openGraph={{
          type: "article",
          article: {
            publishedTime: article.datePublished,
            modifiedTime: article.dateModified,
            authors: ["BJH Bangkok"],
            tags: ["บรรจุภัณฑ์", "ESG", "สิ่งแวดล้อม"],
          },
          images: [
            {
              url: article.image,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ],
        }}
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
        <time dateTime={article.datePublished}>
          {new Date(article.datePublished).toLocaleDateString("th-TH")}
        </time>
        {/* เนื้อหาข่าว */}
      </article>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 5: หน้าผลิตภัณฑ์ (Detail)
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";
import { createProductSchema, createBreadcrumbSchema } from "@/lib/seo.config";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = {
    name: "กล่องกระดาษลูกฟูก Premium",
    description:
      "กล่องกระดาษลูกฟูกคุณภาพสูง ทนทาน กันกระแทก เหมาะสำหรับสินค้าทุกประเภท",
    image: "https://app.bjhbangkok.com/images/products/corrugated-box.jpg",
  };

  return (
    <>
      <PageSEO
        title={product.name}
        description={product.description}
        canonical={`/products/${params.id}`}
        openGraph={{
          type: "product",
          images: [
            {
              url: product.image,
              width: 800,
              height: 600,
              alt: product.name,
            },
          ],
        }}
      />

      <JsonLd data={createProductSchema(product)} />

      <JsonLd
        data={createBreadcrumbSchema([
          { name: "หน้าแรก", url: "/" },
          { name: "ผลิตภัณฑ์", url: "/products" },
          { name: product.name, url: `/products/${params.id}` },
        ])}
      />

      <div>
        <h1>{product.name}</h1>
        <img src={product.image} alt={product.name} />
        <p>{product.description}</p>
      </div>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 6: หน้า FAQ
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";
import { createFAQSchema } from "@/lib/seo.config";

export default function FAQPage() {
  const faqs = [
    {
      question: "BJH Bangkok ให้บริการด้านอะไรบ้าง?",
      answer:
        "เราให้บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง รวมถึงกล่องกระดาษ ฉลากสินค้า และบรรจุภัณฑ์พิเศษตามสั่ง",
    },
    {
      question: "ระยะเวลาในการผลิตเท่าไหร่?",
      answer:
        "ระยะเวลาการผลิตขึ้นอยู่กับประเภทและปริมาณสินค้า โดยทั่วไปใช้เวลา 7-14 วันทำการ",
    },
    {
      question: "มีขั้นต่ำในการสั่งซื้อหรือไม่?",
      answer:
        "มีขั้นต่ำในการสั่งซื้อตามประเภทผลิตภัณฑ์ กรุณาติดต่อฝ่ายขายเพื่อสอบถามรายละเอียด",
    },
    {
      question: "สามารถออกแบบบรรจุภัณฑ์ให้ได้หรือไม่?",
      answer:
        "ได้ครับ เรามีทีมออกแบบมืออาชีพพร้อมให้คำปรึกษาและออกแบบบรรจุภัณฑ์ที่เหมาะสมกับแบรนด์ของคุณ",
    },
  ];

  return (
    <>
      <PageSEO
        title="คำถามที่พบบ่อย (FAQ)"
        description="คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับบริการและผลิตภัณฑ์ของ BJH Bangkok"
        canonical="/faq"
      />

      <JsonLd data={createFAQSchema(faqs)} />

      <div>
        <h1>คำถามที่พบบ่อย (FAQ)</h1>
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================
// ตัวอย่างที่ 7: หน้า Services
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";

export default function ServicesPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Packaging and Printing Solutions",
    provider: {
      "@type": "Organization",
      name: "BJH Bangkok",
      url: "https://app.bjhbangkok.com",
    },
    areaServed: {
      "@type": "Country",
      name: "Thailand",
    },
    description: "บริการด้านบรรจุภัณฑ์และการพิมพ์คุณภาพสูง",
  };

  return (
    <>
      <PageSEO
        title="บริการของเรา"
        description="บริการด้านบรรจุภัณฑ์และการพิมพ์ครบวงจร ตั้งแต่การออกแบบ ผลิต จนถึงจัดส่ง"
        canonical="/services"
      />

      <JsonLd data={serviceSchema} />

      <h1>บริการของเรา</h1>
      {/* รายการบริการ */}
    </>
  );
}

// ============================================
// ตัวอย่างที่ 8: หน้า Blog Post
// ============================================
import { PageSEO, JsonLd } from "@/components/SEO";
import { createArticleSchema } from "@/lib/seo.config";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = {
    title: "5 เทรนด์บรรจุภัณฑ์ที่ต้องจับตามองในปี 2025",
    description:
      "เทรนด์บรรจุภัณฑ์ล่าสุดที่จะเปลี่ยนโฉมหน้าอุตสาหกรรม ตั้งแต่ ESG จนถึง Smart Packaging",
    image: "https://app.bjhbangkok.com/images/blog/trends-2025.jpg",
    datePublished: "2024-11-20",
    author: "BJH Bangkok Marketing Team",
  };

  return (
    <>
      <PageSEO
        title={post.title}
        description={post.description}
        canonical={`/blog/${params.slug}`}
        openGraph={{
          type: "article",
          images: [{ url: post.image }],
        }}
      />

      <JsonLd
        data={createArticleSchema({
          ...post,
          author: post.author,
        })}
      />

      <article>
        <h1>{post.title}</h1>
        <p className="author">โดย {post.author}</p>
        {/* เนื้อหาบล็อก */}
      </article>
    </>
  );
}

import { DefaultSeoProps } from "next-seo";

/**
 * SEO Configuration สำหรับ BJH Bangkok
 * ใช้กับ next-seo library เพื่อจัดการ meta tags ทั้งหมด
 */
export const SEO_CONFIG: DefaultSeoProps = {
  titleTemplate: "%s | BJH Bangkok",
  defaultTitle:
    "BJH Bangkok | Thai Packaging & Printing | บรรจุภัณฑ์และงานพิมพ์คุณภาพ",
  description:
    "BJH Bangkok (บีเจเอช แบงค็อก) - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Thai Packaging & Printing PCL | บริการครบวงจร คุณภาพระดับโลก | ติดต่อ BJH Bangkok วันนี้",

  canonical: "https://app.bjhbangkok.com",

  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://app.bjhbangkok.com",
    siteName: "BJH Bangkok",
    title: "BJH Bangkok | Thai Packaging & Printing | บรรจุภัณฑ์และงานพิมพ์",
    description:
      "BJH Bangkok (บีเจเอช แบงค็อก) - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Thai Packaging & Printing PCL",
    images: [
      {
        url: "https://app.bjhbangkok.com/BJH.png",
        width: 1200,
        height: 630,
        alt: "BJH Bangkok Logo - Thai Packaging & Printing",
        type: "image/png",
      },
    ],
  },

  twitter: {
    handle: "@bjhbangkok",
    site: "@bjhbangkok",
    cardType: "summary_large_image",
  },

  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      name: "keywords",
      content:
        "BJH Bangkok, บีเจเอช แบงค็อก, bjh bangkok, BJH, Thai Packaging, บรรจุภัณฑ์, Printing Solutions, งานพิมพ์, Packaging Thailand, TPP, Thai Packaging and Printing, กล่องกระดาษ, corrugated box, packaging company bangkok, printing company bangkok, บริษัทบรรจุภัณฑ์, บริษัทงานพิมพ์",
    },
    {
      name: "author",
      content: "BJH Bangkok",
    },
    {
      name: "geo.region",
      content: "TH-10",
    },
    {
      name: "geo.placename",
      content: "Bangkok",
    },
    {
      name: "language",
      content: "Thai",
    },
    {
      httpEquiv: "x-ua-compatible",
      content: "IE=edge",
    },
  ],

  additionalLinkTags: [
    {
      rel: "icon",
      href: "/BJH.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/BJH.png",
      sizes: "76x76",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ],

  robotsProps: {
    nosnippet: false,
    notranslate: false,
    noimageindex: false,
    noarchive: false,
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },
};

/**
 * JSON-LD Organization Schema - เพิ่มประสิทธิภาพสำหรับการค้นหา "BJH Bangkok"
 */
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BJH Bangkok",
  legalName: "Thai Packaging & Printing Public Company Limited",
  alternateName: ["บีเจเอช แบงค็อก", "TPP", "Thai Packaging", "BJH"],
  url: "https://app.bjhbangkok.com",
  logo: "https://app.bjhbangkok.com/BJH.png",
  description:
    "BJH Bangkok - ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในประเทศไทย | Leading packaging & printing solutions provider in Thailand",
  foundingDate: "1991",
  email: "info@bjhbangkok.com",
  telephone: "+66-2-xxx-xxxx",
  address: {
    "@type": "PostalAddress",
    addressCountry: "TH",
    addressLocality: "Bangkok",
    addressRegion: "Bangkok",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "13.7563",
    longitude: "100.5018",
  },
  areaServed: {
    "@type": "Country",
    name: "Thailand",
  },
  sameAs: [
    "https://www.facebook.com/bjhbangkok",
    "https://www.linkedin.com/company/bjhbangkok",
  ],
  knowsAbout: [
    "Packaging",
    "Printing",
    "Corrugated Box",
    "Carton Box",
    "Label Printing",
    "บรรจุภัณฑ์",
    "งานพิมพ์",
  ],
};

/**
 * JSON-LD LocalBusiness Schema - สำหรับการค้นหาในพื้นที่
 */
export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://app.bjhbangkok.com/#organization",
  name: "BJH Bangkok",
  alternateName: "บีเจเอช แบงค็อก",
  description: "ผู้นำด้านบรรจุภัณฑ์และงานพิมพ์ในกรุงเทพฯ และประเทศไทย",
  url: "https://app.bjhbangkok.com",
  image: "https://app.bjhbangkok.com/BJH.png",
  priceRange: "$$",
  telephone: "+66-2-xxx-xxxx",
  email: "info@bjhbangkok.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangkok",
    addressRegion: "Bangkok",
    addressCountry: "TH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "13.7563",
    longitude: "100.5018",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],
  sameAs: [
    "https://www.facebook.com/bjhbangkok",
    "https://www.linkedin.com/company/bjhbangkok",
  ],
};

/**
 * สร้าง BreadcrumbList Schema
 */
export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://app.bjhbangkok.com${item.url}`,
    })),
  };
}

/**
 * สร้าง Article Schema สำหรับบทความ/ข่าว
 */
export function createArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author = "BJH Bangkok",
}: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: author,
      url: "https://app.bjhbangkok.com",
    },
    publisher: {
      "@type": "Organization",
      name: "BJH Bangkok",
      logo: {
        "@type": "ImageObject",
        url: "https://app.bjhbangkok.com/BJH.png",
      },
    },
  };
}

/**
 * สร้าง Product Schema สำหรับผลิตภัณฑ์
 */
export function createProductSchema({
  name,
  description,
  image,
  brand = "BJH Bangkok",
}: {
  name: string;
  description: string;
  image: string;
  brand?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    image: image,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    manufacturer: {
      "@type": "Organization",
      name: "Thai Packaging & Printing PCL",
    },
  };
}

/**
 * สร้าง FAQ Schema
 */
export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

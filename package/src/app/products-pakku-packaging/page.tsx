"use client";
import ScaledCanvas from "../../components/ScaledCanvas";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  Star,
  Flame,
  Leaf,
  Package,
  Boxes,
} from "lucide-react";

// ===== mock data (replace with real data or API) =====
const slides = [
  {
    id: 1,
    src: "/images/pakku-packaging/banner/pakku_banner_1.png",
    alt: "Banner – Pakku Packaging 1",
  },
  {
    id: 2,
    src: "/images/pakku-packaging/banner/pakku_banner_2.png",
    alt: "Banner – Pakku Packaging 2",
  },
  {
    id: 3,
    src: "/images/pakku-packaging/banner/pakku_banner_4.png",
    alt: "Banner – Pakku Packaging 3",
  },
];

const sidebar = [
  {
    title: "HOT ITEM",
    icon: <Flame className="h-4 w-4" />,
    items: ["ถาดใส่อาหาร Size L 650 ml"],
  },
  {
    title: "สินค้าใหม่",
    icon: <Star className="h-4 w-4" />,
    items: [
      "บรรจุภัณฑ์กระดาษคราฟท์",
      "บรรจุภัณฑ์อาหารทนร้อน",
      "ฝาครอบ",
      "ชามกระดาษ",
      "หลอดกระดาษ",
      "กล่องอาหาร",
      "สินค้านำเข้า",
    ],
  },
  {
    title: "แบ่งตามประเภท",
    icon: <Boxes className="h-4 w-4" />,
    items: [
      // ถาดและกล่องอาหาร
      "FOOD TRAY",
      "SNACK BOX",
      "CUP NOODLES",

      // กล่องเบเกอรี่และเค้ก
      "BAKERY BOX",
      "กล่องเค้กสามเหลี่ยม",
      "กล่องเค้กลิ้นชัก",
      "กล่องเค้กหูหิ้ว",

      // อุปกรณ์เสริมสำหรับเครื่องดื่ม
      "CUP SLEEVE",
      "ถาดใส่แก้วกาแฟ",

      // กระดาษและวัสดุบรรจุภัณฑ์
      "กระดาษลูกฟูก E-B",
      "กระดาษเอนกประสงค์",
      "ซองเครป",

      // กล่องเอนกประสงค์
      "กล่องเอนกประสงค์",
    ],
  },
];

const features = [
  {
    title: "สินค้าดี",
    subtitle: "อัปเดตล็อตล่าสุด",
    img: "/images/pakku-packaging/pakku-Box_1.png",
  },
  {
    title: "สินค้าใหม่",
    subtitle: "ค้นหาง่ายตามหมวด",
    img: "/images/pakku-packaging/pakku-Box_2.png",
  },
  {
    title: "แบ่งตามประเภท",
    subtitle: "รักษ์โลก ใช้วัสดุเป็นมิตร",
    img: "/images/pakku-packaging/pakku-Box_3.png",
  },
];

// const products = Array.from({ length: 9 }).map((_, i) => ({
//   id: String(i + 1),
//   sku: `FIC${800000 + i}`,
//   name: `ชามกระดาษ 8oz ลายบลู #${i + 1}`,
//   priceText: `ราคาเริ่ม ${540 + i * 10} บาท/แพ็ค`,
//   img: "/images/pakku-packaging/dev_291.png",
// }));
const products = [
  {
    id: "1",
    sku: "FOOD TRAY",
    name: `ถาดใส่อาหาร `,
    size: `Size L 650 ml`,
    Detail: `ขนาด 9.5x19x4 cm`,
    priceText: `ราคาเริ่ม 150 บาท/แพ็ค`,
    img: "/images/pakku-packaging/1.png",
  },
  {
    id: "2",
    sku: "FOOD TRAY",
    name: `ถาดใส่อาหาร`,
    size: `Size S 180 ml`,
    Detail: `ขนาด 11x11x4 cm`,
    priceText: `ราคาเริ่ม 200 บาท/แพ็ค`,
    img: "/images/pakku-packaging/2.png",
  },
  {
    id: "3",
    sku: "SNACK BOX",
    name: `Snack Box`,
    size: `Size M `,
    Detail: `ขนาด 13x13x6 cm`,
    priceText: `ราคาเริ่ม 200 บาท/แพ็ค`,
    img: "/images/pakku-packaging/3.png",
  },
  {
    id: "4",
    sku: "BAKERY BOX",
    name: `Bakery Box`,
    size: `Size S `,
    Detail: `ขนาด 14x14x4 cm`,
    priceText: `ราคาเริ่ม 100 บาท/แพ็ค`,
    img: "/images/pakku-packaging/13.png",
  },
  {
    id: "5",
    sku: "CUP SLEEVE",
    name: `สายคาดแก้ว`,
    size: `Size L 16-22 oz`,
    priceText: `ราคาเริ่ม 80 บาท/แพ็ค`,
    img: "/images/pakku-packaging/14.png",
  },
  {
    id: "6",
    sku: "CUP NOODLES",
    name: `ถ้วยอาหาร`,
    Detail: `ขนาด 9x10.5x3 cm`,
    priceText: `ราคาเริ่ม 80 บาท/แพ็ค`,
    img: "/images/pakku-packaging/12.png",
  },
  {
    id: "7",
    sku: "กล่องเค้กสามเหลี่ยม",
    name: `กล่องเค้กสามเหลี่ยม`,
    Detail: `ขนาด 9x13.8x9 cm`,
    priceText: `ราคาเริ่ม 120 บาท/แพ็ค`,
    img: "/images/pakku-packaging/8.png",
  },
  {
    id: "8",
    sku: "กล่องเค้กลิ้นชัก",
    name: `กล่องเค้กลิ้นชัก`,
    Detail: `ขนาด 8.7x17x6 cm`,
    priceText: `ราคาเริ่ม 100 บาท/แพ็ค`,
    img: "/images/pakku-packaging/5.png",
  },
  {
    id: "9",
    sku: "กระดาษลูกฟูก E-B",
    name: `กระดาษลูกฟูก E-B`,
    Detail: `ขนาด 38x40 cm`,
    priceText: `ราคาเริ่ม 200 บาท/แพ็ค`,
    img: "/images/pakku-packaging/15.png",
  },
  {
    id: "10",
    sku: "กล่องเอนกประสงค์",
    name: `กล่องเอนกประสงค์`,
    Detail: `ขนาด 10x7.2x6.5 cm`,
    priceText: `ราคาเริ่ม 250 บาท/แพ็ค`,
    img: "/images/pakku-packaging/6.png",
  },
  {
    id: "11",
    sku: "กระดาษเอนกประสงค์",
    name: `กระดาษเอนกประสงค์`,
    Detail: `ขนาด 40x45 cm`,
    priceText: `ราคาเริ่ม 300 บาท/แพ็ค`,
    img: "/images/pakku-packaging/10.png",
  },
  {
    id: "12",
    sku: "ซองเครป",
    name: `ซองเครป`,
    Detail: `ขนาด 14.5x20 cm`,
    priceText: `ราคาเริ่ม 150 บาท/แพ็ค`,
    img: "/images/pakku-packaging/7.png",
  },
  {
    id: "13",
    sku: "กล่องเค้กหูหิ้ว",
    name: `กล่องเค้กหูหิ้ว`,
    Detail: `ขนาด 9.5x14.2x14 cm`,
    priceText: `ราคาเริ่ม 180 บาท/แพ็ค`,
    img: "/images/pakku-packaging/4.png",
  },
  {
    id: "14",
    sku: "ถาดใส่แก้วกาแฟ",
    name: `ถาดใส่แก้วกาแฟ`,
    Detail: `ขนาด 9.3x19.5x3.2 cm`,
    priceText: `ราคาเริ่ม 220 บาท/แพ็ค`,
    img: "/images/pakku-packaging/11.png",
  },
  {
    id: "15",
    sku: "กล่องเค้กสามเหลี่ยม",
    name: `กล่องเค้กสามเหลี่ยม`,
    Detail: `ขนาด 10x10x10 cm`,
    priceText: `ราคาเริ่ม 200 บาท/แพ็ค`,
    img: "/images/pakku-packaging/9.png",
  },
];
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2">
      {children}
    </h3>
  );
}

function SidebarSection({
  title,
  icon,
  items,
  selectedCategory,
  onSelectCategory,
}: {
  title: string;
  icon?: React.ReactNode;
  items: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-200 pb-3">
      <button
        className="w-full flex items-center justify-between py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <SectionTitle>
          <span className="inline-flex items-center gap-2">
            {icon}
            {title}
          </span>
        </SectionTitle>
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {open && (
        <ul className="mt-1 space-y-2 text-[15px] leading-6 text-slate-700">
          {items.map((it, idx) => (
            <li key={idx}>
              <button
                onClick={() =>
                  onSelectCategory(selectedCategory === it ? null : it)
                }
                className={`group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 w-full text-left transition-colors ${
                  selectedCategory === it ? "bg-emerald-50" : ""
                }`}
              >
                <span
                  className={`mt-1 inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                    selectedCategory === it
                      ? "bg-emerald-500"
                      : "bg-slate-400 group-hover:bg-emerald-500"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    selectedCategory === it
                      ? "text-emerald-600 font-medium"
                      : "group-hover:text-emerald-600"
                  }`}
                >
                  {it}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeatureTile({ t }: { t: (typeof features)[number] }) {
  return (
    <a
      href="#"
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={t.img}
          alt={t.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700">
          {t.title}
        </h4>
        <p className="text-sm text-slate-600">{t.subtitle}</p>
      </div>
    </a>
  );
}

function ProductCard({ p }: { p: (typeof products)[number] }) {
  return (
    <Link
      href={`/products-pakku-packaging/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-white">
        <img
          src={p.img}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="text-[13px] text-slate-500">{p.sku}</div>
        <div className="mt-1 line-clamp-2 text-[15px] font-medium text-slate-800">
          {p.name}
        </div>
        <div> {p.size}</div>
        <div> {p.Detail}</div>
        <div className="mt-2 text-sm text-emerald-700">{p.priceText}</div>
      </div>
    </Link>
  );
}

function Breadcrumb({ selectedCategory }: { selectedCategory: string | null }) {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-slate-500"
      aria-label="breadcrumb"
    >
      <a className="hover:text-emerald-700" href="#">
        หน้าแรก (
      </a>
      <span className="text-slate-400">/</span>
      <a className="hover:text-emerald-700" href="#">
        สินค้าทั่วไป
      </a>
      <span className="text-slate-400">/</span>
      <span className="text-slate-700 font-medium">
        {selectedCategory || "ทั้งหมด"}
      </span>
    </nav>
  );
}

export default function PakkuCatalogPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  // กรองสินค้าตามหมวดหมู่ที่เลือก
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.sku === selectedCategory);
  }, [selectedCategory]);

  return (
    <ScaledCanvas>
      <div className="min-h-screen bg-neutral-50 text-slate-900 py-5">
        <section className="relative w-full overflow-hidden h-[100svh] py-5">
          <div className="relative h-[min(72vh,750px)]">
            {slides.map((s, i) => (
              <img
                key={s.id}
                src={s.src}
                alt={s.alt}
                className={`absolute inset-0 block h-full w-full object-cover transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/70 px-2 py-1">
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-5 bg-emerald-600" : "w-2.5 bg-slate-300"
                    }`}
                    aria-label={`สไลด์ที่ ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[280px_1fr]">
          <aside className="hidden md:block">
            <div className="sticky top-[88px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  แถบหมวดสินค้า
                </div>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {sidebar.map((sec) => (
                  <SidebarSection
                    key={sec.title}
                    title={sec.title}
                    icon={sec.icon}
                    items={sec.items}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                ))}
              </div>
            </div>
          </aside>

          <main>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <FeatureTile key={f.title} t={f} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <Breadcrumb selectedCategory={selectedCategory} />
              <div className="hidden text-sm text-slate-500 md:block">
                แสดง {filteredProducts.length} รายการ
                {selectedCategory && (
                  <span className="ml-2 text-emerald-600">
                    (กรองโดย: {selectedCategory})
                  </span>
                )}
              </div>
            </div>

            {selectedCategory && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-600">กรองตาม:</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => <ProductCard key={p.id} p={p} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">ไม่พบสินค้าในหมวดหมู่นี้</p>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    แสดงสินค้าทั้งหมด
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[88%] max-w-[320px] overflow-y-auto rounded-r-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <SectionTitle>แถบหมวดสินค้า</SectionTitle>
                <button
                  className="rounded-lg p-2 hover:bg-slate-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {selectedCategory && (
                <div className="px-4 pb-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              )}
              <div className="px-4 pb-6">
                <div className="space-y-3">
                  {sidebar.map((sec) => (
                    <SidebarSection
                      key={sec.title}
                      title={sec.title}
                      icon={sec.icon}
                      items={sec.items}
                      selectedCategory={selectedCategory}
                      onSelectCategory={(category) => {
                        setSelectedCategory(category);
                        setSidebarOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScaledCanvas>
  );
}

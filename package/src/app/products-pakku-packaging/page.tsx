"use client";

import React, { useEffect, useMemo, useState } from "react";
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
    src: "/images/pakku-packaging/packaging__1.png",
    alt: "Video – Pakku Packaging 1",
  },
  {
    id: 2,
    src: "/images/pakku-packaging/packaging__2.png",
    alt: "Video – Pakku Packaging 2",
  },
  {
    id: 3,
    src: "/images/pakku-packaging/packaging__3.png",
    alt: "Video – Pakku Packaging 3",
  },
];

const sidebar = [
  {
    title: "HOT ITEM",
    icon: <Flame className="h-4 w-4" />,
    items: ["ถาดกระดาษ รุ่นปังโบ"],
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
      "แก้วกระดาษ",
      "ถ้วยร้อน/เย็น",
      "ช้อนส้อมไม้",
      "กล่องพัสดุ",
      "กล่องหูหิ้ว",
      "สินค้าแคมเปญ",
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

const products = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  sku: `FIC${800000 + i}`,
  name: `ชามกระดาษ 8oz ลายบลู #${i + 1}`,
  priceText: `ราคาเริ่ม ${540 + i * 10} บาท/แพ็ค`,
  img: "https://images.unsplash.com/photo-1556909114-96b7c8c01728?q=80&w=800&auto=format&fit=crop",
}));

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
}: {
  title: string;
  icon?: React.ReactNode;
  items: string[];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-200 pb-3">
      <button
        className="w-full flex items-center justify-between py-3"
        onClick={() => setOpen((v) => !v)}>
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
              <a
                href="#"
                className="group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-500" />
                <span className="group-hover:text-emerald-600">{it}</span>
              </a>
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
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
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
    <a
      href="#"
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
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
        <div className="mt-2 text-sm text-emerald-700">{p.priceText}</div>
      </div>
    </a>
  );
}

function Breadcrumb() {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-slate-500"
      aria-label="breadcrumb">
      <a className="hover:text-emerald-700" href="#">
        หน้าแรก
      </a>
      <span className="text-slate-400">/</span>
      <a className="hover:text-emerald-700" href="#">
        สินค้าทั่วไป
      </a>
      <span className="text-slate-400">/</span>
      <span className="text-slate-700">สินค้าใหม่</span>
    </nav>
  );
}

export default function PakkuCatalogPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <section className="relative isolate w-screen left-1/2 -ml-[50vw]">
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
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              แถบหมวดสินค้า
            </div>
            <div className="space-y-3">
              {sidebar.map((sec) => (
                <SidebarSection
                  key={sec.title}
                  title={sec.title}
                  icon={sec.icon}
                  items={sec.items}
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
            <Breadcrumb />
            <div className="hidden text-sm text-slate-500 md:block">
              แสดง 9 รายการ
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal>
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-[320px] overflow-y-auto rounded-r-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <SectionTitle>แถบหมวดสินค้า</SectionTitle>
              <button
                className="rounded-lg p-2 hover:bg-slate-100"
                onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 pb-6">
              <div className="space-y-3">
                {sidebar.map((sec) => (
                  <SidebarSection
                    key={sec.title}
                    title={sec.title}
                    icon={sec.icon}
                    items={sec.items}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

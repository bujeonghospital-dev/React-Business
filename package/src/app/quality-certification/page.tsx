"use client";

import React, { useEffect, useState } from "react";

type Badge = {
  id: string;
  title: string;
  desc?: string;
  src: string;
  box?: [number, number];
};

function publicUrl(p: string) {
  return p.startsWith("/") ? p : `/${p}`;
}

const BADGES: Badge[] = [
  {
    id: "iso9001-ukas",
    title: "QMS — ISO 9001 : 2015",
    desc: "UKAS / SGS System Certification",
    src: "images/certifications/iso9001-ukas.png",
    box: [414, 240],
  },
  {
    id: "iso14001-ukas",
    title: "EMS — ISO 14001 : 2015",
    desc: "UKAS / SGS System Certification",
    src: "images/certifications/iso14001-ukas.png",
    box: [414, 240],
  },
  {
    id: "ghp-badge",
    title: "GHP — Good Hygiene Practice",
    desc: "ACFS Thailand Accreditation",
    src: "images/certifications/ghp-badge.png",
    box: [414, 240],
  },
  {
    id: "haccp-badge",
    title: "HACCP — Hazard Analysis Critical Control Point",
    desc: "ACFS Thailand Accreditation",
    src: "images/certifications/haccp-badge.png",
    box: [414, 240],
  },
  {
    id: "sgsco-badge",
    title: "SGS&CO — Certified Print Facility",
    desc: "Graphic Measures International",
    src: "images/certifications/sgsco-badge.png",
    box: [392, 267],
  },
  {
    id: "fsc-badge",
    title: "FSC — Forest Stewardship Council (CoC)",
    desc: "Chain of Custody",
    src: "images/certifications/fsc-badge.png",
    box: [414, 240],
  },
  {
    id: "green-industry-badge",
    title: "Green Industry — Level 3",
    desc: "กระทรวงอุตสาหกรรม (Green System)",
    src: "images/certifications/green-industry-badge.png",
    box: [314, 240],
  },
  {
    id: "gmi-badge",
    title: "GMI — Certified Print Facility",
    desc: "Graphic Measures International",
    src: "images/certifications/gmi-badge.png",
    box: [400, 400],
  },
];

export default function QualityBadgesAnimatedPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white pt-10 md:pt-12 flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header with fade-in animation */}
        <header
          className={`text-center mt-2 md:mt-4 transition-all duration-1000 transform ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6">
            <span className="block">การรับรองคุณภาพ</span>
            <span className="block mt-2 text-3xl md:text-4xl bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              มาตรฐานระดับสากล
            </span>
          </h1>

          {/* Main description with stagger animation */}
          <div
            className={`max-w-4xl mx-auto space-y-4 transition-all duration-1000 delay-300 transform ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}>
            <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
              TPP ดำเนินงานภายใต้มาตรฐานที่ได้รับการยอมรับในระดับสากล
              พร้อมพัฒนาคุณภาพการผลิตและบรรจุภัณฑ์อย่างต่อเนื่อง
              เพื่อสร้างความมั่นใจให้กับลูกค้าในทุกขั้นตอนการทำงาน
            </p>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed">
              ด้วยความมุ่งมั่นของผู้บริหารและทีมงาน ใส่ใจในทุกรายละเอียด
              เพื่อส่งมอบบรรจุภัณฑ์คุณภาพสูงที่สอดคล้องกับมาตรฐานและระบบคุณภาพที่สำคัญในอุตสาหกรรม
            </p>
          </div>
        </header>

        {/* Badges grid with stagger animation */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {BADGES.map((b, index) => (
            <figure
              key={b.id}
              className={`group relative rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 p-6 cursor-pointer transform hover:-translate-y-2 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: `${index * 100 + 500}ms`,
              }}
              onMouseEnter={() => setHoveredBadge(b.id)}
              onMouseLeave={() => setHoveredBadge(null)}>
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Badge container with scale animation */}
              <div
                className={`relative mx-auto w-full bg-gradient-to-br from-white to-gray-50 rounded-xl ring-1 ring-neutral-200 overflow-hidden transition-transform duration-500 ${
                  hoveredBadge === b.id ? "scale-105" : "scale-100"
                }`}
                style={{
                  aspectRatio: `${b.box?.[0] ?? 414} / ${b.box?.[1] ?? 240}`,
                  maxWidth: b.box?.[0] ?? 414,
                }}>
                <img
                  src={publicUrl(b.src)}
                  alt={b.title}
                  loading="lazy"
                  className="h-full w-full object-contain p-4"
                />

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"></div>
              </div>

              {/* Caption with enhanced typography */}
              <figcaption className="relative mt-4 text-center">
                <div className="font-bold text-neutral-900 text-sm lg:text-base group-hover:text-blue-600 transition-colors duration-300">
                  {b.title}
                </div>
                {b.desc && (
                  <div className="mt-1 text-xs lg:text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors duration-300">
                    {b.desc}
                  </div>
                )}
              </figcaption>

              {/* Badge indicator */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              </div>
            </figure>
          ))}
        </div>
      </section>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}

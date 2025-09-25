"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

// ======= ปรับแต่งได้ =======
const Video_TITLE = "คณะกรรมการ / ผู้บริหาร";
const Video_DESC =
  "คณะกรรมการและผู้บริหาร กำหนดวิสัยทัศน์และกลยุทธ์เชิงธุรกิจ เพื่อเสริมสร้างความแข็งแกร่งและความยั่งยืนขององค์กร";
const Video_BG_URL = "/images/joinus/bg-board.jpg";

// หมวดในแถบแท็บ
const TABS = [
  { id: "board", label: "คณะกรรมการ" },
  { id: "executive", label: "ผู้บริหาร" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export type Member = {
  id: string;
  name: string;
  role?: string;
  image?: string;
  category: TabId;
};

const MEMBERS: Member[] = [
  // === คณะกรรมการ (12 คน) ===
  {
    id: "m01",
    name: "นายธีระพงษ์ อัศวินวิจิตร",
    role: "ประธานกรรมการ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m02",
    name: "นายฉัตรชัย เอียสกุล",
    role: "รองประธานกรรมการ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m05",
    name: "นายอดุลย์  วินัยแพทย์",
    role: "กรรมการ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m03",
    name: "ดร.วรัญ แต้ไพสิฐพงษ์",
    role: "ประธานกรรมการสรรหา และกำหนดค่าตอบแทน",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m04",
    name: "นายสุนทร พจน์ธนมาศ",
    role: "กรรมการอิสระ ประธานกรรมการตรวจสอบ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m06",
    name: "นายเจริญรัตน์ หาญเบญจพงศ์",
    role: "กรรมการอิสระ กรรมการตรวจสอบ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m07",
    name: "นายสุพจน์ พฤกษานานนท์",
    role: "กรรมการ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m08",
    name: "นายจักกพงศ์ ณ บางช้าง",
    role: "กรรมการอิสระ กรรมการตรวจสอบ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m09",
    name: "นายพงศธัช อัศวินวิจิตร",
    role: "กรรมการ และ กรรมการผู้จัดการ",
    image: "/images/subcommittee/User_shadow2.png",
    category: "board",
  },
  {
    id: "m10",
    name: "นายอุดม นิลภารักษ์",
    role: "กรรมการ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m11",
    name: "ดร.ณัฐสิทธิ์ เจียรวัฒน์ชัย",
    role: "กรรมการสรรหาและกำหนด",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  {
    id: "m12",
    name: "พ.อ.กิตติเมธ เมืองอ่ำ",
    role: "กรรมการอิสระ",
    image: "/images/board/User_shadow.png",
    category: "board",
  },
  // === ผู้บริหาร ===
  {
    id: "s01",
    name: "นายพงศธัช อัศวินวิจิตร",
    role: "กรรมการผู้จัดการ, กรรมการ",
    image: "/images/subcommittee/User_shadow2.png",
    category: "executive",
  },
  {
    id: "e01",
    name: "นางวิไล วรรณมหินทร์",
    role: "ผู้จัดการทั่วไป สายงานบริหารและกำกับกิจการ",
    image: "/images/subcommittee/User_shadow_f.png",
    category: "executive",
  },
];

export default function Page() {
  const [active, setActive] = useState<TabId>("board");
  const [isChanging, setIsChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleMembers = useMemo(
    () => MEMBERS.filter((m) => m.category === active),
    [active]
  );

  const handleTabChange = (tabId: TabId) => {
    if (tabId === active) return;
    setIsChanging(true);
    setTimeout(() => {
      setActive(tabId);
      setIsChanging(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.7s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        .Video-image-parallax {
          transition: transform 0.8s ease-out;
        }

        .Video-image-parallax:hover {
          transform: scale(1.05);
        }

        .tab-indicator {
          position: relative;
          overflow: hidden;
        }

        .tab-indicator::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #34d399);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .tab-indicator.active::after {
          transform: scaleX(1);
        }

        .member-card {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .member-card:hover .member-image {
          transform: scale(1.08);
        }

        .member-card:hover .member-info {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .member-image {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .member-info {
          transition: all 0.3s ease;
        }

        .stagger-animation {
          animation-delay: calc(var(--index) * 0.05s);
        }

        .Video-content {
          opacity: 0;
        }

        .Video-content.mounted {
          animation: fadeInLeft 1s ease-out forwards;
        }

        .Video-bg-overlay {
          opacity: 0;
          animation: fadeIn 1.2s ease-out 0.2s forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        .tab-button {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-button:hover {
          transform: translateY(-2px);
        }

        .tab-button.active {
          animation: scaleIn 0.3s ease-out;
        }

        .section-container {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .section-container.changing {
          opacity: 0;
          transform: translateY(10px);
        }
      `}</style>

      <Video mounted={mounted} />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-16">
        <div className="mt-2 sm:mt-6">
          <h2 className="sr-only">เปลี่ยนหมวด</h2>
          <nav
            aria-label="แถบหมวด"
            className="sticky top-0 z-30 -mx-3 px-3 sm:static sm:mx-0 sm:px-0 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur border-b border-emerald-100"
            style={{
              animation: mounted
                ? "fadeInDown 0.6s ease-out 0.3s backwards"
                : "none",
            }}>
            <div className="inline-flex min-w-full sm:min-w-0 items-center gap-1 sm:gap-2 whitespace-nowrap py-2">
              <div className="inline-flex rounded-xl bg-emerald-50 p-1 ring-1 ring-emerald-200 w-full max-w-full overflow-x-auto">
                {TABS.map((t, index) => {
                  const isActive = t.id === active;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTabChange(t.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "tab-button px-3 py-2 text-sm rounded-lg transition flex-1 sm:flex-none",
                        isActive
                          ? "active bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-300"
                          : "text-gray-600 hover:text-emerald-700 hover:bg-white/50",
                      ].join(" ")}
                      style={{
                        animationDelay: `${0.4 + index * 0.1}s`,
                      }}>
                      <span className="relative">
                        {t.label}
                        {isActive && (
                          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-scaleIn" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <section
          className={`mt-3 sm:mt-6 rounded-2xl border border-emerald-300/60 bg-white/70 p-2 sm:p-6 section-container ${
            isChanging ? "changing" : ""
          }`}>
          <ul
            role="list"
            aria-live="polite"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {visibleMembers.map((m, index) => (
              <li
                key={m.id}
                className="member-card group overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-emerald-300/50 hover:-translate-y-1 stagger-animation"
                style={
                  {
                    "--index": index,
                  } as React.CSSProperties
                }>
                <div className="relative bg-white overflow-hidden">
                  <div className="relative w-full pt-[125%] bg-white">
                    {m.image ? (
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 50vw"
                        className="object-contain p-2 sm:p-4 member-image"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-gray-50 to-gray-100">
                        <span className="text-xs text-gray-400 animate-pulse-slow">
                          ไม่มีรูป
                        </span>
                      </div>
                    )}
                    {/* Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                <div className="member-info bg-gray-100/90 px-2 sm:px-3 py-2 text-center relative overflow-hidden">
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer" />
                  <p className="text-[12px] sm:text-sm font-medium leading-5 text-gray-900 relative z-10 transition-transform duration-300 group-hover:scale-105">
                    {m.name}
                  </p>
                  {m.role && (
                    <p className="mt-0.5 text-[10px] sm:text-xs text-gray-600 relative z-10 transition-all duration-300 group-hover:text-emerald-700">
                      {m.role}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Video({ mounted }: { mounted: boolean }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full">
        {/* ความสูงภาพพื้นหลัง */}
        <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] xl:h-[640px]">
          <div className="Video-image-parallax absolute inset-0">
            <Image
              src={Video_BG_URL}
              alt="background"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Animated gradient overlay */}
          <div className="Video-bg-overlay absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-transparent backdrop-blur-[1px]" />

          {/* Animated pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%)`,
              animation: mounted ? "pulse 4s ease-in-out infinite" : "none",
            }}
          />

          {/* วางคอนเทนต์ยึดมุมซ้ายบน */}
          <div className="absolute inset-0 flex items-start justify-start">
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
              {/* ระยะห่างจากด้านบน */}
              <div
                className={`pt-8 sm:pt-12 lg:pt-20 xl:pt-24 Video-content ${
                  mounted ? "mounted" : ""
                }`}>
                <h1 className="my-heading sm:text-[24px] md:text-[28px] font-extrabold leading-[1.2] tracking-tight text-emerald-700 relative inline-block">
                  <span className="relative z-10">{Video_TITLE}</span>
                  {/* Underline animation */}
                  <span
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                    style={{
                      width: mounted ? "100%" : "0",
                      transition: "width 1s ease-out 0.5s",
                    }}
                  />
                </h1>

                <p
                  className="mt-3 sm:mt-4 max-w-[760px] text-sm sm:text-base md:text-lg leading-relaxed text-gray-700"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.8s ease-out 0.8s",
                  }}>
                  {Video_DESC}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

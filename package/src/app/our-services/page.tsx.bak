"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

/* =========================================================
   🎛️ TUNING KNOBS – จูนค่าตามใจคุณ
   ========================================================= */
const CAROUSEL = {
  autoplayMs: 4200, // ระยะเวลา/สไลด์ (ms)
  dragThreshold: 0.18, // สัดส่วนความกว้างจอที่ต้องลากเกินเพื่อย้ายสไลด์
  ease: "cubic-bezier(.2,.8,.2,1)", // เส้นโค้ง easing
  parallax: 0.15, // ระดับ Parallax (0 = ปิด)
  scaleActive: 1.0, // สเกลภาพสไลด์ active
  scaleInactive: 0.96, // สเกลภาพสไลด์ข้างเคียง
  aspect: "aspect-[16/10]", // อัตราส่วนภาพ
};

/* =========================================================
   Smooth anchor scrolling with header offset (เดิม)
   ========================================================= */
function getHeaderOffset() {
  const el =
    (document.querySelector("[data-site-header]") as HTMLElement | null) ||
    (document.querySelector("header") as HTMLElement | null) ||
    null;
  return (el?.offsetHeight ?? 96) + 16;
}
function useHeaderOffset() {
  const [offset, setOffset] = React.useState(112);
  React.useEffect(() => {
    const update = () => setOffset(getHeaderOffset());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return offset;
}
function scrollToCentered(target: HTMLElement) {
  const section = (target.closest("section") as HTMLElement | null) || target;
  try {
    section.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  } catch {
    const r = section.getBoundingClientRect();
    const y =
      r.top + window.pageYOffset - window.innerHeight / 2 + r.height / 2;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

/* =========================================================
   Utilities
   ========================================================= */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(m.matches);
    onChange();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* =========================================================
   🔥 Advanced Carousel (Vanilla, no libs) – ลื่น เท่ ปรับแต่งได้
   ========================================================= */
function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const len = images?.length ?? 0;
  const [index, setIndex] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  const [drag, setDrag] = React.useState({ active: false, startX: 0, dx: 0 });
  const reduced = usePrefersReducedMotion();

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(true);

  // หยุดเล่นเมื่อเลื่อนพ้นหน้าจอ
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([en]) => setInView(en.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Autoplay (ไม่มี progress bar แล้ว จึงใช้ setInterval แบบเบาๆ)
  const playing = inView && len > 1 && !drag.active && !hover && !reduced;
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % len),
      CAROUSEL.autoplayMs
    );
    return () => clearInterval(t);
  }, [playing, len]);

  // Drag/Swipe
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ active: true, startX: e.clientX, dx: 0 });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.active) return;
    setDrag((d) => ({ ...d, dx: e.clientX - d.startX }));
  };
  const finishDrag = () => {
    if (!drag.active) return;
    const width = containerRef.current?.clientWidth || 1;
    const delta = drag.dx / width;
    let next = index;
    if (Math.abs(delta) > CAROUSEL.dragThreshold)
      next = delta > 0 ? index - 1 : index + 1;
    setIndex(((next % len) + len) % len);
    setDrag({ active: false, startX: 0, dx: 0 });
  };

  // Keyboard nav
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + len) % len);
    if (e.key === "ArrowRight") setIndex((i) => (i + 1) % len);
  };

  // ตำแหน่งแทร็ค + เอฟเฟกต์ parallax/scale
  const width = containerRef.current?.clientWidth || 1;
  const offsetPct = drag.active ? (drag.dx / width) * 100 : 0;
  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${-index * 100 + offsetPct}%,0,0)`,
    transition: drag.active ? "none" : `transform 700ms ${CAROUSEL.ease}`,
    willChange: "transform",
  };

  // ปุ่มลูกศรแบบ chevron gradient
  const ArrowBtn = ({
    dir,
    onClick,
  }: {
    dir: "left" | "right";
    onClick: () => void;
  }) => (
    <button
      aria-label={dir === "left" ? "previous" : "next"}
      onClick={onClick}
      className={`absolute ${
        dir === "left" ? "left-2" : "right-2"
      } top-1/2 -translate-y-1/2 w-12 h-16 grid place-items-center rounded-xl bg-black/25 md:bg-transparent shadow-[0_10px_24px_rgba(0,0,0,.25)] backdrop-blur-sm hover:scale-105 transition`}
    >
      <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
        <defs>
          <linearGradient id={`g-${dir}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EEF2F3" />
            <stop offset="1" stopColor="#86A5A2" />
          </linearGradient>
        </defs>
        <path
          d={dir === "right" ? "M3 3 L17 18 L3 33" : "M17 3 L3 18 L17 33"}
          stroke={`url(#g-${dir})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0px 2px 2px rgba(0,0,0,.35))"
        />
      </svg>
    </button>
  );

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* แทร็คสไลด์ */}
      <div
        className={`relative ${CAROUSEL.aspect}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={() => drag.active && finishDrag()}
        style={{
          touchAction: "pan-y",
          cursor: drag.active ? "grabbing" : "grab",
        }}
      >
        <div className="absolute inset-0 flex" style={trackStyle}>
          {images.map((src, idx) => {
            const isActive = idx === index;
            const imgStyle: React.CSSProperties = {
              transform: `translate3d(${
                drag.active ? -offsetPct * CAROUSEL.parallax : 0
              }%,0,0) scale(${
                isActive ? CAROUSEL.scaleActive : CAROUSEL.scaleInactive
              })`,
              transition: drag.active
                ? "none"
                : `transform 700ms ${CAROUSEL.ease}`,
              willChange: "transform",
            };
            return (
              <div key={src} className="relative w-full shrink-0">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  style={imgStyle}
                  priority={idx === 0}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ลูกศรนำทาง */}
      {len > 1 && (
        <>
          <ArrowBtn
            dir="left"
            onClick={() => setIndex((i) => (i - 1 + len) % len)}
          />
          <ArrowBtn
            dir="right"
            onClick={() => setIndex((i) => (i + 1) % len)}
          />
        </>
      )}

      {/* จุดบอกตำแหน่ง (Bullets) */}
      {len > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              aria-label={`ไปสไลด์ที่ ${idx + 1}`}
              onClick={() => setIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition
                ${
                  idx === index
                    ? "bg-white shadow-[0_0_0_2px_rgba(0,0,0,.25)] scale-110" // active (ขาว + ขอบจาง)
                    : "bg-white/60 hover:bg-white/80"
                }                                  // inactive
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =============================
   CONFIG – Replace image paths
   ============================= */
const FEATURES = [
  {
    title: "การพัฒนาและออกแบบ",
    img: "/images/process/feature-design.jpg",
    href: "#design",
  },
  {
    title: "เตรียมพิมพ์",
    img: "/images/process/feature-prepress.jpg",
    href: "#prepress",
  },
  {
    title: "การพิมพ์",
    img: "/images/process/feature-press.jpg",
    href: "#press",
  },
  {
    title: "หลังพิมพ์",
    img: "/images/process/feature-postpress.jpg",
    href: "#postpress",
  },
] as const;

// === Multiple images per section (carousel-ready) ===
const SECTIONS: {
  id: string;
  title: string;
  images: string[];
  body: React.ReactNode;
}[] = [
  {
    id: "design",
    title: "การพัฒนาและออกแบบ",
    images: [
      "/images/process/design.jpg",
      "/images/process/design-2.jpg",
      "/images/process/design-3.jpg",
    ],
    body: (
      <>
        ความต้องการของลูกค้า คือ หัวใจของการออกแบบ
        ทีมงานด้านการออกแบบและพัฒนาของเรา
        พร้อมใช้ซอฟต์แวร์มาตรฐานอุตสาหกรรมเพื่อให้ได้ต้นแบบที่แม่นยำ
        ก่อนส่งต่อสู่การผลิตจริง เน้นฟังก์ชันการใช้งาน ความแข็งแรงของโครงสร้าง
        และภาพลักษณ์สินค้าให้โดดเด่นตามความต้องการของแบรนด์
      </>
    ),
  },
  {
    id: "prepress",
    title: "เตรียมพิมพ์",
    images: [
      "/images/process/prepress.jpg",
      "/images/process/prepress-2.jpg",
      "/images/process/prepress-3.jpg",
    ],
    body: (
      <>
        ขั้นตอนการเตรียมพิมพ์ เราพัฒนาโดยการนำเครื่องพิมพ์เพลทสมัยใหม่ (CTP)
        มาใช้เพื่อลดขั้นตอน เพิ่มความแม่นยำ และความสม่ำเสมอของงานพิมพ์ทุกชิ้น
        ตรวจสอบไฟล์สี มาตรฐานภาพ และการวางตัวอักษร
        ก่อนเข้าสู่เครื่องพิมพ์จริงเพื่อคุณภาพสูงสุด
      </>
    ),
  },
  {
    id: "press",
    title: "การพิมพ์",
    images: [
      "/images/process/press.jpg",
      "/images/process/press-2.jpg",
      "/images/process/press-3.jpg",
    ],
    body: (
      <>
        เพื่อให้ตอบโจทย์งานที่หลากหลาย เรามีเครื่องพิมพ์ที่สามารถพิมพ์ได้ตั้งแต่
        1–8 สี พร้อมระบบเคลือบเงา เคลือบด้าน และเคลือบน้ำยาแบบต่าง ๆ
        รองรับทั้งหมึกน้ำและหมึกยูวี เพื่อสีสันที่สวยงาม คมชัด
        และเสถียรตลอดทั้งงาน
      </>
    ),
  },
  {
    id: "postpress",
    title: "หลังพิมพ์",
    images: [
      "/images/process/postpress.jpg",
      "/images/process/postpress-2.jpg",
      "/images/process/postpress-3.jpg",
    ],
    body: (
      <>
        เราให้บริการงานหลังพิมพ์ครบวงจร เช่น เคลือบยูวี เคลือบด้าน งานปั๊มนูน
        งานปั๊มฟอยล์ งานไดคัท พับ ปะกาว และเข้าเล่ม
        เพื่อยกระดับความสวยงามและความทนทานของบรรจุภัณฑ์ให้โดดเด่น
        และสอดคล้องกับภาพลักษณ์ของแบรนด์
      </>
    ),
  },
];

/* ===============
   UI Subcomponents
   =============== */
function SectionHeading({ label, id }: { label: string; id?: string }) {
  const offset = useHeaderOffset();
  return (
    <h2
      id={id}
      style={{ scrollMarginTop: offset }}
      className="text-2xl md:text-4xl font-extrabold tracking-tight text-neutral-900"
    >
      {label}
    </h2>
  );
}

function FeatureTile({
  title,
  img,
  href,
}: {
  title: string;
  img: string;
  href: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        const anchor = href.startsWith("#") ? href : `#${href}`;
        const el = document.querySelector(anchor) as HTMLElement | null;
        if (!el) return; // let default happen if not found
        e.preventDefault();
        scrollToCentered(el);
        history.replaceState(null, "", anchor);
      }}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition hover:shadow-lg"
    >
      <Image
        src={img}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        priority
      />
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/20">
          Process
        </div>
        <div className="mt-2 text-white drop-shadow-sm">
          <div className="text-xl md:text-2xl font-extrabold">{title}</div>
        </div>
      </div>
    </a>
  );
}

function ProcessSection({
  id,
  title,
  images,
  body,
}: {
  id: string;
  title: string;
  images: string[];
  body: React.ReactNode;
}) {
  return (
    <section className="relative py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          {/* Image / Carousel */}
          <div className="relative md:col-span-6">
            <Carousel images={images} alt={title} />
          </div>

          {/* Content */}
          <div className="md:col-span-6">
            <SectionHeading label={title} id={id} />
            <p className="mt-4 text-neutral-600 leading-7 md:text-[17px]">
              {body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======
   PAGE
   ====== */
export default function ProcessPage() {
  return (
    <main className="bg-white scroll-smooth">
      {/* ===== Feature banner (4 tiles) ===== */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <FeatureTile key={f.title} {...f} />
            ))}
          </div>

          {/* Intro paragraph */}
          <div className="mt-8 md:mt-10">
            <p className="text-neutral-700 leading-7 md:text-[17px]">
              บริษัทไทยการพิมพ์และบรรจุภัณฑ์
              มุ่งเน้นคุณภาพและความละเอียดในทุกขั้นตอนตั้งแต่การพัฒนา ออกแบบ
              เตรียมพิมพ์ การพิมพ์ จนถึงหลังพิมพ์
              เพื่อให้ลูกค้าได้รับผลงานที่ตรงตามความต้องการ และมาตรฐานอุตสาหกรรม
              พร้อมทีมบริการที่ดูแลคุณตลอดกระบวนการอย่างใกล้ชิด
            </p>
          </div>
        </div>
      </section>

      {/* ===== Process sections ===== */}
      {SECTIONS.map((s) => (
        <ProcessSection key={s.id} {...s} />
      ))}

      {/* ===== CTA / Footer band (optional) ===== */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="rounded-2xl bg-white p-6 md:p-10 shadow-sm ring-1 ring-black/5">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-8">
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-900">
                  สนใจงานพิมพ์หรือบรรจุภัณฑ์สำหรับสินค้าแบรนด์ของคุณ?
                </h3>
                <p className="mt-2 text-neutral-600">
                  พูดคุยกับผู้เชี่ยวชาญของเราเพื่อวางแผนงาน ตั้งแต่งบประมาณ
                  วัสดุ ไปจนถึงการรีดประสิทธิภาพ
                  ในการผลิตให้คุ้มค่าและสวยงามที่สุด
                </p>
              </div>
              <div className="md:col-span-4">
                <div className="flex md:justify-end">
                  <Link
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-xl bg-[#D6001C] px-5 py-3 text-white font-semibold shadow-sm hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6001C]/40"
                  >
                    ติดต่อเรา
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

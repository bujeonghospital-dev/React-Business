"use client";
import React, { useEffect, useRef } from "react";
import "animate.css";

// ====== Data ======
const cards = [
  {
    staticImg: "/images/InvestorRelations/Products-screen-1-img.png",
    animatedImg: "/images/InvestorRelations/Products-screen-1.gif",
    title: "การพัฒนาและการออกแบบ",
  },
  {
    staticImg: "/images/InvestorRelations/Products-screen-2-img.png",
    animatedImg: "/images/InvestorRelations/Products-screen-2.gif",
    title: "เตรียมพิมพ์",
  },
  {
    staticImg: "/images/InvestorRelations/Products-screen-3-img.png",
    animatedImg: "/images/InvestorRelations/Products-screen-3.gif",
    title: "การพิมพ์",
  },
  {
    staticImg: "/images/InvestorRelations/Products-screen-4-img.png",
    animatedImg: "/images/InvestorRelations/Products-screen-4.gif",
    title: "หลังพิมพ์",
  },
];

// ====== Component ======
export default function Dedicated() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // --- เติม prefix animate__ อัตโนมัติ ---
    const normalizeAni = (ani: string) => {
      const tokens = ani.trim().split(/\s+/).filter(Boolean);
      const out: string[] = [];
      let usesAnimate = false;

      tokens.forEach((t) => {
        if (t.startsWith("animate__")) {
          out.push(t);
          usesAnimate = true;
        } else if (t.startsWith("fx-")) {
          out.push(t);
        } else if (
          /^(fadeIn|fadeInUp|fadeInDown|fadeInLeft|fadeInRight|zoomIn|slideInUp|slideInDown|backInDown|backInUp)$/i.test(
            t
          )
        ) {
          out.push(`animate__${t}`);
          usesAnimate = true;
        } else if (/^(slow|slower)$/i.test(t)) {
          out.push(`animate__${t}`);
          usesAnimate = true;
        } else if (/^delay-\d{2,4}ms$/i.test(t)) {
          out.push(`animate__${t}`);
          usesAnimate = true;
        } else {
          out.push(t);
        }
      });

      if (usesAnimate && !out.includes("animate__animated")) {
        out.push("animate__animated");
      }
      return out;
    };

    const els = root.querySelectorAll<HTMLElement>("[data-ani]");
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => {
        const classes = normalizeAni(el.dataset.ani || "");
        el.classList.add(...classes);
        el.classList.remove("opacity-0");
        el.style.transform = "none";
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          const classes = normalizeAni(el.dataset.ani || "");
          if (entry.isIntersecting) {
            el.classList.remove(...classes);
            void el.offsetWidth; // restart
            el.classList.add(...classes);
            el.classList.remove("opacity-0");
          } else {
            el.classList.remove(...classes);
            el.classList.add("opacity-0");
          }
        });
      },
      // เริ่มก่อนถึง viewport เล็กน้อย ให้แอนิเมชันจบพอดีกับจังหวะเลื่อน
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => {
      el.classList.add("opacity-0");
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  // ——— ปรับความนุ่มและความช้าแบบรวม ———
  const motionVars = {
    ["--animate-duration" as any]: "0.7s", // ใส่ "slow" => ~1.4s
    ["--animate-delay" as any]: "0s",
  } as React.CSSProperties;

  // สเต็ปหน่วงให้ค่อย ๆ ทยอยโผล่
  const baseDelay = 150; // เดิม 40
  const step = 120; // เดิม 60

  return (
    <section
      ref={sectionRef}
      data-ded
      className="relative bg-cover bg-center dark:bg-darkmode overflow-hidden py-10"
      style={motionVars}>
      <div className="awe-parallax awe-static" />
      <div className="overlay-color-1" />

      <div className="mx-auto w-full max-w-[1400px] px-4">
        {/* หัวข้อ: ช้าลงและนุ่ม */}
        <h2 className="tpp-section-title opacity-0" data-ani="fadeInUp slow">
          สินค้าและบริการของเรา
        </h2>

        <div className="mt-6 md:mt-8" />

        {/* การ์ด: เคลื่อนช้า เนียน และสเต็ปชัด */}
        <div
          className="
            grid justify-center
            gap-2 md:gap-3
            grid-cols-[repeat(auto-fit,minmax(320px,320px))]
          ">
          {cards.map((item, i) => (
            <div
              key={i}
              className="
                group relative w-[320px] h-[420px]
                shadow-lg rounded-[16px] overflow-hidden cursor-pointer
                will-change-[transform,opacity] opacity-0
                transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)]
              "
              data-ani="fadeInUp slow"
              style={{ animationDelay: `${baseDelay + i * step}ms` }}>
              {/* animated background as CSS background (fills container reliably) */}
              {item.animatedImg && (
                <div
                  className="absolute inset-0 bg-center bg-cover z-0"
                  style={{ backgroundImage: `url(${item.animatedImg})` }}
                  aria-hidden="true"
                />
              )}

              {/* static image as overlay background (covers fully, fades on hover) */}
              <div
                className={`
                  absolute inset-0 bg-center bg-cover z-10
                  transition-opacity duration-500 ease-[cubic-bezier(.22,.61,.36,1)]
                  ${item.animatedImg ? "md:group-hover:opacity-0" : ""}
                `}
                style={{ backgroundImage: `url(${item.staticImg})` }}
                role="img"
                aria-label={item.title}
              />

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent z-20 opacity-0"
                data-ani="fadeIn slow"
                style={{ animationDelay: `${baseDelay + i * step + 120}ms` }}
              />

              <p
                className="
                  absolute bottom-0 left-0 m-3
                  text-white text-xl md:text-2xl
                  font-extrabold drop-shadow-lg z-30 opacity-0
                "
                data-ani="fadeInUp slow"
                style={{
                  animationDelay: `${baseDelay + i * step + 80}ms`,
                  textShadow: `
                    2px 2px 6px rgba(0,0,0,0.8),
                    0px 0px 12px #fff,
                    0px 4px 16px rgba(0,0,0,0.8)
                  `,
                }}>
                {item.title}
              </p>

              <div className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:-translate-y-0.5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

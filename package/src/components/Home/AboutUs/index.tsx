"use client";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";
// ถ้าอยากใช้ animate.css ร่วมด้วยก็ import ได้: import "animate.css";
import "animate.css";

const Aboutus = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    // เติม prefix ให้ animate.css อัตโนมัติ และปล่อย fx-* ตามเดิม
    const normalizeAni = (ani: string) => {
      const tokens = ani.trim().split(/\s+/).filter(Boolean);
      const out: string[] = [];
      let usesAnimate = false;

      tokens.forEach((t) => {
        if (t.startsWith("animate__")) {
          out.push(t);
          usesAnimate = true;
        } else if (t.startsWith("fx-")) {
          out.push(t); // ของเก่า
        } else if (
          /^(fadeIn|fadeInUp|fadeInDown|fadeInLeft|fadeInRight|zoomIn|slideInUp|slideInDown|backInDown|backInUp)$/i.test(
            t
          )
        ) {
          out.push(`animate__${t}`);
          usesAnimate = true;
        } else if (/^(fast|faster|slow|slower)$/i.test(t)) {
          out.push(`animate__${t}`);
          usesAnimate = true;
        } else if (/^delay-\d{2,4}ms$/i.test(t)) {
          out.push(`animate__${t}`);
          usesAnimate = true;
        } else {
          out.push(t); // ปล่อยอื่น ๆ ตามเดิม
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
            // รีสตาร์ทแอนิเมชันให้ชัวร์
            el.classList.remove(...classes);
            // force reflow (บางเบราว์เซอร์จำเป็นเพื่อเล่นใหม่)
            void el.offsetWidth;
            el.classList.add(...classes);
            el.classList.remove("opacity-0");
          } else {
            el.classList.remove(...classes);
            el.classList.add("opacity-0");
          }
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-ani="fx-kenburns-in fx-kenburns-drift"
      className="about-bg-image relative bg-cover bg-center md:overflow-hidden dark:bg-neutral-900">
      <div className="absolute inset-0 md:hidden pointer-events-none bg-gradient-to-r from-white/70 to-white/0 dark:from-black/50 dark:to-transparent" />

      <div className="relative mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-12 items-center min-h-[60svh] py-12 sm:py-16 lg:py-20">
          <div className="col-span-12 md:col-start-1 md:col-end-8 lg:col-start-1 lg:col-end-7 xl:col-start-1 xl:col-end-7 min-w-0">
            <div className="w-full max-w-[clamp(300px,90vw,550px)] md:max-w-none">
              {/* หัวข้อ: คลิปรีวีล + เส้นใต้กวาด */}
              <strong
                className="block text-[clamp(1.4375rem,4.6vw,2.0625rem)] font-bold leading-tight custom-Charcoal-gray dark:text-neutral-50 [text-wrap:balance] opacity-0"
                data-ani="fadeInUp faster delay-200ms">
                <span>เกี่ยวกับ</span>&nbsp; ไทยบรรจุภัณฑ์และการพิมพ์
              </strong>
              <span
                aria-hidden
                className="fx-underline mt-2 block opacity-0"
                data-ani="fx-underline-in"
              />

              <p
                className="mt-4 text-[clamp(1.1375rem,3.8vw,1.1875rem)] leading-7 break-words custom-Ash-gray dark:text-neutral-300 opacity-0"
                data-ani="fx-subtle-in-up"
                style={{ animationDelay: "120ms" }}>
                <b className="text-red-700">
                  TPP หรือ บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)
                </b>
                &nbsp; ผู้นำด้านการผลิตและออกแบบบรรจุภัณฑ์กระดาษลูกฟูก
                และกล่องกระดาษแข็ง พร้อมงานพิมพ์ออฟเซ็ทคุณภาพสูง
                ด้วยประสบการณ์ยาวนานกว่า 40 ปี
                เรามุ่งมั่นพัฒนานวัตกรรมบรรจุภัณฑ์และเทคโนโลยีการผลิตที่ทันสมัย
                เพื่อตอบโจทย์ลูกค้าในอุตสาหกรรมต่างๆ เช่น อาหาร, เครื่องดื่ม,
                และยานยนต์ โดยยึดมั่นในมาตรฐานสากล ISO 9001:2015 และ GMP/HACCP
                พร้อมทั้งให้ความสำคัญกับ บรรจุภัณฑ์ที่เป็นมิตรกับสิ่งแวดล้อม
                เพื่อการเติบโตอย่างยั่งยืน
              </p>

              {/* ลิงก์: เลื่อนเข้าขวา (ดีเลย์ต่อเนื่อง) */}
              <Link
                href="/about-history"
                className="mt-4 inline-flex items-center gap-2 text-primary font-semibold hover:underline text-[clamp(1.1375rem,3.8vw,1.1875rem)] opacity-0"
                data-ani="fx-link-in-right"
                style={{ animationDelay: "220ms" }}>
                อ่านต่อ{" "}
                <Icon icon="tabler:chevron-right" width={20} height={20} />
              </Link>
            </div>
          </div>

          {/* ช่องว่างขวา: แสดงเฉพาะ md+ */}
          <div className="hidden md:block md:col-span-5 lg:col-span-6 xl:col-span-6" />
        </div>
      </div>
    </section>
  );
};

export default Aboutus;

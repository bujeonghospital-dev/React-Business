"use client";
// src/components/GoGreenSection.tsx
import Image from "next/image";
import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
// ===== Types =====
type Feature = { icon: string; title: string; lines?: string[] };
// ===== Animation helpers =====
function useAnims() {
  const prefersReduced = useReducedMotion();
  const dur = (d: number) => (prefersReduced ? 0 : d);
  const sectionFade: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: dur(0.7), ease: [0.22, 1, 0.36, 1] },
    },
  };
  const slideRight: Variants = {
    hidden: { opacity: 0, x: 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: dur(0.9), ease: [0.22, 1, 0.36, 1] },
    },
  };
  const imageZoomIn: Variants = {
    hidden: { opacity: 0, y: 16, scale: 1 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: dur(1.1), ease: [0.22, 1, 0.36, 1] },
    },
  };
  const gridStagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.16,
        delayChildren: prefersReduced ? 0 : 0.12,
      },
    },
  };
  const cardUp: Variants = {
    hidden: { opacity: 0, y: 26, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: dur(0.7), ease: [0.22, 1, 0.36, 1] },
    },
  };
  return {
    prefersReduced,
    sectionFade,
    slideRight,
    imageZoomIn,
    gridStagger,
    cardUp,
  };
}
// ===== Component =====
export default function GoGreenSection({
  imageSrc = "/images/go-green/go_green_home_page_4.png",
  imageAlt = "Go Green",
  title = `" ขับเคลื่อนการเติมโตอย่างยั่งยืน เพื่อธุรกิจ สังคม และ โลกใบนี้ " `,
  subtitle = ``,
  features = SAMPLE_FEATURES,
  imageFit = "cover", // "cover" | "contain"
  /**
   * Responsive helpers
   * - textFirstOnMobile: put text above image on small screens
   * - imagePosition: on md+ screens, place the image on the left or right
   */
  textFirstOnMobile = false,
  imagePosition = "left", // "left" | "right"
}: {
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  features?: Feature[];
  imageFit?: "cover" | "contain";
  textFirstOnMobile?: boolean;
  imagePosition?: "left" | "right";
}) {
  const { sectionFade, slideRight, imageZoomIn, gridStagger, cardUp } =
    useAnims();
  // ------- responsive ordering helpers -------
  const imageColOrder = `${textFirstOnMobile ? "order-2" : "order-1"} ${
    imagePosition === "left" ? "md:order-1" : "md:order-2"
  }`;
  const textColOrder = `${textFirstOnMobile ? "order-1" : "order-2"} ${
    imagePosition === "left" ? "md:order-2" : "md:order-1"
  }`;
  return (
    <section
      aria-label="Go Green – sustainability overview"
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url('${imageSrc}')`,
        backgroundSize: imageFit === "contain" ? "contain" : "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative min-h-[60svh] md:min-h-[calc(100svh-112px)]">
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* Text + feature cards column (order responsive) */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2, margin: "-10% 0% -10% 0%" }}
            className={`relative flex h-full flex-col justify-center md:justify-start gap-4 bg-neutral-200/70 p-4 sm:p-6 md:p-10 xl:p-16 ${textColOrder}`}
          >
            <motion.div
              variants={sectionFade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.35 }}
              className="inline-block text-white text-center p-0 shadow-none ring-0"
            >
              <h4
                className="font-extrabold leading-tight text-black text-center text-balance"
                style={{
                  fontSize: "clamp(1.125rem, 2.8vw, 2.625rem)", // ~18px → ~42px
                  textShadow: "0 1px 6px rgba(0,0,0,0.25)",
                }}
              >
                {title ||
                  '" ขับเคลื่อนการเติบโตอย่างยั่งยืน เพื่อธุรกิจ สังคม และโลกใบนี้ "'}
              </h4>
              {subtitle && (
                <p className="mt-2 text-sm sm:text-base md:text-lg/relaxed opacity-95 text-pretty">
                  {subtitle}
                </p>
              )}
            </motion.div>
            <motion.div
              variants={gridStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="mt-4 sm:mt-6 md:mt-8 grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
            >
              {features.map((f, i) => (
                <motion.article
                  key={`${f.title}-${i}`}
                  variants={cardUp}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileFocus={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  tabIndex={0}
                  role="group"
                  aria-label={f.title}
                  className="h-full rounded-2xl bg-white p-4 sm:p-5 md:p-7 text-center shadow ring-1 ring-black/5 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
                >
                  <div className="relative mx-auto mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 md:h-20 md:w-20 will-change-transform">
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={f.icon}
                        alt={f.title}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </motion.div>
                  </div>
                  <div className="text-sm sm:text-base md:text-xl font-extrabold text-gray-800 group-focus:text-cyan-700">
                    {f.title}
                  </div>
                  {f.lines?.map((t, idx) => (
                    <div
                      key={idx}
                      className="text-xs sm:text-sm md:text-base leading-snug text-gray-600"
                    >
                      {t}
                    </div>
                  ))}
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
// ===== Sample data (unchanged) =====
export const SAMPLE_FEATURES: Feature[] = [
  {
    icon: "/images/go-green/icons/solar.png",
    title: "Certified Surgeons",
    lines: ["แพทย์ศัลยกรรมเฉพาะทาง", "มาตรฐานสากล"],
  },
  {
    icon: "/images/go-green/icons/energy.png",
    title: "Modern Equipment",
    lines: ["เครื่องมือทันสมัย", "ได้มาตรฐานสากล"],
  },
  {
    icon: "/images/go-green/icons/co2.png",
    title: "Safety First",
    lines: ["ความปลอดภัยสูงสุด", "มาตรฐานโรงพยาบาล"],
  },
  {
    icon: "/images/go-green/icons/tree.png",
    title: "1:1 Consultation",
    lines: ["ปรึกษาแบบ 1:1", "กับแพทย์โดยตรง"],
  },
  {
    icon: "/images/go-green/icons/truck_1.png",
    title: "Aftercare Support",
    lines: ["ดูแลหลังผ่าตัด", "ติดตามตลอดการรักษา"],
  },
  {
    icon: "/images/go-green/icons/property-document_14001_1.png",
    title: "Licensed Clinic",
    lines: ["ได้รับอนุญาตถูกต้อง", "ฆสพ.สบส : ๔๖๒๗ / ๒๕๖๘"],
  },
];

import React, { useEffect, useMemo, useState } from "react";
import CardItem from "./CardItem";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DEFAULT_CARDS_PER_PAGE = 4;
const CARD_WIDTH_CLAMP = "clamp(280px, 88vw, 340px)"; // มือถือเต็มจอ, จอใหญ่ไม่เกิน 340px

function computeCardsPerPage(w: number) {
  if (w < 640) return 1; // < sm (mobile)
  if (w < 768) return 2; // sm (small tablet)
  if (w < 1024) return 2; // md (tablet)
  if (w < 1280) return 3; // lg (small desktop)
  return 4; // ≥ xl (large desktop)
}

const TabPage = () => {
  const newsData = [
    {
      date: "15 สิงหาคม 2567",
      title:
        "ซ้อมดับเพลิงประจำปี เพื่อเสริมสร้างความพร้อมรับมือเหตุฉุกเฉินอย่างมีประสิทธิภาพ สร้างจิตสำนึกด้านความปลอดภัย และความร่วมมือในการป้องกันอัคคีภัยในสถานที่ทำงาน",
      image: "/images/New/Annual_Fire_Drill.png",
    },
    {
      date: "23 พฤษภาคม 2568",
      title:
        "ทำบุญประจำปี 2568 เนื่องในโอกาสก้าวเข้าสู่ปีที่ 37 แห่งการดำเนินธุรกิจ  ได้จัดกิจกรรมทำบุญประจำปี ณ บริเวณโรงอาหาร เพื่อเสริมสิริมงคลแก่คณะผู้บริหารและพนักงาน 23 พฤษภาคม 2568",
      image: "/images/New/Company_Merit-Making_Ceremony.png",
    },
    {
      date: "1 กรกฎาคม 2568",
      title:
        "กิจกรรมสวัสดิการ “แจกสิ่งของอุปโภคบริโภค” ประจำไตรมาส 2/2568   TPP จัดกิจกรรมมอบสิ่งของอุปโภคบริโภคให้แก่พนักงาน เพื่อส่งเสริมสวัสดิการ สร้างขวัญและกำลังใจ วันที่ 1 กรกฎาคม 2568",
      image: "/images/New/Distribution_of_Consumer_Goods.png",
    },
    {
      date: "06 พฤษภาคม 2568",
      title:
        "ประชุมคณะกรรมการบริหาร – รวมพลังขับเคลื่อนองค์กรสู่ความสำเร็จ เสริมสร้างวิสัยทัศน์ร่วม และกำหนดทิศทางการเติบโตอย่างยั่งยืน",
      image: "/images/New/Board_of_Directors_Meeting.png",
    },
    {
      date: "03 เมษายน 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "03 เมษายน 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "03 เมษายน 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "03 เมษายน 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
  ];

  const articleData = [
    {
      date: "13 มิถุนายน 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "06 มิถุนายน 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "30 พฤษภาคม 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "23 พฤษภาคม 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
    {
      date: "23 พฤษภาคม 2568",
      title:
        "xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxx",
      image: "/images/New/Dev_Size.png",
    },
  ];

  const [activeTab, setActiveTab] = useState<"news" | "article">("news");
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [cardsPerPage, setCardsPerPage] = useState(DEFAULT_CARDS_PER_PAGE);

  // คำนวณจำนวนการ์ดต่อหน้าตามขนาดหน้าต่าง
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      setCardsPerPage(computeCardsPerPage(window.innerWidth));
    };
    update();
    let t: number | undefined;
    const onResize = () => {
      clearTimeout(t);
      // debounce เล็กน้อย กันกระพริบ
      t = window.setTimeout(update, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const data = activeTab === "news" ? newsData : articleData;

  // max index ตามจำนวนการ์ดต่อหน้า
  const maxIndex = useMemo(
    () => Math.max(0, data.length - cardsPerPage),
    [data.length, cardsPerPage]
  );

  // รีเซ็ต active ใบแรกเมื่อเปลี่ยนหน้า/แท็บ
  useEffect(() => {
    setActiveIndex(0);
  }, [slideIndex, activeTab]);

  // รักษา slideIndex ให้ไม่เกิน maxIndex เมื่อหน้าจอ/แท็บเปลี่ยน
  useEffect(() => {
    setSlideIndex((i) => (i > maxIndex ? maxIndex : i));
  }, [maxIndex, activeTab]);

  // Auto slide with smooth transition
  useEffect(() => {
    if (paused || maxIndex === 0) return;
    const id = setInterval(() => {
      setDirection("right");
      setSlideIndex((i) => {
        const nextIndex = i >= maxIndex ? 0 : i + 1;
        // Reset active index for smooth transition
        if (nextIndex === 0) {
          setTimeout(() => setActiveIndex(0), 150);
        }
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  return (
    <div className="w-full px-2 md:px-4 max-w-6xl mx-auto relative">
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6 mt-2">
        <button
          className={`px-6 py-2 font-bold text-base tab-button-new ${
            activeTab === "news" ? "active text-red-600" : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("news");
            setDirection("right");
            setSlideIndex(0);
            setActiveIndex(0);
          }}>
          ข่าวสารและกิจกรรม
        </button>
        <button
          className={`px-6 py-2 font-bold text-base tab-button-new ${
            activeTab === "article" ? "active text-red-600" : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("article");
            setSlideIndex(0);
            setActiveIndex(0);
          }}>
          บทความ
        </button>
      </div>

      {/* Slider */}
      <div
        className="
            relative flex items-center justify-center min-h-[420px] sm:min-h-[440px] lg:min-h-[460px]
            overflow-visible px-2 sm:px-4 lg:px-16
            [--arrow-shift:0]            
            lg:[--arrow-shift:240%]
          "
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}>
        {/* Left Arrow - Desktop Only */}
        <button
          className="
              absolute left-0 top-1/2 -translate-y-1/2
              -translate-x-[var(--arrow-shift)]
              z-20 nav-button
              hidden lg:flex
              bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
              text-white
              w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
              items-center justify-center
              rounded-full shadow-xl
              border-2 border-white/20
              disabled:opacity-30 disabled:cursor-not-allowed
              backdrop-blur-sm
            "
          onClick={() => {
            setDirection("left");
            setSlideIndex((i) => Math.max(0, i - 1));
            setActiveIndex(0);
          }}
          disabled={slideIndex === 0}
          aria-label="ก่อนหน้า">
          <FaChevronLeft
            size={16}
            className="md:!hidden transition-transform group-hover:-translate-x-0.5"
          />
          <FaChevronLeft
            size={20}
            className="hidden md:!block lg:!hidden transition-transform group-hover:-translate-x-0.5"
          />
          <FaChevronLeft
            size={24}
            className="hidden lg:!block transition-transform group-hover:-translate-x-0.5"
          />
        </button>

        {/* Track */}
        <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-7 w-full justify-center track-container">
          {data
            .slice(slideIndex, slideIndex + cardsPerPage)
            .map((item, idx) => {
              const isActive = activeIndex === idx;
              const isHovered = hoverIndex === idx;
              const animationClass =
                direction === "right" ? "slide-in-right" : "slide-in-left";

              return (
                <div
                  key={slideIndex + idx}
                  className={animationClass}
                  style={{
                    width: CARD_WIDTH_CLAMP,
                    minWidth: CARD_WIDTH_CLAMP,
                    maxWidth: "95vw",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}>
                  <CardItem
                    {...item}
                    active={isActive}
                    hovered={isHovered && !isActive}
                    direction={direction}
                  />
                </div>
              );
            })}
        </div>

        {/* Right Arrow - Desktop Only */}
        <button
          className="
              absolute right-0 top-1/2 -translate-y-1/2
              translate-x-[var(--arrow-shift)]
              z-20 nav-button
              hidden lg:flex
              bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
              text-white
              w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
              items-center justify-center
              rounded-full shadow-xl
              border-2 border-white/20
              disabled:opacity-30 disabled:cursor-not-allowed
              backdrop-blur-sm
            "
          onClick={() => {
            setDirection("right");
            setSlideIndex((i) => Math.min(maxIndex, i + 1));
            setActiveIndex(0);
          }}
          disabled={slideIndex === maxIndex}
          aria-label="ถัดไป">
          <FaChevronRight
            size={16}
            className="md:!hidden transition-transform group-hover:translate-x-0.5"
          />
          <FaChevronRight
            size={20}
            className="hidden md:!block lg:!hidden transition-transform group-hover:translate-x-0.5"
          />
          <FaChevronRight
            size={24}
            className="hidden lg:!block transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-8 w-full py-4">
        <div className="flex justify-center items-center gap-2 md:gap-3">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              aria-label={`ไปหน้า ${i + 1}`}
              aria-current={slideIndex === i}
              onClick={() => {
                setDirection(i > slideIndex ? "right" : "left");
                setSlideIndex(i);
                setActiveIndex(0);
              }}
              className={`dot-nav p-2 ${slideIndex === i ? "active" : ""}`}>
              <span
                className={
                  slideIndex === i
                    ? "block w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg ring-2 ring-red-200 ring-offset-2 ring-offset-white"
                    : "block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gray-300 hover:bg-gray-400"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-6">
        <button className="ir-btn ir-btn-glow">ดูทั้งหมด</button>
      </div>
      <br />
    </div>
  );
};

export default TabPage;

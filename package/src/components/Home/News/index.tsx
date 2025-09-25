import React, { useEffect, useMemo, useState } from "react";
import CardItem from "./CardItem";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "animate.css";

const DEFAULT_CARDS_PER_PAGE = 4;
const CARD_WIDTH_CLAMP = "clamp(220px, 86vw, 320px)"; // มือถือเต็มจอ, จอใหญ่ไม่เกิน 320px

function computeCardsPerPage(w: number) {
  if (w < 640) return 1; // < sm
  if (w < 1024) return 2; // sm - md
  if (w < 1280) return 3; // md - lg
  return 4; // ≥ lg
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

  // Auto slide
  useEffect(() => {
    if (paused || maxIndex === 0) return;
    const id = setInterval(() => {
      setDirection("right");
      setSlideIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 3000);
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  return (
    <div className="w-full px-2 md:px-4 max-w-6xl mx-auto relative">
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6 mt-2">
        <button
          className={`px-6 py-2 font-bold text-lg ${
            activeTab === "news"
              ? "border-b-4 border-red-600 text-red-600"
              : "text-gray-500"
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
          className={`px-6 py-2 font-bold text-lg ${
            activeTab === "article"
              ? "border-b-4 border-red-600 text-red-600"
              : "text-gray-500"
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
            relative flex items-center justify-center min-h-[420px] sm:min-h-[440px]
            overflow-visible
            [--arrow-shift:0]            
            sm:[--arrow-shift:350%]     
          "
        /* มือถือ: ไม่ยื่นออกไป */
        /* ≥sm: ยื่นออกข้าง 120% (ปรับเองได้) */
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}>
        {/* Left Arrow */}
        <button
          className="
              absolute left-0 top-1/2 -translate-y-1/2
              -translate-x-[var(--arrow-shift)]
              z-10 bg-white/80 text-blue-600 hover:bg-blue-100
              w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
              rounded-full shadow-lg border border-blue-200 disabled:opacity-40 transition
            "
          onClick={() => {
            setDirection("left");
            setSlideIndex((i) => Math.max(0, i - 1));
          }}
          disabled={slideIndex === 0}
          aria-label="ก่อนหน้า">
          <FaChevronLeft size={22} className="md:!hidden" />
          <FaChevronLeft size={30} className="hidden md:!block" />
        </button>

        {/* Track */}
        <div className="flex gap-4 sm:gap-7 w-full justify-center transition-all duration-500">
          {data
            .slice(slideIndex, slideIndex + cardsPerPage)
            .map((item, idx) => {
              const isActive = activeIndex === idx;
              const isHovered = hoverIndex === idx;
              return (
                <div
                  key={slideIndex + idx}
                  className="transition-all duration-300"
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

        {/* Right Arrow */}
        <button
          className="
              absolute right-0 top-1/2 -translate-y-1/2
              translate-x-[var(--arrow-shift)]
              z-10 bg-white/80 text-blue-600 hover:bg-blue-100
              w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
              rounded-full shadow-lg border border-blue-200 disabled:opacity-40 transition
            "
          onClick={() => {
            setDirection("right");
            setSlideIndex((i) => Math.min(maxIndex, i + 1));
          }}
          disabled={slideIndex === maxIndex}
          aria-label="ถัดไป">
          <FaChevronRight size={22} className="md:!hidden" />
          <FaChevronRight size={30} className="hidden md:!block" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-6 w-full py-3">
        <div className="flex justify-center items-center gap-3">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              aria-label={`ไปหน้า ${i + 1}`}
              aria-current={slideIndex === i}
              onClick={() => {
                setDirection(i > slideIndex ? "right" : "left");
                setSlideIndex(i);
              }}
              className="p-1">
              <span
                className={
                  slideIndex === i
                    ? "block w-2.5 h-2.5 rounded-full bg-transparent ring-2 ring-white ring-offset-2 ring-offset-[#2b3040] transition"
                    : "block w-2.5 h-2.5 rounded-full bg-gray-400/70 transition"
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

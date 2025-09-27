// app/about/history/page.tsx
import Image from "next/image";
import { Metadata } from "next";
import Reveal from "@/app/_components/Reveal";

export const metadata: Metadata = {
  title: "ประวัติองค์กร | TPP",
  description: "หน้าแสดงประวัติองค์กรและพัฒนาการที่สำคัญในรูปแบบไทม์ไลน์",
};

// ===== Types =====
type Milestone = {
  year: string; // พ.ศ.
  title?: string;
  description: string;
};

// ===== Data (ตัวอย่าง - ปรับแก้ได้ตามจริง) =====
const milestonesLeft: Milestone[] = [
  {
    year: "พ.ศ. 2561",
    description:
      "-บริษัทลงทุนในเครื่องจักรปะหน้าต่าง -บริษัทลงทุนในเครื่องจักรแกะกล่องกระดาษ",
  },
  {
    year: "พ.ศ. 2559",
    description:
      "-บริษัทลงทุนในเครื่องจักรเครื่องพิมพ์แบบ 8 สี -บริษัทลงทุนในเครื่องจักรปะอัตโนมัติ",
  },
  {
    year: "พ.ศ. 2555",
    description: "บริษัทลงทุนในเครื่องจักรเครื่องทำลอนลูกฟูก ลอน B และ E",
  },
  {
    year: "พ.ศ. 2551",
    description: "บริษัทลงทุนในเครื่องจักรพิมพ์แบบ 6 สี",
  },
  { year: "พ.ศ. 2537", description: "แปลสภาพเป็นบริษัทมหาชน" },
  {
    year: "พ.ศ. 2526",
    description: "ก่อตั้งบริษัทด้วยทุนจดทะเบียน 20 ล้านบาท",
  },
];

const milestonesRight: Milestone[] = [
  {
    year: "พ.ศ. 2562",
    description: "บริษัทลงทุนในเครื่องจักรปะอัตโนมัติ",
  },
  {
    year: "พ.ศ. 2560",
    description:
      "-บริษัทลงทุนในเครื่องจักรปะกึ่งอัตโนมัติ -บริษัทลงทุนในเครื่องจักรปะหน้าต่าง -บริษัทลงทุนในเครื่องจักรปั้มกล่อง -บริษัทลงทุนในเครื่องจักรตัดกล่องตัวอย่าง",
  },
  {
    year: "พ.ศ. 2556",
    description: "บริษัทลงทุนในเครื่องจักร Computer to Plate (CTP)",
  },
  {
    year: "พ.ศ. 2554",
    description: "กรรมการผู้จัดการคนปัจจุบันเข้ารับตำแหน่ง",
  },
  {
    year: "พ.ศ. 2550",
    description: "บริษัทลงทุนในเครื่องจักรพิมพ์แบบ  6 สี",
  },
  {
    year: "พ.ศ. 2533",
    description:
      "เข้าจดทะเบียนในตลาดหลักทรัพย์ โดยมีทุนที่ออกจำหน่ายและชำระเต็มจำนวน 375 ล้านบาท",
  },
];

const Topic = `บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)`;
const historyOverlayText = ` ก่อตั้งขึ้นเมื่อวันที่ 9 พฤษภาคม พ.ศ. 2526 ด้วยทุนจดทะเบียนเริ่มต้น 20 ล้านบาท โดยผู้ถือหุ้นชาวไทยทั้งหมด เพื่อดำเนินธุรกิจด้านบรรจุภัณฑ์ที่มีบทบาทสำคัญต่อการส่งเสริมการขายสินค้า

เริ่มต้นการผลิตในปี พ.ศ. 2527 ที่กรุงเทพฯ ก่อนจะขยายกำลังการผลิตและย้ายฐานการผลิตมายังถนนกิ่งแก้ว อำเภอบางพลี จังหวัดสมุทรปราการ บนพื้นที่กว่า 31.5 ไร่ เพื่อรองรับความต้องการที่เพิ่มขึ้นอย่างต่อเนื่อง ต่อมาในปี พ.ศ. 2533 บริษัทได้รับอนุญาตเข้าจดทะเบียนในตลาดหลักทรัพย์แห่งประเทศไทย และแปรสภาพเป็นบริษัทมหาชนจำกัดเมื่อวันที่ 25 มีนาคม พ.ศ. 2537

ปัจจุบันบริษัทมีทุนจดทะเบียนชำระแล้ว 375 ล้านบาท มีกำลังการผลิตกว่า 11,000 ตันต่อปี และพนักงานกว่า 200 คน โดยมุ่งมั่นพัฒนาเครื่องจักรและเทคโนโลยีการผลิตที่ทันสมัย เพื่อสร้างบรรจุภัณฑ์คุณภาพสูง ตอบสนองความต้องการของตลาด และเพิ่มขีดความสามารถในการแข่งขันอย่างยั่งยืน`;

// ===== Page =====
export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-800">
      <Video />
      <TimelineSection
        leftItems={milestonesLeft}
        rightItems={milestonesRight}
      />
    </main>
  );
}

// ===== Sections =====
function Video() {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-screen isolate">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/history/bg-history-1.png"
          alt="ประวัติองค์กร"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-x-0 top-0 h-24 md:h-40 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 md:h-60 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex items-center justify-start">
        <Reveal y={20}>
          <div className="w-full max-w-5xl lg:max-w-6xl rounded-2xl bg-white/85 backdrop-blur shadow-lg border border-neutral-200 p-4 md:p-6 lg:p-8">
            <h4 className="my-heading md:text-2xl mb-3 md:mb-4">
              ประวัติและความเป็นมา
            </h4>
            <p className="whitespace-pre-line text-sm md:text-base lg:text-lg leading-7 md:leading-8 text-neutral-800">
              <a className="custom-red">{Topic}</a>
              {historyOverlayText}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ===== Timeline =====
function TimelineSection({
  leftItems,
  rightItems,
}: {
  leftItems: Milestone[];
  rightItems: Milestone[];
}) {
  // === เตรียมข้อมูลพื้นฐาน ===
  const parseYear = (s: string) => {
    const m = s.match(/\d{4}/);
    return m ? parseInt(m[0], 10) : 0; // พ.ศ.
  };
  type Side = "left" | "right";
  type SideEvent = Milestone & { side: Side };

  const toSide =
    (side: Side) =>
    (e: Milestone): SideEvent => ({ ...e, side });

  const all: SideEvent[] = [
    ...leftItems.map(toSide("left")),
    ...rightItems.map(toSide("right")),
  ];

  // เรียงปีจาก "น้อย -> มาก"
  const yearsAsc = Array.from(
    new Set(all.map((e) => parseYear(e.year)).filter(Boolean))
  ).sort((a, b) => a - b);

  // === พารามิเตอร์เว้นระยะ (เดสก์ท็อป) ===
  const PX_PER_YEAR = 10;
  const MIN_STEP = 40;
  const MAX_STEP = 96;
  // const CARD_EST = 120;
  const EDGE_GAP = 96;
  const PAD_TOP = 24;
  const PAD_BOTTOM = 120;

  // ✅ ประเมินความสูงจากจำนวนบรรทัดที่ขึ้นต้นด้วย "-"
  function estimateCardHeight(ev: { description: string }) {
    const lines = ev.description.split(/\s*-\s*/).filter(Boolean).length;
    const BASE = 120; // ความสูงการ์ดพื้นฐาน (หัวข้อ/ปี + ย่อหน้า)
    const PER_LINE = 24; // ส่วนเพิ่มต่อ 1 รายการ (ประมาณตาม line-height)
    return lines > 1 ? BASE + (lines - 1) * PER_LINE : BASE;
  }

  const yBaseByYear: Record<number, number> = {};
  let y = PAD_TOP;
  yearsAsc.forEach((yr, i) => {
    if (i === 0) {
      yBaseByYear[yr] = y;
      return;
    }
    const prev = yearsAsc[i - 1];
    const diff = yr - prev;
    const step = Math.min(
      MAX_STEP,
      Math.max(MIN_STEP, MIN_STEP + diff * PX_PER_YEAR)
    );
    y += step;
    yBaseByYear[yr] = y;
  });

  // จัดกลุ่มเหตุการณ์ตามปี
  const grouped: Record<number, SideEvent[]> = {};
  for (const ev of all) {
    const yr = parseYear(ev.year);
    if (!yr) continue;
    (grouped[yr] ||= []).push(ev);
  }

  // วางตำแหน่งจริง (เดสก์ท็อป)
  type Placement = {
    yr: number;
    left: SideEvent[];
    right: SideEvent[];
    leftTops: number[];
    rightTops: number[];
    dotTop: number;
  };

  const placements: Placement[] = [];
  let prevBottomLeft = -Infinity;
  let prevBottomRight = -Infinity;

  for (const yr of yearsAsc) {
    const base = yBaseByYear[yr];
    const items = grouped[yr] || [];
    const left = items.filter((i) => i.side === "left");
    const right = items.filter((i) => i.side === "right");

    // ฝั่งซ้าย
    const leftTops: number[] = [];
    let leftAcc = 0; // ✅ สะสมความสูงของการ์ดในปีเดียวกัน (ฝั่งซ้าย)
    left.forEach((ev, idx) => {
      const h = estimateCardHeight(ev);
      const half = h / 2;
      // จุดศูนย์กลางที่อยากเริ่มวางจากฐานปี + ความสูงที่สะสม
      const startCenter = base + leftAcc + half;
      // เลี่ยงชนกับการ์ดก่อนหน้า โดยดูจาก bottom ของตัวก่อนหน้าบวกระยะห่าง
      const minCenter = prevBottomLeft + EDGE_GAP + half;
      const center = Math.max(startCenter, minCenter);

      leftTops.push(center);
      prevBottomLeft = center + half; // bottom ใหม่ของฝั่งซ้าย
      leftAcc += h + EDGE_GAP; // สะสมความสูงการ์ดนี้ + ช่องว่าง
    });

    // ฝั่งขวา
    const rightTops: number[] = [];
    let rightAcc = 0; // ✅ สะสมความสูงของการ์ดในปีเดียวกัน (ฝั่งขวา)
    right.forEach((ev, idx) => {
      const h = estimateCardHeight(ev);
      const half = h / 2;
      const startCenter = base + rightAcc + half;
      const minCenter = prevBottomRight + EDGE_GAP + half;
      const center = Math.max(startCenter, minCenter);

      rightTops.push(center);
      prevBottomRight = center + half;
      rightAcc += h + EDGE_GAP;
    });

    // จุดปีบนเส้นกลาง
    const dotTop = Math.max(base, leftTops[0] ?? base, rightTops[0] ?? base);
    placements.push({ yr, left, right, leftTops, rightTops, dotTop });
  }

  const tallestBottom = Math.max(prevBottomLeft, prevBottomRight);
  const totalHeight = tallestBottom + PAD_BOTTOM;

  return (
    <section className="relative bg-neutral-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* หัวข้อ */}
        <Reveal y={10}>
          <h4 className="relative -top-[70px] text-center text-2xl md:text-3xl font-bold text-green-800 mb-8">
            พัฒนาการที่สำคัญ
          </h4>
        </Reveal>

        {/* ========== มือถือ ========== */}
        <div className="md:hidden relative pl-8">
          <div
            className="absolute top-0 bottom-0 w-px bg-green-300"
            style={{ left: 18 }}
          />
          <ol className="space-y-6">
            {yearsAsc.flatMap((yr) =>
              (grouped[yr] || []).map((ev, idx) => (
                <li key={`${yr}-${idx}`} className="relative">
                  {/* จุด + เส้นเชื่อม */}
                  <Reveal as="span" y={6} delay={idx * 60} className="block">
                    <span
                      aria-hidden
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-600 ring-4 ring-white shadow"
                      style={{ left: 18 }}
                    />
                    <span
                      aria-hidden
                      className="absolute top-1/2 -translate-y-1/2 h-px bg-green-400"
                      style={{ left: 26, width: 24 }}
                    />
                  </Reveal>

                  <div className="pl-6">
                    <Reveal y={14} delay={idx * 60}>
                      <TimelineCard {...ev} align="left" />
                    </Reveal>
                  </div>
                </li>
              ))
            )}
          </ol>
        </div>

        {/* ========== เดสก์ท็อป ========== */}
        <div
          className="relative hidden md:block mt-6 md:mt-8"
          style={{ height: totalHeight }}>
          {/* เส้นกลาง: เอาไว้นอก Reveal เพื่อให้คมชัด/ไม่เบลอ */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-red-300 z-0"
          />

          {placements.map(
            ({ yr, left, right, leftTops, rightTops, dotTop }, pIndex) => (
              <div key={yr}>
                {/* จุดปี (อยู่เหนือเส้น) */}
                <Reveal
                  as="div"
                  y={8}
                  delay={pIndex * 70}
                  className="absolute left-1/2 -translate-x-1/2 z-10"
                  style={{ top: dotTop }}>
                  <span
                    aria-hidden
                    className="block -translate-y-1/2 rounded-full bg-red-600 ring-4 ring-white shadow"
                    style={{ width: 22, height: 22 }}
                  />
                </Reveal>

                {/* ฝั่งซ้าย */}
                {left.map((ev, i) => (
                  <Reveal
                    key={`L${yr}-${i}`}
                    as="div"
                    y={18}
                    delay={pIndex * 70 + i * 70}
                    className="absolute right-[calc(50%+28px)] w-[44%] z-20"
                    style={{ top: leftTops[i] }}>
                    <div className="relative -translate-y-1/2">
                      <div className="absolute right-[-28px] top-1/2 -translate-y-1/2 w-7 h-px bg-red-400" />
                      <TimelineCard {...ev} align="left" />
                    </div>
                  </Reveal>
                ))}

                {/* ฝั่งขวา */}
                {right.map((ev, i) => (
                  <Reveal
                    key={`R${yr}-${i}`}
                    as="div"
                    y={18}
                    delay={pIndex * 70 + i * 70}
                    className="absolute left-[calc(50%+28px)] w-[44%] z-20"
                    style={{ top: rightTops[i] }}>
                    <div className="relative -translate-y-1/2">
                      <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 w-7 h-px bg-red-400" />
                      <TimelineCard {...ev} align="right" />
                    </div>
                  </Reveal>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ===== การ์ด =====
function TimelineCard({
  year,
  title,
  description,
  align,
}: Milestone & { align: "left" | "right" }) {
  // แยกรายการที่ขึ้นต้นด้วย "-" (มี/ไม่มีช่องว่างก็ได้)
  const lines = description.split(/\s*-\s*/).filter(Boolean);

  return (
    <article
      className={`rounded-2xl bg-white border border-neutral-200 p-5 md:p-6 shadow-sm min-h-[120px] ${
        align === "left" ? "md:text-right" : ""
      }`}>
      <div className="text-[24px] font-semibold tracking-wider custom-red">
        {year}
      </div>
      {title && (
        <h3 className="mt-1 text-base md:text-lg font-bold">{title}</h3>
      )}

      {lines.length > 1 ? (
        // ถ้ามีหลายรายการ ให้ขึ้นบรรทัดใหม่แต่ยังคงเครื่องหมาย "-"
        <div className="mt-2 text-sm md:text-base leading-7 text-neutral-700">
          {lines.map((t, i) => (
            <div key={i}>- {t}</div>
          ))}
        </div>
      ) : (
        // ถ้าไม่มี "-" ให้แสดงเป็นย่อหน้าเดิม
        <p className="mt-2 text-sm md:text-base leading-7 text-neutral-700">
          {description}
        </p>
      )}
    </article>
  );
}

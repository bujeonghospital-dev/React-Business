import ScaledCanvas from "../../components/ScaledCanvas";
// app/about/history/page.tsx
import Image from "next/image";
import { Metadata } from "next";
import Reveal from "@/app/_components/Reveal";
export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | BJH Bangkok",
  description: "BJH Bangkok - โรงพยาบาลศัลยกรรมความงามชั้นนำ ให้บริการโดยแพทย์ศัลยกรรมเฉพาะทางมาตรฐานสากล",
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
    year: "พ.ศ. 2568",
    description: "เปิดให้บริการ BJH Bangkok ศูนย์ศัลยกรรมความงามครบวงจร",
  },
  {
    year: "พ.ศ. 2567",
    description: "เตรียมความพร้อมและวางรากฐานการให้บริการในกรุงเทพมหานคร",
  },
];
const milestonesRight: Milestone[] = [
  {
    year: "พ.ศ. 2568",
    description: "ได้รับใบอนุญาต ฆสพ.สบส : ๔๖๒๗ / ๒๕๖๘",
  },
  {
    year: "พ.ศ. 2567",
    description: "จัดตั้งทีมแพทย์ศัลยกรรมเฉพาะทางมาตรฐานสากล",
  },
];
const Topic = `BJH Bangkok`;
const historyOverlayText = ` เป็นศูนย์ศัลยกรรมความงามชั้นนำในกรุงเทพมหานคร ประเทศไทย ให้บริการโดยทีมแพทย์ศัลยกรรมเฉพาะทางที่มีประสบการณ์และความเชี่ยวชาญ

เรามุ่งมั่นให้บริการศัลยกรรมความงามที่ปลอดภัย มีมาตรฐานสากล และความพึงพอใจสูงสุดของลูกค้า โดยทีมแพทย์ที่มีความเชี่ยวชาญในด้านการผ่าตัด ศัลยกรรมจมูก ศัลยกรรมตา และศัลยกรรมดึงหน้า

เปิดให้บริการทุกวัน เวลา 11:00 - 20:00 น. พร้อมให้คำปรึกษาและดูแลความงามของคุณ`;
// ===== Page =====
export default function HistoryPage() {
  return (
    <ScaledCanvas>
      (
      <main className="min-h-screen bg-white text-neutral-800">
        <Video />
        <TimelineSection
          leftItems={milestonesLeft}
          rightItems={milestonesRight}
        />
      </main>
      )
    </ScaledCanvas>
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
          <h4 className="my-heading md:text-2xl mb-3 md:mb-4 text-center">
            พัฒนาการที่สำคัญ
          </h4>
        </Reveal>
        {/* ========== มือถือ ========== */}
        <div className="md:hidden relative pl-12">
          {/* vertical line */}
          <div
            className="absolute top-0 bottom-0 w-[3px] bg-slate-200"
            style={{ left: 28 }}
            aria-hidden
          />
          <ol className="space-y-6">
            {yearsAsc.flatMap((yr) =>
              (grouped[yr] || []).map((ev, idx) => (
                <li
                  key={`${yr}-${idx}`}
                  className="relative flex items-start pt-2 pb-4"
                >
                  {/* จุด + เส้นเชื่อม */}
                  <Reveal
                    as="span"
                    y={6}
                    delay={idx * 60}
                    className="block flex-shrink-0"
                  >
                    <span
                      aria-hidden
                      className="absolute -translate-x-1/2 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white shadow-lg pointer-events-none"
                      style={{ left: 24, top: 18, zIndex: 40 }}
                    />
                    <span
                      aria-hidden
                      className="absolute h-px bg-slate-200 pointer-events-none"
                      style={{ left: 34, top: 20, width: 28, zIndex: 30 }}
                    />
                  </Reveal>
                  <div className="ml-8 w-full max-w-[calc(100%-72px)] relative z-10">
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
          style={{ height: totalHeight }}
        >
          {/* เส้นกลาง: เอาไว้นอก Reveal เพื่อให้คมชัด/ไม่เบลอ */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-[3px] bg-slate-200 z-0"
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
                  style={{ top: dotTop }}
                >
                  <span
                    aria-hidden
                    className="block -translate-y-1/2 rounded-full bg-teal-500 ring-4 ring-white shadow"
                    style={{ width: 24, height: 24 }}
                  />
                </Reveal>
                {/* ฝั่งซ้าย */}
                {left.map((ev, i) => (
                  <Reveal
                    key={`L${yr}-${i}`}
                    as="div"
                    y={18}
                    delay={pIndex * 70 + i * 70}
                    className="absolute right-[calc(50%+28px)] z-20"
                    style={{ top: leftTops[i], width: "44%", maxWidth: 420 }}
                  >
                    <div className="relative -translate-y-1/2">
                      <div className="absolute right-[-28px] top-1/2 -translate-y-1/2 w-8 h-px bg-slate-300" />
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
                    className="absolute left-[calc(50%+28px)] z-20"
                    style={{ top: rightTops[i], width: "44%", maxWidth: 420 }}
                  >
                    <div className="relative -translate-y-1/2">
                      <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 w-8 h-px bg-slate-300" />
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
      className={`rounded-2xl bg-white border border-neutral-200 p-4 md:p-6 shadow-sm md:shadow-none min-h-[120px] ${
        align === "left" ? "md:text-right" : ""
      } mobile-timeline-card`}
      style={{
        // ensure mobile cards stretch and have consistent spacing
        boxSizing: "border-box",
      }}
    >
      <div className="text-[18px] font-semibold tracking-wider custom-red">
        {year}
      </div>
      {title && (
        <h3 className="mt-1 text-base md:text-lg font-bold">{title}</h3>
      )}
      {lines.length > 1 ? (
        <div className="mt-2 text-[18px] leading-7 text-neutral-700">
          {lines.map((t, i) => (
            <div key={i}>- {t}</div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[18px] leading-7 text-neutral-700">
          {description}
        </p>
      )}
    </article>
  );
}

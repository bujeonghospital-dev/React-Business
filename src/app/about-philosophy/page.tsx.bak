import Image from "next/image";
import QueryPart from "./_components/QueryClient";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "วิสัยทัศน์และพันธกิจ",
  description: "หน้าแสดงวิสัยทัศน์และพันธกิจ",
};
export default function AboutPhilosophy() {
  // === กลุ่ม “พันธกิจ” 8 หัวข้อ ===
  const missions: string[] = [
    "ดำเนินธุรกิจให้เติบโตอย่างยั่งยืน สร้างผลกำไรและผลตอบแทนที่ดี ด้วยหลักธรรมาภิบาล",
    "ผลิตสินค้าให้มีคุณภาพได้มาตรฐาน ส่งมอบสินค้าถูกต้องตรงเวลา พัฒนาระบบบริหารคุณภาพและบริการอย่างต่อเนื่อง เพื่อความพึงพอใจและไว้วางใจของลูกค้า",
    "เพิ่มประสิทธิภาพในการผลิตและการดำเนินงานลดความสูญเสียและความซ้ำซ้อน ปรับปรุงพัฒนาให้มีความรวดเร็วและมีคุณภาพที่ดีขึ้นอย่างต่อเนื่อง",
    "บริหารจัดการวัตถุดิบเลือกใช้วัตถุดิบที่มีคุณภาพ ปลอดภัยเพื่อเพิ่มประสิทธิภาพในการผลิตและการแข่งขันทั้งในด้านราคาและคุณภาพ",
    "สร้างสรรค์นวัตกรรม ความแตกต่างของผลิตภัณฑ์โดยนำเสนอ ให้คำแนะนำและแก้ไขปัญหาให้แก่ลูกค้า",
    "ส่งเสริมและพัฒนาบุคลากรให้มีศักยภาพ มีความคิดสร้างสรรค์มีทักษะที่ดีขึ้นอย่างต่อเนื่อง สร้างจิตสำนึก ความมีระเบียบวินัยทัศนคติที่ดี พร้อมให้คุณภาพชีวิตของพนักงานดีขึ้น",
    "ส่งเสริมและดำเนินการให้องค์กรเป็นสถานที่ทำงานที่มีความสุขความปลอดภัย และมีการสื่อสารและการทำงานร่วมกันเป็นทีมอย่างมีประสิทธิภาพ",
    "สร้างพันธมิตรคู่ค้าทางธุรกิจบนพื้นฐาน ความร่วมมือที่ดีเติบโตร่วมกันอย่างยั่งยืน พร้อมมีส่วนร่วมในการสนับสนุนดูแลสังคม และสิ่งแวดล้อม",
  ];

  // === “ค่านิยมขององค์กร” 3 หัวข้อ ===
  const values = [
    {
      k: "T : TEAMWORK",
      v: "การทำงานเป็นทีมอย่างมีคุณภาพ เชื่อมั่นในคุณค่าของทีม สร้างพลังสู่อนาคต",
    },
    {
      k: "P : PRODUCTIVE PERORMANCE",
      v: "นิสัยแห่งความสำเร็จ คิดก่อนทำก่อน ปฎิบัติงานเชิงรุกด้วยความกระฉับกระเฉงและเป็นเลิศ",
    },
    {
      k: "P : PUNCTUALITY & PERSONALDEVELOPMENT",
      v: "ตรงต่อเวลา รักษาเวลา และรับฟังความคิดเห็นผู้อื่น พร้อมจะพัฒนาตนเองอยู่เสมอ",
    },
  ];

  return (
    <>
      <section className="relative w-full overflow-hidden min-h-[55svh] md:min-h-[60svh] lg:min-h-[70svh]">
        <Image
          src="/images/aboutus/vision_tpp_1.png"
          alt="Tree with kids"
          fill
          className="absolute inset-0 -z-10 object-cover object-center"
          priority
        />
        <div className="relative md:absolute md:right-6 lg:right-12 md:top-12 lg:top-16 mx-auto md:mx-0 md:ml-0 max-w-screen-md md:max-w-md lg:max-w-lg px-4 sm:px-6 md:pr-4 lg:pr-8 py-10 text-center md:text-right text-green-800">
          <h2 className="my-heading sm:text-3xl mb-3 fs-3 text-end text-black fx-clip-reveal">
            วิสัยทัศน์
            <span
              aria-hidden
              className="block fx-underline fx-underline-in mt-2 w-24 ml-auto"
            />
          </h2>

          <p
            className="mx-auto text-base sm:text-lg leading-relaxed break-words shadow-white-end custom-Charcoal-gray fx-subtle-in-up"
            style={{ animationDelay: "120ms" }}>
            เป็นผู้นำด้านธุรกิจการพิมพ์และบรรจุภัณฑ์กระดาษ
            มุ่งมั่นสร้างสรรค์นวัตกรรม
            พร้อมส่งมอบผลิตภัณฑ์และบริการที่มีคุณภาพให้กับลูกค้า
            เพื่อการเติบโตอย่างยั่งยืนของธุรกิจ
          </p>
        </div>
      </section>

      {/* ส่วนล่าง */}
      <section className="relative isolate w-full overflow-hidden">
        <Image
          src="/images/aboutus/Endeavor_3.png"
          alt="Factory and Shipping – base"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-bottom"
        />

        {/* ช่วยให้อ่านง่ายบนมือถือ */}
        <div className="absolute inset-0 -z-10 bg-white/75 md:bg-white/40 lg:bg-transparent" />

        <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-14 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-green-900">
            {/* พันธกิจ (8 กล่อง) */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="my-heading sm:text-xl mb-1 text-black fx-clip-reveal">
                พันธกิจ
                <span
                  aria-hidden
                  className="block fx-underline fx-underline-in mt-2 w-20"
                />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 custom-Charcoal-gray">
                {missions.map((text, i) => (
                  <div
                    key={i}
                    className="h-full rounded-2xl bg-white/70 md:bg-white/40 lg:bg-white/20 backdrop-blur-sm p-5 shadow-sm fx-subtle-in-up"
                    style={{ animationDelay: `${80 + i * 60}ms` }}>
                    <p className="leading-relaxed break-words">
                      <span className="mr-2 font-semibold">{i + 1}.</span>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ค่านิยมขององค์กร */}
            <div className="space-y-6">
              <h3 className="my-heading sm:text-xl mb-1 text-black fx-clip-reveal">
                ค่านิยมขององค์กร
                <span
                  aria-hidden
                  className="block fx-underline fx-underline-in mt-2 w-24"
                />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 custom-Charcoal-gray">
                {values.map((val, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/70 md:bg-white/40 lg:bg-white/20 backdrop-blur-sm p-4 shadow-sm fx-subtle-in-up"
                    style={{ animationDelay: `${80 + i * 80}ms` }}>
                    <div
                      className="font-bold fx-link-in-right"
                      style={{ animationDelay: `${160 + i * 80}ms` }}>
                      {val.k}
                    </div>
                    <p
                      className="mt-1 leading-relaxed break-words fx-subtle-in-up"
                      style={{ animationDelay: `${220 + i * 80}ms` }}>
                      {val.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <QueryPart />
      </Suspense>
    </>
  );
}

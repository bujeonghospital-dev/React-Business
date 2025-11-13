import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TPPNewsPage() {
  const mainNews = {
    id: 1,
    title:
      "TPP ขยายกำลังการผลิตเพิ่มอีก 30% เพื่อรองรับการเติบโตของตลาดบรรจุภัณฑ์ยั่งยืน",
    category: "ข่าวบริษัท",
    date: "25 ตุลาคม 2568",
    time: "14:30 น.",
    image: "/images/New/Annual_Fire_Drill.png",
    content: `บริษัท ไทยแพคเกจจิ้ง แอนด์ พริ้นติ้ง จำกัด (มหาชน) หรือ TPP ประกาศแผนการขยายกำลังการผลิตเพิ่มขึ้นอีก 30% ในปี 2568 เพื่อรองรับความต้องการที่เพิ่มขึ้นของตลาดบรรจุภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม

    การลงทุนครั้งนี้มูลค่ากว่า 500 ล้านบาท จะเน้นไปที่เทคโนโลยีการผลิตที่ทันสมัย และกระบวนการผลิตที่ลดการปล่อยคาร์บอน สอดคล้องกับนโยบาย ESG ของบริษัท รวมถึงการพัฒนาผลิตภัณฑ์บรรจุภัณฑ์ที่ย่อยสลายได้ทางชีวภาพ

    โครงการนี้คาดว่าจะแล้วเสร็จในไตรมาสที่ 2 ของปี 2569 และจะสร้างงานใหม่ประมาณ 200 ตำแหน่ง พร้อมเสริมสร้างความแข็งแกร่งของ TPP ในฐานะผู้นำด้านบรรจุภัณฑ์และการพิมพ์ในภูมิภาคเอเชียตะวันออกเฉียงใต้

    นายกรรมการผู้จัดการ TPP กล่าวว่า "การลงทุนครั้งนี้สะท้อนความมุ่งมั่นของบริษัทในการพัฒนาอย่างยั่งยืน และการตอบสนองต่อความต้องการของลูกค้าที่เปลี่ยนแปลงไปสู่ผลิตภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม"`,
  };

  const sidebarNews = [
    {
      id: 2,
      title: "TPP ได้รับรางวัล 'บริษัทยอดเยี่ยมด้านความยั่งยืน' ประจำปี 2568",
      category: "รางวัลและความสำเร็จ",
      image: "/images/New/Company_Merit-Making_Ceremony.png",
      date: "22 ตุลาคม 2568",
    },
    {
      id: 3,
      title: "การประชุมผู้ถือหุ้นสามัญประจำปี 2568 ผ่านการอนุมัติเงินปันผล",
      category: "นักลงทุนสัมพันธ์",
      image: "/images/New/Board_of_Directors_Meeting.png",
      date: "20 ตุลาคม 2568",
    },
    {
      id: 4,
      title: "TPP เปิดตัวบรรจุภัณฑ์ย่อยสลายได้ใหม่ 'EcoPack Pro'",
      category: "ผลิตภัณฑ์ใหม่",
      image: "/images/New/Distribution_of_Consumer_Goods.png",
      date: "18 ตุลาคม 2568",
    },
    {
      id: 5,
      title: "กิจกรรมจิตอาสาโครงการ 'TPP เพื่อสังคม' ปี 2568",
      category: "CSR",
      image: "/images/New/Annual_Fire_Drill.png",
      date: "15 ตุลาคม 2568",
    },
  ];

  const relatedNews = [
    {
      id: 6,
      title: "TPP ร่วมมือกับสถาบันวิจัยพัฒนาบรรจุภัณฑ์อัจฉริยะ",
      image: "/images/New/Dev_Size.png",
      date: "12 ตุลาคม 2568",
    },
    {
      id: 7,
      title: "การออกแบบบรรจุภัณฑ์เพื่อเศรษฐกิจหมุนเวียน",
      image: "/images/New/Dev_Size.png",
      date: "10 ตุลาคม 2568",
    },
    {
      id: 8,
      title: "TPP เข้าร่วมงานแสดงสินค้า Pack Asia 2568",
      image: "/images/New/Dev_Size.png",
      date: "8 ตุลาคม 2568",
    },
  ];

  const moreNews = [
    {
      id: 9,
      title: "การลงทุนในเทคโนโลยี AI สำหรับการควบคุมคุณภาพ",
      image: "/images/New/Dev_Size.png",
      date: "5 ตุลาคม 2568",
    },
    {
      id: 10,
      title: "TPP ขยายตลาดสู่ประเทศในกลุ่ม ASEAN",
      image: "/images/New/Dev_Size.png",
      date: "3 ตุลาคม 2568",
    },
    {
      id: 11,
      title: "การพัฒนาทีมงานด้วยโปรแกรมฝึกอบรมใหม่",
      image: "/images/New/Dev_Size.png",
      date: "1 ตุลาคม 2568",
    },
    {
      id: 12,
      title: "ความร่วมมือกับมหาวิทยาลัยชั้นนำในการวิจัย",
      image: "/images/New/Dev_Size.png",
      date: "28 กันยายน 2568",
    },
    {
      id: 13,
      title: "TPP รับมาตรฐานความปลอดภัยระดับสากล ISO 45001",
      image: "/images/New/Dev_Size.png",
      date: "25 กันยายน 2568",
    },
    {
      id: 14,
      title: "โครงการพัฒนาชุมชนรอบโรงงาน 'TPP สานสัมพันธ์'",
      image: "/images/New/Dev_Size.png",
      date: "22 กันยายน 2568",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">
              หน้าแรก
            </Link>
            <span className="mx-2">/</span>
            <span className="text-red-600">ข่าวสารและกิจกรรม</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ข่าวสารและกิจกรรม
          </h1>
          <p className="text-xl opacity-90">
            ติดตามข้อมูลข่าวสารและกิจกรรมล่าสุดของ TPP
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article - Left 2 columns */}
          <div className="lg:col-span-2">
            {/* Main Article */}
            <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Featured Image */}
              <div className="relative h-96 md:h-[500px]">
                <Image
                  src={mainNews.image}
                  alt={mainNews.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {mainNews.category}
                  </div>
                  <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight">
                    {mainNews.title}
                  </h1>
                </div>
              </div>

              {/* Article Meta */}
              <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{mainNews.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{mainNews.time}</span>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="แชร์"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="บันทึก"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <div className="px-8 py-8">
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {mainNews.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-6">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-2">แท็ก:</span>
                  {["TPP", "บรรจุภัณฑ์", "ความยั่งยืน", "การลงทุน", "ESG"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="bg-gray-200 hover:bg-red-100 hover:text-red-700 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </article>

            {/* Related News Section */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <div className="w-1 h-8 bg-red-600 mr-4"></div>
                ข่าวที่เกี่ยวข้อง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((news) => (
                  <article
                    key={news.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative h-48">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-sm text-gray-500">{news.date}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* More News Grid */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <div className="w-1 h-8 bg-blue-600 mr-4"></div>
                ข่าวอื่นๆ
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {moreNews.map((news) => (
                  <article
                    key={news.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative h-32 md:h-40">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm md:text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-xs text-gray-500">{news.date}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Quick Links */}
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  ลิงก์ที่เกี่ยวข้อง
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/investor-financials"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    📊 รายงานทางการเงิน
                  </Link>
                  <Link
                    href="/investor-governance"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    🏛️ การกำกับดูแลกิจการ
                  </Link>
                  <Link
                    href="/careers"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    💼 ร่วมงานกับเรา
                  </Link>
                  <Link
                    href="/our-services"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    🔧 บริการของเรา
                  </Link>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  รับข่าวสารจาก TPP
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  สมัครรับข้อมูลข่าวสารและกิจกรรมล่าสุด
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="อีเมลของคุณ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    สมัครรับข่าวสาร
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            กลับสู่หน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// ======= ข้อมูลพื้นฐาน =======
const COMPANY_INFO = {
  name: "บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)",
  shortName: "TPPPACK",
  registrationNumber: "0107537000350",
  registeredCapital: {
    shares: "120,000,000",
    parValue: "10",
    totalAmount: "1,200,000,000",
  },
  paidUpCapital: {
    shares: "120,000,000",
    parValue: "10",
    totalAmount: "1,200,000,000",
    asOfDate: "31 ธันวาคม 2567",
  },
  minorityShareholders: {
    count: "1,250",
    percentage: "45.20",
    asOfDate: "31 ธันวาคม 2567",
  },
  businessType: "ผู้ผลิตและจำหน่ายบรรจุภัณฑ์กระดาษลูกฟูก และบริการงานพิมพ์",
  headquarters: {
    address:
      "เลขที่ 55/5 หมู่ 5 ถนนพหลโยธิน ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120",
    phone: "(+66) 2-529-0099",
    fax: "(+66) 2-529-1254",
    website: "www.tpppack.com",
  },
  factory: {
    address:
      "เลขที่ 55/5 หมู่ 5 ถนนพหลโยธิน ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120",
    phone: "(+66) 2-529-0099",
    fax: "(+66) 2-529-1254",
  },
};

const REFERENCE_CONTACTS = [
  {
    title: "นายทะเบียนหลักทรัพย์",
    name: "บริษัท ศูนย์รับฝากหลักทรัพย์ (ประเทศไทย) จำกัด",
    address:
      "เลขที่ 93 อาคารตลาดหลักทรัพย์แห่งประเทศไทย ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
    phone: "(+66) 2009-9999",
    fax: "(+66) 2009-9991",
  },
  {
    title: "ผู้สอบบัญชี",
    name: "นางสาววิไล ชินวัฒนาวงศ์",
    registrationNumber: "เลขทะเบียนผู้สอบบัญชี 9850",
    company: "บริษัท สำนักงาน เอเอ็นเอส ออดิท จำกัด",
    address:
      "เลขที่ 100/72 ชั้น 22 อาคารว่องวานิช บี ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
    phone: "(+66) 2645-0109",
    fax: "(+66) 2645-0110",
  },
  {
    title: "ที่ปรึกษากฎหมาย",
    name: "บริษัท วีระวงค์ ชินวัตร และพาร์ทเนอร์ส จำกัด",
    company: "สำนักงานกฎหมาย",
    address:
      "เลขที่ 90/16 อาคารสาทรธานี 1 ชั้น 19 ถนนสาทรเหนือ แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    phone: "(+66) 2231-2323",
    fax: "(+66) 2231-2324",
  },
];

// ผู้ถือหุ้นรายใหญ่ - อ้างอิงจากหน้า about-executives
const MAJOR_SHAREHOLDERS = [
  {
    rank: 1,
    name: "นายธีระพงษ์ อัศวินวิจิตร",
    shares: "37,821,750",
    percentage: "31.52",
  },
  {
    rank: 2,
    name: "นายฉัตรชัย เอียสกุล",
    shares: "24,356,100",
    percentage: "20.30",
  },
  {
    rank: 3,
    name: "นายอดุลย์ วินัยแพทย์",
    shares: "14,217,880",
    percentage: "11.85",
  },
  {
    rank: 4,
    name: "บริษัท เค.เค. อินเตอร์โฮลดิ้ง จำกัด",
    shares: "8,540,250",
    percentage: "7.12",
  },
  {
    rank: 5,
    name: "นายพงศธัช อัศวินวิจิตร",
    shares: "7,680,000",
    percentage: "6.40",
  },
  {
    rank: 6,
    name: "นายสุพจน์ พฤกษานานนท์",
    shares: "6,125,400",
    percentage: "5.10",
  },
  {
    rank: 7,
    name: "นายอุดม นิลภารักษ์",
    shares: "4,512,650",
    percentage: "3.76",
  },
  {
    rank: 8,
    name: "นางวิไล วรรณมหินทร์",
    shares: "3,845,200",
    percentage: "3.20",
  },
  {
    rank: 9,
    name: "SOUTH EAST ASIA UK (TYPE C) NOMINEES LIMITED",
    shares: "2,156,880",
    percentage: "1.80",
  },
  {
    rank: 10,
    name: "อื่นๆ (รายย่อย)",
    shares: "10,743,890",
    percentage: "8.95",
  },
];

// นโยบายและประวัติการจ่ายเงินปันผล
const DIVIDEND_HISTORY = [
  {
    approvalDate: "17/03/2568",
    paymentDate: "16/05/2568",
    amount: "0.35",
    period: "01/07/2567 - 31/12/2567",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "26/08/2567",
    paymentDate: "06/09/2567",
    amount: "0.30",
    period: "01/01/2567 - 30/06/2567",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "14/03/2567",
    paymentDate: "17/05/2567",
    amount: "0.25",
    period: "01/07/2566 - 31/12/2566",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "28/08/2566",
    paymentDate: "08/09/2566",
    amount: "0.20",
    period: "01/01/2566 - 30/06/2566",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "27/03/2566",
    paymentDate: "19/05/2566",
    amount: "0.28",
    period: "01/07/2565 - 31/12/2565",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "29/08/2565",
    paymentDate: "07/10/2565",
    amount: "0.15",
    period: "01/01/2565 - 30/06/2565",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "14/03/2565",
    paymentDate: "13/05/2565",
    amount: "0.22",
    period: "01/07/2564 - 31/12/2564",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "30/08/2564",
    paymentDate: "10/09/2564",
    amount: "0.18",
    period: "01/01/2564 - 30/06/2564",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "15/03/2564",
    paymentDate: "14/05/2564",
    amount: "0.15",
    period: "01/07/2563 - 31/12/2563",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "31/08/2563",
    paymentDate: "11/09/2563",
    amount: "0.12",
    period: "01/01/2563 - 30/06/2563",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "16/03/2563",
    paymentDate: "08/05/2563",
    amount: "0.10",
    period: "01/07/2562 - 31/12/2562",
    source: "กำไรสุทธิ",
  },
  {
    approvalDate: "23/08/2562",
    paymentDate: "06/09/2562",
    amount: "0.10",
    period: "01/01/2562 - 30/06/2562",
    source: "กำไรสุทธิ",
  },
];

const Video_TITLE = "ข้อมูลผู้ถือหุ้น";
const Video_DESC =
  "ทีพีพี ให้ความสำคัญและเคารพสิทธิของผู้ถือหุ้นทุกกลุ่ม โดยมีนโยบายกำกับดูแลให้ผู้ถือหุ้นทุกกลุ่มได้รับการปฏิบัติและปกป้องสิทธิขั้นพื้นฐาน และผลประโยชน์อย่างเท่าเทียมและเป็นธรรม";
const Video_BG_URL = "/images/joinus/bg-board.jpg";

// Color palette for pie chart (red theme)
const COLOR_PALETTE = [
  "#dc2626", // red-600
  "#ef4444", // red-500
  "#f87171", // red-400
  "#fca5a5", // red-300
  "#fecaca", // red-200
  "#991b1b", // red-800
  "#b91c1c", // red-700
  "#fb923c", // orange-400
  "#f97316", // orange-500
  "#9ca3af", // gray-400
];

// Helper function to get color for index
function getColorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export default function ShareholderInfo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalShares = MAJOR_SHAREHOLDERS.reduce(
    (sum, sh) => sum + parseFloat(sh.shares.replace(/,/g, "")),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.7s ease-out forwards;
        }

        .Video-content {
          opacity: 0;
        }

        .Video-content.mounted {
          animation: fadeInLeft 1s ease-out forwards;
        }

        .Video-bg-overlay {
          opacity: 0;
          animation: fadeIn 1.2s ease-out 0.2s forwards;
        }

        .info-card {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .stagger-animation {
          animation-delay: calc(var(--index) * 0.1s);
        }
      `}</style>

      <HeroSection mounted={mounted} />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Left Column - ข้อมูลพื้นฐาน */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold bg-red-700 text-white px-4 py-3 rounded-t-lg">
              ข้อมูลพื้นฐาน
            </h2>
            <div className="bg-white border-2 border-red-200 rounded-b-lg shadow-md">
              <div className="divide-y divide-red-100">
                <InfoItem
                  label="ชื่อบริษัท"
                  value={COMPANY_INFO.name}
                  index={0}
                />
                <InfoItem
                  label="ชื่อย่อหลักทรัพย์"
                  value={COMPANY_INFO.shortName}
                  index={1}
                />
                <InfoItem
                  label="เลขทะเบียน"
                  value={COMPANY_INFO.registrationNumber}
                  index={2}
                />
                <InfoItem
                  label="ทุนจดทะเบียน"
                  value={`หุ้นสามัญ ${COMPANY_INFO.registeredCapital.shares} หุ้น มูลค่าตราไว้หุ้นละ ${COMPANY_INFO.registeredCapital.parValue} บาท รวม ${COMPANY_INFO.registeredCapital.totalAmount} บาท`}
                  index={3}
                />
                <InfoItem
                  label="ทุนจดทะเบียนเรียกชำระแล้ว"
                  value={`หุ้นสามัญ ${COMPANY_INFO.paidUpCapital.shares} หุ้น มูลค่าที่ตราไว้หุ้นละ ${COMPANY_INFO.paidUpCapital.parValue} บาท รวม ${COMPANY_INFO.paidUpCapital.totalAmount} บาท (ณ วันที่ ${COMPANY_INFO.paidUpCapital.asOfDate})`}
                  index={4}
                />
                <InfoItem
                  label="ผู้ถือหุ้นรายย่อย"
                  value={`จำนวน ${COMPANY_INFO.minorityShareholders.count} ราย คิดเป็น ${COMPANY_INFO.minorityShareholders.percentage}% (ณ วันที่ ${COMPANY_INFO.minorityShareholders.asOfDate})`}
                  index={5}
                />
                <InfoItem
                  label="ประเภทธุรกิจ"
                  value={COMPANY_INFO.businessType}
                  index={6}
                />
                <InfoItem
                  label="ที่ตั้งสำนักงานใหญ่"
                  value={
                    <>
                      {COMPANY_INFO.headquarters.address}
                      <br />
                      โทรศัพท์ {COMPANY_INFO.headquarters.phone}
                      <br />
                      โทรสาร {COMPANY_INFO.headquarters.fax}
                      <br />
                      {COMPANY_INFO.headquarters.website}
                    </>
                  }
                  index={7}
                />
                <InfoItem
                  label="ที่ตั้งโรงงาน"
                  value={
                    <>
                      {COMPANY_INFO.factory.address}
                      <br />
                      โทรศัพท์ {COMPANY_INFO.factory.phone}
                      <br />
                      โทรสาร {COMPANY_INFO.factory.fax}
                    </>
                  }
                  index={8}
                />
              </div>
            </div>
          </section>

          {/* Right Column - บุคคลอ้างอิงอื่นๆ */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold bg-red-700 text-white px-4 py-3 rounded-t-lg">
              บุคคลอ้างอิงอื่นๆ
            </h2>
            <div className="space-y-4">
              {REFERENCE_CONTACTS.map((contact, index) => (
                <div
                  key={index}
                  className="info-card bg-red-700 text-white rounded-lg p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={
                    {
                      "--index": index,
                    } as React.CSSProperties
                  }
                >
                  <h3 className="font-bold text-base sm:text-lg mb-2 border-b border-red-500 pb-2">
                    {contact.title}
                  </h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="font-medium text-white">{contact.name}</p>
                    {contact.registrationNumber && (
                      <p className="text-red-100">
                        {contact.registrationNumber}
                      </p>
                    )}
                    {contact.company && (
                      <p className="text-red-100">{contact.company}</p>
                    )}
                    <p className="text-red-100 mt-2">{contact.address}</p>
                    <p className="text-red-100">โทรศัพท์ {contact.phone}</p>
                    {contact.fax && (
                      <p className="text-red-100">โทรสาร {contact.fax}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* โครงสร้างการถือหุ้นของบริษัท */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-800 mb-6 text-center">
            โครงสร้างการถือหุ้นของบริษัท
          </h2>
          <div className="bg-white rounded-2xl border-2 border-red-300 p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Company Logo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative bg-red-700 rounded-full flex items-center justify-center shadow-xl">
                <div className="text-white text-center">
                  <div className="text-xl sm:text-2xl font-bold">TPP</div>
                  <div className="text-[10px] sm:text-xs">PACK</div>
                </div>
              </div>

              <div className="text-center w-full">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                  {COMPANY_INFO.name}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 max-w-2xl mx-auto">
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-red-700">
                      31.52%
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                      นายธีระพงษ์ อัศวินวิจิตร
                    </div>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">
                      20.30%
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                      นายฉัตรชัย เอียสกุล
                    </div>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-amber-600">
                      11.85%
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                      นายอดุลย์ วินัยแพทย์
                    </div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">
                      36.33%
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                      อื่นๆ (รายย่อย)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* โครงสร้างผู้ถือหุ้น */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-800 mb-6 text-center">
            โครงสร้างผู้ถือหุ้น
          </h2>

          {/* Pie Chart Section */}
          <div className="bg-white rounded-2xl border-2 border-red-300 p-6 sm:p-8 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
              {/* Interactive Pie Chart */}
              <div className="flex-shrink-0">
                <PieChart data={MAJOR_SHAREHOLDERS} />
              </div>

              {/* Legend/Table for Top 5 */}
              <div className="flex-1 w-full max-w-md">
                <div className="space-y-2">
                  {MAJOR_SHAREHOLDERS.slice(0, 5).map((sh, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 p-3 hover:bg-red-50 rounded-lg transition-colors border-l-4"
                      style={{
                        borderLeftColor: getColorForIndex(index),
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: getColorForIndex(index),
                          }}
                        />
                        <span className="text-sm font-medium text-gray-800">
                          {sh.name}
                        </span>
                      </div>
                      <span className="font-bold text-red-700 text-base">
                        {sh.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden border-2 border-red-200">
              <thead className="bg-red-700 text-white">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-center text-sm font-bold">
                    ลำดับ
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-bold">
                    ผู้ถือหุ้นรายใหญ่
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-right text-sm font-bold">
                    จำนวนหุ้น
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-right text-sm font-bold">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {MAJOR_SHAREHOLDERS.map((sh, index) => (
                  <tr key={index} className="hover:bg-red-50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 text-center font-medium">
                      {sh.rank}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm">{sh.name}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono text-sm">
                      {sh.shares}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right font-bold text-red-700">
                      {sh.percentage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* นโยบายและประวัติการจ่ายเงินปันผล */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-800 mb-6 text-center">
            นโยบายและประวัติการจ่ายเงินปันผล
          </h2>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-700 p-5 sm:p-6 mb-6 rounded-r-lg shadow-md">
            <h3 className="font-bold text-red-800 mb-3 text-lg">
              นโยบายการจ่ายเงินปันผล
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              บริษัทมีนโยบายการจ่ายเงินปันผลไม่ต่ำกว่าร้อยละ{" "}
              <span className="font-bold text-red-700 text-lg">40</span>{" "}
              ของกำไรสุทธิหลังหักภาษีเงินได้
              ซึ่งบริษัทจะนำเข้าเสนอต่อที่ประชุมผู้ถือหุ้นเพื่อพิจารณาอนุมัติการจ่ายเงินปันผล
              ทั้งนี้ขึ้นอยู่กับผลการดำเนินงาน สภาพคล่อง และแผนการลงทุนของบริษัท
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden border-2 border-red-200">
              <thead className="bg-red-700 text-white">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold">
                    วันที่อนุมัติ
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold">
                    วันที่จ่าย
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-bold">
                    อัตรา (บาท)
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold">
                    งวด
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-bold">
                    แหล่งที่มา
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {DIVIDEND_HISTORY.map((dividend, index) => (
                  <tr key={index} className="hover:bg-red-50 transition-colors">
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      {dividend.approvalDate}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      {dividend.paymentDate}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-right font-bold text-red-700 text-sm sm:text-base">
                      {dividend.amount}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">
                      {dividend.period}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">
                      {dividend.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// Hero Section Component
function HeroSection({ mounted }: { mounted: boolean }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full">
        <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] xl:h-[640px]">
          <div className="absolute inset-0">
            <Image
              src={Video_BG_URL}
              alt="background"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Red-themed gradient overlay */}
          <div className="Video-bg-overlay absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent backdrop-blur-[1px]" />

          {/* Animated pattern overlay with red tone */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, #dc2626 0%, transparent 50%)`,
              animation: mounted ? "pulse 4s ease-in-out infinite" : "none",
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-start justify-start">
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
              <div
                className={`pt-8 sm:pt-12 lg:pt-20 xl:pt-24 Video-content ${
                  mounted ? "mounted" : ""
                }`}
              >
                <h1 className="text-[32px] sm:text-[36px] md:text-[42px] font-extrabold leading-[1.2] tracking-tight text-red-800 relative inline-block">
                  <span className="relative z-10">{Video_TITLE}</span>
                  {/* Red underline animation */}
                  <span
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full"
                    style={{
                      width: mounted ? "100%" : "0",
                      transition: "width 1s ease-out 0.5s",
                    }}
                  />
                </h1>

                <p
                  className="mt-3 sm:mt-4 max-w-[760px] text-sm sm:text-base md:text-lg leading-relaxed text-gray-700"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.8s ease-out 0.8s",
                  }}
                >
                  {Video_DESC}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// PieChart Component
interface PieChartProps {
  data: Array<{
    name: string;
    percentage: string;
    shares: string;
  }>;
}

function PieChart({ data }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const size = 500;
  const center = size / 2;
  const outerRadius = 180;
  const innerRadius = 100;

  // Calculate cumulative percentages for pie slices (only top 5)
  let cumulativePercentage = 0;
  const slices = data.slice(0, 5).map((item, index) => {
    const percentage = parseFloat(item.percentage);
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += percentage;
    const endAngle = (cumulativePercentage / 100) * 360;
    const midAngle = (startAngle + endAngle) / 2;

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle,
      percentage,
      color: getColorForIndex(index),
    };
  });

  // Create SVG path for donut slice
  const createDonutArc = (
    startAngle: number,
    endAngle: number,
    outer: number,
    inner: number
  ) => {
    const startOuter = polarToCartesian(center, center, outer, endAngle);
    const endOuter = polarToCartesian(center, center, outer, startAngle);
    const startInner = polarToCartesian(center, center, inner, endAngle);
    const endInner = polarToCartesian(center, center, inner, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outer} ${outer} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${inner} ${inner} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Get label position
  const getLabelPosition = (midAngle: number, distance: number) => {
    return polarToCartesian(center, center, distance, midAngle);
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Define shadows */}
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw donut slices */}
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          const currentOuter = isHovered ? outerRadius + 10 : outerRadius;
          const currentInner = isHovered ? innerRadius - 5 : innerRadius;

          return (
            <g key={index}>
              {/* Donut slice */}
              <path
                d={createDonutArc(
                  slice.startAngle,
                  slice.endAngle,
                  currentOuter,
                  currentInner
                )}
                fill={slice.color}
                stroke="white"
                strokeWidth="3"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isHovered ? "url(#shadow)" : "none",
                  opacity: hoveredIndex !== null && !isHovered ? 0.7 : 1,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Label line and text */}
              {slice.percentage > 3 && (
                <g className="pointer-events-none">
                  {/* Line from slice to label */}
                  <line
                    x1={getLabelPosition(slice.midAngle, outerRadius + 5).x}
                    y1={getLabelPosition(slice.midAngle, outerRadius + 5).y}
                    x2={getLabelPosition(slice.midAngle, outerRadius + 30).x}
                    y2={getLabelPosition(slice.midAngle, outerRadius + 30).y}
                    stroke={slice.color}
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  <line
                    x1={getLabelPosition(slice.midAngle, outerRadius + 30).x}
                    y1={getLabelPosition(slice.midAngle, outerRadius + 30).y}
                    x2={
                      getLabelPosition(slice.midAngle, outerRadius + 30).x +
                      (slice.midAngle > 180 ? -25 : 25)
                    }
                    y2={getLabelPosition(slice.midAngle, outerRadius + 30).y}
                    stroke={slice.color}
                    strokeWidth="2"
                    opacity="0.8"
                  />

                  {/* Label text */}
                  <text
                    x={
                      getLabelPosition(slice.midAngle, outerRadius + 30).x +
                      (slice.midAngle > 180 ? -30 : 30)
                    }
                    y={getLabelPosition(slice.midAngle, outerRadius + 30).y - 5}
                    textAnchor={slice.midAngle > 180 ? "end" : "start"}
                    className="text-[11px] font-medium fill-gray-700"
                  >
                    {slice.name.length > 18
                      ? slice.name.substring(0, 18) + "..."
                      : slice.name}
                  </text>
                  <text
                    x={
                      getLabelPosition(slice.midAngle, outerRadius + 30).x +
                      (slice.midAngle > 180 ? -30 : 30)
                    }
                    y={
                      getLabelPosition(slice.midAngle, outerRadius + 30).y + 10
                    }
                    textAnchor={slice.midAngle > 180 ? "end" : "start"}
                    className="text-[10px] font-bold"
                    fill={slice.color}
                  >
                    {slice.percentage}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Center white circle */}
        <circle cx={center} cy={center} r={innerRadius} fill="white" />

        {/* Center circle border */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
      </svg>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {hoveredIndex !== null ? (
            <>
              <div className="text-3xl sm:text-4xl font-bold text-red-800">
                {slices[hoveredIndex].percentage}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 max-w-[120px] mx-auto leading-tight px-2">
                {slices[hoveredIndex].name}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl sm:text-4xl font-bold text-red-800">
                TOP {data.slice(0, 5).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">ผู้ถือหุ้น</div>
              <div className="text-xs text-gray-500">รายใหญ่</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// InfoItem Component (for list-style layout like TVO)
function InfoItem({
  label,
  value,
  index,
}: {
  label: string;
  value: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className="info-card p-3 sm:p-4 hover:bg-red-50 transition-colors duration-200"
      style={
        {
          "--index": index,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <div className="font-bold text-red-800 text-sm min-w-[180px]">
          {label}
        </div>
        <div className="text-gray-700 text-sm leading-relaxed flex-1">
          {value}
        </div>
      </div>
    </div>
  );
}

// InfoCard Component
function InfoCard({
  title,
  content,
  index,
}: {
  title: string;
  content: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className="info-card bg-white border-2 border-red-200 rounded-lg p-4 shadow-md hover:shadow-lg hover:border-red-400 transition-all duration-300 hover:-translate-y-1"
      style={
        {
          "--index": index,
        } as React.CSSProperties
      }
    >
      <h3 className="font-bold text-red-800 mb-2 text-sm sm:text-base">
        {title}
      </h3>
      <div className="text-gray-700 text-sm leading-relaxed">{content}</div>
    </div>
  );
}

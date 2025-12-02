"use client";
import React from "react";
// SVG Icon Components
const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
    />
  </svg>
);
const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
const TrophyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
);
const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);
const benefits = [
  {
    icon: ChartBarIcon,
    title: "การเติบโตในสายอาชีพ",
    description: "โอกาสในการพัฒนาและเติบโตในสายงานสายสุขภาพ",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    icon: AcademicCapIcon,
    title: "การฝึกอบรมและพัฒนา",
    description: "โปรแกรมการฝึกอบรมที่ครอบคลุมและทันสมัย",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    icon: HeartIcon,
    title: "สวัสดิการครบครัน",
    description: "ประกันสุขภาพ โบนัสประจำปี และอื่นๆ",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    icon: UsersIcon,
    title: "สภาพแวดล้อมการทำงาน",
    description: "บรรยากาศการทำงานที่ดี ทีมงานที่เป็นมิตร",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    icon: TrophyIcon,
    title: "ความมั่นคง",
    description: "ศูนย์ศัลยกรรมที่ได้รับอนุญาตถูกต้องตามกฎหมาย",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    icon: ShieldCheckIcon,
    title: "มาตรฐานสากล",
    description: "แพทย์เฉพาะทางความงาม อุปกรณ์ทันสมัย",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
];
const WhyJoinUs = () => {
  return (
    <section
      id="why-join-us"
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mx-auto mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ทำไมต้องเข้าร่วมกับเรา
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-teal-500 to-teal-600 mx-auto mb-6"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            เราให้ความสำคัญกับการพัฒนาบุคลากรและสร้างสภาพแวดล้อมการทำงานที่ดีที่สุด
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`${benefit.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
        {/* Additional Benefits Section */}
        <div className="mt-16 rounded-2xl p-8 md:p-12 text-white" style={{ background: "linear-gradient(135deg, #3BA8A6 0%, #4AC0BF 100%)" }}>
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            สวัสดิการที่คุณจะได้รับ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>โบนัสประจำปี และปรับเงินเดือนประจำปี</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>ประกันสังคม</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>วันหยุดประจำปีตามกฎหมาย</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>สวัสดิการด้านความงามสำหรับพนักงาน</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>สภาพแวดล้อมการทำงานที่ดี</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>เงินช่วยเหลือค่ารักษาพยาบาล</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>วันลาพักร้อน 6-10 วัน/ปี, ลากิจ 6 วัน/ปี</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>ชุดยูนิฟอร์ม 3-5 ตัว/ปี และอุปกรณ์เซฟตี้</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>การตรวจสุขภาพประจำปี และห้องพยาบาล</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-green-300 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>กิจกรรมสันทนาการตลอดปี</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
export default WhyJoinUs;

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Container from "@/components/Container";

export default function InvestorFinancialsPage() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [expandedDownload, setExpandedDownload] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const toggleDownload = (index: number) => {
    setExpandedDownload(expandedDownload === index ? null : index);
  };

  const mainSections = [
    {
      title: "1. สิทธิของผู้ถือหุ้น",
      content: "เนื้อหาเกี่ยวกับสิทธิของผู้ถือหุ้น...",
    },
    {
      title: "2. การปฏิบัติต่อผู้ถือหุ้นอย่างเท่าเทียมกัน",
      content: "เนื้อหาเกี่ยวกับการปฏิบัติต่อผู้ถือหุ้นอย่างเท่าเทียมกัน...",
    },
    {
      title: "3. บทบาทของผู้มีส่วนได้เสีย",
      content: "เนื้อหาเกี่ยวกับบทบาทของผู้มีส่วนได้เสีย...",
    },
    {
      title: "4. การเปิดเผยข้อมูลและความโปร่งใส",
      content: "เนื้อหาเกี่ยวกับการเปิดเผยข้อมูลและความโปร่งใส...",
    },
    {
      title: "5. ความรับผิดชอบของคณะกรรมการ",
      content: "เนื้อหาเกี่ยวกับความรับผิดชอบของคณะกรรมการ...",
    },
  ];

  const downloadSections = [
    {
      title: "คู่มือและจรรยาบรรณที่เกี่ยวข้องกับการกำกับกิจการ",
      items: ["เอกสาร 1", "เอกสาร 2", "เอกสาร 3"],
    },
    {
      title: "นโยบายต่างๆ ที่เกี่ยวข้องกับการกำกับดูแลกิจกรรม",
      items: ["นโยบาย 1", "นโยบาย 2", "นโยบาย 3"],
    },
    {
      title: "อื่นๆ",
      items: ["เอกสารอื่นๆ 1", "เอกสารอื่นๆ 2"],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 px-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-slide-down">
              การกำกับดูแลกิจการ
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-slide-up delay-200">
              บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)
              ยึดมั่นในหลักกำกับดูแลกิจการที่ดีและจรรยาบรรณธุรกิจเป็นกรอบในการจัดการและตัดสินใจของคณะกรรมการและผู้บริหาร
              บริษัทมุ่งมั่นให้การดำเนินงานเป็นไปอย่างมีประสิทธิภาพ โปร่งใส
              และเป็นธรรม โดยการคุ้มครองสิทธิผู้ถือหุ้น
              เปิดเผยข้อมูลอย่างครบถ้วน รับผิดชอบต่อผู้มีส่วนได้เสียทุกกลุ่ม
              และบริหารความเสี่ยงควบคู่กับระบบควบคุมภายในที่เข้มแข็ง
              เพื่อสร้างคุณค่าและความยั่งยืนให้แก่องค์กร
            </p>
          </div>
        </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-200 rounded-full opacity-20 animate-float-delayed"></div>
      </section>

      <Container>
        {/* Main Content Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center animate-fade-in">
              การกำกับดูแลกิจการ
            </h2>

            {/* Description */}
            <div className="bg-green-50 p-8 rounded-lg mb-12 animate-fade-in-up delay-100 hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-700 leading-relaxed mb-4">
                บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)
                ดำเนินธุรกิจภายใต้หลักกำกับดูแลกิจการที่ดีและจรรยาบรรณเพื่อให้การดำเนินงานมีประสิทธิภาพ
                โปร่งใส และเป็นธรรม
                สร้างความเชื่อมั่นแก่ผู้มีส่วนได้เสียและสนับสนุนการเติบโตอย่างยั่งยืน
                บริษัทคุ้มครองสิทธิของผู้ถือหุ้นและเปิดเผยข้อมูลที่ถูกต้อง
                ครบถ้วน ทันเวลาเพื่อสนับสนุนการตัดสินใจอย่างรอบคอบ
                บริษัทคำนึงถึงความรับผิดชอบต่อพนักงาน ลูกค้า คู่ค้า ชุมชน
                และสิ่งแวดล้อมควบคู่ไปกับการดำเนินธุรกิจ
                คณะกรรมการและผู้บริหารมีบทบาทชัดเจนในการกำกับทิศทาง
                บริหารความเสี่ยง และรักษาระบบควบคุมภายในให้มีประสิทธิผล
              </p>
            </div>

            {/* Certifications/Logos Section - Placeholder for logos */}
            <div className="bg-white p-8 rounded-lg shadow-md mb-12 animate-fade-in-up delay-200">
              <div className="flex flex-wrap items-center justify-center gap-8">
                {/* Placeholder for logos - waiting for user to add images */}
                <div className="text-center animate-scale-in delay-300 hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500 text-sm">CAC Logo</span>
                  </div>
                </div>
                <div className="text-center animate-scale-in delay-400 hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500 text-sm">SET Logo</span>
                  </div>
                </div>
                <div className="text-center animate-scale-in delay-500 hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500 text-sm">ISO Logo</span>
                  </div>
                </div>
                <div className="text-center animate-scale-in delay-600 hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2 hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500 text-sm">Award Logo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Main Sections - Accordion Style */}
            <div className="mb-16">
              {mainSections.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg mb-4 overflow-hidden animate-fade-in-up hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex items-center justify-between p-6 bg-green-700 hover:bg-green-800 transition-all duration-300 hover:translate-x-2"
                  >
                    <h3 className="text-lg font-semibold text-white text-left">
                      {section.title}
                    </h3>
                    <svg
                      className={`w-6 h-6 text-white transform transition-transform ${
                        expandedSection === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {expandedSection === index && (
                    <div className="p-6 bg-white animate-slide-down">
                      <p className="text-gray-700">{section.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Download Documents Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center animate-fade-in">
                ดาวน์โหลดเอกสาร
              </h2>

              {downloadSections.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg mb-4 overflow-hidden animate-fade-in-up hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => toggleDownload(index)}
                    className="w-full flex items-center justify-between p-6 bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:translate-x-2"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 text-left">
                      {section.title}
                    </h3>
                    <svg
                      className={`w-6 h-6 text-gray-800 transform transition-transform ${
                        expandedDownload === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {expandedDownload === index && (
                    <div className="p-6 bg-white animate-slide-down">
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="animate-fade-in"
                            style={{ animationDelay: `${itemIndex * 50}ms` }}
                          >
                            <a
                              href="#"
                              className="flex items-center text-blue-600 hover:text-blue-800 hover:underline hover:translate-x-2 transition-transform duration-200"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Whistleblower / Complaint Form Section */}
            <div className="bg-gray-50 p-8 rounded-lg animate-fade-in-up delay-300 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center animate-fade-in">
                การแจ้งเบาะแสและรับข้อร้องเรียน
              </h2>
              <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto animate-fade-in delay-100">
                เพื่อเป็นแนวทางสู่การพัฒนาอย่างยั่งยืน คณะกรรมการบริษัทฯ
                กำหนดช่องทางการแจ้งข้อร้องเรียนและข้อเสนอแนะ (Whistle Blower)
                โดยเปิดโอกาสให้ผู้มีส่วนได้เสีย
                แสดงความคิดเห็นอย่างอิสระและแจ้งเบาะแสการกระทำผิดกฎหมาย
              </p>

              <form className="max-w-2xl mx-auto space-y-6 animate-fade-in-up delay-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="animate-slide-in-left delay-300">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ชื่อ - นามสกุล
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                      placeholder="กรุณากรอกชื่อ-นามสกุล"
                    />
                  </div>
                  <div className="animate-slide-in-right delay-300">
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ชื่อบริษัท
                    </label>
                    <input
                      type="text"
                      id="company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                      placeholder="กรุณากรอกชื่อบริษัท"
                    />
                  </div>
                </div>

                <div className="animate-fade-in delay-400">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    อีเมล
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                    placeholder="กรุณากรอกอีเมล"
                  />
                </div>

                <div className="animate-fade-in delay-500">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    เบอร์โทร
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                    placeholder="กรุณากรอกเบอร์โทร"
                  />
                </div>

                <div className="animate-fade-in delay-600">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    รายละเอียดการแจ้งเบาะแส/ข้อร้องเรียน
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-400"
                    placeholder="กรุณากรอกรายละเอียด"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="captcha"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ยืนยันตัวตน
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-200 px-4 py-3 rounded-lg">
                      <span className="text-gray-700 font-mono">Captcha</span>
                    </div>
                    <input
                      type="text"
                      id="captcha"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="กรุณากรอกรหัสยืนยัน"
                    />
                  </div>
                </div>

                <div className="flex justify-center animate-fade-in delay-700">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 hover:scale-105 hover:shadow-lg transition-all duration-300 transform active:scale-95"
                  >
                    ส่งข้อความ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

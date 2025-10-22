"use client";
import React, { useState } from "react";
import {
  FileText,
  Download,
  Shield,
  Lock,
  Eye,
  Users,
  ChevronRight,
} from "lucide-react";

export default function PDPAPage() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const pdpaDocuments = [
    {
      name: "นโยบายคุกกี้ (Cookies Policy)",
      url: "/downloads/pdpa/2-นโยบายคุกกี้-Cookies-Policy-ของ-บริษัท-ไทยบรรจุภัณฑ์และการพิมพ์-จำกัด-มหาชน.pdf",
      icon: Eye,
      description: "นโยบายการใช้คุกกี้และเทคโนโลยีติดตามบนเว็บไซต์",
    },
    {
      name: "นโยบายคุ้มครองข้อมูลส่วนบุคคล ของบริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)",
      url: "/downloads/pdpa/3-นโยบายคุ้มครองข้อมูลส่วนบุคคล-ของบริษัท-ไทยบรรจุภัณฑ์และการพิมพ์-จำกัด-มหาชน.pdf",
      icon: Shield,
      description: "นโยบายหลักในการจัดการและคุ้มครองข้อมูลส่วนบุคคล",
    },
    {
      name: "ประกาศความเป็นส่วนตัว (Privacy Notice) ของลูกค้า",
      url: "/downloads/pdpa/4-ประกาศความเป็นส่วนตัว-Privacy-Notice-ของลูกค้า.pdf",
      icon: Users,
      description: "ข้อมูลการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคลของลูกค้า",
    },
    {
      name: "ประกาศความเป็นส่วนตัว (Privacy Notice) สำหรับผู้สมัครงาน",
      url: "/downloads/pdpa/5-ประกาศความเป็นส่วนตัว-Privacy-Notice-สำหรับผู้สมัคร.pdf",
      icon: FileText,
      description: "ประกาศสำหรับผู้สมัครงานเกี่ยวกับการใช้ข้อมูลส่วนบุคคล",
    },
    {
      name: "คำประกาศเกี่ยวกับความเป็นส่วนตัวในการใช้กล้องวงจรปิด (CCTV)",
      url: "/downloads/pdpa/คำประกาศ-เกี่ยวกับความเป็นส่วนตัวในการใช้กล้องวงจรปิด-CCTV-Rev.01.pdf",
      icon: Lock,
      description: "นโยบายการใช้กล้องวงจรปิดและการเก็บบันทึกภาพ",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-red-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              กฎหมายคุ้มครองข้อมูลส่วนบุคคล
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
              บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน)
            </p>
            <p className="text-red-100 mt-3 max-w-3xl mx-auto">
              เราให้ความสำคัญกับความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของคุณ
              ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            </p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,74.7C1248,75,1344,53,1392,42.7L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              การคุ้มครองข้อมูล
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ความโปร่งใส
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              คุณมีสิทธิ์ทราบว่าเราเก็บรวบรวมและใช้ข้อมูลของคุณอย่างไร
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              สิทธิของคุณ
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              คุณสามารถขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้
            </p>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-white px-8 py-6 border-b border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-red-600" />
              เอกสารและนโยบาย PDPA
            </h2>
            <p className="text-gray-600 mt-2">
              ดาวน์โหลดเอกสารและนโยบายที่เกี่ยวข้องกับการคุ้มครองข้อมูลส่วนบุคคล
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {pdpaDocuments.map((doc, index) => {
                const IconComponent = doc.icon;
                return (
                  <div
                    key={index}
                    className={`group relative bg-gradient-to-r ${
                      hoveredItem === index
                        ? "from-red-50 to-white shadow-md border-red-200"
                        : "from-gray-50 to-white border-gray-200"
                    } border rounded-xl p-6 transition-all duration-300 hover:shadow-md cursor-pointer`}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          hoveredItem === index
                            ? "bg-red-600 shadow-lg shadow-red-200"
                            : "bg-red-100"
                        }`}
                      >
                        <IconComponent
                          className={`w-6 h-6 transition-colors duration-300 ${
                            hoveredItem === index
                              ? "text-white"
                              : "text-red-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>

                      <a
                        href={doc.url}
                        download
                        className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                          hoveredItem === index
                            ? "bg-red-600 text-white shadow-lg shadow-red-200 scale-105"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">ดาวน์โหลด</span>
                      </a>
                    </div>

                    {/* <ChevronRight
                      className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 transition-all duration-300 ${
                        hoveredItem === index
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    /> */}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 sm:p-12 text-center shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ต้องการข้อมูลเพิ่มเติม?
          </h3>
          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
            หากคุณมีคำถามเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล
            หรือต้องการใช้สิทธิของคุณ
            กรุณาติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคลของเรา
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            <Shield className="w-5 h-5" />
            ติดต่อเรา
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            เอกสารทั้งหมดเป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด
            (มหาชน) สงวนลิขสิทธิ์
          </p>
        </div>
      </div>
    </div>
  );
}

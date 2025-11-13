"use client";

import React from "react";
import Image from "next/image";

const CareersHero = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/80 z-10" />
      <Image
        src="/images/joinus/bg-board.jpg"
        alt="Careers at TPP"
        fill
        className="object-cover"
        priority
      />

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center text-white px-4">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Limitless Opportunities
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 text-green-300">
            โอกาส..ไร้ขีดจำกัด
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-8 text-gray-100">
            บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน) ก่อตั้งมากกว่า 35 ปี
            เราเชื่อในศักยภาพของทุกคน มาร่วมเติบโตไปพร้อมกับเรา
            เพื่อสร้างสรรค์ผลงานและอนาคตที่ยั่งยืน
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#job-listings"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ดูตำแหน่งงานทั้งหมด
            </a>
            <a
              href="#why-join-us"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white transition-all duration-300 backdrop-blur-sm"
            >
              ทำไมต้องเข้าร่วมกับเรา
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>
  );
};

export default CareersHero;

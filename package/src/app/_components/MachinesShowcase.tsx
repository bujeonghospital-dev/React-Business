"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
const MachineryShowcase = () => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const leftMachines = [
    "Sample Box Cutting Machine",
    "Computer-to-Plate (CTP)",
    "5-Colors Printing Machine",
    "6-Colors Printing Machine",
    "8-Colors Printing Machine",
    "Corrugating Machine (B flute, E flute)",
    "Laminating Machine",
  ];

  const rightMachines = [
    "Die Cutting Machine",
    "Paper Stripping Machine",
    "Auto Gluing Machine",
    "Semi Auto Gluing Machine",
    "Hologram Sticker Machine",
    "Window Patching Machine",
    "Food Packaging Forming Machine",
  ];

  type Segment = {
    id: number;
    label: string;
    imageSrc: string;
  };
  const segments: Segment[] = [
    { id: 1, label: "Printing", imageSrc: "/images/technology/7-1.jpg" },
    { id: 2, label: "Cutting", imageSrc: "/images/technology/tpp-01.png" },
    { id: 3, label: "Die Cut", imageSrc: "/images/technology/tpp-02.png" },
    { id: 4, label: "Laminate", imageSrc: "/images/aboutus/Endeavor_1.png" },
    { id: 5, label: "Gluing", imageSrc: "/images/technology/Endeavor_2.png" },
    { id: 6, label: "Forming", imageSrc: "/images/technology/Endeavor_3.png" },
    { id: 7, label: "Hologram", imageSrc: "/images/technology/tpp-02.png" },
    { id: 8, label: "CTP", imageSrc: "/images/technology/vision_tpp_1.png" },
  ];

  const createSegmentPath = (index: number, total = 8) => {
    const angle = 360 / total;
    const startAngle = index * angle - 90;
    const endAngle = (index + 1) * angle - 90;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const innerRadius = 25;
    const outerRadius = 50;

    const x1 = 50 + outerRadius * Math.cos(startRad);
    const y1 = 50 + outerRadius * Math.sin(startRad);
    const x2 = 50 + outerRadius * Math.cos(endRad);
    const y2 = 50 + outerRadius * Math.sin(endRad);
    const x3 = 50 + innerRadius * Math.cos(endRad);
    const y3 = 50 + innerRadius * Math.sin(endRad);
    const x4 = 50 + innerRadius * Math.cos(startRad);
    const y4 = 50 + innerRadius * Math.sin(startRad);

    return `M ${x4} ${y4} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black-50 via-white to-purple-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Floating Dots Animation */}
      {/* <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          <div
            className="absolute -top-20 w-2 h-2 bg-green-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}></div>
          <div
            className="absolute -left-40 top-10 w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s" }}></div>
          <div
            className="absolute -right-40 top-10 w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}></div>
          <div
            className="absolute -bottom-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "1.5s" }}></div>
        </div>
      </div> */}

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 mt-6">
        <div className="max-w-7xl w-full">
          <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12 ">
            <motion.h2
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl inline-block border-b-4 border-red-600 "
            >
              {"ศักยภาพเครื่องจักรของเรา"}
            </motion.h2>
            <motion.p
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.05,
              }}
              className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base"
            >
              {
                "ครบทุกกระบวนการ ตั้งแต่ก่อนพิมพ์ พิมพ์ ไปจนถึงหลังพิมพ์เพื่อคุณภาพและความรวดเร็วที่ไว้วางใจ"
              }
            </motion.p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-x-16 xl:gap-x-24 2xl:gap-x-32 items-center">
            {/* Left Column - Machine List */}
            <div className="space-y-3 lg:space-y-4 lg:pr-6 xl:pr-10 2xl:pr-14">
              {leftMachines.map((machine, index) => (
                <div
                  key={index}
                  className="group animate-fade-in-left"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="relative bg-white/80 backdrop-blur-sm px-4 py-3 lg:px-6 lg:py-4 rounded-l-full shadow-md hover:shadow-lg transform hover:-translate-x-2 transition-all duration-300 border-r-4 border-transparent hover:border-red-400">
                    <div className="flex items-center justify-between">
                      <div className="text-[16px] text-gray-700 font-medium group-hover:text-red-600 transition-colors">
                        {machine}
                      </div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-red-400 transition-colors"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center - Circular Icon Display */}
            <div className="relative flex items-center justify-center py-8 lg:py-0">
              {/* Outer Glow Effect */}
              <div className="absolute w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-purple-100/50 to-blue-100/50 blur-2xl animate-pulse"></div>

              {/* Main Circle Container */}
              {/* Center - Circular Icon Display */}
              <div className="relative flex items-center justify-center py-8 lg:py-0 shrink-0">
                {/* Outer Glow Effect */}
                <div className="absolute w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-purple-100/50 to-blue-100/50 blur-2xl animate-pulse"></div>

                {/* Main Circle Container */}
                <div className="relative w-[28.8rem] h-[28.8rem] lg:w-[36rem] lg:h-[36rem]">
                  {/* Main Circular Image */}
                  <motion.img
                    src="/images/technology/machinery-circle.png"
                    alt="Machinery Showcase"
                    className="absolute inset-0 w-full h-full object-contain"
                    initial={
                      prefersReducedMotion
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.8 }
                    }
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
                  />

                  {/* Center Logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-24 h-24 lg:w-28 lg:h-28 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.5 }
                      }
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.5,
                        delay: prefersReducedMotion ? 0 : 0.3,
                      }}
                    >
                      <img
                        className="bg-fallback"
                        src="/images/logo/logo.png"
                        alt=""
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Machine List */}
            <div className="space-y-3 lg:space-y-4 lg:pl-6 xl:pl-10 2xl:pl-14">
              {rightMachines.map((machine, index) => (
                <div
                  key={index}
                  className="group animate-fade-in-right"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="relative bg-white/80 backdrop-blur-sm px-4 py-3 lg:px-6 lg:py-4 rounded-r-full shadow-md hover:shadow-lg transform hover:translate-x-2 transition-all duration-300 border-l-4 border-transparent hover:border-red-400">
                    <div className="flex items-center justify-between">
                      <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-red-400 transition-colors"></div>
                      <div className="text-[16px] text-gray-700 font-medium text-right group-hover:text-red-600 transition-colors">
                        {machine}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-left {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px) translateX(-50%);
          }
          100% {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MachineryShowcase;

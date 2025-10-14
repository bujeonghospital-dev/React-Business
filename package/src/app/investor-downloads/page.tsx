"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// Custom hook for scroll animations
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Annual Report Card Component
interface ReportCardProps {
  year: string;
  title: string;
  image?: string;
  index: number;
}

const ReportCard: React.FC<ReportCardProps> = ({
  year,
  title,
  image,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -8 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer border border-gray-100 hover:shadow-2xl transition-all duration-300"
    >
      {/* Image Placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-20 h-20 text-teal-300 group-hover:text-teal-400 transition-colors duration-300" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-700">
          {year}
        </div>
        {/* Placeholder indicator */}
        <div className="absolute bottom-3 left-3 bg-yellow-400/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-black">
          รอใส่รูป
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-center font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3rem] group-hover:text-teal-700 transition-colors duration-300">
          {title}
        </h3>
        <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg transform active:scale-95">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">ดาวน์โหลด</span>
        </button>
      </div>
    </motion.div>
  );
};

// Form 56-1 Download Item Component
interface DownloadItemProps {
  title: string;
  buttonText: string;
  index: number;
  variant?: "primary" | "secondary";
}

const DownloadItem: React.FC<DownloadItemProps> = ({
  title,
  buttonText,
  index,
  variant = "primary",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors duration-300">
          <FileText className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <p className="text-gray-800 font-medium group-hover:text-teal-700 transition-colors duration-300">
            {title}
          </p>
        </div>
      </div>
      <button
        className={`${
          variant === "primary"
            ? "bg-teal-600 hover:bg-teal-700 text-white"
            : "bg-gray-600 hover:bg-gray-700 text-white"
        } px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 hover:shadow-lg transform hover:scale-105 active:scale-95 whitespace-nowrap`}
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">{buttonText}</span>
      </button>
    </motion.div>
  );
};

// Main Page Component
export default function InvestorDownloadsPage() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

  // Mock data for Annual Reports
  const annualReports = [
    { year: "2567", title: "แบบ 56-1 One Report ประจำปี 2567" },
    { year: "2566", title: "แบบ 56-1 One Report ประจำปี 2566" },
    { year: "2565", title: "แบบ 56-1 One Report ประจำปี 2565" },
    { year: "2564", title: "แบบ 56-1 One Report ประจำปี 2564" },
    { year: "2563", title: "แบบ 56-1 One Report / รายงานการจัด 2563" },
    { year: "2562", title: "รายงานประจำปี 2562" },
    { year: "2561", title: "รายงานประจำปี 2561" },
    { year: "2560", title: "รายงานประจำปี 2560" },
    { year: "2559", title: "รายงานประจำปี 2559" },
    { year: "2558", title: "รายงานประจำปี 2558" },
    { year: "2557", title: "รายงานประจำปี 2557" },
    { year: "2556", title: "รายงานประจำปี 2556" },
  ];

  // Mock data for Form 56-1
  const form561Items = [
    {
      title: "แบบ 56-1 One Report ประจำปี 2567",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
    },
    {
      title: "แบบ 56-1 One Report ประจำปี 2566",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
    },
    {
      title: "แบบ 56-1 One report / รายงานการจัด ประจำปี 2563",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2566",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2565",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2557",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
    },
    {
      title: "แบบ 56-1 One Report / รายงานการจัดการ 2561",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2560",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2559",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2558",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white mt-5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[400px] bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Animated circles in background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-teal-300 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center text-white z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              เอกสารเผยแพร่และดาวน์โหลด
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
            >
              บริษัท ไทยบรรจุภัณฑ์และการพิมพ์ จำกัด (มหาชน) (TPPPACK)
              ตระหนักถึงความสำคัญของการเปิดเผยข้อมูลและสารสนเทศที่มีนัยสำคัญของบริษัทให้ถูกต้อง
              ครบถ้วน ทันสมัย โปร่งใส และตรวจสอบได้ ภายในระยะเวลาที่เหมาะสม
              เพื่อให้เป็นประโยชน์ต่อการตัดสินใจด้านการลงทุน การบริหาร
              และการดำเนินงานของผู้มีส่วนได้เสียทุกฝ่าย
            </motion.p>
          </div>
        </div>

        {/* Image placeholder indicator */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold shadow-lg"
        >
          📸 รอใส่รูปภาพ พื้นหลัง
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* รายงานประจำปี Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 inline-block relative"
            >
              รายงานประจำปี
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {annualReports.map((report, index) => (
              <ReportCard
                key={report.year}
                year={report.year}
                title={report.title}
                index={index}
              />
            ))}
          </div>
        </motion.section>

        {/* แบบรายงาน 56-1 Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 inline-block relative"
            >
              แบบรายงาน 56-1
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
            </motion.h2>
          </div>

          <div className="space-y-4">
            {form561Items.map((item, index) => (
              <DownloadItem
                key={index}
                title={item.title}
                buttonText={item.buttonText}
                index={index}
                variant={item.variant}
              />
            ))}
          </div>
        </motion.section>

        {/* IR NEWSLETTER Section - TODO */}
        {/* <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 inline-block relative"
            >
              IR NEWSLETTER
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
            </motion.h2>
          </div>

          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-12 border-2 border-dashed border-gray-300 overflow-hidden">
            <div className="absolute top-4 right-4 bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg animate-pulse">
              🚧 ยังไม่ต้องทำ
            </div>
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">ส่วนนี้รอทำในภายหลัง</p>
              <p className="text-sm mt-2">
                IR Newsletter section will be implemented later
              </p>
            </div>
          </div>
        </motion.section> */}

        {/* INVESTOR KITS Section - TODO */}
        {/* <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative pb-16"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 inline-block relative"
            >
              INVESTOR KITS
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
            </motion.h2>
          </div>

          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-12 border-2 border-dashed border-gray-300 overflow-hidden">
            <div className="absolute top-4 right-4 bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg animate-pulse">
              🚧 ยังไม่ต้องทำ
            </div>
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">ส่วนนี้รอทำในภายหลัง</p>
              <p className="text-sm mt-2">
                Investor Kits table will be implemented later
              </p>
            </div>
          </div>
        </motion.section> */}
      </div>
    </div>
  );
}

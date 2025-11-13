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
  thumbnail?: string | null;
  pdfPath?: string | null;
  index: number;
}

const ReportCard: React.FC<ReportCardProps> = ({
  year,
  title,
  thumbnail,
  pdfPath,
  index,
}) => {
  const isPdfAvailable = Boolean(pdfPath);

  const handlePdfClick = () => {
    if (pdfPath) {
      window.open(pdfPath, "_blank");
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pdfPath) {
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = `Annual-Report-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={isPdfAvailable ? { scale: 1.05, y: -8 } : {}}
      className={`bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100 hover:shadow-2xl transition-all duration-300 ${
        isPdfAvailable ? "cursor-pointer" : "cursor-default"
      }`}
      onClick={isPdfAvailable ? handlePdfClick : undefined}
    >
      {/* PDF Thumbnail or Placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden">
        {thumbnail ? (
          <>
            <Image
              src={thumbnail}
              alt={`${title} thumbnail`}
              fill
              className={`object-cover object-top transition-transform duration-500 ${
                isPdfAvailable ? "group-hover:scale-110" : ""
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 ${
                isPdfAvailable
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-20"
              }`}
            />
            {isPdfAvailable && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
              </div>
            )}
            {!isPdfAvailable && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <span className="text-white text-sm font-semibold">
                    เร็วๆ นี้
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText
                className={`w-20 h-20 text-teal-300 transition-colors duration-300 ${
                  isPdfAvailable ? "group-hover:text-teal-400" : ""
                }`}
              />
            </div>
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
                isPdfAvailable
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-20"
              }`}
            />
            {/* Placeholder indicator */}
            <div className="absolute bottom-3 left-3 bg-yellow-400/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-black">
              {isPdfAvailable ? "พร้อมดาวน์โหลด" : "รอใส่รูป"}
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-700">
          {year}
        </div>
        {isPdfAvailable && (
          <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-white">
            ✓ พร้อม
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={`text-center font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3rem] transition-colors duration-300 ${
            isPdfAvailable ? "group-hover:text-teal-700" : ""
          }`}
        >
          {title}
        </h3>
        <button
          onClick={isPdfAvailable ? handleDownload : undefined}
          disabled={!isPdfAvailable}
          className={`w-full py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${
            isPdfAvailable
              ? "bg-teal-600 text-white hover:bg-teal-700 group-hover:shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isPdfAvailable ? "ดาวน์โหลด" : "ยังไม่พร้อม"}
          </span>
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
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  filePath?: string;
}

const DownloadItem: React.FC<DownloadItemProps> = ({
  title,
  buttonText,
  index,
  variant = "primary",
  isSelected = false,
  onSelect,
  filePath,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(e.target.checked);
  };

  const handleDownload = () => {
    if (filePath) {
      window.open(filePath, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white rounded-lg border transition-all duration-300 group ${
        isSelected
          ? "border-teal-500 bg-teal-50 shadow-md"
          : "border-gray-200 hover:border-teal-500 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          className="w-5 h-5 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 mt-2"
        />
        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors duration-300">
          <FileText className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <p
            className={`font-medium transition-colors duration-300 ${
              isSelected
                ? "text-teal-700"
                : "text-gray-800 group-hover:text-teal-700"
            }`}
          >
            {title}
          </p>
        </div>
      </div>
      <button
        onClick={handleDownload}
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
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

  const handleSelectItem = (index: number, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (selected) {
      newSelectedItems.add(index);
    } else {
      newSelectedItems.delete(index);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === form561Items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(form561Items.map((_, index) => index)));
    }
  };

  const handleDownloadSelected = () => {
    const selectedFiles = form561Items.filter((_, index) =>
      selectedItems.has(index)
    );
    if (selectedFiles.length === 0) return;

    // Show loading state or confirmation
    selectedFiles.forEach((item, index) => {
      setTimeout(() => {
        if (item.filePath) {
          window.open(item.filePath, "_blank");
        }
      }, index * 500); // Delay each download by 500ms to prevent browser blocking
    });

    // Show success message
    setTimeout(() => {
      alert(`เริ่มดาวน์โหลด ${selectedFiles.length} ไฟล์แล้ว`);
    }, 100);
  };

  // Annual Reports data with PDF paths and thumbnails
  const annualReports = [
    {
      year: "2567",
      title: "แบบ 56-1 One Report ประจำปี 2567",
      thumbnail: "/images/pdf-thumbnails/placeholder-modern.jpg",
      pdfPath: null,
    },
    {
      year: "2566",
      title: "แบบ 56-1 One Report ประจำปี 2566",
      thumbnail: "/images/pdf-thumbnails/placeholder-classic.jpg",
      pdfPath: null,
    },
    {
      year: "2565",
      title: "แบบ 56-1 One Report ประจำปี 2565",
      thumbnail: "/images/pdf-thumbnails/Annual-Report-2565.jpg",
      pdfPath: "/downloads/annual-reports/Annual-Report-2565.pdf",
    },
    {
      year: "2564",
      title: "แบบ 56-1 One Report ประจำปี 2564",
      thumbnail: "/images/pdf-thumbnails/placeholder-modern.jpg",
      pdfPath: null,
    },
    {
      year: "2563",
      title: "แบบ 56-1 One Report / รายงานการจัด 2563",
      thumbnail: "/images/pdf-thumbnails/Annual-Report-2023.jpg",
      pdfPath: "/downloads/annual-reports/Annual-Report-2023.pdf",
    },
    {
      year: "2562",
      title: "รายงานประจำปี 2562",
      thumbnail: "/images/pdf-thumbnails/Annual-Report-2562.jpg",
      pdfPath: "/downloads/annual-reports/Annual-Report-2562.pdf",
    },
    {
      year: "2561",
      title: "รายงานประจำปี 2561",
      thumbnail: "/images/pdf-thumbnails/Annual-Report-2561.jpg",
      pdfPath: "/downloads/annual-reports/Annual-Report-2561.pdf",
    },
    {
      year: "2560",
      title: "รายงานประจำปี 2560",
      thumbnail: "/images/pdf-thumbnails/placeholder-classic.jpg",
      pdfPath: null,
    },
    {
      year: "2559",
      title: "รายงานประจำปี 2559",
      thumbnail: "/images/pdf-thumbnails/placeholder-modern.jpg",
      pdfPath: null,
    },
    {
      year: "2558",
      title: "รายงานประจำปี 2558",
      thumbnail: "/images/pdf-thumbnails/Annual-Report-2021.jpg",
      pdfPath: "/downloads/annual-reports/Annual-Report-2021.pdf",
    },
    {
      year: "2557",
      title: "รายงานประจำปี 2557",
      thumbnail: "/images/pdf-thumbnails/placeholder-classic.jpg",
      pdfPath: null,
    },
    { year: "2556", title: "รายงานประจำปี 2556" },
  ];

  // Mock data for Form 56-1 and Shareholder Meeting Documents
  const form561Items = [
    {
      title: "รายงานการประชุมสามัญผู้ถือหุ้นประจำปี 2568",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
      filePath:
        "/downloads/shareholder-meetings/รายงานการประชุมสามัญผู้ถือหุ้นประจำปี-TPP-68-1-1.pdf",
    },
    {
      title: "รายงานการประชุมสามัญผู้ถือหุ้นประจำปี 2567",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
      filePath:
        "/downloads/shareholder-meetings/รายงานการประชุมสามัญผู้ถือหุ้นประจำปี-TPP-67-Final-3.pdf",
    },
    {
      title: "หลักเกณฑ์การให้ผู้ถือหุ้นส่วนน้อย 2567",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
      filePath:
        "/downloads/shareholder-meetings/หลักเกณฑ์การให้ผู้ถือหุ้นส่วนน้อย-2567.pdf",
    },
    {
      title: "หลักเกณฑ์ทั่วไป",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
      filePath: "/downloads/shareholder-meetings/หลักเกณฑ์.pdf",
    },
    {
      title: "แบบ 56-1 One Report ประจำปี 2567",
      buttonText: "ดาวน์โหลด",
      variant: "primary" as const,
      filePath: "/downloads/annual-reports/form-56-1-2567.pdf",
    },
    {
      title: "แบบ 56-1 One Report ประจำปี 2566",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
      filePath: "/downloads/annual-reports/form-56-1-2566.pdf",
    },
    {
      title: "แบบ 56-1 One report / รายงานการจัด ประจำปี 2563",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
      filePath: "/downloads/annual-reports/form-56-1-2563.pdf",
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2565",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
      filePath: "/downloads/annual-reports/form-56-1-2565.pdf",
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2564",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
      filePath: "/downloads/annual-reports/form-56-1-2564.pdf",
    },
    {
      title: "แบบรายงาน 56-1 ประจำปี 2563",
      buttonText: "ดาวน์โหลด",
      variant: "secondary" as const,
      filePath: "/downloads/annual-reports/form-56-1-2563-alt.pdf",
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
                thumbnail={report.thumbnail}
                pdfPath={report.pdfPath}
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
              ประชุมผู้ถือหุ้น
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
            </motion.h2>
          </div>

          {/* Selection Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-8 border border-teal-200"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectedItems.size === form561Items.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <label
                    htmlFor="selectAll"
                    className="text-gray-700 font-medium"
                  >
                    เลือกทั้งหมด
                  </label>
                </div>
                <div className="text-sm text-gray-600">
                  เลือกแล้ว: {selectedItems.size} จาก {form561Items.length} ไฟล์
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  disabled={selectedItems.size === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  ยกเลิกทั้งหมด
                </button>
                <button
                  onClick={handleDownloadSelected}
                  disabled={selectedItems.size === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดที่เลือก ({selectedItems.size})
                </button>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {form561Items.map((item, index) => (
              <DownloadItem
                key={index}
                title={item.title}
                buttonText={item.buttonText}
                index={index}
                variant={item.variant}
                filePath={item.filePath}
                isSelected={selectedItems.has(index)}
                onSelect={(selected) => handleSelectItem(index, selected)}
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

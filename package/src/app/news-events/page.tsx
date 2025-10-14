"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewsEventsPage() {
  // ข้อมูลข่าวสาร (ตัวอย่าง)
  const newsItems = [
    {
      id: 1,
      image: "/images/news/news-1.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
    {
      id: 2,
      image: "/images/news/news-2.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
    {
      id: 3,
      image: "/images/news/news-3.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
    {
      id: 4,
      image: "/images/news/news-4.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
  ];

  // ข้อมูลบทความ (ตัวอย่าง)
  const articleItems = [
    {
      id: 1,
      image: "/images/articles/article-1.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
    {
      id: 2,
      image: "/images/articles/article-2.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
    {
      id: 3,
      image: "/images/articles/article-3.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
    {
      id: 4,
      image: "/images/articles/article-4.jpg",
      title: "XXXXX",
      description: "XXXXX",
      date: "XX XX XXXX",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[300px] md:h-[400px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/news-banner.jpg)" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        <div className="relative z-10 flex items-center justify-end h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-right text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              ข่าวประชาสัมพันธ์
            </h1>
            <p className="text-sm md:text-base">
              ติดตามข่าวสารกิจกรรมต่างๆ ของบริษัทฯ ที่นี่
            </p>
            <p className="text-sm md:text-base">
              ไม่พลาดข่าวสารอันสำคัญทุกช่วงเวลา
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* News Section - ข่าวสาร */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="bg-orange-500 text-white px-6 py-2 font-bold text-xl">
            ข่าวสาร
          </div>
          <Link
            href="/news-events/news"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            อ่านทั้งหมด
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48 bg-gray-200">
                {/* พื้นที่สำหรับรูปภาพ */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-sm">รูปภาพข่าวสาร {item.id}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-red-600 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{item.date}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {item.description}
                </p>
                <button className="border border-gray-300 px-4 py-1 text-sm hover:bg-gray-50 transition-colors">
                  READ MORE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Articles Section - บทความ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="bg-orange-500 text-white px-6 py-2 font-bold text-xl">
            บทความ
          </div>
          <Link
            href="/news-events/articles"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            อ่านทั้งหมด
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articleItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48 bg-gray-200">
                {/* พื้นที่สำหรับรูปภาพ */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-sm">รูปภาพบทความ {item.id}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-red-600 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{item.date}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {item.description}
                </p>
                <button className="border border-gray-300 px-4 py-1 text-sm hover:bg-gray-50 transition-colors">
                  READ MORE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

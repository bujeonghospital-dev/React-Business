"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// News items data
const newsItemsData = [
  {
    id: 1,
    image: "/images/New/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
  {
    id: 2,
    image: "/images/New/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
  {
    id: 3,
    image: "/images/New/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
  {
    id: 4,
    image: "/images/New/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
];

// Article items data
const articleItemsData = [
  {
    id: 1,
    image: "/images/articles/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
  {
    id: 2,
    image: "/images/articles/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
  {
    id: 3,
    image: "/images/articles/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
  {
    id: 4,
    image: "/images/articles/dev_289.png",
    title: "XXXXX",
    description: "XXXXX",
    date: "XX XX XXXX",
  },
];

// Hero Banner Component
const HeroBanner = ({ isArticlesPage }: { isArticlesPage: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="relative w-full"
  >
    <div
      className="relative w-full overflow-hidden h-[55svh]"
      style={{
        backgroundImage: "url(/images/articles/banner_articles.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
    <div className="absolute inset-0 flex items-start justify-start py-5">
      <div className="mx-auto w-full max-w-8xl px-3 sm:px-6 lg:px-8 py-5">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-right text-Blackbg-opacity-70 p-4 rounded-md max-w-md"
        >
          <h2 className="my-heading sm:text-[24px] md:text-[28px] lg:text-5xl font-extrabold leading-[1.2] tracking-tight text-black relative inline-block">
            <span className="relative z-10">
              {isArticlesPage ? "บทความ" : "ข่าวประชาสัมพันธ์"}
            </span>
            {/* Underline animation */}
            <motion.span
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: isArticlesPage ? "100%" : "0%" }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            />
          </h2>

          <p
            className="mt-3 sm:mt-4 max-w-[760px] text-sm sm:text-base md:text-lg leading-relaxed text-black"
            style={{
              opacity: 1,
              transform: "translateY(0)",
              transition: "all 0.8s ease-out 0.8s",
            }}
          >
            {isArticlesPage
              ? "ติดตามบทความและกิจกรรมต่างๆ ของบริษัทฯ ที่นี่"
              : "ติดตามข่าวสารกิจกรรมต่างๆ ของบริษัทฯ ที่นี่"}
          </p>
          <p className="text-sm md:text-base mt-2" style={{ opacity: 1 }}>
            ไม่พลาดข่าวสารอันสำคัญทุกช่วงเวลา
          </p>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

// News Card Component
const NewsCard = ({
  item,
  index,
}: {
  item: (typeof newsItemsData)[0];
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ scale: 1.05, y: -8 }}
    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
  >
    <div className="relative w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden group">
      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
        {item.image && (
          <Image
            src={item.image}
            alt={`รูปภาพข่าวสาร ${item.id}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="font-bold text-lg mb-3 text-red-600 line-clamp-2 leading-tight">
        {item.title}
      </h3>
      <p className="text-xs text-orange-500 font-semibold mb-3 tracking-wide">
        {item.date}
      </p>
      <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow leading-relaxed">
        {item.description}
      </p>
      <button className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2.5 text-sm font-semibold rounded-lg hover:from-orange-500 hover:to-red-600 transition-all duration-300 shadow-sm hover:shadow-md">
        อ่านทั้งหมด
      </button>
    </div>
  </motion.div>
);

// News Section Component
const NewsSection = ({ items }: { items: typeof newsItemsData }) => (
  <div className="w-full bg-white">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="py-5" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <NewsCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </motion.div>
  </div>
);

// Main Page Component
export default function ArticlesPage() {
  const pathname = usePathname();
  const isArticlesPage = pathname === "/articles";

  const displayItems = isArticlesPage ? articleItemsData : newsItemsData;

  return (
    <div className="min-h-screen bg-white">
      <HeroBanner isArticlesPage={isArticlesPage} />
      <NewsSection items={displayItems} />
    </div>
  );
}

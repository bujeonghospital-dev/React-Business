"use client";
import React from "react";
import Image from "next/image";

interface CardItemProps {
  image: string;
  date: string;
  title: string;
  active?: boolean;
  hovered?: boolean;
  direction?: "left" | "right";
}

const CardItem: React.FC<CardItemProps> = ({
  image,
  date,
  title,
  active,
  hovered,
  direction = "right",
}) => {
  const cardClasses = `
    news-card bg-white rounded-xl p-4 md:p-5 flex flex-col shadow-lg 
    ${active ? "active" : ""}
    ${
      hovered
        ? "border-2 border-red-300 shadow-red-50"
        : "border border-gray-200 hover:border-gray-300"
    }
  `.trim();

  return (
    <div
      className={cardClasses}
      style={{
        minHeight: "clamp(400px, 45vh, 460px)",
        maxWidth: 380,
        width: "100%",
      }}>
      {/* Image */}
      <div
        className="w-full mb-3 md:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 relative transition-transform duration-300 hover:scale-[1.02]"
        style={{ aspectRatio: "4/3" }}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Date & Title */}
      <span className="text-xs md:text-sm text-gray-500 mb-2 font-medium">
        {date}
      </span>
      <div className="font-bold text-base leading-snug text-gray-900 group-hover:text-gray-800 mb-4 line-clamp-3">
        {title}
      </div>

      {/* Arrow Button */}
      <div className="flex-grow" />
      <button
        className="self-end mt-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                   rounded-full px-4 py-2 md:px-5 md:py-2.5 text-base font-medium text-gray-800 
                   shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center
                   min-w-[44px] min-h-[44px] hover:translate-x-1 active:scale-95">
        <i className="bi bi-arrow-right text-base" />
      </button>
    </div>
  );
};

export default CardItem;

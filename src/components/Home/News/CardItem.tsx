"use client";
import React, { useState } from "react";

interface CardItemProps {
  image: string;
  date: string;
  title: string;
  active?: boolean;
  hovered?: boolean;
  direction?: "left" | "right";
  id?: number;
}

const CardItem: React.FC<CardItemProps> = ({
  image,
  date,
  title,
  active,
  hovered,
  direction = "right",
  id,
}) => {
  const [imageError, setImageError] = useState(false);

  const cardClasses = `
    news-card bg-white rounded-xl p-4 md:p-5 flex flex-col shadow-lg cursor-pointer
    transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
    ${active ? "active ring-2 ring-red-300" : ""}
    ${
      hovered
        ? "border-2 border-red-300 shadow-red-50"
        : "border border-gray-200 hover:border-gray-300"
    }
  `.trim();

  const handleCardClick = () => {
    // Navigate to detailed news page or TPP news page
    window.location.href = "/tpp-news";
  };

  return (
    <div
      className={cardClasses}
      style={{
        minHeight: "clamp(400px, 45vh, 460px)",
        maxWidth: 380,
        width: "100%",
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div
        className="w-full mb-3 md:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 relative"
        style={{ aspectRatio: "4/3", position: "relative", minHeight: "200px" }}
      >
        {!imageError ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            style={{ objectFit: "cover" }}
            onError={() => {
              console.error(`Failed to load image: ${image}`);
              setImageError(true);
            }}
            onLoad={() => console.log(`Successfully loaded image: ${image}`)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <div className="text-center p-4">
              <p className="text-gray-500 text-sm mb-2">ไม่พบรูปภาพ</p>
              <p className="text-gray-400 text-xs break-all">{image}</p>
            </div>
          </div>
        )}
      </div>

      {/* Date & Title */}
      <span className="text-xs md:text-sm text-gray-500 mb-2 font-medium">
        {date}
      </span>
      <div className="font-bold text-base leading-snug text-gray-900 hover:text-red-600 mb-4 line-clamp-3 transition-colors duration-300">
        {title}
      </div>

      {/* Arrow Button */}
      <div className="flex-grow" />
      <div className="self-end mt-3">
        <div
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                       rounded-full px-4 py-2 md:px-5 md:py-2.5 text-base font-medium text-white 
                       shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center
                       min-w-[44px] min-h-[44px] hover:translate-x-1 active:scale-95"
        >
          <span className="mr-2 text-sm">อ่านต่อ</span>
          <i className="bi bi-arrow-right text-base" />
        </div>
      </div>
    </div>
  );
};

export default CardItem;

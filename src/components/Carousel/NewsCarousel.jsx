"use client";
import React, { useState } from "react";

const carouselImages = [
  "/images/New/company-news-1.jpg",
  "/images/New/company-news-2.jpg",
  "/images/New/company-news-3.jpg",
  "/images/New/company-news-4.jpg",
];

const NewsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const length = carouselImages.length;

  const goToSlide = (index) => setCurrent(index);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);
  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);

  return (
    <div className="relative w-full" id="indicators-carousel">
      {/* Carousel wrapper */}
      <div className="relative  overflow-hidden rounded-lg"style={{
    height: "280px",}}>
      <style jsx>{`
        @media (min-width: 640px) {
          .responsive-carousel {
            height: 180px !important;
          }
        }
        @media (min-width: 1024px) {
          .responsive-carousel {
            height: 270px !important;
          }
        }
      `}</style>
        {carouselImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              current === idx ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={img}
              alt={`ข่าวสารบริษัท ${idx + 1}`}
              className="block w-full h-full object-cover absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            />
          </div>
        ))}
      </div>
      {/* Slider indicators */}
      <div className="absolute z-30 flex -translate-x-1/2 space-x-3 bottom-5 left-1/2">
        {carouselImages.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border transition ${
              current === idx
                ? "bg-blue-500 border-blue-500"
                : "bg-white/70 border-gray-300"
            }`}
            aria-current={current === idx ? "true" : "false"}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => goToSlide(idx)}
          />
        ))}
      </div>
      {/* Slider controls */}
      <button
        type="button"
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        onClick={prevSlide}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button
        type="button"
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        onClick={nextSlide}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
};

export default NewsCarousel;

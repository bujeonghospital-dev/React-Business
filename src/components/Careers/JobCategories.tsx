"use client";
import React, { useState } from "react";
const categories = [
  { id: "all", name: "ทั้งหมด", count: 10, icon: "📋" },
  { id: "medical", name: "แพทย์/พยาบาล", count: 3, icon: "👩‍⚕️" },
  { id: "nursing", name: "พยาบาล/ผู้ช่วย", count: 2, icon: "👨‍⚕️" },
  { id: "admin", name: "บริหาร/ธุรการ", count: 2, icon: "💼" },
  { id: "service", name: "บริการลูกค้า", count: 2, icon: "👋" },
  { id: "other", name: "อื่นๆ", count: 1, icon: "📌" },
];
const JobCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
            selectedCategory === category.id
              ? "border-teal-500 bg-teal-50 shadow-lg"
              : "border-gray-200 bg-white hover:border-teal-400 hover:shadow-md"
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`text-4xl transition-transform duration-300 ${
                selectedCategory === category.id
                  ? "scale-110"
                  : "group-hover:scale-110"
              }`}
            >
              {category.icon}
            </div>
            <div>
              <h3
                className={`font-semibold mb-1 ${
                  selectedCategory === category.id
                    ? "text-teal-600"
                    : "text-gray-900"
                }`}
              >
                {category.name}
              </h3>
              <p
                className={`text-sm ${
                  selectedCategory === category.id
                    ? "text-teal-500"
                    : "text-gray-500"
                }`}
              >
                {category.count} ตำแหน่ง
              </p>
            </div>
          </div>
          {selectedCategory === category.id && (
            <div className="absolute inset-0 rounded-xl border-2 border-teal-500 animate-pulse pointer-events-none" />
          )}
        </button>
      ))}
    </div>
  );
};
export default JobCategories;

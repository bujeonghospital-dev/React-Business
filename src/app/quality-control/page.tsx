"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

const QCEquipmentDashboard = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const handleImageError = (itemName: string) => {
    setImageErrors((prev) => ({ ...prev, [itemName]: true }));
  };

  const sections = [
    {
      title: "การควบคุมคุณภาพขาเข้า",
      color: "bg-red-600",
      items: [
        {
          name: "Hygro Meter",
          description: "ใช้วัดความชื้นของกระดาษ",
          imagePath: "/images/quality/Hygrometer.png",
        },
        {
          name: "Electronic Balance",
          description: "เครื่องชั่งน้ำหนักดิจิตอล",
          imagePath: "/images/quality/Electronic_balance.png",
          delay: 0.2,
        },
        {
          name: "Digimatic Micrometer",
          description: "ใช้วัดความหนาของกระดาษ เพื่อเทียบแกรมกระดาษ",
          imagePath: "/images/quality/digimatic_micrometer.png",
          delay: 0.3,
        },
        {
          name: "Viscosity Cup",
          description: "ใช้วัดความหนืดของของเหลว",
          imagePath: "/images/quality/viscosity_cup.png",
        },
      ],
    },
    {
      title: "การควบคุมคุณภาพระหว่างกระบวนการ",
      color: "bg-red-600",
      items: [
        {
          name: "Spectrodensitometer",
          description: "ใช้วัดความหนาแน่นของสี",
          imagePath: "/images/quality/Spectrodensitometer.png",
          delay: 0.5,
        },
        {
          name: "Gloss Meter",
          description: "เครื่องวัดความเงา",
          imagePath: "/images/quality/gloss_meter.png",
          delay: 0.6,
        },
        {
          name: "Rub Tester",
          description: "เครื่องทดสอบการทนทาน",
          imagePath: "/images/quality/Rub_tester.png",
          delay: 0.7,
        },
        {
          name: "Digimatic Indicator",
          description: "เครื่องวัดความหนาของชิ้นงาน",
          imagePath: "/images/quality/Digimetic_indicator.png",
          delay: 0.8,
        },
        {
          name: "Barcode Reader",
          description: "เครื่องอ่านบาร์โค้ด",
          imagePath: "/images/quality/Barcode_Reader.png",
          delay: 0.9,
        },
      ],
    },
    {
      title: "การควบคุมคุณภาพขาออก",
      color: "bg-red-600",
      items: [
        {
          name: "Measuring Tape",
          description: "ใช้วัดขนาดของบรรจุภัณฑ์",
          imagePath: "/images/quality/Measuring_tape.png",
          delay: 1.0,
        },
        {
          name: "Humidity Meter",
          description: "เครื่องวัดความชื้นสัมพัทธ์",
          imagePath: "/images/quality/Humidity_meter.png",
          delay: 1.1,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white p-8 pt-[1.5in]">
      {/* Header */}
      <div className="mb-12 flex justify-center">
        <div className="text-3xl font-bold text-gray-800 mb-2 inline-block pb-1 border-b-4 border-red-600 text-center ">
          การควบคุมคุณภาพ
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="relative">
            {/* Section Header */}
            <div
              className={`${section.color} text-white px-6 py-3 rounded-t-lg shadow-lg transform transition-all duration-500 hover:scale-105`}
              style={{
                animation: animateIn
                  ? `slideInTop 0.5s ease-out ${sectionIndex * 0.2}s both`
                  : "none",
              }}>
              <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {section.title}
              </h2>
            </div>

            {/* Dotted Border */}
            <div className="border-2 border-dashed border-gray-300 rounded-b-lg p-6 bg-gradient-to-b from-gray-50 to-white">
              {/* Equipment Cards */}
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`
                      relative bg-white rounded-xl p-4 shadow-md 
                      transform transition-all duration-300 cursor-pointer
                      hover:shadow-xl hover:-translate-y-1 hover:bg-red-50
                      border border-gray-200 hover:border-red-300
                      ${
                        hoveredCard === `${sectionIndex}-${itemIndex}`
                          ? "ring-2 ring-red-400"
                          : ""
                      }
                    `}
                    style={{
                      animation: animateIn
                        ? `fadeInUp 0.6s ease-out ${item.delay}s both`
                        : "none",
                    }}
                    onMouseEnter={() =>
                      setHoveredCard(`${sectionIndex}-${itemIndex}`)
                    }
                    onMouseLeave={() => setHoveredCard(null)}>
                    <div className="flex items-center gap-4">
                      {/* Equipment Image */}
                      <div
                        className={`
                        w-24 h-20 flex-shrink-0 
                        transform transition-all duration-300
                        ${
                          hoveredCard === `${sectionIndex}-${itemIndex}`
                            ? "scale-110"
                            : ""
                        }
                      `}>
                        {imageErrors[item.name] ? (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-gray-400 text-xs mb-1">
                                No Image
                              </div>
                              <div className="text-gray-500 text-xs font-semibold">
                                {item.name}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.imagePath}
                            alt={item.name}
                            className="w-full h-full object-contain rounded-lg bg-white p-1"
                            onError={() => handleImageError(item.name)}
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-base mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      <div
                        className={`
                        w-2 h-2 rounded-full bg-green-400 
                        animate-pulse shadow-lg shadow-green-400/50
                      `}></div>
                    </div>

                    {/* Hover Effect Accent */}
                    <div
                      className={`
                      absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600
                      transform origin-left transition-transform duration-300
                      ${
                        hoveredCard === `${sectionIndex}-${itemIndex}`
                          ? "scale-x-100"
                          : "scale-x-0"
                      }
                    `}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Element */}
            <div
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full opacity-50 animate-bounce"
              style={{ animationDelay: `${sectionIndex * 0.3}s` }}></div>
          </div>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QCEquipmentDashboard;

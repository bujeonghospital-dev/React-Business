"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";

// Intersection Observer Hook for scroll animations
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
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

// Chart Component with editable data
interface ChartData {
  year: string;
  value: number;
}

interface EditableChartProps {
  title: string;
  unit: string;
  initialData: ChartData[];
  color: string;
}

const EditableChart: React.FC<EditableChartProps> = ({
  title,
  unit,
  initialData,
  color,
}) => {
  const [data, setData] = useState<ChartData[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = 200;

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsAnimated(true), 100);
    }
  }, [isVisible]);

  const handleDataChange = (
    index: number,
    field: "year" | "value",
    value: string
  ) => {
    const newData = [...data];
    if (field === "year") {
      newData[index].year = value;
    } else {
      newData[index].value = parseFloat(value) || 0;
    }
    setData(newData);
  };

  const addDataPoint = () => {
    setData([...data, { year: "2568", value: 0 }]);
  };

  const removeDataPoint = (index: number) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index));
    }
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="transform transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{unit}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          {isEditing ? "บันทึก" : "แก้ไข"}
        </button>
      </div>

      {/* Chart Display */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="flex items-end justify-around h-full border-b border-gray-300 pb-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - 50);
            const animatedHeight = isAnimated ? barHeight : 0;
            return (
              <div
                key={index}
                className="flex flex-col items-center group"
                style={{
                  animation: isAnimated
                    ? `slideUp 0.6s ease-out ${index * 0.1}s forwards`
                    : "none",
                  opacity: isAnimated ? 1 : 0,
                }}
              >
                <div className="relative flex flex-col items-center">
                  <span
                    className={`text-xs font-semibold mb-1 transition-all duration-300 ${
                      isAnimated
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2"
                    }`}
                    style={{
                      color,
                      transitionDelay: `${index * 0.1 + 0.3}s`,
                    }}
                  >
                    {item.value.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <div
                    className="w-16 rounded-t transition-all duration-700 group-hover:opacity-80 relative overflow-hidden"
                    style={{
                      height: `${animatedHeight}px`,
                      backgroundColor: color,
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>
                </div>
                <span
                  className={`text-xs mt-2 font-medium text-gray-700 transition-all duration-300 ${
                    isAnimated
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${index * 0.1 + 0.4}s` }}
                >
                  {item.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing && (
        <div className="mt-6 border-t pt-4 animate-fadeIn">
          <h4 className="font-semibold mb-3 text-sm">แก้ไขข้อมูล:</h4>
          {data.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 mb-2 items-center animate-slideInLeft"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <input
                type="text"
                value={item.year}
                onChange={(e) =>
                  handleDataChange(index, "year", e.target.value)
                }
                className="w-20 px-2 py-1 border rounded text-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="ปี"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) =>
                  handleDataChange(index, "value", e.target.value)
                }
                className="flex-1 px-2 py-1 border rounded text-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="มูลค่า"
                step="0.01"
              />
              <button
                onClick={() => removeDataPoint(index)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                disabled={data.length <= 1}
              >
                ลบ
              </button>
            </div>
          ))}
          <button
            onClick={addDataPoint}
            className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            + เพิ่มข้อมูล
          </button>
        </div>
      )}
    </div>
  );
};

// Financial Table Component
const FinancialTable: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [tableData, setTableData] = useState({
    headers: [
      "31/12/2563",
      "31/12/2564",
      "31/12/2565",
      "31/12/2566",
      "31/12/2567",
    ],
    rows: [
      {
        label: "สินทรัพย์รวม",
        values: [13908.11, 13342.68, 18417.43, 13076.07, 14897.65],
      },
      {
        label: "หนี้สินรวม",
        values: [4373.39, 3437.7, 7792.16, 2607.88, 3565.25],
      },
      {
        label: "ส่วนของผู้ถือหุ้น",
        values: [9123.07, 9512.47, 10235.99, 10071.36, 10918.3],
      },
      {
        label: "มูลค่าหุ้นที่เรียกชำระแล้ว",
        values: [808.61, 808.61, 889.47, 889.47, 889.47],
      },
      {
        label: "รายได้รวม",
        values: [25046.43, 31575.67, 39243.29, 34310.86, 30758.58],
      },
      {
        label: "กำไรสุทธิ",
        values: [1655.8, 2067.61, 1604.17, 729.56, 2103.11],
      },
      { label: "กำไรต่อหุ้น (บาท)", values: [2.05, 2.56, 1.8, 0.82, 2.36] },
    ],
    ratios: [
      { label: "ROA(%)", values: [16.66, 19.3, 12.84, 6.01, 19.04] },
      { label: "ROE(%)", values: [18.62, 22.19, 16.25, 7.19, 20.04] },
      { label: "อัตรากำไรสุทธิ(%)", values: [6.88, 6.67, 4.16, 2.18, 6.99] },
    ],
  });

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md p-6 overflow-x-auto transform transition-all duration-700 hover:shadow-xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2
        className={`text-2xl font-bold text-gray-800 mb-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        ข้อมูลสำคัญทางการเงิน{" "}
        <span className="text-sm font-normal">(หน่วย: ล้านบาท)</span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="border border-gray-300 px-4 py-3 text-left transition-colors duration-300 hover:bg-teal-800">
                ปีบัญชี สิ้นสุดวันที่
              </th>
              {tableData.headers.map((header, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-4 py-3 text-center transition-colors duration-300 hover:bg-teal-800"
                  style={{
                    animation: isVisible
                      ? `fadeIn 0.5s ease-out ${idx * 0.1}s forwards`
                      : "none",
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-teal-600 text-white transition-colors duration-300 hover:bg-teal-700">
              <td
                className="border border-gray-300 px-4 py-2 font-semibold"
                colSpan={6}
              >
                บัญชีทางการเงินที่สำคัญ
              </td>
            </tr>
            {tableData.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`${
                  rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } transition-all duration-300 hover:bg-teal-50`}
                style={{
                  animation: isVisible
                    ? `slideInLeft 0.5s ease-out ${rowIdx * 0.05}s forwards`
                    : "none",
                  opacity: isVisible ? 1 : 0,
                }}
              >
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {row.label}
                </td>
                {row.values.map((value, valIdx) => (
                  <td
                    key={valIdx}
                    className="border border-gray-300 px-4 py-2 text-right transition-all duration-200 hover:bg-teal-100"
                  >
                    {value.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-teal-600 text-white transition-colors duration-300 hover:bg-teal-700">
              <td
                className="border border-gray-300 px-4 py-2 font-semibold"
                colSpan={6}
              >
                อัตราส่วนทางการเงินที่สำคัญ
              </td>
            </tr>
            {tableData.ratios.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`${
                  rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } transition-all duration-300 hover:bg-teal-50`}
                style={{
                  animation: isVisible
                    ? `slideInLeft 0.5s ease-out ${
                        (rowIdx + tableData.rows.length) * 0.05
                      }s forwards`
                    : "none",
                  opacity: isVisible ? 1 : 0,
                }}
              >
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {row.label}
                </td>
                {row.values.map((value, valIdx) => (
                  <td
                    key={valIdx}
                    className="border border-gray-300 px-4 py-2 text-right transition-all duration-200 hover:bg-teal-100"
                  >
                    {value.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Download Section Component
interface DownloadItem {
  title: string;
  filename: string;
}

const DownloadSection: React.FC<{ title: string; items: DownloadItem[] }> = ({
  title,
  items,
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div
        className={`flex items-center justify-between mb-4 pb-3 border-b-2 border-teal-600 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <span className="text-sm bg-teal-600 text-white px-3 py-1 rounded animate-pulse-slow">
          ดาวน์โหลด
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-gray-200 pb-3 transition-all duration-300 hover:bg-gray-50 hover:px-2 hover:py-2 hover:rounded-lg group"
            style={{
              animation: isVisible
                ? `slideInRight 0.5s ease-out ${idx * 0.1}s forwards`
                : "none",
              opacity: isVisible ? 1 : 0,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 group-hover:bg-teal-100 group-hover:scale-110">
                <Download className="w-4 h-4 text-gray-600 transition-colors duration-300 group-hover:text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-800 transition-colors duration-300 group-hover:text-teal-700">
                  {item.title}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
              <Download className="w-4 h-4 transition-transform duration-300 group-hover:animate-bounce" />
              ดาวน์โหลด
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Page Component
export default function InvestorFinancials() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      {/* Hero Section - Placeholder for image */}
      <div
        className="relative h-80 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 flex items-center justify-center overflow-hidden"
        style={{
          backgroundSize: "200% 200%",
          animation: "gradientShift 10s ease infinite",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30" />

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-10"
              style={{
                width: Math.random() * 100 + 50 + "px",
                height: Math.random() * 100 + 50 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animation: `float ${
                  Math.random() * 10 + 5
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`text-center text-white z-10 max-w-4xl px-4 transform transition-all duration-1000 ${
              isHeroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 delay-200 ${
                isHeroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              ข้อมูลทางการเงิน
            </h1>
            <p
              className={`text-lg leading-relaxed transition-all duration-1000 delay-300 ${
                isHeroVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              ทีวีโอ
              ตระหนักถึงความสำคัญของการเปิดเผยข้อมูลสารสนเทศที่สำคัญของบริษัทฯ
              ให้มีความถูกต้อง ครบถ้วน เป็นปัจจุบัน โปร่งใส ตรวจสอบได้
              ในระยะเวลาเหมาะสม และเป็นประโยชน์เพื่อการตัดสินใจในการลงทุน
              การบริหารงาน และตัดสินใจดำเนินการใดๆ สำหรับผู้มีส่วนได้เสียทุกฝ่าย
            </p>
          </div>
        </div>
        {/* Image placeholder indicator */}
        <div
          className={`absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded text-sm font-semibold transition-all duration-700 ${
            isHeroVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4"
          }`}
        >
          รอใส่รูปภาพ Hero Image
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EditableChart
            title="รายได้จากการขาย"
            unit="(หน่วย: ล้านบาท)"
            initialData={[
              { year: "2565", value: 39107.36 },
              { year: "2566", value: 34194.6 },
              { year: "2567", value: 30596.3 },
            ]}
            color="#4A9B8E"
          />

          <EditableChart
            title="กำไรสุทธิ"
            unit="(หน่วย: ล้านบาท)"
            initialData={[
              { year: "2565", value: 1604.17 },
              { year: "2566", value: 729.56 },
              { year: "2567", value: 2103.11 },
            ]}
            color="#7EC4A8"
          />

          <EditableChart
            title="สินทรัพย์รวม"
            unit="(หน่วย: ล้านบาท)"
            initialData={[
              { year: "2565", value: 18417.43 },
              { year: "2566", value: 13076.07 },
              { year: "2567", value: 14897.65 },
            ]}
            color="#A8D5A8"
          />
        </div>

        {/* Financial Table */}
        <FinancialTable />

        {/* Download Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DownloadSection
            title="งบการเงิน"
            items={[
              {
                title: "งบการเงิน ไตรมาสที่ 2/2568 (สอบทานแล้ว)",
                filename: "financial-q2-2568.pdf",
              },
              {
                title: "งบการเงิน ไตรมาสที่ 1/2568 (สอบทานแล้ว)",
                filename: "financial-q1-2568.pdf",
              },
            ]}
          />

          <DownloadSection
            title="คำอธิบายและวิเคราะห์ของฝ่ายจัดการ"
            items={[
              {
                title:
                  "คำอธิบายและวิเคราะห์ของฝ่ายจัดการ ไตรมาสที่ 2 สิ้นสุดวันที่ 30 มิ.ย. 2568",
                filename: "mda-q2-2568.pdf",
              },
              {
                title:
                  "คำอธิบายและวิเคราะห์ของฝ่ายจัดการ ไตรมาสที่ 1 สิ้นสุดวันที่ 31 มี.ค. 2568",
                filename: "mda-q1-2568.pdf",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

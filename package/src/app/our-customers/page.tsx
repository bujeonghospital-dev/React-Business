"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronRight, Award, Users, TrendingUp } from "lucide-react";

// Type definitions
interface CustomerLogo {
  name: string;
  logo: string;
  width?: number;
  height?: number;
  originalWidth: number;
  originalHeight: number;
}

interface LogoCardProps {
  name: string;
  logo: string;
  index: number;
  width?: number;
  height?: number;
}

const OurCustomers: React.FC = () => {
  const [counters, setCounters] = useState({
    customers: 0,
    years: 0,
    satisfaction: 0,
  });
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Helper function to calculate optimal dimensions
  const calculateOptimalDimensions = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number = 160,
    maxHeight: number = 80
  ) => {
    const aspectRatio = originalWidth / originalHeight;

    let width = maxWidth;
    let height = maxWidth / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  };

  // Customer logos data with optimized dimensions
  const customerLogos: CustomerLogo[] = [
    {
      name: "3K Battery",
      logo: "/images/logos/3k-battery.png",
      originalWidth: 500,
      originalHeight: 310,
      ...calculateOptimalDimensions(500, 310),
    },
    {
      name: "ASIAN MARUICHI",
      logo: "/images/logos/asian-maruichi.png",
      originalWidth: 220,
      originalHeight: 92,
      ...calculateOptimalDimensions(220, 92),
    },
    {
      name: "AUNTIE G",
      logo: "/images/logos/auntie-g.png",
      originalWidth: 439,
      originalHeight: 200,
      ...calculateOptimalDimensions(439, 200),
    },
    {
      name: "BD Straws",
      logo: "/images/logos/bd-straws.png",
      originalWidth: 1570,
      originalHeight: 448,
      ...calculateOptimalDimensions(1570, 448),
    },
    {
      name: "Benchmark",
      logo: "/images/logos/benchmark-electronics-logo-vector.png",
      originalWidth: 425,
      originalHeight: 74,
      ...calculateOptimalDimensions(425, 74),
    },
    {
      name: "BT",
      logo: "/images/logos/bt.png",
      originalWidth: 409,
      originalHeight: 409,
      ...calculateOptimalDimensions(409, 409, 100, 100),
    },
    {
      name: "Capric",
      logo: "/images/logos/capric.png",
      originalWidth: 540,
      originalHeight: 540,
      ...calculateOptimalDimensions(540, 540, 100, 100),
    },
    {
      name: "Cardinal Health",
      logo: "/images/logos/cardinal-health.png",
      originalWidth: 2052,
      originalHeight: 792,
      ...calculateOptimalDimensions(2052, 792),
    },
    {
      name: "ESB Battery",
      logo: "/images/logos/esb-battery.png",
      originalWidth: 1000,
      originalHeight: 580,
      ...calculateOptimalDimensions(1000, 580),
    },
    {
      name: "F&D",
      logo: "/images/logos/fd.png",
      originalWidth: 150,
      originalHeight: 150,
      ...calculateOptimalDimensions(150, 150, 80, 80),
    },
    {
      name: "Federal Electric",
      logo: "/images/logos/federal-electric-corp-ltd-15113-c-1.png",
      originalWidth: 300,
      originalHeight: 52,
      ...calculateOptimalDimensions(300, 52),
    },
    {
      name: "Five Star",
      logo: "/images/logos/five-star.png",
      originalWidth: 185,
      originalHeight: 118,
      ...calculateOptimalDimensions(185, 118),
    },
    {
      name: "Glico",
      logo: "/images/logos/Glico_logo.svg.png",
      originalWidth: 1200,
      originalHeight: 468,
      ...calculateOptimalDimensions(1200, 468),
    },
    {
      name: "GS Battery",
      logo: "/images/logos/gs-battery.png",
      originalWidth: 370,
      originalHeight: 370,
      ...calculateOptimalDimensions(370, 370, 100, 100),
    },
    {
      name: "HiQ",
      logo: "/images/logos/hiq.png",
      originalWidth: 101,
      originalHeight: 89,
      ...calculateOptimalDimensions(101, 89),
    },
    {
      name: "Hitachi",
      logo: "/images/logos/hitachi.png",
      originalWidth: 242,
      originalHeight: 95,
      ...calculateOptimalDimensions(242, 95),
    },
    {
      name: "JAM Print",
      logo: "/images/logos/jam-print.png",
      originalWidth: 503,
      originalHeight: 503,
      ...calculateOptimalDimensions(503, 503, 100, 100),
    },
    {
      name: "JIM Group",
      logo: "/images/logos/jim-group.png",
      originalWidth: 483,
      originalHeight: 225,
      ...calculateOptimalDimensions(483, 225),
    },
    {
      name: "JTEKT",
      logo: "/images/logos/jtekt.png",
      originalWidth: 1928,
      originalHeight: 574,
      ...calculateOptimalDimensions(1928, 574),
    },
    {
      name: "Karshine",
      logo: "/images/logos/karshine.png",
      originalWidth: 976,
      originalHeight: 219,
      ...calculateOptimalDimensions(976, 219),
    },
    {
      name: "KPI",
      logo: "/images/logos/kpi.png",
      originalWidth: 554,
      originalHeight: 358,
      ...calculateOptimalDimensions(554, 358),
    },
    {
      name: "KDN คริสปี้ครีม",
      logo: "/images/logos/kdn.png",
      originalWidth: 1200,
      originalHeight: 440,
      ...calculateOptimalDimensions(1200, 440),
    },
    {
      name: "Kiwi Komkom",
      logo: "/images/logos/kiwi_komkom.jpg",
      originalWidth: 2569,
      originalHeight: 1586,
      ...calculateOptimalDimensions(2569, 1586),
    },
    {
      name: "Malaplast",
      logo: "/images/logos/MALAPLAST.png", // Changed from .tif
      originalWidth: 754,
      originalHeight: 297,
      ...calculateOptimalDimensions(754, 297),
    },
    {
      name: "Mama",
      logo: "/images/logos/mama.png",
      originalWidth: 270,
      originalHeight: 97,
      ...calculateOptimalDimensions(270, 97),
    },
    {
      name: "Milott",
      logo: "/images/logos/Milott laboratories.png",
      originalWidth: 542,
      originalHeight: 542,
      ...calculateOptimalDimensions(542, 542, 100, 100),
    },
    {
      name: "Milott Laboratories",
      logo: "/images/logos/milott-laboratories.png",
      originalWidth: 438,
      originalHeight: 220,
      ...calculateOptimalDimensions(438, 220),
    },
    {
      name: "Mister Donut",
      logo: "/images/logos/mister-donut.png",
      originalWidth: 779,
      originalHeight: 506,
      ...calculateOptimalDimensions(779, 506),
    },
    {
      name: "MMP",
      logo: "/images/logos/mmp.png",
      originalWidth: 336,
      originalHeight: 122,
      ...calculateOptimalDimensions(336, 122),
    },
    {
      name: "Monde Nissin",
      logo: "/images/logos/monde-nissin.png",
      originalWidth: 616,
      originalHeight: 458,
      ...calculateOptimalDimensions(616, 458),
    },
    {
      name: "Mr Bun",
      logo: "/images/logos/mr-bun.png",
      originalWidth: 648,
      originalHeight: 574,
      ...calculateOptimalDimensions(648, 574, 100, 100),
    },
    {
      name: "NAO",
      logo: "/images/logos/nao.png",
      originalWidth: 300,
      originalHeight: 204,
      ...calculateOptimalDimensions(300, 204),
    },
    {
      name: "Naraipak",
      logo: "/images/logos/naraipak.png",
      originalWidth: 178,
      originalHeight: 200,
      ...calculateOptimalDimensions(178, 200, 100, 100),
    },
    {
      name: "NDC",
      logo: "/images/logos/ndc.png",
      originalWidth: 195,
      originalHeight: 73,
      ...calculateOptimalDimensions(195, 73),
    },
    {
      name: "NEO",
      logo: "/images/logos/NEO.png", // Changed from .tif
      originalWidth: 726,
      originalHeight: 375,
      ...calculateOptimalDimensions(726, 375),
    },
    {
      name: "Philips",
      logo: "/images/logos/philips.png",
      originalWidth: 1280,
      originalHeight: 236,
      ...calculateOptimalDimensions(1280, 236),
    },
    {
      name: "Phoenix Pulp",
      logo: "/images/logos/phoenix-pulp.png",
      originalWidth: 140,
      originalHeight: 82,
      ...calculateOptimalDimensions(140, 82),
    },
    {
      name: "Pigeon",
      logo: "/images/logos/pigeon.png",
      originalWidth: 398,
      originalHeight: 149,
      ...calculateOptimalDimensions(398, 149),
    },
    {
      name: "Pioneer",
      logo: "/images/logos/pioneer.png",
      originalWidth: 2000,
      originalHeight: 295,
      ...calculateOptimalDimensions(2000, 295),
    },
    {
      name: "Premium Foods",
      logo: "/images/logos/premium-foods.png",
      originalWidth: 1875,
      originalHeight: 1875,
      ...calculateOptimalDimensions(1875, 1875, 100, 100),
    },
    {
      name: "Quickpack",
      logo: "/images/logos/quickpack.png",
      originalWidth: 659,
      originalHeight: 410,
      ...calculateOptimalDimensions(659, 410),
    },
    {
      name: "R&B",
      logo: "/images/logos/rb.png",
      originalWidth: 1090,
      originalHeight: 1090,
      ...calculateOptimalDimensions(1090, 1090, 100, 100),
    },
    {
      name: "RiceMill",
      logo: "/images/logos/ricemill.png",
      originalWidth: 243,
      originalHeight: 207,
      ...calculateOptimalDimensions(243, 207),
    },
    {
      name: "Rubia Industries",
      logo: "/images/logos/rubia-industries.png",
      originalWidth: 330,
      originalHeight: 255,
      ...calculateOptimalDimensions(330, 255),
    },
    {
      name: "Sappe",
      logo: "/images/logos/sappe.png",
      originalWidth: 600,
      originalHeight: 219,
      ...calculateOptimalDimensions(600, 219),
    },
    {
      name: "SCG",
      logo: "/images/logos/scg.png",
      originalWidth: 500,
      originalHeight: 300,
      ...calculateOptimalDimensions(500, 300),
    },
    {
      name: "Schneider",
      logo: "/images/logos/schneider-electric-.png",
      originalWidth: 900,
      originalHeight: 284,
      ...calculateOptimalDimensions(900, 284),
    },
    {
      name: "Sharp",
      logo: "/images/logos/sharp.png",
      originalWidth: 1280,
      originalHeight: 183,
      ...calculateOptimalDimensions(1280, 183),
    },
    {
      name: "SAM Component",
      logo: "/images/logos/sam-component.png",
      originalWidth: 404,
      originalHeight: 104,
      ...calculateOptimalDimensions(404, 104),
    },
    {
      name: "SAM Intermagnate",
      logo: "/images/logos/sam-intermagnate.png",
      originalWidth: 220,
      originalHeight: 54,
      ...calculateOptimalDimensions(220, 54),
    },
    {
      name: "Sony",
      logo: "/images/logos/sony_2.png",
      originalWidth: 6000,
      originalHeight: 1200,
      ...calculateOptimalDimensions(6000, 1200),
    },
    {
      name: "Srithai",
      logo: "/images/logos/srithai.gif",
      originalWidth: 617,
      originalHeight: 621,
      ...calculateOptimalDimensions(617, 621, 100, 100),
    },
    {
      name: "Takara Tomy",
      logo: "/images/logos/takara-tomy.png",
      originalWidth: 425,
      originalHeight: 233,
      ...calculateOptimalDimensions(425, 233),
    },
    {
      name: "Techno Group",
      logo: "/images/logos/techno-group.png",
      originalWidth: 439,
      originalHeight: 106,
      ...calculateOptimalDimensions(439, 106),
    },
    {
      name: "Thai Hospital",
      logo: "/images/logos/thai-hospital.png",
      originalWidth: 270,
      originalHeight: 86,
      ...calculateOptimalDimensions(270, 86),
    },
    {
      name: "Thai Pigeon",
      logo: "/images/logos/thai-pigeon.png",
      originalWidth: 990,
      originalHeight: 252,
      ...calculateOptimalDimensions(990, 252),
    },
    {
      name: "Thai Yang Kitpaisan",
      logo: "/images/logos/thai-yang-kitpaisan.png",
      originalWidth: 277,
      originalHeight: 278,
      ...calculateOptimalDimensions(277, 278, 100, 100),
    },
    {
      name: "Thantawan",
      logo: "/images/logos/Thantawan.png", // Changed from .tif
      originalWidth: 544,
      originalHeight: 105,
      ...calculateOptimalDimensions(544, 105),
    },
    {
      name: "Toyota",
      logo: "/images/logos/toyota.png",
      originalWidth: 1600,
      originalHeight: 1136,
      ...calculateOptimalDimensions(1600, 1136, 120, 120),
    },
    {
      name: "Toys R Us",
      logo: "/images/logos/toys-rus.png",
      originalWidth: 2000,
      originalHeight: 552,
      ...calculateOptimalDimensions(2000, 552),
    },
    {
      name: "TPBI",
      logo: "/images/logos/TPBI.png", // Changed from .tif
      originalWidth: 341,
      originalHeight: 260,
      ...calculateOptimalDimensions(341, 260),
    },
    {
      name: "Unilever",
      logo: "/images/logos/unilever.png",
      originalWidth: 735,
      originalHeight: 767,
      ...calculateOptimalDimensions(735, 767, 100, 100),
    },
    {
      name: "Walgreens",
      logo: "/images/logos/walgreens.png",
      originalWidth: 1436,
      originalHeight: 363,
      ...calculateOptimalDimensions(1436, 363),
    },
    {
      name: "Yamaha",
      logo: "/images/logos/yamaha.png",
      originalWidth: 483,
      originalHeight: 116,
      ...calculateOptimalDimensions(483, 116),
    },
    {
      name: "KrungthepSalakphan",
      logo: "/images/logos/KrungthepSalakphan.png",
      originalWidth: 166,
      originalHeight: 190,
      ...calculateOptimalDimensions(166, 190, 100, 100),
    },
    {
      name: "ChaimongkolRubber",
      logo: "/images/logos/ChaimongkolRubber.png",
      originalWidth: 250,
      originalHeight: 142,
      ...calculateOptimalDimensions(250, 142),
    },
    {
      name: "Tao Kae Noi",
      logo: "/images/logos/tao-kae-noi.png",
      originalWidth: 800,
      originalHeight: 796,
      ...calculateOptimalDimensions(800, 796, 100, 100),
    },
    {
      name: "NokNangNuan",
      logo: "/images/logos/NokNangNuan.png",
      originalWidth: 781,
      originalHeight: 347,
      ...calculateOptimalDimensions(781, 347),
    },
    {
      name: "PermpoonUtsahakam",
      logo: "/images/logos/PermpoonUtsahakam.png",
      originalWidth: 162,
      originalHeight: 202,
      ...calculateOptimalDimensions(162, 202, 100, 100),
    },
    {
      name: "SuraponFoods",
      logo: "/images/logos/SuraponFoods.png",
      originalWidth: 643,
      originalHeight: 197,
      ...calculateOptimalDimensions(643, 197),
    },
    {
      name: "OuayUnOsot",
      logo: "/images/logos/OuayUnOsot.png",
      originalWidth: 271,
      originalHeight: 89,
      ...calculateOptimalDimensions(271, 89),
    },
    {
      name: "AhanYodKhun",
      logo: "/images/logos/AhanYodKhun.gif",
      originalWidth: 250,
      originalHeight: 149,
      ...calculateOptimalDimensions(250, 149),
    },
    {
      name: "Emerald",
      logo: "/images/logos/Emerald.jpg",
      originalWidth: 74,
      originalHeight: 94,
      ...calculateOptimalDimensions(74, 94, 80, 100),
    },
  ];

  // Counter animation
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setCounters({
          customers: Math.round(100 * progress),
          years: Math.round(42 * progress),
          satisfaction: Math.round(98 * progress),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".observe-animation");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 relative inline-block title-underline">
              ลูกค้าของเรา
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 mb-8">
              ด้วยความไว้วางใจจากองค์กรชั้นนำทั่วประเทศ
              เราภูมิใจที่ได้เป็นส่วนหนึ่งในความสำเร็จของลูกค้ามากกว่า 20 ปี
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[180px] transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {counters.customers}+
                </div>
                <div className="text-gray-600 mt-2">ลูกค้าที่ไว้วางใจ</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[180px] transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {counters.years}+
                </div>
                <div className="text-gray-600 mt-2">ปีประสบการณ์</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[180px] transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {counters.satisfaction}%
                </div>
                <div className="text-gray-600 mt-2">ความพึงพอใจ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customers Grid */}
      <section className="py-4 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* <h2 className="text-3xl font-semibold text-center text-gray-900 mb-12">
            ลูกค้าที่ไว้วางใจเรา
          </h2> */}

          <div
            id="logo-grid"
            className="observe-animation bg-white rounded-3xl border border-gray-200 shadow-xl p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {customerLogos.map((logo, index) => (
                <LogoCard
                  key={index}
                  name={logo.name}
                  logo={logo.logo}
                  index={index}
                  width={logo.width}
                  height={logo.height}
                />
              ))}
            </div>
          </div>

          {/* Trust Badge */}
          {/* <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              ความไว้วางใจที่ยั่งยืน
            </h3>
            <p className="text-lg text-gray-600">
              เราพร้อมที่จะเป็นพันธมิตรทางธุรกิจที่ดีที่สุดสำหรับองค์กรของคุณ
            </p>
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 flex items-center mx-auto gap-2">
              ติดต่อเรา
              <ChevronRight className="w-5 h-5" />
            </button>
          </div> */}
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .logo-float {
          animation: float 6s ease-in-out infinite;
        }

        .title-underline::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 5px;
          height: 4px;
          border-radius: 9999px;
          background-image: linear-gradient(to right, #2563eb, #ef4444);
        }

        /* Add space for the underline and a 5px gap below it */
        .title-underline {
          padding-bottom: 9px; /* 4px line + 5px gap */
        }
      `}</style>
    </div>
  );
};

// Logo Card Component with TypeScript
const LogoCard: React.FC<LogoCardProps> = ({
  name,
  logo,
  index,
  width,
  height,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use provided dimensions or defaults
  const finalWidth = width || 150;
  const finalHeight = height || 80;

  return (
    <div
      className={`
        bg-white border-2 border-gray-100 rounded-xl p-3
        flex items-center justify-center
        min-h-[90px] sm:min-h-[100px] md:min-h-[110px]
        transition-all duration-300 ease-out
        hover:shadow-xl hover:border-blue-400 hover:-translate-y-1
        cursor-pointer relative overflow-hidden
        group
      `}
      style={{
        animationDelay: `${(index % 6) * 0.1}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Shine Effect */}
      {isHovered && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)",
            animation: "shine 0.5s ease-out",
          }}
        />
      )}

      {/* Logo Image */}
      <div className="relative z-10 transition-all duration-300 group-hover:scale-105">
        {!imageError ? (
          <Image
            src={logo}
            alt={name}
            width={finalWidth}
            height={finalHeight}
            className="object-contain w-auto h-auto max-w-full max-h-[80px]"
            style={{
              filter: "none",
              transition: "filter 0.3s ease",
            }}
            onError={() => setImageError(true)}
            priority={index < 12} // Priority loading for first 2 rows
          />
        ) : (
          // Fallback when image fails to load
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">
              {name}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default OurCustomers;

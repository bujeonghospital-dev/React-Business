"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Award,
  Trophy,
  Star,
  Shield,
  Target,
  Users,
  Heart,
  Leaf,
} from "lucide-react";

// Define type for refs
interface RefsType {
  header?: HTMLDivElement | null;
  awardsGrid?: HTMLDivElement | null;
  achievements?: HTMLDivElement | null;
  gallery?: HTMLDivElement | null;
}

// Define type for isVisible state
interface IsVisibleType {
  header?: boolean;
  awardsGrid?: boolean;
  achievements?: boolean;
  gallery?: boolean;
}

const AwardsPage = () => {
  const [isVisible, setIsVisible] = useState<IsVisibleType>({});
  const [countingStarted, setCountingStarted] = useState(false);
  const [counts, setCounts] = useState({
    years: 0,
    awards: 0,
    customers: 0,
    standards: 0,
  });
  const refs = useRef<RefsType>({});

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
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
      { threshold: 0.1 }
    );

    Object.keys(refs.current).forEach((key) => {
      const refKey = key as keyof RefsType;
      if (refs.current[refKey]) {
        observer.observe(refs.current[refKey] as Element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Counter animation for stats
  useEffect(() => {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countingStarted) {
            setCountingStarted(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById("stats-section");
    if (statsSection) {
      statsObserver.observe(statsSection);
    }

    return () => statsObserver.disconnect();
  }, [countingStarted]);

  const animateCounters = () => {
    const targets = { years: 25, awards: 50, customers: 100, standards: 5 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        years: Math.floor(targets.years * progress),
        awards: Math.floor(targets.awards * progress),
        customers: Math.floor(targets.customers * progress),
        standards: Math.floor(targets.standards * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounts(targets);
      }
    }, stepDuration);
  };

  const awards = [
    {
      icon: <Trophy className="w-8 h-8 text-amber-600" />,
      title: "รางวัลคุณภาพยอดเยี่ยม",
      year: "2023",
      description: "มาตรฐานการผลิตบรรจุภัณฑ์ระดับสากล",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "ISO 9001:2015",
      year: "2022-2024",
      description: "ระบบการจัดการคุณภาพ",
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Supplier Excellence Award",
      year: "2023",
      description: "จากลูกค้าชั้นนำในอุตสาหกรรม",
    },
    {
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      title: "Green Industry",
      year: "2022",
      description: "อุตสาหกรรมสีเขียวระดับ 3",
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "CSR Excellence",
      year: "2023",
      description: "องค์กรต้นแบบด้านความรับผิดชอบต่อสังคม",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Best Workplace",
      year: "2023",
      description: "สถานที่ทำงานที่มีความสุข",
    },
  ];

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes fadeInUp {
        from { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header Section with Fade In */}
      <div
        ref={(el) => {
          refs.current.header = el;
        }}
        id="header"
        className={`bg-gradient-to-r from-blue-50 to-purple-50 pt-[1.5in] pb-16 transition-all duration-1000 ${
          isVisible.header
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className={`text-4xl font-bold text-gray-900 mb-6 transition-all duration-1000 delay-200 ${
              isVisible.header ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}>
            รางวัลและความภาคภูมิใจ
          </h1>
          <p
            className={`text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
              isVisible.header ? "opacity-100" : "opacity-0"
            }`}>
            TPP
            มุ่งมั่นพัฒนาและรักษามาตรฐานด้านคุณภาพของบรรจุภัณฑ์อย่างต่อเนื่อง
            จนได้รับการยอมรับและความไว้วางใจจากลูกค้าในทุกกลุ่มอุตสาหกรรม
            ผลงานคุณภาพได้รับการยืนยันด้วยรางวัลจากหลายสถาบัน นอกจากนี้ TPP
            ยังให้ความสำคัญกับการดำเนินธุรกิจควบคู่กับความรับผิดชอบต่อสังคม
            โดยได้รับรางวัลและการยกย่องจากกิจกรรมเพื่อสังคมมาอย่างต่อเนื่อง
          </p>
        </div>
      </div>

      {/* Awards Gallery Section with Animation */}
      <div
        ref={(el) => {
          refs.current.gallery = el;
        }}
        id="gallery"
        className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Trophy Display with Floating Animation */}
          <div
            className={`flex justify-center mb-12 ${
              isVisible.gallery ? "opacity-100" : "opacity-0"
            }`}></div>

          {/* Certificates Image Display */}
          <div
            className={`relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] pt-4 sm:pt-6 overflow-hidden rounded-xl shadow-2xl transition-all duration-1000 ${
              isVisible.gallery ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}>
            <img
              src="images/certifications/awards-collage.png"
              alt="ใบรับรองและรางวัลต่างๆ ของบริษัท TPP"
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
      <p
        className={`text-center text-gray-600 mb-12 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
          isVisible.gallery ? "opacity-100" : "opacity-0"
        }`}>
        รางวัลและการรับรองมาตรฐานต่างๆ ที่ TPP ได้รับจากหน่วยงานชั้นนำ
        ทั้งในประเทศและระดับสากล ยืนยันถึงคุณภาพและมาตรฐานการดำเนินงานของเรา
      </p>
    </div>
  );
};

export default AwardsPage;

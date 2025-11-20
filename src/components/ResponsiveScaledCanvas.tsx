"use client";

import { useEffect, useRef, useState } from "react";

interface ResponsiveScaledCanvasProps {
  children: React.ReactNode;
  designWidth?: number; // ความกว้างออกแบบหลัก (Desktop)
  minScale?: number; // Scale ต่ำสุด
  maxScale?: number; // Scale สูงสุด
  enableMobileOptimization?: boolean; // เปิดใช้งานโหมดมือถือ
}

export default function ResponsiveScaledCanvas({
  children,
  designWidth = 1920,
  minScale = 0.3,
  maxScale = 2,
  enableMobileOptimization = true,
}: ResponsiveScaledCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // ตรวจจับอุปกรณ์
      const mobileCheck = viewportWidth <= 768;
      const tabletCheck = viewportWidth > 768 && viewportWidth <= 1024;

      setIsMobile(mobileCheck);
      setIsTablet(tabletCheck);

      if (enableMobileOptimization) {
        if (mobileCheck) {
          // โหมดมือถือ: ใช้ Native Responsive (ไม่ Scale)
          setScale(1);
          containerRef.current.style.transform = "none";
          containerRef.current.style.transformOrigin = "top left";
          containerRef.current.style.width = "100%";
          containerRef.current.style.height = "auto";
          return;
        } else if (tabletCheck) {
          // โหมด Tablet: Scale เล็กน้อย
          const tabletScale = Math.min(viewportWidth / designWidth, maxScale);
          setScale(Math.max(tabletScale, minScale));
        } else {
          // โหมด Desktop: Scale ตามความกว้างหน้าจอ
          const desktopScale = Math.min(viewportWidth / designWidth, maxScale);
          setScale(Math.max(desktopScale, minScale));
        }
      } else {
        // โหมดปกติ: Scale ทุกอุปกรณ์
        const calculatedScale = Math.min(viewportWidth / designWidth, maxScale);
        setScale(Math.max(calculatedScale, minScale));
      }

      // ตั้งค่า Transform
      const scaledWidth = designWidth * scale;
      const scaledHeight = viewportHeight / scale;

      containerRef.current.style.transform = `scale(${scale})`;
      containerRef.current.style.transformOrigin = "top left";
      containerRef.current.style.width = `${designWidth}px`;
      containerRef.current.style.height = `${scaledHeight}px`;
    };

    // Initial update
    updateScale();

    // Update on resize
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, [designWidth, minScale, maxScale, enableMobileOptimization, scale]);

  return (
    <div
      ref={containerRef}
      className={`scaled-canvas ${isMobile ? "mobile-mode" : ""} ${
        isTablet ? "tablet-mode" : ""
      }`}
      style={{
        position: "relative",
        overflow: "visible",
        transition: "transform 0.3s ease-out",
      }}
    >
      {children}
    </div>
  );
}

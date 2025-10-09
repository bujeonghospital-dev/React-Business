"use client";
import React, { useEffect, useState, useRef } from "react";
import ScaledCanvas from "../../components/ScaledCanvas";

export default function OmanAirStyleLayout() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const detectZoomLevel = () => {
      const vv = (window as any).visualViewport as VisualViewport | undefined;
      if (vv && vv.scale) {
        setZoomLevel(vv.scale);
        setViewportSize({ width: vv.width, height: vv.height });
        return vv.scale;
      }

      const zoom = window.devicePixelRatio || 1;
      setZoomLevel(zoom);

      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      return zoom;
    };

    detectZoomLevel();
    const handleResize = () => detectZoomLevel();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if (vv) {
      vv.addEventListener("resize", handleResize);
      vv.addEventListener("scroll", handleResize);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "0")
      ) {
        setTimeout(detectZoomLevel, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (vv) {
        vv.removeEventListener("resize", handleResize);
        vv.removeEventListener("scroll", handleResize);
      }
    };
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
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-aos]");
    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const inverseZoom = 1 / zoomLevel;

  return (
    <ScaledCanvas>
      <main className="min-h-dvh w-full overflow-x-hidden bg-white p-0 ps pt-[120px] sm:pt-[120px] md:pt-[110px] lg:pt-[110px] xl:pt-[105px]">
        <style jsx>{`
          /* AOS-style Animations */
          [data-aos^="fade"][data-aos^="fade"] {
            opacity: 0;
            transition-property: opacity, transform;
            transition-duration: 600ms;
            transition-timing-function: cubic-bezier(0.39, 0.575, 0.565, 1);
          }

          [data-aos^="fade"][data-aos^="fade"].aos-animate {
            opacity: 1;
            transform: translateZ(0);
          }

          [data-aos="fade-up"] {
            transform: translate3d(0, 100px, 0);
          }

          [data-aos="fade-down"] {
            transform: translate3d(0, -100px, 0);
          }

          [data-aos="fade-right"] {
            transform: translate3d(-100px, 0, 0);
          }

          [data-aos="fade-left"] {
            transform: translate3d(100px, 0, 0);
          }

          [data-aos="fade-up-right"] {
            transform: translate3d(-100px, 100px, 0);
          }

          [data-aos="fade-up-left"] {
            transform: translate3d(100px, 100px, 0);
          }

          /* Zoom Animations */
          [data-aos^="zoom"][data-aos^="zoom"] {
            opacity: 0;
            transition-property: opacity, transform;
            transition-duration: 600ms;
            transition-timing-function: cubic-bezier(0.39, 0.575, 0.565, 1);
          }

          [data-aos^="zoom"][data-aos^="zoom"].aos-animate {
            opacity: 1;
            transform: translateZ(0) scale(1);
          }

          [data-aos="zoom-in"] {
            transform: scale(0.6);
          }

          [data-aos="zoom-in-up"] {
            transform: translate3d(0, 100px, 0) scale(0.6);
          }

          [data-aos="zoom-in-down"] {
            transform: translate3d(0, -100px, 0) scale(0.6);
          }

          [data-aos="zoom-in-right"] {
            transform: translate3d(-100px, 0, 0) scale(0.6);
          }

          [data-aos="zoom-in-left"] {
            transform: translate3d(100px, 0, 0) scale(0.6);
          }

          /* Slide Animations */
          [data-aos^="slide"][data-aos^="slide"] {
            transition-property: transform;
            transition-duration: 600ms;
            transition-timing-function: cubic-bezier(0.39, 0.575, 0.565, 1);
          }

          [data-aos^="slide"][data-aos^="slide"].aos-animate {
            transform: translateZ(0);
          }

          [data-aos="slide-up"] {
            transform: translate3d(0, 100%, 0);
          }

          [data-aos="slide-down"] {
            transform: translate3d(0, -100%, 0);
          }

          [data-aos="slide-right"] {
            transform: translate3d(-100%, 0, 0);
          }

          [data-aos="slide-left"] {
            transform: translate3d(100%, 0, 0);
          }

          /* Flip Animations */
          [data-aos^="flip"][data-aos^="flip"] {
            backface-visibility: hidden;
            transition-property: transform;
            transition-duration: 600ms;
            transition-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
          }

          [data-aos="flip-left"] {
            transform: perspective(2500px) rotateY(-100deg);
          }

          [data-aos="flip-left"].aos-animate {
            transform: perspective(2500px) rotateY(0);
          }

          [data-aos="flip-right"] {
            transform: perspective(2500px) rotateY(100deg);
          }

          [data-aos="flip-right"].aos-animate {
            transform: perspective(2500px) rotateY(0);
          }

          [data-aos="flip-up"] {
            transform: perspective(2500px) rotateX(-100deg);
          }

          [data-aos="flip-up"].aos-animate {
            transform: perspective(2500px) rotateX(0);
          }

          /* Perfect Scrollbar Styles */
          .ps {
            overflow: hidden !important;
            overflow-anchor: none;
            -ms-overflow-style: none;
            touch-action: auto;
            -ms-touch-action: auto;
          }

          .ps::-webkit-scrollbar {
            display: none;
          }

          .ps__rail-x,
          .ps__rail-y {
            display: none;
            opacity: 0;
            position: absolute;
            transition: background-color 0.2s linear, opacity 0.2s linear;
          }

          .ps__rail-x {
            bottom: 0;
            height: 15px;
          }

          .ps__rail-y {
            right: 0;
            width: 15px;
          }

          .ps--active-x > .ps__rail-x,
          .ps--active-y > .ps__rail-y {
            display: block;
            background-color: transparent;
          }

          .ps:hover > .ps__rail-x,
          .ps:hover > .ps__rail-y,
          .ps--focus > .ps__rail-x,
          .ps--focus > .ps__rail-y {
            opacity: 0.6;
          }

          /* Zoom-resistant image styles */
          .zoom-immune-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 0.75rem;
            transform-origin: 0 0;
            will-change: transform;
          }

          @media (min-width: 768px) {
            .zoom-immune-container {
              border-radius: 1rem;
            }
          }

          .Video-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background-image: url("/images/subsidiaries/Cargo_Map_36677-hd_2.png");
            background-size: auto;
            background-position: center center;
            background-repeat: no-repeat;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            transform: scale(${inverseZoom});
            transform-origin: center center;
            width: ${100 * zoomLevel}%;
            height: ${100 * zoomLevel}%;
            min-width: 928px;
            min-height: 703px;
          }

          @media (min-width: 768px) {
            .Video-background {
              transform-origin: center center;
            }
          }

          .fixed-aspect {
            position: relative;
            width: 100%;
            padding-top: 75%;
            overflow: hidden;
            border-radius: 1rem;
          }

          .fixed-aspect > * {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          /* Stagger animation delays */
          [data-aos][data-aos-delay="100"] {
            transition-delay: 100ms;
          }

          [data-aos][data-aos-delay="200"] {
            transition-delay: 200ms;
          }

          [data-aos][data-aos-delay="300"] {
            transition-delay: 300ms;
          }

          [data-aos][data-aos-delay="400"] {
            transition-delay: 400ms;
          }

          /* Custom smooth scroll */
          html {
            scroll-behavior: smooth;
          }

          /* Clean spacing for header */
          main {
            background: linear-gradient(to bottom, #ffffff 0%, #ffffff 100%);
            position: relative;
            z-index: 1;
          }

          /* Ensure content doesn't overlap with header */
          section {
            position: relative;
            z-index: 2;
          }

          /* Mobile screens */
          @media (max-width: 640px) {
            main {
              padding-top: 120px !important;
            }

            .zoom-immune-container {
              min-height: 350px !important;
              overflow: visible;
              background-color: #dbeafe !important; /* Light blue for non-PC */
              border: 3px solid #3b82f6 !important; /* Blue border */
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }

            .zoom-immune-container img {
              max-width: 95% !important;
              max-height: 90% !important;
              object-fit: contain !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
          }

          /* Tablet and medium screens (iPad, etc.) */
          @media (min-width: 641px) and (max-width: 1199px) {
            main {
              padding-top: 110px !important;
            }

            .zoom-immune-container {
              min-height: 450px !important;
              overflow: visible;
              background-color: #dbeafe !important; /* Light blue for non-PC */
              border: 2px solid #3b82f6 !important; /* Blue border */
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }

            .zoom-immune-container img {
              max-width: 95% !important;
              max-height: 95% !important;
              object-fit: contain !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }

            .Video-background {
              background-size: contain !important;
            }
          }

          /* PC screens (≥1200px) - Original size */
          @media (min-width: 1200px) {
            main {
              padding-top: 105px !important;
            }

            .zoom-immune-container {
              background-color: transparent !important;
              border: none !important;
            }

            .Video-background {
              background-size: auto !important;
            }
          }

          /* Touch-friendly interactions */
          @media (hover: none) and (pointer: coarse) {
            .ps:hover > .ps__rail-x,
            .ps:hover > .ps__rail-y {
              opacity: 0;
            }
          }
        `}</style>

        <section className="h-full w-full bg-white p-3 sm:p-4 md:p-6 lg:p-8 pb-8">
          <div className="grid h-full items-stretch gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
            <div className="order-1 space-y-3 sm:space-y-4 md:space-y-5">
              {/* Company info card with fade-up animation */}
              <article
                id="company-card"
                data-aos="fade-up"
                data-aos-delay="100"
                className={`rounded-xl lg:rounded-2xl bg-white p-3 sm:p-4 md:p-5 shadow-sm ring-1 ring-black/10 ${
                  isVisible["company-card"] ? "aos-animate" : ""
                }`}>
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 mb-2">
                  บริษัทในเครือ
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-neutral-700">
                  <p>
                    บริษัท ทีพีพี อินเตอร์เนชั่นแนล จำกัด
                    <br />
                    ก่อตั้งเมื่อวันที่ 19 มกราคม พ.ศ. 2536
                    <br />
                    ทุนจดทะเบียน : 100 ล้านบาท (3 ล้านเหรียญสหรัฐ)
                    <br />
                    ทุนชำระแล้ว : 30 ล้านบาท (910,000 เหรียญสหรัฐ)
                    <br />
                    กรรมการผู้จัดการ : นายศุภพงศ์ อัศวินวิจิตร
                    <br />
                    สำนักงานขายและบริการทั่วไปของโอมานแอร์ในประเทศไทย
                    (ตัวแทนพิเศษของโอมานแอร์คาร์โก้ในประเทศไทย)
                  </p>
                </div>
              </article>

              {/* Contact info card with fade-up animation */}
              <article
                id="contact-card"
                data-aos="fade-up"
                data-aos-delay="200"
                className={`rounded-xl lg:rounded-2xl bg-white p-3 sm:p-4 md:p-5 shadow-sm ring-1 ring-black/10 ${
                  isVisible["contact-card"] ? "aos-animate" : ""
                }`}>
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 mb-3">
                  กรุณาเยี่ยมชมเราได้ที่
                </h3>
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                  <div
                    data-aos="fade-right"
                    data-aos-delay="300"
                    className={`text-sm sm:text-base leading-relaxed text-neutral-700 ${
                      isVisible["contact-card"] ? "aos-animate" : ""
                    }`}>
                    <p>
                      <a
                        href="https://www.omanair.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline">
                        www.omanair.com
                      </a>
                      : Oman Air-Thai
                      <br />
                      สอบถามข้อมูลเพิ่มเติมได้ที่โทร (662) 175-2201-8
                      <br />
                      <br />
                      <strong>สำนักงานใหญ่</strong>
                      <br />
                      <a
                        href="https://www.google.com/maps/dir//%E0%B8%96.+%E0%B8%81%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B9%81%E0%B8%81%E0%B9%89%E0%B8%A7+%E0%B8%95%E0%B8%B3%E0%B8%9A%E0%B8%A5%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%B2%E0%B9%80%E0%B8%97%E0%B8%A7%E0%B8%B0+%E0%B8%AD%E0%B8%B3%E0%B9%80%E0%B8%A0%E0%B8%AD%E0%B8%9A%E0%B8%B2%E0%B8%87%E0%B8%9E%E0%B8%A5%E0%B8%B5+%E0%B8%AA%E0%B8%A1%E0%B8%B8%E0%B8%97%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%A3+10540/@13.6860287,100.6454261,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x311d675c1cc48ae9:0x4342525942e8c947!2m2!1d100.7277953!2d13.6859591?entry=ttu&g_ep=EgoyMDI1MDkyNC4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black !important no-underline"
                        aria-label="Open head office location in Google Maps">
                        9/9 หมู่ 6 ถ.กิ่งแก้ว ต.ราชาเทวา อ.บางพลี
                        <br />
                        จ.สมุทรปราการ 10540
                      </a>
                      <br />
                      {/* <br /> */}
                      {/* <strong>สำนักงานขนส่งสินค้า</strong>
                      <br />
                      36/152 RK BIZ Center ถนนด้านหน้าถนน
                      <br />
                      มอเตอร์เวย์-ร่มเกล้าแขวงคลองสาม เขตลาดกระบัง
                      <br />
                      กรุงเทพมหานคร ประเทศไทย
                      <br /> */}
                      โทร: +66 2 175 2201
                      <br />
                      <strong>อีเมล:</strong>{" "}
                      <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=bkkcargo@omanair.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                        aria-label="Compose email to bkkcargo@omanair.com in Gmail">
                        bkkcargo@omanair.com
                      </a>
                    </p>
                  </div>

                  {/* Airplane image with zoom-in animation */}
                  <div
                    id="plane-image"
                    data-aos="zoom-in"
                    data-aos-delay="400"
                    className={`fixed-aspect ${
                      isVisible["plane-image"] ? "aos-animate" : ""
                    }`}>
                    <div className="zoom-immune-container">
                      <svg
                        viewBox="0 0 400 300"
                        className="w-full h-full"
                        preserveAspectRatio="xMidYMid slice">
                        <image
                          href="/images/subsidiaries/Oman_Cargo_plane.png"
                          x="0"
                          y="0"
                          width="400"
                          height="300"
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Video panel with slide animation */}
            <div
              id="Video-panel"
              data-aos="fade-left"
              data-aos-delay="200"
              className={`order-2 h-full min-h-[350px] sm:min-h-[450px] lg:min-h-[500px] xl:min-h-[600px] 2xl:min-h-[703px] ${
                isVisible["Video-panel"] ? "aos-animate" : ""
              }`}>
              <div className="zoom-immune-container h-full relative bg-gray-100 border-2 border-blue-500">
                {/* Auto-detect and render appropriate version */}
                {viewportSize.width < 1200 ? (
                  // Non-PC screens (Mobile, Tablet, Small Desktop)
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <img
                      src="/images/subsidiaries/Cargo_Map_36677-hd_2.png"
                      alt="Oman Air Route Map"
                      className="max-w-full max-h-full object-contain border-2 border-blue-400"
                      style={{
                        width: "auto",
                        height: "auto",
                        display: "block",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                      onError={(
                        e: React.SyntheticEvent<HTMLImageElement, Event>
                      ) => {
                        const img = e.currentTarget;
                        console.log("Non-PC Image failed to load:", img.src);
                        img.style.display = "none";
                        const next =
                          img.nextElementSibling as HTMLElement | null;
                        if (next) next.style.display = "block";
                      }}
                      onLoad={() => {
                        console.log("Non-PC Image loaded successfully");
                      }}
                    />

                    {/* Fallback text for non-PC */}
                    <div
                      style={{ display: "none" }}
                      className="text-center p-4 bg-red-100 border-2 border-red-500 rounded">
                      <p className="text-sm font-bold">IMAGE NOT FOUND</p>
                      <p className="text-xs">
                        Path: /images/subsidiaries/Cargo_Map_36677-hd_2.png
                      </p>
                      <p className="text-xs">Non-PC Screen Detected</p>
                    </div>
                  </div>
                ) : (
                  // PC screens (≥1200px) - Original size
                  <>
                    <img
                      src="/images/subsidiaries/Cargo_Map_36677-hd_2.png"
                      alt="Oman Air Route Map"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{
                        transform:
                          zoomLevel !== 1 ? `scale(${inverseZoom})` : "none",
                        transformOrigin: "center center",
                        objectFit: "none",
                        objectPosition: "center center",
                      }}
                    />

                    {/* Fallback background method for PC */}
                    <div
                      className="Video-background absolute inset-0"
                      role="img"
                      aria-label="Oman Air Route Map Fallback"
                      style={{
                        transform:
                          zoomLevel !== 1 ? `scale(${inverseZoom})` : "none",
                        width: zoomLevel !== 1 ? `${100 * zoomLevel}%` : "100%",
                        height:
                          zoomLevel !== 1 ? `${100 * zoomLevel}%` : "100%",
                        zIndex: -1,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ScaledCanvas>
  );
}

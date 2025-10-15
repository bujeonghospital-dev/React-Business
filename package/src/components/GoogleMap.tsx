"use client";

import React, { useEffect, useRef, useState } from "react";

interface GoogleMapComponentProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markerPosition: { lat: number; lng: number };
  markerTitle?: string;
  mapId?: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  zoom = 15,
  markerPosition,
  markerTitle = "Location",
  mapId = "DEMO_MAP_ID",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // ตรวจสอบว่าอยู่ใน client-side หรือไม่
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // ตรวจสอบว่ามี API Key หรือไม่
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn(
        "Google Maps API Key is not configured - using fallback iframe"
      );
      return;
    }

    // ตรวจสอบว่า script ถูกโหลดแล้วหรือยัง
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );

    if (existingScript) {
      // รอให้ Web Components พร้อม
      if (typeof customElements !== "undefined") {
        customElements
          .whenDefined("gmp-map")
          .then(() => {
            setScriptLoaded(true);
          })
          .catch(() => {
            setScriptLoaded(true);
          });
      } else {
        setScriptLoaded(true);
      }
      return;
    }

    // โหลด Google Maps script แบบ async
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=maps,marker&v=beta`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // รอให้ Web Components ลงทะเบียนเสร็จ
      if (typeof customElements !== "undefined") {
        customElements
          .whenDefined("gmp-map")
          .then(() => {
            setScriptLoaded(true);
          })
          .catch(() => {
            setScriptLoaded(true);
          });
      } else {
        setScriptLoaded(true);
      }
    };

    script.onerror = () => {
      console.error(
        "Failed to load Google Maps script - using fallback iframe"
      );
      // ใช้ iframe fallback
      setScriptLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup not needed as script is shared across the app
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !scriptLoaded || !mapContainerRef.current) return;

    try {
      // ตรวจสอบว่า gmp-map element พร้อมใช้งานหรือไม่
      if (
        typeof customElements === "undefined" ||
        !customElements.get("gmp-map")
      ) {
        console.warn("Google Maps Web Components not ready");
        return;
      }

      // สร้าง map elements
      const mapElement = document.createElement("gmp-map");
      mapElement.setAttribute("center", `${center.lat},${center.lng}`);
      mapElement.setAttribute("zoom", zoom.toString());
      mapElement.setAttribute("map-id", mapId);
      mapElement.style.width = "100%";
      mapElement.style.height = "100%";
      mapElement.style.display = "block";

      // สร้าง marker
      const markerElement = document.createElement("gmp-advanced-marker");
      markerElement.setAttribute(
        "position",
        `${markerPosition.lat},${markerPosition.lng}`
      );
      markerElement.setAttribute("title", markerTitle);

      // เพิ่ม marker เข้า map
      mapElement.appendChild(markerElement);

      // Clear existing content and add map
      mapContainerRef.current.innerHTML = "";
      mapContainerRef.current.appendChild(mapElement);
    } catch (error) {
      console.error("Error creating Google Maps Web Components:", error);
      // Fallback จะถูกแสดงอัตโนมัติถ้า scriptLoaded = false
    }
  }, [
    isClient,
    scriptLoaded,
    center,
    zoom,
    markerPosition,
    markerTitle,
    mapId,
  ]);

  // แสดง fallback iframe สำหรับ SSR หรือเมื่อยังโหลด script ไม่เสร็จ
  if (!isClient || !scriptLoaded) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        {apiKey ? (
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${center.lat},${center.lng}&zoom=${zoom}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={markerTitle}
          />
        ) : (
          <div className="text-gray-500">Loading map...</div>
        )}
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default GoogleMapComponent;
